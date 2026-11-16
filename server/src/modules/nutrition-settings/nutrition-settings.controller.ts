import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { NutritionSettingsService } from './nutrition-settings.service';
import { UpsertNutritionSettingsDto } from './dto/upsert-nutrition-settings.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { UserNutritionSettingsModel } from '../../../generated/prisma/models';
import { TargetSuggestionResponse } from './dto/target-suggestion-response.dto';
import { DEFAULT_MARKET_CODE, MARKETS } from '../../common/market/markets';

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

  @Get('markets')
  getMarkets(): { markets: { code: string }[]; defaultCode: string } {
    return {
      markets: MARKETS.map((market) => ({ code: market.code })),
      defaultCode: DEFAULT_MARKET_CODE,
    };
  }

  @Get('target-suggestion')
  getTargetSuggestion(
    @CurrentUser() user: UserPublic,
  ): Promise<TargetSuggestionResponse> {
    return this.service.getTargetSuggestion(user.id);
  }

  @Patch()
  upsertSettings(
    @CurrentUser() user: UserPublic,
    @Body() dto: UpsertNutritionSettingsDto,
  ): Promise<UserNutritionSettingsModel> {
    return this.service.upsertSettings(user.id, dto);
  }
}
