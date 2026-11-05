import { IsDayKey } from '../../../common/date/is-day-key.validator';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MAX_TEMPLATE_ITEMS } from './template-limits';
import { Type } from 'class-transformer';
import { SavedMealItemDto } from './create-saved-meal.dto';

const MEAL_TYPES = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK_1',
  'SNACK_2',
] as const;

export class UpdateSavedMealDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MEAL_TYPES.length)
  @ArrayUnique()
  @IsIn(MEAL_TYPES, { each: true })
  mealTypes?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => SavedMealItemDto)
  items?: SavedMealItemDto[];

  @IsOptional()
  @IsDayKey()
  logsFrom?: string;
}
