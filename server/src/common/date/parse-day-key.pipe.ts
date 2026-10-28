import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isDayKey } from './day-key';

@Injectable()
export class ParseDayKeyPipe implements PipeTransform<unknown, string> {
  transform(value: unknown): string {
    if (!isDayKey(value)) {
      throw new BadRequestException('Date must be a valid YYYY-MM-DD day');
    }
    return value;
  }
}
