import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = 'import-results/foodsdictionary';
const output = root + '/pipeline';
const priorSearch = root + '/google-images/products-enriched.json';
const apply = process.argv.includes('--apply');
const normalize = value => String(value ?? '').normalize('NFKC')
  .toLowerCase().replace(/[׳״'"\x60]/g, '').replace(/[^\p{L}\p{N}%.]+/gu, ' ').trim();

function run(file, args, env) {
  const result = spawnSync(process.execPath, [
    fileURLToPath(new URL(file, import.meta.url)), ...args,
  ], { stdio: 'inherit', env: { ...process.env, ...env } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(file + ' did not complete');
}

async function load(path, fallback) {
  try {
    return JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw error;
  }
}

async function save(path, data) {
  await writeFile(path + '.tmp', JSON.stringify(data, null, 2), 'utf8');
  await rename(path + '.tmp', path);
}

function identity(product) {
  return JSON.stringify([product.sourceKey, product.sourceUrl, product.name, product.manufacturer]);
}

function queryFor(product) {
  const name = product.name.trim();
  const manufacturer = product.manufacturer?.trim();
  return manufacturer && !normalize(name).includes(normalize(manufacturer))
    ? name + ' ' + manufacturer
    : name;
}

function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

function titleKey(value) {
  return normalize(String(value ?? '').split(/\s+[|–—-]\s+/)[0])
    .split(/\s+/).filter(word => word !== 'בטעם').sort().join(' ');
}

async function select(product, candidates) {
  const expected = titleKey(queryFor(product));
  const exact = candidates.filter(candidate =>
    titleKey(candidate.title) === expected &&
    Math.min(candidate.width ?? 0, candidate.height ?? 0) >= 300 &&
    httpsUrl(candidate.sourcePage) && httpsUrl(candidate.imageUrl)
  ).sort((a, b) => Math.min(b.width, b.height) - Math.min(a.width, a.height));

  for (const candidate of exact) {
    const url = httpsUrl(candidate.imageUrl);
    if (!url.hostname.endsWith('.il') || /logo|placeholder|banner/i.test(url.pathname)) continue;
    try {
      const response = await fetch(url, {
        method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(10000),
      });
      if (response.ok && /^image\/(jpeg|png|webp|avif)\b/i.test(response.headers.get('content-type') ?? '')) {
        return { ...candidate, imageUrl: url.href, method: 'EXACT_TITLE_AND_IMAGE_CHECK' };
      }
    } catch {}
  }
  return null;
}

function department(name) {
  if (/יוגורט|גבינ[הת]|קוטג|מעדן חלב/.test(name)) return 'DAIRY_EGGS';
  if (/פסטה|קמח|עדשים|קינואה|בורגול/.test(name)) return 'GRAINS_LEGUMES';
  if (/רוטב|שמן זית|טחינה/.test(name)) return 'SAUCES_OILS';
  return 'OTHER';
}

async function main() {
  const key = process.env.SERPER_API_KEY?.trim();
  const limit = Number(process.env.IMAGE_SEARCH_LIMIT ?? 100);
  if (!key) throw new Error('Set SERPER_API_KEY in server/.env');
  if (!Number.isSafeInteger(limit) || limit < 0) throw new Error('Invalid IMAGE_SEARCH_LIMIT');

  if (!process.argv.includes('--skip-collect')) {
    run('./collect-foodsdictionary.mjs', [], { FD_MAX_PAGES: process.env.FD_MAX_PAGES ?? '10000' });
  }

  const payload = await load(root + '/products.json');
  if (!Array.isArray(payload.products)) throw new Error('Expected products array');
  await mkdir(output, { recursive: true });
  const statePath = output + '/searches.json';
  const saved = await load(statePath, {});
  const prior = await load(priorSearch, { products: [] });
  const previous = new Map(prior.products.map(product => [identity(product), product.imageSearch]));
  const products = [];
  const exceptions = [];
  let requests = 0;
  let searchError = null;

  for (const product of payload.products) {
    const row = { ...product, department: department(product.name) };
    products.push(row);
    if (product.imageUrl || !product.name?.trim()) continue;

    const id = identity(product);
    let result = saved[id] ?? previous.get(id);
    if (!result && requests < limit && !searchError) {
      const query = queryFor(product);
      try {
        requests++;
        const response = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: query, gl: 'il', hl: 'he', num: 10 }),
          signal: AbortSignal.timeout(30000),
          redirect: 'error',
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw new Error('Serper HTTP ' + response.status);
        }
        const data = await response.json();
        if (!Array.isArray(data.images)) throw new Error('Missing Serper images array');
        result = {
          provider: 'serper',
          query,
          candidates: data.images.filter(item => httpsUrl(item.imageUrl) && httpsUrl(item.link))
            .slice(0, 5).map(item => ({
              title: item.title,
              imageUrl: item.imageUrl,
              sourcePage: item.link,
              width: item.imageWidth ?? item.width,
              height: item.imageHeight ?? item.height,
            })),
        };
        saved[id] = result;
        await save(statePath, saved);
        console.log({ requests, name: product.name, candidates: result.candidates.length });
        await delay(1000);
      } catch (error) {
        searchError = error.message;
        console.error(searchError);
      }
    }

    if (result) {
      row.imageSearch = result;
      const selected = await select(product, result.candidates ?? []);
      if (selected) {
        row.imageUrl = selected.imageUrl;
        row.imageSelection = selected;
        continue;
      }
    }

    exceptions.push({
      name: product.name,
      sourceUrl: product.sourceUrl,
      status: result ? 'NO_EXACT_IMAGE_MATCH' : 'SEARCH_PENDING',
    });
  }

  const input = output + '/products-ready.json';
  await save(input, { ...payload, products });
  await save(output + '/image-exceptions.json', exceptions);
  run('./import-foodsdictionary.mjs', apply ? ['--apply'] : [], { FD_IMPORT_INPUT: input });
  console.log({ requests, imageExceptions: exceptions.length, searchError, output });
  if (searchError) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
