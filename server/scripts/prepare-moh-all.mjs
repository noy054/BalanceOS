import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function readJson(path) {
  const content = await readFile(resolve(path), 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, ''));
}

async function main() {
  const source = await readJson('import-results/moh/source.json');

  if (!Array.isArray(source.rows)) {
    throw new Error('Expected source.rows');
  }

  let previous = [];

  try {
    const proposed = await readJson('proposed-import.json');
    previous = Array.isArray(proposed) ? proposed : proposed.items;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  if (!Array.isArray(previous)) {
    throw new Error('Invalid proposed-import.json');
  }

  const previousIds = new Map(
    previous.map((item) => [String(item.externalId), item.id]),
  );

  const fieldMapping = {
    food_energy: 'caloriesPer100g',
    protein: 'proteinPer100g',
    carbohydrates: 'carbsPer100g',
    total_fat: 'fatPer100g',
    total_dietary_fiber: 'fiberPer100g',
    total_sugars: 'sugarPer100g',
    saturated_fat: 'saturatedFatPer100g',
    sodium: 'sodiumPer100g',
  };

  const seen = new Set();

  const items = source.rows.map((row) => {
    const code = String(row.Code ?? '');

    if (!code || seen.has(code) || !row.shmmitzrach?.trim()) {
      throw new Error(`Invalid or duplicate MOH row: ${code}`);
    }

    seen.add(code);

    const item = {
      id: previousIds.get(code) ?? `moh_code_${code}`,
      name: row.shmmitzrach.trim(),
      externalId: code,
      externalProvider: 'ISRAEL_MOH',
      nutritionBasis: 'PER_100G',
    };

    for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
      const value = row[sourceField];

      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        item[targetField] = value;
      }
    }

    item.externalRawData = row;

    return item;
  });

  const result = {
    provider: 'ISRAEL_MOH',
    datasetUrl: source.datasetUrl,
    resourceId: source.resourceId,
    downloadedAt: source.downloadedAt,
    items,
  };

  await writeFile(
    resolve('moh-all.json'),
    JSON.stringify(result, null, 2),
    'utf8',
  );

  console.log({
    output: resolve('moh-all.json'),
    products: items.length,
    databaseWrites: 0,
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
