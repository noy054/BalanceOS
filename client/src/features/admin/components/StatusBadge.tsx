import { StyleSheet, Text } from "react-native";

import { AppColors, radius, spacing, typography, useAppTheme } from "../../../shared/theme";

export type BadgeTone = "accent" | "success" | "warning" | "danger" | "neutral";

type Props = {
  label: string;
  tone: BadgeTone;
};

function palette(colors: AppColors, tone: BadgeTone) {
  switch (tone) {
    case "accent":
      return { color: colors.accent, backgroundColor: colors.accentSoft };
    case "success":
      return { color: colors.success, backgroundColor: colors.successSoft };
    case "warning":
      return { color: colors.warning, backgroundColor: colors.warningSoft };
    case "danger":
      return { color: colors.danger, backgroundColor: colors.dangerSoft };
    case "neutral":
      return { color: colors.textSecondary, backgroundColor: colors.surfaceMuted };
  }
}

export function StatusBadge({ label, tone }: Props) {
  const { colors } = useAppTheme();
  return (
    <Text style={[styles.badge, palette(colors, tone)]} numberOfLines={1}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    ...typography.caption,
    fontWeight: "600",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
});
