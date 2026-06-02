export type ExperienceMode = "EXPERT" | "GUIDED";
export type TargetMode = "MANUAL" | "AUTO";

export type SupportedLanguage = "he" | "en";

export type FoodUnit = "GRAMS" | "SERVING" | "PIECE";

export type NutritionSettings = {
  id: string;
  userId: string;

  experienceMode: string;
  targetMode: string;
  onboardingCompleted: boolean;
  preferredLanguage: string;

  dailyCaloriesTarget?: number | null;
  proteinTarget?: number | null;
  carbsTarget?: number | null;
  fatTarget?: number | null;
  fiberTarget?: number | null;

  gender?: string | null;
  birthDate?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  trainingDaysPerWeek?: number | null;
  goalType?: string | null;

  themeMode: string;

  showFiberOnHome: boolean;
  showCarbsOnHome: boolean;
  showFatOnHome: boolean;
  showProgressPercentages: boolean;

  showGuidedSuggestions: boolean;
  showMotivation: boolean;

  defaultFoodUnit: FoodUnit;
};

export type UpsertNutritionSettingsPayload = {
  experienceMode?: ExperienceMode;
  targetMode?: TargetMode;
  onboardingCompleted?: boolean;
  preferredLanguage?: SupportedLanguage;
  dailyCaloriesTarget?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  fiberTarget?: number;
};
