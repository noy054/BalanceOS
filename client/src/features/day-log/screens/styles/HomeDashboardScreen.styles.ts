import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';

const SECTION_GAP = spacing.md;

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  sectionGap: {
    height: SECTION_GAP,
  },
  shortcutGap: {
    height: spacing.sm,
  },
});
