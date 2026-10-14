import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      footer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
      },

      addBtn: {
        backgroundColor: colors.primaryGreen,
        borderRadius: radius.xl,
        minHeight: 52,
        alignItems: "center",
        justifyContent: "center",
      },

      addBtnPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.985 }],
      },

      addBtnDisabled: {
        opacity: 0.35,
      },

      addBtnText: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.background,
        letterSpacing: 0.1,
        textAlign: "center",
      },
    }),
  );
