-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- DropIndex
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

UPDATE "ProductCatalogItem" SET "normalizedBarcode" = NULL
WHERE "normalizedBarcode" IS NOT NULL
  AND (
    CASE WHEN LENGTH("normalizedBarcode") = 13 THEN
      MOD(10 - MOD(
        CAST(SUBSTR("normalizedBarcode", 1, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 2, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 3, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 4, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 5, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 6, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 7, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 8, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 9, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 10, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 11, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 12, 1) AS INT) * 3,
      10), 10) != CAST(SUBSTR("normalizedBarcode", 13, 1) AS INT)
    WHEN LENGTH("normalizedBarcode") = 14 THEN
      MOD(10 - MOD(
        CAST(SUBSTR("normalizedBarcode", 1, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 2, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 3, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 4, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 5, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 6, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 7, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 8, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 9, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 10, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 11, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 12, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 13, 1) AS INT) * 3,
      10), 10) != CAST(SUBSTR("normalizedBarcode", 14, 1) AS INT)
    ELSE TRUE
    END
  );

UPDATE "PantryProduct" SET "normalizedBarcode" = NULL
WHERE "normalizedBarcode" IS NOT NULL
  AND (
    CASE WHEN LENGTH("normalizedBarcode") = 13 THEN
      MOD(10 - MOD(
        CAST(SUBSTR("normalizedBarcode", 1, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 2, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 3, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 4, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 5, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 6, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 7, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 8, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 9, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 10, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 11, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 12, 1) AS INT) * 3,
      10), 10) != CAST(SUBSTR("normalizedBarcode", 13, 1) AS INT)
    WHEN LENGTH("normalizedBarcode") = 14 THEN
      MOD(10 - MOD(
        CAST(SUBSTR("normalizedBarcode", 1, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 2, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 3, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 4, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 5, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 6, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 7, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 8, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 9, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 10, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 11, 1) AS INT) * 3 +
        CAST(SUBSTR("normalizedBarcode", 12, 1) AS INT) * 1 +
        CAST(SUBSTR("normalizedBarcode", 13, 1) AS INT) * 3,
      10), 10) != CAST(SUBSTR("normalizedBarcode", 14, 1) AS INT)
    ELSE TRUE
    END
  );

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
