import { PrismaClient } from '../generated/prisma/client';
import { classifyCatalogItem } from '../src/modules/product-catalog/catalog-subcategories';

const BATCH_SIZE = 500;

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const apply = process.argv.includes('--apply');
  const totals = new Map<string, number>();
  let changed = 0;
  let cursor: string | undefined;

  try {
    for (;;) {
      const rows = await prisma.productCatalogItem.findMany({
        where: cursor ? { id: { gt: cursor } } : {},
        select: {
          id: true,
          name: true,
          category: true,
          externalRawData: true,
          department: true,
          subcategoryKey: true,
        },
        orderBy: { id: 'asc' },
        take: BATCH_SIZE,
      });
      if (rows.length === 0) break;
      cursor = rows[rows.length - 1].id;

      for (const row of rows) {
        const next = classifyCatalogItem(
          row.category,
          row.externalRawData,
          row.name,
        );
        const label = `${next.department}/${next.subcategoryKey ?? '-'}`;
        totals.set(label, (totals.get(label) ?? 0) + 1);
        if (
          next.department === row.department &&
          next.subcategoryKey === row.subcategoryKey
        ) {
          continue;
        }
        changed += 1;
        if (apply) {
          await prisma.productCatalogItem.update({
            where: { id: row.id },
            data: next,
          });
        }
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(apply ? 'Applied' : 'Dry run (use --apply to save)');
  console.log(`Rows to update: ${changed}`);
  console.log(Object.fromEntries([...totals].sort()));
}

void main();
