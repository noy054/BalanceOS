ALTER TABLE "UserNutritionSettings" ADD COLUMN "weighInReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "weighInReminderDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN "weighInReminderTime" TEXT;
