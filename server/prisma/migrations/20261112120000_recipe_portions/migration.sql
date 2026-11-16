CREATE TYPE "RecipePortionMode" AS ENUM ('COUNT', 'TARGET');

CREATE TYPE "RecipePortionTarget" AS ENUM ('GRAMS', 'CALORIES', 'PROTEIN');

CREATE TYPE "RecipeLeftoverMode" AS ENUM ('SEPARATE', 'REDISTRIBUTE', 'UNALLOCATED');

ALTER TABLE "PantryRecipe" ADD COLUMN "emptyPotWeightG" DOUBLE PRECISION,
ADD COLUMN "potWithFoodWeightG" DOUBLE PRECISION,
ADD COLUMN "cookedWeightG" DOUBLE PRECISION,
ADD COLUMN "portionMode" "RecipePortionMode",
ADD COLUMN "portionCount" INTEGER,
ADD COLUMN "portionTarget" "RecipePortionTarget",
ADD COLUMN "portionTargetValue" DOUBLE PRECISION,
ADD COLUMN "leftoverMode" "RecipeLeftoverMode";
