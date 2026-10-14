import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { NormalizedBarcode, normalizeBarcode } from './barcode.utils';

/** Route param pipe: rejects anything that is not a valid GTIN before it reaches services or external APIs. */
@Injectable()
export class ParseBarcodePipe implements PipeTransform<
  string,
  NormalizedBarcode
> {
  transform(value: string): NormalizedBarcode {
    const normalized = normalizeBarcode(value);
    if (!normalized) throw new BadRequestException('Invalid barcode');
    return normalized;
  }
}
