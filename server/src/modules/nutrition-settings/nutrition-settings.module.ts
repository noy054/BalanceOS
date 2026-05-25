import { Module } from '@nestjs/common';
import { NutritionSettingsController } from './nutrition-settings.controller';
import { NutritionSettingsService } from './nutrition-settings.service';
import { NutritionSettingsRepository } from './nutrition-settings.repository';

@Module({
  controllers: [NutritionSettingsController],
  providers: [NutritionSettingsService, NutritionSettingsRepository],
})
export class NutritionSettingsModule {}
