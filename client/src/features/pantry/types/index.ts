// ── Products ────────────────────────────────────────────────────────────────

export type ProductCategory = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export const ALL_PRODUCT_CATEGORIES: ProductCategory[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

export type NutritionBasis = "PER_100G" | "PER_SERVING";

export type NutrientMap = Record<string, number>;

export type ProductNutritionFields = {
  nutritionBasis?: NutritionBasis;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  caloriesPerServing?: number | null;
  proteinPerServing?: number | null;
  carbsPerServing?: number | null;
  fatPerServing?: number | null;
  fiberPerServing?: number | null;
  servingSizeG: number | null;
  servingSizeText: string | null;
  servingQuantity?: number | null;
  servingUnit?: string | null;
};

export type PantryProduct = ProductNutritionFields & {
  id: string;
  userId: string;
  name: string;
  brand: string | null;
  imageUrl?: string | null;
  barcode: string | null;
  normalizedBarcode: string | null;
  catalogItemId: string | null;
  nutrients?: NutrientMap | null;
  mealCategories: ProductCategory[];
  createdAt: string;
  updatedAt: string;
};

export type ProductNutritionPayload = {
  nutritionBasis: NutritionBasis;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  caloriesPerServing: number | null;
  proteinPerServing: number | null;
  carbsPerServing: number | null;
  fatPerServing: number | null;
  fiberPerServing: number | null;
  servingSizeG: number | null;
  servingQuantity: number | null;
  servingUnit: string | null;
};

export type CreatePantryProductPayload = Partial<ProductNutritionPayload> & {
  name: string;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  servingSizeText?: string;
  mealCategories?: ProductCategory[];
};

export type UpdatePantryProductPayload = Partial<ProductNutritionPayload> & {
  name?: string;
  brand?: string | null;
  imageUrl?: string | null;
  servingSizeText?: string | null;
  mealCategories?: ProductCategory[];
};

// ── Product Catalog ─────────────────────────────────────────────────────────

export type ProductCatalogSource =
  | "INTERNAL"
  | "OPEN_FOOD_FACTS"
  | "USDA_FDC"
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
  nutritionBasis?: NutritionBasis;
  caloriesPerServing?: number | null;
  proteinPerServing?: number | null;
  carbsPerServing?: number | null;
  fatPerServing?: number | null;
  fiberPerServing?: number | null;
  sugarPer100g?: number | null;
  saturatedFatPer100g?: number | null;
  sodiumPer100g?: number | null;
  saltPer100g?: number | null;
  nutrients?: NutrientMap | null;
  servingSizeGrams: number | null;
  servingSizeText: string | null;
  servingQuantity?: number | null;
  servingUnit?: string | null;
  source: ProductCatalogSource;
  verificationStatus: ProductCatalogVerificationStatus;
  externalProvider: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AddFromCatalogPayload = Partial<ProductNutritionPayload> & {
  name?: string;
  brand?: string | null;
  imageUrl?: string | null;
  servingSizeText?: string | null;
  mealCategories?: ProductCategory[];
};

// ── Barcode ─────────────────────────────────────────────────────────────────

export type BarcodeResolveResult =
  | { status: "IN_PANTRY"; barcode: string; pantryProduct: PantryProduct }
  | { status: "IN_CATALOG"; barcode: string; catalogItem: ProductCatalogProduct }
  | { status: "NOT_FOUND"; barcode: string };

// ── Shared ──────────────────────────────────────────────────────────────────

export type Page<T> = {
  items: T[];
  nextCursor: string | null;
};

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
  | "nutritionBasis"
  | "caloriesPerServing"
  | "proteinPerServing"
  | "carbsPerServing"
  | "fatPerServing"
  | "fiberPerServing"
  | "servingSizeG"
  | "servingSizeText"
  | "servingQuantity"
  | "servingUnit"
  | "mealCategories"
>;

export type RecipeItem = {
  id: string;
  productId: string;
  grams: number | null;
  servings?: number | null;
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
  items: RecipeItemPayload[];
};

export type RecipeItemPayload = {
  productId: string;
  grams?: number;
  servings?: number;
};

export type UpdateRecipePayload = {
  name?: string;
  description?: string;
  mealType?: MealType | string;
  items?: RecipeItemPayload[];
};

// ── Saved Meals ─────────────────────────────────────────────────────────────

export type SavedMealRecipeItem = {
  grams: number | null;
  servings?: number | null;
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
  mealTypes: Array<MealType | string>;
  items: SavedMealItem[];
  totals: NutritionTotals;
  createdAt: string;
  updatedAt: string;
};

export type CreateSavedMealPayload = {
  name: string;
  mealTypes?: MealType[];
  items: Array<{
    productId?: string;
    recipeId?: string;
    grams?: number;
    servings?: number;
  }>;
};

export type UpdateSavedMealPayload = {
  name?: string;
  mealTypes?: MealType[];
  items?: CreateSavedMealPayload["items"];
};
