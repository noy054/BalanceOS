import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { AnnouncementsService } from './announcements.service';
import {
  ListAnnouncementsDto,
  PublishAnnouncementDto,
  UpsertAnnouncementDto,
} from './dto/announcement.dto';

@UseGuards(JwtGuard, AdminGuard)
@Controller('admin/announcements')
export class AdminAnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get()
  list(@Query() dto: ListAnnouncementsDto) {
    return this.service.list(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@CurrentUser() user: UserPublic, @Body() dto: UpsertAnnouncementDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: UpsertAnnouncementDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Post(':id/publish')
  publish(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: PublishAnnouncementDto,
  ) {
    return this.service.publish(user.id, id, dto.publishAt);
  }

  @Post(':id/unpublish')
  unpublish(@CurrentUser() user: UserPublic, @Param('id') id: string) {
    return this.service.unpublish(user.id, id);
  }

  @Post(':id/archive')
  archive(@CurrentUser() user: UserPublic, @Param('id') id: string) {
    return this.service.archive(user.id, id);
  }

  @Post(':id/restore')
  restore(@CurrentUser() user: UserPublic, @Param('id') id: string) {
    return this.service.restore(user.id, id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.remove(user.id, id);
  }
}
