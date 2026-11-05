-- AlterTable
ALTER TABLE "ProductCatalogItem" ADD COLUMN     "subcategoryKey" TEXT;

-- CreateIndex
CREATE INDEX "ProductCatalogItem_department_subcategoryKey_name_idx" ON "ProductCatalogItem"("department", "subcategoryKey", "name");
