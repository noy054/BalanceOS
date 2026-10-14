import { StyleSheet } from "react-native";

import { radius, spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
      root: {
        position: "relative",
        overflow: "hidden",
      },

      content: {
        zIndex: 2,
      },

      actionContainer: {
        position: "absolute",
        top: 0,
        bottom: spacing.md,
        width: 92,
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
        borderRadius: radius.xl,
        backgroundColor: "#EF4444",
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
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "900",
        textAlign: "center",
      },
    }),
  );
