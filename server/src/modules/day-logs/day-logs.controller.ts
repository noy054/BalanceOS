import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DayLogsService } from './day-logs.service';
import { AddMealItemDto } from './dto/add-meal-item.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';

@UseGuards(JwtGuard)
@Controller('day-logs')
export class DayLogsController {
  constructor(private readonly service: DayLogsService) {}

  @Get('today')
  getToday(@CurrentUser() user: UserPublic) {
    return this.service.getOrCreateToday(user.id);
  }

  @Post('today/meal-items')
  @HttpCode(201)
  addMealItem(
    @CurrentUser() user: UserPublic,
    @Body() dto: AddMealItemDto,
  ) {
    return this.service.addMealItem(user.id, dto);
  }

  @Delete('meal-items/:itemId')
  @HttpCode(204)
  async removeMealItem(
    @CurrentUser() user: UserPublic,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    return this.service.removeMealItem(user.id, itemId);
  }
}
