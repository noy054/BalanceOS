import { StyleSheet } from "react-native";

import { colors, spacing, radius } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    overflow: "visible",
    zIndex: 20,
  },

  sideSlot: {
    width: 96,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  titleSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.25,
  },

  backBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.cardBackgroundSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
});
