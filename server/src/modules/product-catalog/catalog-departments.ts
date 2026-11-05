export const CATALOG_DEPARTMENTS = [
  'DAIRY_EGGS',
  'MEAT_FISH',
  'PRODUCE',
  'BAKERY',
  'BREAKFAST',
  'GRAINS_LEGUMES',
  'SNACKS_SWEETS',
  'SPREADS_CANNED',
  'SAUCES_OILS',
  'FROZEN',
  'BEVERAGES',
  'SPORTS_NUTRITION',
  'OTHER',
] as const;

export type CatalogDepartment = (typeof CATALOG_DEPARTMENTS)[number];

type DepartmentRule = {
  department: CatalogDepartment;
  tags: string[];
  words: string[];
};

const RULES: DepartmentRule[] = [
  {
    department: 'SPORTS_NUTRITION',
    tags: [
      'en:dietary-supplements',
      'en:protein-powders',
      'en:bodybuilding-supplements',
      'en:sports-nutrition',
      'en:protein-bars',
    ],
    words: [
      'whey',
      'protein powder',
      'protein bar',
      'אבקת חלבון',
      'חטיף חלבון',
    ],
  },
  {
    department: 'FROZEN',
    tags: ['en:frozen-foods', 'en:ice-creams', 'en:frozen-desserts'],
    words: ['frozen', 'ice cream', 'קפוא*', 'גלידה', 'גלידת'],
  },
  {
    department: 'DAIRY_EGGS',
    tags: [
      'en:dairies',
      'en:milks',
      'en:yogurts',
      'en:cheeses',
      'en:eggs',
      'en:butters',
      'en:creams',
      'en:fermented-milk-products',
      'en:dairy-desserts',
      'en:plant-based-milk-alternatives',
    ],
    words: [
      'milk',
      'yogurt*',
      'yoghurt*',
      'cheese*',
      'skyr',
      'egg',
      'eggs',
      'butter',
      'cream',
      'חלב',
      'יוגורט*',
      'גבינ*',
      'ביצה',
      'ביצים',
      'חמאה',
      'שמנת',
      'קוטג*',
      'לבנה',
      'מעדן',
      'סקי',
    ],
  },
  {
    department: 'MEAT_FISH',
    tags: [
      'en:meats',
      'en:poultries',
      'en:fishes',
      'en:seafood',
      'en:sausages',
      'en:hams',
      'en:meat-based-products',
    ],
    words: [
      'chicken',
      'beef',
      'turkey',
      'fish',
      'tuna',
      'salmon',
      'עוף',
      'בקר',
      'הודו',
      'דג',
      'דגים',
      'טונה',
      'סלמון',
      'נקניק*',
      'שניצל*',
      'קבב',
    ],
  },
  {
    department: 'BEVERAGES',
    tags: [
      'en:beverages',
      'en:waters',
      'en:juices',
      'en:sodas',
      'en:carbonated-drinks',
      'en:coffees',
      'en:teas',
    ],
    words: [
      'water',
      'juice',
      'cola',
      'soda',
      'coffee',
      'tea',
      'drink',
      'מים',
      'מיץ',
      'קולה',
      'סודה',
      'קפה',
      'תה',
      'משקה',
    ],
  },
  {
    department: 'BREAKFAST',
    tags: ['en:breakfast-cereals', 'en:mueslis', 'en:granolas'],
    words: [
      'granola',
      'muesli',
      'cornflakes',
      'cereal',
      'גרנולה',
      'מוזלי',
      'קורנפלקס',
      'דגני בוקר',
    ],
  },
  {
    department: 'BAKERY',
    tags: ['en:breads', 'en:pastries', 'en:cakes', 'en:viennoiseries'],
    words: [
      'bread',
      'pita',
      'bagel',
      'tortilla*',
      'לחם',
      'פיתה',
      'פיתות',
      'לחמני*',
      'בייגל*',
      'מאפה',
      'עוגה',
      'עוגת',
      'טורטי*',
    ],
  },
  {
    department: 'SNACKS_SWEETS',
    tags: [
      'en:snacks',
      'en:sweet-snacks',
      'en:salty-snacks',
      'en:chocolates',
      'en:candies',
      'en:confectioneries',
      'en:biscuits',
      'en:cookies',
      'en:crisps',
      'en:chips-and-fries',
    ],
    words: [
      'chocolate',
      'candy',
      'chips',
      'snack*',
      'cookie*',
      'biscuit*',
      'wafer*',
      'halva',
      'שוקולד',
      'ממתק*',
      'חטיף*',
      'ביסלי',
      'במבה',
      'עוגיות',
      'ופל*',
      'חלווה',
    ],
  },
  {
    department: 'SPREADS_CANNED',
    tags: [
      'en:spreads',
      'en:canned-foods',
      'en:jams',
      'en:honeys',
      'en:nut-butters',
      'en:hummus',
      'en:pickles',
    ],
    words: [
      'peanut butter',
      'jam',
      'honey',
      'hummus',
      'tahini',
      'חמאת בוטנים',
      'ריבה',
      'ריבת',
      'דבש',
      'חומוס',
      'טחינה',
      'ממרח*',
      'שימורי*',
    ],
  },
  {
    department: 'SAUCES_OILS',
    tags: [
      'en:condiments',
      'en:sauces',
      'en:vegetable-oils',
      'en:oils',
      'en:spices',
      'en:vinegars',
      'en:salts',
    ],
    words: [
      'sauce',
      'ketchup',
      'mayonnaise',
      'oil',
      'vinegar',
      'רוטב',
      'קטשופ',
      'מיונז',
      'שמן',
      'תבלין*',
      'חומץ',
      'מלח',
    ],
  },
  {
    department: 'GRAINS_LEGUMES',
    tags: [
      'en:pastas',
      'en:rices',
      'en:cereal-grains',
      'en:legumes',
      'en:flours',
      'en:couscous',
    ],
    words: [
      'pasta',
      'rice',
      'spaghetti',
      'quinoa',
      'lentils',
      'beans',
      'flour',
      'oats',
      'couscous',
      'פסטה',
      'אורז',
      'ספגטי',
      'קינואה',
      'עדשים',
      'שעועית',
      'קמח',
      'שיבולת',
      'קוסקוס',
      'פתיתים',
    ],
  },
  {
    department: 'PRODUCE',
    tags: [
      'en:fruits',
      'en:vegetables',
      'en:fresh-fruits',
      'en:fresh-vegetables',
      'en:dried-fruits',
      'en:nuts',
    ],
    words: [
      'apple',
      'banana',
      'tomato*',
      'cucumber*',
      'almond*',
      'nuts',
      'תפוח*',
      'בננה',
      'עגבני*',
      'מלפפון',
      'שקדים',
      'אגוזי*',
      'ירקות',
      'פירות',
    ],
  },
];

export function tokens(name: string): string[] {
  return name
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function matchesWord(name: string, nameTokens: string[], word: string) {
  if (word.includes(' ')) return name.includes(word);
  if (word.endsWith('*')) {
    const stem = word.slice(0, -1);
    return nameTokens.some((token) => token.startsWith(stem));
  }
  return nameTokens.includes(word);
}

export function categoryTagsFrom(
  category: string | null | undefined,
  rawData: unknown,
): string[] {
  const fromColumn = (category ?? '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  const rawTags =
    rawData && typeof rawData === 'object' && 'categories_tags' in rawData
      ? (rawData as { categories_tags?: unknown }).categories_tags
      : null;
  const fromRaw = Array.isArray(rawTags)
    ? rawTags
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.toLowerCase())
    : [];
  return [...new Set([...fromColumn, ...fromRaw])];
}

export function departmentFor(
  tags: readonly string[],
  name: string,
): CatalogDepartment {
  const tagSet = new Set(tags);
  const byTag = RULES.find((rule) => rule.tags.some((tag) => tagSet.has(tag)));
  if (byTag) return byTag.department;

  const lowered = name.toLocaleLowerCase();
  const nameTokens = tokens(name);
  const byPhrase = RULES.find((rule) =>
    rule.words.some((word) => word.includes(' ') && lowered.includes(word)),
  );
  if (byPhrase) return byPhrase.department;

  const byWord = RULES.find((rule) =>
    rule.words.some((word) => matchesWord(lowered, nameTokens, word)),
  );
  return byWord?.department ?? 'OTHER';
}
