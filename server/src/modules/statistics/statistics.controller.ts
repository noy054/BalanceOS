import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ProAccessGuard } from '../billing/pro-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { StatisticsQueryDto } from './dto/statistics-query.dto';
import { StatisticsService } from './statistics.service';
import { NutritionReportService } from './nutrition-report.service';
import { NutritionReportQueryDto } from './dto/nutrition-report-query.dto';

@UseGuards(JwtGuard, ProAccessGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly service: StatisticsService,
    private readonly reports: NutritionReportService,
  ) {}

  @Get('report')
  report(
    @CurrentUser() user: UserPublic,
    @Query() query: NutritionReportQueryDto,
  ) {
    return this.reports.report(user.id, query.from, query.to);
  }

  @Get()
  get(@CurrentUser() user: UserPublic, @Query() query: StatisticsQueryDto) {
    return this.service.getStatistics(
      user.id,
      query.range ?? '7D',
      query.endDate,
      query.today,
    );
  }
}
