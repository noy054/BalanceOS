import { StyleSheet } from "react-native";

import {
  fonts,
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        paddingBottom: spacing.md,
      },

      chipsRow: {
        flexWrap: "wrap",
        gap: spacing.sm,
      },

      chip: {
        minHeight: 40,
        alignItems: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      },

      chipActive: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
      },

      chipPressed: {
        opacity: 0.7,
      },

      chipText: {
        ...typography.callout,
        color: colors.textSecondary,
      },

      chipTextActive: {
        fontFamily: fonts.semibold,
        color: colors.accent,
      },
    }),
  );
