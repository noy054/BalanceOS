import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Link } from 'expo-router';
import { useRegister } from '../../src/features/auth/hooks/useAuth';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';
import { ScreenShell } from '../../src/shared/components/ScreenShell';
import { authScreenStyles as shared } from '../../src/features/auth/styles/authScreenStyles';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const register = useRegister();

  const errorMessage = register.error ? extractErrorMessage(register.error) : null;

  function handleRegister() {
    if (!fullName || !email || !password) return;
    register.mutate({ fullName: fullName.trim(), email: email.trim(), password });
  }

  return (
    <ScreenShell>
      <View style={styles.header}>
        <Text style={styles.brand}>BalanceOS</Text>
        <Text style={shared.title}>Create account</Text>
        <Text style={shared.subtitle}>Start tracking your nutrition.</Text>
      </View>

      <TextInput
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        autoComplete="name"
        mode="outlined"
        style={shared.input}
        disabled={register.isPending}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        mode="outlined"
        style={shared.input}
        disabled={register.isPending}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!passwordVisible}
        autoComplete="new-password"
        mode="outlined"
        style={shared.input}
        disabled={register.isPending}
        right={
          <TextInput.Icon
            icon={passwordVisible ? 'eye-off' : 'eye'}
            onPress={() => setPasswordVisible((v) => !v)}
          />
        }
      />

      {errorMessage ? (
        <HelperText type="error" visible>
          {errorMessage}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={register.isPending}
        disabled={register.isPending || !fullName || !email || !password}
        buttonColor="#111"
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={shared.button}
      >
        Create account
      </Button>

      <View style={shared.footer}>
        <Text style={shared.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login" style={shared.link}>
          Sign in
        </Link>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  btnContent: {
    height: 52,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
