import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { NutritionSettingsService } from './nutrition-settings.service';
import { UpsertNutritionSettingsDto } from './dto/upsert-nutrition-settings.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { UserNutritionSettingsModel } from '../../../generated/prisma/models';

@UseGuards(JwtGuard)
@Controller('nutrition-settings')
export class NutritionSettingsController {
  constructor(private readonly service: NutritionSettingsService) {}

  @Get()
  getSettings(
    @CurrentUser() user: UserPublic,
  ): Promise<UserNutritionSettingsModel | null> {
    return this.service.getSettings(user.id);
  }

  @Patch()
  upsertSettings(
    @CurrentUser() user: UserPublic,
    @Body() dto: UpsertNutritionSettingsDto,
  ): Promise<UserNutritionSettingsModel> {
    return this.service.upsertSettings(user.id, dto);
  }
}
