import { StyleSheet } from "react-native";

import { spacing, typography, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      selectedPanel: {
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.ms,
      },

      selectedHeader: {
        ...typography.label,
        color: colors.textSecondary,
      },

      selectedScroll: {
        maxHeight: 190,
      },
    }),
  );
