import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      imageSection: {
        minHeight: 156,
      },

      imagePreview: {
        width: "100%",
        height: 156,
        borderRadius: radius.xl,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
      },

      imagePlaceholder: {
        height: 156,
        borderRadius: radius.xl,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: "dashed",
      },

      imagePlaceholderText: {
        fontSize: 13,
        fontWeight: "800",
        color: colors.textSecondary,
        textAlign: "center",
      },

      imageActionsRow: {
        marginTop: spacing.sm,
        gap: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
      },

      imageActionBtn: {
        minHeight: 42,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
      },

      imageActionBtnPressed: {
        opacity: 0.82,
        transform: [{ scale: 0.985 }],
      },

      imageActionText: {
        fontSize: 13,
        fontWeight: "900",
        color: colors.primaryGreen,
      },

      imageRemoveBtn: {
        minHeight: 42,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.danger,
      },

      imageRemoveText: {
        fontSize: 13,
        fontWeight: "900",
        color: colors.danger,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
  };
}
