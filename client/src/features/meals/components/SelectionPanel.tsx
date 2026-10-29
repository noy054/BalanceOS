import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '../../../shared/components/ui/IconButton';
import { SegmentedControl } from '../../../shared/components/ui/SegmentedControl';
import { useDirection } from '../../../shared/hooks/useDirection';
import { formatGrams } from '../../../shared/helpers/formatNumber';
import { fonts, spacing, typography, useThemedStyles, radius } from '../../../shared/theme';
import { NutritionGrid } from '../../pantry/components/food/NutritionGrid';
import { AmountUnit, amountToGrams, getServing } from '../../pantry/helpers/serving';
import { useServingFormat } from '../../pantry/hooks/useServingFormat';
import { CalculatedNutrition } from '../../pantry/types';
import { SelectedItem } from '../hooks/useMealSelection';

type Props = {
  selected: SelectedItem;
  quantity: string;
  unit: AmountUnit;
  unitOptions: AmountUnit[];
  nutrition: CalculatedNutrition | null;
  onChangeQuantity: (value: string) => void;
  onChangeUnit: (unit: AmountUnit) => void;
  onStep: (direction: 1 | -1) => void;
  onDeselect: () => void;
};

const EMPTY_NUTRITION: CalculatedNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

export function SelectionPanel({
  selected,
  quantity,
  unit,
  unitOptions,
  nutrition,
  onChangeQuantity,
  onChangeUnit,
  onStep,
  onDeselect,
}: Props) {
  const { t } = useTranslation('dashboard');
  const styles = useStyles();
  const dir = useDirection();
  const servingFormat = useServingFormat();

  const product = selected.kind === 'product' ? selected.item : null;
  const servingLabel = (product && getServing(product)?.unit) || t('addItem.servingsLabel');
  const unitLabel = product && unit === 'grams' ? t('addItem.gramsLabel') : servingLabel;

  const parsed = parseFloat(quantity.replace(',', '.'));
  const grams =
    product && !Number.isNaN(parsed) && parsed > 0 ? amountToGrams(product, parsed, unit) : null;

  const detail =
    selected.kind === 'savedMeal'
      ? t('addItem.wholeMeal')
      : grams != null && unit === 'servings'
        ? t('addItem.gramsAmount', { grams: formatGrams(grams) })
        : product
          ? servingFormat.perServing(product)
          : null;

  const hasQuantity = selected.kind !== 'savedMeal';
  const showUnitToggle = unitOptions.length > 1 && product;
  const values = nutrition ?? EMPTY_NUTRITION;

  return (
    <View style={styles.panel}>
      <View style={[styles.headerRow, dir.row]}>
        <View style={styles.headerText}>
          <Text style={[styles.name, dir.text]} numberOfLines={1}>
            {selected.item.name}
          </Text>
          {detail ? (
            <Text style={[styles.detail, dir.text]} numberOfLines={1}>
              {detail}
            </Text>
          ) : null}
        </View>

        <IconButton
          icon="close"
          size={40}
          iconSize={20}
          accessibilityLabel={t('addItem.deselect', { name: selected.item.name })}
          onPress={onDeselect}
        />
      </View>

      <NutritionGrid
        calories={values.calories}
        macros={values}
        style={!nutrition ? styles.nutritionMuted : undefined}
      />

      {hasQuantity ? (
        <View style={[styles.controlsRow, dir.row]}>
          <View style={[styles.stepper, dir.row]}>
            <IconButton
              icon="minus"
              variant="tonal"
              size={44}
              iconSize={20}
              accessibilityLabel={t('addItem.decrease')}
              onPress={() => onStep(-1)}
            />
            <TextInput
              style={styles.quantityInput}
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={onChangeQuantity}
              selectTextOnFocus
              textAlign="center"
              accessibilityLabel={unitLabel}
            />
            <IconButton
              icon="plus"
              variant="tonal"
              size={44}
              iconSize={20}
              accessibilityLabel={t('addItem.increase')}
              onPress={() => onStep(1)}
            />
          </View>

          {showUnitToggle ? (
            <SegmentedControl
              size="sm"
              style={styles.unitToggle}
              options={unitOptions.map((option) => ({
                value: option,
                label: option === 'servings' ? servingLabel : t('addItem.gramsLabel'),
              }))}
              value={unit}
              onChange={onChangeUnit}
            />
          ) : (
            <Text style={[styles.unitLabel, dir.text]} numberOfLines={2}>
              {unitLabel}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      panel: {
        gap: spacing.ms,
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
        ...typography.headline,
        color: colors.textPrimary,
      },
      detail: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
      nutritionMuted: {
        opacity: 0.4,
      },
      controlsRow: {
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.ms,
      },
      stepper: {
        alignItems: 'center',
        gap: spacing.xs,
      },
      quantityInput: {
        borderRadius: radius.md,
        width: 80,
        height: 44,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.inputBackground,
        ...typography.value,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
        textAlign: 'center',
        paddingHorizontal: spacing.xs,
      },
      unitToggle: {
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 168,
      },
      unitLabel: {
        flex: 1,
        ...typography.callout,
        color: colors.textSecondary,
      },
    }),
  );
