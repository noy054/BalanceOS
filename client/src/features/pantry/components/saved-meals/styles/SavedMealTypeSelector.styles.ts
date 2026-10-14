import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      mealTypeScroll: {
        width: "100%",
      },

      mealTypeRow: {
        flexGrow: 1,
        gap: spacing.sm,
        paddingVertical: spacing.xs,
        alignItems: "center",
      },

      mealTypeChip: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.inputBackground,
      },

      mealTypeChipActive: {
        borderColor: colors.primaryGreenMid,
        backgroundColor: colors.primaryGreenLight,
      },

      chipPressed: {
        opacity: 0.78,
        transform: [{ scale: 0.97 }],
      },

      mealTypeText: {
        fontSize: 12,
        fontWeight: "800",
        color: colors.textMuted,
      },

      mealTypeTextActive: {
        color: colors.primaryGreen,
        fontWeight: "900",
      },
    }),
  );
