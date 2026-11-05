import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { PrismaClient, Prisma } from '../generated/prisma/client';
import { classifyCatalogItem } from '../src/modules/product-catalog/catalog-subcategories';

type Row = Record<string, unknown>;

type Mapping = {
  code: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
};

const args = process.argv.slice(2);
const provider = 'ISRAEL_MOH';
const datasetUrl =
  'https://data.gov.il/he/datasets/ministry-health/nutrition-database';

function option(name: string): string | undefined {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

function object(value: unknown): Row {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Expected a JSON object');
  }

  return value as Row;
}

function string(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function number(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && !value.trim())
  ) {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result) && result >= 0 ? result : null;
}

async function api(
  action: string,
  parameters: Record<string, string>,
): Promise<Row> {
  const url = new URL(`https://data.gov.il/api/3/action/${action}`);

  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(60000),
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Government API returned HTTP ${response.status}`);
  }

  const payload = object(await response.json());

  if (payload.success !== true) {
    throw new Error(`Government API action failed: ${action}`);
  }

  return object(payload.result);
}

async function download(): Promise<Row[]> {
  const metadata = await api('package_show', {
    id: 'nutrition-database',
  });

  const resources = Array.isArray(metadata.resources)
    ? metadata.resources.map(object)
    : [];

  console.table(
    resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      format: resource.format,
      datastore: resource.datastore_active,
    })),
  );

  const requestedId = option('--resource');

  const candidates = resources.filter((resource) => {
    const name = string(resource.name) ?? '';

    return (
      resource.datastore_active === true &&
      /100/.test(name) &&
      /תזונ/.test(name) &&
      /מצרכ/.test(name)
    );
  });

  const resource = requestedId
    ? resources.find((item) => item.id === requestedId)
    : candidates.length === 1
      ? candidates[0]
      : undefined;

  if (!resource || resource.datastore_active !== true) {
    throw new Error(
      'Select the nutrition-per-100g resource from the table using --resource <id>',
    );
  }

  const resourceId = string(resource.id);

  if (!resourceId) {
    throw new Error('Resource ID is missing');
  }

  const rows: Row[] = [];
  let offset = 0;

  while (true) {
    const page = await api('datastore_search', {
      resource_id: resourceId,
      limit: '500',
      offset: String(offset),
    });

    if (!Array.isArray(page.records)) {
      throw new Error('Government API response has no records array');
    }

    const records = page.records.map(object);

    if (records.length === 0) {
      break;
    }

    rows.push(...records);
    offset += records.length;

    console.log({ downloaded: rows.length });

    const total = number(page.total);

    if (total !== null && offset >= total) {
      break;
    }
  }

  if (rows.length === 0) {
    throw new Error('The resource returned no records');
  }

  const directory = resolve('import-results', 'moh');
  await mkdir(directory, { recursive: true });

  await writeFile(
    resolve(directory, 'source.json'),
    JSON.stringify(
      {
        provider,
        datasetUrl,
        resourceId,
        downloadedAt: new Date().toISOString(),
        resource,
        licenseTitle: metadata.license_title,
        licenseUrl: metadata.license_url,
        rows,
      },
      null,
      2,
    ),
    'utf8',
  );

  return rows;
}

function validateMapping(value: unknown, rows: Row[]): Mapping {
  const raw = object(value);
  const required = ['code', 'name', 'calories', 'protein', 'carbs', 'fat'];

  const available = new Set(rows.flatMap((row) => Object.keys(row)));

  for (const key of required) {
    if (typeof raw[key] !== 'string' || !available.has(String(raw[key]))) {
      throw new Error(`Missing or unknown mapping column: ${key}`);
    }
  }

  if (
    raw.fiber !== undefined &&
    (typeof raw.fiber !== 'string' || !available.has(raw.fiber))
  ) {
    throw new Error('Unknown fiber column');
  }

  return raw as Mapping;
}

async function main(): Promise<void> {
  const directory = resolve('import-results', 'moh');
  await mkdir(directory, { recursive: true });

  const localSource = option('--source');

  const rows = localSource
    ? (() => readFile(resolve(localSource), 'utf8'))().then((content) => {
        const saved = object(JSON.parse(content));

        if (!Array.isArray(saved.rows)) {
          throw new Error('Saved source has no rows array');
        }

        return saved.rows.map(object);
      })
    : download();

  const records = await rows;

  if (records.length === 0) {
    throw new Error('No source records');
  }

  const columns = [...new Set(records.flatMap((row) => Object.keys(row)))];

  await writeFile(
    resolve(directory, 'columns-and-samples.json'),
    JSON.stringify(
      {
        count: records.length,
        columns,
        samples: records.slice(0, 5),
      },
      null,
      2,
    ),
    'utf8',
  );

  const mappingPath = option('--mapping');

  if (!mappingPath) {
    console.log('Downloaded successfully. No database changes.');
    console.log(resolve(directory, 'columns-and-samples.json'));
    console.log(
      'Verify the source column units, then provide --mapping <mapping.json>',
    );
    return;
  }

  const mapping = validateMapping(
    JSON.parse(await readFile(resolve(mappingPath), 'utf8')),
    records,
  );

  const limit = Number(option('--limit') ?? 0);

  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error('--limit must be a non-negative integer');
  }

  const items: Prisma.ProductCatalogItemCreateManyInput[] = [];
  const skipped: Row[] = [];
  const seen = new Set<string>();

  for (const row of records) {
    const code = string(row[mapping.code]);
    const name = string(row[mapping.name]);
    const calories = number(row[mapping.calories]);
    const protein = number(row[mapping.protein]);
    const carbs = number(row[mapping.carbs]);
    const fat = number(row[mapping.fat]);
    const fiber = mapping.fiber ? number(row[mapping.fiber]) : null;

    let reason: string | null = null;

    if (!code || !name) {
      reason = 'missing_identity';
    } else if (
      calories === null ||
      protein === null ||
      carbs === null ||
      fat === null
    ) {
      reason = 'missing_core_nutrition';
    } else if (
      calories > 1000 ||
      protein > 100 ||
      carbs > 100 ||
      fat > 100 ||
      (fiber !== null && fiber > 100) ||
      protein + carbs + fat > 105
    ) {
      reason = 'implausible_nutrition';
    } else if (seen.has(code)) {
      reason = 'duplicate_source_code';
    }

    if (reason || !code || !name) {
      skipped.push({ code, name, reason });
      continue;
    }

    seen.add(code);

    const mapped = {
      name,
      countryCode: 'IL',
      languageCode: 'he',
      nutritionBasis: 'PER_100G' as const,
      caloriesPer100g: calories,
      proteinPer100g: protein,
      carbsPer100g: carbs,
      fatPer100g: fat,
      fiberPer100g: fiber,
    };

    const hash = createHash('sha256')
      .update(`${provider}:${code}`)
      .digest('hex');

    items.push({
      id: `moh_${hash}`,
      ...mapped,
      ...classifyCatalogItem([], null, name),
      source: 'INTERNAL',
      verificationStatus: 'AUTO_IMPORTED',
      externalProvider: provider,
      externalId: code,
      externalRawData: row as Prisma.InputJsonObject,
      originalData: mapped as Prisma.InputJsonObject,
    });

    if (limit > 0 && items.length >= limit) {
      break;
    }
  }

  await writeFile(
    resolve(directory, 'preview.json'),
    JSON.stringify({ items, skipped }, null, 2),
    'utf8',
  );

  if (!args.includes('--apply')) {
    console.log({
      mode: 'DRY_RUN',
      ready: items.length,
      skipped: skipped.length,
      preview: resolve(directory, 'preview.json'),
    });
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
  }

  const prisma = new PrismaClient();
  let inserted = 0;
  let existing = 0;

  try {
    for (let offset = 0; offset < items.length; offset += 100) {
      const batch = items.slice(offset, offset + 100);

      const previous = await prisma.productCatalogItem.findMany({
        where: {
          externalProvider: provider,
          externalId: {
            in: batch.map((item) => String(item.externalId)),
          },
        },
        select: { externalId: true },
      });

      const previousIds = new Set(previous.map((item) => item.externalId));

      const pending = batch.filter(
        (item) => !previousIds.has(String(item.externalId)),
      );

      const result = pending.length
        ? await prisma.productCatalogItem.createMany({
            data: pending,
            skipDuplicates: true,
          })
        : { count: 0 };

      inserted += result.count;
      existing += batch.length - result.count;

      console.log({ inserted, existing });
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log({
    completed: true,
    inserted,
    existing,
    skipped: skipped.length,
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';

  if (error !== null && typeof error === 'object' && 'clientVersion' in error) {
    console.error('Database operation failed. Check schema and connection.');
  } else {
    console.error(message);
  }

  process.exitCode = 1;
});
