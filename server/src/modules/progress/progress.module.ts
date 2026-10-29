import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressPhotoStorage } from './progress-photo.storage';
import { ProgressRepository } from './progress.repository';
import { ProgressService } from './progress.service';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService, ProgressRepository, ProgressPhotoStorage],
  exports: [ProgressService],
})
export class ProgressModule {}
