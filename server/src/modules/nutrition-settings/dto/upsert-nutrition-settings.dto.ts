import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';

export enum ExperienceMode {
  EXPERT = 'EXPERT',
  GUIDED = 'GUIDED',
}

export enum TargetMode {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
}

export class UpsertNutritionSettingsDto {
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
}
