import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProductNutritionInputDto } from './product-nutrition-input.dto';

export class AddFromCatalogDto extends ProductNutritionInputDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
