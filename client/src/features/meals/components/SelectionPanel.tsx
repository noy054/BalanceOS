import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '../../../shared/components/ui/IconButton';
import { useDirection } from '../../../shared/hooks/useDirection';
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from '../../../shared/theme';
import { NutritionStrip } from '../../pantry/components/nutrition/NutritionStrip';
import { AmountUnit, getServing, hasServing, toAmountPayload } from '../../pantry/helpers/serving';
import { useServingFormat } from '../../pantry/hooks/useServingFormat';
import { CalculatedNutrition } from '../../pantry/types';
import { leftoverPortionQuantity, SelectedItem, SelectionUnit } from '../hooks/useMealSelection';
import { formatGrams } from '../../../shared/helpers/formatNumber';

type Props = {
  selected: SelectedItem;
  quantity: string;
  unit: SelectionUnit;
  unitOptions: SelectionUnit[];
  nutrition: CalculatedNutrition | null;
  onChangeQuantity: (value: string) => void;
  onChangeUnit: (unit: SelectionUnit) => void;
  onPickLeftover?: () => void;
  onStep: (direction: 1 | -1) => void;
  onDeselect: () => void;
  onQuantityFocusChange?: (focused: boolean) => void;
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
  onQuantityFocusChange,
  onPickLeftover,
}: Props) {
  const { t } = useTranslation('dashboard');
  const { t: tp } = useTranslation('pantry');
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();

  const product = selected.kind === 'product' ? selected.item : null;
  const servingLabel = (product && getServing(product)?.unit) || t('addItem.servingsLabel');
  const unitLabelOf = (option: SelectionUnit) =>
    option === 'grams'
      ? t('addItem.gramsLabel')
      : option === 'milliliters'
        ? tp('product.millilitersUnit')
        : option === 'portions'
          ? t('addItem.unitPortions')
          : selected.kind === 'recipe' ? t('addItem.unitBatch') : servingLabel;
  const recipe = selected.kind === 'recipe' ? selected.item : null;
  const leftoverQuantity = recipe ? leftoverPortionQuantity(recipe) : null;
  const portionGrams =
    recipe?.portionPlan?.status === 'ok' ? recipe.portionPlan.portion.grams : null;
  const recipeSummary = (value: number) =>
    unit === 'portions'
      ? `${t('meals.recipePortions', { count: value })}${portionGrams != null ? ` · ${t('meals.recipeGrams', { value: formatGrams(portionGrams * value) })}` : ''}`
      : unit === 'grams'
        ? t('meals.recipeGrams', { value: formatGrams(value) })
        : t('meals.recipeServings', { count: value });
  const leftoverGrams =
    recipe?.portionPlan?.status === 'ok' && recipe.portionPlan.leftover?.grams != null
      ? recipe.portionPlan.leftover.grams
      : null;

  const parsed = parseFloat(quantity.replace(',', '.'));
  const hasAmount = !Number.isNaN(parsed) && parsed > 0;
  const servingFormat = useServingFormat();
  const needsQuantity = Boolean(product && !hasServing(product));

  const summary =
    selected.kind === 'savedMeal'
      ? t('addItem.wholeMeal')
      : hasAmount
        ? product && unit !== 'portions'
          ? servingFormat.amount(product, toAmountPayload(product, parsed, unit))
          : recipe
            ? recipeSummary(parsed)
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
        <View style={[styles.controls, unitOptions.length > 2 ? styles.controlsStacked : dir.row]}>
          <View style={[styles.stepper, styles.stepperLtr]}>
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
              autoFocus={needsQuantity}
              onFocus={() => onQuantityFocusChange?.(true)}
              onBlur={() => onQuantityFocusChange?.(false)}
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

      {leftoverQuantity != null && onPickLeftover ? (
        <Pressable
          onPress={onPickLeftover}
          accessibilityRole="button"
          style={({ pressed }) => [styles.leftoverChip, dir.row, pressed && styles.leftoverPressed]}
        >
          <Text style={styles.leftoverText} numberOfLines={1}>
            {t('addItem.leftoverPick', {
              grams: leftoverGrams != null ? `${formatGrams(leftoverGrams)} ${t('addItem.gramsLabel')}` : `${formatGrams(leftoverQuantity)} ${t('addItem.portionsLabel')}`,
            })}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      leftoverChip: {
        alignSelf: 'flex-start',
        alignItems: 'center',
        minHeight: 34,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.round,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      leftoverPressed: {
        opacity: 0.75,
      },
      leftoverText: {
        ...typography.footnote,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
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
      controlsStacked: {
        flexDirection: 'column',
        alignItems: 'stretch',
      },
      stepperLtr: {
        flexDirection: "row",
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
        fontFamily: fonts.medium,
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
