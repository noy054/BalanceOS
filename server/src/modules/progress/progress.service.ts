import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ReadStream } from 'fs';
import { daysBetween, utcDayKey } from '../../common/date/day-key';
import { Page, toPage } from '../../common/pagination/page.types';
import {
  CreateBodyEntryDto,
  ListBodyEntriesDto,
  ProgressOverviewQueryDto,
  UpdateBodyEntryDto,
} from './dto/body-entry.dto';
import { detectImageKind } from './image-signature';
import { latestValues, summarizeMetrics } from './progress.calculations';
import {
  BODY_METRICS,
  ENTRIES_PAGE_SIZE,
  MAX_ENTRY_FUTURE_DAYS,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_ENTRY,
} from './progress.constants';
import { ProgressPhotoStorage } from './progress-photo.storage';
import {
  BodyEntryRow,
  BodyEntryWrite,
  ProgressRepository,
} from './progress.repository';

export type UploadedPhoto = {
  buffer: Buffer;
  size: number;
};

export type PhotoStream = {
  stream: ReadStream;
  mimeType: string;
  size: number;
};

function round1(value: number | null | undefined): number | null | undefined {
  if (value === undefined || value === null) return value;
  return Math.round(value * 10) / 10;
}

function cleanNote(note: string | null | undefined): string | null | undefined {
  if (note === undefined) return undefined;
  return note?.trim() || null;
}

function toValues(dto: UpdateBodyEntryDto): Partial<BodyEntryWrite> {
  const values: Partial<BodyEntryWrite> = {};
  for (const metric of BODY_METRICS) {
    const value = round1(dto[metric]);
    if (value !== undefined) values[metric] = value;
  }
  const note = cleanNote(dto.note);
  if (note !== undefined) values.note = note;
  if (dto.date !== undefined) values.date = dto.date;
  return values;
}

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    private readonly repo: ProgressRepository,
    private readonly storage: ProgressPhotoStorage,
  ) {}

  async list(
    userId: string,
    dto: ListBodyEntriesDto,
  ): Promise<Page<BodyEntryRow>> {
    const limit = dto.limit ?? ENTRIES_PAGE_SIZE;
    const rows = await this.repo.list({
      userId,
      from: dto.from,
      to: dto.to,
      take: limit + 1,
      cursor: dto.cursor,
    });
    return toPage(rows, limit);
  }

  async get(userId: string, id: string): Promise<BodyEntryRow> {
    const row = await this.repo.findOwned(userId, id);
    if (!row) throw new NotFoundException('Entry not found');
    return row;
  }

  async overview(userId: string, dto: ProgressOverviewQueryDto) {
    if (dto.from && dto.to && dto.from > dto.to) {
      throw new BadRequestException(
        'The start date must be before the end date',
      );
    }
    const [inRange, all, settings, entryCount] = await Promise.all([
      this.repo.findForOverview(userId, dto.from, dto.to),
      this.repo.findForOverview(userId),
      this.repo.findProfileWeight(userId),
      this.repo.countEntries(userId),
    ]);
    return {
      from: dto.from ?? null,
      to: dto.to ?? null,
      entryCount,
      rangeEntryCount: inRange.length,
      profileWeightKg: settings?.weightKg ?? null,
      latest: latestValues(all),
      metrics: summarizeMetrics(inRange),
    };
  }

  async create(userId: string, dto: CreateBodyEntryDto): Promise<BodyEntryRow> {
    this.assertDate(dto.date);
    const values = toValues(dto);
    return this.repo.create(userId, { ...values, date: dto.date });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateBodyEntryDto,
  ): Promise<BodyEntryRow> {
    if (dto.date !== undefined) this.assertDate(dto.date);
    const updated = await this.repo.update(userId, id, toValues(dto));
    if (!updated) throw new NotFoundException('Entry not found');
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const keys = await this.repo.delete(userId, id);
    if (keys === null) throw new NotFoundException('Entry not found');
    await this.discard(keys);
  }

  async addPhoto(
    userId: string,
    entryId: string,
    file: UploadedPhoto | undefined,
  ) {
    const entry = await this.get(userId, entryId);
    if (entry.photos.length >= MAX_PHOTOS_PER_ENTRY) {
      throw new ConflictException(
        `An entry can have up to ${MAX_PHOTOS_PER_ENTRY} photos`,
      );
    }
    const stored = await this.store(userId, file);
    try {
      return await this.repo.addPhoto({ entryId, userId, ...stored });
    } catch (err: unknown) {
      await this.discard([stored.storageKey]);
      throw err;
    }
  }

  async replacePhoto(
    userId: string,
    id: string,
    file: UploadedPhoto | undefined,
  ) {
    const current = await this.repo.findOwnedPhoto(userId, id);
    if (!current) throw new NotFoundException('Photo not found');
    const stored = await this.store(userId, file);
    const previousKey = await this.repo
      .replacePhoto(userId, id, stored)
      .catch(async (err: unknown) => {
        await this.discard([stored.storageKey]);
        throw err;
      });
    if (previousKey === null) {
      await this.discard([stored.storageKey]);
      throw new NotFoundException('Photo not found');
    }
    await this.discard([previousKey]);
    return { id };
  }

  async deletePhoto(userId: string, id: string): Promise<void> {
    const key = await this.repo.deletePhoto(userId, id);
    if (key === null) throw new NotFoundException('Photo not found');
    await this.discard([key]);
  }

  async openPhoto(userId: string, id: string): Promise<PhotoStream> {
    const photo = await this.repo.findOwnedPhoto(userId, id);
    if (!photo) throw new NotFoundException('Photo not found');
    try {
      const { stream, size } = await this.storage.open(photo.storageKey);
      return { stream, size, mimeType: photo.mimeType };
    } catch {
      throw new NotFoundException('Photo file is missing');
    }
  }

  removeUserFiles(userId: string): Promise<void> {
    return this.storage.removeUser(userId);
  }

  private assertDate(date: string): void {
    if (daysBetween(utcDayKey(), date) > MAX_ENTRY_FUTURE_DAYS) {
      throw new BadRequestException('Entries cannot be dated in the future');
    }
  }

  private async store(userId: string, file: UploadedPhoto | undefined) {
    if (!file || file.size === 0) {
      throw new BadRequestException('Choose a photo to upload');
    }
    if (file.size > MAX_PHOTO_BYTES) {
      throw new BadRequestException('The photo is too large');
    }
    const kind = detectImageKind(file.buffer);
    if (!kind) {
      throw new BadRequestException(
        'Photos must be JPEG, PNG, WebP or HEIC images',
      );
    }
    const storageKey = this.storage.createKey(userId, kind.extension);
    await this.storage.save(storageKey, file.buffer);
    return { storageKey, mimeType: kind.mimeType, sizeBytes: file.size };
  }

  private async discard(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.storage.remove(keys);
    } catch (err: unknown) {
      this.logger.warn(`Could not remove progress photo files: ${String(err)}`);
    }
  }
}
