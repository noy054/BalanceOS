import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import {
  CatalogSubmissionStatus,
  ProductSource,
  ProductVerificationStatus,
} from '../../../generated/prisma/enums';
import {
  CATALOG_ITEM_ADMIN_SELECT,
  ProductCatalogItemAdminRow,
} from './types/product-catalog.types';
import { CatalogProductData, fromCatalogRow, toJson } from './catalog-data';
import { catalogFields } from './catalog-review.repository';
import { CatalogItemState } from './dto/catalog-review.dto';
import {
  AUDIT_ACTION,
  AUDIT_ENTITY,
  diffFields,
  toAuditData,
  toJsonObject,
} from '../audit/audit.types';

const SUBMISSION_SUMMARY_SELECT = {
  id: true,
  kind: true,
  status: true,
  productName: true,
  createdAt: true,
  reviewedAt: true,
  user: { select: { id: true, email: true, fullName: true } },
} as const satisfies Prisma.CatalogSubmissionSelect;

export type ItemSubmissionRow = Prisma.CatalogSubmissionGetPayload<{
  select: typeof SUBMISSION_SUMMARY_SELECT;
}>;

@Injectable()
export class CatalogAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(params: {
    q?: string;
    state: CatalogItemState;
    source?: ProductSource;
    take: number;
    cursor?: string;
  }): Promise<ProductCatalogItemAdminRow[]> {
    const q = params.q?.trim();
    return this.prisma.productCatalogItem.findMany({
      where: {
        ...(params.state === 'active' ? { archivedAt: null } : {}),
        ...(params.state === 'archived' ? { archivedAt: { not: null } } : {}),
        ...(params.source ? { source: params.source } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { brand: { contains: q, mode: 'insensitive' } },
                { normalizedBarcode: { contains: q } },
              ],
            }
          : {}),
      },
      select: CATALOG_ITEM_ADMIN_SELECT,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: params.take,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });
  }

  findById(id: string): Promise<ProductCatalogItemAdminRow | null> {
    return this.prisma.productCatalogItem.findUnique({
      where: { id },
      select: CATALOG_ITEM_ADMIN_SELECT,
    });
  }

  submissionsFor(catalogItemId: string): Promise<ItemSubmissionRow[]> {
    return this.prisma.catalogSubmission.findMany({
      where: { catalogItemId },
      select: SUBMISSION_SUMMARY_SELECT,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async counts() {
    const [active, archived] = await Promise.all([
      this.prisma.productCatalogItem.count({ where: { archivedAt: null } }),
      this.prisma.productCatalogItem.count({
        where: { archivedAt: { not: null } },
      }),
    ]);
    return { active, archived };
  }

  update(params: {
    id: string;
    adminId: string;
    data: CatalogProductData;
    normalizedBarcode: string | null;
    note: string | null;
  }): Promise<ProductCatalogItemAdminRow | null> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.productCatalogItem.findUnique({
        where: { id: params.id },
        select: CATALOG_ITEM_ADMIN_SELECT,
      });
      if (!current) return null;
      const before = fromCatalogRow(current);
      await tx.productCatalogItem.update({
        where: { id: params.id },
        data: {
          ...catalogFields(params.data),
          barcode: params.data.barcode,
          normalizedBarcode: params.normalizedBarcode,
          originalData: current.originalData ?? toJson(before),
          verificationStatus: ProductVerificationStatus.ADMIN_VERIFIED,
          updatedByUserId: params.adminId,
        },
      });
      await tx.adminAuditLog.create({
        data: toAuditData({
          actorUserId: params.adminId,
          action: AUDIT_ACTION.CATALOG_ITEM_UPDATED,
          entityType: AUDIT_ENTITY.CATALOG_ITEM,
          entityId: params.id,
          summary: params.data.name,
          details: toJsonObject({
            note: params.note,
            changes: diffFields(before, params.data),
          }),
        }),
      });
      return tx.productCatalogItem.findUnique({
        where: { id: params.id },
        select: CATALOG_ITEM_ADMIN_SELECT,
      });
    });
  }

  setArchived(params: {
    id: string;
    adminId: string;
    archive: boolean;
    reason: string | null;
  }): Promise<ProductCatalogItemAdminRow | null> {
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.productCatalogItem.updateMany({
        where: {
          id: params.id,
          archivedAt: params.archive ? null : { not: null },
        },
        data: params.archive
          ? {
              archivedAt: new Date(),
              archivedByUserId: params.adminId,
              updatedByUserId: params.adminId,
            }
          : {
              archivedAt: null,
              archivedByUserId: null,
              updatedByUserId: params.adminId,
            },
      });
      if (changed.count === 0) return null;
      const item = await tx.productCatalogItem.findUniqueOrThrow({
        where: { id: params.id },
        select: CATALOG_ITEM_ADMIN_SELECT,
      });
      await tx.adminAuditLog.create({
        data: toAuditData({
          actorUserId: params.adminId,
          action: params.archive
            ? AUDIT_ACTION.CATALOG_ITEM_ARCHIVED
            : AUDIT_ACTION.CATALOG_ITEM_RESTORED,
          entityType: AUDIT_ENTITY.CATALOG_ITEM,
          entityId: params.id,
          summary: item.name,
          details: { reason: params.reason },
        }),
      });
      return item;
    });
  }

  pendingSubmissionCount(catalogItemId: string) {
    return this.prisma.catalogSubmission.count({
      where: { catalogItemId, status: CatalogSubmissionStatus.PENDING },
    });
  }
}
