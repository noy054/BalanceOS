import { IsArray, IsEnum, IsOptional } from 'class-validator';
import {
  NutritionBasis,
  ProductCategory,
} from '../../../../generated/prisma/enums';
import {
  OptionalNumber,
  OptionalText,
} from '../../../common/validation/optional-fields.decorators';

export class ProductNutritionInputDto {
  @IsOptional()
  @IsEnum(NutritionBasis)
  nutritionBasis?: NutritionBasis;

  @OptionalNumber()
  caloriesPer100g?: number | null;

  @OptionalNumber()
  proteinPer100g?: number | null;

  @OptionalNumber()
  carbsPer100g?: number | null;

  @OptionalNumber()
  fatPer100g?: number | null;

  @OptionalNumber()
  fiberPer100g?: number | null;

  @OptionalNumber()
  caloriesPerServing?: number | null;

  @OptionalNumber()
  proteinPerServing?: number | null;

  @OptionalNumber()
  carbsPerServing?: number | null;

  @OptionalNumber()
  fatPerServing?: number | null;

  @OptionalNumber()
  fiberPerServing?: number | null;

  @OptionalNumber(0.1)
  servingSizeG?: number | null;

  @OptionalText(100)
  servingSizeText?: string | null;

  @OptionalNumber(0.01)
  servingQuantity?: number | null;

  @OptionalText(60)
  servingUnit?: string | null;

  @IsOptional()
  @IsArray()
  @IsEnum(ProductCategory, { each: true })
  mealCategories?: ProductCategory[];
}
