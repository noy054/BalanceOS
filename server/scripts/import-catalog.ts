import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { once } from 'node:events';
import { finished } from 'node:stream/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PrismaClient, Prisma } from '../generated/prisma/client';

type SourceProduct = Record<string, unknown>;
type CatalogInput = Prisma.ProductCatalogItemCreateManyInput;

const args = process.argv.slice(2);

function option(name: string): string | undefined {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

function record(value: unknown): SourceProduct {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as SourceProduct)
    : {};
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function numeric(value: unknown): number | null {
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

function normalizeBarcode(value: unknown): string | null {
  const code = text(value);

  if (!code || !/^(?:\d{8}|\d{12}|\d{13})$/.test(code)) {
    return null;
  }

  const sum = code
    .slice(0, -1)
    .split('')
    .reverse()
    .reduce(
      (total, digit, index) =>
        total + Number(digit) * (index % 2 === 0 ? 3 : 1),
      0,
    );

  return (10 - (sum % 10)) % 10 === Number(code.at(-1))
    ? code.padStart(13, '0')
    : null;
}

function imageUrl(product: SourceProduct): string | null {
  const selected = record(product.selected_images);
  const display = record(record(selected.front).display);

  const candidates = [display.he, product.image_front_url, product.image_url];

  for (const candidate of candidates) {
    const value = text(candidate);

    if (!value) {
      continue;
    }

    try {
      if (new URL(value).protocol === 'https:') {
        return value;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function mapProduct(
  product: SourceProduct,
  runId: string,
): { item: CatalogInput | null; reason: string } {
  const skip = (reason: string) => ({ item: null, reason });

  if (!strings(product.countries_tags).includes('en:israel')) {
    return skip('outside_israel');
  }

  const normalizedBarcode = normalizeBarcode(product.code);

  if (!normalizedBarcode) {
    return skip('invalid_or_unsupported_barcode');
  }

  const name =
    text(product.product_name_he) ??
    text(product.product_name) ??
    text(product.product_name_en);

  if (!name) {
    return skip('missing_name');
  }

  const categories = strings(product.categories_tags);

  const quantityText = [
    product.quantity,
    product.serving_size,
    product.product_quantity_unit,
    product.serving_quantity_unit,
  ]
    .map((value) => text(value) ?? '')
    .join(' ');

  const hasVolumeUnit =
    /\b(?:ml|cl|dl|l|liters?|litres?)\b|מ["״׳']?ל|מיליליטר|ליטר/i.test(
      quantityText,
    );

  if (hasVolumeUnit || categories.includes('en:beverages')) {
    return skip('volume_basis_requires_support');
  }

  if (strings(product.data_quality_errors_tags).length > 0) {
    return skip('source_quality_errors');
  }

  const nutrients = record(product.nutriments);

  const energyKj =
    numeric(nutrients['energy-kj_100g']) ?? numeric(nutrients.energy_100g);

  const calories =
    numeric(nutrients['energy-kcal_100g']) ??
    (energyKj === null ? null : energyKj / 4.184);

  const protein = numeric(nutrients.proteins_100g);
  const carbs = numeric(nutrients.carbohydrates_100g);
  const fat = numeric(nutrients.fat_100g);
  const fiber = numeric(nutrients.fiber_100g);
  const sugar = numeric(nutrients.sugars_100g);
  const saturatedFat = numeric(nutrients['saturated-fat_100g']);

  if (calories === null || protein === null || carbs === null || fat === null) {
    return skip('missing_core_nutrition');
  }

  const gramValues = [protein, carbs, fat, fiber, sugar, saturatedFat];

  if (
    calories > 1000 ||
    gramValues.some((value) => value !== null && value > 100) ||
    protein + carbs + fat > 105 ||
    (sugar !== null && sugar > carbs + 1) ||
    (saturatedFat !== null && saturatedFat > fat + 1)
  ) {
    return skip('implausible_nutrition');
  }

  const image = imageUrl(product);

  if (!image) {
    return skip('missing_image');
  }

  const mapped = {
    barcode: text(product.code),
    gtin: normalizedBarcode,
    normalizedBarcode,
    name,
    brand: text(product.brands),
    category: categories.join(', ') || null,
    countryCode: 'IL',
    languageCode: /[\u0590-\u05ff]/.test(name)
      ? 'he'
      : (text(product.lang) ?? 'en'),
    imageUrl: image,
    ingredientsText:
      text(product.ingredients_text_he) ?? text(product.ingredients_text),
    allergensText: text(product.allergens),
    servingSizeText: text(product.serving_size),
    nutritionBasis: 'PER_100G' as const,
    caloriesPer100g: calories,
    proteinPer100g: protein,
    carbsPer100g: carbs,
    fatPer100g: fat,
    fiberPer100g: fiber,
    sugarPer100g: sugar,
    saturatedFatPer100g: saturatedFat,
    source: 'OPEN_FOOD_FACTS' as const,
    verificationStatus: 'AUTO_IMPORTED' as const,
    externalProvider: 'OPEN_FOOD_FACTS',
    externalId: text(product.code),
  };

  return {
    reason: 'ready',
    item: {
      ...mapped,
      externalRawData: product as Prisma.InputJsonObject,
      originalData: mapped as Prisma.InputJsonObject,
      nutrients: {
        importRunId: runId,
        importedAt: new Date().toISOString(),
        rawNutriments: nutrients as Prisma.InputJsonObject,
        attribution: 'Open Food Facts contributors',
        sourceUrl: `https://world.openfoodfacts.org/product/${product.code}`,
        dataLicense: 'ODbL-1.0',
        imageLicense: 'CC-BY-SA-3.0',
      },
    },
  };
}

async function main(): Promise<void> {
  const input = option('--input');

  if (!input) {
    throw new Error(
      'Usage: --input <products.jsonl.gz> [--limit 100] [--apply]',
    );
  }

  const limit = Number(option('--limit') ?? 0);

  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error('--limit must be a non-negative integer');
  }

  const apply = args.includes('--apply');

  if (apply && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
  }

  const runId = randomUUID();
  const outputDirectory = resolve(
    'import-results',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${runId}`,
  );

  await mkdir(outputDirectory, { recursive: true });

  const report = createWriteStream(resolve(outputDirectory, 'products.jsonl'), {
    encoding: 'utf8',
  });

  const reportCompletion = finished(report);
  let reportFailure: unknown;

  void reportCompletion.catch((error: unknown) => {
    reportFailure = error;
  });

  const counters: Record<string, number> = {};
  const seen = new Set<string>();
  const batch: CatalogInput[] = [];
  const prisma = apply ? new PrismaClient() : null;

  let scanned = 0;
  let ready = 0;
  let inserted = 0;
  let existing = 0;
  let completed = false;

  const increment = (reason: string) => {
    counters[reason] = (counters[reason] ?? 0) + 1;
  };

  const flush = async () => {
    if (!prisma || batch.length === 0) {
      return;
    }

    const rows = batch.splice(0);

    const result = await prisma.$transaction(async (transaction) => {
      const created = await transaction.productCatalogItem.createMany({
        data: rows,
        skipDuplicates: true,
      });

      await transaction.barcodeLookupMiss.deleteMany({
        where: {
          normalizedBarcode: {
            in: rows.map((row) => String(row.normalizedBarcode)),
          },
        },
      });

      return created;
    });

    inserted += result.count;
    existing += rows.length - result.count;

    console.log({ scanned, ready, inserted, existing });
  };

  const file = createReadStream(resolve(input));
  const stream = input.endsWith('.gz') ? file.pipe(createGunzip()) : file;

  file.on('error', (error) => {
    if (stream !== file) {
      stream.destroy(error);
    }
  });

  const lines = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  try {
    for await (const line of lines) {
      scanned += 1;

      if (!line.trim()) {
        continue;
      }

      let product: SourceProduct;

      try {
        const parsed: unknown = JSON.parse(line);

        if (
          parsed === null ||
          typeof parsed !== 'object' ||
          Array.isArray(parsed)
        ) {
          throw new Error('Invalid product object');
        }

        product = parsed as SourceProduct;
      } catch {
        increment('malformed_json');
        continue;
      }

      const result = mapProduct(product, runId);
      let reason = result.reason;

      if (result.item) {
        const code = String(result.item.normalizedBarcode);

        if (seen.has(code)) {
          reason = 'duplicate_in_source';
        } else {
          seen.add(code);
          ready += 1;

          if (prisma) {
            batch.push(result.item);
          }
        }
      }

      increment(reason);

      if (reason !== 'outside_israel') {
        if (reportFailure) {
          throw reportFailure;
        }

        const entry =
          reason === 'ready'
            ? { reason, item: result.item }
            : {
                reason,
                barcode: product.code,
                name: product.product_name,
              };

        if (!report.write(`${JSON.stringify(entry)}\n`)) {
          await once(report, 'drain');
        }
      }

      if (batch.length >= 100) {
        await flush();
      }

      if (scanned % 100000 === 0) {
        console.log({ scanned, ready, inserted, existing });
      }

      if (limit > 0 && ready >= limit) {
        break;
      }
    }

    await flush();
    completed = true;
  } finally {
    lines.close();
    stream.destroy();
    file.destroy();
    report.end();

    try {
      await reportCompletion;
    } finally {
      const summary = {
        runId,
        mode: apply ? 'APPLY' : 'DRY_RUN',
        completed: completed && !reportFailure,
        scanned,
        ready,
        inserted,
        existing,
        counters,
        outputDirectory,
      };

      await writeFile(
        resolve(outputDirectory, 'summary.json'),
        JSON.stringify(summary, null, 2),
        'utf8',
      );

      await prisma?.$disconnect();

      console.log(JSON.stringify(summary, null, 2));
    }
  }
}

main().catch((error: unknown) => {
  const code =
    error !== null && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : null;

  console.error(
    'Import stopped. Check the input file, database connection and schema.',
    code ? `Code: ${code}` : '',
  );

  process.exitCode = 1;
});
