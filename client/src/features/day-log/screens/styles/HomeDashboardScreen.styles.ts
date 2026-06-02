import { Platform, StyleSheet } from "react-native";

import { colors, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  backgroundLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    backgroundColor: colors.background,
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
    backgroundColor: "rgba(49, 216, 107, 0.05)",
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    zIndex: 3,
  },

  scroll: {
    flex: 1,
    zIndex: 2,
  },

  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: 124,
    gap: spacing.lg,
  },

  heroSection: {
    borderRadius: 36,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
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
        shadowColor: colors.shadow,
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
    marginTop: -spacing.sm,
  },

  shortcutsSection: {
    marginTop: -spacing.md,
  },
});
