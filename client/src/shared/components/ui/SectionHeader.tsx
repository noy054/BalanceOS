import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { spacing, typography, useThemedStyles } from "../../theme";
import { useDirection } from "../../hooks/useDirection";

type Props = {
  title: string;
  trailing?: ReactNode;
  tone?: "default" | "danger";
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, trailing, tone = "default", style }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.row, dir.row, style]}>
      <Text
        style={[styles.title, tone === "danger" && styles.titleDanger, dir.text]}
        accessibilityRole="header"
        numberOfLines={1}
      >
        {title}
      </Text>
      {trailing}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
        marginBottom: spacing.sm,
      },
      title: {
        flex: 1,
        ...typography.overline,
        color: colors.textSecondary,
      },
      titleDanger: {
        color: colors.danger,
      },
    }),
  );
