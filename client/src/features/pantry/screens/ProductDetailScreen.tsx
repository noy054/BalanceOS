import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
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
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

type Props = {
  id: string;
};

export function ProductDetailScreen({ id }: Props) {
  const { t } = useTranslation('pantry');
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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => { /* TODO: navigate to edit screen */ }}
            hitSlop={12}
            style={styles.headerActionBtn}
          >
            <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.primaryGreen} />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={12} style={styles.headerActionBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {product.brand ? (
          <Text style={styles.brand}>{product.brand}</Text>
        ) : null}
        {product.barcode ? (
          <View style={styles.barcodeRow}>
            <MaterialCommunityIcons name="barcode" size={16} color={colors.textMuted} />
            <Text style={styles.barcodeText}>{product.barcode}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>{t('productDetail.nutritionSection')}</Text>
        <View style={styles.nutritionCard}>
          <NutritionRow
            label={t('macros.calories')}
            value={product.caloriesPer100g}
            unit={t('product.calUnit')}
            highlight
          />
          <NutritionRow label={t('macros.protein')} value={product.proteinPer100g} unit={t('product.gramsUnit')} />
          <NutritionRow label={t('macros.carbs')} value={product.carbsPer100g} unit={t('product.gramsUnit')} />
          <NutritionRow label={t('macros.fat')} value={product.fatPer100g} unit={t('product.gramsUnit')} />
          {product.fiberPer100g != null ? (
            <NutritionRow label={t('macros.fiber')} value={product.fiberPer100g} unit={t('product.gramsUnit')} last />
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>{t('productDetail.calculator')}</Text>
        <Text style={styles.calcHint}>{t('productDetail.calculatorHint')}</Text>
        <View style={styles.calcRow}>
          <TextInput
            style={styles.calcInput}
            value={grams}
            onChangeText={(v) => { setGrams(v); setCalcResult(null); }}
            placeholder={t('productDetail.calculatorPlaceholder')}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            textAlign="right"
          />
          <Pressable style={styles.calcBtn} onPress={handleCalculate}>
            <MaterialCommunityIcons name="calculator" size={20} color={colors.cardBackground} />
          </Pressable>
        </View>

        {calcResult ? (
          <View style={styles.calcResultCard}>
            <Text style={styles.calcResultTitle}>{t('productDetail.calculatorResult')}</Text>
            <NutritionRow label={t('macros.calories')} value={calcResult.calories} unit={t('product.calUnit')} highlight />
            <NutritionRow label={t('macros.protein')} value={calcResult.protein} unit={t('product.gramsUnit')} />
            <NutritionRow label={t('macros.carbs')} value={calcResult.carbs} unit={t('product.gramsUnit')} />
            <NutritionRow label={t('macros.fat')} value={calcResult.fat} unit={t('product.gramsUnit')} />
            {calcResult.fiber != null ? (
              <NutritionRow label={t('macros.fiber')} value={calcResult.fiber} unit={t('product.gramsUnit')} last />
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
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[rowStyles.row, !last && rowStyles.rowBorder]}>
      <Text style={[rowStyles.label, highlight && rowStyles.labelHighlight]}>{label}</Text>
      <Text style={[rowStyles.value, highlight && rowStyles.valueHighlight]}>
        {value} <Text style={rowStyles.unit}>{unit}</Text>
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  labelHighlight: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  valueHighlight: {
    fontSize: 16,
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerActionBtn: {
    padding: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  brand: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  barcodeText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nutritionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...cardShadow,
  },
  calcHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  calcRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  calcInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
  },
  calcBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcResultCard: {
    backgroundColor: colors.primaryGreenLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  calcResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryGreen,
    textAlign: 'right',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryGreenMid,
  },
});
