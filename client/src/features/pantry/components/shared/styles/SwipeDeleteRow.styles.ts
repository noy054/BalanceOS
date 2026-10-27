import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        position: "relative",
      },

      content: {
        zIndex: 2,
      },

      actionContainer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 80,
        zIndex: 1,
      },

      actionLeft: {
        left: 0,
      },

      actionRight: {
        right: 0,
      },

      deleteAction: {
        flex: 1,
        borderRadius: radius.lg,
        backgroundColor: colors.danger,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
      },

      deleteActionPressed: {
        opacity: 0.82,
      },

      deleteActionDisabled: {
        opacity: 0.5,
      },

      deleteText: {
        ...typography.caption,
        fontWeight: "600",
        color: colors.surface,
        textAlign: "center",
      },
    }),
  );
