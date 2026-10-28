import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { adminCatalogApi } from "../api/adminCatalogApi";
import { ADMIN_CATALOG_QUERY_KEYS } from "../constants";
import {
  ApproveSubmissionPayload,
  CatalogItemState,
  CatalogSource,
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
  UpdateCatalogItemPayload,
} from "../types";
import { useAuthStore } from "../../auth/hooks/useAuthStore";
import { useInvalidateAdmin, useLoadMore } from "../../admin/hooks/useAdmin";

export function useIsAdmin() {
  return useAuthStore((state) => state.user?.role === "ADMIN");
}

export function useCatalogReviewSummary(enabled: boolean) {
  return useQuery({
    queryKey: ADMIN_CATALOG_QUERY_KEYS.summary,
    queryFn: () => adminCatalogApi.summary(),
    enabled,
  });
}

export function useCatalogSubmissions(
  status: CatalogSubmissionStatus,
  kind: CatalogSubmissionKind,
  q: string,
  enabled = true,
) {
  const search = q.trim();
  const query = useInfiniteQuery({
    queryKey: ADMIN_CATALOG_QUERY_KEYS.list(status, kind, search),
    queryFn: ({ pageParam }) =>
      adminCatalogApi.list({ status, kind, ...(search ? { q: search } : {}), cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.items),
    enabled,
  });
  const loadMore = useLoadMore(query);
  return { ...query, loadMore };
}

export function useCatalogSubmission(id: string) {
  return useQuery({
    queryKey: ADMIN_CATALOG_QUERY_KEYS.detail(id),
    queryFn: () => adminCatalogApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useApproveSubmission(id: string) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (payload: ApproveSubmissionPayload) => adminCatalogApi.approve(id, payload),
    onSuccess: invalidate,
  });
}

export function useRejectSubmission(id: string) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (reviewNote: string) => adminCatalogApi.reject(id, reviewNote),
    onSuccess: invalidate,
  });
}

export function useMergeSubmission(id: string) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (args: { targetCatalogItemId: string; reviewNote?: string }) =>
      adminCatalogApi.merge(id, args.targetCatalogItemId, args.reviewNote),
    onSuccess: invalidate,
  });
}

export function useCatalogItems(
  state: CatalogItemState,
  source: CatalogSource | null,
  q: string,
  enabled = true,
) {
  const search = q.trim();
  const query = useInfiniteQuery({
    queryKey: ADMIN_CATALOG_QUERY_KEYS.items(state, source, search),
    queryFn: ({ pageParam }) =>
      adminCatalogApi.items({
        state,
        ...(source ? { source } : {}),
        ...(search ? { q: search } : {}),
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.items),
    enabled,
  });
  const loadMore = useLoadMore(query);
  return { ...query, loadMore };
}

export function useCatalogItem(id: string) {
  return useQuery({
    queryKey: ADMIN_CATALOG_QUERY_KEYS.item(id),
    queryFn: () => adminCatalogApi.item(id),
    enabled: Boolean(id),
  });
}

export function useUpdateCatalogItem(id: string) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (payload: UpdateCatalogItemPayload) => adminCatalogApi.updateItem(id, payload),
    onSuccess: invalidate,
  });
}

export function useArchiveCatalogItem(id: string) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (args: { archive: true; reason: string } | { archive: false }) =>
      args.archive ? adminCatalogApi.archiveItem(id, args.reason) : adminCatalogApi.restoreItem(id),
    onSuccess: invalidate,
  });
}
