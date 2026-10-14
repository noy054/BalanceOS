export type ExperienceMode = "EXPERT" | "GUIDED";

export type TargetMode = "AUTO" | "MANUAL";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type GoalType = "CUTTING" | "MAINTENANCE" | "BULKING";

export type ThemeMode = "LIGHT" | "DARK" | "SYSTEM";

export type FoodUnit = "GRAMS" | "SERVING" | "PIECE";

export type NutritionSettings = {
  id: string;
  userId: string;

  experienceMode: ExperienceMode;
  targetMode: TargetMode;
  onboardingCompleted: boolean;
  preferredLanguage: string;

  dailyCaloriesTarget: number | null;
  proteinTarget: number | null;
  carbsTarget: number | null;
  fatTarget: number | null;
  fiberTarget: number | null;

  gender: Gender | null;
  birthDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
  trainingDaysPerWeek: number | null;
  goalType: GoalType | null;

  themeMode: ThemeMode;

  showFiberOnHome: boolean;
  showCarbsOnHome: boolean;
  showFatOnHome: boolean;
  showProgressPercentages: boolean;

  showGuidedSuggestions: boolean;
  showMotivation: boolean;

  defaultFoodUnit: FoodUnit;

  breakfastReminderEnabled: boolean;
  breakfastReminderTime: string | null;

  lunchReminderEnabled: boolean;
  lunchReminderTime: string | null;

  dinnerReminderEnabled: boolean;
  dinnerReminderTime: string | null;

  waterReminderEnabled: boolean;
  waterReminderInterval: number | null;

  dailySummaryEnabled: boolean;
  dailySummaryTime: string | null;

  weeklySummaryEnabled: boolean;
  weeklySummaryDay: number | null;
  weeklySummaryTime: string | null;

  createdAt: string;
  updatedAt: string;
};

export type UpdateSettingsPayload = Partial<
  Omit<NutritionSettings, "id" | "userId" | "createdAt" | "updatedAt">
>;

export type UpdateProfilePayload = {
  fullName?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
