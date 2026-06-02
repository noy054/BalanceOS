import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductCatalogDto {
  @IsString()
  @MinLength(2)
  q: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}
