import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { StatisticsRepository } from './statistics.repository';
import { NutritionReportService } from './nutrition-report.service';

@Module({
  imports: [BillingModule],
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsRepository, NutritionReportService],
})
export class StatisticsModule {}
