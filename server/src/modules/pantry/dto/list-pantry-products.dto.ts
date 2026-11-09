import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MAX_PAGE_SIZE } from '../../../common/pagination/page.types';
import { IsDayKey } from '../../../common/date/is-day-key.validator';
import { ProductCategory } from '../../../../generated/prisma/enums';

export const PANTRY_SORTS = ['newest', 'updated', 'name'] as const;
export type PantrySort = (typeof PANTRY_SORTS)[number];

export const PANTRY_FOCUSES = [
  'protein',
  'carbs',
  'fat',
  'vegetables',
  'fruits',
] as const;
export type PantryFocus = (typeof PANTRY_FOCUSES)[number];

export type PantryCategory = ProductCategory;

export class FrequentPantryProductsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsDayKey()
  today?: string;
}

export class ListPantryProductsDto {
  @IsOptional()
  @IsIn(PANTRY_SORTS)
  sort?: PantrySort;

  @IsOptional()
  @IsIn(PANTRY_FOCUSES)
  focus?: PantryFocus;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cursor?: string;
}
