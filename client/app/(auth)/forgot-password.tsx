import { useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

import { useForgotPassword } from "../../src/features/auth/hooks/useAuth";
import { ScreenShell } from "../../src/shared/components/ScreenShell";
import { useAppTheme } from "../../src/shared/theme";
import { BrandMark } from "../../src/shared/components/BrandMark";
import { useStyles, getDirectionStyles } from "./styles/login.styles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { t, i18n } = useTranslation("auth");
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);
  const styles = useStyles();
  const { colors } = useAppTheme();

  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();

  const serverError = forgotPassword.isError ? t("forgotPassword.errors.generic") : null;
  const errorMessage = localError ?? serverError;

  function handleSubmit() {
    setLocalError(null);
    if (!email.trim()) return;
    if (!EMAIL_REGEX.test(email.trim())) {
      setLocalError(t("forgotPassword.errors.invalidEmail"));
      return;
    }
    forgotPassword.mutate({ email: email.trim() });
  }

  if (forgotPassword.isSuccess) {
    return (
      <ScreenShell>
        <View style={styles.header}>
          <BrandMark style={[styles.brand, dir.alignStart]} />
          <Text style={[styles.title, dir.text]}>{t("forgotPassword.successTitle")}</Text>
          <Text style={[styles.subtitle, dir.text]}>{t("forgotPassword.successMessage")}</Text>
        </View>

        <Link href="/(auth)/login" style={[styles.link, { marginTop: 24 }]}>
          {t("forgotPassword.backToLogin")}
        </Link>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.header}>
        <BrandMark style={[styles.brand, dir.alignStart]} />
        <Text style={[styles.title, dir.text]}>{t("forgotPassword.title")}</Text>
        <Text style={[styles.subtitle, dir.text]}>{t("forgotPassword.subtitle")}</Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, dir.text]}>{t("forgotPassword.emailLabel")}</Text>
        <TextInput
          key={`email-${i18n.language}`}
          value={email}
          onChangeText={(v) => { setEmail(v); setLocalError(null); forgotPassword.reset(); }}
          placeholder={t("forgotPassword.emailLabel")}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          mode="outlined"
          style={styles.input}
          contentStyle={dir.emailContent}
          disabled={forgotPassword.isPending}
        />
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={[styles.errorText, dir.text]}>{errorMessage}</Text>
        </View>
      ) : null}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={forgotPassword.isPending}
        disabled={forgotPassword.isPending || !email}
        buttonColor={colors.accent}
        textColor={colors.onAccent}
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={styles.primaryBtn}
      >
        {t("forgotPassword.submitButton")}
      </Button>

      <View style={[styles.footer, dir.row]}>
        <Link href="/(auth)/login" style={styles.link}>
          {t("forgotPassword.backToLogin")}
        </Link>
      </View>
    </ScreenShell>
  );
}
