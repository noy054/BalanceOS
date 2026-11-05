import { Module } from '@nestjs/common';
import { FoodImagesController } from './food-images.controller';
import { FoodImagesService } from './food-images.service';
import { FoodImageStorage } from './food-image.storage';

@Module({
  controllers: [FoodImagesController],
  providers: [FoodImagesService, FoodImageStorage],
  exports: [FoodImagesService],
})
export class FoodImagesModule {}
