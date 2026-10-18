import { Platform, StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: colors.cardBackground,
        borderRadius: radius.xl,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
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

      topRow: {
        alignItems: "center",
        gap: spacing.md,
      },

      imageBox: {
        width: 60,
        height: 60,
        borderRadius: radius.xl,
        overflow: "hidden",
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        flexShrink: 0,
      },

      mealImage: {
        width: "100%",
        height: "100%",
      },

      imagePlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primaryGreenLight,
      },

      info: {
        flex: 1,
        minWidth: 0,
      },

      titleRow: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },

      titleBox: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xs + 2,
      },

      name: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: "800",
        color: colors.textPrimary,
      },

      metaRow: {
        alignItems: "center",
        gap: spacing.xs,
        flexWrap: "wrap",
      },

      categoryBadge: {
        flexShrink: 1,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
      },

      categoryBadgeText: {
        fontSize: 10,
        lineHeight: 13,
        fontWeight: "900",
        color: colors.primaryGreen,
        textAlign: "center",
      },

      count: {
        fontSize: 11,
        lineHeight: 15,
        fontWeight: "800",
        color: colors.textMuted,
      },

      chevronBox: {
        width: 30,
        height: 30,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        flexShrink: 0,
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
