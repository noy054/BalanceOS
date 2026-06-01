import { useLocalSearchParams } from 'expo-router';
import { ProductDetailScreen } from '../../../src/features/pantry/screens/ProductDetailScreen';

export default function ProductDetailRoute() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  return <ProductDetailScreen id={id} />;
}
