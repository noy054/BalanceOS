import {
  NutritionTargets,
  TargetCalculation,
} from '../../nutrition-calculator/target-calculator';

export type TargetProfileField =
  | 'gender'
  | 'birthDate'
  | 'heightCm'
  | 'weightKg'
  | 'trainingDaysPerWeek'
  | 'goalType';

export type SuggestionWeight = {
  value: number;
  basis: 'average' | 'latest' | 'profile';
  count: number;
  from: string | null;
  to: string | null;
};

export type TargetSuggestionResponse = {
  available: boolean;
  missing: TargetProfileField[];
  targetMode: string;
  experienceMode: string;
  weight: SuggestionWeight | null;
  current: NutritionTargets | null;
  suggested: TargetCalculation | null;
  calorieDifference: number | null;
  meaningful: boolean;
};
