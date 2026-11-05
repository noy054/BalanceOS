import { StyleSheet } from "react-native";

import {
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.canvas,
      },

      scroll: {
        flex: 1,
      },

      headerActions: {
        alignItems: "center",
        gap: spacing.xs,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      },

      section: {
        gap: 0,
      },

      sectionHint: {
        ...typography.footnote,
        color: colors.textSecondary,
        marginTop: -spacing.xs,
        marginBottom: spacing.sm,
      },
      itemsCard: {
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
      },
    }),
  );
