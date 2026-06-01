import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xl },
  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  saveBtnPressed: { opacity: 0.85 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: colors.cardBackground, letterSpacing: 0.2 },
});
