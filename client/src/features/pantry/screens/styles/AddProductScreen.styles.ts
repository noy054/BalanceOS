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
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  introCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },

  optionalHint: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    lineHeight: 18,
  },

  imageSection: {
    minHeight: 156,
  },

  imagePreview: {
    width: "100%",
    height: 156,
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },

  imagePlaceholder: {
    height: 156,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },

  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
    textAlign: "center",
  },

  formCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 6,
      },
    }),
  },

  sectionHeaderRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  sectionChip: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primaryGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primaryGreenLight,
    borderWidth: 1,
    borderColor: colors.primaryGreenMid,
  },

  sectionHint: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },

  bottomSpacer: {
    height: 96,
  },

  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.xl,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
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

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
    centeredText: {
      textAlign: "center" as const,
    },
  };
}
