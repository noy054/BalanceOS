import { StyleSheet } from "react-native";

import {
  radius,
  spacing,
  states,
  typography,
  useThemedStyles,
} from "../../../../shared/theme";

const VALUE_COLUMN = 56;

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: "hidden",
      },

      headerRow: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.md,
      },

      headerMain: {
        flex: 1,
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 44,
      },

      pressed: {
        opacity: states.pressedOpacity,
      },

      pending: {
        opacity: states.disabledOpacity,
      },

      iconWrap: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
      },

      iconWrapActive: {
        backgroundColor: colors.accentSoft,
      },

      titleBlock: {
        flex: 1,
        minWidth: 0,
        gap: 1,
      },

      mealLabel: {
        ...typography.headline,
        color: colors.textPrimary,
      },

      meta: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },

      metaEmpty: {
        color: colors.textMuted,
      },

      totalBlock: {
        minWidth: VALUE_COLUMN,
        alignItems: "center",
      },

      totalValue: {
        ...typography.headline,
        ...typography.number,
        color: colors.textPrimary,
      },

      totalUnit: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
      },

      items: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        marginStart: spacing.md,
        marginEnd: spacing.md,
      },

      itemRow: {
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 48,
        paddingVertical: spacing.sm,
      },

      itemRowBorder: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },

      itemText: {
        flex: 1,
        minWidth: 0,
        gap: 1,
      },

      itemName: {
        ...typography.callout,
        color: colors.textPrimary,
      },

      itemProtein: {
        ...typography.caption,
        ...typography.number,
        fontWeight: "400",
        color: colors.textMuted,
      },

      itemCalories: {
        minWidth: VALUE_COLUMN,
        ...typography.callout,
        ...typography.number,
        fontWeight: "600",
        color: colors.textSecondary,
        textAlign: "center",
      },

      footer: {
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: spacing.xs,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs,
      },
    }),
  );
