import { StyleSheet } from "react-native";

import {
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.ml,
        gap: spacing.md,
      },

      hero: {
        gap: 2,
      },

      mainLabel: {
        ...typography.footnote,
        fontWeight: "500",
        color: colors.textSecondary,
      },

      numberRow: {
        alignItems: "baseline",
        gap: spacing.xs + 2,
      },

      mainNumber: {
        ...typography.display,
        fontSize: 40,
        lineHeight: 46,
        color: colors.textPrimary,
      },

      mainNumberOver: {
        color: colors.warning,
      },

      mainUnit: {
        ...typography.body,
        color: colors.textSecondary,
      },

      progressBlock: {
        gap: spacing.sm,
      },

      progressTrack: {
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.progressTrack,
        overflow: "hidden",
      },

      progressFill: {
        height: "100%",
        borderRadius: 5,
        backgroundColor: colors.accent,
      },

      progressFillOver: {
        backgroundColor: colors.warning,
      },

      progressCaption: {
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: spacing.sm,
      },

      captionText: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      captionValue: {
        ...typography.number,
        fontWeight: "600",
        color: colors.textPrimary,
      },

      captionPercent: {
        ...typography.number,
        color: colors.textMuted,
      },

      captionPercentOver: {
        ...typography.number,
        fontWeight: "600",
        color: colors.warning,
      },

      macros: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingTop: spacing.md,
        gap: spacing.ms,
      },

      macroRow: {
        alignItems: "center",
        gap: spacing.ms,
      },

      macroBlockCompact: {
        gap: spacing.xs + 2,
      },

      macroLabelCompact: {
        flex: 1,
        width: undefined,
      },

      macroLabel: {
        width: 72,
        ...typography.footnote,
        color: colors.textSecondary,
      },

      macroTrackInline: {
        flex: 1,
      },

      macroTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.progressTrack,
        overflow: "hidden",
      },

      macroFill: {
        height: "100%",
        borderRadius: 3,
      },

      macroValue: {
        minWidth: 96,
        ...typography.footnote,
        ...typography.number,
        fontWeight: "600",
        color: colors.textPrimary,
        textAlign: "center",
      },

      macroTarget: {
        fontWeight: "400",
        color: colors.textMuted,
      },

      macroPercent: {
        width: 38,
        ...typography.caption,
        ...typography.number,
        fontWeight: "400",
        color: colors.textMuted,
        textAlign: "center",
      },
    }),
  );
