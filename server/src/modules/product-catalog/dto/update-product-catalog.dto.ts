import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProductVerificationStatus } from '../../../../generated/prisma/enums';

export class UpdateProductCatalogDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  brand?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  caloriesPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proteinPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  carbsPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fatPer100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiberPer100g?: number;

  @IsOptional()
  @IsEnum(ProductVerificationStatus)
  verificationStatus?: ProductVerificationStatus;
}
