import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SavedMealItemDto } from './create-saved-meal.dto';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK_1', 'SNACK_2'] as const;

export class UpdateSavedMealDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(MEAL_TYPES)
  mealType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SavedMealItemDto)
  items?: SavedMealItemDto[];
}
