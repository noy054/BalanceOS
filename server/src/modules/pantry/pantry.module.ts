import { Module } from '@nestjs/common';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { PantryRepository } from './pantry.repository';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { RecipesRepository } from './recipes.repository';
import { SavedMealsController } from './saved-meals.controller';
import { SavedMealsService } from './saved-meals.service';
import { SavedMealsRepository } from './saved-meals.repository';

@Module({
  controllers: [PantryController, RecipesController, SavedMealsController],
  providers: [
    PantryService,
    PantryRepository,
    RecipesService,
    RecipesRepository,
    SavedMealsService,
    SavedMealsRepository,
  ],
})
export class PantryModule {}
