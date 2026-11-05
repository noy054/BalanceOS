import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const apply = process.argv.includes('--apply');
const inputPath = resolve('import-results/foodsdictionary/products.json');
const batch = new Date().toISOString().replace(/[:.]/g, '-');
const out = resolve('import-results/foodsdictionary/imports', batch);

const fields = [
  'caloriesPer100g',
  'proteinPer100g',
  'carbsPer100g',
  'fatPer100g',
  'fiberPer100g',
  'sugarPer100g',
  'saturatedFatPer100g',
  'sodiumPer100g',
];

const core = fields.slice(0, 4);

const hash = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

const object = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

function canonical(value) {
  const u = new URL(value);

  if (
    u.origin !== 'https://www.foodsdictionary.co.il' ||
    !/^\/Products\/\d+\/[^/]+\/?$/i.test(u.pathname)
  ) {
    throw new Error('Invalid source URL');
  }

  return (
    u.origin +
    u.pathname
      .replace(/\/$/, '')
      .split('/')
      .map((segment) =>
        encodeURIComponent(
          decodeURIComponent(segment.replace(/\+/g, '%20')).normalize('NFC'),
        ),
      )
      .join('/')
  );
}

function imageUrl(value) {
  if (!value) return null;

  const u = new URL(value);

  const host =
    /^(?:[a-z0-9-]+\.)*foodsd\.co\.il$/i.test(u.hostname) ||
    /^(?:[a-z0-9-]+\.)*foodsdictionary\.co\.il$/i.test(u.hostname) ||
    (u.hostname === 'storage.googleapis.com' &&
      /^\/st\d+\.foodsd\.co\.il\//i.test(u.pathname));

  if (
    u.protocol !== 'https:' ||
    u.username ||
    u.password ||
    !host ||
    !/\/(?:images\/)?products?\//i.test(u.pathname) ||
    /logo|trigger|recipe|banner|placeholder|default/i.test(u.pathname)
  ) {
    throw new Error('Invalid product image URL');
  }

  return u.href;
}

function prepare(product) {
  if (
    product.provider !== 'FOODSDICTIONARY' ||
    product.nutritionBasis !== 'PER_100G' ||
    typeof product.name !== 'string' ||
    !product.name.trim()
  ) {
    throw new Error('Invalid product or nutrition basis');
  }

  const nutrition = {};

  for (const field of fields) {
    const value = product[field];

    if (value == null) continue;

    const max =
      field === 'caloriesPer100g'
        ? 1000
        : field === 'sodiumPer100g'
          ? 100000
          : 100;

    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > max
    ) {
      throw new Error('Invalid nutrient: ' + field);
    }

    nutrition[field] = value;
  }

  if (!core.every((field) => Object.hasOwn(nutrition, field))) {
    throw new Error('Missing core nutrition');
  }

  return {
    sourceUrl: canonical(product.sourceUrl),
    name: product.name.trim(),
    manufacturer: product.manufacturer || null,
    imageUrl: imageUrl(product.imageUrl),
    nutrition,
    snapshot: product,
  };
}

async function main() {
  const input = JSON.parse(
    (await readFile(inputPath, 'utf8')).replace(/^\uFEFF/, ''),
  );

  if (!Array.isArray(input.products)) {
    throw new Error('Expected products array');
  }

  await mkdir(out, { recursive: true });

  const report = [];
  const groups = new Map();

  for (const product of input.products) {
    try {
      const item = prepare(product);

      if (!groups.has(item.sourceUrl)) {
        groups.set(item.sourceUrl, []);
      }

      groups.get(item.sourceUrl).push(item);
    } catch (error) {
      report.push({
        name: product.name,
        status: 'INVALID',
        error: error.message,
      });
    }
  }

  const ready = [];
  let duplicatesRemoved = 0;

  for (const items of groups.values()) {
    const signatures = new Set(
      items.map((item) =>
        hash({
          name: item.name,
          manufacturer: item.manufacturer,
          nutrition: item.nutrition,
        }),
      ),
    );

    const images = [
      ...new Set(items.map((item) => item.imageUrl).filter(Boolean)),
    ];

    if (signatures.size !== 1 || images.length > 1) {
      report.push({
        name: items[0].name,
        sourceUrl: items[0].sourceUrl,
        status: 'SOURCE_CONFLICT',
      });
      continue;
    }

    duplicatesRemoved += items.length - 1;

    ready.push({
      ...items[0],
      imageUrl: images[0] ?? null,
      sourceAliases: [...new Set(items.map((item) => item.snapshot.sourceUrl))],
    });
  }

  const require = createRequire(import.meta.url);
  require('ts-node/register');

  const { PrismaClient } = require(resolve('generated/prisma/client'));
  const prisma = new PrismaClient();

  try {
    for (const item of ready.filter(item => Boolean(item.imageUrl))) {
      try {
        const id = 'fd_' + hash(item.sourceUrl).slice(0, 32);

        const found = await prisma.productCatalogItem.findMany({
          where: {
            OR: [
              { id },
              {
                externalProvider: 'FOODSDICTIONARY',
                externalId: {
                  in: [item.sourceUrl, ...item.sourceAliases],
                },
              },
            ],
          },
        });

        if (found.length > 1) {
          throw new Error('Multiple existing source records');
        }

        const before = found[0];

        if (
          before?.archivedAt ||
          before?.verificationStatus === 'ADMIN_VERIFIED' ||
          (before && before.nutritionBasis !== 'PER_100G')
        ) {
          report.push({
            name: item.name,
            status: 'PROTECTED_EXISTING',
          });
          continue;
        }

        if (before && before.externalProvider !== 'FOODSDICTIONARY') {
          throw new Error('Existing ID belongs to another source');
        }

        const sameName = await prisma.productCatalogItem.findFirst({
          where: {
            name: { equals: item.name, mode: 'insensitive' },
            ...(before ? { id: { not: before.id } } : {}),
          },
          select: { id: true },
        });

        if (sameName) {
          report.push({
            name: item.name,
            status: 'EXISTING_NAME_REVIEW',
            existingId: sameName.id,
          });
          continue;
        }

        const raw = object(before?.externalRawData);
        const values = {};
        const provenance = {
          ...object(raw.nutritionFieldSources),
        };

        for (const [field, value] of Object.entries(item.nutrition)) {
          if (before?.[field] == null) {
            values[field] = value;
            provenance[field] = {
              provider: 'FOODSDICTIONARY',
              sourceUrl: item.sourceUrl,
              estimated: false,
              independentlyVerified: false,
            };
          }
        }

        const selectedImage = before?.imageUrl || item.imageUrl;

        const digest = hash({
          sourceUrl: item.sourceUrl,
          name: item.name,
          manufacturer: item.manufacturer,
          imageUrl: item.imageUrl,
          nutrition: item.nutrition,
        });

        if (before && raw.foodsdictionaryDigest === digest) {
          report.push({
            name: item.name,
            id: before.id,
            status: 'UNCHANGED',
          });
          continue;
        }

        const data = {
          ...values,
          imageUrl: selectedImage,
          externalRawData: {
            ...raw,
            foodsdictionaryDigest: digest,
            foodsdictionary: {
              sourceUrl: item.sourceUrl,
              sourceAliases: item.sourceAliases,
              snapshot: item.snapshot,
              importBatch: batch,
            },
            nutritionFieldSources: provenance,
            nutritionVerified: false,
          },
        };

        if (apply) {
          await writeFile(
            join(out, id + '-backup.json'),
            JSON.stringify(
              {
                before: before ?? null,
                proposed: data,
                product: item,
              },
              null,
              2,
            ),
            'utf8',
          );

          if (before) {
            const result = await prisma.productCatalogItem.updateMany({
              where: {
                id: before.id,
                updatedAt: before.updatedAt,
                archivedAt: null,
              },
              data,
            });

            if (result.count !== 1) {
              throw new Error('Concurrent change; item skipped');
            }
          } else {
            await prisma.productCatalogItem.create({
              data: {
                id,
                name: item.name,
                manufacturer: item.manufacturer,
                barcode: null,
                gtin: null,
                normalizedBarcode: null,
                department: 'OTHER',
                countryCode: 'IL',
                languageCode: 'he',
                nutritionBasis: 'PER_100G',
                source: 'INTERNAL',
                verificationStatus: 'AUTO_IMPORTED',
                externalProvider: 'FOODSDICTIONARY',
                externalId: item.sourceUrl,
                originalData: item.snapshot,
                ...data,
              },
            });
          }
        }

        report.push({
          name: item.name,
          id: before?.id ?? id,
          hasImage: Boolean(selectedImage),
          status: apply
            ? before
              ? 'UPDATED'
              : 'INSERTED'
            : before
              ? 'WOULD_UPDATE'
              : 'WOULD_INSERT',
        });
      } catch (error) {
        report.push({
          name: item.name,
          status: 'ERROR',
          error: error.message,
        });
      }

      await writeFile(
        join(out, 'report.json'),
        JSON.stringify(report, null, 2),
        'utf8',
      );
    }
  } finally {
    await prisma.$disconnect();

    await writeFile(
      join(out, 'report.json'),
      JSON.stringify(report, null, 2),
      'utf8',
    );
  }

  const counts = {};

  for (const row of report) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  console.table(report);

  console.log({
    mode: apply ? 'APPLY' : 'DRY_RUN',
    inputProducts: input.products.length,
    duplicatesRemoved,
    ...counts,
    outputDirectory: out,
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
