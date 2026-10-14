import { Platform, StyleSheet } from "react-native";

import { radius, spacing, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        flex: 1,
        minHeight: 104,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.xl,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.sm,
        overflow: "hidden",
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 0.75,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
          },
          android: {
            elevation: 4,
          },
        }),
      },

      cardPressed: {
        opacity: 0.84,
        transform: [{ scale: 0.97 }],
      },

      iconWrap: {
        width: 48,
        height: 48,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
      },

      label: {
        fontSize: 13,
        lineHeight: 17,
        fontWeight: "900",
        color: colors.textPrimary,
        textAlign: "center",
        maxWidth: "100%",
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: "center" as const,
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
