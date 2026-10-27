import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      rangeWrap: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.ms,
      },

      scroll: {
        flex: 1,
      },

      scrollContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
        gap: spacing.ms,
      },
    }),
  );
