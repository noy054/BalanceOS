import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { CatalogReviewService } from '../product-catalog/catalog-review.service';
import { CatalogAdminService } from '../product-catalog/catalog-admin.service';
import { toHistoryView } from '../product-catalog/catalog-review.service';
import { AnnouncementsService } from '../announcements/announcements.service';
import { ListActivityDto } from './dto/list-activity.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly review: CatalogReviewService,
    private readonly catalog: CatalogAdminService,
    private readonly announcements: AnnouncementsService,
    private readonly audit: AuditService,
  ) {}

  async overview() {
    const [submissions, catalog, announcements, recent] = await Promise.all([
      this.review.summary(),
      this.catalog.counts(),
      this.announcements.counts(),
      this.audit.list({ limit: 8 }),
    ]);
    return {
      submissions,
      catalog,
      announcements,
      recentActivity: recent.items.map(toHistoryView),
    };
  }

  async activity(dto: ListActivityDto) {
    const page = await this.audit.list(dto);
    return { ...page, items: page.items.map(toHistoryView) };
  }
}
