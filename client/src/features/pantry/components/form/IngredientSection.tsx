import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../../../shared/components/ui/Button";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

type Action = {
  key: string;
  label: string;
  onPress: () => void;
};

type Props = {
  title: string;
  emptyText: string;
  actions: Action[];
  isEmpty: boolean;
  children: ReactNode;
};

export function IngredientSection({ title, emptyText, actions, isEmpty, children }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={styles.root}>
      <View style={[styles.header, dir.row]}>
        <Text style={[styles.title, dir.text]} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.actions, dir.row]}>
          {actions.map((action) => (
            <Button
              key={action.key}
              label={action.label}
              icon="plus"
              variant="ghost"
              size="sm"
              onPress={action.onPress}
            />
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        {isEmpty ? (
          <Text style={[styles.empty, dir.text]}>{emptyText}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        gap: spacing.sm,
      },
      header: {
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: spacing.xs,
      },
      title: {
        ...typography.headline,
        flexShrink: 1,
        color: colors.textPrimary,
      },
      actions: {
        flexWrap: "wrap",
        gap: spacing.xs,
      },
      panel: {
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        overflow: "visible",
      },
      empty: {
        ...typography.callout,
        color: colors.textSecondary,
        padding: spacing.md,
      },
    }),
  );
