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
};

function catalogFields(data: CatalogProductData) {
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
    // Without per-100g values the per-100g extras would describe a basis
    // the item no longer has, so drop them.
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

@Injectable()
export class CatalogReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCatalogItem(id: string) {
    return this.prisma.productCatalogItem.findUnique({
      where: { id },
      select: CATALOG_ITEM_REVIEW_SELECT,
    });
  }

  findCatalogItemByBarcode(normalizedBarcode: string) {
    return this.prisma.productCatalogItem.findUnique({
      where: { normalizedBarcode },
      select: CATALOG_ITEM_REVIEW_SELECT,
    });
  }

  findSimilarCatalogItems(name: string, excludeId: string | null) {
    return this.prisma.productCatalogItem.findMany({
      where: {
        name: { contains: name.trim(), mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: CATALOG_ITEM_REVIEW_SELECT,
      orderBy: { name: 'asc' },
      take: 5,
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
    take: number;
    cursor?: string;
  }): Promise<SubmissionRow[]> {
    return this.prisma.catalogSubmission.findMany({
      where: {
        ...(params.status ? { status: params.status } : {}),
        ...(params.kind ? { kind: params.kind } : {}),
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

  /** Returns null when the submission is no longer pending. */
  async reject(
    id: string,
    adminId: string,
    note: string | null,
  ): Promise<SubmissionRow | null> {
    const claimed = await this.prisma.catalogSubmission.updateMany({
      where: { id, status: CatalogSubmissionStatus.PENDING },
      data: {
        status: CatalogSubmissionStatus.REJECTED,
        reviewedByUserId: adminId,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });
    if (claimed.count === 0) return null;
    return this.findById(id);
  }

  /** Returns null when the submission is no longer pending. */
  approve(params: ApproveParams): Promise<SubmissionRow | null> {
    return this.prisma.$transaction(async (tx) => {
      // Claim the submission first: the status condition takes a row lock,
      // so a concurrent approval waits here and then matches nothing.
      const claimed = await tx.catalogSubmission.updateMany({
        where: {
          id: params.submissionId,
          status: CatalogSubmissionStatus.PENDING,
        },
        data: { status: CatalogSubmissionStatus.APPROVED },
      });
      if (claimed.count === 0) return null;

      let catalogItemId = params.targetCatalogItemId;

      if (catalogItemId) {
        const current = await tx.productCatalogItem.findUniqueOrThrow({
          where: { id: catalogItemId },
          select: CATALOG_ITEM_REVIEW_SELECT,
        });
        await tx.productCatalogItem.update({
          where: { id: catalogItemId },
          data: {
            ...catalogFields(params.data),
            originalData:
              current.originalData ?? toJson(fromCatalogRow(current)),
            verificationStatus: ProductVerificationStatus.ADMIN_VERIFIED,
            updatedByUserId: params.adminId,
          },
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
      }

      if (params.pantryProductId) {
        const alreadyLinked = await tx.pantryProduct.findFirst({
          where: { userId: params.submitterId, catalogItemId },
          select: { id: true },
        });
        if (!alreadyLinked) {
          await tx.pantryProduct.updateMany({
            where: { id: params.pantryProductId, catalogItemId: null },
            data: { catalogItemId },
          });
        }
      }

      if (params.normalizedBarcode) {
        await tx.barcodeLookupMiss.deleteMany({
          where: { normalizedBarcode: params.normalizedBarcode },
        });
      }

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
