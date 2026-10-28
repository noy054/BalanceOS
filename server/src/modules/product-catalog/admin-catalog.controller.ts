import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { CatalogReviewService } from './catalog-review.service';
import {
  ApproveCatalogSubmissionDto,
  ListCatalogSubmissionsDto,
  RejectCatalogSubmissionDto,
} from './dto/catalog-review.dto';

@UseGuards(JwtGuard, AdminGuard)
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(private readonly service: CatalogReviewService) {}

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
}
