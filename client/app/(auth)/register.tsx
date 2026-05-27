import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../../src/features/auth/hooks/useAuth';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';
import { ScreenShell } from '../../src/shared/components/ScreenShell';
import { getTextAlign } from '../../src/shared/i18n';

export default function RegisterScreen() {
  const { t } = useTranslation('auth');
  const textAlign = getTextAlign();

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
        <Text style={[styles.title, { textAlign }]}>{t('register.title')}</Text>
        <Text style={[styles.subtitle, { textAlign }]}>{t('register.subtitle')}</Text>
      </View>

      <TextInput
        label={t('register.fullNameLabel')}
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        autoComplete="name"
        mode="outlined"
        style={styles.input}
        contentStyle={{ textAlign: textAlign }}
        disabled={register.isPending}
      />

      <TextInput
        label={t('register.emailLabel')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        mode="outlined"
        style={styles.input}
        contentStyle={{ textAlign: textAlign }}
        disabled={register.isPending}
      />

      <TextInput
        label={t('register.passwordLabel')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!passwordVisible}
        autoComplete="new-password"
        mode="outlined"
        style={styles.input}
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
        style={styles.button}
      >
        {t('register.createButton')}
      </Button>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('register.alreadyHaveAccount')} </Text>
        <Link href="/(auth)/login" style={styles.link}>
          {t('register.signIn')}
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
    marginBottom: 32,
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
  button: {
    marginTop: 4,
    borderRadius: 12,
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
