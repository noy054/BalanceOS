import { StyleSheet } from 'react-native';
import { spacing, radius, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      scroll: { flex: 1 },
      content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xl },
      saveBtn: {
        backgroundColor: colors.primaryGreen,
        borderRadius: radius.md,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
      },
      saveBtnPressed: { opacity: 0.85 },
      saveBtnDisabled: { opacity: 0.5 },
      saveBtnText: { fontSize: 15, fontWeight: '800', color: '#081008', letterSpacing: 0.2 },
      successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
      },
      successText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: colors.primaryGreen,
      },
    }),
  );
