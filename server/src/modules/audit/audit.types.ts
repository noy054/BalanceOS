import { Prisma } from '../../../generated/prisma/client';

export const AUDIT_ENTITY = {
  CATALOG_SUBMISSION: 'CATALOG_SUBMISSION',
  CATALOG_ITEM: 'CATALOG_ITEM',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
} as const;

export type AuditEntity = (typeof AUDIT_ENTITY)[keyof typeof AUDIT_ENTITY];

export const AUDIT_ACTION = {
  SUBMISSION_APPROVED: 'SUBMISSION_APPROVED',
  SUBMISSION_REJECTED: 'SUBMISSION_REJECTED',
  SUBMISSION_MERGED: 'SUBMISSION_MERGED',
  CATALOG_ITEM_CREATED: 'CATALOG_ITEM_CREATED',
  CATALOG_ITEM_UPDATED: 'CATALOG_ITEM_UPDATED',
  CATALOG_ITEM_ARCHIVED: 'CATALOG_ITEM_ARCHIVED',
  CATALOG_ITEM_RESTORED: 'CATALOG_ITEM_RESTORED',
  ANNOUNCEMENT_CREATED: 'ANNOUNCEMENT_CREATED',
  ANNOUNCEMENT_UPDATED: 'ANNOUNCEMENT_UPDATED',
  ANNOUNCEMENT_PUBLISHED: 'ANNOUNCEMENT_PUBLISHED',
  ANNOUNCEMENT_UNPUBLISHED: 'ANNOUNCEMENT_UNPUBLISHED',
  ANNOUNCEMENT_ARCHIVED: 'ANNOUNCEMENT_ARCHIVED',
  ANNOUNCEMENT_RESTORED: 'ANNOUNCEMENT_RESTORED',
  ANNOUNCEMENT_DELETED: 'ANNOUNCEMENT_DELETED',
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

export type AuditEntry = {
  actorUserId: string;
  action: AuditAction;
  entityType: AuditEntity;
  entityId: string;
  summary?: string | null;
  details?: Prisma.InputJsonValue;
};

export type AuditClient = Pick<Prisma.TransactionClient, 'adminAuditLog'>;

export const AUDIT_LOG_SELECT = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  summary: true,
  details: true,
  createdAt: true,
  actor: { select: { id: true, email: true, fullName: true } },
} as const satisfies Prisma.AdminAuditLogSelect;

export type AuditLogRow = Prisma.AdminAuditLogGetPayload<{
  select: typeof AUDIT_LOG_SELECT;
}>;

export function diffFields<T extends object>(
  before: T,
  after: T,
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = (before as Record<string, unknown>)[key] ?? null;
    const to = (after as Record<string, unknown>)[key] ?? null;
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes[key] = { from, to };
    }
  }
  return changes;
}

export function toAuditData(entry: AuditEntry) {
  return {
    actorUserId: entry.actorUserId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    summary: entry.summary ?? null,
    details: entry.details,
  };
}

export function toJsonObject(value: object): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
