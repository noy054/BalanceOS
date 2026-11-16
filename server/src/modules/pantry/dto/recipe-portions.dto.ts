import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

import {
  RecipeLeftoverMode,
  RecipePortionMode,
  RecipePortionTarget,
} from '../../../../generated/prisma/client';

export class RecipePortionsDto {
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100000)
  @Type(() => Number)
  emptyPotWeightG?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100000)
  @Type(() => Number)
  potWithFoodWeightG?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100000)
  @Type(() => Number)
  cookedWeightG?: number | null;

  @IsOptional()
  @IsEnum(RecipePortionMode)
  portionMode?: RecipePortionMode | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  portionCount?: number | null;

  @IsOptional()
  @IsEnum(RecipePortionTarget)
  portionTarget?: RecipePortionTarget | null;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100000)
  @Type(() => Number)
  portionTargetValue?: number | null;

  @IsOptional()
  @IsEnum(RecipeLeftoverMode)
  leftoverMode?: RecipeLeftoverMode | null;
}
