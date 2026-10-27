import { StyleSheet } from "react-native";

import {
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      mealTypeScroll: {
        flexGrow: 0,
      },

      mealTypeRow: {
        gap: spacing.sm,
        paddingVertical: 2,
      },

      mealTypeChip: {
        minHeight: 38,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
      },

      mealTypeChipActive: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
      },

      chipPressed: {
        opacity: 0.7,
      },

      mealTypeText: {
        ...typography.callout,
        color: colors.textSecondary,
      },

      mealTypeTextActive: {
        fontWeight: "600",
        color: colors.accent,
      },
    }),
  );
