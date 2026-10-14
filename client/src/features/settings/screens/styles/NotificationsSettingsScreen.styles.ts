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
        paddingBottom: spacing.xl + 120,
        gap: spacing.lg,
      },

      intervalRow: {
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
      },

      intervalLabel: {
        flex: 1,
        fontSize: 13,
        fontWeight: "800",
        color: colors.textSecondary,
      },

      intervalInput: {
        width: 86,
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        fontSize: 14,
        fontWeight: "800",
        color: colors.textPrimary,
        textAlign: "center",
        writingDirection: "ltr",
      },

      weeklyOptions: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        gap: spacing.md,
      },

      dayChips: {
        gap: spacing.xs,
        flexWrap: "wrap",
        justifyContent: "flex-end",
      },

      dayChip: {
        minHeight: 34,
        minWidth: 44,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cardBackground,
      },

      dayChipActive: {
        borderColor: colors.primaryGreen,
        backgroundColor: colors.primaryGreenLight,
      },

      dayChipText: {
        fontSize: 12,
        fontWeight: "800",
        color: colors.textSecondary,
      },

      dayChipTextActive: {
        color: colors.primaryGreen,
        fontWeight: "900",
      },

      weeklyTimeInputButton: {
        minHeight: 48,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        justifyContent: "center",
        paddingHorizontal: spacing.md,
      },

      weeklyTimeInputText: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.textPrimary,
        writingDirection: "ltr",
      },

      weeklyTimeInputPlaceholder: {
        color: colors.textMuted,
      },

      saveBtn: {
        backgroundColor: colors.buttonPrimaryBackground,
        borderRadius: radius.xl,
        minHeight: 58,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.sm,
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

    timeText: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
    },
  };
}
