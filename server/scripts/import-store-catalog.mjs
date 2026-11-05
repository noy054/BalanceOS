import { readFile, writeFile, mkdir, rename, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const HOST = 'https://hahishook.com';
const OUT = resolve('import-results/store-catalog');

const SEEDS = [HOST + '/'];

const ALIASES = [
  ['1607', ['שעועית לבנה', 'שעועית לבנה יבשה']],
  ['1627', ['שעועית אדומה', 'שעועית אדומה יבשה']],
  ['1655', ['חומוס', 'חומוס יבש', 'חומוס ענק', 'חומוס זן הדס']],
  ['1664', ['אפונה', 'אפונה יבשה']],
  ['1672', ['עדשים', 'עדשים יבשים']],
  ['1910', ['קמח חיטה לבן', 'קמח חיטה לבן בהיר']],
  ['1911', ['קמח תופח', 'קמח חיטה תופח']],
  ['1915', ['קמח חיטה מלא', 'קמח חיטה מלאה', 'קמח חיטה מלאה 100%']],
  ['2685', ['קורנפלור', 'עמילן תירס']],
  ['2678', ['קמח תירס']],
  ['2720', ['קמח אורז', 'קמח אורז לבן']],
  ['9842', ['קמח אורז מלא']],
  ['8270', ['קמח חומוס']],
  ['9822', ['קמח שיבולת שועל']],
  ['2737', ['סולת', 'סולת חיטה']],
  ['8812', ['בורגול', 'בורגול יבש']],
  ['2671', ['כוסמת', 'כוסמת לא קלויה']],
  ['2771', ['קינואה', 'קינואה לבנה']],
];

const FIELDS = [
  'caloriesPer100g',
  'proteinPer100g',
  'carbsPer100g',
  'fatPer100g',
  'fiberPer100g',
  'sugarPer100g',
  'saturatedFatPer100g',
  'sodiumPer100g',
];

const hash = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

const number = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const object = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const decode = (value) =>
  String(value ?? '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => {
      const v =
        n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
      return v <= 0x10ffff ? String.fromCodePoint(v) : '';
    })
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

const plain = (value) =>
  decode(
    String(value)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

const attrs = (value) =>
  Object.fromEntries(
    [...value.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [
      m[1].toLowerCase(),
      decode(m[2] ?? m[3]),
    ]),
  );

const norm = (value) =>
  plain(value)
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}%]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function gtin(value) {
  const s = String(value ?? '');
  if (!/^(\d{8}|\d{12,14})$/.test(s)) return null;
  let sum = 0;
  for (let i = s.length - 2, w = 3; i >= 0; i--, w = 4 - w) {
    sum += Number(s[i]) * w;
  }
  return (10 - (sum % 10)) % 10 === Number(s.at(-1))
    ? s.padStart(14, '0')
    : null;
}

function url(value, base = HOST) {
  try {
    const u = new URL(decode(value), base);
    if (u.origin !== HOST) return null;
    u.search = '';
    u.hash = '';
    return u.href;
  } catch {
    return null;
  }
}

function imageUrl(value, base = HOST) {
  try {
    const u = new URL(decode(value), base);
    if (
      u.protocol !== 'https:' ||
      u.username ||
      u.password ||
      !u.hostname.includes('.') ||
      u.hostname.includes(':') ||
      /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
        u.hostname,
      ) ||
      /logo|placeholder|default|tracking|pixel/i.test(u.pathname)
    )
      return null;
    return u.href;
  } catch {
    return null;
  }
}

export function listing(html, base) {
  const products = new Set();
  const next = new Set();

  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const a = attrs(m[1]);
    const u = url(a.href, base);
    if (!u) continue;

    const path = decodeURIComponent(new URL(u).pathname);
    if (path.startsWith('/product/')) products.add(u);
    if (path.startsWith('/product-category/')) next.add(u);
  }

  return { products: [...products], next: [...next] };
}

export function webNutrition(value) {
  if (
    !/^100\s*(?:g|grams?|גרם)$/i.test(String(value?.servingSize ?? '').trim())
  )
    return {};

  const fields = {
    calories: ['caloriesPer100g', 'kcal|קלוריות'],
    proteinContent: ['proteinPer100g', 'g|גרם'],
    carbohydrateContent: ['carbsPer100g', 'g|גרם'],
    fatContent: ['fatPer100g', 'g|גרם'],
    fiberContent: ['fiberPer100g', 'g|גרם'],
    sugarContent: ['sugarPer100g', 'g|גרם'],
    saturatedFatContent: ['saturatedFatPer100g', 'g|גרם'],
    sodiumContent: ['sodiumPer100g', 'mg|מ״ג|מ"ג'],
  };

  const out = {};
  for (const [key, [field, unit]] of Object.entries(fields)) {
    const m = String(value[key] ?? '')
      .trim()
      .match(new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${unit})$`, 'i'));
    if (!m) continue;
    const n = Number(m[1].replace(',', '.'));
    const max =
      field === 'caloriesPer100g'
        ? 1000
        : field === 'sodiumPer100g'
          ? 100000
          : 100;
    if (n <= max) out[field] = n;
  }
  return out;
}

export function productPage(html, sourceUrl, discoveredFrom) {
  const h = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (!h) throw new Error('No product heading');

  const name = plain(h[1]);
  const details = html
    .slice(h.index)
    .split(
      /<h[2-6]\b[^>]*>\s*(?:<[^>]*>\s*)*(?:השוואת מחירים|מוצרים נוספים|מוצרים קשורים)/i,
    )[0];
  const detailText = plain(details);
  const nodes = [];

  function visit(v) {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }

    if ([].concat(v['@type'] ?? []).some((t) => /(^|\/)Product$/.test(t))) {
      const declared = url(
        v.url ?? (typeof v['@id'] === 'string' ? v['@id'] : ''),
      );
      if (
        declared === url(sourceUrl) ||
        (!v.url && norm(v.name) === norm(name))
      )
        nodes.push(v);
    }

    Object.values(v).forEach(visit);
  }

  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attrs(m[1]).type?.toLowerCase() === 'application/ld+json') {
      try {
        visit(JSON.parse(m[2]));
      } catch {}
    }
  }

  const matching = nodes.filter((v) => norm(v.name) === norm(name));
  const primary = matching[0] ?? (nodes.length === 1 ? nodes[0] : null);

  const gtins = [
    ...new Set(
      nodes
        .flatMap((v) =>
          ['gtin', 'gtin8', 'gtin12', 'gtin13', 'gtin14'].flatMap((k) =>
            [].concat(v[k] ?? []),
          ),
        )
        .map(String)
        .filter(gtin)
        .map(gtin),
    ),
  ];

  const labelled =
    detailText.match(
      /ברקוד\s*[:：]?\s*([A-Z0-9_-]{3,30})(?![A-Z0-9_-])/i,
    )?.[1] ?? null;

  if (labelled && gtin(labelled)) gtins.push(gtin(labelled));

  const codes = [...new Set(gtins)];
  if (codes.length > 1) {
    throw new Error('Conflicting main product GTINs');
  }

  const barcode = codes.length
    ? labelled && gtin(labelled) === codes[0]
      ? labelled
      : codes[0].replace(/^0(?=\d{13}$)/, '')
    : null;

  const images = [
    ...new Set(
      []
        .concat(primary?.image ?? [])
        .map((v) =>
          imageUrl(
            typeof v === 'string' ? v : (v?.url ?? v?.contentUrl),
            sourceUrl,
          ),
        )
        .filter(Boolean),
    ),
  ];

  if (!images.length) {
    for (const m of html.matchAll(/<meta\b([^>]*)>/gi)) {
      const a = attrs(m[1]);
      if (a.property === 'og:image' && imageUrl(a.content, sourceUrl)) {
        images.push(imageUrl(a.content, sourceUrl));
      }
    }
  }

  const productId = html.match(/\bid=["']product-(\d+)["']/i)?.[1] ?? null;

  const sku =
    String(
      primary?.sku ??
        detailText.match(/מק[״"']?ט\s*[:：]?\s*([A-Z0-9_-]+)/i)?.[1] ??
        '',
    ) || null;

  return {
    sourceUrl: url(sourceUrl),
    discoveredFrom,
    name,
    barcode,
    normalizedGtin14: barcode ? gtin(barcode) : null,
    storeBarcode: labelled,
    storeSku: sku,
    storeProductId: productId,
    brand:
      typeof primary?.brand === 'string'
        ? primary.brand
        : (primary?.brand?.name ?? null),
    imageUrl: images[0] ?? null,
    imageUrls: images,
    webNutrition: webNutrition(primary?.nutrition),
    evidenceType: primary ? 'PRIMARY_PRODUCT_JSON_LD' : 'PRIMARY_PRODUCT_PAGE',
    detailText: detailText.slice(0, 5000),
  };
}

export function sourceFor(product, sources) {
  const n = norm(product.name);
  const code = ALIASES.find(([, names]) =>
    names.some(name => norm(name) === n)
  )?.[0];

  const matches = code
    ? sources.filter(s => String(s.externalId) === code)
    : sources.filter(s => norm(s.name) === n);

  return matches.length === 1 ? matches[0] : null;
}

export function nutritionPlan(product, source) {
  const values = {};
  const provenance = {};

  for (const field of FIELDS) {
    if (number(product.webNutrition[field])) {
      values[field] = product.webNutrition[field];
      provenance[field] = {
        provider: 'PRODUCT_WEB',
        sourceUrl: product.sourceUrl,
        estimated: false,
      };
    } else if (number(source?.[field])) {
      values[field] = source[field];
      provenance[field] = {
        provider: 'ISRAEL_MOH',
        externalId: source.externalId,
        catalogId: source.id,
        estimated: true,
      };
    }
  }

  return { values, provenance };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    throw e;
  }
}

async function json(path) {
  return JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, ''));
}

async function atomic(path, value) {
  await writeFile(path + '.tmp', JSON.stringify(value, null, 2), 'utf8');
  await rename(path + '.tmp', path);
}

let networkRequests = 0;
let lastRequest = 0;

async function getPage(page, redirects = 0) {
  if (!url(page)) throw new Error('Unsupported page origin');

  const wait = Math.max(0, 800 - (Date.now() - lastRequest));
  if (wait) await new Promise((r) => setTimeout(r, wait));

  lastRequest = Date.now();
  networkRequests++;

  const response = await fetch(page, {
    redirect: 'manual',
    headers: {
      'User-Agent': 'BalanceOSCatalog/4.0',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (response.status >= 300 && response.status < 400) {
    const next = url(response.headers.get('location'), page);
    await response.body?.cancel();
    if (!next || redirects >= 4) {
      throw new Error('Unsupported redirect');
    }
    return getPage(next, redirects + 1);
  }

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`HTTP ${response.status}: ${page}`);
  }

  let size = 0;
  const chunks = [];

  for await (const chunk of response.body ?? []) {
    size += chunk.length;
    if (size > 6000000) throw new Error('Page exceeds 6MB');
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function cachedPage(page) {
  const path = join(OUT, 'cache', hash(page) + '.json');
  if (await exists(path)) return (await json(path)).html;

  const html = await getPage(page);
  await atomic(path, {
    url: page,
    html,
    fetchedAt: new Date().toISOString(),
  });
  return html;
}

async function applyProducts(ready, input, batch, state, save, report) {
  const require = createRequire(import.meta.url);
  require('ts-node/register');
  const { PrismaClient } = require(resolve('generated/prisma/client'));
  const prisma = new PrismaClient();

  try {
    for (const item of ready) {
      const p = item.product;
      const s = item.source;
      const selected = item.nutrition;

      try {
        const code = p.normalizedGtin14;
        const aliases = code
          ? [
              ...new Set([
                p.barcode,
                code,
                code.slice(1),
                code.replace(/^0+/, ''),
              ]),
            ]
          : [];

        const id =
          'store_hahishook_' +
          (p.storeProductId ?? hash(p.sourceUrl).slice(0, 32));

        const lookup = [
          { id },
          {
            externalRawData: {
              path: ['storeProduct', 'sourceUrl'],
              equals: p.sourceUrl,
            },
          },
        ];

        if (p.storeProductId) {
          lookup.push({
            externalProvider: 'HAHISHOOK_STORE',
            externalId: p.storeProductId,
          });
        }

        if (code) {
          lookup.push(
            { barcode: { in: aliases } },
            { gtin: { in: aliases } },
            { normalizedBarcode: { in: aliases } },
          );
        }

        const found = await prisma.productCatalogItem.findMany({
          where: { OR: lookup },
        });

        if (found.length > 1) {
          throw new Error('Multiple existing catalog records');
        }

        const before = found[0];

        if (
          before?.archivedAt ||
          (before && before.nutritionBasis !== 'PER_100G')
        ) {
          throw new Error('Archived item or incompatible basis');
        }

        const raw = object(before?.externalRawData);

        if (
          s &&
          raw.mohLink?.externalId &&
          String(raw.mohLink.externalId) !== String(s.externalId)
        ) {
          throw new Error('Conflicting existing MOH link');
        }

        const digest = hash({
          product: p,
          source: s,
          values: selected.values,
        });

        if (before && raw.storeCatalogDigest === digest) {
          report.push({
            name: p.name,
            status: 'UNCHANGED',
            id: before.id,
          });
          continue;
        }

        const image = await fetch(p.imageUrl, {
          redirect: 'error',
          signal: AbortSignal.timeout(20000),
        });

        try {
          if (
            !image.ok ||
            !image.headers
              .get('content-type')
              ?.toLowerCase()
              .startsWith('image/')
          ) {
            throw new Error('Image unavailable or not an image');
          }
        } finally {
          await image.body?.cancel();
        }

        const values = {};
        const fieldSources = {
          ...object(raw.nutritionFieldSources),
        };

        for (const [field, value] of Object.entries(selected.values)) {
          if (
            before?.[field] == null ||
            (fieldSources[field]?.estimated &&
              selected.provenance[field].provider === 'PRODUCT_WEB')
          ) {
            values[field] = value;
            fieldSources[field] = selected.provenance[field];
          } else if (!fieldSources[field]) {
            fieldSources[field] = {
              provider: 'EXISTING_CATALOG_VALUE',
              verified: false,
            };
          }
        }

        const externalRawData = {
          ...raw,
          storeCatalogDigest: digest,
          importBatchId: raw.importBatchId ?? batch,
          enrichmentBatchId: batch,
          importOperation: raw.importOperation ?? 'STORE_CATALOG_IMPORT',
          storeProduct: p,
          mohLink: s
            ? {
                provider: 'ISRAEL_MOH',
                catalogId: s.id,
                externalId: s.externalId,
                name: s.name,
                genericFood: true,
                snapshot: s,
                datasetUrl: input.datasetUrl,
                resourceId: input.resourceId,
              }
            : (raw.mohLink ?? null),
          nutritionFieldSources: fieldSources,
          nutritionContainsEstimates: Object.values(fieldSources).some(
            (v) => v.estimated === true,
          ),
          nutritionNotice:
            'ערכי משרד הבריאות הם הערכה למזון כללי, לא ערכי אריזה מאומתים',
          imageAssociationEvidence: p.evidenceType,
          nutritionVerified: false,
        };

        const data = {
          ...values,
          imageUrl: before?.imageUrl ?? p.imageUrl,
          externalRawData,
        };

        const backupPath = join(
          OUT,
          'backups',
          `${batch}-${hash(p.sourceUrl).slice(0, 16)}.json`,
        );

        await atomic(backupPath, {
          before: before ?? null,
          proposed: data,
          product: p,
        });

        if (before) {
          const changed = await prisma.productCatalogItem.updateMany({
            where: {
              id: before.id,
              updatedAt: before.updatedAt,
              archivedAt: null,
            },
            data,
          });

          if (changed.count !== 1) {
            throw new Error('Concurrent change; product not updated');
          }
        } else {
          await prisma.productCatalogItem.create({
            data: {
              id,
              barcode: p.barcode,
              gtin: p.barcode,
              normalizedBarcode: p.barcode
                ? p.barcode.length <= 13
                  ? p.barcode.padStart(13, '0')
                  : p.normalizedGtin14
                : null,
              name: p.name,
              brand: p.brand,
              department: 'OTHER',
              languageCode: 'he',
              countryCode: 'IL',
              nutritionBasis: 'PER_100G',
              source: 'INTERNAL',
              verificationStatus: 'AUTO_IMPORTED',
              externalProvider: 'HAHISHOOK_STORE',
              externalId: p.storeProductId ?? p.sourceUrl,
              originalData: {
                product: p,
                mohExternalId: s?.externalId ?? null,
              },
              ...data,
            },
          });
        }

        report.push({
          name: p.name,
          barcode: p.barcode,
          storeSku: p.storeSku,
          id: before?.id ?? id,
          status: before ? 'UPDATED' : 'INSERTED',
        });

        state.products[p.sourceUrl].appliedDigest = digest;
        await save();
      } catch (error) {
        report.push({
          name: p.name,
          status: 'ERROR',
          error: error.message,
        });
      }

      await atomic(join(OUT, batch + '-report.json'), report);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.some((a) => !['--apply'].includes(a))) {
    throw new Error('Supported option: --apply');
  }

  const input = await json(resolve('moh-all.json'));

  if (!Array.isArray(input.items)) {
    throw new Error('Expected moh-all.json items');
  }

  await mkdir(join(OUT, 'cache'), { recursive: true });
  await mkdir(join(OUT, 'backups'), { recursive: true });

  const statePath = join(OUT, 'state.json');

  let state = {
    version: 1,
    categoryQueue: SEEDS.map((s) => url(s)),
    categoriesDone: [],
    productQueue: [],
    products: {},
  };

  if (await exists(statePath)) state = await json(statePath);

  if (!state.bulkDiscoveryV1) {
  state.categoryQueue.unshift(url(HOST + '/'));
  state.bulkDiscoveryV1 = true;
}
const save = () => atomic(statePath, state);

  let stopped = false;
  const stop = () => {
    stopped = true;
    console.log('Stopping after current page; progress is saved');
  };

  process.on('SIGINT', stop);

  try {
    let pages = 0;

    while (state.categoryQueue.length && pages < 300 && !stopped) {
      const page = state.categoryQueue[0];

      if (state.categoriesDone.includes(page)) {
        state.categoryQueue.shift();
        continue;
      }

      const links = listing(await cachedPage(page), page);

      for (const product of links.products) {
        if (
          !state.products[product] &&
          !state.productQueue.some((p) => p.url === product)
        ) {
          state.productQueue.push({
            url: product,
            category: page,
          });
        }
      }

      for (const next of links.next) {
        if (
          !state.categoriesDone.includes(next) &&
          !state.categoryQueue.includes(next)
        ) {
          state.categoryQueue.push(next);
        }
      }

      state.categoriesDone.push(page);
      state.categoryQueue.shift();
      pages++;

      await save();

      console.log({
        status: 'CATEGORY',
        productsFound: links.products.length,
        queuedProducts: state.productQueue.length,
      });
    }

    let checked = 0;

    while (state.productQueue.length && checked < 1000 && !stopped) {
      const entry = state.productQueue[0];
      const html = await cachedPage(entry.url);

      try {
        const product = productPage(html, entry.url, entry.category);
        state.products[entry.url] = { product };
      } catch (error) {
        state.products[entry.url] = { error: error.message };
      }

      state.productQueue.shift();
      checked++;

      await save();

      console.log({
        status: 'PRODUCT',
        checked,
        url: entry.url,
      });
    }

    await save();
    if (stopped) return;

    const ready = [];
    const report = [];
    const barcodes = new Map();

    for (const entry of Object.values(state.products)) {
      if (!entry.product) {
        report.push({
          status: 'PARSE_ERROR',
          error: entry.error,
        });
        continue;
      }

      const p = entry.product;
      const s = sourceFor(p, input.items);

      if (!p.imageUrl) {
        report.push({
          name: p.name,
          status: 'NO_PRODUCT_IMAGE',
        });
        continue;
      }

      const nutrition = nutritionPlan(p, s);

      if (
        ![
          'caloriesPer100g',
          'proteinPer100g',
          'carbsPer100g',
          'fatPer100g',
        ].every((k) => number(nutrition.values[k]))
      ) {
        report.push({
          name: p.name,
          status: s ? 'MISSING_NUTRITION' : 'NO_DEFINED_NUTRITION_MATCH',
        });
        continue;
      }

      if (p.normalizedGtin14) {
        if (!barcodes.has(p.normalizedGtin14)) {
          barcodes.set(p.normalizedGtin14, []);
        }
        barcodes.get(p.normalizedGtin14).push(p.sourceUrl);
      }

      ready.push({
        product: p,
        source: s,
        nutrition,
      });
    }

    const unique = ready.filter(
      (item) =>
        !item.product.normalizedGtin14 ||
        barcodes.get(item.product.normalizedGtin14).length === 1,
    );

    for (const item of ready.filter((item) => !unique.includes(item))) {
      report.push({
        name: item.product.name,
        status: 'DUPLICATE_GTIN_REVIEW',
      });
    }

    const batch = 'store-' + new Date().toISOString().replace(/[:.]/g, '-');

    await atomic(join(OUT, batch + '-plan.json'), unique);

    if (args.includes('--apply')) {
      await applyProducts(unique, input, batch, state, save, report);
    } else {
      report.push(
        ...unique.map((item) => ({
          name: item.product.name,
          barcode: item.product.barcode,
          storeSku: item.product.storeSku,
          mohExternalId: item.source?.externalId ?? null,
          status: 'READY',
          values: item.nutrition.values,
        })),
      );
    }

    await atomic(join(OUT, batch + '-report.json'), report);

    console.table(report.map(({ values, ...row }) => row));

    console.log({
      mode: args.includes('--apply') ? 'APPLY' : 'DRY_RUN',
      ready: unique.length,
      inserted: report.filter((r) => r.status === 'INSERTED').length,
      updated: report.filter((r) => r.status === 'UPDATED').length,
      unchanged: report.filter((r) => r.status === 'UNCHANGED').length,
      productPagesSaved: Object.keys(state.products).length,
      remaining: state.productQueue.length,
      storePageRequests: networkRequests,
      serperRequests: 0,
      outputDirectory: OUT,
    });
  } finally {
    process.removeListener('SIGINT', stop);
  }
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
