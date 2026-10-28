-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "NutritionBasis" AS ENUM ('PER_100G', 'PER_SERVING');

-- CreateEnum
CREATE TYPE "CatalogSubmissionKind" AS ENUM ('CORRECTION', 'NEW_PRODUCT');

-- CreateEnum
CREATE TYPE "CatalogSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "PantryProduct" ADD COLUMN     "caloriesPerServing" DOUBLE PRECISION,
ADD COLUMN     "carbsPerServing" DOUBLE PRECISION,
ADD COLUMN     "fatPerServing" DOUBLE PRECISION,
ADD COLUMN     "fiberPerServing" DOUBLE PRECISION,
ADD COLUMN     "nutrients" JSONB,
ADD COLUMN     "nutritionBasis" "NutritionBasis" NOT NULL DEFAULT 'PER_100G',
ADD COLUMN     "proteinPerServing" DOUBLE PRECISION,
ALTER COLUMN "caloriesPer100g" DROP NOT NULL,
ALTER COLUMN "proteinPer100g" DROP NOT NULL,
ALTER COLUMN "carbsPer100g" DROP NOT NULL,
ALTER COLUMN "fatPer100g" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PantryRecipeItem" ADD COLUMN     "servings" DOUBLE PRECISION,
ALTER COLUMN "grams" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductCatalogItem" ADD COLUMN     "caloriesPerServing" DOUBLE PRECISION,
ADD COLUMN     "carbsPerServing" DOUBLE PRECISION,
ADD COLUMN     "fatPerServing" DOUBLE PRECISION,
ADD COLUMN     "fiberPerServing" DOUBLE PRECISION,
ADD COLUMN     "nutrients" JSONB,
ADD COLUMN     "nutritionBasis" "NutritionBasis" NOT NULL DEFAULT 'PER_100G',
ADD COLUMN     "originalData" JSONB,
ADD COLUMN     "proteinPerServing" DOUBLE PRECISION,
ADD COLUMN     "servingQuantity" DOUBLE PRECISION,
ADD COLUMN     "servingUnit" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "CatalogSubmission" (
    "id" TEXT NOT NULL,
    "kind" "CatalogSubmissionKind" NOT NULL,
    "status" "CatalogSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "pantryProductId" TEXT,
    "catalogItemId" TEXT,
    "normalizedBarcode" TEXT,
    "proposedData" JSONB NOT NULL,
    "reviewedByUserId" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogSubmission_status_kind_createdAt_idx" ON "CatalogSubmission"("status", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "CatalogSubmission_pantryProductId_idx" ON "CatalogSubmission"("pantryProductId");

-- CreateIndex
CREATE INDEX "CatalogSubmission_catalogItemId_idx" ON "CatalogSubmission"("catalogItemId");

-- CreateIndex
CREATE INDEX "CatalogSubmission_userId_idx" ON "CatalogSubmission"("userId");

-- AddForeignKey
ALTER TABLE "CatalogSubmission" ADD CONSTRAINT "CatalogSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogSubmission" ADD CONSTRAINT "CatalogSubmission_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogSubmission" ADD CONSTRAINT "CatalogSubmission_pantryProductId_fkey" FOREIGN KEY ("pantryProductId") REFERENCES "PantryProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogSubmission" ADD CONSTRAINT "CatalogSubmission_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "ProductCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "ProductCatalogItem" AS c
SET "nutrients" = sub.n
FROM (
  SELECT p.id, jsonb_object_agg(regexp_replace(e.key, '_100g$', ''), e.value) AS n
  FROM "ProductCatalogItem" AS p,
       jsonb_each(p."externalRawData" -> 'nutriments') AS e
  WHERE p."externalProvider" = 'open_food_facts'
    AND jsonb_typeof(p."externalRawData" -> 'nutriments') = 'object'
    AND e.key LIKE '%\_100g'
    AND jsonb_typeof(e.value) = 'number'
  GROUP BY p.id
) AS sub
WHERE c.id = sub.id AND c."nutrients" IS NULL;

UPDATE "ProductCatalogItem"
SET "sugarPer100g" = COALESCE("sugarPer100g", ("nutrients" ->> 'sugars')::double precision),
    "saturatedFatPer100g" = COALESCE("saturatedFatPer100g", ("nutrients" ->> 'saturated-fat')::double precision),
    "sodiumPer100g" = COALESCE("sodiumPer100g", ("nutrients" ->> 'sodium')::double precision),
    "saltPer100g" = COALESCE("saltPer100g", ("nutrients" ->> 'salt')::double precision)
WHERE "nutrients" IS NOT NULL;

UPDATE "ProductCatalogItem"
SET "originalData" = jsonb_build_object(
  'name', "name",
  'brand', "brand",
  'imageUrl', "imageUrl",
  'barcode', "barcode",
  'nutritionBasis', 'PER_100G',
  'caloriesPer100g', "caloriesPer100g",
  'proteinPer100g', "proteinPer100g",
  'carbsPer100g', "carbsPer100g",
  'fatPer100g', "fatPer100g",
  'fiberPer100g', "fiberPer100g",
  'servingSizeG', "servingSizeGrams",
  'servingSizeText', "servingSizeText",
  'nutrients', "nutrients"
)
WHERE "originalData" IS NULL;

INSERT INTO "CatalogSubmission" ("id", "kind", "status", "userId", "pantryProductId", "normalizedBarcode", "proposedData", "createdAt", "updatedAt")
SELECT
  'bf_' || p.id,
  'NEW_PRODUCT',
  'PENDING',
  p."userId",
  p.id,
  p."normalizedBarcode",
  jsonb_build_object(
    'name', p."name",
    'brand', p."brand",
    'imageUrl', p."imageUrl",
    'barcode', p."barcode",
    'nutritionBasis', 'PER_100G',
    'caloriesPer100g', p."caloriesPer100g",
    'proteinPer100g', p."proteinPer100g",
    'carbsPer100g', p."carbsPer100g",
    'fatPer100g', p."fatPer100g",
    'fiberPer100g', p."fiberPer100g",
    'servingSizeG', p."servingSizeG",
    'servingQuantity', p."servingQuantity",
    'servingUnit', p."servingUnit",
    'servingSizeText', p."servingSizeText"
  ),
  p."createdAt",
  CURRENT_TIMESTAMP
FROM "PantryProduct" AS p
WHERE p."catalogItemId" IS NULL
  AND NOT EXISTS (SELECT 1 FROM "CatalogSubmission" s WHERE s."pantryProductId" = p.id);
