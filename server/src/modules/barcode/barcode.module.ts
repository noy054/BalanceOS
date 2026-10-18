import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PantryModule } from '../pantry/pantry.module';
import { ProductCatalogModule } from '../product-catalog/product-catalog.module';
import { BarcodeController } from './barcode.controller';
import { BarcodeService } from './barcode.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
    PantryModule,
    ProductCatalogModule,
  ],
  controllers: [BarcodeController],
  providers: [BarcodeService],
})
export class BarcodeModule {}
