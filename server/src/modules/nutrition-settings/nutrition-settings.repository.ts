import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertNutritionSettingsDto } from './dto/upsert-nutrition-settings.dto';
import { UserNutritionSettingsModel } from '../../../generated/prisma/models';

@Injectable()
export class NutritionSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserNutritionSettingsModel | null> {
    return this.prisma.userNutritionSettings.findUnique({ where: { userId } });
  }

  async upsert(
    userId: string,
    dto: UpsertNutritionSettingsDto,
  ): Promise<UserNutritionSettingsModel> {
    return this.prisma.userNutritionSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }
}
