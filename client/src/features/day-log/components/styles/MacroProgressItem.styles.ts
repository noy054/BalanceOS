import { StyleSheet } from "react-native";

import { radius, spacing, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        paddingHorizontal: 4,
        paddingVertical: spacing.xs,
      },

      iconBubble: {
        width: 34,
        height: 34,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        marginBottom: 6,
      },

      label: {
        maxWidth: "100%",
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: "800",
        marginBottom: 5,
        textAlign: "center",
      },

      valueRow: {
        maxWidth: "100%",
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
        gap: 3,
      },

      current: {
        flexShrink: 1,
        fontSize: 18,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -0.4,
        textAlign: "center",
      },

      separator: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: "800",
      },

      targetValue: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: "800",
      },

      metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        marginTop: 2,
        marginBottom: 7,
      },

      unit: {
        fontSize: 9,
        color: colors.textMuted,
        fontWeight: "700",
      },

      percentage: {
        fontSize: 10,
        fontWeight: "900",
      },

      progressTrack: {
        width: "82%",
        height: 5,
        backgroundColor: colors.progressTrack,
        borderRadius: 999,
        overflow: "hidden",
      },

      progressFill: {
        height: "100%",
        borderRadius: 999,
      },
    }),
  );
