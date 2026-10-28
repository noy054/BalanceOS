import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import {
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
} from '../../../generated/prisma/enums';
import { PantryProductModel } from '../../../generated/prisma/models';
import { normalizeBarcode } from '../../common/barcode/barcode.utils';
import { Page, toPage } from '../../common/pagination/page.types';
import {
  pickNutritionFields,
  resolveNutrition,
} from '../pantry/product-nutrition.normalizer';
import {
  CatalogReviewRepository,
  SubmissionRow,
} from './catalog-review.repository';
import {
  CatalogProductData,
  catalogDataDiffers,
  fromCatalogRow,
  fromProductRow,
  parseCatalogData,
  toJson,
} from './catalog-data';
import {
  ApproveCatalogSubmissionDto,
  ListCatalogSubmissionsDto,
} from './dto/catalog-review.dto';
import { ProductCatalogItemReviewDto } from './types/product-catalog.types';

const DEFAULT_PAGE = 20;

type CatalogItemView = {
  id: string;
  source: string;
  verificationStatus: string;
  externalProvider: string | null;
  normalizedBarcode: string | null;
  current: CatalogProductData;
  original: CatalogProductData | null;
};

export type CatalogSubmissionView = {
  id: string;
  kind: CatalogSubmissionKind;
  status: CatalogSubmissionStatus;
  normalizedBarcode: string | null;
  pantryProductId: string | null;
  proposed: CatalogProductData | null;
  submitter: { id: string; email: string; fullName: string };
  reviewer: { id: string; email: string; fullName: string } | null;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  catalogItem: CatalogItemView | null;
};

function toItemView(item: ProductCatalogItemReviewDto): CatalogItemView {
  return {
    id: item.id,
    source: item.source,
    verificationStatus: item.verificationStatus,
    externalProvider: item.externalProvider,
    normalizedBarcode: item.normalizedBarcode,
    current: fromCatalogRow(item),
    original: item.originalData ? parseCatalogData(item.originalData) : null,
  };
}

function toView(row: SubmissionRow): CatalogSubmissionView {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    normalizedBarcode: row.normalizedBarcode,
    pantryProductId: row.pantryProductId,
    proposed: parseCatalogData(row.proposedData),
    submitter: row.user,
    reviewer: row.reviewedBy,
    reviewNote: row.reviewNote,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    catalogItem: row.catalogItem ? toItemView(row.catalogItem) : null,
  };
}

@Injectable()
export class CatalogReviewService {
  private readonly logger = new Logger(CatalogReviewService.name);

  constructor(private readonly repo: CatalogReviewRepository) {}

  async recordProductChange(product: PantryProductModel): Promise<void> {
    try {
      await this.syncSubmission(product);
    } catch (err: unknown) {
      this.logger.warn(
        `Could not record catalog submission for product ${product.id}: ${String(err)}`,
      );
    }
  }

  private async syncSubmission(product: PantryProductModel): Promise<void> {
    const proposed = fromProductRow(product);
    const pending = await this.repo.findPendingForProduct(product.id);

    if (product.catalogItemId) {
      const catalogItem = await this.repo.findCatalogItem(
        product.catalogItemId,
      );
      if (!catalogItem) return;
      if (!catalogDataDiffers(proposed, fromCatalogRow(catalogItem))) {
        if (pending?.kind === CatalogSubmissionKind.CORRECTION) {
          await this.repo.deleteSubmission(pending.id);
        }
        return;
      }
      await this.upsert(pending?.id ?? null, {
        kind: CatalogSubmissionKind.CORRECTION,
        userId: product.userId,
        pantryProductId: product.id,
        catalogItemId: catalogItem.id,
        normalizedBarcode: catalogItem.normalizedBarcode,
        proposedData: toJson(proposed),
      });
      return;
    }

    // Only barcoded (packaged) products are catalog candidates. Barcode-less
    // products are the user's own foods and stay private.
    if (!product.normalizedBarcode) {
      if (pending?.kind === CatalogSubmissionKind.NEW_PRODUCT) {
        await this.repo.deleteSubmission(pending.id);
      }
      return;
    }
    if (!pending && (await this.repo.hasRejectedNewProduct(product.id))) {
      return;
    }

    await this.upsert(pending?.id ?? null, {
      kind: CatalogSubmissionKind.NEW_PRODUCT,
      userId: product.userId,
      pantryProductId: product.id,
      catalogItemId: null,
      normalizedBarcode: product.normalizedBarcode,
      proposedData: toJson(proposed),
    });
  }

  private async upsert(
    pendingId: string | null,
    data: Prisma.CatalogSubmissionUncheckedCreateInput,
  ): Promise<void> {
    if (pendingId) {
      await this.repo.updateSubmission(pendingId, data);
    } else {
      await this.repo.createSubmission(data);
    }
  }

  async list(
    dto: ListCatalogSubmissionsDto,
  ): Promise<Page<CatalogSubmissionView>> {
    const limit = dto.limit ?? DEFAULT_PAGE;
    const rows = await this.repo.list({
      status: dto.status ?? CatalogSubmissionStatus.PENDING,
      kind: dto.kind,
      take: limit + 1,
      cursor: dto.cursor,
    });
    const page = toPage(rows, limit);
    return { ...page, items: page.items.map(toView) };
  }

  async summary() {
    const groups = await this.repo.countPending();
    const count = (kind: CatalogSubmissionKind) =>
      groups.find((group) => group.kind === kind)?._count._all ?? 0;
    return {
      pendingCorrections: count(CatalogSubmissionKind.CORRECTION),
      pendingNewProducts: count(CatalogSubmissionKind.NEW_PRODUCT),
    };
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Submission not found');
    const view = toView(row);
    const similar = await this.findSimilar(view);
    return { ...view, similarItems: similar.map(toItemView) };
  }

  private async findSimilar(view: CatalogSubmissionView) {
    if (view.kind !== CatalogSubmissionKind.NEW_PRODUCT || !view.proposed) {
      return [];
    }
    const byBarcode = view.normalizedBarcode
      ? await this.repo.findCatalogItemByBarcode(view.normalizedBarcode)
      : null;
    const byName = await this.repo.findSimilarCatalogItems(
      view.proposed.name,
      byBarcode?.id ?? null,
    );
    return byBarcode ? [byBarcode, ...byName] : byName;
  }

  async approve(adminId: string, id: string, dto: ApproveCatalogSubmissionDto) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Submission not found');
    if (row.status !== CatalogSubmissionStatus.PENDING) {
      throw new ConflictException('This submission was already reviewed');
    }

    const proposed = parseCatalogData(row.proposedData);
    if (!proposed) throw new BadRequestException('Submission data is invalid');

    const nutrition = resolveNutrition(pickNutritionFields(proposed), dto);
    const barcodeInput = dto.barcode ?? proposed.barcode;
    const normalized = barcodeInput ? normalizeBarcode(barcodeInput) : null;

    const data: CatalogProductData = {
      ...proposed,
      ...nutrition,
      name: dto.name.trim(),
      brand:
        dto.brand !== undefined ? dto.brand?.trim() || null : proposed.brand,
      imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : proposed.imageUrl,
      barcode: normalized?.digits ?? null,
    };

    const target = await this.resolveTarget(row, dto, normalized?.canonical);

    try {
      const updated = await this.repo.approve({
        submissionId: row.id,
        adminId,
        data,
        normalizedBarcode: target ? null : (normalized?.canonical ?? null),
        targetCatalogItemId: target,
        submitterId: row.userId,
        pantryProductId: row.pantryProductId,
        proposedOriginal: proposed,
        reviewNote: dto.reviewNote?.trim() || null,
      });
      if (!updated) {
        throw new ConflictException('This submission was already reviewed');
      }
      return toView(updated);
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'A catalog product with this barcode already exists',
        );
      }
      throw err;
    }
  }

  private async resolveTarget(
    row: SubmissionRow,
    dto: ApproveCatalogSubmissionDto,
    normalizedBarcode: string | undefined,
  ): Promise<string | null> {
    if (dto.targetCatalogItemId) {
      const target = await this.repo.findCatalogItem(dto.targetCatalogItemId);
      if (!target) throw new NotFoundException('Catalog product not found');
      return target.id;
    }
    if (row.kind === CatalogSubmissionKind.CORRECTION && row.catalogItemId) {
      return row.catalogItemId;
    }
    if (normalizedBarcode) {
      const existing =
        await this.repo.findCatalogItemByBarcode(normalizedBarcode);
      if (existing) return existing.id;
    }
    return null;
  }

  async reject(adminId: string, id: string, note?: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Submission not found');
    if (row.status !== CatalogSubmissionStatus.PENDING) {
      throw new ConflictException('This submission was already reviewed');
    }
    const updated = await this.repo.reject(id, adminId, note?.trim() || null);
    if (!updated) {
      throw new ConflictException('This submission was already reviewed');
    }
    return toView(updated);
  }
}
