import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductCategory } from '../../../../generated/prisma/enums';

export class UpdatePantryProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

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
  @ValidateIf((o) => o.servingSizeG !== null)
  @IsNumber()
  @Min(1)
  @Transform(({ value }) =>
    value === null || value === undefined ? value : Number(value),
  )
  servingSizeG?: number | null;

  @IsOptional()
  @IsArray()
  @IsEnum(ProductCategory, { each: true })
  mealCategories?: ProductCategory[];
}
