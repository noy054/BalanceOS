-- CreateEnum
CREATE TYPE "FoodUnit" AS ENUM ('GRAMS', 'SERVING', 'PIECE');

-- CreateEnum
CREATE TYPE "ProductSource" AS ENUM ('INTERNAL', 'OPEN_FOOD_FACTS', 'USDA_FDC', 'MANUAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "ProductVerificationStatus" AS ENUM ('UNVERIFIED', 'USER_SUBMITTED', 'AUTO_IMPORTED', 'ADMIN_VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNutritionSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceMode" TEXT NOT NULL DEFAULT 'GUIDED',
    "targetMode" TEXT NOT NULL DEFAULT 'AUTO',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'he',
    "dailyCaloriesTarget" INTEGER,
    "proteinTarget" INTEGER,
    "carbsTarget" INTEGER,
    "fatTarget" INTEGER,
    "fiberTarget" INTEGER,
    "gender" TEXT,
    "birthDate" TIMESTAMP(3),
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "trainingDaysPerWeek" INTEGER,
    "goalType" TEXT,
    "themeMode" TEXT NOT NULL DEFAULT 'LIGHT',
    "showFiberOnHome" BOOLEAN NOT NULL DEFAULT true,
    "showCarbsOnHome" BOOLEAN NOT NULL DEFAULT true,
    "showFatOnHome" BOOLEAN NOT NULL DEFAULT true,
    "showProgressPercentages" BOOLEAN NOT NULL DEFAULT true,
    "showGuidedSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "showMotivation" BOOLEAN NOT NULL DEFAULT true,
    "defaultFoodUnit" "FoodUnit" NOT NULL DEFAULT 'GRAMS',
    "breakfastReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "breakfastReminderTime" TEXT,
    "lunchReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lunchReminderTime" TEXT,
    "dinnerReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dinnerReminderTime" TEXT,
    "waterReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "waterReminderInterval" INTEGER,
    "dailySummaryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailySummaryTime" TEXT,
    "weeklySummaryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "weeklySummaryDay" INTEGER,
    "weeklySummaryTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNutritionSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCatalogItem" (
    "id" TEXT NOT NULL,
    "barcode" TEXT,
    "gtin" TEXT,
    "normalizedBarcode" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "manufacturer" TEXT,
    "category" TEXT,
    "subCategory" TEXT,
    "countryCode" TEXT DEFAULT 'IL',
    "languageCode" TEXT DEFAULT 'he',
    "imageUrl" TEXT,
    "ingredientsText" TEXT,
    "allergensText" TEXT,
    "servingSizeText" TEXT,
    "servingSizeGrams" DOUBLE PRECISION,
    "caloriesPer100g" DOUBLE PRECISION,
    "proteinPer100g" DOUBLE PRECISION,
    "carbsPer100g" DOUBLE PRECISION,
    "sugarPer100g" DOUBLE PRECISION,
    "fatPer100g" DOUBLE PRECISION,
    "saturatedFatPer100g" DOUBLE PRECISION,
    "fiberPer100g" DOUBLE PRECISION,
    "sodiumPer100g" DOUBLE PRECISION,
    "saltPer100g" DOUBLE PRECISION,
    "source" "ProductSource" NOT NULL DEFAULT 'MANUAL',
    "verificationStatus" "ProductVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "externalProvider" TEXT,
    "externalId" TEXT,
    "externalRawData" JSONB,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "barcode" TEXT,
    "imageUrl" TEXT,
    "caloriesPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "carbsPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "fiberPer100g" DOUBLE PRECISION,
    "servingSizeG" DOUBLE PRECISION,
    "servingSizeText" TEXT,
    "mealCategories" "ProductCategory"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryRecipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mealType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryRecipeItem" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryRecipeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedMeal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mealType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedMealItem" (
    "id" TEXT NOT NULL,
    "savedMealId" TEXT NOT NULL,
    "productId" TEXT,
    "recipeId" TEXT,
    "grams" DOUBLE PRECISION,
    "servings" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedMealItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "targetsSnapshot" JSONB NOT NULL,
    "caloriesTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proteinTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fatTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fiberTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealEntry" (
    "id" TEXT NOT NULL,
    "dayLogId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealItem" (
    "id" TEXT NOT NULL,
    "mealEntryId" TEXT NOT NULL,
    "pantryProductId" TEXT,
    "pantryRecipeId" TEXT,
    "savedMealId" TEXT,
    "grams" DOUBLE PRECISION,
    "servings" DOUBLE PRECISION,
    "macrosSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserNutritionSettings_userId_key" ON "UserNutritionSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogItem_barcode_key" ON "ProductCatalogItem"("barcode");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_barcode_idx" ON "ProductCatalogItem"("barcode");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_normalizedBarcode_idx" ON "ProductCatalogItem"("normalizedBarcode");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_name_idx" ON "ProductCatalogItem"("name");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_brand_idx" ON "ProductCatalogItem"("brand");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_category_idx" ON "ProductCatalogItem"("category");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_countryCode_idx" ON "ProductCatalogItem"("countryCode");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_source_idx" ON "ProductCatalogItem"("source");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_verificationStatus_idx" ON "ProductCatalogItem"("verificationStatus");

-- CreateIndex
CREATE INDEX "ProductCatalogItem_createdByUserId_idx" ON "ProductCatalogItem"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PantryProduct_userId_idx" ON "PantryProduct"("userId");

-- CreateIndex
CREATE INDEX "PantryProduct_barcode_idx" ON "PantryProduct"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "PantryProduct_userId_barcode_key" ON "PantryProduct"("userId", "barcode");

-- CreateIndex
CREATE INDEX "PantryRecipe_userId_idx" ON "PantryRecipe"("userId");

-- CreateIndex
CREATE INDEX "PantryRecipeItem_recipeId_idx" ON "PantryRecipeItem"("recipeId");

-- CreateIndex
CREATE INDEX "SavedMeal_userId_idx" ON "SavedMeal"("userId");

-- CreateIndex
CREATE INDEX "SavedMealItem_savedMealId_idx" ON "SavedMealItem"("savedMealId");

-- CreateIndex
CREATE INDEX "DayLog_userId_idx" ON "DayLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DayLog_userId_date_key" ON "DayLog"("userId", "date");

-- CreateIndex
CREATE INDEX "MealEntry_dayLogId_idx" ON "MealEntry"("dayLogId");

-- CreateIndex
CREATE UNIQUE INDEX "MealEntry_dayLogId_mealType_key" ON "MealEntry"("dayLogId", "mealType");

-- CreateIndex
CREATE INDEX "MealItem_mealEntryId_idx" ON "MealItem"("mealEntryId");

-- AddForeignKey
ALTER TABLE "UserNutritionSettings" ADD CONSTRAINT "UserNutritionSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogItem" ADD CONSTRAINT "ProductCatalogItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogItem" ADD CONSTRAINT "ProductCatalogItem_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryProduct" ADD CONSTRAINT "PantryProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryRecipe" ADD CONSTRAINT "PantryRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryRecipeItem" ADD CONSTRAINT "PantryRecipeItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "PantryRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryRecipeItem" ADD CONSTRAINT "PantryRecipeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PantryProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMeal" ADD CONSTRAINT "SavedMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMealItem" ADD CONSTRAINT "SavedMealItem_savedMealId_fkey" FOREIGN KEY ("savedMealId") REFERENCES "SavedMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMealItem" ADD CONSTRAINT "SavedMealItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PantryProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMealItem" ADD CONSTRAINT "SavedMealItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "PantryRecipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayLog" ADD CONSTRAINT "DayLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_dayLogId_fkey" FOREIGN KEY ("dayLogId") REFERENCES "DayLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealEntryId_fkey" FOREIGN KEY ("mealEntryId") REFERENCES "MealEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_pantryProductId_fkey" FOREIGN KEY ("pantryProductId") REFERENCES "PantryProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_pantryRecipeId_fkey" FOREIGN KEY ("pantryRecipeId") REFERENCES "PantryRecipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_savedMealId_fkey" FOREIGN KEY ("savedMealId") REFERENCES "SavedMeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
