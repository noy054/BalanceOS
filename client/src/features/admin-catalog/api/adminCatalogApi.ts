import { apiClient } from "../../../shared/api/client";
import { Page } from "../../pantry/types";
import { ADMIN_CATALOG_ENDPOINTS } from "../constants";
import {
  ApproveSubmissionPayload,
  CatalogItemAdmin,
  CatalogItemAdminDetail,
  CatalogItemState,
  CatalogReviewSummary,
  CatalogSource,
  CatalogSubmission,
  CatalogSubmissionDetail,
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
  UpdateCatalogItemPayload,
} from "../types";

export const adminCatalogApi = {
  summary(): Promise<CatalogReviewSummary> {
    return apiClient.get<CatalogReviewSummary>(ADMIN_CATALOG_ENDPOINTS.SUMMARY).then((r) => r.data);
  },

  list(params: {
    status: CatalogSubmissionStatus;
    kind: CatalogSubmissionKind;
    q?: string;
    cursor?: string;
  }): Promise<Page<CatalogSubmission>> {
    return apiClient
      .get<Page<CatalogSubmission>>(ADMIN_CATALOG_ENDPOINTS.SUBMISSIONS, { params })
      .then((r) => r.data);
  },

  getById(id: string): Promise<CatalogSubmissionDetail> {
    return apiClient
      .get<CatalogSubmissionDetail>(ADMIN_CATALOG_ENDPOINTS.BY_ID(id))
      .then((r) => r.data);
  },

  approve(id: string, payload: ApproveSubmissionPayload): Promise<CatalogSubmission> {
    return apiClient
      .post<CatalogSubmission>(ADMIN_CATALOG_ENDPOINTS.APPROVE(id), payload)
      .then((r) => r.data);
  },

  reject(id: string, reviewNote: string): Promise<CatalogSubmission> {
    return apiClient
      .post<CatalogSubmission>(ADMIN_CATALOG_ENDPOINTS.REJECT(id), { reviewNote })
      .then((r) => r.data);
  },

  merge(id: string, targetCatalogItemId: string, reviewNote?: string): Promise<CatalogSubmission> {
    return apiClient
      .post<CatalogSubmission>(ADMIN_CATALOG_ENDPOINTS.MERGE(id), {
        targetCatalogItemId,
        ...(reviewNote ? { reviewNote } : {}),
      })
      .then((r) => r.data);
  },

  items(params: {
    state: CatalogItemState;
    source?: CatalogSource;
    q?: string;
    cursor?: string;
  }): Promise<Page<CatalogItemAdmin>> {
    return apiClient
      .get<Page<CatalogItemAdmin>>(ADMIN_CATALOG_ENDPOINTS.ITEMS, { params })
      .then((r) => r.data);
  },

  item(id: string): Promise<CatalogItemAdminDetail> {
    return apiClient
      .get<CatalogItemAdminDetail>(ADMIN_CATALOG_ENDPOINTS.ITEM(id))
      .then((r) => r.data);
  },

  updateItem(id: string, payload: UpdateCatalogItemPayload): Promise<CatalogItemAdmin> {
    return apiClient
      .patch<CatalogItemAdmin>(ADMIN_CATALOG_ENDPOINTS.ITEM(id), payload)
      .then((r) => r.data);
  },

  archiveItem(id: string, reason: string): Promise<CatalogItemAdmin> {
    return apiClient
      .post<CatalogItemAdmin>(ADMIN_CATALOG_ENDPOINTS.ARCHIVE_ITEM(id), { reason })
      .then((r) => r.data);
  },

  restoreItem(id: string): Promise<CatalogItemAdmin> {
    return apiClient
      .post<CatalogItemAdmin>(ADMIN_CATALOG_ENDPOINTS.RESTORE_ITEM(id))
      .then((r) => r.data);
  },
};
