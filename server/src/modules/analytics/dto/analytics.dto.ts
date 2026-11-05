import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsISO8601,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import {
  ANALYTICS_ACTIONS,
  ANALYTICS_STATUSES,
  MAX_EVENTS_PER_BATCH,
} from '../analytics.constants';

export class TrackEventDto {
  @IsString()
  @Matches(/^[A-Za-z0-9-]{8,64}$/)
  id!: string;

  @IsIn(Object.keys(ANALYTICS_ACTIONS))
  action!: string;

  @IsIn(ANALYTICS_STATUSES)
  status!: string;

  @IsISO8601()
  occurredAt!: string;
}

export class TrackEventsDto {
  @IsArray()
  @ArrayMaxSize(MAX_EVENTS_PER_BATCH)
  @ValidateNested({ each: true })
  @Type(() => TrackEventDto)
  events!: TrackEventDto[];
}

export class AnalyticsDashboardQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to!: string;
}
