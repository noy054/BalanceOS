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

      identityRow: {
        alignItems: "center",
        gap: spacing.ms,
      },

      identityText: {
        flex: 1,
        gap: spacing.xs,
      },

      productName: {
        ...typography.title,
        fontSize: 20,
        lineHeight: 26,
        color: colors.textPrimary,
      },

      metaText: {
        ...typography.callout,
        color: colors.textSecondary,
      },

      metaRow: {
        alignItems: "center",
        gap: spacing.xs,
      },

      metaMuted: {
        ...typography.caption,
        ...typography.number,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },

      heroCard: {
        backgroundColor: colors.surface,
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
