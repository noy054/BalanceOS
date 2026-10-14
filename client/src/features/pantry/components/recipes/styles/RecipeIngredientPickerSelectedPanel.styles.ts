import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      selectedPanel: {
        borderTopWidth: 1,
        borderTopColor: colors.primaryGreenMid,
        backgroundColor: colors.cardBackground,
        maxHeight: 220,
      },

      selectedHeader: {
        fontSize: 11,
        fontWeight: "900",
        color: colors.primaryGreen,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
      },

      selectedScroll: {
        flex: 1,
      },
    }),
  );
