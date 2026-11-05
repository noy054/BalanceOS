import { StyleSheet } from "react-native";

import {
  fonts,
  radius,
  spacing,
  states,
  typography,
  useThemedStyles,
} from "../../../../shared/theme";

export const ITEM_CALORIES_WIDTH = 48;

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.glassCard,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        overflow: "hidden",
      },

      pending: {
        opacity: 0.5,
      },

      header: {
        alignItems: "center",
        gap: spacing.xs,
        minHeight: 60,
      },

      titleRow: {
        flex: 1,
        alignItems: "baseline",
        gap: spacing.sm,
      },

      mealLabel: {
        ...typography.headline,
        flexShrink: 1,
        color: colors.textPrimary,
      },

      total: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },

      iconSpacer: {
        width: 40,
      },

      endAction: {
        marginEnd: -spacing.xs,
      },

      items: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },

      itemBlock: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },

      itemRow: {
        alignItems: "center",
        gap: spacing.xs,
      },

      itemRowLast: {
        borderBottomWidth: 0,
      },

      itemMain: {
        flex: 1,
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 60,
        paddingVertical: spacing.sm2,
      },

      itemText: {
        flex: 1,
        minWidth: 0,
      },

      itemName: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },

      itemDetail: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
        marginTop: 2,
      },

      itemCalories: {
        ...typography.body,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
        minWidth: ITEM_CALORIES_WIDTH,
      },

      actionPressed: {
        opacity: states.pressedOpacity,
      },
    }),
  );
