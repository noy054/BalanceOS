import { Injectable } from '@nestjs/common';
import { Page, toPage } from '../../common/pagination/page.types';
import { AuditRepository } from './audit.repository';
import { AuditClient, AuditEntry, AuditLogRow } from './audit.types';

const DEFAULT_LIMIT = 30;

@Injectable()
export class AuditService {
  constructor(private readonly repo: AuditRepository) {}

  record(entry: AuditEntry, client?: AuditClient) {
    return this.repo.record(entry, client);
  }

  async list(params: {
    entityType?: string;
    entityId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<Page<AuditLogRow>> {
    const limit = params.limit ?? DEFAULT_LIMIT;
    const rows = await this.repo.list({
      entityType: params.entityType,
      entityId: params.entityId,
      take: limit + 1,
      cursor: params.cursor,
    });
    return toPage(rows, limit);
  }

  recent(entityType: string, entityId: string, limit = 20) {
    return this.repo.list({ entityType, entityId, take: limit });
  }
}
