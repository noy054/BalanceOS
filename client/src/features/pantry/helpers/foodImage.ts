import { foodImagesApi } from "../api/foodImagesApi";

const FOOD_IMAGE_PREFIX = "food-image:";
const REMOTE_URL = /^https?:\/\//i;

export function foodImageFile(imageUrl: string | null | undefined): string | null {
  return imageUrl?.startsWith(FOOD_IMAGE_PREFIX) ? imageUrl.slice(FOOD_IMAGE_PREFIX.length) : null;
}

export function isLocalImage(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;
  return !REMOTE_URL.test(imageUrl) && foodImageFile(imageUrl) === null;
}

export async function prepareFoodImage<T extends string | null | undefined>(
  imageUrl: T,
  original?: string | null,
): Promise<T | string | null> {
  if (!isLocalImage(imageUrl)) return imageUrl;
  try {
    return await foodImagesApi.upload(imageUrl as string);
  } catch (err: unknown) {
    if (original && imageUrl === original) return null;
    throw err;
  }
}

const THUMBNAIL_VARIANTS: [RegExp, string][] = [
  [/^(https:\/\/st1\.foodsd\.co\.il\/Images\/Products\/)large\//i, "$1medium/"],
  [/^(https:\/\/images\.openfoodfacts\.org\/images\/products\/.+)\.(?:400|full)\.jpg$/i, "$1.200.jpg"],
];

export function thumbnailImageUrl(imageUrl: string): string {
  for (const [pattern, replacement] of THUMBNAIL_VARIANTS) {
    if (pattern.test(imageUrl)) return imageUrl.replace(pattern, replacement);
  }
  return imageUrl;
}
