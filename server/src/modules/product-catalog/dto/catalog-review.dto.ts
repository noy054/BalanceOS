import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
} from '../../../../generated/prisma/enums';
import { IsBarcode } from '../../../common/barcode/is-barcode.validator';
import { ProductNutritionInputDto } from '../../pantry/dto/product-nutrition-input.dto';

export class ListCatalogSubmissionsDto {
  @IsOptional()
  @IsEnum(CatalogSubmissionStatus)
  status?: CatalogSubmissionStatus;

  @IsOptional()
  @IsEnum(CatalogSubmissionKind)
  kind?: CatalogSubmissionKind;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class ApproveCatalogSubmissionDto extends ProductNutritionInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsBarcode()
  barcode?: string;

  @IsOptional()
  @IsString()
  targetCatalogItemId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}

export class RejectCatalogSubmissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}
