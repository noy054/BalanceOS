import { StyleSheet } from "react-native";

import { colors, spacing } from "../../../../shared/theme";

export const rowStyles = StyleSheet.create({
  row: {
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  labelHighlight: {
    color: colors.textPrimary,
  },

  valueRow: {
    alignItems: "baseline",
    justifyContent: "center",
    gap: 4,
    minWidth: 88,
  },

  value: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
    writingDirection: "ltr",
  },

  valueHighlight: {
    color: colors.primaryGreen,
    fontSize: 16,
  },

  unit: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
});
