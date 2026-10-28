import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { AnnouncementStatus } from '../../../generated/prisma/enums';
import { AuditEntry, toAuditData } from '../audit/audit.types';
import { AnnouncementState } from './announcement.rules';

const PERSON_SELECT = { id: true, email: true, fullName: true } as const;

export const ANNOUNCEMENT_SELECT = {
  id: true,
  status: true,
  kind: true,
  display: true,
  titleHe: true,
  titleEn: true,
  bodyHe: true,
  bodyEn: true,
  actionType: true,
  actionTarget: true,
  actionLabelHe: true,
  actionLabelEn: true,
  platforms: true,
  minAppVersion: true,
  maxAppVersion: true,
  publishAt: true,
  expiresAt: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: PERSON_SELECT },
  updatedBy: { select: PERSON_SELECT },
} as const satisfies Prisma.AnnouncementSelect;

export type AnnouncementRow = Prisma.AnnouncementGetPayload<{
  select: typeof ANNOUNCEMENT_SELECT;
}>;

export type AnnouncementWrite = Omit<
  Prisma.AnnouncementUncheckedCreateInput,
  'id' | 'createdAt' | 'updatedAt'
>;

function stateWhere(
  state: AnnouncementState,
  now: Date,
): Prisma.AnnouncementWhereInput {
  switch (state) {
    case 'DRAFT':
      return { status: AnnouncementStatus.DRAFT };
    case 'ARCHIVED':
      return { status: AnnouncementStatus.ARCHIVED };
    case 'SCHEDULED':
      return { status: AnnouncementStatus.PUBLISHED, publishAt: { gt: now } };
    case 'EXPIRED':
      return {
        status: AnnouncementStatus.PUBLISHED,
        OR: [{ publishAt: null }, { publishAt: { lte: now } }],
        expiresAt: { lte: now },
      };
    case 'ACTIVE':
      return liveWhere(now);
  }
}

function liveWhere(now: Date): Prisma.AnnouncementWhereInput {
  return {
    status: AnnouncementStatus.PUBLISHED,
    AND: [
      { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
      { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    ],
  };
}

@Injectable()
export class AnnouncementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(params: {
    state?: AnnouncementState;
    q?: string;
    take: number;
    cursor?: string;
    now: Date;
  }): Promise<AnnouncementRow[]> {
    const q = params.q?.trim();
    return this.prisma.announcement.findMany({
      where: {
        AND: [
          params.state ? stateWhere(params.state, params.now) : {},
          q
            ? {
                OR: [
                  { titleHe: { contains: q, mode: 'insensitive' } },
                  { titleEn: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      select: ANNOUNCEMENT_SELECT,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: params.take,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });
  }

  findById(id: string): Promise<AnnouncementRow | null> {
    return this.prisma.announcement.findUnique({
      where: { id },
      select: ANNOUNCEMENT_SELECT,
    });
  }

  async receiptStats(id: string) {
    const [seen, dismissed] = await Promise.all([
      this.prisma.announcementReceipt.count({ where: { announcementId: id } }),
      this.prisma.announcementReceipt.count({
        where: { announcementId: id, dismissedAt: { not: null } },
      }),
    ]);
    return { seen, dismissed };
  }

  async countStates(now: Date) {
    const [active, scheduled, drafts] = await Promise.all([
      this.prisma.announcement.count({ where: liveWhere(now) }),
      this.prisma.announcement.count({ where: stateWhere('SCHEDULED', now) }),
      this.prisma.announcement.count({ where: stateWhere('DRAFT', now) }),
    ]);
    return { active, scheduled, drafts };
  }

  create(data: AnnouncementWrite, audit: (id: string) => AuditEntry) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.announcement.create({
        data,
        select: ANNOUNCEMENT_SELECT,
      });
      await tx.adminAuditLog.create({
        data: toAuditData(audit(created.id)),
      });
      return created;
    });
  }

  update(
    id: string,
    expectedStatuses: AnnouncementStatus[],
    data: Prisma.AnnouncementUncheckedUpdateInput,
    audit: AuditEntry,
  ): Promise<AnnouncementRow | null> {
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.announcement.updateMany({
        where: { id, status: { in: expectedStatuses } },
        data,
      });
      if (changed.count === 0) return null;
      await tx.adminAuditLog.create({ data: toAuditData(audit) });
      return tx.announcement.findUniqueOrThrow({
        where: { id },
        select: ANNOUNCEMENT_SELECT,
      });
    });
  }

  deleteDraft(id: string, audit: AuditEntry): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const receipts = await tx.announcementReceipt.count({
        where: { announcementId: id },
      });
      if (receipts > 0) return false;
      const deleted = await tx.announcement.deleteMany({
        where: { id, status: AnnouncementStatus.DRAFT },
      });
      if (deleted.count === 0) return false;
      await tx.adminAuditLog.create({ data: toAuditData(audit) });
      return true;
    });
  }

  findLiveForUser(userId: string, now: Date) {
    return this.prisma.announcement.findMany({
      where: {
        ...liveWhere(now),
        receipts: { none: { userId, dismissedAt: { not: null } } },
      },
      select: {
        ...ANNOUNCEMENT_SELECT,
        receipts: { where: { userId }, select: { seenAt: true } },
      },
      orderBy: [{ publishAt: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });
  }

  findPublished(id: string) {
    return this.prisma.announcement.findFirst({
      where: { id, status: AnnouncementStatus.PUBLISHED },
      select: { id: true },
    });
  }

  markSeen(userId: string, announcementId: string) {
    return this.prisma.announcementReceipt.upsert({
      where: { userId_announcementId: { userId, announcementId } },
      create: { userId, announcementId },
      update: {},
      select: { seenAt: true, dismissedAt: true },
    });
  }

  dismiss(userId: string, announcementId: string) {
    const now = new Date();
    return this.prisma.announcementReceipt.upsert({
      where: { userId_announcementId: { userId, announcementId } },
      create: { userId, announcementId, dismissedAt: now },
      update: { dismissedAt: now },
      select: { seenAt: true, dismissedAt: true },
    });
  }
}
