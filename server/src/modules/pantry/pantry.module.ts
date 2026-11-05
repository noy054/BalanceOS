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
import { ProductCatalogModule } from '../product-catalog/product-catalog.module';
import { PantryItemValidator } from './pantry-item.validator';
import { FoodImagesModule } from '../food-images/food-images.module';
import { DayLogsModule } from '../day-logs/day-logs.module';

@Module({
  imports: [ProductCatalogModule, FoodImagesModule, DayLogsModule],
  controllers: [PantryController, RecipesController, SavedMealsController],
  providers: [
    PantryService,
    PantryRepository,
    RecipesService,
    RecipesRepository,
    SavedMealsService,
    SavedMealsRepository,
    PantryItemValidator,
  ],
  exports: [PantryService],
})
export class PantryModule {}
