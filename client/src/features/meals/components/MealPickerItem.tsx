import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CategoryChips } from '../../../shared/components/CategoryChips';
import { ProductCategory } from '../../pantry/types';
import { MealPickerMacros, MealPickerBasis } from '../types';
import { getDirectionStyles, useStyles } from './styles/MealPickerItem.styles';

type Props = {
  name: string;
  subtitle?: string | null;
  categories?: ProductCategory[];
  macros: MealPickerMacros;
  basis?: MealPickerBasis | null;
  isSelected: boolean;
  isRTL: boolean;
  onPress: () => void;
};

type MacroCell = {
  key: keyof MealPickerMacros;
  unitKey: 'kcal' | 'grams';
};

const MACRO_CELLS: MacroCell[] = [
  { key: 'calories', unitKey: 'kcal' },
  { key: 'protein', unitKey: 'grams' },
  { key: 'carbs', unitKey: 'grams' },
  { key: 'fat', unitKey: 'grams' },
];

function formatValue(value: number) {
  return Math.round((value || 0) * 10) / 10;
}

export function MealPickerItem({
  name,
  subtitle,
  categories = [],
  macros,
  basis,
  isSelected,
  isRTL,
  onPress,
}: Props) {
  const { t } = useTranslation('dashboard');
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.headerRow, dir.row]}>
        <View style={styles.titleBox}>
          <Text style={[styles.name, dir.text]} numberOfLines={2}>
            {name}
          </Text>

          {subtitle ? (
            <Text style={[styles.subtitle, dir.text]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {basis ? (
          <View style={styles.basisBadge}>
            <Text style={styles.basisText} numberOfLines={1}>
              {t(`addItem.basis.${basis}`)}
            </Text>
          </View>
        ) : null}
      </View>

      {categories.length > 0 ? (
        <CategoryChips categories={categories} isRTL={isRTL} />
      ) : null}

      <View style={[styles.macrosRow, dir.row]}>
        {MACRO_CELLS.map(({ key, unitKey }) => {
          const isCalories = key === 'calories';

          return (
            <View
              key={key}
              style={[styles.macroCell, isCalories && styles.macroCellPrimary]}
            >
              <Text
                style={[styles.macroLabel, isCalories && styles.macroLabelPrimary]}
                numberOfLines={1}
              >
                {t(`addItem.macros.${key}`)}
              </Text>

              <Text
                style={[
                  styles.macroValue,
                  isCalories && styles.macroValuePrimary,
                  dir.writing,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {formatValue(macros[key])}
                <Text style={styles.macroUnit}> {t(`addItem.units.${unitKey}`)}</Text>
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
