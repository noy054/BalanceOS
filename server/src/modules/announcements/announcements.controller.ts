import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { AnnouncementsService } from './announcements.service';
import { ActiveAnnouncementsQueryDto } from './dto/announcement.dto';

@UseGuards(JwtGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get('active')
  active(
    @CurrentUser() user: UserPublic,
    @Query() query: ActiveAnnouncementsQueryDto,
  ) {
    return this.service.activeForUser(user.id, query);
  }

  @Post(':id/seen')
  @HttpCode(204)
  async seen(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.markSeen(user.id, id);
  }

  @Post(':id/dismiss')
  @HttpCode(204)
  async dismiss(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.dismiss(user.id, id);
  }
}
