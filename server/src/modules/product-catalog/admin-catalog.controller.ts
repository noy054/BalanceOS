import {
  Body,
  Controller,
  Get,
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
import { CatalogReviewService } from './catalog-review.service';
import { CatalogAdminService } from './catalog-admin.service';
import {
  ApproveCatalogSubmissionDto,
  ArchiveCatalogItemDto,
  ListCatalogItemsDto,
  ListCatalogSubmissionsDto,
  MergeCatalogSubmissionDto,
  RejectCatalogSubmissionDto,
  UpdateCatalogItemDto,
} from './dto/catalog-review.dto';

@UseGuards(JwtGuard, AdminGuard)
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(
    private readonly service: CatalogReviewService,
    private readonly items: CatalogAdminService,
  ) {}

  @Get('submissions')
  list(@Query() dto: ListCatalogSubmissionsDto) {
    return this.service.list(dto);
  }

  @Get('summary')
  summary() {
    return this.service.summary();
  }

  @Get('submissions/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('submissions/:id/approve')
  approve(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: ApproveCatalogSubmissionDto,
  ) {
    return this.service.approve(user.id, id, dto);
  }

  @Post('submissions/:id/reject')
  reject(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: RejectCatalogSubmissionDto,
  ) {
    return this.service.reject(user.id, id, dto.reviewNote);
  }

  @Post('submissions/:id/merge')
  merge(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: MergeCatalogSubmissionDto,
  ) {
    return this.service.merge(user.id, id, dto);
  }

  @Get('items')
  listItems(@Query() dto: ListCatalogItemsDto) {
    return this.items.list(dto);
  }

  @Get('items/:id')
  getItem(@Param('id') id: string) {
    return this.items.getById(id);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: UpdateCatalogItemDto,
  ) {
    return this.items.update(user.id, id, dto);
  }

  @Post('items/:id/archive')
  archiveItem(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: ArchiveCatalogItemDto,
  ) {
    return this.items.archive(user.id, id, dto.reason);
  }

  @Post('items/:id/restore')
  restoreItem(@CurrentUser() user: UserPublic, @Param('id') id: string) {
    return this.items.restore(user.id, id);
  }
}
