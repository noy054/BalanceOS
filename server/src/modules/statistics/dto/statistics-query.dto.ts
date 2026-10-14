import { IsIn, IsOptional } from 'class-validator';

export type StatRange = '7D' | '14D' | '30D';

export class StatisticsQueryDto {
  @IsOptional()
  @IsIn(['7D', '14D', '30D'])
  range: StatRange = '7D';
}
