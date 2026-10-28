import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  AnnouncementActionType,
  AnnouncementDisplay,
  AnnouncementKind,
} from '../../../../generated/prisma/enums';
import {
  ANNOUNCEMENT_PLATFORMS,
  ANNOUNCEMENT_STATES,
  APP_VERSION_PATTERN,
  AnnouncementState,
} from '../announcement.rules';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const emptyToNull = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export class UpsertAnnouncementDto {
  @IsEnum(AnnouncementKind)
  kind: AnnouncementKind;

  @IsEnum(AnnouncementDisplay)
  display: AnnouncementDisplay;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleHe: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleEn: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  bodyHe: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  bodyEn: string;

  @IsEnum(AnnouncementActionType)
  actionType: AnnouncementActionType;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(500)
  actionTarget?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(40)
  actionLabelHe?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(40)
  actionLabelEn?: string | null;

  @IsArray()
  @ArrayUnique()
  @IsIn(ANNOUNCEMENT_PLATFORMS, { each: true })
  platforms: string[];

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @Matches(APP_VERSION_PATTERN)
  minAppVersion?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @Matches(APP_VERSION_PATTERN)
  maxAppVersion?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsDateString({ strict: true })
  publishAt?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsDateString({ strict: true })
  expiresAt?: string | null;
}

export class PublishAnnouncementDto {
  @IsOptional()
  @IsDateString({ strict: true })
  publishAt?: string;
}

export class ListAnnouncementsDto {
  @IsOptional()
  @IsIn(ANNOUNCEMENT_STATES)
  state?: AnnouncementState;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class ActiveAnnouncementsQueryDto {
  @IsOptional()
  @IsIn(ANNOUNCEMENT_PLATFORMS)
  platform?: string;

  @IsOptional()
  @IsString()
  @Matches(APP_VERSION_PATTERN)
  appVersion?: string;
}
