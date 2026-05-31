import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

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
}
