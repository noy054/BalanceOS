import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      modeRow: {
        marginBottom: spacing.md,
      },

      grid: {
        flexDirection: "row",
        gap: spacing.ms,
      },

      gridCell: {
        flex: 1,
      },

      servingFirst: {
        marginBottom: spacing.md,
      },

      servingLast: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },
    }),
  );
