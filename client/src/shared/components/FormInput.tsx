import { useState } from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../theme";
import { getDirectionStyles, useStyles } from "./styles/FormInput.styles";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  multiline?: boolean;
  placeholder?: string;
  editable?: boolean;
  readOnlyAppearance?: "disabled" | "field";
  returnKeyType?: "next" | "done" | "go" | "search" | "send";
};

export function FormInput({
  label,
  value,
  onChangeText,
  error,
  hint,
  keyboardType = "default",
  autoFocus,
  secureTextEntry,
  showPasswordToggle,
  multiline,
  placeholder,
  editable = true,
  readOnlyAppearance = "disabled",
  returnKeyType = "next",
}: Props) {
  const { t, i18n } = useTranslation("common");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const [visible, setVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const frameStyles = [
    styles.frame,
    dir.row,
    isFocused && styles.frameFocused,
    error ? styles.frameError : null,
    !editable && readOnlyAppearance === "disabled" && styles.frameDisabled,
  ];

  return (
    <View style={styles.group}>
      <Text style={[styles.label, dir.text]}>{label}</Text>

      <View style={frameStyles}>
        <TextInput
          style={[styles.input, dir.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          secureTextEntry={showPasswordToggle ? secureTextEntry && !visible : secureTextEntry}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          returnKeyType={returnKeyType}
          textAlign={dir.input.textAlign}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {showPasswordToggle ? (
          <Pressable
            style={styles.toggleBtn}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? t("actions.hidePassword") : t("actions.showPassword")}
          >
            <MaterialCommunityIcons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={[styles.messageRow, dir.row]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
          <Text style={[styles.error, dir.text]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[styles.hint, dir.text]}>{hint}</Text>
      ) : null}
    </View>
  );
}
