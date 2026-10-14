import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      header: {
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },

      title: {
        fontSize: 17,
        fontWeight: "700",
        color: colors.textPrimary,
      },
    }),
  );
