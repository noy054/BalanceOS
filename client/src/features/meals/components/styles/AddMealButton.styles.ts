import { Platform, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primaryGreenMid,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryGreen,
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 7,
      },
    }),
  },

  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryGreenLight,
    borderWidth: 1,
    borderColor: colors.primaryGreenMid,
    alignItems: "center",
    justifyContent: "center",
  },

  iconRTL: {
    marginStart: spacing.md,
  },

  iconLTR: {
    marginEnd: spacing.md,
  },

  label: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: 0.1,
    textAlign: "center",
  },
});
