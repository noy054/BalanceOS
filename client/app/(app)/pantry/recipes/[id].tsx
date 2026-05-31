import { useLocalSearchParams } from 'expo-router';
import { RecipeDetailScreen } from '../../../../src/features/pantry/screens/RecipeDetailScreen';

export default function RecipeDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecipeDetailScreen id={id} />;
}
