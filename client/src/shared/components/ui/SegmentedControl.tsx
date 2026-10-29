import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { fonts, radius, spacing, states, typography, useThemedStyles } from "../../theme";
import { useDirection } from "../../hooks/useDirection";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  onDeselect?: () => void;
  size?: "md" | "sm";
  variant?: "segmented" | "tabs";
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  onDeselect,
  size = "md",
  variant = "segmented",
  style,
}: Props<T>) {
  const styles = useStyles();
  const dir = useDirection();
  const isTabs = variant === "tabs";

  return (
    <View style={[styles.track, dir.row, style]} accessibilityRole="tablist">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected, disabled: option.disabled }}
            disabled={option.disabled}
            onPress={() => {
              if (isSelected) {
                onDeselect?.();
                return;
              }
              onChange(option.value);
            }}
            style={({ pressed }) => [
              styles.segment,
              size === "sm" && styles.segmentSm,
              isSelected && styles.segmentSelected,
              pressed && !isSelected && styles.pressed,
              option.disabled && styles.disabled,
            ]}
          >
            <Text
              style={[styles.label, isSelected && styles.labelSelected]}
              numberOfLines={isTabs ? 2 : 1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      track: {
        padding: 3,
        gap: 3,
        borderRadius: radius.md + 2,
        backgroundColor: colors.surfaceMuted,
      },
      segment: {
        flex: 1,
        minHeight: 40,
        paddingHorizontal: spacing.xs,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.md - 1,
      },
      segmentSm: {
        minHeight: 34,
      },
      segmentSelected: {
        backgroundColor: colors.accentFill,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      disabled: {
        opacity: states.disabledOpacity,
      },
      label: {
        ...typography.label,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
      },
      labelSelected: {
        fontFamily: fonts.semibold,
        color: colors.onAccent,
      },
    }),
  );
