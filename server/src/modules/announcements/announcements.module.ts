import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { AdminAnnouncementsController } from './admin-announcements.controller';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsRepository } from './announcements.repository';
import { AnnouncementsService } from './announcements.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminAnnouncementsController, AnnouncementsController],
  providers: [AnnouncementsRepository, AnnouncementsService],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
