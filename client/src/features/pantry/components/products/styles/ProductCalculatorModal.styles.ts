import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      keyboardView: {
        flex: 1,
      },

      overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.62)",
      },

      card: {
        maxHeight: "86%",
        marginHorizontal: spacing.md,
        marginBottom: spacing.lg,
        borderRadius: radius.xl,
        backgroundColor: colors.cardBackground,
        overflow: "hidden",
      },

      header: {
        minHeight: 68,
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.cardBackground,
      },

      titleGroup: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },

      title: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      subtitle: {
        fontSize: 12,
        lineHeight: 17,
        fontWeight: "700",
        color: colors.textSecondary,
      },

      closeBtn: {
        width: 38,
        height: 38,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cardBackgroundSoft,
      },

      scrollContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    headerRow: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },

    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
