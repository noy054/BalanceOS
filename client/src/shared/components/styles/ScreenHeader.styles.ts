import { StyleSheet } from "react-native";

import { layout, spacing, typography, useThemedStyles } from "../../theme";

export const SIDE_OFFSET = spacing.sm;
export const MIN_SIDE_WIDTH = 40;
export const TITLE_GAP = spacing.xs;

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        minHeight: layout.headerHeight,
        paddingHorizontal: SIDE_OFFSET,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        position: "relative",
        zIndex: 10,
      },

      sideSlot: {
        position: "absolute",
        top: 0,
        bottom: 0,
        minWidth: MIN_SIDE_WIDTH,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 12,
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
        minHeight: layout.headerHeight,
        paddingVertical: spacing.xs,
        zIndex: 1,
      },

      title: {
        ...typography.headline,
        color: colors.textPrimary,
        textAlign: "center",
      },
    }),
  );
