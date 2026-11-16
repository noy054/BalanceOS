import { ServingUnitKey } from "./servingReferences";

export type ServingAmountField = "grams" | "milliliters";

export type ServingEstimate = {
  field: ServingAmountField;
  perUnit: number;
  source: "volume" | "food";
};

const STANDARD_UNIT_ML: Partial<Record<ServingUnitKey, number>> = {
  teaspoon: 5,
  tablespoon: 15,
  cup: 240,
};

type FoodAverage = {
  phrases: string[][];
  grams: Partial<Record<ServingUnitKey, number>>;
};

const FOOD_AVERAGES: FoodAverage[] = [
  {
    phrases: [["peanut", "butter"], ["חמאת", "בוטנים"], ["tahini"], ["טחינה"]],
    grams: { teaspoon: 5, tablespoon: 16, cup: 256 },
  },
  { phrases: [["oil"], ["שמן"]], grams: { teaspoon: 4.5, tablespoon: 13.5, cup: 216 } },
  { phrases: [["butter"], ["חמאה"]], grams: { teaspoon: 4.7, tablespoon: 14, cup: 227 } },
  {
    phrases: [["honey"], ["דבש"], ["syrup"], ["סירופ"], ["סילאן"]],
    grams: { teaspoon: 7, tablespoon: 21, cup: 340 },
  },
  { phrases: [["sugar"], ["סוכר"]], grams: { teaspoon: 4.2, tablespoon: 12.5, cup: 200 } },
  { phrases: [["salt"], ["מלח"]], grams: { teaspoon: 6, tablespoon: 18 } },
  { phrases: [["flour"], ["קמח"]], grams: { teaspoon: 2.6, tablespoon: 7.8, cup: 125 } },
  { phrases: [["cocoa"], ["קקאו"]], grams: { teaspoon: 1.8, tablespoon: 5.4, cup: 86 } },
  {
    phrases: [["oats"], ["oatmeal"], ["שיבולת", "שועל"], ["קוואקר"]],
    grams: { tablespoon: 5, cup: 80 },
  },
  { phrases: [["rice"], ["אורז"]], grams: { tablespoon: 12, cup: 185 } },
  {
    phrases: [["almonds"], ["nuts"], ["walnuts"], ["שקדים"], ["אגוזים"], ["אגוזי"]],
    grams: { tablespoon: 9, cup: 140 },
  },
  {
    phrases: [["milk"], ["חלב"], ["yogurt"], ["יוגורט"]],
    grams: { teaspoon: 5, tablespoon: 15, cup: 245 },
  },
  { phrases: [["egg"], ["eggs"], ["ביצה"], ["ביצים"]], grams: { unit: 50 } },
  { phrases: [["bread"], ["toast"], ["לחם"]], grams: { slice: 30 } },
  { phrases: [["banana"], ["בננה"]], grams: { unit: 118 } },
  { phrases: [["apple"], ["תפוח"]], grams: { unit: 180 } },
];

function tokensOf(name: string) {
  return name
    .toLocaleLowerCase()
    .split(/[^\p{L}]+/u)
    .filter(Boolean);
}

function containsPhrase(tokens: string[], phrase: string[]) {
  return tokens.some((_, start) => phrase.every((word, offset) => tokens[start + offset] === word));
}

export function estimateServing(
  unitKey: ServingUnitKey,
  basis: ServingAmountField,
  productName: string,
): ServingEstimate | null {
  if (basis === "milliliters") {
    const milliliters = STANDARD_UNIT_ML[unitKey];
    return milliliters ? { field: "milliliters", perUnit: milliliters, source: "volume" } : null;
  }
  const tokens = tokensOf(productName);
  const food = FOOD_AVERAGES.find((entry) => entry.phrases.some((phrase) => containsPhrase(tokens, phrase)));
  const grams = food?.grams[unitKey];
  return grams ? { field: "grams", perUnit: grams, source: "food" } : null;
}
