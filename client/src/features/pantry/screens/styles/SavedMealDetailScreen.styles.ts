import { StyleSheet } from "react-native";

import { colors, spacing, radius, cardShadow } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },

  deleteBtn: {
    padding: spacing.xs,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  badgeRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: colors.cardBackgroundStrong,
    borderWidth: 1,
    borderColor: colors.primaryGreenMid,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primaryGreen,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
    overflow: "hidden",
  },

  totalsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...cardShadow,
  },

  itemRow: {
    minHeight: 64,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  itemDetail: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 2,
  },

  itemCals: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.primaryGreen,
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },

    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },

    sectionTitle: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },

    badgeRow: {
      alignItems: isRTL ? ("flex-end" as const) : ("flex-start" as const),
    },

    badge: {
      alignSelf: isRTL ? ("flex-end" as const) : ("flex-start" as const),
    },

    badgeText: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },

    calText: {
      textAlign: isRTL ? ("left" as const) : ("right" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
