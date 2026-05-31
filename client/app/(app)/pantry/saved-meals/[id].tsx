import { useLocalSearchParams } from 'expo-router';
import { SavedMealDetailScreen } from '../../../../src/features/pantry/screens/SavedMealDetailScreen';

export default function SavedMealDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SavedMealDetailScreen id={id} />;
}
