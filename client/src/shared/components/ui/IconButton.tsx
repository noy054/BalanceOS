import type { ComponentProps } from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppColors, states, useAppTheme, useThemedStyles, radius } from "../../theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type IconButtonVariant = "plain" | "tonal" | "accent" | "filled";

type Props = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: number;
  iconSize?: number;
  color?: string;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

function getPalette(colors: AppColors, variant: IconButtonVariant) {
  switch (variant) {
    case "plain":
      return { bg: "transparent", pressedBg: colors.surfaceMuted, fg: colors.textSecondary };
    case "tonal":
      return { bg: colors.surfaceMuted, pressedBg: colors.border, fg: colors.textPrimary };
    case "accent":
      return { bg: colors.accentSoft, pressedBg: colors.accentBorder, fg: colors.accent };
    case "filled":
      return { bg: colors.accentFill, pressedBg: colors.accentFillPressed, fg: colors.onAccent };
  }
}

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = "plain",
  size = 40,
  iconSize = 22,
  color,
  disabled = false,
  selected,
  style,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const palette = getPalette(colors, variant);
  const hitSlop = Math.max(0, (44 - size) / 2);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          backgroundColor: pressed ? palette.pressedBg : palette.bg,
          opacity: disabled ? states.disabledOpacity : 1,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={color ?? palette.fg} />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
      base: {
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  );
