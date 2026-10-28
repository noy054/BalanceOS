import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AUDIT_LOG_SELECT,
  AuditClient,
  AuditEntry,
  AuditLogRow,
  toAuditData,
} from './audit.types';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry, client: AuditClient = this.prisma) {
    await client.adminAuditLog.create({ data: toAuditData(entry) });
  }

  list(params: {
    entityType?: string;
    entityId?: string;
    take: number;
    cursor?: string;
  }): Promise<AuditLogRow[]> {
    return this.prisma.adminAuditLog.findMany({
      where: {
        ...(params.entityType ? { entityType: params.entityType } : {}),
        ...(params.entityId ? { entityId: params.entityId } : {}),
      },
      select: AUDIT_LOG_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: params.take,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });
  }
}
