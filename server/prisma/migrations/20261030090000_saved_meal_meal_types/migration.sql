-- AlterTable
ALTER TABLE "SavedMeal" ADD COLUMN "mealTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "SavedMeal" SET "mealTypes" = ARRAY["mealType"] WHERE "mealType" IS NOT NULL;

ALTER TABLE "SavedMeal" DROP COLUMN "mealType";
