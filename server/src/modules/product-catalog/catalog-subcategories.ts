import {
  CatalogDepartment,
  categoryTagsFrom,
  departmentFor,
  matchesWord,
  tokens,
} from './catalog-departments';

export type CatalogSubcategory = {
  key: string;
  words: string[];
};

export const CATALOG_SUBCATEGORIES: Partial<
  Record<CatalogDepartment, CatalogSubcategory[]>
> = {
  DAIRY_EGGS: [
    {
      key: 'YOGURT',
      words: ['יוגורט*', 'סקי', 'מעדן*', 'yogurt*', 'yoghurt*', 'skyr'],
    },
    {
      key: 'MILK',
      words: ['חלב', 'משקה חלב', 'milk'],
    },
    {
      key: 'EGGS',
      words: ['ביצה', 'ביצים', 'egg', 'eggs'],
    },
    {
      key: 'CHEESE',
      words: [
        'גבינ*',
        'קוטג*',
        'לבנה',
        'בולגרית',
        'מוצרלה',
        'צפתית',
        'cheese*',
        'cottage',
      ],
    },
    {
      key: 'BUTTER_CREAM',
      words: ['חמאה', 'שמנת', 'butter', 'cream'],
    },
  ],
  MEAT_FISH: [
    {
      key: 'CHICKEN',
      words: ['עוף', 'פרגית', 'חזה', 'כרעיים', 'שניצל', 'chicken'],
    },
    {
      key: 'BEEF',
      words: ['בקר', 'טחון', 'סטייק', 'אנטריקוט', 'beef'],
    },
    {
      key: 'TURKEY',
      words: ['הודו', 'turkey'],
    },
    {
      key: 'FISH',
      words: ['דג', 'דגים', 'טונה', 'סלמון', 'אמנון', 'fish', 'tuna', 'salmon'],
    },
    {
      key: 'DELI',
      words: ['נקניק*', 'פסטרמה', 'סלמי', 'salami', 'ham', 'sausage*'],
    },
  ],
  PRODUCE: [
    {
      key: 'VEGETABLES',
      words: [
        'עגבני*',
        'מלפפון*',
        'פלפל*',
        'גזר',
        'בצל',
        'חסה',
        'ברוקולי',
        'כרוב',
        'תפוח אדמה',
        'תפוחי אדמה',
        'בטטה',
        'ירקות',
        'tomato*',
        'cucumber*',
        'carrot*',
        'broccoli',
        'potato*',
        'vegetable*',
      ],
    },
    {
      key: 'FRUITS',
      words: [
        'תפוח',
        'תפוחים',
        'בננה',
        'בננות',
        'תפוז*',
        'ענב*',
        'אבטיח',
        'מנגו',
        'תות*',
        'אגס*',
        'פירות',
        'apple*',
        'banana*',
        'orange*',
        'grape*',
        'berr*',
        'fruit*',
      ],
    },
    {
      key: 'NUTS_DRIED',
      words: [
        'אגוז*',
        'שקד*',
        'קשיו',
        'בוטנ*',
        'צימוק*',
        'תמר',
        'תמרים',
        'nut',
        'nuts',
        'almond*',
        'cashew*',
        'raisin*',
        'date',
        'dates',
      ],
    },
  ],
  BAKERY: [
    {
      key: 'BREAD',
      words: ['לחם', 'bread'],
    },
    {
      key: 'PITA_WRAPS',
      words: ['פיתה', 'פיתות', 'טורטי*', 'לאפה', 'pita*', 'tortilla*', 'wrap*'],
    },
    {
      key: 'ROLLS',
      words: ['לחמני*', 'בייגל*', 'bagel*', 'roll', 'rolls', 'bun', 'buns'],
    },
    {
      key: 'PASTRIES',
      words: [
        'עוגה',
        'עוגת',
        'עוגות',
        'מאפה',
        'מאפים',
        'קרואסון*',
        'cake*',
        'croissant*',
        'pastry',
        'pastries',
      ],
    },
  ],
  BREAKFAST: [
    {
      key: 'CEREAL',
      words: ['קורנפלקס', 'דגני', 'cereal*', 'flakes'],
    },
    {
      key: 'GRANOLA',
      words: ['גרנולה', 'מוזלי', 'granola', 'muesli'],
    },
    {
      key: 'OATS',
      words: ['שיבולת', 'oat', 'oats'],
    },
  ],
  GRAINS_LEGUMES: [
    {
      key: 'RICE',
      words: ['אורז', 'rice'],
    },
    {
      key: 'PASTA',
      words: ['פסטה', 'ספגטי', 'פתיתים', 'פנה', 'pasta', 'spaghetti', 'penne'],
    },
    {
      key: 'LEGUMES',
      words: [
        'עדש*',
        'שעועית',
        'חומוס',
        'גרגרי*',
        'אפונה',
        'lentil*',
        'bean*',
        'chickpea*',
      ],
    },
    {
      key: 'GRAINS',
      words: [
        'קינואה',
        'בורגול',
        'קוסקוס',
        'כוסמין',
        'שיבולת',
        'quinoa',
        'bulgur',
        'couscous',
        'oat',
        'oats',
      ],
    },
    {
      key: 'FLOUR',
      words: ['קמח', 'flour'],
    },
  ],
  SNACKS_SWEETS: [
    {
      key: 'CHOCOLATE',
      words: ['שוקולד', 'chocolate*'],
    },
    {
      key: 'SALTY',
      words: [
        'ביסלי',
        'במבה',
        "צ'יפס",
        'צ׳יפס',
        'פרצל*',
        'קרקר*',
        'chips',
        'pretzel*',
        'cracker*',
      ],
    },
    {
      key: 'COOKIES',
      words: ['עוגי*', 'ביסקוו*', 'ופל*', 'cookie*', 'biscuit*', 'wafer*'],
    },
    {
      key: 'BARS',
      words: ['חטיף*', 'bar', 'bars'],
    },
    {
      key: 'CANDY',
      words: ['ממתק*', 'סוכרי*', 'גומי', 'candy', 'candies', 'gum'],
    },
  ],
  SPREADS_CANNED: [
    {
      key: 'SWEET',
      words: ['ריבה', 'ריבת', 'דבש', 'jam', 'honey'],
    },
    {
      key: 'NUT_BUTTERS',
      words: ['חמאת בוטנים', 'טחינה', 'peanut butter', 'tahini'],
    },
    {
      key: 'SAVORY',
      words: ['חומוס', 'מטבוחה', 'חציל*', 'hummus', 'salad*'],
    },
    {
      key: 'CANNED',
      words: ['שימורי*', 'טונה', 'תירס', 'canned', 'tuna', 'corn'],
    },
  ],
  SAUCES_OILS: [
    {
      key: 'OILS',
      words: ['שמן', 'oil', 'oils'],
    },
    {
      key: 'SAUCES',
      words: [
        'רוטב',
        'קטשופ',
        'מיונז',
        'חרדל',
        'sauce*',
        'ketchup',
        'mayo*',
        'mustard',
      ],
    },
    {
      key: 'SPICES',
      words: ['תבלין*', 'מלח', 'פפריקה', 'פלפל', 'spice*', 'salt', 'pepper'],
    },
    {
      key: 'VINEGAR',
      words: ['חומץ', 'vinegar'],
    },
  ],
  FROZEN: [
    {
      key: 'ICE_CREAM',
      words: ['גלידה', 'גלידת', 'שלגון*', 'ice cream', 'sorbet'],
    },
    {
      key: 'VEGETABLES',
      words: ['ירקות', 'אפונה', 'שעועית', 'תירס', 'vegetable*', 'peas'],
    },
    {
      key: 'MEALS',
      words: ['פיצה', 'בורקס', 'שניצל', 'מלאווח', 'pizza*', 'meal', 'meals'],
    },
  ],
  BEVERAGES: [
    {
      key: 'WATER',
      words: ['מים', 'סודה', 'water', 'soda'],
    },
    {
      key: 'JUICE',
      words: ['מיץ', 'נקטר', 'juice*', 'nectar'],
    },
    {
      key: 'SOFT_DRINKS',
      words: ['קולה', 'ספרייט', 'פאנטה', 'cola', 'sprite', 'fanta'],
    },
    {
      key: 'COFFEE_TEA',
      words: ['קפה', 'תה', 'coffee', 'tea'],
    },
    {
      key: 'PLANT_DRINKS',
      words: [
        'משקה סויה',
        'משקה שקדים',
        'משקה שיבולת',
        'soy drink',
        'almond drink',
        'oat drink',
      ],
    },
  ],
  SPORTS_NUTRITION: [
    {
      key: 'POWDERS',
      words: ['אבקה', 'אבקת', 'איזולייט', 'whey', 'powder', 'isolate'],
    },
    {
      key: 'BARS',
      words: ['חטיף*', 'bar', 'bars'],
    },
    {
      key: 'DRINKS',
      words: ['משקה', 'שייק', 'shake', 'drink'],
    },
  ],
};

export function subcategoriesFor(
  department: CatalogDepartment,
): CatalogSubcategory[] {
  return CATALOG_SUBCATEGORIES[department] ?? [];
}

export function findSubcategory(
  department: CatalogDepartment,
  key: string,
): CatalogSubcategory | null {
  return (
    subcategoriesFor(department).find((entry) => entry.key === key) ?? null
  );
}

const PLAIN_WORD = /^[\p{L}\p{N}]+\*?$/u;

export function subcategoryFor(
  department: string | null | undefined,
  name: string,
): string | null {
  const entries = department
    ? subcategoriesFor(department as CatalogDepartment)
    : [];
  if (entries.length === 0) return null;
  const lowered = name.toLocaleLowerCase();
  const nameTokens = tokens(name);
  const byPhrase = entries.find((entry) =>
    entry.words.some(
      (word) => !PLAIN_WORD.test(word) && lowered.includes(word),
    ),
  );
  if (byPhrase) return byPhrase.key;
  const byWord = entries.find((entry) =>
    entry.words.some((word) => matchesWord(lowered, nameTokens, word)),
  );
  return byWord?.key ?? null;
}

export function classifyCatalogItem(
  category: string | readonly string[] | null | undefined,
  rawData: unknown,
  name: string,
): { department: CatalogDepartment; subcategoryKey: string | null } {
  const tags = Array.isArray(category)
    ? (category as readonly string[])
    : categoryTagsFrom(category as string | null | undefined, rawData);
  const department = departmentFor(tags, name);
  return { department, subcategoryKey: subcategoryFor(department, name) };
}
