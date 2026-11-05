import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';

const apply = process.argv.includes('--apply');
const require = createRequire(import.meta.url);

require('ts-node/register');

const { PrismaClient } = require(resolve('generated/prisma/client'));
const prisma = new PrismaClient();

const batch = new Date().toISOString().replace(/[:.]/g, '-');
const out = resolve('import-results/foodsdictionary/cleanup', batch);

function departmentFor(name) {
  const n = name.toLowerCase();

  const rules = [
    ['SPORTS_NUTRITION', /אבקת חלבון|חטיף חלבון|משקה חלבון|גיינר|קריאטין/],
    [
      'SAUCES_OILS',
      /רוטב|פסטו|חרדל|קטשופ|מיונז|חומץ|שמן |שמן$|עמבה|טחינה גולמית|תבלין|פפריקה|כורכום|כמון|קינמון|אבקת שום|אבקת בצל|פלפל שחור|פלפל לבן|פלפל אנגלי|בזיליקום מיובש|שמיר מיובש|זרעי שבת|אורגנו|אגוז מוסקט|אבקת מרק|מלח |מלח$/,
    ],
    [
      'SNACKS_SWEETS',
      /שוקולד|עוגיות|עוגייה|עוגיה|ופל|וופל|חטיף|חטיפי|מרשמלו|סוכריות|סוכריה|סוכרייה|בייגלה|במבה|ביסלי|צ׳יפס|צ'יפס|chips|גרנולה קראנצ|halva|חלבה|חלווה/,
    ],
    [
      'BREAKFAST',
      /דגני בוקר|קורנפלקס|גרנולה|קוואקר|שיבולת שועל|oatmeal|quaker|nature valley/,
    ],
    [
      'BEVERAGES',
      /משקה|מיץ |נקטר|מים מינרליים|סודה לשתייה בבקבוק|קפה|תה ירוק|תה שחור|תה צמחים|קקאו לשתייה/,
    ],
    [
      'BAKERY',
      /תערובת ללחם|תערובת להכנת לחם|פירורי לחם|לחם|לחמני|לחמניי|פיתה|פיתות|באגט|טורטיי|מצה|מצות|קרקר|עוגה|עוגת |מאפה|בורקס|בצק|שמרים|אבקת אפייה|סודה לשתיה|סודה לשתייה/,
    ],
    [
      'SPREADS_CANNED',
      /שימורי|משומר|במי מלח|כבוש|מוחמץ|עגבניות מרוסקות|עגבניות חתוכות|רסק עגבניות|ממרח|חמאת בוטנים|חמאת שקדים|חמאת קשיו|ריבה|ריבת |דבש|סילאן|טחינה מוכנה|חומוס מוכן/,
    ],
    [
      'DAIRY_EGGS',
      /חלבון ביצה|חלמון ביצה|ביצה|ביצים|קוטג|גבינ|יוגורט|יוגורטים|לבן |אשל|שמנת|חמאה|חלב |חלב$|מעדן|מעדני|ללא חלב|מן הצומח/,
    ],
    [
      'MEAT_FISH',
      /עוף|הודו|בקר|עגל|טלה|כבש|בשר|שפונדרה|אנטריקוט|סינטה|כבד|נקניק|נקניקייה|נקניקיה|פסטרמה|סלמון|טונה|אמנון|מושט|בקלה|קרפיון|סרדין|שפרוט|דניס|לברק|הליבוט|מקרל|הרינג|דג |דגים/,
    ],
    [
      'GRAINS_LEGUMES',
      /קמח|קורנפלור|עמילן|אורז|פסטה|אטריות|איטריות|ספגטי|פוזילי|פנה |ריגטוני|לינגוינה|קונקילי|רדיאטורי|לזניה|קוסקוס|בורגול|קינואה|כוסמת|סולת|גריסים|דוחן|אמרנט|חיטה|שעורה|שיפון|שעועית|עדשים|חומוס|אפונה|פולי סויה|חלבון סויה|פול יבש|מאש|מש יבש|זרעי פשתן|זרעי צ'יה|זרעי צ׳יה/,
    ],
    [
      'PRODUCE',
      /אבוקדו|בננה|אבטיח|מלון|תפוח|אגס|אפרסק|נקטרינה|שזיף|משמש|דובדבן|תות|אוכמניות|פטל|ענב|מנגו|אננס|קיווי|פפאיה|תמר|תאנה|רימון|תפוז|קלמנטינה|אשכולית|פומלה|לימון|ליים|מלפפון|עגבני|פלפל|קולורבי|כרוב|חסה|תרד|מנגולד|ברוקולי|קישוא|זוקיני|חציל|גזר|סלק|צנון|צנונית|לפת|דלעת|דלורית|בטטה|בצל|שום|פטרי|סלרי|שומר|אספרגוס|ארטישוק|במיה|תירס|פטרוזיליה|כוסברה|שמיר|נענע|בזיליקום/,
    ],
  ];

  for (const [department, pattern] of rules) {
    if (pattern.test(n)) return department;
  }

  return null;
}

async function main() {
  await mkdir(out, { recursive: true });

  const products = await prisma.productCatalogItem.findMany({
    where: {
      externalProvider: 'FOODSDICTIONARY',
      source: 'INTERNAL',
      verificationStatus: 'AUTO_IMPORTED',
      id: { startsWith: 'fd_' },
    },
    include: {
      _count: {
        select: {
          pantryProducts: true,
          submissions: true,
        },
      },
    },
  });

  const owned = products.filter(
    (product) =>
      product.externalRawData &&
      typeof product.externalRawData === 'object' &&
      product.externalRawData.foodsdictionaryDigest,
  );

  await writeFile(
    join(out, 'backup.json'),
    JSON.stringify(owned, null, 2),
    'utf8',
  );

  const report = [];

  for (const product of owned) {
    let status;

    try {
      if (product.archivedAt) {
        status = 'ALREADY_ARCHIVED';
      } else if (!product.imageUrl?.trim()) {
        const linked =
          product._count.pantryProducts > 0 || product._count.submissions > 0;

        status = linked ? 'ARCHIVED_NO_IMAGE' : 'DELETED_NO_IMAGE';

        if (apply) {
          if (linked) {
            const result = await prisma.productCatalogItem.updateMany({
              where: {
                id: product.id,
                updatedAt: product.updatedAt,
                archivedAt: null,
              },
              data: { archivedAt: new Date() },
            });

            if (result.count !== 1) {
              throw new Error('Concurrent change; skipped');
            }
          } else {
            const result = await prisma.productCatalogItem.deleteMany({
              where: {
                id: product.id,
                updatedAt: product.updatedAt,
                archivedAt: null,
                pantryProducts: { none: {} },
                submissions: { none: {} },
              },
            });

            if (result.count !== 1) {
              throw new Error('Product changed or became linked; skipped');
            }
          }
        }
      } else {
        const department = departmentFor(product.name);

        if (!department) {
          report.push({
            id: product.id,
            name: product.name,
            status: 'CATEGORY_REVIEW',
            currentDepartment: product.department,
          });
          continue;
        }

        status =
          product.department === department
            ? 'UNCHANGED'
            : 'DEPARTMENT_UPDATED';

        if (apply && status === 'DEPARTMENT_UPDATED') {
          const result = await prisma.productCatalogItem.updateMany({
            where: {
              id: product.id,
              updatedAt: product.updatedAt,
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
          department,
          status: apply ? status : 'WOULD_' + status,
        });
        continue;
      }

      report.push({
        id: product.id,
        name: product.name,
        status: apply ? status : 'WOULD_' + status,
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

  console.table(report);

  const counts = {};

  for (const row of report) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  console.log({
    mode: apply ? 'APPLY' : 'DRY_RUN',
    importedProducts: owned.length,
    ...counts,
    outputDirectory: out,
  });
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
