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
      wrapper: {
        gap: spacing.md,
      },

      metaMuted: {
        ...typography.caption,
        ...typography.number,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },

      heroCard: {
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.ms,
        paddingBottom: spacing.xs,
      },

      heroLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
      },
    }),
  );
