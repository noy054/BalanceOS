import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import {
  CreateBodyEntryDto,
  ListBodyEntriesDto,
  ProgressOverviewQueryDto,
  UpdateBodyEntryDto,
} from './dto/body-entry.dto';
import { MAX_PHOTO_BYTES } from './progress.constants';
import { ProgressService, UploadedPhoto } from './progress.service';

const photoUpload = FileInterceptor('photo', {
  limits: { fileSize: MAX_PHOTO_BYTES, files: 1 },
});

@UseGuards(JwtGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get('overview')
  overview(
    @CurrentUser() user: UserPublic,
    @Query() query: ProgressOverviewQueryDto,
  ) {
    return this.service.overview(user.id, query);
  }

  @Get('entries')
  list(@CurrentUser() user: UserPublic, @Query() query: ListBodyEntriesDto) {
    return this.service.list(user.id, query);
  }

  @Get('entries/:id')
  get(@CurrentUser() user: UserPublic, @Param('id') id: string) {
    return this.service.get(user.id, id);
  }

  @Post('entries')
  @HttpCode(201)
  create(@CurrentUser() user: UserPublic, @Body() dto: CreateBodyEntryDto) {
    return this.service.create(user.id, dto);
  }

  @Patch('entries/:id')
  update(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: UpdateBodyEntryDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete('entries/:id')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.remove(user.id, id);
  }

  @Post('entries/:id/photos')
  @HttpCode(201)
  @UseInterceptors(photoUpload)
  addPhoto(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @UploadedFile() file: UploadedPhoto | undefined,
  ) {
    return this.service.addPhoto(user.id, id, file);
  }

  @Put('photos/:id')
  @UseInterceptors(photoUpload)
  replacePhoto(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @UploadedFile() file: UploadedPhoto | undefined,
  ) {
    return this.service.replacePhoto(user.id, id, file);
  }

  @Delete('photos/:id')
  @HttpCode(204)
  async deletePhoto(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.deletePhoto(user.id, id);
  }

  @Get('photos/:id')
  async photo(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const photo = await this.service.openPhoto(user.id, id);
    res.set({
      'Content-Type': photo.mimeType,
      'Content-Length': String(photo.size),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    });
    photo.stream.pipe(res);
  }
}
