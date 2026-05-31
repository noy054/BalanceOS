import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

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
}
