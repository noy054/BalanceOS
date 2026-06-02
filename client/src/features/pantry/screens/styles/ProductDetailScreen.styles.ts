import { StyleSheet } from "react-native";

import { colors, spacing } from "../../../../shared/theme";

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
    } as const,
    text: {
      textAlign: isRTL ? "right" : "left",
      writingDirection: isRTL ? "rtl" : "ltr",
    } as const,
  };
}

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
    top: -60,
    left: -40,
    right: -40,
    height: 220,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  glowSide: {
    position: "absolute",
    top: 210,
    right: -100,
    width: 220,
    height: 420,
    borderRadius: 130,
    backgroundColor: "rgba(49, 216, 107, 0.055)",
    transform: [{ rotate: "12deg" }],
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 42,
    gap: spacing.lg,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  errorText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.danger,
    textAlign: "center",
  },
});
