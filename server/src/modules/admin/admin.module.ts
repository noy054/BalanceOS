import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ProductCatalogModule } from '../product-catalog/product-catalog.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuditModule, ProductCatalogModule, AnnouncementsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
