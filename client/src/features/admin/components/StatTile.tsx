import { Pressable, StyleSheet, Text } from "react-native";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../shared/theme";

type Props = {
  value: number;
  label: string;
  highlight?: boolean;
  onPress: () => void;
};

export function StatTile({ value, label, highlight = false, onPress }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [styles.tile, dir.alignStart, pressed && styles.pressed]}
    >
      <Text style={[styles.value, highlight && value > 0 && styles.valueHighlight]}>{value}</Text>
      <Text style={[styles.label, dir.text]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      tile: {
        flex: 1,
        minWidth: 0,
        gap: 2,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.md,
      },
      pressed: { backgroundColor: colors.surfaceMuted },
      value: {
        ...typography.title,
        ...typography.number,
        color: colors.textPrimary,
      },
      valueHighlight: { color: colors.accent },
      label: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
    }),
  );
