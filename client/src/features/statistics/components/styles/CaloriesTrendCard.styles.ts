import { StyleSheet } from 'react-native';

import { fonts, radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      headerRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        gap: spacing.sm,
      },
      titleInline: {
        marginBottom: 0,
      },
      targetBadge: {
        ...typography.caption,
        ...typography.number,
        color: colors.textSecondary,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        overflow: 'hidden',
      },

      chartWrapper: {
        marginTop: spacing.xs,
      },

      valuesRow: {
        flexDirection: 'row',
        marginBottom: 4,
      },
      valueCell: {
        flex: 1,
        alignItems: 'center',
      },
      barValue: {
        fontSize: 10,
        fontFamily: fonts.semibold,
        fontVariant: ['tabular-nums'],
      },

      barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 130,
        gap: 4,
      },
      barWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 130,
      },
      bar: {
        width: '72%',
        maxWidth: 32,
        borderTopLeftRadius: radius.xs,
        borderTopRightRadius: radius.xs,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
      },

      targetLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        borderStyle: 'dashed',
        borderTopWidth: 1,
        borderColor: colors.textMuted,
        zIndex: 2,
      },

      xAxis: {
        flexDirection: 'row',
        gap: 4,
        marginTop: spacing.xs + 2,
      },
      xCell: {
        flex: 1,
        alignItems: 'center',
        gap: 1,
      },
      dayInitial: {
        fontSize: 11,
        fontFamily: fonts.semibold,
        color: colors.textSecondary,
      },
      dateNum: {
        fontSize: 10,
        color: colors.textMuted,
        fontVariant: ['tabular-nums'],
      },

      footerRow: {
        marginTop: spacing.ms,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: spacing.sm,
      },
      legend: {
        flexWrap: 'wrap',
        gap: spacing.ms,
      },
      legendItem: {
        alignItems: 'center',
        gap: spacing.xs + 1,
      },
      legendSwatch: {
        width: 10,
        height: 10,
        borderRadius: 3,
      },
      legendText: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      summary: {
        ...typography.caption,
        ...typography.number,
        color: colors.textSecondary,
      },
    }),
  );
