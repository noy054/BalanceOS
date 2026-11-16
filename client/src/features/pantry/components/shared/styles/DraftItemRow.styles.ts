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
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },

      meta: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },

      amountBox: {
        alignSelf: "flex-start",
        alignItems: "center",
        height: 36,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        overflow: "hidden",
      },

      amountBoxEmpty: {
        borderColor: colors.warning,
      },

      amountInput: {
        width: 56,
        height: "100%",
        paddingHorizontal: spacing.xs,
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
        textAlign: "center",
      },

      amountDivider: {
        width: StyleSheet.hairlineWidth,
        alignSelf: "stretch",
        backgroundColor: colors.glassBorder,
      },

      unitLabel: {
        maxWidth: 96,
        paddingHorizontal: spacing.sm,
        ...typography.footnote,
        color: colors.textSecondary,
      },

      unitToggle: {
        height: "100%",
        maxWidth: 120,
        paddingHorizontal: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      },

      unitTogglePressed: {
        backgroundColor: colors.glassBorder,
      },

      unitToggleText: {
        flexShrink: 1,
        ...typography.footnote,
        fontFamily: fonts.medium,
        color: colors.accent,
      },
    }),
  );
