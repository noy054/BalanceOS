import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
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
import { MAX_FOOD_IMAGE_BYTES } from './food-images.constants';
import { FoodImagesService, UploadedFoodImage } from './food-images.service';

const imageUpload = FileInterceptor('image', {
  limits: { fileSize: MAX_FOOD_IMAGE_BYTES, files: 1 },
});

@UseGuards(JwtGuard)
@Controller('food-images')
export class FoodImagesController {
  constructor(private readonly service: FoodImagesService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(imageUpload)
  upload(
    @CurrentUser() user: UserPublic,
    @UploadedFile() file: UploadedFoodImage | undefined,
  ) {
    return this.service.upload(user.id, file);
  }

  @Get(':file')
  async image(
    @CurrentUser() user: UserPublic,
    @Param('file') file: string,
    @Res() res: Response,
  ): Promise<void> {
    const image = await this.service.open(user.id, file);
    res.set({
      'Content-Type': image.mimeType,
      'Content-Length': String(image.size),
      'Cache-Control': 'private, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    });
    image.stream.pipe(res);
  }
}
