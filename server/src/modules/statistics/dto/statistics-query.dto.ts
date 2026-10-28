import { IsIn, IsOptional } from 'class-validator';
import { IsDayKey } from '../../../common/date/is-day-key.validator';

export type StatRange = '7D' | '14D' | '30D';

export class StatisticsQueryDto {
  @IsOptional()
  @IsIn(['7D', '14D', '30D'])
  range: StatRange = '7D';

  @IsOptional()
  @IsDayKey()
  endDate?: string;
}
