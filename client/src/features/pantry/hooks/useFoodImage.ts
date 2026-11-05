import { useQuery } from "@tanstack/react-query";

import { foodImagesApi } from "../api/foodImagesApi";
import { FOOD_IMAGE_QUERY_KEYS } from "../constants";
import { foodImageFile } from "../helpers/foodImage";

export function useFoodImage(imageUrl: string | null | undefined) {
  const file = foodImageFile(imageUrl);
  const query = useQuery({
    queryKey: FOOD_IMAGE_QUERY_KEYS.file(file ?? ""),
    queryFn: () => foodImagesApi.dataUrl(file as string),
    enabled: file !== null,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (file === null) return { uri: imageUrl || null, isLoading: false };
  return { uri: query.data ?? null, isLoading: query.isLoading };
}
