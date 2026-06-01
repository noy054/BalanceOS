import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  Max,
  Min,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export enum ExperienceMode {
  EXPERT = 'EXPERT',
  GUIDED = 'GUIDED',
}

export enum TargetMode {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
}

export enum GoalType {
  CUTTING = 'CUTTING',
  MAINTENANCE = 'MAINTENANCE',
  BULKING = 'BULKING',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum ThemeMode {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

export class UpsertNutritionSettingsDto {
  // --- Core ---
  @IsOptional()
  @IsEnum(ExperienceMode)
  experienceMode?: ExperienceMode;

  @IsOptional()
  @IsEnum(TargetMode)
  targetMode?: TargetMode;

  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['he', 'en'])
  preferredLanguage?: string;

  // --- Nutrition targets ---
  @IsOptional()
  @IsInt()
  @IsPositive()
  dailyCaloriesTarget?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  proteinTarget?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  carbsTarget?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  fatTarget?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  fiberTarget?: number;

  // --- Profile ---
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  weightKg?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  trainingDaysPerWeek?: number;

  @IsOptional()
  @IsEnum(GoalType)
  goalType?: GoalType;

  // --- Display ---
  @IsOptional()
  @IsEnum(ThemeMode)
  themeMode?: ThemeMode;

  // --- Tracking preferences ---
  @IsOptional()
  @IsBoolean()
  showFiberOnHome?: boolean;

  @IsOptional()
  @IsBoolean()
  showCarbsAndFatOnHome?: boolean;

  @IsOptional()
  @IsBoolean()
  showProgressPercentages?: boolean;

  @IsOptional()
  @IsBoolean()
  showWeeklyBalance?: boolean;

  @IsOptional()
  @IsBoolean()
  showGuidedSuggestions?: boolean;

  @IsOptional()
  @IsBoolean()
  hideMotivationInExpertMode?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['GRAMS'])
  defaultFoodUnit?: string;

  // --- Notification preferences ---
  @IsOptional()
  @IsBoolean()
  breakfastReminderEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
  breakfastReminderTime?: string;

  @IsOptional()
  @IsBoolean()
  lunchReminderEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
  lunchReminderTime?: string;

  @IsOptional()
  @IsBoolean()
  dinnerReminderEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
  dinnerReminderTime?: string;

  @IsOptional()
  @IsBoolean()
  waterReminderEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @IsPositive()
  waterReminderInterval?: number;

  @IsOptional()
  @IsBoolean()
  dailySummaryEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
  dailySummaryTime?: string;

  @IsOptional()
  @IsBoolean()
  weeklySummaryEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  weeklySummaryDay?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
  weeklySummaryTime?: string;
}
