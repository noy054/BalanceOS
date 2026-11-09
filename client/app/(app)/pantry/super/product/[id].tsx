import { useLocalSearchParams } from "expo-router";
import { SuperProductDetailScreen } from "../../../../../src/features/pantry/screens/SuperProductDetailScreen";

export default function SuperProductRoute() {
  const { id: raw } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(raw) ? raw[0] : raw;
  return <SuperProductDetailScreen id={id ?? ""} />;
}
