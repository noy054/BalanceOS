import { StyleSheet } from 'react-native';
import { spacing, radius, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
      logoutWrapper: { marginBottom: spacing.lg },
      logoutBtn: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radius.md,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cardBackground,
      },
      logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
      },
      btnPressed: { opacity: 0.7 },
    }),
  );
