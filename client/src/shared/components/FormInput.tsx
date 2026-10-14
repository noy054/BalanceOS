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
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  multiline?: boolean;
  placeholder?: string;
  editable?: boolean;
  returnKeyType?: "next" | "done" | "go" | "search" | "send";
};

export function FormInput({
  label,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  autoFocus,
  secureTextEntry,
  showPasswordToggle,
  multiline,
  placeholder,
  editable = true,
  returnKeyType = "next",
}: Props) {
  const { i18n } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.group}>
      <Text style={[styles.label, dir.text]}>{label}</Text>

      {showPasswordToggle ? (
        <View
          style={[
            styles.inputRow,
            dir.row,
            error ? styles.inputRowError : null,
            !editable && styles.inputRowDisabled,
          ]}
        >
          <TextInput
            style={[
              styles.inputInner,
              dir.input,
              multiline && styles.inputMultiline,
            ]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoFocus={autoFocus}
            secureTextEntry={secureTextEntry && !visible}
            multiline={multiline}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            editable={editable}
            returnKeyType={returnKeyType}
            textAlign={dir.input.textAlign}
          />

          <Pressable
            style={styles.toggleBtn}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={visible ? "eye-off" : "eye"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      ) : (
        <TextInput
          style={[
            styles.input,
            dir.input,
            error ? styles.inputError : null,
            !editable && styles.inputDisabled,
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          returnKeyType={returnKeyType}
          textAlign={dir.input.textAlign}
        />
      )}

      {error ? <Text style={[styles.error, dir.text]}>{error}</Text> : null}
    </View>
  );
}
