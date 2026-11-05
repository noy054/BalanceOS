import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require('ts-node/register');

const { PrismaClient } = require(resolve('generated/prisma/client'));
const prisma = new PrismaClient();

const apply = process.argv.includes('--apply');
const batch = new Date().toISOString().replace(/[:.]/g, '-');
const out = resolve('import-results/foodsdictionary/department-fixes', batch);

const groups = {
  PRODUCE: [
    'שסק',
    'גויאבה',
    'אפרסמון',
    'מנדרינה',
    'דובדבנים מתוקים',
    'דובדבנים חמוצים',
    'כרישה מבושלת',
    'כרישה טריה',
    'צימוקים',
    'קרמבולה',
    'תאנים מיובשות',
    'סברס - צבר',
    'ליצ`י',
    'תאנים טריות',
    'קוקוס',
    'קוקוס מיובש מתוק',
    'חזרת',
    'כרוב לבן טרי',
    'כרוב לבן מבושל',
    'גזר לבן (פארסניפ) טרי',
    'דלורית אפויה ללא מלח',
    'דלעת אפויה עם מלח',
    'שעועית ירוקה טריה',
    'שעועית ירוקה מבושלת ללא מלח',
    'שעועית צהובה',
    'שעועית צהובה מבושלת ללא מלח',
    'ג`ינג`ר כתוש, דורות',
  ],

  DAIRY_EGGS: [
    'ביצי ברווז',
    'ביצי אווז',
    'ביצי שלו',
    'ביצי הודו',
    'צפתית 5% שומן, מחלבות גד',
    'חלומי, מחלבות גד',
    'פטה כבשים, מחלבות גד',
    'יוגורט כבשים 5% בתוספת גרנולה ודבש, מחלבות גד',
  ],

  MEAT_FISH: [
    'אנשובי אירופאי',
    'בס מבושל-מיובש בחום',
    'פורל מבושל - מיובש בחום',
  ],

  SPREADS_CANNED: ['אנשובי אירופאי משומר בשמן'],

  SNACKS_SWEETS: [
    'שקדים',
    'שקדים קלויים מיובשים',
    'גרעיני חמנייה קלויים',
    'גרעיני חמנייה קלויים עם מלח',
    'גרעיני דלעת קלויים',
    'גרעיני אבטיח מיובשים',
    'ערמונים אירופאים קלויים',
    'פיסטוק חלבי',
    'אגוזי קשיו קלויים מיובשים',
    'בוטנים',
    'בוטנים קלויים',
    'בוטנים קלויים עם מלח',
    'פקאנים',
    'אגוזי לוז',
    'אגוזי קשיו',
    'אגוזי מלך',
    'ערמונים אירופאים מקולפים',
    'ערמונים אירופאים מיובשים-מקולפים',
    'ערמונים אירופאים מבושלים-מורתחים',
    'פיסטוק חלבי קלוי-מיובש',
    'אגוזי לוז מיובשים - קלויים',
    'חלוה',
  ],

  BAKERY: [
    'סוכר לבן',
    'סוכר חום',
    'אבקת סוכר',
    'שבעה דגנים קל, מאפיית אנג`ל',
    'חלה פרוסה רגילה, דגנית עין בר',
    'חלה מתוקה, מאפיית אנג`ל',
  ],

  GRAINS_LEGUMES: [
    'קמח שיבולת שועל',
    'שעועית לבנה מבושלת ללא מלח',
    'פול מבושל ללא מלח',
    'גרגירי חומוס מבושלים ללא מלח',
    'פלאפל',
  ],

  SAUCES_OILS: [
    'טחינה גלילית משובחת - תיבול ים תיכוני, הנסיך',
    'טחינה גלילית משובחת - טחינה אורגנית, הנסיך',
    'טחינה גלילית משובחת - שומשום מלא, הנסיך',
    'טחינה גלילית משובחת - שומשום טהור, הנסיך',
    'זרעי סלרי',
    'זרעי שומר',
    'זרעי כוסברה',
    'פטרוזיליה מיובשת',
    'כוסברה מיובשת',
  ],
};

const mapping = new Map();

for (const [department, names] of Object.entries(groups)) {
  for (const name of names) {
    if (mapping.has(name)) {
      throw new Error('Duplicate classification: ' + name);
    }

    mapping.set(name, department);
  }
}

async function main() {
  await mkdir(out, { recursive: true });

  const products = await prisma.productCatalogItem.findMany({
    where: {
      externalProvider: 'FOODSDICTIONARY',
      source: 'INTERNAL',
      verificationStatus: 'AUTO_IMPORTED',
      id: { startsWith: 'fd_' },
      archivedAt: null,
      name: { in: [...mapping.keys()] },
    },
  });

  const selected = products.filter(
    (product) =>
      product.imageUrl?.trim() &&
      product.externalRawData &&
      typeof product.externalRawData === 'object' &&
      product.externalRawData.foodsdictionaryDigest,
  );

  await writeFile(
    join(out, 'backup.json'),
    JSON.stringify(selected, null, 2),
    'utf8',
  );

  const report = [];

  for (const product of selected) {
    const department = mapping.get(product.name);

    if (product.department === department) {
      report.push({
        name: product.name,
        department,
        status: 'UNCHANGED',
      });
      continue;
    }

    try {
      if (apply) {
        const result = await prisma.productCatalogItem.updateMany({
          where: {
            id: product.id,
            updatedAt: product.updatedAt,
            externalProvider: 'FOODSDICTIONARY',
            verificationStatus: 'AUTO_IMPORTED',
            archivedAt: null,
          },
          data: { department },
        });

        if (result.count !== 1) {
          throw new Error('Concurrent change; skipped');
        }
      }

      report.push({
        id: product.id,
        name: product.name,
        previousDepartment: product.department,
        department,
        status: apply ? 'UPDATED' : 'WOULD_UPDATE',
      });
    } catch (error) {
      report.push({
        id: product.id,
        name: product.name,
        status: 'ERROR',
        error: error.message,
      });
    }
  }

  await writeFile(
    join(out, 'report.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );

  const remaining = await prisma.productCatalogItem.findMany({
    where: {
      externalProvider: 'FOODSDICTIONARY',
      source: 'INTERNAL',
      verificationStatus: 'AUTO_IMPORTED',
      archivedAt: null,
      department: 'OTHER',
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  console.table(report);

  console.log({
    mode: apply ? 'APPLY' : 'DRY_RUN',
    updated: report.filter((r) => r.status === 'UPDATED').length,
    wouldUpdate: report.filter((r) => r.status === 'WOULD_UPDATE').length,
    unchanged: report.filter((r) => r.status === 'UNCHANGED').length,
    errors: report.filter((r) => r.status === 'ERROR').length,
    remainingOtherWithImage: remaining.filter((p) => p.imageUrl?.trim()).length,
    outputDirectory: out,
  });
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
