import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { NormalizedBarcode, normalizeBarcode } from './barcode.utils';

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
