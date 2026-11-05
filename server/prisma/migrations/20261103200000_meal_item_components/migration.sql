-- CreateTable
CREATE TABLE "MealItemComponent" (
    "id" TEXT NOT NULL,
    "mealItemId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "pantryProductId" TEXT,
    "pantryRecipeId" TEXT,
    "grams" DOUBLE PRECISION,
    "servings" DOUBLE PRECISION,
    "milliliters" DOUBLE PRECISION,
    "serving" JSONB,
    "macrosSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealItemComponent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealItemComponent_mealItemId_position_idx" ON "MealItemComponent"("mealItemId", "position");

-- AddForeignKey
ALTER TABLE "MealItemComponent" ADD CONSTRAINT "MealItemComponent_mealItemId_fkey" FOREIGN KEY ("mealItemId") REFERENCES "MealItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItemComponent" ADD CONSTRAINT "MealItemComponent_pantryProductId_fkey" FOREIGN KEY ("pantryProductId") REFERENCES "PantryProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItemComponent" ADD CONSTRAINT "MealItemComponent_pantryRecipeId_fkey" FOREIGN KEY ("pantryRecipeId") REFERENCES "PantryRecipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
