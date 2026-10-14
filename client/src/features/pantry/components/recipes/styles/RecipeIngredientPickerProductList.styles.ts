import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      list: {
        flex: 1,
      },

      listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
      },

      separator: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.sm,
      },

      empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
      },

      emptyText: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: "center",
      },
    }),
  );
