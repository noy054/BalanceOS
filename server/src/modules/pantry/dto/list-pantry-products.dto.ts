import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MAX_PAGE_SIZE } from '../../../common/pagination/page.types';

export class ListPantryProductsDto {
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

  /** id of the last item of the previous page */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cursor?: string;
}
