import { StyleSheet } from "react-native";

import { fonts, typography, useThemedStyles } from "../../../../shared/theme";
import { withAlpha } from "../../../../shared/helpers/progressColor";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.homeCanvas,
      },
      scroll: {
        flexGrow: 1,
      },
      statusHeader: {
        paddingHorizontal: 16,
        paddingBottom: 8,
      },
      backButton: {
        borderRadius: 999,
      },
      hero: {
        width: "100%",
        alignItems: "center",
      },
      heroGlow: {
        position: "absolute",
        width: "70%",
        aspectRatio: 1,
        top: "22%",
        borderRadius: 999,
        backgroundColor: withAlpha(colors.calorieGauge, 0.08),
        boxShadow: `0 0 80px 40px ${withAlpha(colors.calorieGauge, 0.08)}`,
      },
      heroImage: {
        height: "74%",
        aspectRatio: 1,
        borderRadius: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      heroPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
      },
      heroControls: {
        position: "absolute",
        left: 16,
        right: 16,
      },
      body: {
        paddingHorizontal: 16,
        marginTop: -12,
        gap: 10,
      },
      identity: {
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 4,
      },
      identityText: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      name: {
        fontFamily: fonts.headingSemibold,
        fontSize: 22,
        lineHeight: 28,
        color: colors.textPrimary,
      },
      brand: {
        ...typography.callout,
        fontSize: 15,
        color: colors.textSecondary,
      },
      verified: {
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        height: 32,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: withAlpha(colors.accentFill, 0.6),
        backgroundColor: withAlpha(colors.accentFill, 0.1),
      },
      verifiedLabel: {
        fontFamily: fonts.medium,
        fontSize: 13,
        color: colors.accentFill,
      },
      panel: {
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        gap: 8,
      },
      panelRow: {
        alignItems: "stretch",
      },
      panelCellWrap: {
        flex: 1,
      },
      panelCell: {
        flex: 1,
        alignItems: "center",
        gap: 1,
      },
      panelDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: colors.glassBorder,
      },
      panelValue: {
        ...typography.number,
        fontFamily: fonts.medium,
        fontSize: 20,
        lineHeight: 24,
        color: colors.textPrimary,
      },
      panelUnit: {
        fontFamily: fonts.regular,
        fontSize: 11,
        lineHeight: 13,
        color: colors.textSecondary,
      },
      panelLabel: {
        fontFamily: fonts.medium,
        fontSize: 13,
        lineHeight: 17,
        color: colors.textSecondary,
      },
      panelBasis: {
        fontFamily: fonts.regular,
        fontSize: 12,
        textAlign: "center",
        color: colors.textMuted,
      },
      section: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        overflow: "hidden",
      },
      sectionOpen: {
        borderColor: withAlpha(colors.calorieGauge, 0.35),
      },
      sectionHeader: {
        minHeight: 60,
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
      },
      sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      sectionTitles: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      sectionTitle: {
        fontFamily: fonts.semibold,
        fontSize: 15,
        lineHeight: 20,
        color: colors.textPrimary,
      },
      sectionPreview: {
        fontFamily: fonts.regular,
        fontSize: 13,
        lineHeight: 18,
        color: colors.textSecondary,
      },
      sectionBody: {
        paddingHorizontal: 14,
        paddingBottom: 14,
      },
      sectionText: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      factsBasis: {
        fontFamily: fonts.medium,
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 4,
      },
      factRow: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
      },
      indentLeft: {
        paddingLeft: 14,
      },
      indentRight: {
        paddingRight: 14,
      },
      factLabel: {
        flex: 1,
        fontFamily: fonts.medium,
        fontSize: 14,
        color: colors.textPrimary,
      },
      factLabelNested: {
        flex: 1,
        fontFamily: fonts.regular,
        fontSize: 13,
        color: colors.textSecondary,
      },
      factValue: {
        ...typography.number,
        fontFamily: fonts.medium,
        fontSize: 14,
        color: colors.textPrimary,
      },
      factMissing: {
        fontFamily: fonts.regular,
        fontSize: 13,
        color: colors.textMuted,
      },
      footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: withAlpha(colors.homeCanvas, 0.92),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
      },
      footerRow: {
        gap: 10,
      },
      footerAction: {
        flex: 1,
      },
    }),
  );
