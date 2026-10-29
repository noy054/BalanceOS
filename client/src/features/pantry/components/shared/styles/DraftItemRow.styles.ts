import { StyleSheet } from "react-native";

import {
  fonts,
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../../shared/theme";

export const useDraftRowStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.ms,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },

      info: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },

      name: {
        ...typography.callout,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },

      meta: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },

      amountBox: {
        alignItems: "center",
        gap: spacing.xs,
      },

      amountInput: {
        width: 64,
        minHeight: 40,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        paddingHorizontal: spacing.xs,
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
        textAlign: "center",
      },

      unitLabel: {
        minWidth: 40,
        maxWidth: 88,
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: "center",
      },

      unitToggle: {
        minWidth: 52,
        maxWidth: 96,
        minHeight: 32,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.sm,
        backgroundColor: colors.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
      },

      unitToggleActive: {
        backgroundColor: colors.accentSoft,
      },

      unitTogglePressed: {
        opacity: 0.7,
      },

      unitToggleText: {
        ...typography.caption,
        color: colors.textSecondary,
      },

      unitToggleTextActive: {
        color: colors.accent,
        fontFamily: fonts.semibold,
      },
    }),
  );
