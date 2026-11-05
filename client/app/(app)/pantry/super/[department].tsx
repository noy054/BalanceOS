import { Redirect, useLocalSearchParams } from 'expo-router';
import { SuperDepartmentScreen } from '../../../../src/features/pantry/screens/SuperDepartmentScreen';
import { isCatalogDepartment } from '../../../../src/features/pantry/helpers/superDepartments';

export default function SuperDepartmentRoute() {
  const { department: raw } = useLocalSearchParams<{ department: string }>();
  const department = Array.isArray(raw) ? raw[0] : raw;
  if (!isCatalogDepartment(department)) return <Redirect href="/(app)/pantry/super" />;
  return <SuperDepartmentScreen department={department} />;
}
