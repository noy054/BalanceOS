CREATE TABLE "MarketProductReference" (
    "marketCode" TEXT NOT NULL,
    "normalizedBarcode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "packageQuantity" DOUBLE PRECISION,
    "packageUnit" TEXT,
    "originCountry" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketProductReference_pkey" PRIMARY KEY ("marketCode","normalizedBarcode")
);

CREATE INDEX "MarketProductReference_normalizedBarcode_idx" ON "MarketProductReference"("normalizedBarcode");
