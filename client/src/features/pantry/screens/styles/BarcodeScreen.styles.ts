import { StyleSheet } from "react-native";

import {
  cameraColors,
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../shared/theme";

const CORNER_SIZE = 28;
const CORNER_THICK = 3;
const CORNER_INSET = spacing.lg;
const CORNER_COLOR = cameraColors.corner;

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      flex: {
        flex: 1,
      },

      body: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        gap: spacing.lg,
      },

      scrollBody: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
      },

      manualBody: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        gap: spacing.ms,
      },

      scanArea: {
        width: "100%",
        height: 280,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.xl,
        backgroundColor: cameraColors.surface,
        overflow: "hidden",
      },

      camera: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },

      scanCornerTL: {
        position: "absolute",
        top: CORNER_INSET,
        left: CORNER_INSET,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderTopWidth: CORNER_THICK,
        borderLeftWidth: CORNER_THICK,
        borderColor: CORNER_COLOR,
        borderTopLeftRadius: 8,
      },

      scanCornerTR: {
        position: "absolute",
        top: CORNER_INSET,
        right: CORNER_INSET,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderTopWidth: CORNER_THICK,
        borderRightWidth: CORNER_THICK,
        borderColor: CORNER_COLOR,
        borderTopRightRadius: 8,
      },

      scanCornerBL: {
        position: "absolute",
        bottom: CORNER_INSET,
        left: CORNER_INSET,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderBottomWidth: CORNER_THICK,
        borderLeftWidth: CORNER_THICK,
        borderColor: CORNER_COLOR,
        borderBottomLeftRadius: 8,
      },

      scanCornerBR: {
        position: "absolute",
        bottom: CORNER_INSET,
        right: CORNER_INSET,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderBottomWidth: CORNER_THICK,
        borderRightWidth: CORNER_THICK,
        borderColor: CORNER_COLOR,
        borderBottomRightRadius: 8,
      },

      scanLine: {
        position: "absolute",
        left: spacing.xl,
        right: spacing.xl,
        height: 2,
        backgroundColor: cameraColors.scanLine,
        top: "50%",
        borderRadius: 1,
      },

      loadingOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.ms,
        backgroundColor: cameraColors.overlay,
      },

      loadingText: {
        ...typography.callout,
        fontWeight: "600",
        color: cameraColors.foreground,
      },

      instructions: {
        alignItems: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
      },

      subtitle: {
        ...typography.headline,
        color: colors.textPrimary,
        textAlign: "center",
      },

      distanceHint: {
        ...typography.footnote,
        color: colors.textSecondary,
        textAlign: "center",
      },

      bottomActions: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        gap: spacing.sm,
      },

      resultCard: {
        alignItems: "center",
        gap: spacing.xs,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
      },

      resultIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.successSoft,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
      },

      resultTitle: {
        ...typography.label,
        color: colors.textSecondary,
        textAlign: "center",
      },

      resultName: {
        ...typography.headline,
        fontSize: 19,
        lineHeight: 25,
        color: colors.textPrimary,
        textAlign: "center",
      },

      resultMeta: {
        ...typography.callout,
        color: colors.textSecondary,
        textAlign: "center",
      },

      resultHint: {
        ...typography.footnote,
        color: colors.textMuted,
        textAlign: "center",
        marginTop: spacing.sm,
      },

      actionsStack: {
        gap: spacing.sm,
      },

      notFoundBanner: {
        alignItems: "flex-start",
        gap: spacing.ms,
        backgroundColor: colors.warningSoft,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
      },

      notFoundTitle: {
        ...typography.callout,
        fontWeight: "600",
        color: colors.textPrimary,
      },

      notFoundHint: {
        ...typography.footnote,
        color: colors.textSecondary,
        marginTop: 2,
      },
    }),
  );
