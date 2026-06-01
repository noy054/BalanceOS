import { useLocalSearchParams } from 'expo-router';
import { RecipeDetailScreen } from '../../../../src/features/pantry/screens/RecipeDetailScreen';

export default function RecipeDetailRoute() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  return <RecipeDetailScreen id={id} />;
}
