import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      controls: {
        paddingHorizontal: spacing.md,
        gap: spacing.ms,
        paddingBottom: spacing.ms,
      },

      content: {
        flex: 1,
      },

      listContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
      },
    }),
  );
