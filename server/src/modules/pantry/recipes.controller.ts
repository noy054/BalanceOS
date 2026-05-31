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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';

@UseGuards(JwtGuard)
@Controller('pantry/recipes')
export class RecipesController {
  constructor(private readonly service: RecipesService) {}

  @Get()
  list(@CurrentUser() user: UserPublic) {
    return this.service.list(user.id);
  }

  @Get(':id')
  getById(@CurrentUser() user: UserPublic, @Param('id') id: string) {
    return this.service.getById(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: UserPublic, @Body() dto: CreateRecipeDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPublic,
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@CurrentUser() user: UserPublic, @Param('id') id: string): Promise<void> {
    return this.service.delete(user.id, id);
  }
}
