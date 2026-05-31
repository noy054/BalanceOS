import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

import { useRegister } from "../../src/features/auth/hooks/useAuth";
import { extractErrorMessage } from "../../src/shared/helpers/extractErrorMessage";
import { ScreenShell } from "../../src/shared/components/ScreenShell";

export default function RegisterScreen() {
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

  const footerStyle = {
    ...styles.footer,
    flexDirection: isRTL ? "row-reverse" : "row",
  } as const;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const register = useRegister();

  const errorMessage = register.error
    ? extractErrorMessage(register.error)
    : null;

  function handleRegister() {
    if (!fullName || !email || !password) return;

    register.mutate({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
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

        <Text style={[styles.title, { textAlign }]}>{t("register.title")}</Text>

        <Text style={[styles.subtitle, { textAlign }]}>
          {t("register.subtitle")}
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { textAlign }]}>
          {t("register.fullNameLabel")}
        </Text>

        <TextInput
          key={`full-name-${i18n.language}`}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t("register.fullNameLabel")}
          autoCapitalize="words"
          autoComplete="name"
          mode="outlined"
          style={styles.input}
          contentStyle={inputContentStyle}
          disabled={register.isPending}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { textAlign }]}>
          {t("register.emailLabel")}
        </Text>

        <TextInput
          key={`email-${i18n.language}`}
          value={email}
          onChangeText={setEmail}
          placeholder={t("register.emailLabel")}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          mode="outlined"
          style={styles.input}
          contentStyle={emailContentStyle}
          disabled={register.isPending}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { textAlign }]}>
          {t("register.passwordLabel")}
        </Text>

        <TextInput
          key={`password-${i18n.language}`}
          value={password}
          onChangeText={setPassword}
          placeholder={t("register.passwordLabel")}
          secureTextEntry={!passwordVisible}
          autoComplete="new-password"
          mode="outlined"
          style={styles.input}
          contentStyle={inputContentStyle}
          disabled={register.isPending}
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
        onPress={handleRegister}
        loading={register.isPending}
        disabled={register.isPending || !fullName || !email || !password}
        buttonColor="#111"
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={styles.button}
      >
        {t("register.createButton")}
      </Button>

      <View style={footerStyle}>
        <Text style={styles.footerText}>
          {t("register.alreadyHaveAccount")}
        </Text>

        <Link href="/(auth)/login" style={styles.link}>
          {t("register.signIn")}
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
    marginBottom: 32,
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
  button: {
    marginTop: 4,
    borderRadius: 12,
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
