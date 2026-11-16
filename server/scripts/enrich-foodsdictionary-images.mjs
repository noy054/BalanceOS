import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const input = 'import-results/foodsdictionary/products.json';
const output = 'import-results/foodsdictionary/google-images';
const resultsPath = join(output, 'products-enriched.json');

async function readJson(path) {
  return JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, ''));
}

function productKey(product) {
  return JSON.stringify([
    product.sourceKey,
    product.sourceUrl,
    product.name,
    product.manufacturer,
  ]);
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

async function main() {
  const key = process.env.SERPER_API_KEY?.trim();
  const limit = Number(process.env.IMAGE_SEARCH_LIMIT ?? 5);

  if (!key) throw new Error('Set SERPER_API_KEY in server/.env');
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new Error('IMAGE_SEARCH_LIMIT must be a positive integer');
  }

  const payload = await readJson(input);
  const products = Array.isArray(payload) ? payload : payload.products;
  if (!Array.isArray(products)) throw new Error('Invalid products.json');

  await mkdir(output, { recursive: true });

  const previous = new Map();
  try {
    const saved = await readJson(resultsPath);
    for (const product of saved.products) {
      if (product.imageSearch?.provider === 'serper') {
        previous.set(productKey(product), product.imageSearch);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  async function save() {
    const merged = products.map(product => {
      const result = previous.get(productKey(product));
      if (product.imageUrl?.trim() || !result) return product;
      return {
        ...product,
        imageSearch: result,
        imageAssociationVerified: false,
      };
    });

    const data = Array.isArray(payload)
      ? { products: merged }
      : { ...payload, products: merged };

    const temporary = `${resultsPath}.tmp`;
    await writeFile(temporary, JSON.stringify(data, null, 2), 'utf8');
    await rename(temporary, resultsPath);
  }

  let searched = 0;

  for (const product of products) {
    if (searched >= limit) break;
    if (product.imageUrl?.trim() || !product.name?.trim()) continue;

    const id = productKey(product);
    if (previous.has(id)) continue;

    const name = product.name.trim();
    const manufacturer = product.manufacturer?.trim() ?? '';
    const query = manufacturer && !name.toLowerCase().includes(manufacturer.toLowerCase())
      ? `${name} ${manufacturer}`
      : name;

    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, gl: 'il', hl: 'he', num: 10 }),
      signal: AbortSignal.timeout(30000),
      redirect: 'error',
    });

    if (!response.ok) throw new Error(`Serper returned HTTP ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data.images)) throw new Error('Missing images array in Serper response');

    const candidates = [];
    const seen = new Set();

    for (const item of data.images) {
      if (!validUrl(item.imageUrl) || !validUrl(item.link) || seen.has(item.imageUrl)) continue;
      seen.add(item.imageUrl);
      candidates.push({
        title: item.title,
        imageUrl: item.imageUrl,
        sourcePage: item.link,
        width: item.imageWidth ?? item.width,
        height: item.imageHeight ?? item.height,
      });
      if (candidates.length === 5) break;
    }

    previous.set(id, {
      provider: 'serper',
      query,
      searchedAt: new Date().toISOString(),
      status: candidates.length ? 'REVIEW_REQUIRED' : 'NO_CANDIDATES',
      candidates,
    });

    await save();
    searched++;
    console.log({ searched, name, candidates: candidates.length });
    if (searched < limit) await delay(1000);
  }

  console.log({ searchedThisRun: searched, output: resultsPath });
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
