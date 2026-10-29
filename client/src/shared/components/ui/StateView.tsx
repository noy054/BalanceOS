import type { ComponentProps } from "react";
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { spacing, typography, useAppTheme, useThemedStyles } from "../../theme";
import { Button } from "./Button";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  variant: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function StateView({
  variant,
  title,
  message,
  icon,
  actionLabel,
  onAction,
  compact = false,
  style,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();

  if (variant === "loading") {
    return (
      <View style={[styles.container, compact ? styles.compact : styles.fill, style]}>
        <ActivityIndicator size="small" color={colors.textMuted} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    );
  }

  const isError = variant === "error";
  const resolvedIcon: IconName = icon ?? (isError ? "alert-circle-outline" : "tray");

  return (
    <View
      style={[styles.container, compact ? styles.compact : styles.fill, style]}
      accessibilityRole={isError ? "alert" : undefined}
    >
      <MaterialCommunityIcons
        name={resolvedIcon}
        size={28}
        color={isError ? colors.danger : colors.textMuted}
        style={styles.icon}
      />

      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,
        gap: spacing.sm,
      },
      fill: {
        flex: 1,
      },
      compact: {
        paddingVertical: spacing.lg,
      },
      icon: {
        marginBottom: spacing.xs,
      },
      title: {
        ...typography.headline,
        color: colors.textPrimary,
        textAlign: "center",
      },
      message: {
        ...typography.callout,
        color: colors.textSecondary,
        textAlign: "center",
        maxWidth: 300,
      },
      action: {
        marginTop: spacing.sm,
      },
    }),
  );
