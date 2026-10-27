import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, TextInput, View, ViewStyle } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../theme";
import { useDirection } from "../../hooks/useDirection";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  tone?: "surface" | "muted";
  autoFocus?: boolean;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SearchField({
  value,
  onChangeText,
  placeholder,
  tone = "surface",
  autoFocus,
  trailing,
  style,
}: Props) {
  const { t } = useTranslation("common");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.row, dir.row, style]}>
      <View style={[styles.field, tone === "muted" && styles.fieldMuted, dir.row]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />

        <TextInput
          style={[styles.input, dir.text]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          autoFocus={autoFocus}
          accessibilityLabel={placeholder}
        />

        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText("")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t("actions.clearSearch")}
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {trailing}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        gap: spacing.sm,
      },
      field: {
        flex: 1,
        minHeight: 44,
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      },
      fieldMuted: {
        backgroundColor: colors.surfaceMuted,
        borderColor: "transparent",
      },
      input: {
        flex: 1,
        ...typography.body,
        color: colors.textPrimary,
        paddingVertical: spacing.sm,
      },
    }),
  );
