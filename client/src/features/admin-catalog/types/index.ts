import { NutrientMap, ProductNutritionFields, ProductNutritionPayload } from "../../pantry/types";

export type CatalogSubmissionKind = "CORRECTION" | "NEW_PRODUCT";
export type CatalogSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CatalogProductData = ProductNutritionFields & {
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string | null;
  nutrients: NutrientMap | null;
};

export type CatalogPerson = {
  id: string;
  email: string;
  fullName: string;
};

export type CatalogItemView = {
  id: string;
  source: string;
  verificationStatus: string;
  externalProvider: string | null;
  normalizedBarcode: string | null;
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
