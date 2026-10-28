-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AnnouncementKind" AS ENUM ('UPDATE', 'NOTICE', 'IMPORTANT');

-- CreateEnum
CREATE TYPE "AnnouncementDisplay" AS ENUM ('BANNER', 'POPUP');

-- CreateEnum
CREATE TYPE "AnnouncementActionType" AS ENUM ('NONE', 'ROUTE', 'URL');

-- AlterEnum
ALTER TYPE "CatalogSubmissionStatus" ADD VALUE 'MERGED';

-- AlterTable
ALTER TABLE "CatalogSubmission" ADD COLUMN     "productName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ProductCatalogItem" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedByUserId" TEXT;

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "kind" "AnnouncementKind" NOT NULL DEFAULT 'NOTICE',
    "display" "AnnouncementDisplay" NOT NULL DEFAULT 'BANNER',
    "titleHe" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bodyHe" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "actionType" "AnnouncementActionType" NOT NULL DEFAULT 'NONE',
    "actionTarget" TEXT,
    "actionLabelHe" TEXT,
    "actionLabelEn" TEXT,
    "platforms" TEXT[],
    "minAppVersion" TEXT,
    "maxAppVersion" TEXT,
    "publishAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementReceipt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "AnnouncementReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_entityId_createdAt_idx" ON "AdminAuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorUserId_idx" ON "AdminAuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "Announcement_status_publishAt_expiresAt_idx" ON "Announcement"("status", "publishAt", "expiresAt");

-- CreateIndex
CREATE INDEX "Announcement_createdByUserId_idx" ON "Announcement"("createdByUserId");

-- CreateIndex
CREATE INDEX "Announcement_updatedByUserId_idx" ON "Announcement"("updatedByUserId");

-- CreateIndex
CREATE INDEX "AnnouncementReceipt_announcementId_idx" ON "AnnouncementReceipt"("announcementId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementReceipt_userId_announcementId_key" ON "AnnouncementReceipt"("userId", "announcementId");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_archivedAt_idx" ON "ProductCatalogItem"("archivedAt");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_archivedByUserId_idx" ON "ProductCatalogItem"("archivedByUserId");

-- AddForeignKey
ALTER TABLE "ProductCatalogItem" ADD CONSTRAINT "ProductCatalogItem_archivedByUserId_fkey" FOREIGN KEY ("archivedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementReceipt" ADD CONSTRAINT "AnnouncementReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementReceipt" ADD CONSTRAINT "AnnouncementReceipt_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill
UPDATE "CatalogSubmission"
SET "productName" = COALESCE("proposedData"->>'name', '')
WHERE "productName" = '';

INSERT INTO "CatalogSubmission" ("id", "kind", "status", "userId", "pantryProductId", "normalizedBarcode", "productName", "proposedData", "createdAt", "updatedAt")
SELECT
  'bf2_' || p.id,
  'NEW_PRODUCT',
  'PENDING',
  p."userId",
  p.id,
  p."normalizedBarcode",
  p."name",
  jsonb_build_object(
    'name', p."name",
    'brand', p."brand",
    'imageUrl', p."imageUrl",
    'barcode', p."barcode",
    'nutritionBasis', p."nutritionBasis",
    'caloriesPer100g', p."caloriesPer100g",
    'proteinPer100g', p."proteinPer100g",
    'carbsPer100g', p."carbsPer100g",
    'fatPer100g', p."fatPer100g",
    'fiberPer100g', p."fiberPer100g",
    'caloriesPerServing', p."caloriesPerServing",
    'proteinPerServing', p."proteinPerServing",
    'carbsPerServing', p."carbsPerServing",
    'fatPerServing', p."fatPerServing",
    'fiberPerServing', p."fiberPerServing",
    'servingSizeG', p."servingSizeG",
    'servingQuantity', p."servingQuantity",
    'servingUnit', p."servingUnit",
    'servingSizeText', p."servingSizeText",
    'nutrients', p."nutrients"
  ),
  p."createdAt",
  CURRENT_TIMESTAMP
FROM "PantryProduct" AS p
WHERE p."catalogItemId" IS NULL
  AND NOT EXISTS (SELECT 1 FROM "CatalogSubmission" s WHERE s."pantryProductId" = p.id);
