import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '../../../../generated/prisma/enums';

export class AddFromCatalogDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  caloriesPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  proteinPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  carbsPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fatPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fiberPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  servingSizeG?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  servingSizeText?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ProductCategory, { each: true })
  mealCategories?: ProductCategory[];
}
