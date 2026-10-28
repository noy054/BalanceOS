import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";

type Props<T extends string> = {
  options: Array<{ value: T; label: string }>;
  selected: T[];
  onToggle: (value: T) => void;
};

export function ToggleChips<T extends string>({ options, selected, onToggle }: Props<T>) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();

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
            style={[styles.chip, dir.row, active && styles.chipActive]}
          >
            {active ? <MaterialCommunityIcons name="check" size={16} color={colors.accent} /> : null}
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: { flexWrap: "wrap", gap: spacing.sm },
      chip: {
        alignItems: "center",
        gap: spacing.xs,
        minHeight: 40,
        paddingHorizontal: spacing.md,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceMuted,
      },
      chipActive: { backgroundColor: colors.accentSoft },
      label: { ...typography.label, color: colors.textSecondary },
      labelActive: { color: colors.accent },
    }),
  );
