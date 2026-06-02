import { Platform, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 5,
      },
    }),
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },

  icon: {
    marginBottom: spacing.xs,
  },

  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
    textAlign: "center",
    letterSpacing: 0.1,
  },
});
