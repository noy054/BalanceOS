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
      section: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.warning,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
      },

      header: {
        alignItems: "flex-start",
        gap: spacing.sm,
        marginBottom: spacing.md,
      },

      headerText: {
        flex: 1,
        gap: 2,
      },

      title: {
        ...typography.callout,
        fontWeight: "600",
        color: colors.textPrimary,
      },

      hint: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
    }),
  );
