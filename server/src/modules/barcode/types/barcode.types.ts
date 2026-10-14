import { PantryProductModel } from '../../../../generated/prisma/models';
import { ProductCatalogItemDto } from '../../product-catalog/types/product-catalog.types';

/** Single answer to "what is this barcode for this user?" — the client routes on `status`. */
export type BarcodeResolveResult =
  | { status: 'IN_PANTRY'; barcode: string; pantryProduct: PantryProductModel }
  | {
      status: 'IN_CATALOG';
      barcode: string;
      catalogItem: ProductCatalogItemDto;
    }
  | { status: 'NOT_FOUND'; barcode: string };
