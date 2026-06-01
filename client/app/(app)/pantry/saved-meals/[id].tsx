import { useLocalSearchParams } from 'expo-router';
import { SavedMealDetailScreen } from '../../../../src/features/pantry/screens/SavedMealDetailScreen';

export default function SavedMealDetailRoute() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  return <SavedMealDetailScreen id={id} />;
}
