-- AlterTable
ALTER TABLE "ProductCatalogItem" ADD COLUMN     "department" TEXT;

-- CreateIndex
CREATE INDEX "ProductCatalogItem_department_name_idx" ON "ProductCatalogItem"("department", "name");
