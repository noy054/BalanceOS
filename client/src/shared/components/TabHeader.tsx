import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography, useThemedStyles } from "../theme";
import { useDirection } from "../hooks/useDirection";

type Props = {
  title: string;
  overline?: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function TabHeader({ title, overline, subtitle, trailing }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.container, dir.row]}>
      <View style={styles.textGroup}>
        {overline ? (
          <Text style={[styles.overline, dir.text]} numberOfLines={1}>
            {overline}
          </Text>
        ) : null}

        <Text
          style={[styles.title, dir.text]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          accessibilityRole="header"
        >
          {title}
        </Text>

        {subtitle ? (
          <Text style={[styles.subtitle, dir.text]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing ? <View style={[styles.trailing, dir.row]}>{trailing}</View> : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        alignItems: "center",
        gap: spacing.ms,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.ms,
        paddingBottom: spacing.ms,
      },
      textGroup: {
        flex: 1,
        gap: spacing.xxs,
      },
      overline: {
        ...typography.caption,
        color: colors.textSecondary,
      },
      title: {
        ...typography.title,
        color: colors.textPrimary,
      },
      subtitle: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      trailing: {
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 44,
      },
    }),
  );
