import { readFile, writeFile, mkdir, rename, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const HOST = 'https://www.foodsdictionary.co.il';
const OUT = resolve('import-results/foodsdictionary');
const LIMIT = Number(process.env.FD_MAX_PAGES ?? 1000);

if (!Number.isInteger(LIMIT) || LIMIT < 1 || LIMIT > 10000) {
  throw new Error('FD_MAX_PAGES must be between 1 and 10000');
}

const clean = (value) =>
  String(value ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => {
      const code =
        n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
      return code <= 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const attrs = (value) =>
  Object.fromEntries(
    [...value.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [
      m[1].toLowerCase(),
      clean(m[2] ?? m[3]),
    ]),
  );

const hash = (value) => createHash('sha256').update(value).digest('hex');

const normalize = (value) =>
  clean(value)
    .normalize('NFKC')
    .replace(/[`'״׳"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

function allowedUrl(value, base = HOST) {
  try {
    const u = new URL(value, base);
    if (u.origin !== HOST) return null;

    const product = /^\/Products\/\d+\/[^/]+\/?$/i.test(u.pathname);
    const listing =
      /^\/manufacturers(?:\/\d+)?\/?$/i.test(u.pathname) ||
      /^\/FoodsSearch\.php$/i.test(u.pathname);

    if (!product && !listing) return null;

    u.hash = '';
    if (product) u.search = '';
    u.searchParams.sort();

    return u.href;
  } catch {
    return null;
  }
}

function productImage(html, sourceUrl, productName) {
  const candidates = new Set();
  const expected = normalize(productName);
  const withoutManufacturer = normalize(productName.replace(/,\s*[^,]+$/, ''));

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const a = attrs(match[1]);
    const descriptions = [a.alt, a.title].filter(Boolean).map(normalize);

    const matchesName = descriptions.some(
      (description) =>
        description === expected || description === withoutManufacturer,
    );

    if (!matchesName) continue;

    const raw = a['data-src'] || a.src;
    if (!raw) continue;

    try {
      const u = new URL(raw, sourceUrl);

      if (u.protocol !== 'https:' || u.username || u.password) continue;

      const trustedHost =
        /^(?:[a-z0-9-]+\.)*foodsd\.co\.il$/i.test(u.hostname) ||
        /^(?:[a-z0-9-]+\.)*foodsdictionary\.co\.il$/i.test(u.hostname) ||
        (u.hostname === 'storage.googleapis.com' &&
          /^\/st\d+\.foodsd\.co\.il\//i.test(u.pathname));

      if (!trustedHost) continue;

      if (
        /logos?|triggers?|recipes?|thumbnails?|banners?|placeholder|default|pixel|tracking/i.test(
          u.pathname,
        )
      )
        continue;

      if (!/\/(?:images\/)?products?\//i.test(u.pathname)) {
        continue;
      }

      u.hash = '';
      candidates.add(u.href);
    } catch {}
  }

  return candidates.size === 1 ? [...candidates][0] : null;
}

function parseProduct(html, sourceUrl, fetchedAt) {
  const heading = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (!heading) throw new Error('Missing product heading');

  const name = clean(heading[1]);

  const tables = [
    ...html.matchAll(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi),
  ].filter((m) => /\bclass\s*=\s*["'][^"']*\bnv-table\b/i.test(m[1]));

  if (tables.length !== 1) {
    throw new Error('Missing or ambiguous nutrition table');
  }

  const table = tables[0][2];
  const basis = /\bid=["']sizeNameTd["'][^>]*>([\s\S]*?)<\//i.exec(table);

  if (!basis || !/^ל\s*-?\s*100\s*גרם$/.test(clean(basis[1]))) {
    throw new Error('Nutrition basis is not 100 grams');
  }

  const rules = [
    [/^קלוריות\s*\(אנרגיה\)$/, 'caloriesPer100g'],
    [/^חלבונים\s*\(גרם\)$/, 'proteinPer100g'],
    [/^פחמימות\s*\(גרם\)$/, 'carbsPer100g'],
    [/^שומנים\s*\(גרם\)$/, 'fatPer100g'],
    [/^(?:מתוכן\s*)?סוכרים\s*\(גרם\)$/, 'sugarPer100g'],
    [/^(?:מתוכם\s*)?שומן רווי\s*\(גרם\)$/, 'saturatedFatPer100g'],
    [/^סיבים תזונתיים\s*\(גרם\)$/, 'fiberPer100g'],
    [/^נתרן\s*\(מ["״]ג\)$/, 'sodiumPer100g'],
  ];

  const nutrition = {};

  for (const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];

    if (cells.length !== 2) continue;

    const label = clean(cells[0][1]);
    const field = rules.find(([pattern]) => pattern.test(label))?.[1];
    if (!field) continue;

    const raw = clean(cells[1][1]);
    if (!/^\d+(?:[.,]\d+)?$/.test(raw)) continue;

    const value = Number(raw.replace(',', '.'));
    const max =
      field === 'caloriesPer100g'
        ? 1000
        : field === 'sodiumPer100g'
          ? 100000
          : 100;

    if (value > max || Object.hasOwn(nutrition, field)) {
      throw new Error('Invalid or duplicate nutrient: ' + field);
    }

    nutrition[field] = value;
  }

  const core = [
    'caloriesPer100g',
    'proteinPer100g',
    'carbsPer100g',
    'fatPer100g',
  ];

  if (!core.every((field) => Object.hasOwn(nutrition, field))) {
    throw new Error('Missing core nutrition');
  }

  const breadcrumb =
    /<table\b[^>]*id=['"]breadcrumb['"][^>]*>([\s\S]*?)<\/table>/i.exec(
      html,
    )?.[1] ?? '';

  let manufacturer = null;

  for (const link of breadcrumb.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const a = attrs(link[1]);

    if (/\/manufacturers\/\d+/.test(a.href ?? '')) {
      manufacturer = clean(link[2]);
    }
  }

  const imageUrl = productImage(html, sourceUrl, name);

  return {
    sourceKey: 'fd_' + hash(sourceUrl).slice(0, 24),
    provider: 'FOODSDICTIONARY',
    sourceUrl,
    name,
    manufacturer,
    barcode: null,
    imageUrl,
    imageStatus: imageUrl
      ? 'MATCHED_PRODUCT_IMAGE'
      : 'NO_UNAMBIGUOUS_PRODUCT_IMAGE',
    nutritionBasis: 'PER_100G',
    ...nutrition,
    sourceUpdatedAt:
      clean(html).match(/תאריך עדכון:\s*(\d{2}\.\d{2}\.\d{4})/)?.[1] ?? null,
    collectedAt: fetchedAt ?? null,
    parsedAt: new Date().toISOString(),
    evidenceType: 'HTML_NUTRITION_TABLE',
    identityVerified: false,
  };
}

async function load(path, fallback) {
  try {
    return JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function save(path, value) {
  await writeFile(path + '.tmp', JSON.stringify(value, null, 2), 'utf8');
  await rename(path + '.tmp', path);
}

async function fetchPage(sourceUrl) {
  const response = await fetch(sourceUrl, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30000),
    headers: {
      'User-Agent': 'BalanceOSCatalog/5.1',
      Accept: 'text/html',
    },
  });

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error('HTTP ' + response.status);
  }

  const type = response.headers.get('content-type') ?? '';

  if (!/text\/html/i.test(type)) {
    await response.body?.cancel();
    throw new Error('Response is not HTML');
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of response.body ?? []) {
    size += chunk.length;
    if (size > 6000000) throw new Error('Page exceeds 6 MB');
    chunks.push(chunk);
  }

  const encoding =
    /charset\s*=\s*["']?([\w-]+)/i.exec(type)?.[1] ?? 'windows-1255';

  return new TextDecoder(encoding).decode(Buffer.concat(chunks));
}

function discover(html, sourceUrl, state) {
  const queued = new Set(state.queue);

  for (const link of html.matchAll(/<a\b([^>]*)>/gi)) {
    const href = attrs(link[1]).href;
    if (!href) continue;

    const next = allowedUrl(href, sourceUrl);

    if (!next || state.done[next] || queued.has(next)) {
      continue;
    }

    state.queue.push(next);
    queued.add(next);
  }
}

function processProduct(cached, state) {
  const sourceUrl = cached.sourceUrl;

  if (!/\/Products\//i.test(new URL(sourceUrl).pathname)) {
    return;
  }

  try {
    state.products[sourceUrl] = parseProduct(
      cached.html,
      sourceUrl,
      cached.fetchedAt,
    );

    delete state.errors[sourceUrl];
  } catch (error) {
    delete state.products[sourceUrl];
    state.errors[sourceUrl] = error.message;
  }
}

async function exportProducts(state) {
  const products = Object.values(state.products);

  await save(join(OUT, 'products.json'), {
    provider: 'FOODSDICTIONARY',
    exportedAt: new Date().toISOString(),
    products,
  });

  await save(join(OUT, 'errors.json'), state.errors);

  return products;
}

async function main() {
  const cacheDirectory = join(OUT, 'cache');
  await mkdir(cacheDirectory, { recursive: true });

  const statePath = join(OUT, 'state.json');
  const state = await load(statePath, {
    queue: [HOST + '/FoodsSearch.php', HOST + '/manufacturers/5'],
    done: {},
    products: {},
    errors: {},
  });

  let stopped = false;
  const stop = () => {
    stopped = true;
    console.log('Stopping after current page');
  };

  process.on('SIGINT', stop);

  try {
    let reparsed = 0;

    for (const filename of await readdir(cacheDirectory)) {
      if (stopped) break;
      if (!filename.endsWith('.json')) continue;

      const cached = await load(join(cacheDirectory, filename), null);

      if (
        !cached ||
        typeof cached.html !== 'string' ||
        !allowedUrl(cached.sourceUrl)
      )
        continue;

      discover(cached.html, cached.sourceUrl, state);
      processProduct(cached, state);
      reparsed++;
    }

    await save(statePath, state);
    await exportProducts(state);

    console.log({
      status: 'CACHE_REPROCESSED',
      pages: reparsed,
      products: Object.keys(state.products).length,
    });

    let processed = 0;

    while (state.queue.length && processed < LIMIT && !stopped) {
      const sourceUrl = state.queue[0];

      if (state.done[sourceUrl]) {
        state.queue.shift();
        continue;
      }

      const cachePath = join(cacheDirectory, hash(sourceUrl) + '.json');

      let cached = await load(cachePath, null);

      if (!cached) {
        await new Promise((r) => setTimeout(r, 1200));
        if (stopped) break;

        try {
          cached = {
            sourceUrl,
            html: await fetchPage(sourceUrl),
            fetchedAt: new Date().toISOString(),
          };

          await save(cachePath, cached);
        } catch (error) {
          state.errors[sourceUrl] = error.message;
          throw new Error(error.message + ': ' + sourceUrl);
        }
      }

      delete state.errors[sourceUrl];

      discover(cached.html, sourceUrl, state);
      processProduct(cached, state);

      state.done[sourceUrl] = true;
      state.queue.shift();
      processed++;

      await save(statePath, state);

      if (processed % 25 === 0) {
        await exportProducts(state);
      }

      console.log({
        processed,
        collected: Object.keys(state.products).length,
        remaining: state.queue.length,
        errors: Object.keys(state.errors).length,
      });
    }
  } finally {
    process.removeListener('SIGINT', stop);

    await save(statePath, state);
    const products = await exportProducts(state);

    console.log({
      collectedTotal: products.length,
      withProductImage: products.filter((p) => p.imageUrl).length,
      withoutProductImage: products.filter((p) => !p.imageUrl).length,
      remaining: state.queue.length,
      errors: Object.keys(state.errors).length,
      databaseWrites: 0,
      outputDirectory: OUT,
    });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
