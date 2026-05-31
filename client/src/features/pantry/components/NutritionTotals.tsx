import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NutritionTotals as NutritionTotalsType } from '../types';
import { colors, spacing, radius } from '../../../shared/theme';

type Props = {
  totals: NutritionTotalsType;
  label?: string;
  variant?: 'default' | 'highlight';
};

export function NutritionTotals({ totals, label, variant = 'default' }: Props) {
  const { t } = useTranslation('pantry');
  const isHighlight = variant === 'highlight';

  return (
    <View style={[styles.container, isHighlight && styles.containerHighlight]}>
      {label ? <Text style={[styles.label, isHighlight && styles.labelHighlight]}>{label}</Text> : null}
      <View style={styles.row}>
        <MacroChip value={totals.calories} unit={t('product.calUnit')} bold />
        <MacroChip label={t('macros.protein')} value={totals.protein} unit={t('product.gramsUnit')} />
        <MacroChip label={t('macros.carbs')} value={totals.carbs} unit={t('product.gramsUnit')} />
        <MacroChip label={t('macros.fat')} value={totals.fat} unit={t('product.gramsUnit')} />
        {totals.fiber > 0 ? (
          <MacroChip label={t('macros.fiber')} value={totals.fiber} unit={t('product.gramsUnit')} />
        ) : null}
      </View>
    </View>
  );
}

function MacroChip({
  label,
  value,
  unit,
  bold,
}: {
  label?: string;
  value: number;
  unit: string;
  bold?: boolean;
}) {
  return (
    <View style={chipStyles.chip}>
      {label ? <Text style={chipStyles.label}>{label}</Text> : null}
      <Text style={[chipStyles.value, bold && chipStyles.valueBold]}>{value}</Text>
      <Text style={chipStyles.unit}> {unit}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginEnd: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 10,
    color: colors.primaryGreen,
    marginEnd: 2,
  },
  value: {
    fontSize: 12,
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  valueBold: {
    fontSize: 13,
    fontWeight: '800',
  },
  unit: {
    fontSize: 10,
    color: colors.primaryGreen,
  },
});

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  containerHighlight: {
    backgroundColor: colors.primaryGreenLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  labelHighlight: {
    color: colors.primaryGreen,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
