import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '../generated/prisma/client';
import { subcategoryFor } from '../src/modules/product-catalog/catalog-subcategories';

const prisma = new PrismaClient();

const products = [
  {
    barcode: '835811007258',
    name: 'שעועית לבנה יבשה',
    brand: 'הנמל',
    department: 'GRAINS_LEGUMES',
    category: 'קטניות',
    subCategory: 'שעועית לבנה',
    packageWeightGrams: 500,
    imageUrl:
      'https://hahishook.com/wp-content/uploads/2023/06/%D7%A9%D7%A2%D7%95%D7%A2%D7%99%D7%AA-%D7%9C%D7%91%D7%A0%D7%94.jpg',
    sourceUrl: 'https://hahishook.com/product/שעועית-לבנה-500-גרם/',
  },
  {
    barcode: '835811007234',
    name: 'אפונה יבשה',
    brand: 'הנמל',
    department: 'GRAINS_LEGUMES',
    category: 'קטניות',
    subCategory: 'אפונה',
    packageWeightGrams: 500,
    imageUrl:
      'https://hahishook.com/wp-content/uploads/2023/06/%D7%90%D7%A4%D7%95%D7%A0%D7%94-%D7%94%D7%A0%D7%9E%D7%9C.jpg',
    sourceUrl: 'https://hahishook.com/product/אפונה/',
  },
  {
    barcode: '7290003060276',
    name: 'קמח חיטה לבן בהיר מנופה',
    brand: 'ישבר קמחים',
    department: 'GRAINS_LEGUMES',
    category: 'קמחים',
    subCategory: 'קמח חיטה לבן',
    packageWeightGrams: 1000,
    imageUrl:
      'https://hahishook.com/wp-content/uploads/2025/04/07d7e142f6546e5b19270e1a0161ca6a-1.png',
    sourceUrl: 'https://hahishook.com/product/קמח-חיטה-לבן-בהיר/',
  },
  {
    barcode: '7290003060283',
    name: 'קמח חיטה תופח מנופה',
    brand: 'ישבר קמחים',
    department: 'GRAINS_LEGUMES',
    category: 'קמחים',
    subCategory: 'קמח תופח',
    packageWeightGrams: 1000,
    imageUrl:
      'https://hahishook.com/wp-content/uploads/2025/04/%D7%AA%D7%95%D7%A4%D7%97.png',
    sourceUrl: 'https://hahishook.com/product/קמח-תופח/',
  },
];

function normalizeBarcode(barcode: string): string {
  if (!/^(\d{12}|\d{13})$/.test(barcode)) {
    throw new Error(`Unsupported barcode: ${barcode}`);
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
    throw new Error(`Invalid barcode: ${barcode}`);
  }

  return barcode.padStart(13, '0');
}

async function checkImage(url: string): Promise<void> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
  });

  try {
    if (!response.ok) {
      throw new Error(`Image HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error(`Unexpected image content type: ${contentType}`);
    }
  } finally {
    await response.body?.cancel();
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.some((argument) => argument !== '--apply')) {
    throw new Error('Supported option: --apply');
  }

  const apply = args.includes('--apply');
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDirectory = resolve('import-results', `first-products-${runId}`);

  await mkdir(outputDirectory, { recursive: true });

  const prepared: Array<{
    product: (typeof products)[number];
    normalizedBarcode: string;
    id: string;
  }> = [];

  for (const product of products) {
    const normalizedBarcode = normalizeBarcode(product.barcode);

    await checkImage(product.imageUrl);

    prepared.push({
      product,
      normalizedBarcode,
      id: `web_hahishook_${normalizedBarcode}`,
    });
  }

  const report: Array<Record<string, unknown>> = [];

  try {
    for (const item of prepared) {
      const { product, normalizedBarcode, id } = item;

      const aliases = [
        product.barcode,
        normalizedBarcode,
        product.barcode.padStart(14, '0'),
      ];

      const existing = await prisma.productCatalogItem.findFirst({
        where: {
          OR: [
            { id },
            { normalizedBarcode: { in: aliases } },
            { barcode: { in: aliases } },
            { gtin: { in: aliases } },
          ],
        },
        select: {
          id: true,
          name: true,
          archivedAt: true,
        },
      });

      if (existing) {
        report.push({
          barcode: product.barcode,
          name: product.name,
          status: 'SKIPPED_EXISTING',
          existingId: existing.id,
          existingName: existing.name,
        });

        continue;
      }

      if (!apply) {
        report.push({
          barcode: product.barcode,
          name: product.name,
          status: 'READY',
          imageUrl: product.imageUrl,
          nutritionComplete: false,
        });

        continue;
      }

      const result = await prisma.productCatalogItem.createMany({
        skipDuplicates: true,
        data: [
          {
            id,
            barcode: product.barcode,
            gtin: product.barcode,
            normalizedBarcode,
            name: product.name,
            brand: product.brand,
            department: product.department,
            subcategoryKey: subcategoryFor(product.department, product.name),
            category: product.category,
            subCategory: product.subCategory,
            languageCode: 'he',
            countryCode: 'IL',
            imageUrl: product.imageUrl,
            nutritionBasis: 'PER_100G',
            source: 'INTERNAL',
            verificationStatus: 'AUTO_IMPORTED',
            externalProvider: 'HAHISHOOK_WEB',
            externalId: product.barcode,
            originalData: {
              sourceUrl: product.sourceUrl,
              packageWeightGrams: product.packageWeightGrams,
              nutritionAvailable: false,
            },
            externalRawData: {
              sourceUrl: product.sourceUrl,
              imageUrl: product.imageUrl,
              barcode: product.barcode,
              packageWeightGrams: product.packageWeightGrams,
              importedAt: new Date().toISOString(),
              imageHttpChecked: true,
              imageVisualVerified: false,
              nutritionVerified: false,
            },
          },
        ],
      });

      report.push({
        barcode: product.barcode,
        name: product.name,
        status: result.count === 1 ? 'INSERTED' : 'SKIPPED_CONFLICT',
        id,
      });

      console.log(report.at(-1));
    }
  } finally {
    await writeFile(
      resolve(outputDirectory, 'report.json'),
      JSON.stringify(
        {
          mode: apply ? 'APPLY' : 'DRY_RUN',
          products: report,
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  console.table(report);

  console.log({
    mode: apply ? 'APPLY' : 'DRY_RUN',
    inserted: report.filter((row) => row.status === 'INSERTED').length,
    ready: report.filter((row) => row.status === 'READY').length,
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
