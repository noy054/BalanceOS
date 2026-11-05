import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.canvas,
      },

      tabs: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },

      toolbar: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
      },

      content: {
        flex: 1,
      },

      listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
      },
    }),
  );
