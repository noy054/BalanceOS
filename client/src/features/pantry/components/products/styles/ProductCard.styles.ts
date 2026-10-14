import { Platform, StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.cardBackground,
        borderRadius: radius.xl,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 1,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
          },
          android: {
            elevation: 6,
          },
        }),
      },

      cardPressed: {
        opacity: 0.88,
        transform: [{ scale: 0.99 }],
      },

      cardHighlighted: {
        borderColor: colors.primaryGreen,
        borderWidth: 1.5,
        ...Platform.select({
          ios: {
            shadowColor: colors.primaryGreen,
            shadowOpacity: 0.35,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
          },
          android: {
            elevation: 10,
          },
        }),
      },

      topRow: {
        alignItems: "center",
        gap: spacing.md,
        marginBottom: spacing.md,
      },

      imageBox: {
        width: 62,
        height: 62,
        borderRadius: radius.lg,
        overflow: "hidden",
        backgroundColor: colors.cardBackgroundStrong,
        borderWidth: 1,
        borderColor: colors.border,
      },

      imageBoxPressed: {
        opacity: 0.78,
        transform: [{ scale: 0.96 }],
      },

      productImage: {
        width: "100%",
        height: "100%",
      },

      imagePlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primaryGreenLight,
      },

      imageZoomBadge: {
        position: "absolute",
        right: 4,
        bottom: 4,
        width: 20,
        height: 20,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.56)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
      },

      info: {
        flex: 1,
        minWidth: 0,
        justifyContent: "center",
      },

      name: {
        fontSize: 17,
        fontWeight: "900",
        color: colors.textPrimary,
        marginBottom: 4,
        lineHeight: 22,
      },

      brand: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textSecondary,
        lineHeight: 18,
      },

      basisBadge: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.textMuted,
        marginTop: 3,
      },

      actionsRow: {
        alignItems: "center",
        gap: spacing.xs,
      },

      actionBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
      },

      deleteBtn: {
        backgroundColor: colors.dangerLight,
        borderColor: "rgba(248, 75, 106, 0.28)",
      },

      actionBtnPressed: {
        opacity: 0.72,
        transform: [{ scale: 0.95 }],
      },

      macroGrid: {
        gap: spacing.xs,
      },

      imageModalOverlay: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.78)",
      },

      imageModalContent: {
        width: "100%",
        maxWidth: 420,
        borderRadius: radius.xl,
        padding: spacing.md,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOpacity: 0.35,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 16 },
          },
          android: {
            elevation: 12,
          },
        }),
      },

      imageModalCloseButton: {
        position: "absolute",
        top: spacing.sm,
        right: spacing.sm,
        zIndex: 2,
        width: 38,
        height: 38,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.48)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      },

      imageModalCloseButtonPressed: {
        opacity: 0.72,
        transform: [{ scale: 0.95 }],
      },

      imageModalImage: {
        width: "100%",
        height: 360,
        borderRadius: radius.lg,
        backgroundColor: colors.cardBackgroundStrong,
      },

      imageModalTitle: {
        marginTop: spacing.sm,
        fontSize: 15,
        fontWeight: "800",
        color: colors.textPrimary,
      },
    }),
  );

export const useMacroStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      box: {
        flex: 1,
        minHeight: 58,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        backgroundColor: colors.cardBackgroundStrong,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: "center",
      },

      label: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.textSecondary,
        marginBottom: 5,
      },

      valueRow: {
        alignItems: "baseline",
        justifyContent: "center",
        gap: 4,
      },

      value: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.textPrimary,
        writingDirection: "ltr",
      },

      valueHighlight: {
        color: colors.primaryGreen,
      },

      unit: {
        fontSize: 10,
        fontWeight: "800",
        color: colors.textMuted,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },

    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
