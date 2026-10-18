import { PantryProductModel } from '../../../../generated/prisma/models';
import { ProductCatalogItemDto } from '../../product-catalog/types/product-catalog.types';

export type BarcodeResolveResult =
  | { status: 'IN_PANTRY'; barcode: string; pantryProduct: PantryProductModel }
  | {
      status: 'IN_CATALOG';
      barcode: string;
      catalogItem: ProductCatalogItemDto;
    }
  | { status: 'NOT_FOUND'; barcode: string };
