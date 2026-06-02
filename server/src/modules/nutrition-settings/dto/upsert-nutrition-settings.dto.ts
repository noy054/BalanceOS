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

import { FoodUnit } from '../../../../generated/prisma/client';

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
  @Min(0)
  @Max(7)
  trainingDaysPerWeek?: number;

  @IsOptional()
  @IsEnum(GoalType)
  goalType?: GoalType;

  // --- Display ---
  @IsOptional()
  @IsEnum(ThemeMode)
  themeMode?: ThemeMode;

  // --- Home display preferences ---
  @IsOptional()
  @IsBoolean()
  showFiberOnHome?: boolean;

  @IsOptional()
  @IsBoolean()
  showCarbsOnHome?: boolean;

  @IsOptional()
  @IsBoolean()
  showFatOnHome?: boolean;

  @IsOptional()
  @IsBoolean()
  showProgressPercentages?: boolean;

  // --- Guided mode features ---
  @IsOptional()
  @IsBoolean()
  showGuidedSuggestions?: boolean;

  @IsOptional()
  @IsBoolean()
  showMotivation?: boolean;

  // --- Tracking preferences ---
  @IsOptional()
  @IsEnum(FoodUnit)
  defaultFoodUnit?: FoodUnit;

  // --- Notification preferences ---
  @IsOptional()
  @IsBoolean()
  breakfastReminderEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Time must be a valid HH:MM value',
  })
  breakfastReminderTime?: string;

  @IsOptional()
  @IsBoolean()
  lunchReminderEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Time must be a valid HH:MM value',
  })
  lunchReminderTime?: string;

  @IsOptional()
  @IsBoolean()
  dinnerReminderEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Time must be a valid HH:MM value',
  })
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
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Time must be a valid HH:MM value',
  })
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
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Time must be a valid HH:MM value',
  })
  weeklySummaryTime?: string;
}
