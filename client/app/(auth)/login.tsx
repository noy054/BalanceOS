import { useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";

import { useLogin } from "../../src/features/auth/hooks/useAuth";
import { useGoogleSignIn } from "../../src/features/auth/hooks/useGoogleSignIn";
import { ScreenShell } from "../../src/shared/components/ScreenShell";
import { colors } from "../../src/shared/theme";
import { styles, getDirectionStyles } from "./styles/login.styles";

export default function LoginScreen() {
  const { t, i18n } = useTranslation("auth");

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const login = useLogin();
  const googleSignIn = useGoogleSignIn();

  const isLoading = login.isPending || googleSignIn.isPending;

  function getLoginError(error: unknown): string {
    if (isAxiosError(error) && error.response?.status === 401) {
      return t("login.errors.invalidCredentials");
    }

    return t("login.errors.generic");
  }

  const errorMessage = googleSignIn.errorKey
    ? t(googleSignIn.errorKey)
    : login.error
      ? getLoginError(login.error)
      : null;

  function handleLogin() {
    if (!email.trim() || !password) return;

    googleSignIn.clearError();

    login.mutate({
      email: email.trim(),
      password,
    });
  }

  function handleGoogleLogin() {
    login.reset();
    void googleSignIn.signIn();
  }

  const passwordIcon = (
    <TextInput.Icon
      icon={passwordVisible ? "eye-off" : "eye"}
      onPress={() => setPasswordVisible((v) => !v)}
    />
  );

  return (
    <ScreenShell>
      <View style={styles.header}>
        <Text style={[styles.brand, dir.text]}>BalanceOS</Text>
        <Text style={[styles.title, dir.text]}>{t("login.title")}</Text>
        <Text style={[styles.subtitle, dir.text]}>{t("login.subtitle")}</Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, dir.text]}>
          {t("login.emailLabel")}
        </Text>
        <TextInput
          key={`email-${i18n.language}`}
          value={email}
          onChangeText={setEmail}
          placeholder={t("login.emailLabel")}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          mode="outlined"
          style={styles.input}
          contentStyle={dir.emailContent}
          disabled={isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, dir.text]}>
          {t("login.passwordLabel")}
        </Text>
        <TextInput
          key={`password-${i18n.language}`}
          value={password}
          onChangeText={setPassword}
          placeholder={t("login.passwordLabel")}
          secureTextEntry={!passwordVisible}
          autoComplete="password"
          mode="outlined"
          style={styles.input}
          contentStyle={dir.inputContent}
          disabled={isLoading}
          left={isRTL ? passwordIcon : undefined}
          right={!isRTL ? passwordIcon : undefined}
        />

        <Link
          href="/(auth)/forgot-password"
          style={[styles.forgotLink, dir.text]}
        >
          {t("login.forgotPassword")}
        </Link>
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={[styles.errorText, dir.text]}>{errorMessage}</Text>
        </View>
      ) : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={login.isPending}
        disabled={isLoading || !email || !password}
        buttonColor={colors.primaryGreen}
        textColor="#081008"
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={styles.primaryBtn}
      >
        {t("login.signInButton")}
      </Button>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t("login.or")}</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        mode="outlined"
        onPress={handleGoogleLogin}
        loading={googleSignIn.isPending}
        disabled={isLoading}
        icon="google"
        textColor={colors.textPrimary}
        contentStyle={[styles.btnContent, dir.row]}
        labelStyle={styles.googleLabel}
        style={styles.googleBtn}
      >
        {t("login.continueWithGoogle")}
      </Button>

      <View style={[styles.footer, dir.row]}>
        <Text style={styles.footerText}>{t("login.noAccount")}</Text>
        <Link href="/(auth)/register" style={styles.link}>
          {t("login.register")}
        </Link>
      </View>
    </ScreenShell>
  );
}
