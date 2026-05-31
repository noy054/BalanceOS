import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { PantryProduct } from '../types';
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

type Props = {
  product: PantryProduct;
  onPress: (product: PantryProduct) => void;
};

export function ProductCard({ product, onPress }: Props) {
  const { t } = useTranslation('pantry');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(product)}
    >
      <View style={styles.mainRow}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          {product.brand ? (
            <Text style={styles.brand} numberOfLines={1}>
              {product.brand}
            </Text>
          ) : null}
          <View style={styles.macroRow}>
            <MacroPill label={`${product.caloriesPer100g}`} unit={t('product.calUnit')} bold />
            <MacroPill label={`${t('macros.protein')} ${product.proteinPer100g}`} unit={t('product.gramsUnit')} />
            <MacroPill label={`${t('macros.carbs')} ${product.carbsPer100g}`} unit={t('product.gramsUnit')} />
            <MacroPill label={`${t('macros.fat')} ${product.fatPer100g}`} unit={t('product.gramsUnit')} />
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
}: {
  label: string;
  unit: string;
  bold?: boolean;
}) {
  return (
    <View style={pillStyles.pill}>
      <Text style={[pillStyles.label, bold && pillStyles.labelBold]}>
        {label}
      </Text>
      <Text style={pillStyles.unit}> {unit}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginEnd: spacing.xs,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: 11,
    color: colors.primaryGreen,
  },
  labelBold: {
    fontWeight: '700',
  },
  unit: {
    fontSize: 10,
    color: colors.primaryGreen,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.85,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  brand: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trailing: {
    alignItems: 'center',
    marginStart: spacing.sm,
  },
  barcodeIcon: {
    marginBottom: 4,
  },
});
