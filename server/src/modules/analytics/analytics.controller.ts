import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsDashboardQueryDto,
  TrackEventsDto,
} from './dto/analytics.dto';

@UseGuards(JwtGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Post('events')
  @HttpCode(202)
  track(@CurrentUser() user: UserPublic, @Body() dto: TrackEventsDto) {
    return this.service.record(user, dto);
  }
}

@UseGuards(JwtGuard, AdminGuard)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get()
  dashboard(@Query() query: AnalyticsDashboardQueryDto) {
    return this.service.dashboard(query);
  }
}
