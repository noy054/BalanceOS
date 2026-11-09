import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProductCatalogService } from './product-catalog.service';
import { SearchProductCatalogDto } from './dto/search-product-catalog.dto';
import { BrowseProductCatalogDto } from './dto/browse-product-catalog.dto';
import { CatalogDepartmentParamDto } from './dto/catalog-department-param.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { Page } from '../../common/pagination/page.types';
import {
  CatalogBrowseItemDto,
  CatalogDepartmentCountDto,
  CatalogSubcategoryCountDto,
  ProductCatalogItemDetailDto,
  ProductCatalogItemDto,
} from './types/product-catalog.types';

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

  @Get('departments')
  departments(): Promise<CatalogDepartmentCountDto[]> {
    return this.service.departments();
  }

  @Get('departments/:department/subcategories')
  subcategories(
    @Param() params: CatalogDepartmentParamDto,
  ): Promise<CatalogSubcategoryCountDto[]> {
    return this.service.subcategories(params.department);
  }

  @Get('browse')
  browse(
    @CurrentUser() user: UserPublic,
    @Query() dto: BrowseProductCatalogDto,
  ): Promise<Page<CatalogBrowseItemDto>> {
    return this.service.browse(user.id, dto);
  }

  @Get(':id')
  getById(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
  ): Promise<ProductCatalogItemDetailDto> {
    return this.service.getDetail(user.id, id);
  }
}
