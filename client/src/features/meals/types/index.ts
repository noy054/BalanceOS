export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK_1' | 'SNACK_2';

export type MealShortcut = {
  type: MealType;
  labelKey: string;
  icon: string;
};
