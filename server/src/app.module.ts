import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NutritionSettingsModule } from './modules/nutrition-settings/nutrition-settings.module';
import { PantryModule } from './modules/pantry/pantry.module';
import { DayLogsModule } from './modules/day-logs/day-logs.module';
import { ProductCatalogModule } from './modules/product-catalog/product-catalog.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { BarcodeModule } from './modules/barcode/barcode.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProgressModule } from './modules/progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    NutritionSettingsModule,
    PantryModule,
    DayLogsModule,
    ProductCatalogModule,
    StatisticsModule,
    BarcodeModule,
    AnnouncementsModule,
    AdminModule,
    ProgressModule,
  ],
})
export class AppModule {}
