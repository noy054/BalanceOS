import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DayLogsService } from './day-logs.service';
import { AddMealItemDto } from './dto/add-meal-item.dto';
import { CopyMealDto } from './dto/copy-meal.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { ParseDayKeyPipe } from '../../common/date/parse-day-key.pipe';

@UseGuards(JwtGuard)
@Controller('day-logs')
export class DayLogsController {
  constructor(private readonly service: DayLogsService) {}

  @Get('today')
  getToday(@CurrentUser() user: UserPublic) {
    return this.service.getOrCreateToday(user.id);
  }

  @Get('today/meals')
  getTodayMeals(@CurrentUser() user: UserPublic) {
    return this.service.getTodayMeals(user.id);
  }

  @Post('today/meal-items')
  @HttpCode(201)
  addMealItem(@CurrentUser() user: UserPublic, @Body() dto: AddMealItemDto) {
    return this.service.addMealItem(user.id, dto);
  }

  @Get('calendar')
  getCalendar(
    @CurrentUser() user: UserPublic,
    @Query('from', ParseDayKeyPipe) from: string,
    @Query('to', ParseDayKeyPipe) to: string,
  ) {
    return this.service.getCalendar(user.id, from, to);
  }

  @Get('date/:date')
  getDay(
    @CurrentUser() user: UserPublic,
    @Param('date', ParseDayKeyPipe) date: string,
  ) {
    return this.service.getDay(user.id, date);
  }

  @Get('date/:date/meals')
  getDayMeals(
    @CurrentUser() user: UserPublic,
    @Param('date', ParseDayKeyPipe) date: string,
  ) {
    return this.service.getDayMeals(user.id, date);
  }

  @Post('date/:date/meal-items')
  @HttpCode(201)
  addMealItemOnDate(
    @CurrentUser() user: UserPublic,
    @Param('date', ParseDayKeyPipe) date: string,
    @Body() dto: AddMealItemDto,
  ) {
    return this.service.addMealItemOnDate(user.id, date, dto);
  }

  @Post('meal-entries/:mealEntryId/copy')
  @HttpCode(204)
  async copyMealEntry(
    @CurrentUser() user: UserPublic,
    @Param('mealEntryId') mealEntryId: string,
    @Body() dto: CopyMealDto,
  ): Promise<void> {
    return this.service.copyMealEntry(user.id, mealEntryId, dto);
  }

  @Delete('meal-entries/:mealEntryId')
  @HttpCode(204)
  async removeMealEntry(
    @CurrentUser() user: UserPublic,
    @Param('mealEntryId') mealEntryId: string,
  ): Promise<void> {
    return this.service.removeMealEntry(user.id, mealEntryId);
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
