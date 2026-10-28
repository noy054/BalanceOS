import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export function OptionalNumber(min = 0) {
  return applyDecorators(
    IsOptional(),
    IsNumber(),
    Min(min),
    Transform(({ value }: { value: unknown }) =>
      value === null || value === undefined || value === ''
        ? value
        : Number(value),
    ),
  );
}

export function OptionalText(maxLength: number) {
  return applyDecorators(IsOptional(), IsString(), MaxLength(maxLength));
}
