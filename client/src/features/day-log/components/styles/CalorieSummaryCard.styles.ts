import { Platform, StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";
import { homeDashboardColors } from "../../constants/homeDashboardTheme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        position: "relative",
        overflow: "hidden",
        borderRadius: radius.xxl,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        gap: spacing.lg,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 0.95,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 12 },
          },
          android: {
            elevation: 7,
          },
        }),
      },

      glow: {
        position: "absolute",
        top: -70,
        right: -70,
        width: 170,
        height: 170,
        borderRadius: 999,
        backgroundColor: homeDashboardColors.lime,
        opacity: 0.11,
      },

      headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },

      rowRtl: {
        flexDirection: "row-reverse",
      },

      textRtl: {
        textAlign: "right",
        writingDirection: "rtl",
      },

      statusPill: {
        minHeight: 34,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      },

      statusPillOver: {
        borderColor: colors.danger,
        backgroundColor: colors.cardBackgroundSoft,
      },

      statusText: {
        fontSize: 12,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      statusTextOver: {
        color: colors.danger,
      },

      ringBadge: {
        width: 66,
        height: 66,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1.5,
        borderColor: homeDashboardColors.lime,
        ...Platform.select({
          ios: {
            shadowColor: homeDashboardColors.lime,
            shadowOpacity: 0.25,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
          },
          android: {
            elevation: 5,
          },
        }),
      },

      ringBadgeOver: {
        borderColor: colors.danger,
        ...Platform.select({
          ios: {
            shadowColor: colors.danger,
            shadowOpacity: 0.2,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
          },
          android: {
            elevation: 5,
          },
        }),
      },

      ringPercent: {
        fontSize: 17,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -0.5,
      },

      ringPercentOver: {
        color: colors.danger,
      },

      ringLabel: {
        marginTop: -2,
        fontSize: 10,
        fontWeight: "800",
        color: colors.textMuted,
      },

      heroArea: {
        gap: spacing.xs,
      },

      mainLabel: {
        fontSize: 14,
        fontWeight: "800",
        color: colors.textMuted,
      },

      numberVisualWrap: {
        position: "relative",
        alignSelf: "flex-start",
        paddingRight: spacing.md,
        paddingBottom: spacing.xs,
      },

      numberVisualWrapRtl: {
        alignSelf: "flex-end",
        paddingRight: 0,
        paddingLeft: spacing.md,
      },

      numberPulse: {
        position: "absolute",
        left: -28,
        top: -12,
        width: 132,
        height: 132,
        borderRadius: 999,
        backgroundColor: homeDashboardColors.lime,
      },

      numberPulseRtl: {
        left: undefined,
        right: -28,
      },

      numberPulseOver: {
        backgroundColor: colors.danger,
      },

      numberBlob: {
        position: "absolute",
        left: -22,
        top: 5,
        width: 124,
        height: 80,
        borderRadius: 999,
        backgroundColor: homeDashboardColors.lime,
        opacity: 0.085,
        transform: [{ rotate: "-10deg" }],
      },

      numberBlobRtl: {
        left: undefined,
        right: -22,
        transform: [{ rotate: "10deg" }],
      },

      numberBlobOver: {
        backgroundColor: colors.danger,
        opacity: 0.095,
      },

      numberAccentLine: {
        position: "absolute",
        left: 2,
        bottom: 3,
        width: 88,
        height: 5,
        borderRadius: 999,
        backgroundColor: homeDashboardColors.lime,
        opacity: 0.34,
      },

      numberAccentLineRtl: {
        left: undefined,
        right: 2,
      },

      numberAccentLineOver: {
        backgroundColor: colors.danger,
        opacity: 0.34,
      },

      numberRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
      },

      mainNumber: {
        fontSize: 62,
        lineHeight: 68,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -2,
      },

      mainNumberOver: {
        color: colors.danger,
      },

      unit: {
        marginBottom: 10,
        fontSize: 15,
        fontWeight: "900",
        color: colors.textSecondary,
      },

      progressArea: {
        gap: spacing.sm,
      },

      progressTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },

      progressTitle: {
        fontSize: 12,
        fontWeight: "900",
        color: colors.textMuted,
      },

      progressValue: {
        fontSize: 12,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      progressTrack: {
        height: 12,
        borderRadius: radius.full,
        backgroundColor: colors.cardBackgroundSoft,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      },

      progressFill: {
        height: "100%",
        borderRadius: radius.full,
        backgroundColor: homeDashboardColors.lime,
      },

      progressFillOver: {
        backgroundColor: colors.danger,
      },

      statsRow: {
        flexDirection: "row",
        alignItems: "stretch",
        borderRadius: radius.xl,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.sm,
      },

      statBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        paddingHorizontal: spacing.xs,
      },

      statValue: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      statValueOver: {
        color: colors.danger,
      },

      statLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.textMuted,
      },

      statDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginVertical: 4,
      },
    }),
  );
