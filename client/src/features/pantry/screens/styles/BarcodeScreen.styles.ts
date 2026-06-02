import { Platform, StyleSheet } from "react-native";

import { colors, spacing, radius } from "../../../../shared/theme";

const CORNER_SIZE = 34;
const CORNER_THICK = 3;

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
    top: -70,
    left: -40,
    right: -40,
    height: 230,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  glowSide: {
    position: "absolute",
    top: 220,
    right: -120,
    width: 260,
    height: 480,
    borderRadius: 160,
    backgroundColor: "rgba(49, 216, 107, 0.06)",
    transform: [{ rotate: "12deg" }],
  },

  body: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  scanCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 8,
      },
    }),
  },

  scanArea: {
    width: "100%",
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackgroundStrong,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  scanCornerTL: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: colors.primaryGreen,
    borderTopLeftRadius: 6,
  },

  scanCornerTR: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: colors.primaryGreen,
    borderTopRightRadius: 6,
  },

  scanCornerBL: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: colors.primaryGreen,
    borderBottomLeftRadius: 6,
  },

  scanCornerBR: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: colors.primaryGreen,
    borderBottomRightRadius: 6,
  },

  scanLine: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    height: 2,
    backgroundColor: colors.primaryGreen,
    opacity: 0.7,
    top: "50%",
    borderRadius: radius.full,
  },

  iconBubble: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreenLight,
    borderWidth: 1,
    borderColor: colors.primaryGreenMid,
  },

  subtitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
    lineHeight: 24,
  },

  placeholder: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    lineHeight: 20,
  },

  manualBtn: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primaryGreenMid,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryGreen,
        shadowOpacity: 0.14,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 9 },
      },
      android: {
        elevation: 6,
      },
    }),
  },

  manualBtnPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },

  manualIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreenLight,
    borderWidth: 1,
    borderColor: colors.primaryGreenMid,
  },

  manualBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  // ── Camera ─────────────────────────────────────────────────────────────────
  camera: {
    ...StyleSheet.absoluteFill,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // ── Permission ─────────────────────────────────────────────────────────────
  permissionCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },

  permissionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
    lineHeight: 24,
    alignSelf: "stretch",
  },

  permissionMessage: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
    lineHeight: 20,
    alignSelf: "stretch",
  },

  permissionBtn: {
    minHeight: 50,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.xl,
    marginTop: spacing.xs,
  },

  permissionBtnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },

  permissionBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
  },

  // ── Not found ──────────────────────────────────────────────────────────────
  notFoundBanner: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackgroundStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  notFoundTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  notFoundHint: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
  },
});
