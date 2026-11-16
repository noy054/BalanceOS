import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMealItemDto {
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100000)
  @Type(() => Number)
  grams?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100000)
  @Type(() => Number)
  milliliters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  @Max(10000)
  @Type(() => Number)
  servings?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1000)
  @Type(() => Number)
  portions?: number;
}

export class UpdateMealComponentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  @Type(() => Number)
  grams?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  @Type(() => Number)
  milliliters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  servings?: number;
}
