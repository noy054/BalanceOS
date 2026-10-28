import { apiClient } from "../../../shared/api/client";
import { Page } from "../../pantry/types";
import { ADMIN_CATALOG_ENDPOINTS } from "../constants";
import {
  ApproveSubmissionPayload,
  CatalogReviewSummary,
  CatalogSubmission,
  CatalogSubmissionDetail,
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
} from "../types";

export const adminCatalogApi = {
  summary(): Promise<CatalogReviewSummary> {
    return apiClient.get<CatalogReviewSummary>(ADMIN_CATALOG_ENDPOINTS.SUMMARY).then((r) => r.data);
  },

  list(params: {
    status: CatalogSubmissionStatus;
    kind: CatalogSubmissionKind;
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

  reject(id: string, reviewNote?: string): Promise<CatalogSubmission> {
    return apiClient
      .post<CatalogSubmission>(ADMIN_CATALOG_ENDPOINTS.REJECT(id), { reviewNote })
      .then((r) => r.data);
  },
};
