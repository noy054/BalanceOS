import {
  MacrosSnapshot,
  NutritionCalculatorService,
  baseMacrosOf,
} from '../nutrition-calculator/nutrition-calculator.service';
import {
  MealComponentInput,
  PantryRecipeRow,
  SavedMealRow,
  TemplateProduct,
} from './day-logs.repository';

type Amount = {
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
};

type Totals = Omit<MacrosSnapshot, 'name'>;

const MACRO_KEYS = ['calories', 'protein', 'carbs', 'fat', 'fiber'] as const;

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function scaleAmount(amount: Amount, factor: number): Amount {
  return {
    grams: amount.grams != null ? round(amount.grams * factor, 2) : null,
    servings:
      amount.servings != null ? round(amount.servings * factor, 4) : null,
    milliliters:
      amount.milliliters != null ? round(amount.milliliters * factor, 2) : null,
  };
}

function servingInfo(product: TemplateProduct) {
  return {
    nutritionBasis: product.nutritionBasis,
    servingSizeG: product.servingSizeG,
    servingSizeMl: product.servingSizeMl ?? null,
    servingQuantity: product.servingQuantity,
    servingUnit: product.servingUnit,
  };
}

function productComponent(
  calculator: NutritionCalculatorService,
  product: TemplateProduct,
  amount: Amount,
  position: number,
): MealComponentInput | null {
  const snapshot = calculator.productSnapshot(product, amount);
  if (!snapshot) return null;
  return {
    position,
    name: product.name,
    imageUrl: product.imageUrl,
    pantryProductId: product.id,
    pantryRecipeId: null,
    ...amount,
    serving: servingInfo(product),
    macrosSnapshot: snapshot,
  };
}

export function recipeComponents(
  calculator: NutritionCalculatorService,
  recipe: PantryRecipeRow,
  servings: number,
): MealComponentInput[] | null {
  const components = recipe.items.map((item, index) =>
    productComponent(
      calculator,
      item.product,
      scaleAmount(item, servings),
      index,
    ),
  );
  return components.every((component) => component !== null)
    ? (components as MealComponentInput[])
    : null;
}

export function savedMealComponents(
  calculator: NutritionCalculatorService,
  meal: SavedMealRow,
): MealComponentInput[] | null {
  const components = meal.items.map((item, index) => {
    if (item.product && (item.grams || item.servings || item.milliliters)) {
      return productComponent(calculator, item.product, item, index);
    }
    if (item.recipe && item.servings) {
      const snapshot = calculator.recipeSnapshot(item.recipe, item.servings);
      if (!snapshot) return null;
      return {
        position: index,
        name: item.recipe.name,
        imageUrl: item.recipe.imageUrl,
        pantryProductId: null,
        pantryRecipeId: item.recipe.id,
        grams: null,
        servings: item.servings,
        milliliters: null,
        serving: null,
        macrosSnapshot: snapshot,
      } satisfies MealComponentInput;
    }
    return null;
  });
  return components.every((component) => component !== null)
    ? (components as MealComponentInput[])
    : null;
}

export function sumSnapshots(snapshots: Totals[]): Totals {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const snapshot of snapshots) {
    for (const key of MACRO_KEYS) total[key] += snapshot[key] ?? 0;
  }
  return total;
}

export function matchesSnapshot(totals: Totals, snapshot: MacrosSnapshot) {
  return (
    Math.abs(totals.calories - snapshot.calories) <= 2 &&
    MACRO_KEYS.slice(1).every(
      (key) => Math.abs(totals[key] - (snapshot[key] ?? 0)) <= 0.6,
    )
  );
}

export function applyDelta(
  base: MacrosSnapshot,
  before: MacrosSnapshot,
  after: MacrosSnapshot,
): MacrosSnapshot {
  const next = { ...base };
  for (const key of MACRO_KEYS) {
    const value = (base[key] ?? 0) + (after[key] ?? 0) - (before[key] ?? 0);
    next[key] =
      key === 'calories'
        ? Math.max(0, Math.round(value))
        : Math.max(0, round(value, 1));
  }
  return next;
}

export function savedMealSnapshot(
  calculator: NutritionCalculatorService,
  meal: SavedMealRow,
): MacrosSnapshot | null {
  const totals: Totals[] = [];
  for (const item of meal.items) {
    const snapshot =
      item.product && (item.grams || item.servings || item.milliliters)
        ? calculator.productSnapshot({ ...item.product, name: '' }, item)
        : item.recipe && item.servings
          ? calculator.recipeSnapshot(
              { name: '', items: item.recipe.items },
              item.servings,
            )
          : null;
    if (!snapshot) return null;
    totals.push(snapshot);
  }
  return calculator.savedMealSnapshot(meal, calculator.sumTotals(totals));
}

type StoredAmount = Amount & {
  pantryProductId: string | null;
  pantryRecipeId: string | null;
};

function componentKey(component: StoredAmount) {
  return component.pantryRecipeId
    ? `recipe:${component.pantryRecipeId}`
    : `product:${component.pantryProductId}`;
}

function amountOf(component: Amount) {
  return component.grams ?? component.milliliters ?? component.servings;
}

function sameUnit(a: Amount, b: Amount) {
  return (
    (a.grams != null) === (b.grams != null) &&
    (a.milliliters != null) === (b.milliliters != null) &&
    (a.servings != null) === (b.servings != null)
  );
}

function sameAmount(a: Amount, b: Amount) {
  const left = amountOf(a);
  const right = amountOf(b);
  if (left == null || right == null) return left === right;
  return Math.abs(left - right) <= Math.max(0.011, Math.abs(right) * 1e-4);
}

function groupByKey<T extends StoredAmount>(components: T[]) {
  const groups = new Map<string, T[]>();
  for (const component of components) {
    const key = componentKey(component);
    groups.set(key, [...(groups.get(key) ?? []), component]);
  }
  return groups;
}

export function mergeTemplateComponents(
  calculator: NutritionCalculatorService,
  stored: StoredAmount[],
  previous: MealComponentInput[] | null,
  next: MealComponentInput[],
): { components: MealComponentInput[]; customized: boolean } {
  const storedGroups = groupByKey(stored);
  const previousGroups = groupByKey(previous ?? []);
  const seen = new Map<string, number>();
  let customized = false;

  const components = next.map((component) => {
    const key = componentKey(component);
    const index = seen.get(key) ?? 0;
    seen.set(key, index + 1);
    const own = storedGroups.get(key)?.[index];
    const before = previousGroups.get(key)?.[index];
    const nextAmount = amountOf(component);
    const ownAmount = own ? amountOf(own) : null;
    if (
      !own ||
      !before ||
      sameAmount(own, before) ||
      !sameUnit(own, component) ||
      !nextAmount ||
      ownAmount == null
    ) {
      return component;
    }
    customized = true;
    return {
      ...component,
      grams: own.grams,
      servings: own.servings,
      milliliters: own.milliliters,
      macrosSnapshot: calculator.scaleSnapshot(
        component.macrosSnapshot,
        ownAmount / nextAmount,
      ),
      baseMacros: baseMacrosOf(component.macrosSnapshot, nextAmount),
    };
  });

  return { components, customized };
}

export function totalsSnapshot(
  name: string,
  components: MealComponentInput[],
): MacrosSnapshot {
  const totals = sumSnapshots(components.map((c) => c.macrosSnapshot));
  return {
    name,
    calories: Math.round(totals.calories),
    protein: round(totals.protein, 1),
    carbs: round(totals.carbs, 1),
    fat: round(totals.fat, 1),
    fiber: round(totals.fiber, 1),
  };
}
