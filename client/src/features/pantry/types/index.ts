// ── Products ────────────────────────────────────────────────────────────────

export type PantryProduct = {
  id: string;
  userId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePantryProductPayload = {
  name: string;
  brand?: string;
  imageUrl?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
};

export type UpdatePantryProductPayload = Partial<CreatePantryProductPayload>;

// ── Shared ───────────────────────────────────────────────────────────────────

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type PantryTab = "products" | "recipes" | "savedMeals";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK_1" | "SNACK_2";

// kept for ProductDetailScreen calculator
export type CalculatedNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
};

// ── Recipes ──────────────────────────────────────────────────────────────────

export type RecipeItemProduct = Pick<
  PantryProduct,
  | "id"
  | "name"
  | "brand"
  | "caloriesPer100g"
  | "proteinPer100g"
  | "carbsPer100g"
  | "fatPer100g"
  | "fiberPer100g"
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
  items: RecipeItem[];
  totals: NutritionTotals;
  createdAt: string;
  updatedAt: string;
};

export type CreateRecipePayload = {
  name: string;
  description?: string;
  items: Array<{ productId: string; grams: number }>;
};

export type UpdateRecipePayload = {
  name?: string;
  description?: string;
  items?: Array<{ productId: string; grams: number }>;
};

// ── Saved Meals ───────────────────────────────────────────────────────────────

export type SavedMealItem = {
  id: string;
  savedMealId: string;
  productId: string | null;
  recipeId: string | null;
  grams: number | null;
  servings: number | null;
  product: RecipeItemProduct | null;
  recipe: {
    id: string;
    name: string;
    items: Array<{ grams: number; product: RecipeItemProduct }>;
  } | null;
  nutrition: NutritionTotals;
};

export type SavedMeal = {
  id: string;
  userId: string;
  name: string;
  mealType: string | null;
  items: SavedMealItem[];
  totals: NutritionTotals;
  createdAt: string;
  updatedAt: string;
};

export type CreateSavedMealPayload = {
  name: string;
  mealType?: string;
  items: Array<{
    productId?: string;
    recipeId?: string;
    grams?: number;
    servings?: number;
  }>;
};

export type UpdateSavedMealPayload = {
  name?: string;
  mealType?: string;
  items?: CreateSavedMealPayload["items"];
};
