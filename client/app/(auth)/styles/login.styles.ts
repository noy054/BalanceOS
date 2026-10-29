import { StyleSheet } from 'react-native';

import { fonts, radius, spacing, typography, useThemedStyles } from '../../../src/shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      header: { marginBottom: spacing.xl, gap: spacing.sm },
      brand: { marginBottom: spacing.ml },
      title: {
        ...typography.title,
        fontSize: 28,
        lineHeight: 34,
        color: colors.textPrimary,
      },
      subtitle: {
        ...typography.body,
        color: colors.textSecondary,
      },
      field: { marginBottom: spacing.md },
      fieldLabel: {
        ...typography.label,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs + 2,
      },
      input: { backgroundColor: colors.inputBackground },
      btnContent: { height: 50 },
      btnLabel: { ...typography.bodyStrong, letterSpacing: 0 },
      primaryBtn: { borderRadius: radius.md, marginTop: spacing.sm },
      divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.ml,
        gap: spacing.ms,
      },
      dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong },
      dividerText: { ...typography.caption, color: colors.textMuted },
      googleBtn: { borderRadius: radius.md, borderColor: colors.borderStrong, borderWidth: 1 },
      googleLabel: { ...typography.bodyStrong, fontFamily: fonts.medium, letterSpacing: 0 },
      footer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
        gap: spacing.xs,
      },
      footerText: { ...typography.callout, color: colors.textSecondary },
      link: { ...typography.callout, fontFamily: fonts.semibold, color: colors.accent, paddingVertical: spacing.xs },
      forgotLink: { ...typography.footnote, color: colors.accent, marginTop: spacing.sm, paddingVertical: spacing.xs },
      errorBox: {
        backgroundColor: colors.dangerSoft,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm2,
        marginBottom: spacing.sm,
        marginTop: 2,
      },
      errorText: {
        ...typography.callout,
        color: colors.danger,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    alignStart: {
      alignSelf: isRTL ? 'flex-end' as const : 'flex-start' as const,
    },
    inputContent: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    emailContent: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: 'ltr' as const,
    },
  };
}
