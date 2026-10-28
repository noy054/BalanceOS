import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import {
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
  ProductSource,
  ProductVerificationStatus,
} from '../../../generated/prisma/enums';
import { CATALOG_ITEM_REVIEW_SELECT } from './types/product-catalog.types';
import {
  CatalogProductData,
  fromCatalogRow,
  isShareableImage,
  toJson,
} from './catalog-data';
import {
  AUDIT_ACTION,
  AUDIT_ENTITY,
  AuditEntry,
  diffFields,
  toAuditData,
  toJsonObject,
} from '../audit/audit.types';

const SUBMISSION_INCLUDE = {
  user: { select: { id: true, email: true, fullName: true } },
  reviewedBy: { select: { id: true, email: true, fullName: true } },
  catalogItem: { select: CATALOG_ITEM_REVIEW_SELECT },
} as const satisfies Prisma.CatalogSubmissionInclude;

export type SubmissionRow = Prisma.CatalogSubmissionGetPayload<{
  include: typeof SUBMISSION_INCLUDE;
}>;

export type ApproveParams = {
  submissionId: string;
  adminId: string;
  data: CatalogProductData;
  normalizedBarcode: string | null;
  targetCatalogItemId: string | null;
  submitterId: string;
  pantryProductId: string | null;
  proposedOriginal: CatalogProductData;
  reviewNote: string | null;
  kind: CatalogSubmissionKind;
};

export type MergeParams = {
  submissionId: string;
  adminId: string;
  targetCatalogItemId: string;
  submitterId: string;
  pantryProductId: string | null;
  normalizedBarcode: string | null;
  reviewNote: string | null;
  productName: string;
};

export function catalogFields(data: CatalogProductData) {
  return {
    name: data.name,
    brand: data.brand,
    nutritionBasis: data.nutritionBasis,
    caloriesPer100g: data.caloriesPer100g,
    proteinPer100g: data.proteinPer100g,
    carbsPer100g: data.carbsPer100g,
    fatPer100g: data.fatPer100g,
    fiberPer100g: data.fiberPer100g,
    caloriesPerServing: data.caloriesPerServing,
    proteinPerServing: data.proteinPerServing,
    carbsPerServing: data.carbsPerServing,
    fatPerServing: data.fatPerServing,
    fiberPerServing: data.fiberPerServing,
    servingSizeGrams: data.servingSizeG,
    servingSizeText: data.servingSizeText,
    servingQuantity: data.servingQuantity,
    servingUnit: data.servingUnit,
    ...(isShareableImage(data.imageUrl) ? { imageUrl: data.imageUrl } : {}),
    ...(data.nutrients ? { nutrients: data.nutrients } : {}),
    ...(data.caloriesPer100g === null
      ? {
          nutrients: Prisma.DbNull,
          sugarPer100g: null,
          saturatedFatPer100g: null,
          sodiumPer100g: null,
          saltPer100g: null,
        }
      : {}),
  };
}

async function linkPantryProduct(
  tx: Prisma.TransactionClient,
  submitterId: string,
  pantryProductId: string | null,
  catalogItemId: string,
) {
  if (!pantryProductId) return;
  const alreadyLinked = await tx.pantryProduct.findFirst({
    where: { userId: submitterId, catalogItemId },
    select: { id: true },
  });
  if (alreadyLinked) return;
  await tx.pantryProduct.updateMany({
    where: { id: pantryProductId, catalogItemId: null },
    data: { catalogItemId },
  });
}

function claimPending(
  tx: Prisma.TransactionClient,
  id: string,
  status: CatalogSubmissionStatus,
) {
  return tx.catalogSubmission.updateMany({
    where: { id, status: CatalogSubmissionStatus.PENDING },
    data: { status },
  });
}

@Injectable()
export class CatalogReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCatalogItem(id: string) {
    return this.prisma.productCatalogItem.findUnique({
      where: { id },
      select: { ...CATALOG_ITEM_REVIEW_SELECT, archivedAt: true },
    });
  }

  findCatalogItemByBarcode(normalizedBarcode: string) {
    return this.prisma.productCatalogItem.findUnique({
      where: { normalizedBarcode },
      select: { ...CATALOG_ITEM_REVIEW_SELECT, archivedAt: true },
    });
  }

  findSimilarCatalogItems(name: string, excludeId: string | null) {
    return this.prisma.productCatalogItem.findMany({
      where: {
        name: { contains: name.trim(), mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { ...CATALOG_ITEM_REVIEW_SELECT, archivedAt: true },
      orderBy: [
        { archivedAt: { sort: 'desc', nulls: 'first' } },
        { name: 'asc' },
      ],
      take: 5,
    });
  }

  findSimilarPendingSubmissions(
    id: string,
    normalizedBarcode: string | null,
    productName: string,
  ): Promise<SubmissionRow[]> {
    const name = productName.trim();
    const matchers: Prisma.CatalogSubmissionWhereInput[] = [
      ...(normalizedBarcode ? [{ normalizedBarcode }] : []),
      ...(name
        ? [{ productName: { equals: name, mode: 'insensitive' as const } }]
        : []),
    ];
    if (matchers.length === 0) return Promise.resolve([]);
    return this.prisma.catalogSubmission.findMany({
      where: {
        id: { not: id },
        status: CatalogSubmissionStatus.PENDING,
        OR: matchers,
      },
      include: SUBMISSION_INCLUDE,
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
  }

  findPendingForProduct(pantryProductId: string) {
    return this.prisma.catalogSubmission.findFirst({
      where: { pantryProductId, status: CatalogSubmissionStatus.PENDING },
    });
  }

  async hasRejectedNewProduct(pantryProductId: string): Promise<boolean> {
    const count = await this.prisma.catalogSubmission.count({
      where: {
        pantryProductId,
        kind: CatalogSubmissionKind.NEW_PRODUCT,
        status: CatalogSubmissionStatus.REJECTED,
      },
    });
    return count > 0;
  }

  createSubmission(data: Prisma.CatalogSubmissionUncheckedCreateInput) {
    return this.prisma.catalogSubmission.create({ data });
  }

  updateSubmission(
    id: string,
    data: Prisma.CatalogSubmissionUncheckedUpdateInput,
  ) {
    return this.prisma.catalogSubmission.update({ where: { id }, data });
  }

  deleteSubmission(id: string) {
    return this.prisma.catalogSubmission.delete({ where: { id } });
  }

  list(params: {
    status?: CatalogSubmissionStatus;
    kind?: CatalogSubmissionKind;
    q?: string;
    take: number;
    cursor?: string;
  }): Promise<SubmissionRow[]> {
    const q = params.q?.trim();
    return this.prisma.catalogSubmission.findMany({
      where: {
        ...(params.status ? { status: params.status } : {}),
        ...(params.kind ? { kind: params.kind } : {}),
        ...(q
          ? {
              OR: [
                { productName: { contains: q, mode: 'insensitive' } },
                { normalizedBarcode: { contains: q } },
                { user: { email: { contains: q, mode: 'insensitive' } } },
                { user: { fullName: { contains: q, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: SUBMISSION_INCLUDE,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: params.take,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });
  }

  countPending() {
    return this.prisma.catalogSubmission.groupBy({
      by: ['kind'],
      where: { status: CatalogSubmissionStatus.PENDING },
      _count: { _all: true },
    });
  }

  findById(id: string): Promise<SubmissionRow | null> {
    return this.prisma.catalogSubmission.findUnique({
      where: { id },
      include: SUBMISSION_INCLUDE,
    });
  }

  reject(
    id: string,
    adminId: string,
    note: string,
    productName: string,
  ): Promise<SubmissionRow | null> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await claimPending(
        tx,
        id,
        CatalogSubmissionStatus.REJECTED,
      );
      if (claimed.count === 0) return null;
      await tx.adminAuditLog.create({
        data: toAuditData({
          actorUserId: adminId,
          action: AUDIT_ACTION.SUBMISSION_REJECTED,
          entityType: AUDIT_ENTITY.CATALOG_SUBMISSION,
          entityId: id,
          summary: productName,
          details: { reason: note },
        }),
      });
      return tx.catalogSubmission.update({
        where: { id },
        data: {
          reviewedByUserId: adminId,
          reviewedAt: new Date(),
          reviewNote: note,
        },
        include: SUBMISSION_INCLUDE,
      });
    });
  }

  merge(params: MergeParams): Promise<SubmissionRow | null> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await claimPending(
        tx,
        params.submissionId,
        CatalogSubmissionStatus.MERGED,
      );
      if (claimed.count === 0) return null;

      await linkPantryProduct(
        tx,
        params.submitterId,
        params.pantryProductId,
        params.targetCatalogItemId,
      );

      if (params.normalizedBarcode) {
        await tx.barcodeLookupMiss.deleteMany({
          where: { normalizedBarcode: params.normalizedBarcode },
        });
      }

      await tx.adminAuditLog.create({
        data: toAuditData({
          actorUserId: params.adminId,
          action: AUDIT_ACTION.SUBMISSION_MERGED,
          entityType: AUDIT_ENTITY.CATALOG_SUBMISSION,
          entityId: params.submissionId,
          summary: params.productName,
          details: {
            targetCatalogItemId: params.targetCatalogItemId,
            note: params.reviewNote,
          },
        }),
      });

      return tx.catalogSubmission.update({
        where: { id: params.submissionId },
        data: {
          catalogItemId: params.targetCatalogItemId,
          reviewedByUserId: params.adminId,
          reviewedAt: new Date(),
          reviewNote: params.reviewNote,
        },
        include: SUBMISSION_INCLUDE,
      });
    });
  }

  approve(params: ApproveParams): Promise<SubmissionRow | null> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await claimPending(
        tx,
        params.submissionId,
        CatalogSubmissionStatus.APPROVED,
      );
      if (claimed.count === 0) return null;

      let catalogItemId = params.targetCatalogItemId;
      const entries: AuditEntry[] = [];

      if (catalogItemId) {
        const current = await tx.productCatalogItem.findUniqueOrThrow({
          where: { id: catalogItemId },
          select: CATALOG_ITEM_REVIEW_SELECT,
        });
        const before = fromCatalogRow(current);
        await tx.productCatalogItem.update({
          where: { id: catalogItemId },
          data: {
            ...catalogFields(params.data),
            originalData: current.originalData ?? toJson(before),
            verificationStatus: ProductVerificationStatus.ADMIN_VERIFIED,
            updatedByUserId: params.adminId,
          },
        });
        entries.push({
          actorUserId: params.adminId,
          action: AUDIT_ACTION.CATALOG_ITEM_UPDATED,
          entityType: AUDIT_ENTITY.CATALOG_ITEM,
          entityId: catalogItemId,
          summary: params.data.name,
          details: toJsonObject({
            submissionId: params.submissionId,
            changes: diffFields(before, { ...before, ...params.data }),
          }),
        });
      } else {
        const created = await tx.productCatalogItem.create({
          data: {
            ...catalogFields(params.data),
            barcode: params.data.barcode,
            normalizedBarcode: params.normalizedBarcode,
            originalData: toJson(params.proposedOriginal),
            source: ProductSource.MANUAL,
            verificationStatus: ProductVerificationStatus.ADMIN_VERIFIED,
            createdByUserId: params.submitterId,
            updatedByUserId: params.adminId,
          },
          select: { id: true },
        });
        catalogItemId = created.id;
        entries.push({
          actorUserId: params.adminId,
          action: AUDIT_ACTION.CATALOG_ITEM_CREATED,
          entityType: AUDIT_ENTITY.CATALOG_ITEM,
          entityId: catalogItemId,
          summary: params.data.name,
          details: { submissionId: params.submissionId },
        });
      }

      await linkPantryProduct(
        tx,
        params.submitterId,
        params.pantryProductId,
        catalogItemId,
      );

      if (params.normalizedBarcode) {
        await tx.barcodeLookupMiss.deleteMany({
          where: { normalizedBarcode: params.normalizedBarcode },
        });
      }

      entries.unshift({
        actorUserId: params.adminId,
        action: AUDIT_ACTION.SUBMISSION_APPROVED,
        entityType: AUDIT_ENTITY.CATALOG_SUBMISSION,
        entityId: params.submissionId,
        summary: params.data.name,
        details: toJsonObject({
          kind: params.kind,
          catalogItemId,
          note: params.reviewNote,
          changes: diffFields(params.proposedOriginal, params.data),
        }),
      });
      await tx.adminAuditLog.createMany({ data: entries.map(toAuditData) });

      return tx.catalogSubmission.update({
        where: { id: params.submissionId },
        data: {
          catalogItemId,
          reviewedByUserId: params.adminId,
          reviewedAt: new Date(),
          reviewNote: params.reviewNote,
        },
        include: SUBMISSION_INCLUDE,
      });
    });
  }
}
