import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      scroll: {
        flex: 1,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl + 80,
        gap: spacing.lg,
      },

      sectionCard: {
        overflow: "hidden",
      },

      toggleRow: {
        minHeight: 76,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
      },

      toggleRowLast: {
        borderBottomWidth: 0,
      },

      toggleTextGroup: {
        flex: 1,
        gap: 4,
      },

      toggleLabel: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      toggleHint: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: "600",
        color: colors.textSecondary,
      },

      switchTrack: {
        width: 48,
        height: 28,
        borderRadius: 99,
        padding: 3,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.borderStrong,
      },

      switchTrackActive: {
        backgroundColor: colors.primaryGreenLight,
        borderColor: colors.primaryGreenMid,
      },

      switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 99,
        backgroundColor: colors.textMuted,
      },

      switchThumbActive: {
        alignSelf: "flex-end",
        backgroundColor: colors.primaryGreen,
      },

      saveSuccessBanner: {
        borderRadius: radius.lg,
        backgroundColor: colors.successLight,
        borderWidth: 1,
        borderColor: colors.success,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      },

      saveSuccessText: {
        fontSize: 13,
        fontWeight: "900",
        color: colors.success,
      },

      saveBtn: {
        backgroundColor: colors.buttonPrimaryBackground,
        borderRadius: radius.xl,
        minHeight: 58,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.md,
      },

      saveBtnContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
      },

      saveBtnPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.985 }],
      },

      saveBtnDisabled: {
        backgroundColor: colors.buttonPrimaryDisabledBackground,
        borderWidth: 1,
        borderColor: colors.buttonPrimaryDisabledBorder,
      },

      saveBtnText: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.buttonPrimaryText,
        letterSpacing: 0.2,
      },

      saveBtnTextDisabled: {
        color: colors.buttonPrimaryDisabledText,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },

    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
  };
}
