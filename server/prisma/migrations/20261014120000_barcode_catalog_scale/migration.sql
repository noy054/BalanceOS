-- Barcode / product catalog scale-readiness
-- * Canonical 13-digit GTIN in "normalizedBarcode" (unique on catalog, unique per user on pantry)
-- * Pantry products keep provenance via "catalogItemId"
-- * Trigram indexes for ILIKE search, composite index for paginated pantry lists
-- * Negative cache table for barcodes unknown to every provider
-- Data steps are non-destructive: duplicates keep their row, only the newer duplicate's
-- "normalizedBarcode" is cleared so the unique indexes can be created.

-- Extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- DropIndex (replaced or unused)
DROP INDEX "ProductCatalogItem_barcode_key";
DROP INDEX "ProductCatalogItem_barcode_idx";
DROP INDEX "ProductCatalogItem_normalizedBarcode_idx";
DROP INDEX "ProductCatalogItem_name_idx";
DROP INDEX "ProductCatalogItem_brand_idx";
DROP INDEX "ProductCatalogItem_category_idx";
DROP INDEX "ProductCatalogItem_countryCode_idx";
DROP INDEX "ProductCatalogItem_source_idx";
DROP INDEX "ProductCatalogItem_verificationStatus_idx";
DROP INDEX "PantryProduct_userId_idx";
DROP INDEX "PantryProduct_barcode_idx";
DROP INDEX "PantryProduct_userId_barcode_key";

-- AlterTable
ALTER TABLE "PantryProduct" ADD COLUMN     "catalogItemId" TEXT,
ADD COLUMN     "normalizedBarcode" TEXT;

-- CreateTable
CREATE TABLE "BarcodeLookupMiss" (
    "normalizedBarcode" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarcodeLookupMiss_pkey" PRIMARY KEY ("normalizedBarcode")
);

-- Backfill: canonical GTIN-13 (mirrors normalizeBarcode() in server/src/common/barcode/barcode.utils.ts,
-- without the check-digit test; non-GTIN values become NULL)
UPDATE "ProductCatalogItem" SET "normalizedBarcode" = CASE
    WHEN btrim("barcode") ~ '^0[0-9]{13}$' THEN substr(btrim("barcode"), 2)
    WHEN btrim("barcode") ~ '^[0-9]{14}$' THEN btrim("barcode")
    WHEN btrim("barcode") ~ '^([0-9]{8}|[0-9]{12}|[0-9]{13})$' THEN lpad(btrim("barcode"), 13, '0')
    ELSE NULL
END;

UPDATE "PantryProduct" SET "normalizedBarcode" = CASE
    WHEN btrim("barcode") ~ '^0[0-9]{13}$' THEN substr(btrim("barcode"), 2)
    WHEN btrim("barcode") ~ '^[0-9]{14}$' THEN btrim("barcode")
    WHEN btrim("barcode") ~ '^([0-9]{8}|[0-9]{12}|[0-9]{13})$' THEN lpad(btrim("barcode"), 13, '0')
    ELSE NULL
END
WHERE "barcode" IS NOT NULL;

-- De-duplicate (keep the oldest row's key)
UPDATE "ProductCatalogItem" c SET "normalizedBarcode" = NULL
FROM (
    SELECT "id", row_number() OVER (PARTITION BY "normalizedBarcode" ORDER BY "createdAt", "id") AS rn
    FROM "ProductCatalogItem" WHERE "normalizedBarcode" IS NOT NULL
) d
WHERE c."id" = d."id" AND d.rn > 1;

UPDATE "PantryProduct" p SET "normalizedBarcode" = NULL
FROM (
    SELECT "id", row_number() OVER (PARTITION BY "userId", "normalizedBarcode" ORDER BY "createdAt", "id") AS rn
    FROM "PantryProduct" WHERE "normalizedBarcode" IS NOT NULL
) d
WHERE p."id" = d."id" AND d.rn > 1;

-- Link existing pantry products to their catalog source
UPDATE "PantryProduct" p SET "catalogItemId" = c."id"
FROM "ProductCatalogItem" c
WHERE p."normalizedBarcode" IS NOT NULL AND c."normalizedBarcode" = p."normalizedBarcode";

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogItem_normalizedBarcode_key" ON "ProductCatalogItem"("normalizedBarcode");
CREATE INDEX "ProductCatalogItem_name_trgm_idx" ON "ProductCatalogItem" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "ProductCatalogItem_brand_trgm_idx" ON "ProductCatalogItem" USING GIN ("brand" gin_trgm_ops);
CREATE INDEX "ProductCatalogItem_updatedByUserId_idx" ON "ProductCatalogItem"("updatedByUserId");
CREATE INDEX "PantryProduct_userId_name_id_idx" ON "PantryProduct"("userId", "name", "id");
CREATE INDEX "PantryProduct_catalogItemId_idx" ON "PantryProduct"("catalogItemId");
CREATE INDEX "PantryProduct_name_trgm_idx" ON "PantryProduct" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "PantryProduct_brand_trgm_idx" ON "PantryProduct" USING GIN ("brand" gin_trgm_ops);
CREATE UNIQUE INDEX "PantryProduct_userId_normalizedBarcode_key" ON "PantryProduct"("userId", "normalizedBarcode");

-- AddForeignKey
ALTER TABLE "PantryProduct" ADD CONSTRAINT "PantryProduct_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "ProductCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
