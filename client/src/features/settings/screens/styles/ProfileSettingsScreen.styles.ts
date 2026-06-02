import { StyleSheet } from "react-native";

import { colors, spacing, radius } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  backgroundLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    backgroundColor: colors.background,
  },

  dateInputPressed: {
    opacity: 0.82,
  },
  glowTop: {
    position: "absolute",
    top: -70,
    left: -40,
    right: -40,
    height: 230,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  glowSide: {
    position: "absolute",
    top: 260,
    right: -120,
    width: 260,
    height: 480,
    borderRadius: 160,
    backgroundColor: "rgba(49, 216, 107, 0.055)",
    transform: [{ rotate: "12deg" }],
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
  formCard: {
    padding: spacing.md,
    gap: spacing.md,
  },

  selectCard: {
    paddingVertical: spacing.xs,
    overflow: "hidden",
  },

  readonlyGroup: {
    borderRadius: radius.lg,
    backgroundColor: colors.cardBackgroundStrong,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  readonlyLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  emailValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  emailNote: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.xl,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
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

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
