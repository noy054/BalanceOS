import { NutritionCalculatorService } from '../nutrition-calculator/nutrition-calculator.service';
import { MealComponentInput } from './day-logs.repository';
import { mergeTemplateComponents, totalsSnapshot } from './meal-components';

const calculator = new NutritionCalculatorService();

function component(
  productId: string,
  grams: number,
  caloriesPer100: number,
): MealComponentInput {
  return {
    position: 0,
    name: productId,
    imageUrl: null,
    pantryProductId: productId,
    pantryRecipeId: null,
    grams,
    servings: null,
    milliliters: null,
    serving: null,
    macrosSnapshot: {
      name: productId,
      calories: (caloriesPer100 * grams) / 100,
      protein: grams / 100,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
  };
}

describe('mergeTemplateComponents', () => {
  it('applies template amounts to ingredients that were not changed on that day', () => {
    const previous = [
      component('cucumber', 100, 15),
      component('tomato', 150, 18),
    ];
    const stored = previous;
    const next = [component('cucumber', 200, 15), component('tomato', 150, 18)];

    const result = mergeTemplateComponents(calculator, stored, previous, next);

    expect(result.customized).toBe(false);
    expect(result.components.map((c) => c.grams)).toEqual([200, 150]);
  });

  it('keeps an amount the user changed on that day', () => {
    const previous = [
      component('cucumber', 100, 15),
      component('tomato', 150, 18),
    ];
    const stored = [
      component('cucumber', 137, 15),
      component('tomato', 150, 18),
    ];
    const next = [component('cucumber', 200, 15), component('tomato', 100, 18)];

    const result = mergeTemplateComponents(calculator, stored, previous, next);

    expect(result.customized).toBe(true);
    expect(result.components.map((c) => c.grams)).toEqual([137, 100]);
    expect(result.components[0].macrosSnapshot.calories).toBe(21);
  });

  it('drops removed ingredients and adds new ones from the template', () => {
    const previous = [
      component('cucumber', 100, 15),
      component('tomato', 150, 18),
    ];
    const next = [component('cucumber', 100, 15), component('pepper', 80, 31)];

    const result = mergeTemplateComponents(
      calculator,
      previous,
      previous,
      next,
    );

    expect(result.components.map((c) => c.pantryProductId)).toEqual([
      'cucumber',
      'pepper',
    ]);
    expect(totalsSnapshot('Salad', result.components).calories).toBe(40);
  });
});
