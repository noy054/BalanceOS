import { Platform, StyleSheet } from "react-native";

import { colors, spacing } from "../../theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    backgroundColor: colors.background,
  },

  bottomNavWrapper: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: Platform.OS === "ios" ? spacing.lg : spacing.md,
    zIndex: 50,
    borderRadius: 34,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 26,
        shadowOffset: { width: 0, height: 16 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
