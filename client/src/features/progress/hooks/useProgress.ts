import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addDays, DateKey } from "../../../shared/helpers/dateKey";
import { useTodayKey } from "../../../shared/hooks/useTodayKey";
import { useUpdateSettings } from "../../settings/hooks/useSettings";
import { progressApi } from "../api/progressApi";
import { PERIOD_DAYS, PROGRESS_QUERY_KEYS } from "../constants";
import { hasAnyValue } from "../helpers/entryForm";
import { BodyEntry, BodyEntryPayload, ProgressPeriod } from "../types";

export type PeriodRange = { from: DateKey | null; to: DateKey };

export function usePeriodRange(period: ProgressPeriod): PeriodRange {
  const today = useTodayKey();
  return {
    from: period === "ALL" ? null : addDays(today, -(PERIOD_DAYS[period] - 1)),
    to: today,
  };
}

export function useProgressOverview(range: PeriodRange) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.overview(range.from, range.to),
    queryFn: () => progressApi.overview({ ...(range.from ? { from: range.from } : {}), to: range.to }),
    placeholderData: keepPreviousData,
  });
}

export function useBodyEntries(range: PeriodRange) {
  const query = useInfiniteQuery({
    queryKey: PROGRESS_QUERY_KEYS.entries(range.from, range.to),
    queryFn: ({ pageParam }) =>
      progressApi.entries({
        ...(range.from ? { from: range.from } : {}),
        to: range.to,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    placeholderData: keepPreviousData,
  });
  return {
    ...query,
    entries: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

export function useBodyEntry(id: string | null) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.entry(id ?? ""),
    queryFn: () => progressApi.entry(id ?? ""),
    enabled: Boolean(id),
  });
}

export function usePrivatePhoto(photoId: string) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.photo(photoId),
    queryFn: () => progressApi.photoDataUrl(photoId),
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type PhotoChanges = {
  added: string[];
  replaced: Array<{ id: string; uri: string }>;
  removed: string[];
};

export class PhotoSyncError extends Error {
  constructor(
    readonly entry: BodyEntry,
    readonly failed: number,
    readonly rolledBack: boolean,
  ) {
    super("Some photos were not saved");
  }
}

async function syncPhotos(entryId: string, changes: PhotoChanges): Promise<number> {
  let failed = 0;
  for (const id of changes.removed) {
    await progressApi.removePhoto(id).catch(() => {
      failed += 1;
    });
  }
  for (const item of changes.replaced) {
    await progressApi.replacePhoto(item.id, item.uri).catch(() => {
      failed += 1;
    });
  }
  for (const uri of changes.added) {
    await progressApi.addPhoto(entryId, uri).catch(() => {
      failed += 1;
    });
  }
  return failed;
}

export function useSaveBodyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string | null;
      payload: BodyEntryPayload & { date: string };
      photos: PhotoChanges;
    }) => {
      const entry = input.id
        ? await progressApi.update(input.id, input.payload)
        : await progressApi.create(input.payload);
      const failed = await syncPhotos(entry.id, input.photos);
      if (failed > 0) {
        const photoOnlyEntry = !input.id && !hasAnyValue(input.payload) && failed === input.photos.added.length;
        const rolledBack = photoOnlyEntry && (await progressApi.remove(entry.id).then(() => true).catch(() => false));
        throw new PhotoSyncError(entry, failed, rolledBack);
      }
      return entry;
    },
    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEYS.all });
      input.photos.replaced.forEach((item) =>
        queryClient.removeQueries({ queryKey: PROGRESS_QUERY_KEYS.photo(item.id) }),
      );
      input.photos.removed.forEach((id) => queryClient.removeQueries({ queryKey: PROGRESS_QUERY_KEYS.photo(id) }));
    },
  });
}

export function useDeleteBodyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: BodyEntry) => progressApi.remove(entry.id),
    onSuccess: (_data, entry) => {
      entry.photos.forEach((photo) => queryClient.removeQueries({ queryKey: PROGRESS_QUERY_KEYS.photo(photo.id) }));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEYS.all }),
  });
}

export function useApplyProfileWeight() {
  const queryClient = useQueryClient();
  const update = useUpdateSettings();
  return useMutation({
    mutationFn: (weightKg: number) => update.mutateAsync({ weightKg }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEYS.all }),
  });
}
