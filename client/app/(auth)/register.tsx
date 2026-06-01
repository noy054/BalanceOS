import { useState } from "react";
import { Text, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

import { useRegister } from "../../src/features/auth/hooks/useAuth";
import { extractErrorMessage } from "../../src/shared/helpers/extractErrorMessage";
import { ScreenShell } from "../../src/shared/components/ScreenShell";
import { colors } from "../../src/shared/theme";
import { styles, getDirectionStyles } from "./styles/register.styles";

export default function RegisterScreen() {
  const { t, i18n } = useTranslation("auth");

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const register = useRegister();
  const errorMessage = register.error ? extractErrorMessage(register.error) : null;

  function handleRegister() {
    if (!fullName || !email || !password) return;
    register.mutate({ fullName: fullName.trim(), email: email.trim(), password });
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
        <Text style={[styles.title, dir.text]}>{t("register.title")}</Text>
        <Text style={[styles.subtitle, dir.text]}>{t("register.subtitle")}</Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, dir.text]}>{t("register.fullNameLabel")}</Text>
        <TextInput
          key={`full-name-${i18n.language}`}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t("register.fullNameLabel")}
          autoCapitalize="words"
          autoComplete="name"
          mode="outlined"
          style={styles.input}
          contentStyle={dir.inputContent}
          disabled={register.isPending}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, dir.text]}>{t("register.emailLabel")}</Text>
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
          contentStyle={dir.emailContent}
          disabled={register.isPending}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, dir.text]}>{t("register.passwordLabel")}</Text>
        <TextInput
          key={`password-${i18n.language}`}
          value={password}
          onChangeText={setPassword}
          placeholder={t("register.passwordLabel")}
          secureTextEntry={!passwordVisible}
          autoComplete="new-password"
          mode="outlined"
          style={styles.input}
          contentStyle={dir.inputContent}
          disabled={register.isPending}
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
        onPress={handleRegister}
        loading={register.isPending}
        disabled={register.isPending || !fullName || !email || !password}
        buttonColor={colors.primaryGreen}
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={styles.button}
      >
        {t("register.createButton")}
      </Button>

      <View style={[styles.footer, dir.row]}>
        <Text style={styles.footerText}>{t("register.alreadyHaveAccount")}</Text>
        <Link href="/(auth)/login" style={styles.link}>
          {t("register.signIn")}
        </Link>
      </View>
    </ScreenShell>
  );
}
