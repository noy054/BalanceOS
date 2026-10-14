import { Platform, StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
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

      scroll: {
        flex: 1,
      },

      content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      },

      actionsRow: {
        gap: spacing.sm,
      },

      actionBtn: {
        flex: 1,
        minHeight: 44,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
        backgroundColor: colors.primaryGreenLight,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: spacing.xs,
      },

      actionBtnDanger: {
        flex: 1,
        minHeight: 44,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.cardBackgroundSoft,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: spacing.xs,
      },

      actionBtnPressed: {
        opacity: 0.78,
        transform: [{ scale: 0.985 }],
      },

      actionBtnText: {
        fontSize: 13,
        fontWeight: "900",
        color: colors.primaryGreen,
      },

      actionBtnDangerText: {
        fontSize: 13,
        fontWeight: "900",
        color: colors.danger,
      },

      badgeRow: {
        marginTop: spacing.xs,
      },

      badge: {
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

      descriptionCard: {
        borderRadius: radius.xl,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
      },

      descriptionText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textSecondary,
        lineHeight: 21,
      },

      section: {
        gap: spacing.sm,
      },

      sectionTitle: {
        fontSize: 14,
        fontWeight: "900",
        color: colors.textPrimary,
        paddingBottom: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },

      totalsCard: {
        borderRadius: radius.xl,
        overflow: "hidden",
      },

      itemsCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 0.8,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
          },
          android: {
            elevation: 4,
          },
        }),
      },

      itemRow: {
        alignItems: "flex-start",
        gap: spacing.md,
        padding: spacing.md,
      },

      rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },

      imageBox: {
        width: 58,
        height: 58,
        borderRadius: radius.lg,
        overflow: "hidden",
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        flexShrink: 0,
      },

      productImage: {
        width: "100%",
        height: "100%",
      },

      imagePlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },

      itemInfo: {
        flex: 1,
        minWidth: 0,
        gap: spacing.sm,
      },

      itemTopRow: {
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.sm,
      },

      itemNameBox: {
        flex: 1,
        minWidth: 0,
      },

      itemName: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      itemBrand: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: "700",
        color: colors.textMuted,
      },

      servingHint: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: "700",
        color: colors.primaryGreen,
      },

      quantityBadge: {
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
      },

      quantityBadgeText: {
        fontSize: 11,
        fontWeight: "900",
        color: colors.textSecondary,
      },

      valuesRow: {
        flexWrap: "wrap",
        gap: spacing.xs,
      },

      caloriePill: {
        minHeight: 30,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
      },

      calorieValue: {
        fontSize: 12,
        fontWeight: "900",
        color: colors.primaryGreen,
      },

      valuePill: {
        minHeight: 30,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
      },

      valuePillText: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.textMuted,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },

    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },

    badgeRow: {
      alignItems: isRTL ? ("flex-end" as const) : ("flex-start" as const),
    },
  };
}
