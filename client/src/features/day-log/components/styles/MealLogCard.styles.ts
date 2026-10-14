import { Platform, StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        position: "relative",
        overflow: "hidden",
        borderRadius: radius.xl,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.md,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 0.82,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 9 },
          },
          android: {
            elevation: 5,
          },
        }),
      },

      cardPressed: {
        opacity: 0.84,
        transform: [{ scale: 0.985 }],
      },

      accentLine: {
        position: "absolute",
        left: 0,
        top: 16,
        bottom: 16,
        width: 4,
        borderTopRightRadius: radius.full,
        borderBottomRightRadius: radius.full,
        backgroundColor: colors.primaryGreen,
      },

      accentLineRtl: {
        left: undefined,
        right: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: radius.full,
        borderBottomLeftRadius: radius.full,
      },

      softGlow: {
        position: "absolute",
        top: -34,
        left: -42,
        width: 118,
        height: 118,
        borderRadius: 999,
        backgroundColor: colors.primaryGreen,
        opacity: 0.06,
      },

      softGlowRtl: {
        left: undefined,
        right: -42,
      },

      mainRow: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
      },

      mealInfoRow: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: spacing.sm,
      },

      iconBubble: {
        width: 50,
        height: 50,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
        flexShrink: 0,
      },

      titleBox: {
        flex: 1,
        minWidth: 0,
        gap: 4,
      },

      mealLabel: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      itemsCount: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "800",
        color: colors.textMuted,
      },

      nutritionPanel: {
        width: 96,
        minHeight: 92,
        borderRadius: radius.lg,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        flexShrink: 0,
      },

      calorieValue: {
        fontSize: 25,
        lineHeight: 29,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -0.8,
        textAlign: "center",
        writingDirection: "ltr",
      },

      calorieUnit: {
        fontSize: 10,
        lineHeight: 13,
        fontWeight: "900",
        color: colors.textMuted,
        textAlign: "center",
        writingDirection: "rtl",
      },

      nutritionDivider: {
        width: "72%",
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 3,
      },

      proteinPill: {
        maxWidth: "100%",
        minHeight: 24,
        borderRadius: radius.full,
        paddingHorizontal: spacing.xs,
        paddingVertical: 4,
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
        alignItems: "center",
        justifyContent: "center",
      },

      proteinValue: {
        fontSize: 10,
        lineHeight: 13,
        fontWeight: "900",
        color: colors.primaryGreen,
        textAlign: "center",
        writingDirection: "rtl",
      },

      previewBox: {
        minHeight: 38,
        borderRadius: radius.lg,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        alignItems: "center",
        gap: spacing.xs,
      },

      previewIconWrap: {
        width: 24,
        height: 24,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        flexShrink: 0,
      },

      preview: {
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "800",
        color: colors.textSecondary,
      },

      copyBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
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
  };
}
