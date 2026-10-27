import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },

      searchWrap: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.ms,
      },

      list: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
      },
    }),
  );
