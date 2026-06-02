import { Platform, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 9,
      },
    }),
  },

  content: {
    alignItems: "stretch",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
