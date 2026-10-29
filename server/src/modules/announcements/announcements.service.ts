import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnnouncementActionType,
  AnnouncementStatus,
} from '../../../generated/prisma/enums';
import { toPage } from '../../common/pagination/page.types';
import { AuditService } from '../audit/audit.service';
import {
  AUDIT_ACTION,
  AUDIT_ENTITY,
  AuditAction,
  AuditEntry,
  diffFields,
  toJsonObject,
} from '../audit/audit.types';
import { toHistoryView } from '../product-catalog/catalog-review.service';
import {
  ANNOUNCEMENT_ROUTES,
  AnnouncementRoute,
  compareVersions,
  effectiveState,
  isSafeHttpsUrl,
  matchesAudience,
} from './announcement.rules';
import {
  AnnouncementRow,
  AnnouncementsRepository,
  AnnouncementWrite,
} from './announcements.repository';
import {
  ActiveAnnouncementsQueryDto,
  ListAnnouncementsDto,
  UpsertAnnouncementDto,
} from './dto/announcement.dto';

const DEFAULT_PAGE = 20;
const LIVE_LIMIT = 20;

type ContentFields = Omit<
  AnnouncementWrite,
  'status' | 'createdByUserId' | 'updatedByUserId' | 'archivedAt'
>;

function toAdminView(row: AnnouncementRow, now = new Date()) {
  return { ...row, state: effectiveState(row, now) };
}

function toPublicView(row: AnnouncementRow & { receipts: { seenAt: Date }[] }) {
  return {
    id: row.id,
    kind: row.kind,
    display: row.display,
    titleHe: row.titleHe,
    titleEn: row.titleEn,
    bodyHe: row.bodyHe,
    bodyEn: row.bodyEn,
    actionType: row.actionType,
    actionTarget: row.actionTarget,
    actionLabelHe: row.actionLabelHe,
    actionLabelEn: row.actionLabelEn,
    publishAt: row.publishAt,
    expiresAt: row.expiresAt,
    seen: row.receipts.length > 0,
  };
}

function snapshot(row: AnnouncementRow) {
  return {
    kind: row.kind,
    display: row.display,
    titleHe: row.titleHe,
    titleEn: row.titleEn,
    bodyHe: row.bodyHe,
    bodyEn: row.bodyEn,
    actionType: row.actionType,
    actionTarget: row.actionTarget,
    actionLabelHe: row.actionLabelHe,
    actionLabelEn: row.actionLabelEn,
    platforms: row.platforms,
    minAppVersion: row.minAppVersion,
    maxAppVersion: row.maxAppVersion,
    publishAt: row.publishAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
  };
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Invalid date');
  }
  return date;
}

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly repo: AnnouncementsRepository,
    private readonly audit: AuditService,
  ) {}

  validateContent(
    dto: UpsertAnnouncementDto,
    fallbackPublishAt: Date | null = null,
  ): ContentFields {
    let actionTarget: string | null = null;
    let actionLabelHe: string | null = null;
    let actionLabelEn: string | null = null;

    if (dto.actionType !== AnnouncementActionType.NONE) {
      const target = dto.actionTarget?.trim() ?? '';
      if (dto.actionType === AnnouncementActionType.ROUTE) {
        if (!ANNOUNCEMENT_ROUTES.includes(target as AnnouncementRoute)) {
          throw new BadRequestException('Choose a supported app screen');
        }
      } else if (!isSafeHttpsUrl(target)) {
        throw new BadRequestException('Links must be valid https:// URLs');
      }
      if (!dto.actionLabelHe?.trim() || !dto.actionLabelEn?.trim()) {
        throw new BadRequestException(
          'Action buttons need a Hebrew and an English label',
        );
      }
      actionTarget = target;
      actionLabelHe = dto.actionLabelHe.trim();
      actionLabelEn = dto.actionLabelEn.trim();
    }

    const minAppVersion = dto.minAppVersion ?? null;
    const maxAppVersion = dto.maxAppVersion ?? null;
    if (
      minAppVersion &&
      maxAppVersion &&
      compareVersions(minAppVersion, maxAppVersion) > 0
    ) {
      throw new BadRequestException(
        'The minimum version must not be higher than the maximum version',
      );
    }

    const publishAt = parseDate(dto.publishAt) ?? fallbackPublishAt;
    const expiresAt = parseDate(dto.expiresAt);
    if (publishAt && expiresAt && expiresAt <= publishAt) {
      throw new BadRequestException(
        'The end time must be after the start time',
      );
    }

    return {
      kind: dto.kind,
      display: dto.display,
      titleHe: dto.titleHe.trim(),
      titleEn: dto.titleEn.trim(),
      bodyHe: dto.bodyHe.trim(),
      bodyEn: dto.bodyEn.trim(),
      actionType: dto.actionType,
      actionTarget,
      actionLabelHe,
      actionLabelEn,
      platforms: [...new Set(dto.platforms)].sort(),
      minAppVersion,
      maxAppVersion,
      publishAt,
      expiresAt,
    };
  }

  async list(dto: ListAnnouncementsDto) {
    const now = new Date();
    const limit = dto.limit ?? DEFAULT_PAGE;
    const rows = await this.repo.list({
      state: dto.state,
      q: dto.q,
      take: limit + 1,
      cursor: dto.cursor,
      now,
    });
    const page = toPage(rows, limit);
    return {
      ...page,
      items: page.items.map((row) => toAdminView(row, now)),
    };
  }

  async getById(id: string) {
    const row = await this.require(id);
    const [stats, history] = await Promise.all([
      this.repo.receiptStats(id),
      this.audit.recent(AUDIT_ENTITY.ANNOUNCEMENT, id),
    ]);
    return { ...toAdminView(row), stats, history: history.map(toHistoryView) };
  }

  counts() {
    return this.repo.countStates(new Date());
  }

  async create(adminId: string, dto: UpsertAnnouncementDto) {
    const content = this.validateContent(dto);
    const created = await this.repo.create(
      {
        ...content,
        status: AnnouncementStatus.DRAFT,
        createdByUserId: adminId,
        updatedByUserId: adminId,
      },
      (id) => ({
        actorUserId: adminId,
        action: AUDIT_ACTION.ANNOUNCEMENT_CREATED,
        entityType: AUDIT_ENTITY.ANNOUNCEMENT,
        entityId: id,
        summary: content.titleEn,
      }),
    );
    return toAdminView(created);
  }

  async update(adminId: string, id: string, dto: UpsertAnnouncementDto) {
    const current = await this.require(id);
    if (current.status === AnnouncementStatus.ARCHIVED) {
      throw new ConflictException('Restore the announcement before editing it');
    }
    const content = this.validateContent(
      dto,
      current.status === AnnouncementStatus.PUBLISHED
        ? current.publishAt
        : null,
    );
    const before = snapshot(current);
    const after = snapshot({ ...current, ...content } as AnnouncementRow);
    return this.transition(
      adminId,
      current,
      [current.status],
      { ...content, updatedByUserId: adminId },
      AUDIT_ACTION.ANNOUNCEMENT_UPDATED,
      { changes: diffFields(before, after) },
    );
  }

  async publish(adminId: string, id: string, publishAt?: string) {
    const current = await this.require(id);
    if (current.status !== AnnouncementStatus.DRAFT) {
      throw new ConflictException('Only drafts can be published');
    }
    const start = parseDate(publishAt) ?? new Date();
    if (current.expiresAt && current.expiresAt <= start) {
      throw new BadRequestException(
        'The end time must be after the publish time',
      );
    }
    return this.transition(
      adminId,
      current,
      [AnnouncementStatus.DRAFT],
      {
        status: AnnouncementStatus.PUBLISHED,
        publishAt: start,
        updatedByUserId: adminId,
      },
      AUDIT_ACTION.ANNOUNCEMENT_PUBLISHED,
      { publishAt: start.toISOString() },
    );
  }

  async unpublish(adminId: string, id: string) {
    const current = await this.require(id);
    return this.transition(
      adminId,
      current,
      [AnnouncementStatus.PUBLISHED],
      { status: AnnouncementStatus.DRAFT, updatedByUserId: adminId },
      AUDIT_ACTION.ANNOUNCEMENT_UNPUBLISHED,
    );
  }

  async archive(adminId: string, id: string) {
    const current = await this.require(id);
    return this.transition(
      adminId,
      current,
      [AnnouncementStatus.DRAFT, AnnouncementStatus.PUBLISHED],
      {
        status: AnnouncementStatus.ARCHIVED,
        archivedAt: new Date(),
        updatedByUserId: adminId,
      },
      AUDIT_ACTION.ANNOUNCEMENT_ARCHIVED,
    );
  }

  async restore(adminId: string, id: string) {
    const current = await this.require(id);
    return this.transition(
      adminId,
      current,
      [AnnouncementStatus.ARCHIVED],
      {
        status: AnnouncementStatus.DRAFT,
        archivedAt: null,
        updatedByUserId: adminId,
      },
      AUDIT_ACTION.ANNOUNCEMENT_RESTORED,
    );
  }

  async remove(adminId: string, id: string): Promise<void> {
    const current = await this.require(id);
    if (current.status !== AnnouncementStatus.DRAFT) {
      throw new ConflictException(
        'Only drafts can be deleted. Archive it instead.',
      );
    }
    const deleted = await this.repo.deleteDraft(id, {
      actorUserId: adminId,
      action: AUDIT_ACTION.ANNOUNCEMENT_DELETED,
      entityType: AUDIT_ENTITY.ANNOUNCEMENT,
      entityId: id,
      summary: current.titleEn,
    });
    if (!deleted) {
      throw new ConflictException(
        'This announcement was already shown to users. Archive it instead.',
      );
    }
  }

  async activeForUser(userId: string, query: ActiveAnnouncementsQueryDto) {
    const rows = await this.repo.findLiveForUser(
      userId,
      query.platform ?? null,
      new Date(),
    );
    return rows
      .filter((row) => matchesAudience(row, query))
      .slice(0, LIVE_LIMIT)
      .map(toPublicView);
  }

  async markSeen(userId: string, id: string) {
    await this.requirePublished(id);
    return this.repo.markSeen(userId, id);
  }

  async dismiss(userId: string, id: string) {
    await this.requirePublished(id);
    return this.repo.dismiss(userId, id);
  }

  private async requirePublished(id: string) {
    const row = await this.repo.findPublished(id);
    if (!row) throw new NotFoundException('Announcement not found');
  }

  private async require(id: string): Promise<AnnouncementRow> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Announcement not found');
    return row;
  }

  private async transition(
    adminId: string,
    current: AnnouncementRow,
    expected: AnnouncementStatus[],
    data: Parameters<AnnouncementsRepository['update']>[2],
    action: AuditAction,
    details?: object,
  ) {
    if (!expected.includes(current.status)) {
      throw new ConflictException(
        'The announcement is not in a state that allows this action',
      );
    }
    const entry: AuditEntry = {
      actorUserId: adminId,
      action,
      entityType: AUDIT_ENTITY.ANNOUNCEMENT,
      entityId: current.id,
      summary: current.titleEn,
      ...(details ? { details: toJsonObject(details) } : {}),
    };
    const updated = await this.repo.update(current.id, expected, data, entry);
    if (!updated) {
      throw new ConflictException(
        'The announcement changed in the meantime. Reload and try again.',
      );
    }
    return toAdminView(updated);
  }
}
