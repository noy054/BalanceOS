import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { PantryProduct } from '../types';
import { colors, spacing } from '../../../shared/theme';
import { styles, pillStyles, getDirectionStyles } from './styles/ProductCard.styles';

type Props = {
  product: PantryProduct;
  onPress: (product: PantryProduct) => void;
};

export function ProductCard({ product, onPress }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(product)}
    >
      <View style={[styles.mainRow, dir.row]}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          {product.brand ? (
            <Text style={styles.brand} numberOfLines={1}>
              {product.brand}
            </Text>
          ) : null}
          <View style={[styles.macroRow, dir.macroRow]}>
            <MacroPill label={`${product.caloriesPer100g}`} unit={t('product.calUnit')} bold isRTL={isRTL} />
            <MacroPill label={`${t('macros.protein')} ${product.proteinPer100g}`} unit={t('product.gramsUnit')} isRTL={isRTL} />
            <MacroPill label={`${t('macros.carbs')} ${product.carbsPer100g}`} unit={t('product.gramsUnit')} isRTL={isRTL} />
            <MacroPill label={`${t('macros.fat')} ${product.fatPer100g}`} unit={t('product.gramsUnit')} isRTL={isRTL} />
          </View>
        </View>
        <View style={styles.trailing}>
          {product.barcode ? (
            <MaterialCommunityIcons
              name="barcode"
              size={16}
              color={colors.textMuted}
              style={styles.barcodeIcon}
            />
          ) : null}
          <MaterialCommunityIcons
            name="chevron-left"
            size={20}
            color={colors.textMuted}
          />
        </View>
      </View>
    </Pressable>
  );
}

function MacroPill({
  label,
  unit,
  bold,
  isRTL,
}: {
  label: string;
  unit: string;
  bold?: boolean;
  isRTL: boolean;
}) {
  return (
    <View style={[pillStyles.pill, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[pillStyles.label, bold && pillStyles.labelBold]}>
        {label}
      </Text>
      <Text style={pillStyles.unit}> {unit}</Text>
    </View>
  );
}
