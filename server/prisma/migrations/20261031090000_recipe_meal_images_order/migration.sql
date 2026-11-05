-- AlterTable
ALTER TABLE "PantryRecipe" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "mealTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "PantryRecipe" SET "mealTypes" = ARRAY["mealType"] WHERE "mealType" IS NOT NULL;

-- AlterTable
ALTER TABLE "PantryRecipeItem" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

UPDATE "PantryRecipeItem" AS item
SET "position" = ordered.rn
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "recipeId" ORDER BY "createdAt", "id") - 1 AS rn
  FROM "PantryRecipeItem"
) AS ordered
WHERE item."id" = ordered."id";

-- AlterTable
ALTER TABLE "SavedMeal" ADD COLUMN "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "SavedMealItem" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

UPDATE "SavedMealItem" AS item
SET "position" = ordered.rn
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "savedMealId" ORDER BY "createdAt", "id") - 1 AS rn
  FROM "SavedMealItem"
) AS ordered
WHERE item."id" = ordered."id";
