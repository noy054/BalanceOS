import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function readJson(path: string) {
  const content = await readFile(resolve(path), 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, ''));
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const positional = args.filter((argument) => argument !== '--apply');

  if (
    positional.length !== 2 ||
    positional.some((argument) => argument.startsWith('--'))
  ) {
    throw new Error(
      'Usage: import-approved-products.ts RESULTS_JSON APPROVED_JSON [--apply]',
    );
  }

  const engineUrl = pathToFileURL(
    resolve('scripts/enrich-catalog-all.mjs'),
  ).href;

  const engine = await new Function('url', 'return import(url)')(engineUrl);

  const input = await readJson('moh-all.json');
  const state = await readJson(positional[0]);
  const approved = await readJson(positional[1]);

  const fingerprint = engine.hash(input.items);

  if (
    fingerprint !== state.sourceFingerprint ||
    fingerprint !== approved.sourceFingerprint
  ) {
    throw new Error('Source fingerprint mismatch');
  }

  if (!Array.isArray(approved.items) || !approved.items.length) {
    throw new Error('No approved products');
  }

  const batchId = `moh-web-${new Date().toISOString().replace(/[:.]/g, '-')}`;

  const outputDirectory = resolve('import-results', batchId);

  await mkdir(outputDirectory, { recursive: true });

  const plan: any[] = [];
  const seen = new Set<string>();

  for (const choice of approved.items) {
    const source = input.items.find((item: any) => item.id === choice.targetId);

    const product = state.products.find(
      (item: any) => item.targetId === choice.targetId,
    );

    const candidate = product?.candidates.find(
      (item: any) => item.candidateId === choice.candidateId,
    );

    if (!source || !candidate) {
      throw new Error('Selection absent from source results');
    }

    const normalizedGtin14 = engine.gtin(candidate.barcode);

    if (
      !normalizedGtin14 ||
      !candidate.images.length ||
      !engine.webUrl(candidate.sourceUrl)
    ) {
      throw new Error('Invalid selected product');
    }

    if (seen.has(normalizedGtin14)) {
      throw new Error(
        `Barcode selected more than once: ${candidate.barcode}. Select one source food per product.`,
      );
    }

    seen.add(normalizedGtin14);

    const aliases = [
      ...new Set([
        normalizedGtin14,
        normalizedGtin14.replace(/^0+/, ''),
        normalizedGtin14.slice(1),
      ]),
    ];

    const matches = await prisma.productCatalogItem.findMany({
      where: {
        OR: [
          { normalizedBarcode: { in: aliases } },
          { barcode: { in: aliases } },
          { gtin: { in: aliases } },
        ],
      },
    });

    if (matches.length > 1) {
      throw new Error(`Multiple catalog records for ${candidate.barcode}`);
    }

    const existing = matches[0];

    if (
      existing?.archivedAt ||
      (existing && existing.nutritionBasis !== 'PER_100G')
    ) {
      throw new Error(
        `Archived item or incompatible nutrition basis: ${candidate.barcode}`,
      );
    }

    const selected = engine.selectNutrition(candidate, source);

    const complete = [
      'caloriesPer100g',
      'proteinPer100g',
      'carbsPer100g',
      'fatPer100g',
    ].every((field) => engine.number(selected.values[field]));

    if (!complete) {
      plan.push({
        status: 'SKIPPED_MISSING_NUTRITION',
        barcode: candidate.barcode,
        name: candidate.name,
      });

      continue;
    }

    const raw = engine.object(existing?.externalRawData);

    if (
      raw.mohLink?.externalId &&
      raw.mohLink.externalId !== source.externalId
    ) {
      throw new Error(`Conflicting existing MOH link: ${candidate.barcode}`);
    }

    const values: Record<string, number> = {};

    const fieldSources = {
      ...engine.object(raw.nutritionFieldSources),
    };

    for (const [field, value] of Object.entries(selected.values)) {
      const currentValue = (existing as any)?.[field];

      const replaceEstimate =
        engine.object(fieldSources[field]).estimated === true &&
        selected.sources[field].provider === 'PRODUCT_WEB';

      if (currentValue == null || replaceEstimate) {
        values[field] = value as number;
        fieldSources[field] = selected.sources[field];
      } else if (!fieldSources[field]) {
        fieldSources[field] = {
          provider: 'EXISTING_CATALOG_VALUE',
          verified: false,
        };
      }
    }

    const imageUrl = existing?.imageUrl || candidate.images[0];

    if (!engine.webUrl(imageUrl)) {
      throw new Error('Invalid image URL');
    }

    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(20000),
    });

    try {
      const contentType = response.headers.get('content-type')?.toLowerCase();

      if (!response.ok || !contentType?.startsWith('image/')) {
        throw new Error(`Image unavailable: ${candidate.barcode}`);
      }
    } finally {
      await response.body?.cancel();
    }

    const id = existing?.id ?? `web_product_${normalizedGtin14}`;

    const externalRawData = {
      ...raw,
      importBatchId: raw.importBatchId ?? batchId,
      importOperation: raw.importOperation ?? 'MOH_WEB_ENRICHMENT',
      enrichmentBatchId: batchId,
      importBatchHistory: [
        ...new Set([
          ...(Array.isArray(raw.importBatchHistory)
            ? raw.importBatchHistory
            : []),
          batchId,
        ]),
      ],
      identifiers: {
        ...engine.object(raw.identifiers),
        catalogId: id,
        barcode: candidate.barcode,
        normalizedGtin14,
        mohCatalogId: source.id,
        mohExternalId: source.externalId,
      },
      sourceUrl: raw.sourceUrl ?? candidate.sourceUrl,
      webEvidence: {
        sourceUrl: candidate.sourceUrl,
        candidateId: candidate.candidateId,
        retrievedAt: candidate.retrievedAt ?? null,
        imageUrls: candidate.images,
        barcode: candidate.barcode,
        webNutrition: candidate.webNutrition ?? {},
      },
      mohLink: {
        provider: 'ISRAEL_MOH',
        catalogId: source.id,
        externalId: source.externalId,
        name: source.name,
        genericFood: true,
        snapshot: source,
        datasetUrl: input.datasetUrl,
        resourceId: input.resourceId,
        downloadedAt: input.downloadedAt,
      },
      nutritionFieldSources: fieldSources,
      nutritionContainsEstimates: Object.values(fieldSources).some(
        (value: any) => value.estimated === true,
      ),
      nutritionNotice:
        'ערכים ממשרד הבריאות הם הערכה למזון כללי ואינם ערכי אריזה מאומתים',
      nutritionVerified: false,
      imageHttpChecked: true,
      imageAssociationReviewed: true,
      reviewedAt: new Date().toISOString(),
    };

    const data: any = {
      ...values,
      imageUrl,
      externalRawData,
    };

    if (!existing) {
      Object.assign(data, {
        id,
        barcode: candidate.barcode,
        gtin: candidate.barcode,
        normalizedBarcode:
          candidate.barcode.length <= 13
            ? candidate.barcode.padStart(13, '0')
            : normalizedGtin14,
        name: candidate.name,
        brand: candidate.brand || null,
        languageCode: 'he',
        countryCode: 'IL',
        nutritionBasis: 'PER_100G',
        source: 'INTERNAL',
        verificationStatus: 'AUTO_IMPORTED',
        externalProvider: 'MOH_WEB_ENRICHMENT',
        externalId: normalizedGtin14,
        originalData: {
          candidate,
          mohCatalogId: source.id,
          mohExternalId: source.externalId,
        },
      });
    }

    plan.push({
      status: apply ? 'PLANNED' : 'READY',
      id,
      name: existing?.name ?? candidate.name,
      barcode: candidate.barcode,
      before: existing ?? null,
      data,
    });
  }

  await writeFile(
    resolve(outputDirectory, 'plan-and-backup.json'),
    JSON.stringify(plan, null, 2),
    'utf8',
  );

  if (apply) {
    await prisma.$transaction(
      async (transaction) => {
        for (const item of plan.filter((entry) => entry.data)) {
          if (item.before) {
            const result = await transaction.productCatalogItem.updateMany({
              where: {
                id: item.id,
                updatedAt: item.before.updatedAt,
                archivedAt: null,
              },
              data: item.data,
            });

            if (result.count !== 1) {
              throw new Error(`Concurrent update: ${item.id}`);
            }
          } else {
            await transaction.productCatalogItem.create({
              data: item.data,
            });
          }
        }
      },
      { timeout: 120000 },
    );

    plan
      .filter((item) => item.data)
      .forEach((item) => {
        item.status = item.before ? 'UPDATED' : 'INSERTED';
      });
  }

  const report = plan.map(({ before, data, ...item }) => item);

  await writeFile(
    resolve(outputDirectory, 'report.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );

  console.table(report);

  console.log({
    mode: apply ? 'APPLY' : 'DRY_RUN',
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
