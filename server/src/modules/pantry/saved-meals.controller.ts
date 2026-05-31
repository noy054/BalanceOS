import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SavedMealsService } from './saved-meals.service';
import { CreateSavedMealDto } from './dto/create-saved-meal.dto';
import { UpdateSavedMealDto } from './dto/update-saved-meal.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';

@UseGuards(JwtGuard)
@Controller('pantry/saved-meals')
export class SavedMealsController {
  constructor(private readonly service: SavedMealsService) {}

  @Get()
  list(@CurrentUser() user: UserPublic) {
    return this.service.list(user.id);
  }

  @Get(':id')
  getById(@CurrentUser() user: UserPublic, @Param('id') id: string) {
    return this.service.getById(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: UserPublic, @Body() dto: CreateSavedMealDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: UpdateSavedMealDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@CurrentUser() user: UserPublic, @Param('id') id: string): Promise<void> {
    return this.service.delete(user.id, id);
  }
}
