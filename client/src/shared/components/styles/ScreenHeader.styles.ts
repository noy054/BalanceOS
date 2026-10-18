import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../theme";

export const SIDE_OFFSET = spacing.md;
export const MIN_SIDE_WIDTH = 42;
export const TITLE_GAP = spacing.sm;

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        minHeight: 72,
        paddingHorizontal: SIDE_OFFSET,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        overflow: "visible",
        position: "relative",
        zIndex: 1000,
        elevation: 1000,
      },

      sideSlot: {
        position: "absolute",
        top: 0,
        bottom: 0,
        minWidth: MIN_SIDE_WIDTH,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1002,
        elevation: 1002,
      },

      leftSlot: {
        left: SIDE_OFFSET,
      },

      rightSlot: {
        right: SIDE_OFFSET,
      },

      titleSlot: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: 72,
        paddingVertical: spacing.sm,
        zIndex: 1,
      },

      title: {
        fontSize: 18,
        lineHeight: 23,
        fontWeight: "900",
        color: colors.textPrimary,
        textAlign: "center",
        letterSpacing: -0.25,
      },

      iconButton: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.lg,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 1003,
        elevation: 1003,
      },

      pressed: {
        opacity: 0.72,
        transform: [{ scale: 0.96 }],
      },
    }),
  );
