import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useLogout } from '../../src/features/auth/hooks/useAuth';
import { useAuthStore } from '../../src/features/auth/hooks/useAuthStore';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user?.fullName ?? 'there'}.</Text>
      <Text style={styles.note}>Nutrition tracking coming soon.</Text>
      <Button
        mode="outlined"
        onPress={() => logout.mutate()}
        loading={logout.isPending}
        style={styles.button}
      >
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#333', marginBottom: 8 },
  note: { fontSize: 14, color: '#777', marginBottom: 32 },
  button: { borderRadius: 6 },
});
