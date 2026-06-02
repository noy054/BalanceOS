import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductCatalogService } from './product-catalog.service';
import { CreateProductCatalogDto } from './dto/create-product-catalog.dto';
import { UpdateProductCatalogDto } from './dto/update-product-catalog.dto';
import { SearchProductCatalogDto } from './dto/search-product-catalog.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { ProductCatalogItemModel } from '../../../generated/prisma/models';

@UseGuards(JwtGuard)
@Controller('product-catalog')
export class ProductCatalogController {
  constructor(private readonly service: ProductCatalogService) {}

  @Get('barcode/:barcode')
  async getByBarcode(
    @CurrentUser() user: UserPublic,
    @Param('barcode') barcode: string,
  ): Promise<ProductCatalogItemModel> {
    const product = await this.service.lookupByBarcode(user.id, barcode);
    if (!product) throw new NotFoundException('Product not found for this barcode');
    return product;
  }

  @Get('search')
  search(
    @Query() dto: SearchProductCatalogDto,
  ): Promise<ProductCatalogItemModel[]> {
    return this.service.search(dto.q, dto.limit);
  }

  @Post()
  create(
    @CurrentUser() user: UserPublic,
    @Body() dto: CreateProductCatalogDto,
  ): Promise<ProductCatalogItemModel> {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: UpdateProductCatalogDto,
  ): Promise<ProductCatalogItemModel> {
    return this.service.update(user.id, id, dto);
  }
}
