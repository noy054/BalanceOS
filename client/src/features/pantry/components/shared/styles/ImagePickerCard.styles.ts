import { Platform, StyleSheet } from "react-native";

import { radius, spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        borderRadius: radius.xl,
        padding: spacing.md,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 0.45,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
          },
          android: {
            elevation: 3,
          },
        }),
      },

      row: {
        alignItems: "center",
        gap: spacing.md,
      },

      imageButton: {
        width: 86,
        height: 86,
        borderRadius: radius.lg,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
      },

      image: {
        width: "100%",
        height: "100%",
      },

      textWrap: {
        flex: 1,
        gap: spacing.xs,
      },

      title: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.textSecondary,
      },

      subtitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textMuted,
        lineHeight: 19,
      },

      actionsRow: {
        alignItems: "center",
        gap: spacing.sm,
        marginTop: spacing.xs,
      },

      primaryAction: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: colors.cardBackgroundSoft,
      },

      primaryActionText: {
        fontSize: 13,
        fontWeight: "900",
        color: colors.primaryGreen,
        textAlign: "center",
      },

      secondaryAction: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
      },

      secondaryActionText: {
        fontSize: 13,
        fontWeight: "900",
        color: colors.textMuted,
        textAlign: "center",
      },

      pressed: {
        opacity: 0.78,
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
