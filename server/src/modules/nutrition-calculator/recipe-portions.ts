export type PortionMode = 'COUNT' | 'TARGET';
export type PortionTarget = 'GRAMS' | 'CALORIES' | 'PROTEIN';
export type LeftoverMode = 'SEPARATE' | 'REDISTRIBUTE' | 'UNALLOCATED';

export type BatchTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type WeighableItem = {
  grams?: number | null;
  servings?: number | null;
  milliliters?: number | null;
  weightG?: number | null;
  product: { servingSizeG?: number | null; servingSizeMl?: number | null };
};

export function itemWeight(item: WeighableItem): number | null {
  if (item.grams) return item.grams;
  if (item.weightG) return item.weightG;
  const servingG = item.product.servingSizeG ?? null;
  if (item.servings && servingG) return item.servings * servingG;
  const servingMl = item.product.servingSizeMl ?? null;
  if (item.milliliters && servingG && servingMl) {
    return (item.milliliters * servingG) / servingMl;
  }
  return null;
}

export function rawBatchWeight(items: WeighableItem[]): number | null {
  if (items.length === 0) return null;
  let total = 0;
  for (const item of items) {
    const weight = itemWeight(item);
    if (weight === null) return null;
    total += weight;
  }
  return Math.round(total * 10) / 10;
}

export type PortionSetup = {
  cookedWeightG: number | null;
  rawWeightG?: number | null;
  portionMode: PortionMode | null;
  portionCount: number | null;
  portionTarget: PortionTarget | null;
  portionTargetValue: number | null;
  leftoverMode: LeftoverMode | null;
};

export type PortionValues = BatchTotals & {
  fraction: number;
  grams: number | null;
};

export type PortionIssue =
  | 'weight'
  | 'calories'
  | 'protein'
  | 'count'
  | 'targetValue'
  | 'tooLarge';

export type PortionPlan =
  | {
      status: 'ok';
      mode: PortionMode;
      weightBasis: 'cooked' | 'raw' | null;
      portion: PortionValues;
      basePortion: PortionValues;
      fullPortions: number;
      leftover: PortionValues | null;
      leftoverMode: LeftoverMode;
    }
  | { status: 'incomplete'; issue: PortionIssue }
  | { status: 'none' };

const EPSILON = 1e-6;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function portionValues(
  totals: BatchTotals,
  fraction: number,
  cookedWeightG: number | null,
): PortionValues {
  return {
    fraction,
    grams: cookedWeightG ? round1(cookedWeightG * fraction) : null,
    calories: Math.round(totals.calories * fraction),
    protein: round1(totals.protein * fraction),
    carbs: round1(totals.carbs * fraction),
    fat: round1(totals.fat * fraction),
    fiber: round1(totals.fiber * fraction),
  };
}

function targetFraction(
  totals: BatchTotals,
  setup: PortionSetup,
): number | PortionIssue {
  const value = setup.portionTargetValue;
  if (!value || value <= 0) return 'targetValue';
  if (setup.portionTarget === 'GRAMS') {
    const weight = setup.cookedWeightG ?? setup.rawWeightG ?? null;
    if (!weight) return 'weight';
    return value / weight;
  }
  if (setup.portionTarget === 'CALORIES') {
    if (totals.calories <= 0) return 'calories';
    return value / totals.calories;
  }
  if (totals.protein <= 0) return 'protein';
  return value / totals.protein;
}

export function planPortions(
  totals: BatchTotals,
  setup: PortionSetup,
): PortionPlan {
  if (!setup.portionMode) return { status: 'none' };
  const weight = setup.cookedWeightG ?? setup.rawWeightG ?? null;
  const weightBasis = setup.cookedWeightG
    ? ('cooked' as const)
    : setup.rawWeightG
      ? ('raw' as const)
      : null;

  if (setup.portionMode === 'COUNT') {
    const count = setup.portionCount ?? 0;
    if (!Number.isInteger(count) || count < 1) {
      return { status: 'incomplete', issue: 'count' };
    }
    const portion = portionValues(totals, 1 / count, weight);
    return {
      status: 'ok',
      mode: 'COUNT',
      weightBasis,
      portion,
      basePortion: portion,
      fullPortions: count,
      leftover: null,
      leftoverMode: setup.leftoverMode ?? 'UNALLOCATED',
    };
  }

  if (!setup.portionTarget)
    return { status: 'incomplete', issue: 'targetValue' };
  const fraction = targetFraction(totals, setup);
  if (typeof fraction === 'string')
    return { status: 'incomplete', issue: fraction };
  const fullPortions = Math.floor(1 / fraction + EPSILON);
  if (fullPortions < 1) return { status: 'incomplete', issue: 'tooLarge' };

  const remainder = 1 - fullPortions * fraction;
  const basePortion = portionValues(totals, fraction, weight);
  const leftover =
    remainder > EPSILON ? portionValues(totals, remainder, weight) : null;
  const leftoverMode = setup.leftoverMode ?? 'UNALLOCATED';
  const portion =
    leftover && leftoverMode === 'REDISTRIBUTE'
      ? portionValues(totals, 1 / fullPortions, weight)
      : basePortion;

  return {
    status: 'ok',
    mode: 'TARGET',
    weightBasis,
    portion,
    basePortion,
    fullPortions,
    leftover,
    leftoverMode,
  };
}

export function netCookedWeight(input: {
  cookedWeightG?: number | null;
  emptyPotWeightG?: number | null;
  potWithFoodWeightG?: number | null;
}): number | null | 'invalid' {
  const pot = input.emptyPotWeightG ?? null;
  const total = input.potWithFoodWeightG ?? null;
  if (pot !== null || total !== null) {
    if (pot === null || total === null || total <= pot) return 'invalid';
    return round1(total - pot);
  }
  return input.cookedWeightG ?? null;
}
