export type ExperienceMode = 'EXPERT' | 'GUIDED';
export type TargetMode = 'MANUAL' | 'AUTO';

export type NutritionSettings = {
  id: string;
  userId: string;
  experienceMode: ExperienceMode;
  targetMode: TargetMode;
  onboardingCompleted: boolean;
  dailyCaloriesTarget: number | null;
  proteinTarget: number | null;
  carbsTarget: number | null;
  fatTarget: number | null;
  fiberTarget: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertNutritionSettingsPayload = {
  experienceMode?: ExperienceMode;
  targetMode?: TargetMode;
  onboardingCompleted?: boolean;
  dailyCaloriesTarget?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  fiberTarget?: number;
};
