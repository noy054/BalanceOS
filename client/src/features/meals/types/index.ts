export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK_1' | 'SNACK_2';

export type MealShortcut = {
  type: MealType;
  labelKey: string;
  icon: string;
};

export type MealPickerMacros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealPickerBasis = 'per100g' | 'perServing';
