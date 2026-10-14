import { StyleSheet } from "react-native";
import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      section: {
        borderWidth: 1,
        borderColor: colors.danger,
        borderRadius: radius.lg,
        backgroundColor: colors.dangerLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
      },

      header: {
        alignItems: "flex-start",
        gap: spacing.xs,
      },

      headerText: {
        flex: 1,
        gap: 2,
      },

      title: {
        fontSize: 13,
        fontWeight: "800",
        color: colors.danger,
        letterSpacing: 0.2,
      },

      hint: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.textPrimary,
        opacity: 0.8,
      },
    })
  );
