import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK_1', 'SNACK_2'] as const;

export class AddMealItemDto {
  @IsEnum(MEAL_TYPES)
  mealType: string;

  @IsOptional()
  @IsString()
  pantryProductId?: string;

  @IsOptional()
  @IsString()
  pantryRecipeId?: string;

  @IsOptional()
  @IsString()
  savedMealId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  grams?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  servings?: number;
}
