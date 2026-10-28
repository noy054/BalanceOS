import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsBarcode } from '../../../common/barcode/is-barcode.validator';
import { ProductNutritionInputDto } from './product-nutrition-input.dto';

export class UpdatePantryProductDto extends ProductNutritionInputDto {
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
  @IsBarcode()
  barcode?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
