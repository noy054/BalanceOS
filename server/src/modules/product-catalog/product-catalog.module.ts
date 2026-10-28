import { Module } from '@nestjs/common';
import { ProductCatalogController } from './product-catalog.controller';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCatalogRepository } from './product-catalog.repository';
import { OpenFoodFactsClient } from './open-food-facts.client';
import { UsdaFoodDataCentralClient } from './usda-food-data-central.client';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminCatalogController } from './admin-catalog.controller';
import { CatalogReviewService } from './catalog-review.service';
import { CatalogReviewRepository } from './catalog-review.repository';
import { CatalogAdminService } from './catalog-admin.service';
import { CatalogAdminRepository } from './catalog-admin.repository';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ProductCatalogController, AdminCatalogController],
  providers: [
    ProductCatalogService,
    ProductCatalogRepository,
    OpenFoodFactsClient,
    UsdaFoodDataCentralClient,
    CatalogReviewService,
    CatalogReviewRepository,
    CatalogAdminService,
    CatalogAdminRepository,
  ],
  exports: [ProductCatalogService, CatalogReviewService, CatalogAdminService],
})
export class ProductCatalogModule {}
