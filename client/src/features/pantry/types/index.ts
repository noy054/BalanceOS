// ── Products ────────────────────────────────────────────────────────────────

export type ProductCategory = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export const ALL_PRODUCT_CATEGORIES: ProductCategory[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

export type PantryProduct = {
  id: string;
  userId: string;
  name: string;
  brand: string | null;
  imageUrl?: string | null;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  servingSizeG: number | null;
  servingSizeText: string | null;
  mealCategories: ProductCategory[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePantryProductPayload = {
  name: string;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  servingSizeG?: number;
  servingSizeText?: string;
  mealCategories?: ProductCategory[];
};

export type UpdatePantryProductPayload = Omit<
  Partial<CreatePantryProductPayload>,
  "servingSizeG"
> & {
  servingSizeG?: number | null;
  mealCategories?: ProductCategory[];
};

// ── Product Catalog ─────────────────────────────────────────────────────────

export type ProductCatalogSource =
  | "INTERNAL"
  | "OPEN_FOOD_FACTS"
  | "MANUAL"
  | "ADMIN";

export type ProductCatalogVerificationStatus =
  | "UNVERIFIED"
  | "USER_SUBMITTED"
  | "AUTO_IMPORTED"
  | "ADMIN_VERIFIED"
  | "REJECTED";

export type ProductCatalogProduct = {
  id: string;
  barcode: string | null;
  normalizedBarcode: string | null;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  servingSizeGrams: number | null;
  servingSizeText: string | null;
  source: ProductCatalogSource;
  verificationStatus: ProductCatalogVerificationStatus;
  externalProvider: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductCatalogPayload = {
  barcode?: string;
  name: string;
  brand?: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  servingSizeGrams?: number;
};

export type UpdateProductCatalogPayload = Partial<CreateProductCatalogPayload>;

// ── Shared ──────────────────────────────────────────────────────────────────

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type PantryTab = "products" | "recipes" | "savedMeals";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK_1" | "SNACK_2";

export type CalculatedNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
};

// ── Recipes ─────────────────────────────────────────────────────────────────

export type RecipeItemProduct = Pick<
  PantryProduct,
  | "id"
  | "name"
  | "brand"
  | "imageUrl"
  | "caloriesPer100g"
  | "proteinPer100g"
  | "carbsPer100g"
  | "fatPer100g"
  | "fiberPer100g"
  | "servingSizeG"
  | "mealCategories"
>;

export type RecipeItem = {
  id: string;
  productId: string;
  grams: number;
  product: RecipeItemProduct;
  nutrition: NutritionTotals;
};

export type PantryRecipe = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  mealType: MealType | string | null;
  items: RecipeItem[];
  totals: NutritionTotals;
  createdAt: string;
  updatedAt: string;
};

export type CreateRecipePayload = {
  name: string;
  description?: string;
  mealType?: MealType | string;
  items: Array<{
    productId: string;
    grams: number;
  }>;
};

export type UpdateRecipePayload = {
  name?: string;
  description?: string;
  mealType?: MealType | string;
  items?: Array<{
    productId: string;
    grams: number;
  }>;
};

// ── Saved Meals ─────────────────────────────────────────────────────────────

export type SavedMealRecipeItem = {
  grams: number;
  product: RecipeItemProduct;
};

export type SavedMealItemRecipe = {
  id: string;
  name: string;
  items: SavedMealRecipeItem[];
};

export type SavedMealItem = {
  id: string;
  savedMealId: string;
  productId: string | null;
  recipeId: string | null;
  grams: number | null;
  servings: number | null;
  product: RecipeItemProduct | null;
  recipe: SavedMealItemRecipe | null;
  nutrition: NutritionTotals;
};

export type SavedMeal = {
  id: string;
  userId: string;
  name: string;
  imageUrl: string | null;
  mealType: MealType | string | null;
  items: SavedMealItem[];
  totals: NutritionTotals;
  createdAt: string;
  updatedAt: string;
};

export type CreateSavedMealPayload = {
  name: string;
  mealType?: MealType | string;
  items: Array<{
    productId?: string;
    recipeId?: string;
    grams?: number;
    servings?: number;
  }>;
};

export type UpdateSavedMealPayload = {
  name?: string;
  mealType?: MealType | string;
  items?: CreateSavedMealPayload["items"];
};
