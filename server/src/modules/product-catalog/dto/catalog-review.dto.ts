import {
  IsIn,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
  ProductSource,
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
  @MaxLength(100)
  q?: string;

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

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RejectCatalogSubmissionDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reviewNote: string;
}

export class MergeCatalogSubmissionDto {
  @IsString()
  @IsNotEmpty()
  targetCatalogItemId: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}

export const CATALOG_ITEM_STATES = ['active', 'archived', 'all'] as const;
export type CatalogItemState = (typeof CATALOG_ITEM_STATES)[number];

export class ListCatalogItemsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(CATALOG_ITEM_STATES)
  state?: CatalogItemState;

  @IsOptional()
  @IsEnum(ProductSource)
  source?: ProductSource;

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

export class UpdateCatalogItemDto extends ProductNutritionInputDto {
  @Transform(trim)
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
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ArchiveCatalogItemDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
