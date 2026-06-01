import { Platform, StyleSheet } from "react-native";

import {
  homeDashboardColors,
  homeDashboardSpacing,
} from "../../constants/homeDashboardTheme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#090909",
  },

  backgroundLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    backgroundColor: "#090909",
  },

  glowTop: {
    position: "absolute",
    top: -40,
    left: -20,
    right: -20,
    height: 220,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  glowLeft: {
    position: "absolute",
    top: 120,
    left: -80,
    width: 180,
    height: 520,
    borderRadius: 120,
    backgroundColor: "rgba(185, 255, 59, 0.05)",
    transform: [{ rotate: "-12deg" }],
  },

  glowBottom: {
    position: "absolute",
    bottom: -40,
    right: -40,
    width: 240,
    height: 260,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.03)",
    transform: [{ rotate: "18deg" }],
  },

  headerWrapper: {
    paddingHorizontal: homeDashboardSpacing.xl,
    paddingTop: homeDashboardSpacing.sm,
    paddingBottom: homeDashboardSpacing.md,
    zIndex: 3,
  },

  scroll: {
    flex: 1,
    zIndex: 2,
  },

  scrollContent: {
    paddingHorizontal: homeDashboardSpacing.xl,
    paddingTop: homeDashboardSpacing.xs,
    paddingBottom: 96,
    gap: homeDashboardSpacing.lg,
  },

  heroSection: {
    borderRadius: 36,
    ...Platform.select({
      ios: {
        shadowColor: homeDashboardColors.shadow,
        shadowOpacity: 1,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 18 },
      },
      android: {
        elevation: 10,
      },
    }),
  },

  section: {
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: homeDashboardColors.shadow,
        shadowOpacity: 0.85,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 7,
      },
    }),
  },

  actionSection: {
    marginTop: -homeDashboardSpacing.sm,
  },

  shortcutsSection: {
    marginTop: -homeDashboardSpacing.md,
  },

  bottomNavWrapper: {
    position: "absolute",
    left: homeDashboardSpacing.lg,
    right: homeDashboardSpacing.lg,
    bottom:
      Platform.OS === "ios" ? homeDashboardSpacing.lg : homeDashboardSpacing.md,
    zIndex: 20,
    borderRadius: 34,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: homeDashboardColors.shadow,
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
