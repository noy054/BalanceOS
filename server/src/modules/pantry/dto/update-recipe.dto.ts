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

const MEAL_TYPES = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK_1',
  'SNACK_2',
] as const;
import { Type } from 'class-transformer';
import { RecipeItemDto } from './create-recipe.dto';
import { IsDayKey } from '../../../common/date/is-day-key.validator';

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(MEAL_TYPES)
  mealType?: string;

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
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  steps?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items?: RecipeItemDto[];

  @IsOptional()
  @IsDayKey()
  logsFrom?: string;
}
