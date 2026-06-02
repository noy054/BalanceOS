import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ProductCatalogProduct } from '../types';
import { pantryApi } from '../api/pantryApi';
import { colors } from '../../../shared/theme';
import { styles } from './styles/ProductCatalogCard.styles';

type Props = {
  product: ProductCatalogProduct;
  onScanAnother: () => void;
};

function NutritionRow({
  label,
  value,
  unit,
  isRTL,
}: {
  label: string;
  value: number | null;
  unit: string;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.nutritionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[styles.nutritionLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
        {label}
      </Text>
      <Text style={styles.nutritionValue}>
        {value != null ? `${value % 1 === 0 ? value : value.toFixed(1)} ${unit}` : '—'}
      </Text>
    </View>
  );
}

export function ProductCatalogCard({ product, onScanAnother }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const [isAdding, setIsAdding] = useState(false);

  const isFromOFF =
    product.source === 'OPEN_FOOD_FACTS' ||
    product.verificationStatus === 'AUTO_IMPORTED';

  async function handleAddToPantry() {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await pantryApi.create({
        name: product.name,
        brand: product.brand ?? undefined,
        barcode: product.barcode ?? undefined,
        imageUrl: product.imageUrl ?? undefined,
        caloriesPer100g: product.caloriesPer100g ?? 0,
        proteinPer100g: product.proteinPer100g ?? 0,
        carbsPer100g: product.carbsPer100g ?? 0,
        fatPer100g: product.fatPer100g ?? 0,
        fiberPer100g: product.fiberPer100g ?? undefined,
      });
      router.back();
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 409) {
        Alert.alert('', t('barcode.alreadyInPantry'));
        router.back();
      } else {
        Alert.alert('', t('errors.saveFailed'));
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={colors.primaryGreen}
          />
        </View>
        <View style={styles.headerText}>
          <Text
            style={[styles.productName, { textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={2}
          >
            {product.name}
          </Text>
          {product.brand ? (
            <Text
              style={[styles.productBrand, { textAlign: isRTL ? 'right' : 'left' }]}
            >
              {product.brand}
            </Text>
          ) : null}
        </View>
      </View>

      {isFromOFF ? (
        <View style={[styles.offBanner, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <MaterialCommunityIcons
            name="information-outline"
            size={14}
            color={colors.textMuted}
          />
          <Text style={styles.offBannerText}>{t('barcode.fromOpenFoodFacts')}</Text>
        </View>
      ) : null}

      <View style={styles.nutritionSection}>
        <Text style={[styles.nutritionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('product.per100g')}
        </Text>
        <NutritionRow label={t('macros.calories')} value={product.caloriesPer100g} unit={t('product.calUnit')} isRTL={isRTL} />
        <NutritionRow label={t('macros.protein')} value={product.proteinPer100g} unit={t('product.gramsUnit')} isRTL={isRTL} />
        <NutritionRow label={t('macros.carbs')} value={product.carbsPer100g} unit={t('product.gramsUnit')} isRTL={isRTL} />
        <NutritionRow label={t('macros.fat')} value={product.fatPer100g} unit={t('product.gramsUnit')} isRTL={isRTL} />
        {product.fiberPer100g != null ? (
          <NutritionRow label={t('macros.fiber')} value={product.fiberPer100g} unit={t('product.gramsUnit')} isRTL={isRTL} />
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            pressed && styles.addBtnPressed,
            isAdding && styles.addBtnDisabled,
          ]}
          onPress={handleAddToPantry}
          disabled={isAdding}
        >
          <Text style={styles.addBtnText}>
            {isAdding ? '...' : t('barcode.addToPantry')}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.scanAnotherBtn, pressed && styles.scanAnotherBtnPressed]}
          onPress={onScanAnother}
        >
          <MaterialCommunityIcons name="barcode-scan" size={16} color={colors.textMuted} />
          <Text style={styles.scanAnotherBtnText}>{t('barcode.scanAnother')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
