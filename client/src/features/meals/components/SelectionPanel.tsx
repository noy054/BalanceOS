import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../shared/components/ui/Button';
import { IconButton } from '../../../shared/components/ui/IconButton';
import { SegmentedControl } from '../../../shared/components/ui/SegmentedControl';
import { useDirection } from '../../../shared/hooks/useDirection';
import { formatCalories, formatGrams } from '../../../shared/helpers/formatNumber';
import { radius, spacing, typography, useThemedStyles } from '../../../shared/theme';
import { AmountUnit, amountToGrams } from '../../pantry/helpers/serving';
import { useServingFormat } from '../../pantry/hooks/useServingFormat';
import { CalculatedNutrition } from '../../pantry/types';
import { SelectedItem } from '../hooks/useMealSelection';

type Props = {
  selected: SelectedItem;
  quantity: string;
  unit: AmountUnit;
  unitOptions: AmountUnit[];
  nutrition: CalculatedNutrition | null;
  primary: boolean;
  onChangeQuantity: (value: string) => void;
  onChangeUnit: (unit: AmountUnit) => void;
  onStep: (direction: 1 | -1) => void;
  onDeselect: () => void;
  onAdd: () => void;
};

export function SelectionPanel({
  selected,
  quantity,
  unit,
  unitOptions,
  nutrition,
  primary,
  onChangeQuantity,
  onChangeUnit,
  onStep,
  onDeselect,
  onAdd,
}: Props) {
  const { t } = useTranslation('dashboard');
  const styles = useStyles();
  const dir = useDirection();
  const servingFormat = useServingFormat();

  const product = selected.kind === 'product' ? selected.item : null;
  const unitLabel = product
    ? unit === 'servings'
      ? servingFormat.unitName(product)
      : t('addItem.gramsLabel')
    : t('addItem.servingsLabel');

  const parsed = parseFloat(quantity.replace(',', '.'));
  const grams =
    product && !Number.isNaN(parsed) && parsed > 0 ? amountToGrams(product, parsed, unit) : null;

  const summary = [
    product && unit === 'servings' ? servingFormat.unitWeight(product) : null,
    grams != null && unit === 'servings' ? t('addItem.gramsAmount', { grams: formatGrams(grams) }) : null,
    nutrition ? t('addItem.caloriesAmount', { calories: formatCalories(nutrition.calories) }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const hasQuantity = selected.kind !== 'savedMeal';

  return (
    <View style={styles.panel}>
      <View style={[styles.headerRow, dir.row]}>
        <View style={styles.headerText}>
          <Text style={[styles.name, dir.text]} numberOfLines={1}>
            {selected.item.name}
          </Text>
          {summary ? (
            <Text style={[styles.summary, dir.text]} numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
        </View>

        <IconButton
          icon="close"
          size={36}
          iconSize={18}
          accessibilityLabel={t('addItem.deselect', { name: selected.item.name })}
          onPress={onDeselect}
        />
      </View>

      {unitOptions.length > 1 && product ? (
        <SegmentedControl
          size="sm"
          options={unitOptions.map((option) => ({
            value: option,
            label: option === 'servings' ? servingFormat.unitName(product) : t('addItem.gramsLabel'),
          }))}
          value={unit}
          onChange={onChangeUnit}
        />
      ) : null}

      <View style={[styles.actionRow, dir.row]}>
        {hasQuantity ? (
          <View style={[styles.stepper, dir.row]}>
            <IconButton
              icon="minus"
              variant="tonal"
              size={40}
              iconSize={18}
              accessibilityLabel={t('addItem.decrease')}
              onPress={() => onStep(-1)}
            />
            <View style={styles.quantityBlock}>
              <TextInput
                style={styles.quantityInput}
                keyboardType="decimal-pad"
                value={quantity}
                onChangeText={onChangeQuantity}
                selectTextOnFocus
                textAlign="center"
                accessibilityLabel={unitLabel}
              />
              <Text style={styles.unitLabel} numberOfLines={1}>
                {unitLabel}
              </Text>
            </View>
            <IconButton
              icon="plus"
              variant="tonal"
              size={40}
              iconSize={18}
              accessibilityLabel={t('addItem.increase')}
              onPress={() => onStep(1)}
            />
          </View>
        ) : (
          <Text style={[styles.wholeMeal, dir.text]}>{t('addItem.wholeMeal')}</Text>
        )}

        <Button
          label={t('addItem.addToList')}
          icon="plus"
          variant={primary ? 'primary' : 'tonal'}
          onPress={onAdd}
          disabled={!nutrition}
          style={styles.addButton}
        />
      </View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      panel: {
        gap: spacing.ms,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.lg,
        padding: spacing.ms,
      },
      headerRow: {
        alignItems: 'center',
        gap: spacing.sm,
      },
      headerText: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      name: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      summary: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
      actionRow: {
        alignItems: 'center',
        gap: spacing.sm,
      },
      stepper: {
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        gap: spacing.xs,
      },
      quantityBlock: {
        flex: 1,
        minWidth: 56,
        alignItems: 'center',
        gap: 2,
      },
      quantityInput: {
        alignSelf: 'stretch',
        minHeight: 40,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.surface,
        ...typography.headline,
        ...typography.number,
        color: colors.textPrimary,
        textAlign: 'center',
        paddingHorizontal: spacing.xs,
      },
      unitLabel: {
        maxWidth: '100%',
        ...typography.caption,
        color: colors.textSecondary,
      },
      wholeMeal: {
        flex: 1,
        ...typography.callout,
        color: colors.textSecondary,
      },
      addButton: {
        flexShrink: 0,
      },
    }),
  );
