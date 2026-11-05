import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CATALOG_DEPARTMENTS } from '../catalog-departments';

export class BrowseProductCatalogDto {
  @IsOptional()
  @IsIn(CATALOG_DEPARTMENTS)
  department?: (typeof CATALOG_DEPARTMENTS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(40)
  subcategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cursor?: string;
}
