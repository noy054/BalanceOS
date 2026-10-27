import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
      card: {
        paddingTop: spacing.xs,
        paddingBottom: spacing.md,
      },

      addRow: {
        paddingTop: spacing.ms,
      },
    }),
  );
