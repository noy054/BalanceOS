import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProductCatalogService } from './product-catalog.service';
import { SearchProductCatalogDto } from './dto/search-product-catalog.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Page } from '../../common/pagination/page.types';
import { ProductCatalogItemDto } from './types/product-catalog.types';

@UseGuards(JwtGuard)
@Controller('product-catalog')
export class ProductCatalogController {
  constructor(private readonly service: ProductCatalogService) {}

  @Get('search')
  search(
    @Query() dto: SearchProductCatalogDto,
  ): Promise<Page<ProductCatalogItemDto>> {
    return this.service.search(dto.q, dto.limit, dto.cursor);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<ProductCatalogItemDto> {
    return this.service.getById(id);
  }
}
