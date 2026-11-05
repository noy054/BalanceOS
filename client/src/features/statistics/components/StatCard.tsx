import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { radius, spacing, typography, useThemedStyles } from "../../../shared/theme";

type Props = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  children: ReactNode;
};

export function StatCard({ title, subtitle, trailing, children }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={styles.card}>
      <View style={[styles.header, dir.row]}>
        <View style={styles.titles}>
          <Text style={[styles.title, dir.text]} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={[styles.subtitle, dir.text]}>{subtitle}</Text> : null}
        </View>
        {trailing}
      </View>
      {children}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.xxl,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        backgroundImage: `linear-gradient(180deg, ${withAlpha(colors.gloss, 0.05)} 0%, ${withAlpha(colors.gloss, 0)} 40%)`,
      },
      header: {
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      titles: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      title: {
        ...typography.headline,
        fontSize: 18,
        color: colors.textPrimary,
      },
      subtitle: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
    }),
  );
