import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NutritionSettingsModule } from './modules/nutrition-settings/nutrition-settings.module';
import { PantryModule } from './modules/pantry/pantry.module';
import { DayLogsModule } from './modules/day-logs/day-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    NutritionSettingsModule,
    PantryModule,
    DayLogsModule,
  ],
})
export class AppModule {}
