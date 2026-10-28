import { useCallback } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminApi } from "../api/adminApi";
import { ADMIN_QUERY_KEYS, AnnouncementActionName } from "../constants";
import { AdminEntityType, AnnouncementPayload, AnnouncementState } from "../types";
import { ANNOUNCEMENT_QUERY_KEYS } from "../../announcements/constants";
import { ADMIN_CATALOG_QUERY_KEYS } from "../../admin-catalog/constants";

type InfiniteState = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
};

export function useLoadMore({ hasNextPage, isFetchingNextPage, fetchNextPage }: InfiniteState) {
  return useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

export function useAdminOverview(enabled: boolean) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.overview,
    queryFn: () => adminApi.overview(),
    enabled,
  });
}

export function useAdminActivity(entityType: AdminEntityType | null, enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: ADMIN_QUERY_KEYS.activity(entityType),
    queryFn: ({ pageParam }) =>
      adminApi.activity({ ...(entityType ? { entityType } : {}), cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.items),
    enabled,
  });
  const loadMore = useLoadMore(query);
  return { ...query, loadMore };
}

export function useAdminAnnouncements(state: AnnouncementState | null, q: string, enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: ADMIN_QUERY_KEYS.announcementList(state, q.trim()),
    queryFn: ({ pageParam }) =>
      adminApi.announcements({
        ...(state ? { state } : {}),
        ...(q.trim() ? { q: q.trim() } : {}),
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

export function useAdminAnnouncement(id: string | null) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.announcement(id ?? ""),
    queryFn: () => adminApi.announcement(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: ADMIN_CATALOG_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_QUERY_KEYS.active }),
      ]),
    [queryClient],
  );
}

export function useSaveAnnouncement(id: string | null) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (payload: AnnouncementPayload) =>
      id ? adminApi.updateAnnouncement(id, payload) : adminApi.createAnnouncement(payload),
    onSuccess: invalidate,
  });
}

export function useAnnouncementAction() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (args: { id: string; action: AnnouncementActionName; publishAt?: string }) =>
      adminApi.announcementAction(
        args.id,
        args.action,
        args.publishAt ? { publishAt: args.publishAt } : undefined,
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteAnnouncement() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAnnouncement(id),
    onSuccess: invalidate,
  });
}
