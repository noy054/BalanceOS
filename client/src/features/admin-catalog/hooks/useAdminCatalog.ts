import { useCallback } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminCatalogApi } from "../api/adminCatalogApi";
import { ADMIN_CATALOG_QUERY_KEYS } from "../constants";
import {
  ApproveSubmissionPayload,
  CatalogSubmission,
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
} from "../types";
import { useAuthStore } from "../../auth/hooks/useAuthStore";

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
) {
  const query = useInfiniteQuery({
    queryKey: ADMIN_CATALOG_QUERY_KEYS.list(status, kind),
    queryFn: ({ pageParam }) => adminCatalogApi.list({ status, kind, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data): CatalogSubmission[] => data.pages.flatMap((page) => page.items),
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApproveSubmissionPayload) => adminCatalogApi.approve(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_CATALOG_QUERY_KEYS.all }),
  });
}

export function useRejectSubmission(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewNote?: string) => adminCatalogApi.reject(id, reviewNote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_CATALOG_QUERY_KEYS.all }),
  });
}
