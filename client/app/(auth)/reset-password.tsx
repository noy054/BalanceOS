import { useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";

import { useResetPassword } from "../../src/features/auth/hooks/useAuth";
import { ScreenShell } from "../../src/shared/components/ScreenShell";
import { colors } from "../../src/shared/theme";
import { styles, getDirectionStyles } from "./styles/login.styles";

export default function ResetPasswordScreen() {
  const { t, i18n } = useTranslation("auth");
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const resetPassword = useResetPassword();

  function getServerError(error: unknown): string {
    if (isAxiosError(error) && error.response?.status === 400) {
      return t("resetPassword.errors.invalidToken");
    }
    return t("resetPassword.errors.generic");
  }

  const serverError = resetPassword.isError ? getServerError(resetPassword.error) : null;
  const errorMessage = localError ?? serverError;

  const passwordIcon = (
    <TextInput.Icon
      icon={passwordVisible ? "eye-off" : "eye"}
      onPress={() => setPasswordVisible((v) => !v)}
    />
  );

  function handleSubmit() {
    setLocalError(null);
    if (!token.trim() || !newPassword) return;
    if (newPassword.length < 8) {
      setLocalError(t("resetPassword.errors.passwordTooShort"));
      return;
    }
    resetPassword.mutate({ token: token.trim(), newPassword });
  }

  return (
    <ScreenShell>
      <View style={styles.header}>
        <Text style={[styles.brand, dir.text]}>BalanceOS</Text>
        <Text style={[styles.title, dir.text]}>{t("resetPassword.title")}</Text>
        <Text style={[styles.subtitle, dir.text]}>{t("resetPassword.subtitle")}</Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, dir.text]}>{t("resetPassword.tokenLabel")}</Text>
        <TextInput
          value={token}
          onChangeText={(v) => { setToken(v); setLocalError(null); resetPassword.reset(); }}
          placeholder={t("resetPassword.tokenLabel")}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={styles.input}
          contentStyle={dir.inputContent}
          disabled={resetPassword.isPending}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, dir.text]}>{t("resetPassword.newPasswordLabel")}</Text>
        <TextInput
          key={`password-${i18n.language}`}
          value={newPassword}
          onChangeText={(v) => { setNewPassword(v); setLocalError(null); resetPassword.reset(); }}
          placeholder={t("resetPassword.newPasswordLabel")}
          secureTextEntry={!passwordVisible}
          autoComplete="new-password"
          mode="outlined"
          style={styles.input}
          contentStyle={dir.inputContent}
          disabled={resetPassword.isPending}
          left={isRTL ? passwordIcon : undefined}
          right={!isRTL ? passwordIcon : undefined}
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
        loading={resetPassword.isPending}
        disabled={resetPassword.isPending || !token || !newPassword}
        buttonColor={colors.primaryGreen}
        textColor="#081008"
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={styles.primaryBtn}
      >
        {t("resetPassword.submitButton")}
      </Button>

      <View style={[styles.footer, dir.row]}>
        <Link href="/(auth)/login" style={styles.link}>
          {t("forgotPassword.backToLogin")}
        </Link>
      </View>
    </ScreenShell>
  );
}
