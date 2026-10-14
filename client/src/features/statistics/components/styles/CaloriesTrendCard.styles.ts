import { StyleSheet } from 'react-native';
import { spacing, radius, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      // Header
      headerRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
      },
      titleInline: {
        marginBottom: 0,
      },
      targetBadge: {
        fontSize: 11,
        color: colors.textMuted,
        fontVariant: ['tabular-nums'],
      },

      // Chart wrapper
      chartWrapper: {
        marginTop: spacing.xs,
      },

      // Calorie values row (7D only)
      valuesRow: {
        flexDirection: 'row',
        marginBottom: 4,
      },
      valueCell: {
        flex: 1,
        alignItems: 'center',
      },
      barValue: {
        fontSize: 9,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
      },

      // Bars
      barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 130,
        gap: 3,
      },
      barWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 130,
      },
      bar: {
        width: '80%',
        maxWidth: 40,
        borderRadius: radius.sm,
      },

      // Target line
      targetLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        borderStyle: 'dashed',
        borderTopWidth: 1,
        borderColor: colors.borderStrong,
      },

      // X-axis
      xAxis: {
        flexDirection: 'row',
        gap: 3,
        marginTop: spacing.xs,
      },
      xCell: {
        flex: 1,
        alignItems: 'center',
        gap: 1,
      },
      dayInitial: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.textSecondary,
      },
      dateNum: {
        fontSize: 8,
        color: colors.textMuted,
      },

      // Summary
      summary: {
        marginTop: spacing.sm,
        fontSize: 11,
        color: colors.textMuted,
      },
    }),
  );
