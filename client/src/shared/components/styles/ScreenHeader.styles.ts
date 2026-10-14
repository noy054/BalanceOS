import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        height: 72,
        paddingHorizontal: spacing.lg,
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
        width: 96,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1002,
        elevation: 1002,
      },

      leftSlot: {
        left: spacing.lg,
      },

      rightSlot: {
        right: spacing.lg,
      },

      titleSlot: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 112,
        width: "100%",
        height: 72,
        zIndex: 1,
      },

      title: {
        fontSize: 18,
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
