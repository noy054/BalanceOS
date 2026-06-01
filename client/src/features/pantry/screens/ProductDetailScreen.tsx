import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { usePantryProduct, useDeletePantryProduct } from '../hooks/usePantry';
import { calculateNutritionForGrams } from '../helpers/nutrition';
import { CalculatedNutrition } from '../types';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { colors, spacing } from '../../../shared/theme';
import { styles, rowStyles, getDirectionStyles } from './styles/ProductDetailScreen.styles';

type Props = {
  id: string;
};

export function ProductDetailScreen({ id }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const { data: product, isLoading } = usePantryProduct(id);
  const deleteProduct = useDeletePantryProduct();
  const [grams, setGrams] = useState('');
  const [calcResult, setCalcResult] = useState<CalculatedNutrition | null>(null);

  function handleCalculate() {
    const g = parseFloat(grams.replace(',', '.'));
    if (!product || isNaN(g) || g <= 0) return;
    setCalcResult(calculateNutritionForGrams(product, g));
  }

  function handleDelete() {
    Alert.alert(
      t('productDetail.deleteConfirmTitle'),
      t('productDetail.deleteConfirmMessage'),
      [
        { text: t('productDetail.deleteConfirmNo'), style: 'cancel' },
        {
          text: t('productDetail.deleteConfirmYes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct.mutateAsync(id);
              router.back();
            } catch {
              Alert.alert('', t('errors.deleteFailed'));
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('errors.loadFailed')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const headerRight = (
    <View style={[styles.headerActions, dir.row]}>
      <Pressable onPress={() => { /* TODO: edit */ }} hitSlop={12} style={styles.headerActionBtn}>
        <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.primaryGreen} />
      </Pressable>
      <Pressable onPress={handleDelete} hitSlop={12} style={styles.headerActionBtn}>
        <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={product.name} rightElement={headerRight} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {product.brand ? (
          <Text style={[{ fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs }, dir.text]}>
            {product.brand}
          </Text>
        ) : null}
        {product.barcode ? (
          <View style={[styles.barcodeRow, dir.row]}>
            <MaterialCommunityIcons name="barcode" size={16} color={colors.textMuted} />
            <Text style={styles.barcodeText}>{product.barcode}</Text>
          </View>
        ) : null}

        <Text style={[{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md, paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border }, dir.text]}>
          {t('productDetail.nutritionSection')}
        </Text>
        <View style={styles.nutritionCard}>
          <NutritionRow
            label={t('macros.calories')}
            value={product.caloriesPer100g}
            unit={t('product.calUnit')}
            highlight
            isRTL={isRTL}
          />
          <NutritionRow label={t('macros.protein')} value={product.proteinPer100g} unit={t('product.gramsUnit')} isRTL={isRTL} />
          <NutritionRow label={t('macros.carbs')} value={product.carbsPer100g} unit={t('product.gramsUnit')} isRTL={isRTL} />
          <NutritionRow label={t('macros.fat')} value={product.fatPer100g} unit={t('product.gramsUnit')} isRTL={isRTL} />
          {product.fiberPer100g != null ? (
            <NutritionRow label={t('macros.fiber')} value={product.fiberPer100g} unit={t('product.gramsUnit')} last isRTL={isRTL} />
          ) : null}
        </View>

        <Text style={[{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md, paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border }, dir.text]}>
          {t('productDetail.calculator')}
        </Text>
        <Text style={[styles.calcHint, dir.text]}>{t('productDetail.calculatorHint')}</Text>
        <View style={[styles.calcRow, dir.row]}>
          <TextInput
            style={styles.calcInput}
            value={grams}
            onChangeText={(v) => { setGrams(v); setCalcResult(null); }}
            placeholder={t('productDetail.calculatorPlaceholder')}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            textAlign={isRTL ? 'right' : 'left'}
          />
          <Pressable style={styles.calcBtn} onPress={handleCalculate}>
            <MaterialCommunityIcons name="calculator" size={20} color={colors.cardBackground} />
          </Pressable>
        </View>

        {calcResult ? (
          <View style={styles.calcResultCard}>
            <Text style={[styles.calcResultTitle, dir.text]}>{t('productDetail.calculatorResult')}</Text>
            <NutritionRow label={t('macros.calories')} value={calcResult.calories} unit={t('product.calUnit')} highlight isRTL={isRTL} />
            <NutritionRow label={t('macros.protein')} value={calcResult.protein} unit={t('product.gramsUnit')} isRTL={isRTL} />
            <NutritionRow label={t('macros.carbs')} value={calcResult.carbs} unit={t('product.gramsUnit')} isRTL={isRTL} />
            <NutritionRow label={t('macros.fat')} value={calcResult.fat} unit={t('product.gramsUnit')} isRTL={isRTL} />
            {calcResult.fiber != null ? (
              <NutritionRow label={t('macros.fiber')} value={calcResult.fiber} unit={t('product.gramsUnit')} last isRTL={isRTL} />
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function NutritionRow({
  label,
  value,
  unit,
  highlight,
  last,
  isRTL,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
  last?: boolean;
  isRTL: boolean;
}) {
  return (
    <View style={[rowStyles.row, !last && rowStyles.rowBorder, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[rowStyles.label, highlight && rowStyles.labelHighlight]}>{label}</Text>
      <Text style={[rowStyles.value, highlight && rowStyles.valueHighlight]}>
        {value} <Text style={rowStyles.unit}>{unit}</Text>
      </Text>
    </View>
  );
}
