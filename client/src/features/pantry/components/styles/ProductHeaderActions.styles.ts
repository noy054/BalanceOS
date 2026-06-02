import { Platform, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.xs,
    overflow: "visible",
  },

  containerRTL: {
    marginLeft: spacing.md,
  },

  containerLTR: {
    marginRight: spacing.md,
  },

  actionButton: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.7,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 4,
      },
    }),
  },

  editButton: {
    backgroundColor: colors.primaryGreenLight,
    borderColor: colors.primaryGreenMid,
  },

  deleteButton: {
    backgroundColor: colors.dangerLight,
    borderColor: "rgba(248, 75, 106, 0.28)",
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
});
