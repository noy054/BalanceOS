import { useLocalSearchParams } from 'expo-router';
import { ProductDetailScreen } from '../../../src/features/pantry/screens/ProductDetailScreen';
import { isIngredientEditTarget } from '../../../src/features/pantry/ingredientEditStore';
import { AmountUnit } from '../../../src/features/pantry/helpers/serving';
import { IngredientContext } from '../../../src/features/pantry/hooks/useIngredientQuantityUpdate';

function amountUnit(value: string | undefined): AmountUnit {
  return value === 'servings' || value === 'milliliters' ? value : 'grams';
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ProductDetailRoute() {
  const params = useLocalSearchParams<{
    id: string;
    ingredientOf?: string;
    ingredientKey?: string;
    parentId?: string;
    itemId?: string;
    parentName?: string;
    amount?: string;
    unit?: string;
  }>();
  const id = single(params.id) ?? '';
  const target = single(params.ingredientOf);
  const base = isIngredientEditTarget(target)
    ? {
        target,
        amount: single(params.amount) ?? '',
        unit: amountUnit(single(params.unit)),
        parentName: single(params.parentName) ?? null,
      }
    : null;
  const key = single(params.ingredientKey);
  const parentId = single(params.parentId);
  const itemId = single(params.itemId);

  const ingredient: IngredientContext | null = !base
    ? null
    : key
      ? { ...base, mode: 'draft', key }
      : parentId && itemId
        ? { ...base, mode: 'saved', parentId, itemId }
        : null;

  return <ProductDetailScreen id={id} ingredient={ingredient} />;
}
