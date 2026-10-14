import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '../../../../generated/prisma/enums';

export class CreatePantryProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  caloriesPer100g: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  proteinPer100g: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  carbsPer100g: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fatPer100g: number;

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
