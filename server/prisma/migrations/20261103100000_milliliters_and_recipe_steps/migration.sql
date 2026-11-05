-- AlterEnum
ALTER TYPE "NutritionBasis" ADD VALUE 'PER_100ML';

-- AlterTable
ALTER TABLE "ProductCatalogItem" ADD COLUMN     "servingSizeMl" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PantryProduct" ADD COLUMN     "servingSizeMl" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PantryRecipe" ADD COLUMN     "steps" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "PantryRecipeItem" ADD COLUMN     "milliliters" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SavedMealItem" ADD COLUMN     "milliliters" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MealItem" ADD COLUMN     "milliliters" DOUBLE PRECISION;
