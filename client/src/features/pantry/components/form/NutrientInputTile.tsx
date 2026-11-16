import type { ComponentProps } from "react";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";

type Props = {
  label: string;
  unit?: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  value: string;
  error?: string;
  wide?: boolean;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function NutrientInputTile({
  label,
  unit,
  icon,
  color,
  value,
  error,
  wide = false,
  onChangeText,
  onFocus,
  onBlur,
}: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const caption = unit ? `${label} (${unit})` : label;

  return (
    <View
      style={[
        styles.tile,
        !wide && styles.tileCell,
        focused && styles.tileFocused,
        error ? styles.tileError : null,
      ]}
    >
      <View style={[styles.header, wide ? dir.row : styles.headerStacked]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
        <Text style={[styles.label, !wide && styles.labelCentered]} numberOfLines={1}>
          {caption}
        </Text>
      </View>

      <TextInput
        style={[styles.input, wide && styles.inputWide]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        textAlign="center"
        selectTextOnFocus
        accessibilityLabel={caption}
        accessibilityHint={error}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
      />

      {error ? (
        <Text style={styles.error} numberOfLines={2}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      tile: {
        alignItems: "center",
        gap: spacing.xs,
        paddingTop: spacing.ms,
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      tileCell: {
        flex: 1,
        minWidth: 0,
      },
      tileFocused: {
        borderColor: colors.accent,
      },
      tileError: {
        borderColor: colors.danger,
      },
      header: {
        alignItems: "center",
        gap: spacing.xs,
      },
      headerStacked: {
        flexDirection: "column",
        alignSelf: "stretch",
      },
      label: {
        ...typography.caption,
        color: colors.textSecondary,
      },
      labelCentered: {
        textAlign: "center",
        alignSelf: "stretch",
      },
      input: {
        alignSelf: "stretch",
        minHeight: 40,
        paddingVertical: 0,
        textAlign: "center",
        ...typography.value,
        fontFamily: fonts.semibold,
        fontSize: 20,
        color: colors.textPrimary,
      },
      inputWide: {
        fontSize: 26,
        minHeight: 44,
      },
      error: {
        ...typography.caption,
        textAlign: "center",
        color: colors.danger,
      },
    }),
  );
