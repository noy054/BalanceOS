import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NutritionTotals as NutritionTotalsType } from '../types';
import { styles, chipStyles, getDirectionStyles } from './styles/NutritionTotals.styles';

type Props = {
  totals: NutritionTotalsType;
  label?: string;
  variant?: 'default' | 'highlight';
};

export function NutritionTotals({ totals, label, variant = 'default' }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);
  const isHighlight = variant === 'highlight';

  return (
    <View style={[styles.container, isHighlight && styles.containerHighlight]}>
      {label ? (
        <Text style={[styles.label, isHighlight && styles.labelHighlight, dir.label]}>{label}</Text>
      ) : null}
      <View style={[styles.row, dir.row]}>
        <MacroChip value={totals.calories} unit={t('product.calUnit')} bold isRTL={isRTL} />
        <MacroChip label={t('macros.protein')} value={totals.protein} unit={t('product.gramsUnit')} isRTL={isRTL} />
        <MacroChip label={t('macros.carbs')} value={totals.carbs} unit={t('product.gramsUnit')} isRTL={isRTL} />
        <MacroChip label={t('macros.fat')} value={totals.fat} unit={t('product.gramsUnit')} isRTL={isRTL} />
        {totals.fiber > 0 ? (
          <MacroChip label={t('macros.fiber')} value={totals.fiber} unit={t('product.gramsUnit')} isRTL={isRTL} />
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
  isRTL,
}: {
  label?: string;
  value: number;
  unit: string;
  bold?: boolean;
  isRTL: boolean;
}) {
  return (
    <View style={[chipStyles.chip, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      {label ? <Text style={chipStyles.label}>{label}</Text> : null}
      <Text style={[chipStyles.value, bold && chipStyles.valueBold]}>{value}</Text>
      <Text style={chipStyles.unit}> {unit}</Text>
    </View>
  );
}
