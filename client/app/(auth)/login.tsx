import { useState } from "react";
import { Text, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

import { useLogin, useGoogleLogin } from "../../src/features/auth/hooks/useAuth";
import { extractErrorMessage } from "../../src/shared/helpers/extractErrorMessage";
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
        <Text style={[styles.fieldLabel, dir.text]}>{t("login.emailLabel")}</Text>
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
        <Text style={[styles.fieldLabel, dir.text]}>{t("login.passwordLabel")}</Text>
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
      </View>

      {errorMessage ? (
        <HelperText type="error" visible style={dir.text}>
          {errorMessage}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={login.isPending}
        disabled={isLoading || !email || !password}
        buttonColor={colors.primaryGreen}
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
        onPress={() => {}}
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
