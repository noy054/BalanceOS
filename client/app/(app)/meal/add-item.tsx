import { useLocalSearchParams } from 'expo-router';
import { AddMealItemScreen } from '../../../src/features/meals/screens/AddMealItemScreen';
import { isDateKey } from '../../../src/shared/helpers/dateKey';

export default function AddMealItemRoute() {
  const { mealType, date } = useLocalSearchParams<{ mealType: string; date: string }>();
  const mealTypeParam = typeof mealType === 'string' && mealType ? mealType : undefined;
  const dateParam = isDateKey(date) ? date : undefined;
  return <AddMealItemScreen mealType={mealTypeParam} date={dateParam} />;
}
