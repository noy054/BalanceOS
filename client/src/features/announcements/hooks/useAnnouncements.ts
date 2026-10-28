import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { announcementsApi } from "../api/announcementsApi";
import { ANNOUNCEMENT_QUERY_KEYS } from "../constants";
import { clientAudience } from "../helpers/announcementContent";
import { ActiveAnnouncement } from "../types";

export function useActiveAnnouncements() {
  return useQuery({
    queryKey: ANNOUNCEMENT_QUERY_KEYS.active,
    queryFn: () => announcementsApi.active(clientAudience()),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

function updateCache(
  queryClient: ReturnType<typeof useQueryClient>,
  update: (items: ActiveAnnouncement[]) => ActiveAnnouncement[],
) {
  queryClient.setQueryData<ActiveAnnouncement[]>(ANNOUNCEMENT_QUERY_KEYS.active, (items) =>
    items ? update(items) : items,
  );
}

export function useMarkAnnouncementSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.seen(id),
    onMutate: (id) =>
      updateCache(queryClient, (items) =>
        items.map((item) => (item.id === id ? { ...item, seen: true } : item)),
      ),
  });
}

export function useDismissAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.dismiss(id),
    onMutate: (id) => updateCache(queryClient, (items) => items.filter((item) => item.id !== id)),
    onError: () => queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_QUERY_KEYS.active }),
  });
}
