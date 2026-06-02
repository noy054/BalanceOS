import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  headerActions: {
    alignItems: "center",
    gap: spacing.sm,
  },

  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackgroundSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  deleteActionBtn: {
    backgroundColor: colors.dangerLight,
    borderColor: "rgba(248, 75, 106, 0.28)",
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
});
