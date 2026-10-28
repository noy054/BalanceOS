import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { normalizeBarcode } from '../../common/barcode/barcode.utils';
import { Page, toPage } from '../../common/pagination/page.types';
import {
  pickNutritionFields,
  resolveNutrition,
} from '../pantry/product-nutrition.normalizer';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ENTITY } from '../audit/audit.types';
import { CatalogAdminRepository } from './catalog-admin.repository';
import { CatalogProductData, fromCatalogRow } from './catalog-data';
import {
  CatalogItemView,
  toHistoryView,
  toItemView,
} from './catalog-review.service';
import {
  ListCatalogItemsDto,
  UpdateCatalogItemDto,
} from './dto/catalog-review.dto';
import { ProductCatalogItemAdminRow } from './types/product-catalog.types';

const DEFAULT_PAGE = 20;

type Person = { id: string; email: string; fullName: string } | null;

export type CatalogItemAdminView = CatalogItemView & {
  createdAt: Date;
  updatedAt: Date;
  createdBy: Person;
  updatedBy: Person;
  archivedBy: Person;
  linkedProducts: number;
};

function toAdminView(row: ProductCatalogItemAdminRow): CatalogItemAdminView {
  return {
    ...toItemView(row),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdByUser,
    updatedBy: row.updatedByUser,
    archivedBy: row.archivedByUser,
    linkedProducts: row._count.pantryProducts,
  };
}

@Injectable()
export class CatalogAdminService {
  constructor(
    private readonly repo: CatalogAdminRepository,
    private readonly audit: AuditService,
  ) {}

  async list(dto: ListCatalogItemsDto): Promise<Page<CatalogItemAdminView>> {
    const limit = dto.limit ?? DEFAULT_PAGE;
    const rows = await this.repo.list({
      q: dto.q,
      state: dto.state ?? 'active',
      source: dto.source,
      take: limit + 1,
      cursor: dto.cursor,
    });
    const page = toPage(rows, limit);
    return { ...page, items: page.items.map(toAdminView) };
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Catalog product not found');
    const [submissions, history] = await Promise.all([
      this.repo.submissionsFor(id),
      this.audit.recent(AUDIT_ENTITY.CATALOG_ITEM, id),
    ]);
    return {
      ...toAdminView(row),
      submissions,
      history: history.map(toHistoryView),
    };
  }

  counts() {
    return this.repo.counts();
  }

  async update(adminId: string, id: string, dto: UpdateCatalogItemDto) {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Catalog product not found');
    const base = fromCatalogRow(current);
    const nutrition = resolveNutrition(pickNutritionFields(base), dto);
    const normalized =
      dto.barcode !== undefined ? normalizeBarcode(dto.barcode) : null;

    const data: CatalogProductData = {
      ...base,
      ...nutrition,
      name: dto.name.trim(),
      brand: dto.brand !== undefined ? dto.brand?.trim() || null : base.brand,
      imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : base.imageUrl,
      barcode: normalized ? normalized.digits : base.barcode,
    };

    try {
      const updated = await this.repo.update({
        id,
        adminId,
        data,
        normalizedBarcode: normalized
          ? normalized.canonical
          : current.normalizedBarcode,
        note: dto.note?.trim() || null,
      });
      if (!updated) throw new NotFoundException('Catalog product not found');
      return toAdminView(updated);
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Another catalog product already uses this barcode',
        );
      }
      throw err;
    }
  }

  async archive(adminId: string, id: string, reason: string) {
    return this.setArchived(adminId, id, true, reason.trim());
  }

  async restore(adminId: string, id: string) {
    return this.setArchived(adminId, id, false, null);
  }

  private async setArchived(
    adminId: string,
    id: string,
    archive: boolean,
    reason: string | null,
  ) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Catalog product not found');
    const updated = await this.repo.setArchived({
      id,
      adminId,
      archive,
      reason,
    });
    if (!updated) {
      throw new ConflictException(
        archive
          ? 'This product is already archived'
          : 'This product is not archived',
      );
    }
    return toAdminView(updated);
  }
}
