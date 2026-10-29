import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';

export const BODY_ENTRY_SELECT = {
  id: true,
  date: true,
  weightKg: true,
  waistCm: true,
  hipsCm: true,
  chestCm: true,
  upperArmCm: true,
  thighCm: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  photos: {
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  },
} as const satisfies Prisma.BodyEntrySelect;

export type BodyEntryRow = Prisma.BodyEntryGetPayload<{
  select: typeof BODY_ENTRY_SELECT;
}>;

export type BodyEntryWrite = Omit<
  Prisma.BodyEntryUncheckedCreateInput,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

const PHOTO_SELECT = {
  id: true,
  entryId: true,
  storageKey: true,
  mimeType: true,
  sizeBytes: true,
} as const satisfies Prisma.ProgressPhotoSelect;

export type ProgressPhotoRow = Prisma.ProgressPhotoGetPayload<{
  select: typeof PHOTO_SELECT;
}>;

function rangeWhere(
  from?: string,
  to?: string,
): Prisma.StringFilter | undefined {
  if (!from && !to) return undefined;
  return { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
}

@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(params: {
    userId: string;
    from?: string;
    to?: string;
    take: number;
    cursor?: string;
  }): Promise<BodyEntryRow[]> {
    return this.prisma.bodyEntry.findMany({
      where: {
        userId: params.userId,
        date: rangeWhere(params.from, params.to),
      },
      select: BODY_ENTRY_SELECT,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      take: params.take,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });
  }

  findForOverview(userId: string, from?: string, to?: string) {
    return this.prisma.bodyEntry.findMany({
      where: { userId, date: rangeWhere(from, to) },
      select: {
        date: true,
        createdAt: true,
        weightKg: true,
        waistCm: true,
        hipsCm: true,
        chestCm: true,
        upperArmCm: true,
        thighCm: true,
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });
  }

  countEntries(userId: string): Promise<number> {
    return this.prisma.bodyEntry.count({ where: { userId } });
  }

  findProfileWeight(userId: string) {
    return this.prisma.userNutritionSettings.findUnique({
      where: { userId },
      select: { weightKg: true },
    });
  }

  findOwned(userId: string, id: string): Promise<BodyEntryRow | null> {
    return this.prisma.bodyEntry.findFirst({
      where: { id, userId },
      select: BODY_ENTRY_SELECT,
    });
  }

  create(userId: string, data: BodyEntryWrite): Promise<BodyEntryRow> {
    return this.prisma.bodyEntry.create({
      data: { ...data, userId },
      select: BODY_ENTRY_SELECT,
    });
  }

  async update(
    userId: string,
    id: string,
    data: Partial<BodyEntryWrite>,
  ): Promise<BodyEntryRow | null> {
    const result = await this.prisma.bodyEntry.updateMany({
      where: { id, userId },
      data,
    });
    if (result.count === 0) return null;
    return this.findOwned(userId, id);
  }

  async delete(userId: string, id: string): Promise<string[] | null> {
    return this.prisma.$transaction(async (tx) => {
      const photos = await tx.progressPhoto.findMany({
        where: { entryId: id, userId },
        select: { storageKey: true },
      });
      const deleted = await tx.bodyEntry.deleteMany({ where: { id, userId } });
      if (deleted.count === 0) return null;
      return photos.map((photo) => photo.storageKey);
    });
  }

  countPhotos(entryId: string): Promise<number> {
    return this.prisma.progressPhoto.count({ where: { entryId } });
  }

  addPhoto(data: {
    entryId: string;
    userId: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
  }) {
    return this.prisma.progressPhoto.create({
      data,
      select: { id: true, createdAt: true },
    });
  }

  findOwnedPhoto(userId: string, id: string): Promise<ProgressPhotoRow | null> {
    return this.prisma.progressPhoto.findFirst({
      where: { id, userId },
      select: PHOTO_SELECT,
    });
  }

  async replacePhoto(
    userId: string,
    id: string,
    data: { storageKey: string; mimeType: string; sizeBytes: number },
  ): Promise<string | null> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.progressPhoto.findFirst({
        where: { id, userId },
        select: { storageKey: true },
      });
      if (!current) return null;
      await tx.progressPhoto.update({ where: { id }, data });
      return current.storageKey;
    });
  }

  async deletePhoto(userId: string, id: string): Promise<string | null> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.progressPhoto.findFirst({
        where: { id, userId },
        select: { storageKey: true },
      });
      if (!current) return null;
      await tx.progressPhoto.delete({ where: { id } });
      return current.storageKey;
    });
  }
}
