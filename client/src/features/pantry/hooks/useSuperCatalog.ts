import { useCallback, useEffect, useRef, useState } from "react";
import {
  InfiniteData,
  keepPreviousData,
  QueryClient,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Alert } from "react-native";
import { track } from "../../analytics/analytics";

import { pantryApi } from "../api/pantryApi";
import { CATALOG_BROWSE_PAGE_SIZE, CATALOG_QUERY_KEYS } from "../constants";
import { CatalogBrowseItem, CatalogDepartment, Page } from "../types";
import { useAddPantryProductFromCatalog, useDeletePantryProduct } from "./usePantry";
import { useProductUsageWarning } from "./useRecipes";
import { getProductSaveErrorKey } from "../helpers/barcode";
import { showToast } from "../../../shared/helpers/toast";
import { confirmAction } from "../../../shared/helpers/confirm";
import { thumbnailImageUrl } from "../helpers/foodImage";

type BrowsePages = InfiniteData<Page<CatalogBrowseItem>, string | undefined>;

function useDebouncedSearch(search: string) {
  const trimmed = search.trim();
  const [value, setValue] = useState(trimmed);

  useEffect(() => {
    if (!trimmed) {
      setValue("");
      return;
    }
    const id = setTimeout(() => setValue(trimmed), 300);
    return () => clearTimeout(id);
  }, [trimmed]);

  return value;
}

export function useCatalogDepartments() {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.departments,
    queryFn: () => pantryApi.getCatalogDepartments(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCatalogSubcategories(department: CatalogDepartment) {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.subcategories(department),
    queryFn: () => pantryApi.getCatalogSubcategories(department),
    staleTime: 10 * 60 * 1000,
  });
}

const BROWSE_STALE_TIME = 2 * 60 * 1000;

function warmThumbnails(items: CatalogBrowseItem[]) {
  const urls = items
    .map((item) => item.imageUrl)
    .filter((url): url is string => Boolean(url && /^https?:\/\//i.test(url)))
    .map(thumbnailImageUrl);
  if (urls.length > 0) void Image.prefetch(urls, "memory-disk").catch(() => false);
}

function browseOptions(department: CatalogDepartment | null, q: string, subcategory: string | null) {
  return {
    queryKey: CATALOG_QUERY_KEYS.browse(department, q, subcategory),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const page = await pantryApi.browseCatalog({
        department: department ?? undefined,
        subcategory: subcategory ?? undefined,
        q: q || undefined,
        cursor: pageParam,
        limit: CATALOG_BROWSE_PAGE_SIZE,
      });
      warmThumbnails(page.items);
      return page;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: Page<CatalogBrowseItem>) => lastPage.nextCursor ?? undefined,
    staleTime: BROWSE_STALE_TIME,
  };
}

export function prefetchCatalogDepartment(queryClient: QueryClient, department: CatalogDepartment) {
  return queryClient.prefetchInfiniteQuery(browseOptions(department, "", null));
}

export function useCatalogBrowse(
  department: CatalogDepartment | null,
  search: string,
  enabled = true,
  subcategory: string | null = null,
) {
  const debounced = useDebouncedSearch(search);

  const query = useInfiniteQuery({
    ...browseOptions(department, debounced, subcategory),
    select: (data): CatalogBrowseItem[] => data.pages.flatMap((page) => page.items),
    placeholderData: keepPreviousData,
    enabled: enabled && (department !== null || debounced.length > 0),
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ...query, loadMore, isDebouncing: debounced !== search.trim() };
}

function setPantryLink(
  queryClient: ReturnType<typeof useQueryClient>,
  catalogItemId: string,
  pantryProductId: string | null,
) {
  queryClient.setQueriesData<BrowsePages>({ queryKey: CATALOG_QUERY_KEYS.browseAll }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((entry) =>
              entry.id === catalogItemId ? { ...entry, pantryProductId } : entry,
            ),
          })),
        }
      : data,
  );
}

export function useSuperPantry() {
  const { t } = useTranslation("pantry");
  const queryClient = useQueryClient();
  const addFromCatalog = useAddPantryProductFromCatalog();
  const deleteProduct = useDeletePantryProduct();
  const recipeWarning = useProductUsageWarning();
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());

  function setPending(id: string, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function add(item: CatalogBrowseItem) {
    if (item.pantryProductId || pendingIds.has(item.id)) return;
    setPending(item.id, true);
    try {
      const created = await addFromCatalog.mutateAsync({ catalogItemId: item.id, payload: {} });
      setPantryLink(queryClient, item.id, created.id);
      track("super_product_added");
      showToast({
        message: t("super.added", { name: item.name }),
        actionLabel: t("super.view"),
        onAction: () => router.push(`/(app)/pantry/${created.id}`),
      });
    } catch (err) {
      track("super_product_added", "failed");
      Alert.alert("", t(getProductSaveErrorKey(err)));
    } finally {
      setPending(item.id, false);
    }
  }

  async function remove(item: CatalogBrowseItem) {
    const pantryProductId = item.pantryProductId;
    if (!pantryProductId || pendingIds.has(item.id)) return;
    setPending(item.id, true);
    const warning = await recipeWarning(pantryProductId);
    setPending(item.id, false);
    const confirmed = await confirmAction({
      title: t("super.removeConfirmTitle"),
      message: [t("super.removeConfirmMessage", { name: item.name }), warning]
        .filter(Boolean)
        .join("\n\n"),
      confirmLabel: t("super.removeConfirmYes"),
      cancelLabel: t("super.removeConfirmNo"),
      destructive: true,
    });
    if (!confirmed) return;
    setPending(item.id, true);
    try {
      await deleteProduct.mutateAsync(pantryProductId);
      setPantryLink(queryClient, item.id, null);
      track("super_product_removed");
      showToast({ message: t("super.removed", { name: item.name }) });
    } catch {
      track("super_product_removed", "failed");
      Alert.alert("", t("super.removeFailed"));
    } finally {
      setPending(item.id, false);
    }
  }

  const actions = useRef({ add, remove });
  actions.current = { add, remove };
  const stableAdd = useCallback((item: CatalogBrowseItem) => actions.current.add(item), []);
  const stableRemove = useCallback((item: CatalogBrowseItem) => actions.current.remove(item), []);

  return { add: stableAdd, remove: stableRemove, pendingIds };
}
