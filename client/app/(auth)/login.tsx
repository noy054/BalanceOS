import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Link } from 'expo-router';
import { useLogin, useGoogleLogin } from '../../src/features/auth/hooks/useAuth';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';
import { ScreenShell } from '../../src/shared/components/ScreenShell';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const login = useLogin();
  const googleLogin = useGoogleLogin();

  const isLoading = login.isPending || googleLogin.isPending;
  const errorMessage = login.error
    ? extractErrorMessage(login.error)
    : googleLogin.error
      ? extractErrorMessage(googleLogin.error)
      : null;

  function handleLogin() {
    if (!email || !password) return;
    login.mutate({ email: email.trim(), password });
  }

  function handleGoogleLogin() {
    // TODO: wire up expo-auth-session
  }

  return (
    <ScreenShell>
      <View style={styles.header}>
        <Text style={styles.brand}>BalanceOS</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue tracking.</Text>
      </View>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!passwordVisible}
        autoComplete="password"
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
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
        onPress={handleLogin}
        loading={login.isPending}
        disabled={isLoading || !email || !password}
        buttonColor="#111"
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={styles.primaryBtn}
      >
        Sign in
      </Button>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        mode="outlined"
        onPress={handleGoogleLogin}
        disabled={isLoading}
        icon="google"
        buttonColor="#fff"
        textColor="#111"
        contentStyle={styles.btnContent}
        labelStyle={styles.googleLabel}
        style={styles.googleBtn}
      >
        Continue with Google
      </Button>

      <View style={styles.footer}>
        <Text style={styles.footerText}>No account? </Text>
        <Link href="/(auth)/register" style={styles.link}>
          Register
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  btnContent: {
    height: 52,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  primaryBtn: {
    borderRadius: 12,
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  googleBtn: {
    borderRadius: 12,
    borderColor: '#e5e7eb',
    borderWidth: 1.5,
  },
  googleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  link: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },
});
