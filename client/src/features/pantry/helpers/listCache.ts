import { QueryClient, QueryKey } from "@tanstack/react-query";

type Identified = { id: string };

export function upsertInList<T extends Identified>(queryClient: QueryClient, key: QueryKey, item: T) {
  queryClient.setQueryData<T[]>(key, (list) => {
    if (!list) return list;
    return list.some((entry) => entry.id === item.id)
      ? list.map((entry) => (entry.id === item.id ? item : entry))
      : [item, ...list];
  });
}

export function removeFromList<T extends Identified>(queryClient: QueryClient, key: QueryKey, id: string) {
  queryClient.setQueryData<T[]>(key, (list) => list?.filter((entry) => entry.id !== id));
}

export function refetchAll(queryClient: QueryClient, keys: QueryKey[]) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey, refetchType: "all" })));
}
