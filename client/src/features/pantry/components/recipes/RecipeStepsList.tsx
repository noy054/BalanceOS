import { StyleSheet, Text, View } from "react-native";

import { useDirection } from "../../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

type Props = {
  steps: string[];
};

export function RecipeStepsList({ steps }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={styles.card}>
      {steps.map((step, index) => (
        <View
          key={`${index}-${step.slice(0, 12)}`}
          style={[styles.row, dir.row, index < steps.length - 1 && styles.divider]}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{index + 1}</Text>
          </View>
          <Text style={[styles.text, dir.text]}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
      },
      row: {
        alignItems: "flex-start",
        gap: spacing.ms,
        paddingVertical: spacing.ms,
      },
      divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.glassBorder,
      },
      badge: {
        width: 26,
        height: 26,
        borderRadius: radius.round,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.accentSoft,
        borderWidth: 1,
        borderColor: colors.accentBorder,
      },
      badgeText: {
        ...typography.footnote,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },
      text: {
        flex: 1,
        minWidth: 0,
        paddingTop: 2,
        ...typography.body,
        color: colors.textPrimary,
      },
    }),
  );
