import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const text = (value) => (typeof value === 'string' ? value.trim() : '');

const hash = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

const pause = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function decode(value) {
  return String(value ?? '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (match, number) => {
      const code =
        number[0].toLowerCase() === 'x'
          ? parseInt(number.slice(1), 16)
          : Number(number);

      return Number.isInteger(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    })
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function plain(value) {
  return decode(
    String(value ?? '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) => replacements[character],
  );
}

function validGtin(value) {
  if (typeof value !== 'string' || !/^(\d{8}|\d{12,14})$/.test(value)) {
    return null;
  }

  let sum = 0;

  for (
    let index = value.length - 2, weight = 3;
    index >= 0;
    index--, weight = 4 - weight
  ) {
    sum += Number(value[index]) * weight;
  }

  const expected = (10 - (sum % 10)) % 10;

  return expected === Number(value.at(-1)) ? value : null;
}

function webUrl(value, base) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value, base);

    const privateHost =
      /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/;

    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      !url.hostname.includes('.') ||
      privateHost.test(url.hostname) ||
      url.hostname.includes(':')
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
      (match) => [match[1].toLowerCase(), decode(match[2] ?? match[3])],
    ),
  );
}

function extractCandidates(html, sourceUrl) {
  const metadata = {};

  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attribute = attributes(tag);
    const key = attribute.property ?? attribute.name;

    if (key) {
      metadata[key.toLowerCase()] = attribute.content;
    }
  }

  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  const pageName = metadata['og:title'] || plain(heading || title || '');

  const candidates = [];

  function visit(value) {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    const types = [].concat(value['@type'] ?? []);

    const isProduct = types.some(
      (type) => typeof type === 'string' && /(^|\/)Product$/.test(type),
    );

    if (isProduct) {
      const barcodes = [
        ...new Set(
          ['gtin', 'gtin8', 'gtin12', 'gtin13', 'gtin14']
            .flatMap((key) => [].concat(value[key] ?? []))
            .filter((barcode) => validGtin(barcode)),
        ),
      ];

      const images = [
        ...new Set(
          []
            .concat(value.image ?? [])
            .map((image) =>
              webUrl(
                typeof image === 'string'
                  ? image
                  : (image?.url ?? image?.contentUrl),
                sourceUrl,
              ),
            )
            .filter(Boolean),
        ),
      ];

      const brand = text(
        typeof value.brand === 'object' ? value.brand?.name : value.brand,
      );

      for (const barcode of barcodes) {
        candidates.push({
          barcode,
          normalizedGtin14: barcode.padStart(14, '0'),
          name: text(value.name) || pageName,
          brand,
          images,
          evidenceType: 'PRODUCT_JSON_LD',
          sourceUrl,
        });
      }
    }

    Object.values(value).forEach(visit);
  }

  for (const match of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    const type = attributes(match[1]).type?.toLowerCase();

    if (type !== 'application/ld+json') {
      continue;
    }

    try {
      visit(JSON.parse(match[2]));
    } catch {}
  }

  const body = plain(html);

  const labeledBarcodes = [
    ...new Set(
      [
        ...body.matchAll(
          /(?:ברקוד(?:\s+מוצר)?|barcode|gtin|ean)\s*[:：#-]?\s*(\d{8,14})(?!\d)/gi,
        ),
      ]
        .map((match) => match[1])
        .filter((barcode) => validGtin(barcode)),
    ),
  ];

  for (const barcode of labeledBarcodes) {
    if (candidates.some((item) => item.barcode === barcode)) {
      continue;
    }

    const image =
      labeledBarcodes.length === 1
        ? webUrl(metadata['og:image'], sourceUrl)
        : null;

    candidates.push({
      barcode,
      normalizedGtin14: barcode.padStart(14, '0'),
      name: pageName,
      brand: '',
      images: image ? [image] : [],
      evidenceType: 'PAGE_BARCODE_LABEL',
      sourceUrl,
      imageAssociationUnverified: true,
    });
  }

  return candidates.map((candidate) => ({
    ...candidate,
    reviewRequired: true,
    imageChecked: false,
    nutritionVerified: false,
  }));
}

async function request(url, options = {}, redirectCount = 0) {
  const response = await fetch(url, {
    ...options,
    redirect: 'manual',
    signal: AbortSignal.timeout(25000),
  });

  if (response.status >= 300 && response.status < 400) {
    const next = webUrl(response.headers.get('location'), url);

    await response.body?.cancel();

    if (!next || redirectCount >= 4) {
      throw new Error('Unsupported redirect');
    }

    if (options.method && options.method.toUpperCase() !== 'GET') {
      throw new Error('API redirects are not supported');
    }

    return request(next, options, redirectCount + 1);
  }

  if (!response.ok) {
    await response.body?.cancel();

    throw Object.assign(new Error(`HTTP ${response.status}`), {
      status: response.status,
    });
  }

  if (!response.body) {
    throw new Error('Empty response body');
  }

  let size = 0;
  const chunks = [];

  for await (const chunk of response.body) {
    size += chunk.length;

    if (size > 6_000_000) {
      throw new Error('Response exceeds 6 MB');
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function writeJson(path, value) {
  await writeFile(`${path}.tmp`, JSON.stringify(value, null, 2), 'utf8');

  await rename(`${path}.tmp`, path);
}

function loadTargets(data) {
  const rows = Array.isArray(data)
    ? data
    : (data.items ?? data.products ?? data.rows);

  if (!Array.isArray(rows)) {
    throw new Error(
      'Expected an array or an object containing items, products or rows',
    );
  }

  const targets = rows.map((row, index) => ({
    id: String(row.id ?? row.targetId ?? row.Code ?? index),
    name: text(row.name ?? row.targetName ?? row.shmmitzrach),
  }));

  if (targets.some((target) => !target.name)) {
    throw new Error('Every target must have a name');
  }

  if (new Set(targets.map((target) => target.id)).size !== targets.length) {
    throw new Error('Duplicate target IDs');
  }

  return targets;
}

function renderReport(state) {
  const rows = state.products
    .flatMap((product) =>
      product.candidates.map((candidate) => {
        const images = candidate.images
          .map(
            (url) =>
              `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">תמונה</a>`,
          )
          .join(' · ');

        return `
        <tr>
          <td>${escapeHtml(product.targetName)}</td>
          <td>
            ${escapeHtml(candidate.name)}
            <br>
            ${escapeHtml(candidate.brand)}
          </td>
          <td dir="ltr">${escapeHtml(candidate.barcode)}</td>
          <td>${images || 'לא נמצאה'}</td>
          <td>
            <a
              href="${escapeHtml(candidate.sourceUrl)}"
              target="_blank"
              rel="noreferrer"
            >מקור</a>
          </td>
          <td>${escapeHtml(candidate.evidenceType)}</td>
        </tr>
      `;
      }),
    )
    .join('');

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>מועמדים לקטלוג</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 24px;
      color: #203128;
      background: #f7faf8;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      background: white;
    }
    td, th {
      padding: 12px;
      border: 1px solid #dce5df;
      text-align: right;
      vertical-align: top;
    }
    th {
      background: #e9f5ee;
    }
    a {
      color: #146642;
    }
    .table {
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>מועמדים לבדיקה</h1>
  <p>
    ההתאמות אינן מאומתות.
    התמונות נשמרו כקישורים ולא נבדקו.
    אין שינויים במסד הנתונים.
  </p>
  <p>
    מוצרים שהושלמו: ${state.summary.done}
    מתוך ${state.summary.targets}.
    רשומות מועמדות: ${state.summary.candidateCount}.
  </p>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th>מוצר יעד</th>
          <th>מוצר שנמצא</th>
          <th>ברקוד</th>
          <th>תמונות</th>
          <th>מקור</th>
          <th>סוג ראיה</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};

  const supportedOptions = [
    '--targets',
    '--out',
    '--max-searches',
    '--pages',
    '--limit',
  ];

  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];

    if (!supportedOptions.includes(key) || !value || value.startsWith('--')) {
      throw new Error(`Unknown or missing option: ${key}`);
    }

    options[key] = value;
  }

  if (!options['--targets']) {
    throw new Error(
      'Usage: node scripts/enrich-catalog.mjs --targets proposed-import.json',
    );
  }

  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error('Set SERPER_API_KEY before running');
  }

  function integerOption(key, fallback, maximum) {
    const value = Number(options[key] ?? fallback);

    if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
      throw new Error(`Invalid ${key}`);
    }

    return value;
  }

  const maxSearches = integerOption('--max-searches', 100, 100000);

  const pages = integerOption('--pages', 8, 10);

  const limit = integerOption(
    '--limit',
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  );

  const input = await readFile(resolve(options['--targets']), 'utf8');

  const targets = loadTargets(JSON.parse(input.replace(/^\uFEFF/, ''))).slice(
    0,
    limit,
  );

  const outputDirectory = resolve(
    options['--out'] ?? 'import-results/web-enrichment',
  );

  const cacheDirectory = join(outputDirectory, 'cache');
  const resultsPath = join(outputDirectory, 'results.json');
  const reportPath = join(outputDirectory, 'review.html');

  await mkdir(cacheDirectory, { recursive: true });

  const fingerprint = hash({
    version: 2,
    targets,
    pages,
  });

  let state = {
    fingerprint,
    products: [],
  };

  try {
    state = JSON.parse(await readFile(resultsPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  if (state.fingerprint !== fingerprint) {
    throw new Error('Input or options changed. Choose a new --out directory.');
  }

  let searchRequests = 0;
  let stopRequested = false;

  process.on('SIGINT', () => {
    stopRequested = true;
    console.log('Stopping after the current request. Progress will be saved.');
  });

  async function save() {
    state.updatedAt = new Date().toISOString();

    state.summary = {
      targets: targets.length,
      done: state.products.filter((product) => product.status === 'DONE')
        .length,
      searchRequestsThisRun: searchRequests,
      candidateCount: state.products.reduce(
        (total, product) => total + product.candidates.length,
        0,
      ),
      notice:
        'Review candidates only. No verified equivalence, nutrition assignment or database writes. Images were not downloaded or validated.',
    };

    await writeJson(resultsPath, state);
    await writeFile(reportPath, renderReport(state), 'utf8');
  }

  const completed = new Set(
    state.products
      .filter((product) => product.status === 'DONE')
      .map((product) => product.targetId),
  );

  console.log({
    status: 'STARTED',
    targets: targets.length,
    alreadyCompleted: completed.size,
    maxSearches,
    pagesPerSearch: pages,
    outputDirectory,
  });

  for (const target of targets) {
    if (stopRequested || searchRequests >= maxSearches) {
      break;
    }

    if (completed.has(target.id)) {
      continue;
    }

    console.log({
      status: 'SEARCHING',
      target: target.name,
    });

    const queries = [
      `${target.name} ברקוד`,
      `${target.name} מוצר אריזה ברקוד תמונה`,
    ];

    const product = {
      targetId: target.id,
      targetName: target.name,
      status: 'DONE',
      candidates: [],
      errors: [],
      queries: [],
    };

    const visited = new Set();

    for (const query of queries) {
      if (stopRequested) {
        product.status = 'PARTIAL';
        break;
      }

      const cachePath = join(cacheDirectory, `${hash({ query })}.json`);

      try {
        let search;

        try {
          search = JSON.parse(await readFile(cachePath, 'utf8'));
        } catch (error) {
          if (error.code !== 'ENOENT') {
            throw error;
          }

          if (searchRequests >= maxSearches) {
            product.status = 'PARTIAL';
            break;
          }

          searchRequests++;

          const response = await request('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
              'X-API-KEY': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: query,
              gl: 'il',
              hl: 'he',
              num: 10,
            }),
          });

          search = JSON.parse(response);

          if (!Array.isArray(search.organic)) {
            throw new Error('Search response does not contain organic results');
          }

          await writeJson(cachePath, search);
        }

        if (!Array.isArray(search.organic)) {
          throw new Error('Invalid cached search response');
        }

        product.queries.push(query);

        for (const hit of search.organic.slice(0, pages)) {
          if (stopRequested) {
            product.status = 'PARTIAL';
            break;
          }

          const sourceUrl = webUrl(hit.link);

          if (!sourceUrl || visited.has(sourceUrl)) {
            continue;
          }

          visited.add(sourceUrl);

          console.log({
            status: 'READING_PAGE',
            target: target.name,
            sourceUrl,
          });

          try {
            const html = await request(sourceUrl, {
              headers: {
                'User-Agent': 'BalanceOSCatalogResearch/1.0',
                Accept: 'text/html',
              },
            });

            const candidates = extractCandidates(html, sourceUrl);

            product.candidates.push(
              ...candidates.map((candidate) => ({
                ...candidate,
                searchQuery: query,
                searchTitle: text(hit.title),
                retrievedAt: new Date().toISOString(),
              })),
            );
          } catch (error) {
            product.errors.push({
              sourceUrl,
              error: error.message,
            });
          }

          await pause(800);
        }
      } catch (error) {
        product.status = 'PARTIAL';

        product.errors.push({
          query,
          error: error.message,
        });

        if ([401, 403, 429].includes(error.status)) {
          stopRequested = true;
        }
      }
    }

    if (product.errors.length > 0) {
      product.status = 'PARTIAL';
    }

    const previous = state.products.find((item) => item.targetId === target.id);

    const allCandidates = [
      ...(previous?.candidates ?? []),
      ...product.candidates,
    ];

    const deduplicated = new Map(
      allCandidates.map((candidate) => [
        [candidate.normalizedGtin14, candidate.sourceUrl, candidate.name].join(
          '|',
        ),
        candidate,
      ]),
    );

    product.candidates = [...deduplicated.values()];

    state.products = [
      ...state.products.filter((item) => item.targetId !== target.id),
      product,
    ];

    await save();

    console.log({
      processed: state.products.length,
      total: targets.length,
      target: target.name,
      candidates: product.candidates.length,
      errors: product.errors.length,
      status: product.status,
      searchRequests,
      maxSearches,
    });
  }

  await save();

  console.log(state.summary);
  console.log('Results:', resultsPath);
  console.log('Review:', reportPath);
  console.log(
    'Rerun the same command to continue. PARTIAL targets will be retried.',
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
