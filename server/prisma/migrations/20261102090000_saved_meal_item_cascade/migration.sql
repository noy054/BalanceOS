ALTER TABLE "SavedMealItem" DROP CONSTRAINT "SavedMealItem_productId_fkey";

ALTER TABLE "SavedMealItem" DROP CONSTRAINT "SavedMealItem_recipeId_fkey";

ALTER TABLE "SavedMealItem" ADD CONSTRAINT "SavedMealItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PantryProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedMealItem" ADD CONSTRAINT "SavedMealItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "PantryRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
