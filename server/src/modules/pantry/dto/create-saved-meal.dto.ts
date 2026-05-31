import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK_1', 'SNACK_2'] as const;

export class SavedMealItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  recipeId?: string;

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

export class CreateSavedMealDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(MEAL_TYPES)
  mealType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SavedMealItemDto)
  items: SavedMealItemDto[];
}
