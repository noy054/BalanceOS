import { NutrientMap, ProductNutritionFields, ProductNutritionPayload } from "../../pantry/types";
import { AdminHistoryEntry, AdminPerson } from "../../admin/types";

export type CatalogSubmissionKind = "CORRECTION" | "NEW_PRODUCT";
export type CatalogSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "MERGED";
export type CatalogItemState = "active" | "archived" | "all";
export type CatalogSource = "INTERNAL" | "OPEN_FOOD_FACTS" | "USDA_FDC" | "MANUAL" | "ADMIN";

export type CatalogProductData = ProductNutritionFields & {
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string | null;
  nutrients: NutrientMap | null;
};

export type CatalogPerson = AdminPerson;

export type CatalogItemView = {
  id: string;
  source: CatalogSource;
  verificationStatus: string;
  externalProvider: string | null;
  normalizedBarcode: string | null;
  archivedAt: string | null;
  current: CatalogProductData;
  original: CatalogProductData | null;
};

export type CatalogSubmission = {
  id: string;
  kind: CatalogSubmissionKind;
  status: CatalogSubmissionStatus;
  normalizedBarcode: string | null;
  pantryProductId: string | null;
  proposed: CatalogProductData | null;
  submitter: CatalogPerson;
  reviewer: CatalogPerson | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  catalogItem: CatalogItemView | null;
};

export type CatalogSubmissionDetail = CatalogSubmission & {
  similarItems: CatalogItemView[];
  similarSubmissions: CatalogSubmission[];
  history: AdminHistoryEntry[];
};

export type CatalogReviewSummary = {
  pendingCorrections: number;
  pendingNewProducts: number;
};

export type ApproveSubmissionPayload = ProductNutritionPayload & {
  name: string;
  brand: string | null;
  imageUrl: string | null;
  targetCatalogItemId?: string;
  reviewNote?: string;
};

export type CatalogItemAdmin = CatalogItemView & {
  createdAt: string;
  updatedAt: string;
  createdBy: CatalogPerson | null;
  updatedBy: CatalogPerson | null;
  archivedBy: CatalogPerson | null;
  linkedProducts: number;
};

export type CatalogItemSubmissionSummary = {
  id: string;
  kind: CatalogSubmissionKind;
  status: CatalogSubmissionStatus;
  productName: string;
  createdAt: string;
  reviewedAt: string | null;
  user: CatalogPerson;
};

export type CatalogItemAdminDetail = CatalogItemAdmin & {
  submissions: CatalogItemSubmissionSummary[];
  history: AdminHistoryEntry[];
};

export type UpdateCatalogItemPayload = ProductNutritionPayload & {
  name: string;
  brand: string | null;
  imageUrl: string | null;
  note?: string;
};
