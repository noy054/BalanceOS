import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { radius, shadows, spacing, states, typography, useThemedStyles } from "../../theme";
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
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  onDeselect,
  size = "md",
  style,
}: Props<T>) {
  const styles = useStyles();
  const dir = useDirection();

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
              pressed && !isSelected && styles.segmentPressed,
              option.disabled && styles.segmentDisabled,
            ]}
          >
            <Text
              style={[styles.label, isSelected && styles.labelSelected]}
              numberOfLines={1}
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
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        padding: 3,
        gap: 2,
      },
      segment: {
        flex: 1,
        minHeight: 36,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.sm + 1,
        alignItems: "center",
        justifyContent: "center",
      },
      segmentSm: {
        minHeight: 32,
      },
      segmentSelected: {
        backgroundColor: colors.surfaceElevated,
        ...shadows.sm,
      },
      segmentPressed: {
        opacity: states.pressedOpacity,
      },
      segmentDisabled: {
        opacity: states.disabledOpacity,
      },
      label: {
        ...typography.label,
        fontWeight: "500",
        color: colors.textSecondary,
        textAlign: "center",
      },
      labelSelected: {
        fontWeight: "600",
        color: colors.textPrimary,
      },
    }),
  );
