export type TargetGender = 'MALE' | 'FEMALE' | 'OTHER';
export type TargetGoal = 'CUTTING' | 'MAINTENANCE' | 'BULKING';

export type TargetProfile = {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: TargetGender;
  trainingDaysPerWeek: number;
  goal: TargetGoal;
};

export type NutritionTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type TargetCalculation = NutritionTargets & {
  bmr: number;
  tdee: number;
  activityFactor: number;
};

export type WeighIn = { date: string; weightKg: number };

export type SmoothedWeight = {
  value: number;
  basis: 'average' | 'latest';
  count: number;
  from: string;
  to: string;
};

const GENDER_OFFSET: Record<TargetGender, number> = {
  MALE: 5,
  FEMALE: -161,
  OTHER: -78,
};

const GOAL_MULTIPLIER: Record<TargetGoal, number> = {
  CUTTING: 0.8,
  MAINTENANCE: 1,
  BULKING: 1.1,
};

const MIN_CALORIES = 1200;
const FAT_SHARE = 0.25;
const MAX_PROTEIN_SHARE = 0.4;
const FIBER_PER_1000_KCAL = 14;
export const SMOOTHING_WINDOW_DAYS = 14;
export const MIN_SMOOTHING_WEIGH_INS = 3;
export const MEANINGFUL_CALORIE_CHANGE = 100;

export function mifflinStJeor(profile: TargetProfile): number {
  return (
    10 * profile.weightKg +
    6.25 * profile.heightCm -
    5 * profile.ageYears +
    GENDER_OFFSET[profile.gender]
  );
}

export function activityFactor(trainingDaysPerWeek: number): number {
  if (trainingDaysPerWeek <= 0) return 1.2;
  if (trainingDaysPerWeek <= 2) return 1.375;
  if (trainingDaysPerWeek <= 4) return 1.55;
  if (trainingDaysPerWeek <= 6) return 1.725;
  return 1.9;
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function macroTargets(
  calories: number,
  weightKg: number,
  goal: TargetGoal,
): NutritionTargets {
  const proteinPerKg = goal === 'CUTTING' ? 2.2 : 2;
  const proteinKcal = Math.min(
    proteinPerKg * weightKg * 4,
    calories * MAX_PROTEIN_SHARE,
  );
  const fatKcal = calories * FAT_SHARE;
  const carbsKcal = Math.max(0, calories - proteinKcal - fatKcal);
  return {
    calories,
    protein: Math.round(proteinKcal / 4),
    fat: Math.round(fatKcal / 9),
    carbs: Math.round(carbsKcal / 4),
    fiber: Math.round((calories / 1000) * FIBER_PER_1000_KCAL),
  };
}

export function calculateTargets(profile: TargetProfile): TargetCalculation {
  const bmr = mifflinStJeor(profile);
  const factor = activityFactor(profile.trainingDaysPerWeek);
  const tdee = bmr * factor;
  const goalCalories = tdee * GOAL_MULTIPLIER[profile.goal];
  const floor =
    profile.goal === 'CUTTING' ? Math.max(MIN_CALORIES, bmr) : MIN_CALORIES;
  const calories = roundTo(Math.max(goalCalories, floor), 10);
  return {
    ...macroTargets(calories, profile.weightKg, profile.goal),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    activityFactor: factor,
  };
}

function dayNumber(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

export function smoothedWeight(weighIns: WeighIn[]): SmoothedWeight | null {
  if (weighIns.length === 0) return null;
  const ordered = [...weighIns].sort((a, b) => (a.date < b.date ? -1 : 1));
  const latest = ordered[ordered.length - 1];
  const windowStart = dayNumber(latest.date) - (SMOOTHING_WINDOW_DAYS - 1);
  const recent = ordered.filter(
    (entry) => dayNumber(entry.date) >= windowStart,
  );
  if (recent.length >= MIN_SMOOTHING_WEIGH_INS) {
    const average =
      recent.reduce((sum, entry) => sum + entry.weightKg, 0) / recent.length;
    return {
      value: Math.round(average * 10) / 10,
      basis: 'average',
      count: recent.length,
      from: recent[0].date,
      to: latest.date,
    };
  }
  return {
    value: latest.weightKg,
    basis: 'latest',
    count: 1,
    from: latest.date,
    to: latest.date,
  };
}

export function ageOn(birthDate: Date, date: string): number {
  const reference = new Date(`${date}T00:00:00Z`);
  let age = reference.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    reference.getUTCMonth() < birthDate.getUTCMonth() ||
    (reference.getUTCMonth() === birthDate.getUTCMonth() &&
      reference.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}
