import { Pressable, StyleSheet, Text, View } from "react-native";

import { useDirection } from "../../hooks/useDirection";
import { fonts, radius, spacing, states, typography, useThemedStyles } from "../../theme";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function ChoiceChips<T extends string>({ options, value, onChange }: Props<T>) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.row, dir.row]} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && !selected && styles.pressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
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
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      chip: {
        borderRadius: radius.sm,
        minHeight: 36,
        justifyContent: "center",
        paddingHorizontal: spacing.ms,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.surface,
      },
      chipSelected: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
      },
      pressed: { opacity: states.pressedOpacity },
      label: {
        ...typography.label,
        color: colors.textSecondary,
      },
      labelSelected: {
        fontFamily: fonts.semibold,
        color: colors.accent,
      },
    }),
  );
