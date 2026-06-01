import { StyleSheet } from "react-native";

import {
  homeDashboardColors,
  homeDashboardRadius,
} from "../../constants/homeDashboardTheme";

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
    color: "#FFFFFF",
    letterSpacing: -0.9,
  },

  logoOS: {
    fontSize: 26,
    fontWeight: "900",
    color: homeDashboardColors.lime,
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
    color: "rgba(255, 255, 255, 0.42)",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },

  settingsButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: homeDashboardRadius.lg,
    backgroundColor: "rgb(255, 255, 255)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },

  settingsButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
});
