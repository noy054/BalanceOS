import { StyleSheet } from "react-native";

import { colors, radius } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoBlock: {
    gap: 3,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoBalance: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -0.9,
  },

  logoOS: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.primaryGreen,
    letterSpacing: -0.9,
  },

  logoLeaf: {
    marginStart: 6,
    marginTop: 1,
    opacity: 0.95,
  },

  subtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },

  settingsButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.cardBackgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },

  settingsButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
});
