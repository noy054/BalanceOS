import { Module } from '@nestjs/common';
import { DayLogsController } from './day-logs.controller';
import { DayLogsService } from './day-logs.service';
import { DayLogsRepository } from './day-logs.repository';
import { TemplateLogSyncService } from './template-log-sync.service';
import { NutritionCalculatorModule } from '../nutrition-calculator/nutrition-calculator.module';

@Module({
  imports: [NutritionCalculatorModule],
  controllers: [DayLogsController],
  providers: [DayLogsService, DayLogsRepository, TemplateLogSyncService],
  exports: [TemplateLogSyncService],
})
export class DayLogsModule {}
