import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
      },

      rangeWrap: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
      },

      rangeTrack: {
        padding: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },

      scroll: {
        flex: 1,
      },

      scrollContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xxl,
        gap: spacing.md,
      },
    }),
  );
