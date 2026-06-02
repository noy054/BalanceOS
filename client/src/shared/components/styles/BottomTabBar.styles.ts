import { Platform, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 1,
        shadowRadius: 26,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  tabItem: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  tabPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },

  addTabItem: {
    marginTop: -24,
    justifyContent: "flex-start",
  },

  addCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: colors.background,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.42,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
    letterSpacing: 0.1,
    fontWeight: "700",
  },

  tabLabelActive: {
    color: colors.primaryGreen,
    fontWeight: "900",
  },
});
