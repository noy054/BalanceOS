import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsDayKey } from '../../../common/date/is-day-key.validator';
import {
  ENTRIES_MAX_PAGE_SIZE,
  LENGTH_RANGE,
  NOTE_MAX_LENGTH,
  WEIGHT_RANGE,
} from '../progress.constants';

function OptionalMeasurement(range: { min: number; max: number }) {
  return applyDecorators(
    IsOptional(),
    IsNumber({ allowNaN: false, allowInfinity: false }),
    Min(range.min),
    Max(range.max),
  );
}

export class BodyEntryValuesDto {
  @OptionalMeasurement(WEIGHT_RANGE)
  weightKg?: number | null;

  @OptionalMeasurement(LENGTH_RANGE)
  waistCm?: number | null;

  @OptionalMeasurement(LENGTH_RANGE)
  hipsCm?: number | null;

  @OptionalMeasurement(LENGTH_RANGE)
  chestCm?: number | null;

  @OptionalMeasurement(LENGTH_RANGE)
  upperArmCm?: number | null;

  @OptionalMeasurement(LENGTH_RANGE)
  thighCm?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(NOTE_MAX_LENGTH)
  note?: string | null;
}

export class CreateBodyEntryDto extends BodyEntryValuesDto {
  @IsDayKey()
  date: string;
}

export class UpdateBodyEntryDto extends BodyEntryValuesDto {
  @IsOptional()
  @IsDayKey()
  date?: string;
}

export class ListBodyEntriesDto {
  @IsOptional()
  @IsDayKey()
  from?: string;

  @IsOptional()
  @IsDayKey()
  to?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(ENTRIES_MAX_PAGE_SIZE)
  limit?: number;
}

export class ProgressOverviewQueryDto {
  @IsOptional()
  @IsDayKey()
  from?: string;

  @IsOptional()
  @IsDayKey()
  to?: string;
}
