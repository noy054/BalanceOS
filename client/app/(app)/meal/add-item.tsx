import { useLocalSearchParams } from 'expo-router';
import { AddMealItemScreen } from '../../../src/features/meals/screens/AddMealItemScreen';

export default function AddMealItemRoute() {
  const { mealType } = useLocalSearchParams<{ mealType: string }>();
  const mealTypeParam = typeof mealType === 'string' && mealType ? mealType : undefined;
  return <AddMealItemScreen mealType={mealTypeParam} />;
}
