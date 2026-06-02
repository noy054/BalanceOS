import { Platform, StyleSheet } from "react-native";

import { colors, spacing, radius } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  totalsContainer: {
    borderRadius: radius.xl,
    overflow: "hidden",
  },

  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.xl,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryGreen,
        shadowOpacity: 0.22,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 7,
      },
    }),
  },

  saveBtnPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },

  saveBtnDisabled: {
    opacity: 0.55,
  },

  saveBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.background,
    letterSpacing: 0.2,
  },
});
