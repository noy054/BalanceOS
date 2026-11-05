import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

const mappings = [
  {
    barcode: '835811007258',
    mohCode: '1607',
    mohName: 'שעועית לבנה יבשה',
  },
  {
    barcode: '835811007234',
    mohCode: '1664',
    mohName: 'אפונה יבשה',
  },
  {
    barcode: '7290003060276',
    mohCode: '1910',
    mohName: 'קמח חיטה לבן',
  },
  {
    barcode: '7290003060283',
    mohCode: '1911',
    mohName: 'קמח חיטה תופח',
  },
];

const nutritionFields = [
  'caloriesPer100g',
  'proteinPer100g',
  'carbsPer100g',
  'fatPer100g',
  'fiberPer100g',
  'sugarPer100g',
  'saturatedFatPer100g',
  'sodiumPer100g',
] as const;

const importBatchId = 'first-products-2026-10-29T15-18-47-735Z';

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function validNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function normalizeGtin(value: unknown): string {
  const barcode = String(value ?? '');

  if (!/^(\d{8}|\d{12,14})$/.test(barcode)) {
    throw new Error(`Invalid barcode: ${barcode}`);
  }

  let sum = 0;

  for (
    let index = barcode.length - 2, weight = 3;
    index >= 0;
    index--, weight = 4 - weight
  ) {
    sum += Number(barcode[index]) * weight;
  }

  if ((10 - (sum % 10)) % 10 !== Number(barcode.at(-1))) {
    throw new Error(`Invalid barcode check digit: ${barcode}`);
  }

  return barcode.padStart(14, '0');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.some((argument) => argument !== '--apply')) {
    throw new Error('Supported option: --apply');
  }

  const apply = args.includes('--apply');

  const input = await readFile(resolve('proposed-import.json'), 'utf8');

  const parsed = JSON.parse(input.replace(/^\uFEFF/, ''));

  const sources: Record<string, any>[] = Array.isArray(parsed)
    ? parsed
    : parsed.items;

  if (!Array.isArray(sources)) {
    throw new Error('Expected an items array in proposed-import.json');
  }

  const runId = new Date().toISOString().replace(/[:.]/g, '-');

  const outputDirectory = resolve('import-results', `linked-products-${runId}`);

  await mkdir(outputDirectory, { recursive: true });

  const prepared: Array<{
    before: any;
    data: any;
    report: Record<string, unknown>;
  }> = [];

  for (const mapping of mappings) {
    const matches = sources.filter(
      (source) => String(source.externalId) === mapping.mohCode,
    );

    if (matches.length !== 1) {
      throw new Error(`Expected one MOH source for code ${mapping.mohCode}`);
    }

    const source = matches[0];

    if (
      source.name !== mapping.mohName ||
      source.externalProvider !== 'ISRAEL_MOH' ||
      source.nutritionBasis !== 'PER_100G' ||
      !source.id ||
      String(source.externalRawData?.Code) !== mapping.mohCode
    ) {
      throw new Error(`MOH source mismatch: ${mapping.mohCode}`);
    }

    if (source.originalData?.id && source.originalData.id !== source.id) {
      throw new Error(`MOH identifier mismatch: ${mapping.mohCode}`);
    }

    const id = `web_hahishook_${mapping.barcode.padStart(13, '0')}`;

    const existing = await prisma.productCatalogItem.findUnique({
      where: { id },
    });

    if (!existing || existing.archivedAt) {
      throw new Error(`Missing or archived product: ${id}`);
    }

    if (
      existing.externalProvider !== 'HAHISHOOK_WEB' ||
      existing.nutritionBasis !== 'PER_100G' ||
      normalizeGtin(existing.barcode) !== normalizeGtin(mapping.barcode)
    ) {
      throw new Error(`Catalog product mismatch: ${id}`);
    }

    const current = existing as unknown as Record<string, any>;
    const raw = asObject(existing.externalRawData);

    const fieldSources = {
      ...asObject(raw.nutritionFieldSources),
    };

    const valuesToFill: Record<string, number> = {};

    for (const field of nutritionFields) {
      const fallbackValue =
        field === 'sodiumPer100g'
          ? (source[field] ?? source.externalRawData?.sodium)
          : source[field];

      if (current[field] == null && validNumber(fallbackValue)) {
        valuesToFill[field] = fallbackValue;

        fieldSources[field] = {
          provider: 'ISRAEL_MOH',
          catalogId: source.id,
          externalId: mapping.mohCode,
          estimated: true,
        };
      } else if (current[field] != null && !fieldSources[field]) {
        fieldSources[field] = {
          provider: 'EXISTING_CATALOG_VALUE',
          verified: false,
        };
      }
    }

    const nutritionComplete = [
      'caloriesPer100g',
      'proteinPer100g',
      'carbsPer100g',
      'fatPer100g',
    ].every((field) => validNumber(valuesToFill[field] ?? current[field]));

    const externalRawData = {
      ...raw,
      importBatchId,
      importOperation: 'INITIAL_DRY_CATALOG',
      identifiers: {
        ...asObject(raw.identifiers),
        catalogId: existing.id,
        barcode: existing.barcode,
        gtin: existing.gtin,
        normalizedBarcode: existing.normalizedBarcode,
        normalizedGtin14: normalizeGtin(mapping.barcode),
        externalProvider: existing.externalProvider,
        externalId: existing.externalId,
        mohCatalogId: source.id,
        mohExternalId: mapping.mohCode,
      },
      mohLink: {
        provider: 'ISRAEL_MOH',
        catalogId: source.id,
        externalId: mapping.mohCode,
        name: source.name,
        nutritionBasis: 'PER_100G',
        genericFood: true,
        snapshot: source,
      },
      nutritionFieldSources: fieldSources,
      nutritionContainsEstimates: Object.values(fieldSources).some(
        (value) => asObject(value).estimated === true,
      ),
      nutritionNotice:
        'ערכים ממשרד הבריאות הם הערכה למזון כללי ואינם ערכי אריזה מאומתים',
      nutritionComplete,
      nutritionVerified: false,
    };

    prepared.push({
      before: existing,
      data: {
        ...valuesToFill,
        externalRawData,
      },
      report: {
        id,
        name: existing.name,
        barcode: existing.barcode,
        mohCatalogId: source.id,
        mohExternalId: mapping.mohCode,
        valuesToFill,
        nutritionComplete,
        status: apply ? 'PLANNED' : 'READY',
      },
    });
  }

  await writeFile(
    resolve(outputDirectory, 'backup.json'),
    JSON.stringify(
      prepared.map((item) => item.before),
      null,
      2,
    ),
    'utf8',
  );

  await writeFile(
    resolve(outputDirectory, 'plan.json'),
    JSON.stringify(
      prepared.map((item) => item.report),
      null,
      2,
    ),
    'utf8',
  );

  if (apply) {
    await prisma.$transaction(async (transaction) => {
      for (const item of prepared) {
        const result = await transaction.productCatalogItem.updateMany({
          where: {
            id: item.before.id,
            updatedAt: item.before.updatedAt,
            archivedAt: null,
          },
          data: item.data,
        });

        if (result.count !== 1) {
          throw new Error(
            `Product changed during update: ${item.before.id}. Transaction rolled back.`,
          );
        }
      }
    });

    prepared.forEach((item) => {
      item.report.status = 'UPDATED';
    });
  }

  const report = prepared.map((item) => item.report);

  await writeFile(
    resolve(outputDirectory, 'report.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );

  console.table(
    report.map(({ valuesToFill, ...item }) => ({
      ...item,
      valuesToFill: JSON.stringify(valuesToFill),
    })),
  );

  console.log({
    mode: apply ? 'APPLY' : 'DRY_RUN',
    products: report.length,
    outputDirectory,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
