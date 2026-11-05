import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

export const hash = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

export const number = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const object = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export const fields = [
  'caloriesPer100g',
  'proteinPer100g',
  'carbsPer100g',
  'fatPer100g',
  'fiberPer100g',
  'sugarPer100g',
  'saturatedFatPer100g',
  'sodiumPer100g',
];

export function gtin(value) {
  const barcode = String(value ?? '');

  if (!/^(\d{8}|\d{12,14})$/.test(barcode)) {
    return null;
  }

  let sum = 0;

  for (
    let index = barcode.length - 2, weight = 3;
    index >= 0;
    index--, weight = 4 - weight
  ) {
    sum += Number(barcode[index]) * weight;
  }

  return (10 - (sum % 10)) % 10 === Number(barcode.at(-1))
    ? barcode.padStart(14, '0')
    : null;
}

export function webUrl(value, base) {
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

function decode(value) {
  return String(value ?? '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, encoded) => {
      const code =
        encoded[0].toLowerCase() === 'x'
          ? parseInt(encoded.slice(1), 16)
          : Number(encoded);

      return code <= 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

function plain(value) {
  return decode(
    String(value)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function attributes(value) {
  return Object.fromEntries(
    [...value.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
      (match) => [match[1].toLowerCase(), decode(match[2] ?? match[3])],
    ),
  );
}

export function nutrition(value) {
  if (
    !value ||
    !/^100\s*(g|grams?|גרם|גר')\.?$/i.test(
      String(value.servingSize ?? '').trim(),
    )
  ) {
    return {};
  }

  const definitions = {
    calories: ['caloriesPer100g', 'kcal|קלוריות|קק״ל|קק"ל'],
    proteinContent: ['proteinPer100g', 'g|גרם'],
    carbohydrateContent: ['carbsPer100g', 'g|גרם'],
    fatContent: ['fatPer100g', 'g|גרם'],
    fiberContent: ['fiberPer100g', 'g|גרם'],
    sugarContent: ['sugarPer100g', 'g|גרם'],
    saturatedFatContent: ['saturatedFatPer100g', 'g|גרם'],
    sodiumContent: ['sodiumPer100g', 'mg|מג|מ"ג|מ״ג'],
  };

  const result = {};

  for (const [key, [field, units]] of Object.entries(definitions)) {
    const match = String(value[key] ?? '')
      .trim()
      .match(new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${units})$`, 'i'));

    if (!match) {
      continue;
    }

    const parsed = Number(match[1].replace(',', '.'));

    const maximum =
      field === 'caloriesPer100g'
        ? 1000
        : field === 'sodiumPer100g'
          ? 100000
          : 100;

    if (number(parsed) && parsed <= maximum) {
      result[field] = parsed;
    }
  }

  return result;
}

export function extract(html, sourceUrl) {
  const candidates = [];
  const visited = new Set();

  function visit(value) {
    if (!value || typeof value !== 'object' || visited.has(value)) {
      return;
    }

    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    const isProduct = []
      .concat(value['@type'] ?? [])
      .some((type) => /(^|\/)Product$/.test(type));

    if (isProduct) {
      const barcodes = [
        ...new Set(
          ['gtin', 'gtin8', 'gtin12', 'gtin13', 'gtin14']
            .flatMap((key) => [].concat(value[key] ?? []))
            .map(String)
            .filter(gtin),
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

      for (const barcode of barcodes) {
        if (!images.length || typeof value.name !== 'string') {
          continue;
        }

        const candidate = {
          barcode,
          normalizedGtin14: gtin(barcode),
          name: plain(value.name),
          brand:
            typeof value.brand === 'string'
              ? value.brand
              : String(value.brand?.name ?? ''),
          images,
          sourceUrl,
          evidenceType: 'PRODUCT_JSON_LD',
          webNutrition: nutrition(value.nutrition),
          reviewRequired: true,
        };

        candidate.candidateId = hash([
          candidate.sourceUrl,
          candidate.normalizedGtin14,
          candidate.name,
        ]);

        candidates.push(candidate);
      }
    }

    Object.values(value).forEach(visit);
  }

  for (const match of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    if (attributes(match[1]).type?.toLowerCase() !== 'application/ld+json') {
      continue;
    }

    try {
      visit(JSON.parse(match[2]));
    } catch {}
  }

  return candidates;
}

export function selectNutrition(candidate, source) {
  const values = {};
  const sources = {};

  for (const field of fields) {
    if (number(candidate.webNutrition?.[field])) {
      values[field] = candidate.webNutrition[field];

      sources[field] = {
        provider: 'PRODUCT_WEB',
        sourceUrl: candidate.sourceUrl,
        estimated: false,
      };
    } else if (number(source[field])) {
      values[field] = source[field];

      sources[field] = {
        provider: 'ISRAEL_MOH',
        externalId: source.externalId,
        catalogId: source.id,
        estimated: true,
      };
    }
  }

  return { values, sources };
}

export async function request(url, options = {}, redirects = 0) {
  const response = await fetch(url, {
    ...options,
    redirect: 'manual',
    signal: AbortSignal.timeout(20000),
  });

  if (response.status >= 300 && response.status < 400) {
    const next = webUrl(response.headers.get('location'), url);

    await response.body?.cancel();

    if (!next || redirects >= 4 || options.method === 'POST') {
      throw new Error('Unsupported redirect');
    }

    return request(next, options, redirects + 1);
  }

  if (!response.ok) {
    await response.body?.cancel();

    throw Object.assign(new Error(`HTTP ${response.status}`), {
      status: response.status,
    });
  }

  let size = 0;
  const chunks = [];

  for await (const chunk of response.body ?? []) {
    size += chunk.length;

    if (size > 6000000) {
      throw new Error('Page exceeds 6 MB');
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
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

export function render(state) {
  const rows = state.products
    .flatMap((product) =>
      product.candidates.map((candidate) => {
        const selected = candidate.selectedNutrition ?? {};
        const estimated = Object.values(selected.sources ?? {}).some(
          (source) => source.estimated,
        );

        return `
          <tr>
            <td>
              <input
                type="checkbox"
                data-target="${escapeHtml(product.targetId)}"
                data-id="${candidate.candidateId}"
              >
            </td>
            <td>${escapeHtml(product.targetName)}</td>
            <td>
              ${escapeHtml(candidate.name)}<br>
              ${escapeHtml(candidate.brand)}<br>
              ${escapeHtml(candidate.barcode)}
            </td>
            <td>
              <img
                loading="lazy"
                referrerpolicy="no-referrer"
                src="${escapeHtml(candidate.images[0])}"
                width="100"
                height="100"
                style="object-fit:contain"
              >
            </td>
            <td>
              <a
                target="_blank"
                rel="noreferrer"
                href="${escapeHtml(candidate.sourceUrl)}"
              >דף המוצר</a>
            </td>
            <td>
              ${escapeHtml(JSON.stringify(selected.values ?? {}))}
              <br>
              ${estimated ? 'כולל הערכה ממשרד הבריאות' : 'ערכי אתר'}
            </td>
          </tr>
        `;
      }),
    )
    .join('');

  const candidateCount = state.products.reduce(
    (total, product) => total + product.candidates.length,
    0,
  );

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>בדיקת מוצרים</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 24px;
      background: #f4f7f5;
      color: #173a29;
    }
    table {
      border-collapse: collapse;
      background: white;
      width: 100%;
    }
    td, th {
      border: 1px solid #ccd8d1;
      padding: 12px;
      vertical-align: top;
    }
    button {
      background: #146642;
      color: white;
      padding: 14px;
      border: 0;
      border-radius: 8px;
      cursor: pointer;
    }
    header {
      position: sticky;
      top: 0;
      background: #f4f7f5;
      padding: 12px;
    }
    td:last-child {
      max-width: 340px;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <header>
    <h1>בחירת התאמות לקטלוג</h1>
    <p>
      בדקו שם, סוג מוצר, יבש או מבושל והתאמת התמונה.
      סמנו רק התאמות נכונות.
      ערכי משרד הבריאות הם הערכה למזון כללי.
    </p>
    <button id="export">הורדת הבחירות לייבוא</button>
    <p>
      יעדים שנבדקו: ${state.products.length}.
      מועמדים: ${candidateCount}.
    </p>
  </header>
  <table>
    <thead>
      <tr>
        <th>בחירה</th>
        <th>מזון מקור</th>
        <th>מוצר שנמצא</th>
        <th>תמונה</th>
        <th>מקור</th>
        <th>ערכים ל־100 גרם</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <script>
    document.querySelector('#export').onclick = () => {
      const items = [...document.querySelectorAll('input:checked')]
        .map((element) => ({
          targetId: element.dataset.target,
          candidateId: element.dataset.id,
        }));

      const content = {
        sourceFingerprint: ${JSON.stringify(state.sourceFingerprint)},
        items,
      };

      const url = URL.createObjectURL(
        new Blob(
          [JSON.stringify(content, null, 2)],
          { type: 'application/json' },
        ),
      );

      const link = document.createElement('a');
      link.href = url;
      link.download = 'approved-products.json';
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  </script>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};

  const supported = [
    '--targets',
    '--out',
    '--max-searches',
    '--pages',
    '--reuse-results',
  ];

  for (let index = 0; index < args.length; index += 2) {
    if (!supported.includes(args[index]) || !args[index + 1]) {
      throw new Error(`Unknown or missing option: ${args[index]}`);
    }

    options[args[index]] = args[index + 1];
  }

  const limit = Number(options['--max-searches'] ?? 100);
  const pages = Number(options['--pages'] ?? 3);

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger(pages) ||
    pages < 1 ||
    pages > 10
  ) {
    throw new Error('Invalid limits');
  }

  const input = JSON.parse(
    (
      await readFile(resolve(options['--targets'] ?? 'moh-all.json'), 'utf8')
    ).replace(/^\uFEFF/, ''),
  );

  const targets = input.items;

  if (
    !Array.isArray(targets) ||
    new Set(targets.map((target) => target.id)).size !== targets.length
  ) {
    throw new Error('Invalid targets');
  }

  const sourceFingerprint = hash(targets);

  const outputDirectory = resolve(
    options['--out'] ?? 'import-results/web-search-all-v2',
  );

  const cacheDirectory = join(outputDirectory, 'cache');
  const resultsPath = join(outputDirectory, 'results.json');

  await mkdir(cacheDirectory, { recursive: true });

  let state = {
    version: 1,
    sourceFingerprint,
    products: [],
  };

  try {
    state = JSON.parse(await readFile(resultsPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  if (state.sourceFingerprint !== sourceFingerprint) {
    throw new Error('Source changed. Use another output directory.');
  }

  if (options['--reuse-results']) {
    const previous = JSON.parse(
      await readFile(resolve(options['--reuse-results']), 'utf8'),
    );

    if (!Array.isArray(previous.products)) {
      throw new Error('Invalid previous results');
    }

    for (const product of previous.products) {
      const target = targets.find((item) => item.id === product.targetId);

      if (
        !target ||
        state.products.some((item) => item.targetId === target.id)
      ) {
        continue;
      }

      const candidates = (product.candidates ?? [])
        .filter(
          (candidate) =>
            gtin(candidate.barcode) &&
            candidate.images?.length &&
            webUrl(candidate.sourceUrl),
        )
        .map((candidate) => ({
          ...candidate,
          webNutrition: {},
          normalizedGtin14: gtin(candidate.barcode),
          candidateId: hash([
            candidate.sourceUrl,
            gtin(candidate.barcode),
            candidate.name,
          ]),
          selectedNutrition: selectNutrition(
            { ...candidate, webNutrition: {} },
            target,
          ),
          reviewRequired: true,
        }));

      if (candidates.length) {
        state.products.push({
          targetId: target.id,
          targetName: target.name,
          mohExternalId: target.externalId,
          status: 'DONE',
          reusedPreviousResults: true,
          candidates,
          errors: [],
        });
      }
    }
  }

  let searchRequests = 0;
  let stopRequested = false;

  process.on('SIGINT', () => {
    stopRequested = true;
    console.log('Saving after the current request');
  });

  async function save() {
    state.updatedAt = new Date().toISOString();

    state.summary = {
      targets: targets.length,
      done: state.products.filter((product) => product.status === 'DONE')
        .length,
      searchRequestsThisRun: searchRequests,
      candidates: state.products.reduce(
        (total, product) => total + product.candidates.length,
        0,
      ),
    };

    await writeFile(
      `${resultsPath}.tmp`,
      JSON.stringify(state, null, 2),
      'utf8',
    );

    await rename(`${resultsPath}.tmp`, resultsPath);

    await writeFile(
      join(outputDirectory, 'review.html'),
      render(state),
      'utf8',
    );
  }

  const blockedDomains =
    /(^|\.)(facebook\.com|instagram\.com|youtube\.com|tiktok\.com|wikipedia\.org|ynet\.co\.il)$/i;

  for (const target of targets) {
    if (stopRequested) {
      break;
    }

    if (
      state.products.some(
        (product) =>
          product.targetId === target.id && product.status === 'DONE',
      )
    ) {
      continue;
    }

    const query =
      `${target.name} מוצר ברקוד ערכים תזונתיים ` +
      '-site:facebook.com -site:instagram.com ' +
      '-site:youtube.com -site:tiktok.com ' +
      '-site:wikipedia.org -site:ynet.co.il';

    const cachePath = join(cacheDirectory, `${hash(query)}.json`);

    const product = {
      targetId: target.id,
      targetName: target.name,
      mohExternalId: target.externalId,
      status: 'DONE',
      queries: [query],
      candidates: [],
      errors: [],
    };

    try {
      let search;

      try {
        search = JSON.parse(await readFile(cachePath, 'utf8'));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }

        if (searchRequests >= limit) {
          break;
        }

        if (!process.env.SERPER_API_KEY) {
          throw new Error('Set SERPER_API_KEY in .env');
        }

        searchRequests++;

        console.log({
          status: 'SEARCHING',
          target: target.name,
          used: searchRequests,
          limit,
        });

        search = JSON.parse(
          await request('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
              'X-API-KEY': process.env.SERPER_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: query,
              gl: 'il',
              hl: 'he',
              num: 10,
            }),
          }),
        );

        if (!Array.isArray(search.organic)) {
          throw new Error('Invalid search response');
        }

        await writeFile(cachePath, JSON.stringify(search), 'utf8');
      }

      if (!Array.isArray(search.organic)) {
        throw new Error('Invalid cached search');
      }

      const urls = [
        ...new Set(
          search.organic
            .map((hit) => webUrl(hit.link))
            .filter(
              (url) => url && !blockedDomains.test(new URL(url).hostname),
            ),
        ),
      ].slice(0, pages);

      for (const sourceUrl of urls) {
        if (stopRequested) {
          product.status = 'PARTIAL';
          break;
        }

        try {
          const html = await request(sourceUrl, {
            headers: {
              'User-Agent': 'BalanceOSCatalog/2.0',
              Accept: 'text/html',
            },
          });

          const candidates = extract(html, sourceUrl);

          product.candidates.push(
            ...candidates.map((candidate) => ({
              ...candidate,
              selectedNutrition: selectNutrition(candidate, target),
              retrievedAt: new Date().toISOString(),
            })),
          );
        } catch (error) {
          product.errors.push({
            url: sourceUrl,
            error: error.message,
          });
        }
      }
    } catch (error) {
      product.status = 'PARTIAL';
      product.errors.push({ error: error.message });
      stopRequested = true;
    }

    const previous = state.products.find((item) => item.targetId === target.id);

    product.candidates = [
      ...new Map(
        [...(previous?.candidates ?? []), ...product.candidates].map(
          (candidate) => [candidate.candidateId, candidate],
        ),
      ).values(),
    ];

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
      status: product.status,
      pageErrors: product.errors.length,
    });
  }

  await save();

  console.log({
    ...state.summary,
    output: outputDirectory,
    databaseWrites: 0,
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
