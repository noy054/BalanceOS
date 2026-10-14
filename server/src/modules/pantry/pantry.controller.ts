import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PantryService } from './pantry.service';
import { CreatePantryProductDto } from './dto/create-pantry-product.dto';
import { UpdatePantryProductDto } from './dto/update-pantry-product.dto';
import { ListPantryProductsDto } from './dto/list-pantry-products.dto';
import { AddFromCatalogDto } from './dto/add-from-catalog.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { PantryProductModel } from '../../../generated/prisma/models';
import { ParseBarcodePipe } from '../../common/barcode/parse-barcode.pipe';
import { NormalizedBarcode } from '../../common/barcode/barcode.utils';
import { Page } from '../../common/pagination/page.types';

@UseGuards(JwtGuard)
@Controller('pantry/products')
export class PantryController {
  constructor(private readonly service: PantryService) {}

  @Get()
  list(
    @CurrentUser() user: UserPublic,
    @Query() dto: ListPantryProductsDto,
  ): Promise<Page<PantryProductModel>> {
    return this.service.list(user.id, dto);
  }

  // barcode route must come before :id to avoid parameter collision
  @Get('barcode/:barcode')
  getByBarcode(
    @CurrentUser() user: UserPublic,
    @Param('barcode', ParseBarcodePipe) barcode: NormalizedBarcode,
  ): Promise<PantryProductModel> {
    return this.service.getByBarcode(user.id, barcode);
  }

  @Get(':id')
  getById(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
  ): Promise<PantryProductModel> {
    return this.service.getById(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: UserPublic,
    @Body() dto: CreatePantryProductDto,
  ): Promise<PantryProductModel> {
    return this.service.create(user.id, dto);
  }

  @Post('from-catalog/:catalogItemId')
  addFromCatalog(
    @CurrentUser() user: UserPublic,
    @Param('catalogItemId') catalogItemId: string,
    @Body() dto: AddFromCatalogDto,
  ): Promise<PantryProductModel> {
    return this.service.addFromCatalog(user.id, catalogItemId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: UpdatePantryProductDto,
  ): Promise<PantryProductModel> {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(user.id, id);
  }
}
