import { Module } from '@nestjs/common';
import { ProductCatalogController } from './product-catalog.controller';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCatalogRepository } from './product-catalog.repository';
import { OpenFoodFactsClient } from './open-food-facts.client';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductCatalogController],
  providers: [
    ProductCatalogService,
    ProductCatalogRepository,
    OpenFoodFactsClient,
  ],
})
export class ProductCatalogModule {}
