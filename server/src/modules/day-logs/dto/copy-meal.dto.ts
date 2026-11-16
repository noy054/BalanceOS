import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
} from 'class-validator';
import { IsDayKey } from '../../../common/date/is-day-key.validator';

export class CopyMealDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsDayKey({ each: true })
  targetDates: string[];

  @IsOptional()
  @IsDayKey()
  today?: string;
}
