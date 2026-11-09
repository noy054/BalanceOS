import { StyleSheet } from "react-native";

import { fonts, spacing, states, typography, useThemedStyles } from "../../../../shared/theme";
import { withAlpha } from "../../../../shared/helpers/progressColor";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      section: {
        gap: spacing.sm,
      },

      pending: {
        opacity: 0.5,
      },

      header: {
        alignItems: "center",
        gap: spacing.xs,
        minHeight: 36,
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

      emptyAdd: {
        borderRadius: 17,
      },

      items: {
        gap: 10,
      },

      itemCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: withAlpha(colors.gloss, 0.08),
        backgroundColor: colors.glassCard,
        backgroundImage: `linear-gradient(160deg, ${withAlpha(colors.gloss, 0.07)} 0%, ${withAlpha(colors.gloss, 0.015)} 55%, ${withAlpha(
          colors.calorieGauge,
          0.02,
        )} 100%)`,
      },

      itemCardOpen: {
        borderColor: withAlpha(colors.calorieGauge, 0.22),
        borderBottomColor: withAlpha(colors.calorieGauge, 0.7),
        backgroundImage: `linear-gradient(160deg, ${withAlpha(colors.gloss, 0.08)} 0%, ${withAlpha(colors.gloss, 0.02)} 50%, ${withAlpha(
          colors.calorieGauge,
          0.06,
        )} 100%)`,
        boxShadow: `0 12px 16px -14px ${withAlpha(colors.calorieGauge, 0.75)}`,
      },

      itemRow: {
        alignItems: "center",
        gap: 12,
        minHeight: 68,
        paddingHorizontal: 12,
        paddingVertical: 10,
      },

      itemRowWrap: {
        alignItems: "center",
      },

      itemRowWithMore: {
        flex: 1,
      },

      moreButton: {
        marginHorizontal: 6,
      },

      thumb: {
        width: 56,
        height: 44,
        borderRadius: 10,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      },

      thumbIcon: {
        backgroundColor: withAlpha(colors.gloss, 0.05),
      },

      itemText: {
        flex: 1,
        minWidth: 0,
        gap: 3,
      },

      itemName: {
        fontFamily: fonts.bold,
        fontSize: 15,
        lineHeight: 20,
        color: colors.textPrimary,
      },

      detailDivider: {
        color: colors.textMuted,
      },

      itemDetail: {
        ...typography.footnote,
        ...typography.number,
        alignSelf: "stretch",
        color: colors.textSecondary,
      },

      calorieBlock: {
        alignItems: "baseline",
        gap: 3,
      },

      itemCalories: {
        ...typography.number,
        fontFamily: fonts.bold,
        fontSize: 18,
        lineHeight: 23,
        color: colors.textPrimary,
      },

      itemCaloriesUnit: {
        fontFamily: fonts.regular,
        fontSize: 13,
        color: colors.textSecondary,
      },

      chevron: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: withAlpha(colors.gloss, 0.07),
      },

      expanded: {
        paddingHorizontal: 12,
        paddingBottom: 4,
      },

      footer: {
        alignItems: "center",
        gap: 2,
        minHeight: 40,
      },

      footerHint: {
        flex: 1,
        ...typography.caption,
        color: colors.textMuted,
      },




      pressed: {
        opacity: states.pressedOpacity,
      },
    }),
  );
