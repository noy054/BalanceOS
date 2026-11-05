import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
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
import { MAX_TEMPLATE_ITEMS } from './template-limits';
import { Type } from 'class-transformer';

const MEAL_TYPES = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK_1',
  'SNACK_2',
] as const;

export class RecipeItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  grams?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  milliliters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  @Type(() => Number)
  servings?: number;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

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

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_TEMPLATE_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items: RecipeItemDto[];
}
