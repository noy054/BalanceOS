import { readFile, writeFile, mkdir, access, rename } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const RESULTS = 'import-results/web-search-all-v2/results.json';

const KNOWN = new Map([
  ['00835811007258', '1607'],
  ['00835811007234', '1664'],
  ['07290003060276', '1910'],
  ['07290003060283', '1911'],
]);

const brands = [
  'תנובה',
  'טרה',
  'יטבתה',
  'צוריאל',
  'מולר',
  'גד',
  'שטראוס',
  'יופלה',
  'אקטיביה',
];

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/(\d)[.,](\d)/g, '$1.$2')
    .replace(
      /\d+(?:\.\d+)?\s*(?:ק[״"']?ג|קילו(?:גרם)?|גרם|מ[״"']?ל|ליטר|kg|grams?|ml)(?=$|[\s,;])/gi,
      ' ',
    )
    .replace(/עיזים/g, 'עזים')
    .replace(/נטורל/g, 'טבעי')
    .replace(/[^\p{L}\p{N}%.]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function retailEligible(source) {
  const name = String(source.name ?? '');

  const medical =
    /(?:תמ[״"']?[לי]|תחליפי? חלב|מטרנה|סימילאק|אנפמיל|לפגים|חלב אם|תחליף.{0,12}ארוחה|תוסף לארוחה|איזיליין|אנשור|מזון רפואי|JEVITY|OSMOLITE|PULMOCARE|OXEPA|NEPRO|GLUCERNA|PERATIVE|ALITRAQ|NUTREN|PEDIASURE|EASY DRINK|EASY FIBER)/i;

  const prepared = /(?:מבושל עם|תבשיל|מתכון|סלט מעורב|מוכן עם מים)/;

  return !medical.test(name) && !prepared.test(name);
}

function fat(value) {
  return [...normalize(value).matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((match) =>
    Number(match[1]),
  );
}

function matches(source, candidate, barcode) {
  if (!retailEligible(source)) {
    return false;
  }

  const target = normalize(source.name);
  const product = normalize(candidate.name);

  if (KNOWN.has(barcode)) {
    return KNOWN.get(barcode) === String(source.externalId);
  }

  if (candidate.evidenceType !== 'PRODUCT_JSON_LD') {
    return false;
  }

  const targetBrands = brands.filter((brand) =>
    target.split(' ').includes(brand),
  );

  const candidateBrands = brands.filter(
    (brand) =>
      normalize(candidate.brand).split(' ').includes(brand) ||
      product.split(' ').includes(brand),
  );

  if (
    targetBrands.length &&
    candidateBrands.length &&
    !targetBrands.some((brand) => candidateBrands.includes(brand))
  ) {
    return false;
  }

  const targetFat = fat(source.name);
  const productFat = fat(candidate.name);

  if (
    targetFat.length &&
    productFat.length &&
    !targetFat.some((value) => productFat.includes(value))
  ) {
    return false;
  }

  const withoutBrand = (name) =>
    brands.reduce(
      (value, brand) =>
        value
          .split(' ')
          .filter((token) => token !== brand)
          .join(' '),
      name,
    );

  const basic = (name) =>
    withoutBrand(name)
      .replace(/\b\d+(?:\.\d+)?\s*%/g, ' ')
      .replace(/שומן/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  if (/^חלב עזים/.test(target) && /^חלב עזים/.test(product)) {
    return (
      targetFat.length === 1 &&
      productFat.length === 1 &&
      targetFat[0] === productFat[0] &&
      basic(target) === 'חלב עזים' &&
      basic(product) === 'חלב עזים'
    );
  }

  if (
    /^יוגורט/.test(target) &&
    /^יוגורט/.test(product) &&
    targetBrands.includes('מולר')
  ) {
    return (
      candidateBrands.includes('מולר') &&
      targetFat.length === 1 &&
      productFat.length === 1 &&
      targetFat[0] === productFat[0] &&
      ['יוגורט', 'יוגורט טבעי'].includes(basic(target)) &&
      ['יוגורט', 'יוגורט טבעי'].includes(basic(product))
    );
  }

  const brand = normalize(candidate.brand);

  const productWithoutBrand = brand
    ? product
        .split(' ')
        .filter((token) => !brand.split(' ').includes(token))
        .join(' ')
    : product;

  return target.length > 2 && target === productWithoutBrand;
}

function priority(source) {
  const name = source.name;

  if (
    /קמח|אורז|בורגול|שיבולת|עדשים|שעועית|אפונה|חומוס|שומשום|קקאו|שקדים|אגוז|שמן זית|טחינה/.test(
      name,
    ) &&
    !/מבושל|מטוגן|סלט|עוגה|עוגיות|תבשיל/.test(name)
  ) {
    return 0;
  }

  if (/יוגורט|קוטג|גבינה|חלב|טונה|לחם|פסטה|חמאת בוטנים/.test(name)) {
    return 1;
  }

  return 2;
}

function run(args) {
  return new Promise((accept, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });

    child.once('error', reject);

    child.once('exit', (code, signal) => {
      if (code === 0) {
        accept();
      } else {
        reject(new Error(`Command stopped: ${signal ?? code}`));
      }
    });
  });
}

async function exists(path) {
  try {
    await access(resolve(path));
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function readJson(path) {
  const content = await readFile(resolve(path), 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, ''));
}

async function searchRetail(engine, input) {
  if (!process.env.SERPER_API_KEY?.trim()) {
    throw new Error('Set SERPER_API_KEY in .env');
  }

  const directory = resolve('import-results/web-search-all-v2');
  const cacheDirectory = join(directory, 'cache');

  await mkdir(cacheDirectory, { recursive: true });

  let state = {
    version: 1,
    sourceFingerprint: engine.hash(input.items),
    products: [],
  };

  if (await exists(RESULTS)) {
    state = await readJson(RESULTS);
  }

  if (state.sourceFingerprint !== engine.hash(input.items)) {
    throw new Error('Source fingerprint mismatch');
  }

  let used = 0;
  let stopped = false;

  const stop = () => {
    stopped = true;
    console.log('Stopping after current request');
  };

  process.on('SIGINT', stop);

  async function save() {
    state.updatedAt = new Date().toISOString();

    state.summary = {
      targets: input.items.length,
      done: state.products.filter((product) => product.status === 'DONE')
        .length,
      searchRequestsThisRun: used,
      candidates: state.products.reduce(
        (total, product) => total + product.candidates.length,
        0,
      ),
      scope: 'RETAIL_PRIORITY',
    };

    await writeFile(`${RESULTS}.tmp`, JSON.stringify(state, null, 2), 'utf8');

    await rename(`${RESULTS}.tmp`, RESULTS);

    await writeFile(
      join(directory, 'review.html'),
      engine.render(state),
      'utf8',
    );
  }

  try {
    const targets = input.items
      .filter(retailEligible)
      .sort((first, second) => priority(first) - priority(second));

    for (const source of targets) {
      if (stopped) {
        break;
      }

      if (
        state.products.some(
          (product) =>
            product.targetId === source.id && product.status === 'DONE',
        )
      ) {
        continue;
      }

      const query =
        `${source.name} מוצר ברקוד ערכים תזונתיים ` +
        '-site:facebook.com -site:instagram.com ' +
        '-site:youtube.com -site:tiktok.com ' +
        '-site:wikipedia.org -site:ynet.co.il';

      const cachePath = join(cacheDirectory, `${engine.hash(query)}.json`);

      let search;

      try {
        if (await exists(cachePath)) {
          search = await readJson(cachePath);
        } else {
          if (used >= 100) {
            break;
          }

          used++;

          console.log({
            status: 'SEARCHING',
            target: source.name,
            used,
            limit: 100,
          });

          search = JSON.parse(
            await engine.request('https://google.serper.dev/search', {
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
      } catch (error) {
        await save();

        throw new Error(`Search stopped for ${source.name}: ${error.message}`);
      }

      const previous = state.products.find(
        (product) => product.targetId === source.id,
      );

      const product = {
        targetId: source.id,
        targetName: source.name,
        mohExternalId: source.externalId,
        status: 'DONE',
        queries: [query],
        candidates: [...(previous?.candidates ?? [])],
        errors: [],
      };

      const blocked =
        /(^|\.)(facebook\.com|instagram\.com|youtube\.com|tiktok\.com|wikipedia\.org|ynet\.co\.il)$/i;

      const urls = [
        ...new Set(
          search.organic
            .map((hit) => engine.webUrl(hit.link))
            .filter((url) => url && !blocked.test(new URL(url).hostname)),
        ),
      ].slice(0, 3);

      for (const sourceUrl of urls) {
        if (stopped) {
          product.status = 'PARTIAL';
          break;
        }

        try {
          const html = await engine.request(sourceUrl, {
            headers: {
              'User-Agent': 'BalanceOSCatalog/3.0',
              Accept: 'text/html',
            },
          });

          product.candidates.push(
            ...engine.extract(html, sourceUrl).map((candidate) => ({
              ...candidate,
              selectedNutrition: engine.selectNutrition(candidate, source),
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

      product.candidates = [
        ...new Map(
          product.candidates.map((candidate) => [
            candidate.candidateId,
            candidate,
          ]),
        ).values(),
      ];

      state.products = [
        ...state.products.filter((item) => item.targetId !== source.id),
        product,
      ];

      await save();

      console.log({
        target: source.name,
        candidates: product.candidates.length,
        processed: state.products.length,
        total: input.items.length,
      });
    }

    await save();
    console.log(state.summary);
  } finally {
    process.removeListener('SIGINT', stop);
  }

  if (stopped) {
    throw new Error(
      'Search interrupted; progress saved. Import was not started.',
    );
  }
}

async function main() {
  const args = process.argv.slice(2);

  const supported = ['--apply', '--search', '--plan-only'];

  if (args.some((argument) => !supported.includes(argument))) {
    throw new Error('Supported options: --apply --search --plan-only');
  }

  if (args.includes('--apply') && args.includes('--plan-only')) {
    throw new Error('Choose --apply or --plan-only');
  }

  if (!(await exists('moh-all.json'))) {
    await run(['scripts/prepare-moh-all.mjs']);
  }

  const engine = await import(
    pathToFileURL(resolve('scripts/enrich-catalog-all.mjs')).href
  );

  const input = await readJson('moh-all.json');

  if (args.includes('--search')) {
    await searchRetail(engine, input);
  }

  if (!(await exists(RESULTS))) {
    throw new Error('No search results. Run again with --search');
  }

  const state = await readJson(RESULTS);

  if (engine.hash(input.items) !== state.sourceFingerprint) {
    throw new Error('Source fingerprint mismatch');
  }

  const sourceMap = new Map(input.items.map((source) => [source.id, source]));

  const groups = new Map();
  const skipped = [];

  for (const product of state.products) {
    const source = sourceMap.get(product.targetId);

    if (!source) {
      throw new Error(`Unknown source: ${product.targetId}`);
    }

    for (const candidate of product.candidates ?? []) {
      const barcode = engine.gtin(candidate.barcode);

      if (
        !barcode ||
        !candidate.images?.length ||
        !matches(source, candidate, barcode)
      ) {
        skipped.push({
          targetId: source.id,
          name: candidate.name,
          barcode: candidate.barcode,
          reason: 'NO_CLEAR_MATCH',
        });

        continue;
      }

      const selected = engine.selectNutrition(candidate, source);

      const complete = [
        'caloriesPer100g',
        'proteinPer100g',
        'carbsPer100g',
        'fatPer100g',
      ].every((field) => engine.number(selected.values[field]));

      if (!complete) {
        skipped.push({
          targetId: source.id,
          name: candidate.name,
          barcode: candidate.barcode,
          reason: 'MISSING_NUTRITION',
        });

        continue;
      }

      if (!groups.has(barcode)) {
        groups.set(barcode, []);
      }

      groups.get(barcode).push({
        source,
        candidate,
      });
    }
  }

  const items = [];
  const evidence = [];

  for (const [barcode, group] of groups) {
    const targetIds = new Set(group.map((item) => item.source.id));

    if (targetIds.size !== 1) {
      skipped.push({
        barcode,
        reason: 'CONFLICTING_SOURCE_FOODS',
        targetIds: [...targetIds],
      });

      continue;
    }

    const webValues = new Map();
    let conflict = false;

    for (const { candidate } of group) {
      for (const [field, value] of Object.entries(
        candidate.webNutrition ?? {},
      )) {
        if (!engine.number(value)) {
          continue;
        }

        if (
          webValues.has(field) &&
          Math.abs(webValues.get(field) - value) > 0.01
        ) {
          conflict = true;
        } else {
          webValues.set(field, value);
        }
      }
    }

    if (conflict) {
      skipped.push({
        barcode,
        reason: 'CONFLICTING_WEB_NUTRITION',
      });

      continue;
    }

    const score = (candidate) =>
      Object.values(candidate.webNutrition ?? {}).filter(engine.number).length;

    group.sort(
      (first, second) => score(second.candidate) - score(first.candidate),
    );

    const best = group[0];

    items.push({
      targetId: best.source.id,
      candidateId: best.candidate.candidateId,
    });

    evidence.push({
      barcode,
      targetId: best.source.id,
      selectedCandidateId: best.candidate.candidateId,
      evidence: group.map((item) => item.candidate),
    });
  }

  const runId = new Date().toISOString().replace(/[:.]/g, '-');

  const directory = resolve('import-results', `auto-import-${runId}`);

  await mkdir(directory, { recursive: true });

  const approvedPath = join(directory, 'approved-products.json');

  await writeFile(
    approvedPath,
    JSON.stringify(
      {
        sourceFingerprint: state.sourceFingerprint,
        items,
      },
      null,
      2,
    ),
    'utf8',
  );

  await writeFile(
    join(directory, 'all-evidence.json'),
    JSON.stringify(evidence, null, 2),
    'utf8',
  );

  await writeFile(
    join(directory, 'skipped.json'),
    JSON.stringify(skipped, null, 2),
    'utf8',
  );

  console.log({
    selectedUniqueProducts: items.length,
    skippedEntries: skipped.length,
    reportDirectory: directory,
  });

  if (!items.length || args.includes('--plan-only')) {
    return;
  }

  const importArgs = [
    '-r',
    'ts-node/register',
    'scripts/import-approved-products.ts',
    RESULTS,
    approvedPath,
  ];

  if (args.includes('--apply')) {
    importArgs.push('--apply');
  }

  await run(importArgs);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
