import { IsEnum } from 'class-validator';
import { MEAL_TYPES } from './add-meal-item.dto';

export class MoveMealItemDto {
  @IsEnum(MEAL_TYPES)
  mealType: (typeof MEAL_TYPES)[number];
}
