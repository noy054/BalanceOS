import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppColors,
  fonts,
  spacing,
  typography,
  useAppTheme,
  useThemedStyles, radius } from "../../theme";
import { useDirection } from "../../hooks/useDirection";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type ButtonVariant = "primary" | "secondary" | "tonal" | "ghost" | "danger" | "destructive";
export type ButtonSize = "md" | "sm";

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

function getVariantColors(colors: AppColors, variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return { bg: colors.accentFill, pressedBg: colors.accentFillPressed, fg: colors.onAccent, border: "transparent" };
    case "secondary":
      return { bg: colors.surface, pressedBg: colors.surfaceMuted, fg: colors.textPrimary, border: colors.borderStrong };
    case "tonal":
      return { bg: colors.accentSoft, pressedBg: colors.accentBorder, fg: colors.accent, border: "transparent" };
    case "ghost":
      return { bg: "transparent", pressedBg: colors.accentSoft, fg: colors.accent, border: "transparent" };
    case "danger":
      return { bg: colors.surface, pressedBg: colors.dangerSoft, fg: colors.danger, border: colors.danger };
    case "destructive":
      return { bg: colors.dangerFill, pressedBg: colors.dangerFillPressed, fg: colors.onAccent, border: "transparent" };
  }
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();

  const palette = getVariantColors(colors, variant);
  const isInactive = disabled || loading;
  const fg = disabled ? colors.disabledText : palette.fg;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: disabled
            ? colors.disabledBackground
            : pressed
              ? palette.pressedBg
              : palette.bg,
          borderColor: disabled ? "transparent" : palette.border,
        },
        style,
      ]}
    >
      <View style={[styles.content, dir.row]}>
        {loading ? (
          <ActivityIndicator size="small" color={fg} />
        ) : icon ? (
          <MaterialCommunityIcons name={icon} size={size === "sm" ? 16 : 18} color={fg} />
        ) : null}

        <Text
          style={[size === "sm" ? styles.labelSm : styles.label, { color: fg }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
      base: {
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
      },
      md: {
        minHeight: 48,
        paddingHorizontal: spacing.md,
      },
      sm: {
        borderRadius: radius.sm,
        minHeight: 36,
        paddingHorizontal: spacing.ms,
      },
      fullWidth: {
        alignSelf: "stretch",
      },
      content: {
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
      },
      label: {
        ...typography.bodyStrong,
        fontFamily: fonts.semibold,
      },
      labelSm: {
        ...typography.label,
        fontFamily: fonts.semibold,
      },
    }),
  );
