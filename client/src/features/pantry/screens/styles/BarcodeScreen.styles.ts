import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

const CORNER_SIZE = 24;
const CORNER_THICK = 2.5;

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  scanArea: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  scanCornerTL: {
    position: 'absolute',
    top: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK,
    borderColor: colors.primaryGreen, borderTopLeftRadius: 4,
  },
  scanCornerTR: {
    position: 'absolute',
    top: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK,
    borderColor: colors.primaryGreen, borderTopRightRadius: 4,
  },
  scanCornerBL: {
    position: 'absolute',
    bottom: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK,
    borderColor: colors.primaryGreen, borderBottomLeftRadius: 4,
  },
  scanCornerBR: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK,
    borderColor: colors.primaryGreen, borderBottomRightRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  placeholder: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  manualBtn: {
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  manualBtnPressed: { opacity: 0.8 },
  manualBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
});
