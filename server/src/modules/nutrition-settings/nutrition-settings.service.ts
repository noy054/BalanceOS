import { Injectable } from '@nestjs/common';
import { NutritionSettingsRepository } from './nutrition-settings.repository';
import { UpsertNutritionSettingsDto } from './dto/upsert-nutrition-settings.dto';
import { UserNutritionSettingsModel } from '../../../generated/prisma/models';

@Injectable()
export class NutritionSettingsService {
  constructor(private readonly repo: NutritionSettingsRepository) {}

  async getSettings(userId: string): Promise<UserNutritionSettingsModel | null> {
    return this.repo.findByUserId(userId);
  }

  async upsertSettings(
    userId: string,
    dto: UpsertNutritionSettingsDto,
  ): Promise<UserNutritionSettingsModel> {
    return this.repo.upsert(userId, dto);
  }
}
