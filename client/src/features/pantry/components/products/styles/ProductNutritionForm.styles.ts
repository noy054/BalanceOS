import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles(() =>
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
    }),
  );
