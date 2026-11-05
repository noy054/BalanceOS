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
import { MAX_PAGE_SIZE } from '../../../common/pagination/page.types';

export const PANTRY_SORTS = ['newest', 'updated', 'name'] as const;
export type PantrySort = (typeof PANTRY_SORTS)[number];

export class ListPantryProductsDto {
  @IsOptional()
  @IsIn(PANTRY_SORTS)
  sort?: PantrySort;

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
