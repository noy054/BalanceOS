import { Pressable, StyleSheet, Text, View } from "react-native";

import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
};

export function ChoiceBoxes<T extends string>({ options, selected, onToggle }: Props<T>) {
  const styles = useStyles();
  const dir = useDirection();
  const dense = options.length > 4;

  return (
    <View style={[styles.row, dir.row]}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => onToggle(option.value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.box,
              dense && styles.boxDense,
              active && styles.boxActive,
              pressed && !active && styles.pressed,
            ]}
          >
            <Text
              style={[styles.label, dense && styles.labelDense, active && styles.labelActive]}
              numberOfLines={2}
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
      row: {
        gap: spacing.sm,
      },
      box: {
        flex: 1,
        minWidth: 0,
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.xs,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      boxDense: {
        paddingHorizontal: 2,
      },
      boxActive: {
        borderColor: colors.accentFill,
        backgroundColor: colors.accentFill,
      },
      pressed: {
        opacity: 0.75,
      },
      label: {
        ...typography.label,
        fontSize: 14,
        textAlign: "center",
        color: colors.textSecondary,
      },
      labelDense: {
        fontSize: 13,
        lineHeight: 16,
      },
      labelActive: {
        fontFamily: fonts.semibold,
        color: colors.onAccent,
      },
    }),
  );
