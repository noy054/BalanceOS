import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  useLogin,
  useGoogleLogin,
} from "../../src/features/auth/hooks/useAuth";
import { extractErrorMessage } from "../../src/shared/helpers/extractErrorMessage";
import { ScreenShell } from "../../src/shared/components/ScreenShell";

export default function LoginScreen() {
  const { t, i18n } = useTranslation("auth");

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const textAlign = isRTL ? "right" : "left";
  const direction = isRTL ? "rtl" : "ltr";

  const inputContentStyle = {
    textAlign,
    writingDirection: direction,
  } as const;

  const emailContentStyle = {
    textAlign,
    writingDirection: "ltr",
  } as const;

  const buttonContentStyle = {
    ...styles.btnContent,
    flexDirection: isRTL ? "row-reverse" : "row",
  } as const;

  const footerStyle = {
    ...styles.footer,
    flexDirection: isRTL ? "row-reverse" : "row",
  } as const;

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

    login.mutate({
      email: email.trim(),
      password,
    });
  }

  function handleGoogleLogin() {
    // TODO: wire up expo-auth-session
  }

  const passwordIcon = (
    <TextInput.Icon
      icon={passwordVisible ? "eye-off" : "eye"}
      onPress={() => setPasswordVisible((value) => !value)}
    />
  );

  return (
    <ScreenShell>
      <View style={styles.header}>
        <Text style={[styles.brand, { textAlign }]}>BalanceOS</Text>

        <Text style={[styles.title, { textAlign }]}>{t("login.title")}</Text>

        <Text style={[styles.subtitle, { textAlign }]}>
          {t("login.subtitle")}
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { textAlign }]}>
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
          contentStyle={emailContentStyle}
          disabled={isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { textAlign }]}>
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
          contentStyle={inputContentStyle}
          disabled={isLoading}
          left={isRTL ? passwordIcon : undefined}
          right={!isRTL ? passwordIcon : undefined}
        />
      </View>

      {errorMessage ? (
        <HelperText type="error" visible style={{ textAlign }}>
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
        disabled={isLoading}
        icon="google"
        buttonColor="#fff"
        textColor="#111"
        contentStyle={buttonContentStyle}
        labelStyle={styles.googleLabel}
        style={styles.googleBtn}
      >
        {t("login.continueWithGoogle")}
      </Button>

      <View style={footerStyle}>
        <Text style={styles.footerText}>{t("login.noAccount")}</Text>

        <Link href="/(auth)/register" style={styles.link}>
          {t("login.register")}
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
    fontWeight: "700",
    letterSpacing: 2,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
  },
  btnContent: {
    height: 52,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  primaryBtn: {
    borderRadius: 12,
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  googleBtn: {
    borderRadius: 12,
    borderColor: "#e5e7eb",
    borderWidth: 1.5,
  },
  googleLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    color: "#6b7280",
    fontSize: 14,
  },
  link: {
    color: "#111",
    fontWeight: "700",
    fontSize: 14,
  },
});
