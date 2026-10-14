import { registerDecorator, ValidationOptions } from 'class-validator';
import { normalizeBarcode } from './barcode.utils';

/** Validates that a string is a GTIN (EAN-8, UPC-A, EAN-13, GTIN-14) with a correct check digit. */
export function IsBarcode(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isBarcode',
      target: target.constructor,
      propertyName: propertyName as string,
      options: {
        message: `${String(propertyName)} must be a valid EAN-8, UPC-A, EAN-13 or GTIN-14 barcode`,
        ...options,
      },
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && normalizeBarcode(value) !== null,
      },
    });
  };
}
