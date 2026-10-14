import { Platform, StyleSheet } from "react-native";
import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        borderRadius: radius.xxl,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        gap: spacing.md,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 1,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 14 },
          },
          android: { elevation: 8 },
        }),
      },

      header: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.sm,
      },

      headerIcon: {
        marginTop: 2,
      },

      headerText: {
        flex: 1,
        gap: 2,
      },

      productName: {
        fontSize: 17,
        fontWeight: "800",
        color: colors.textPrimary,
        lineHeight: 22,
      },

      productBrand: {
        fontSize: 13,
        fontWeight: "500",
        color: colors.textMuted,
      },

      offBanner: {
        alignItems: "center",
        gap: spacing.xs,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.cardBackgroundStrong,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
      },

      offBannerText: {
        flex: 1,
        fontSize: 11,
        fontWeight: "500",
        color: colors.textMuted,
        lineHeight: 16,
      },

      // ── Nutrition per 100g ─────────────────────────────────────────────────

      nutritionSection: {
        gap: 6,
        paddingTop: spacing.xs,
      },

      nutritionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 2,
      },

      nutritionRow: {
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },

      nutritionLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textSecondary,
      },

      nutritionValue: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
      },

      // ── Serving size section ───────────────────────────────────────────────

      servingSection: {
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
        borderRadius: radius.lg,
        backgroundColor: colors.primaryGreenLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
      },

      servingSectionHeader: {
        alignItems: "flex-start",
        gap: spacing.xs,
      },

      servingSectionHeaderText: {
        flex: 1,
        gap: 2,
      },

      servingSectionTitle: {
        fontSize: 13,
        fontWeight: "800",
        color: colors.primaryGreen,
        letterSpacing: 0.2,
      },

      servingSectionHint: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.primaryGreen,
        opacity: 0.8,
      },

      servingInputRow: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },

      servingFieldLabel: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
      },

      servingInputGroup: {
        alignItems: "center",
        gap: 4,
      },

      servingSizeInput: {
        fontSize: 14,
        fontWeight: "700",
        minWidth: 56,
        maxWidth: 72,
        borderBottomWidth: 1.5,
        borderBottomColor: colors.primaryGreen,
        paddingVertical: 2,
        paddingHorizontal: 4,
      },

      servingUnit: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textMuted,
      },

      servingLabelInput: {
        fontSize: 13,
        fontWeight: "500",
        flex: 1,
        maxWidth: 160,
        borderBottomWidth: 1.5,
        borderBottomColor: colors.primaryGreen,
        paddingVertical: 2,
        paddingHorizontal: 4,
      },

      servingPreview: {
        alignItems: "center",
        gap: 5,
        paddingTop: 2,
      },

      servingPreviewText: {
        flex: 1,
        fontSize: 11,
        fontWeight: "600",
        color: colors.primaryGreen,
      },

      // ── Calculator section ─────────────────────────────────────────────────

      calcSection: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.cardBackgroundStrong,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
      },

      calcSectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },

      calcRow: {
        alignItems: "center",
        gap: spacing.sm,
      },

      calcToggleGroup: {
        gap: 4,
      },

      calcPill: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: "transparent",
      },

      calcPillActive: {
        backgroundColor: colors.primaryGreen,
        borderColor: colors.primaryGreen,
      },

      calcPillText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textMuted,
      },

      calcPillTextActive: {
        color: "#000",
      },

      calcValueInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        borderBottomWidth: 1.5,
        borderBottomColor: colors.border,
        paddingVertical: 2,
        paddingHorizontal: 4,
        minHeight: 28,
      },

      calcResultRow: {
        alignItems: "center",
        gap: 5,
        paddingTop: 2,
      },

      calcResultText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
      },

      // ── Actions ────────────────────────────────────────────────────────────

      actions: {
        gap: spacing.sm,
        marginTop: spacing.xs,
      },

      addBtn: {
        minHeight: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primaryGreen,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.lg,
      },

      addBtnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
      addBtnDisabled: { opacity: 0.5 },

      addBtnText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#000",
        letterSpacing: 0.1,
      },

      scanAnotherBtn: {
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.cardBackgroundStrong,
      },

      scanAnotherBtnPressed: { opacity: 0.75 },

      scanAnotherBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textMuted,
      },
    }),
  );
