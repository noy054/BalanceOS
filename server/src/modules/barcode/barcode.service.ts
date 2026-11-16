import { Injectable } from '@nestjs/common';
import { NormalizedBarcode } from '../../common/barcode/barcode.utils';
import { PantryService } from '../pantry/pantry.service';
import { ProductCatalogService } from '../product-catalog/product-catalog.service';
import { BarcodeResolveResult } from './types/barcode.types';

@Injectable()
export class BarcodeService {
  constructor(
    private readonly pantryService: PantryService,
    private readonly catalogService: ProductCatalogService,
  ) {}

  async resolve(
    userId: string,
    barcode: NormalizedBarcode,
  ): Promise<BarcodeResolveResult> {
    const pantryProduct = await this.pantryService.findByBarcode(
      userId,
      barcode,
    );
    if (pantryProduct) {
      return { status: 'IN_PANTRY', barcode: barcode.canonical, pantryProduct };
    }

    const context = await this.catalogService.lookupContextFor(userId);
    const catalogItem = await this.catalogService.lookupByBarcode(
      userId,
      barcode,
      context,
    );
    if (catalogItem) {
      return { status: 'IN_CATALOG', barcode: barcode.canonical, catalogItem };
    }

    const reference = await this.catalogService.findMarketReference(
      barcode,
      context,
    );
    return reference
      ? { status: 'NOT_FOUND', barcode: barcode.canonical, reference }
      : { status: 'NOT_FOUND', barcode: barcode.canonical };
  }
}
