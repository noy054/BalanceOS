import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '../../../shared/components/ui/IconButton';
import { useDirection } from '../../../shared/hooks/useDirection';
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from '../../../shared/theme';
import { NutritionStrip } from '../../pantry/components/nutrition/NutritionStrip';
import { AmountUnit, getServing, hasServing, toAmountPayload } from '../../pantry/helpers/serving';
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
  const { t: tp } = useTranslation('pantry');
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();

  const product = selected.kind === 'product' ? selected.item : null;
  const servingLabel = (product && getServing(product)?.unit) || t('addItem.servingsLabel');
  const unitLabelOf = (option: AmountUnit) =>
    option === 'grams'
      ? t('addItem.gramsLabel')
      : option === 'milliliters'
        ? tp('product.millilitersUnit')
        : selected.kind === 'recipe' ? t('addItem.servingsLabel') : servingLabel;

  const parsed = parseFloat(quantity.replace(',', '.'));
  const hasAmount = !Number.isNaN(parsed) && parsed > 0;
  const servingFormat = useServingFormat();
  const needsQuantity = Boolean(product && !hasServing(product));

  const summary =
    selected.kind === 'savedMeal'
      ? t('addItem.wholeMeal')
      : hasAmount
        ? product
          ? servingFormat.amount(product, toAmountPayload(product, parsed, unit))
          : `${quantity} ${unitLabelOf(unit)}`
        : t('addItem.enterQuantity');

  const hasQuantity = selected.kind !== 'savedMeal';

  return (
    <View style={styles.panel}>
      <View style={[styles.header, dir.row]}>
        <View style={styles.headerText}>
          <Text style={[styles.name, dir.text]} numberOfLines={2}>
            {selected.item.name}
          </Text>
          <Text style={[styles.summary, !hasAmount && hasQuantity && styles.summaryPrompt, dir.text]} numberOfLines={1}>
            {summary}
          </Text>
        </View>
        <IconButton
          icon="close"
          size={36}
          iconSize={18}
          accessibilityLabel={t('addItem.deselect', { name: selected.item.name })}
          onPress={onDeselect}
        />
      </View>

      <NutritionStrip nutrition={nutrition} />

      {hasQuantity ? (
        <View style={[styles.controls, dir.row]}>
          <View style={[styles.stepper, dir.row]}>
            <IconButton
              icon="minus"
              variant="tonal"
              size={40}
              iconSize={18}
              accessibilityLabel={t('addItem.decrease')}
              onPress={() => onStep(-1)}
            />
            <TextInput
              style={[styles.quantityInput, !hasAmount && styles.quantityInputEmpty]}
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={onChangeQuantity}
              placeholder={t('addItem.quantityPlaceholder')}
              placeholderTextColor={colors.textMuted}
              selectTextOnFocus
              autoFocus={needsQuantity}
              textAlign="center"
              accessibilityLabel={`${selected.item.name}, ${unitLabelOf(unit)}`}
            />
            <IconButton
              icon="plus"
              variant="tonal"
              size={40}
              iconSize={18}
              accessibilityLabel={t('addItem.increase')}
              onPress={() => onStep(1)}
            />
          </View>

          {unitOptions.length > 1 ? (
            <View style={[styles.units, dir.row]} accessibilityRole="tablist">
              {unitOptions.map((option) => {
                const active = option === unit;
                return (
                  <Pressable
                    key={option}
                    onPress={() => onChangeUnit(option)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    style={[styles.unit, active && styles.unitActive]}
                  >
                    <Text style={[styles.unitText, active && styles.unitTextActive]} numberOfLines={1}>
                      {unitLabelOf(option)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={[styles.unitStatic, dir.row]}>
              <Text style={[styles.unitStaticText, dir.text]} numberOfLines={1}>
                {unitLabelOf(unit)}
              </Text>
            </View>
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
      header: {
        alignItems: 'flex-start',
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
      summary: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
      summaryPrompt: {
        color: colors.warning,
      },
      controls: {
        alignItems: 'center',
        gap: spacing.sm,
      },
      stepper: {
        alignItems: 'center',
        gap: spacing.xs,
      },
      quantityInput: {
        width: 72,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        ...typography.value,
        fontSize: 16,
        color: colors.textPrimary,
        textAlign: 'center',
        paddingHorizontal: spacing.xs,
      },
      quantityInputEmpty: {
        borderColor: colors.warning,
      },
      units: {
        flex: 1,
        minWidth: 0,
        padding: 3,
        gap: 3,
        borderRadius: radius.md,
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      unit: {
        flex: 1,
        minWidth: 0,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xs,
        borderRadius: radius.sm,
      },
      unitActive: {
        backgroundColor: colors.accentFill,
      },
      unitText: {
        ...typography.label,
        fontSize: 14,
        color: colors.textSecondary,
      },
      unitTextActive: {
        fontFamily: fonts.semibold,
        color: colors.onAccent,
      },
      unitStatic: {
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        gap: spacing.xs,
      },
      unitStaticText: {
        flexShrink: 1,
        ...typography.callout,
        color: colors.textSecondary,
      },
    }),
  );
