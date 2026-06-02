import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { FormInput } from '../../../shared/components/FormInput';
import { useCreateProductCatalog } from '../hooks/useProductCatalog';
import { ProductCatalogProduct } from '../types';
import { colors } from '../../../shared/theme';
import { styles } from './styles/ManualProductCatalogForm.styles';

type Props = {
  barcode: string;
  onSuccess: (product: ProductCatalogProduct) => void;
  onCancel: () => void;
};

function parsePositive(val: string): number | undefined {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? undefined : n;
}

export function ManualProductCatalogForm({ barcode, onSuccess, onCancel }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const textAlign = isRTL ? 'right' : 'left';

  const createMutation = useCreateProductCatalog();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('errors.requiredField');
    if (!calories || parsePositive(calories) === undefined) errs.calories = t('errors.invalidNumber');
    if (!protein || parsePositive(protein) === undefined) errs.protein = t('errors.invalidNumber');
    if (!carbs || parsePositive(carbs) === undefined) errs.carbs = t('errors.invalidNumber');
    if (!fat || parsePositive(fat) === undefined) errs.fat = t('errors.invalidNumber');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || createMutation.isPending) return;
    try {
      const product = await createMutation.mutateAsync({
        barcode: barcode || undefined,
        name: name.trim(),
        brand: brand.trim() || undefined,
        caloriesPer100g: parsePositive(calories),
        proteinPer100g: parsePositive(protein),
        carbsPer100g: parsePositive(carbs),
        fatPer100g: parsePositive(fat),
        fiberPer100g: parsePositive(fiber),
      });
      onSuccess(product);
    } catch {
      Alert.alert('', t('errors.saveFailed'));
    }
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="pencil-plus-outline" size={20} color={colors.primaryGreen} />
        </View>
        <Text style={[styles.headerTitle, { textAlign }]}>
          {t('barcode.manualForm.title')}
        </Text>
      </View>

      {barcode ? (
        <View style={[styles.barcodeChip, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <MaterialCommunityIcons name="barcode" size={14} color={colors.textMuted} />
          <Text style={styles.barcodeText}>{barcode}</Text>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.form}
      >
        <FormInput
          label={t('barcode.manualForm.nameLabel')}
          value={name}
          onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
          error={errors.name}
          autoFocus
        />
        <FormInput
          label={t('barcode.manualForm.brandLabel')}
          value={brand}
          onChangeText={setBrand}
        />

        <Text style={[styles.sectionLabel, { textAlign }]}>
          {t('barcode.manualForm.nutritionSection')}
        </Text>

        <FormInput
          label={t('barcode.manualForm.caloriesLabel')}
          value={calories}
          onChangeText={(v) => { setCalories(v); setErrors((e) => ({ ...e, calories: '' })); }}
          error={errors.calories}
          keyboardType="decimal-pad"
        />
        <FormInput
          label={t('barcode.manualForm.proteinLabel')}
          value={protein}
          onChangeText={(v) => { setProtein(v); setErrors((e) => ({ ...e, protein: '' })); }}
          error={errors.protein}
          keyboardType="decimal-pad"
        />
        <FormInput
          label={t('barcode.manualForm.carbsLabel')}
          value={carbs}
          onChangeText={(v) => { setCarbs(v); setErrors((e) => ({ ...e, carbs: '' })); }}
          error={errors.carbs}
          keyboardType="decimal-pad"
        />
        <FormInput
          label={t('barcode.manualForm.fatLabel')}
          value={fat}
          onChangeText={(v) => { setFat(v); setErrors((e) => ({ ...e, fat: '' })); }}
          error={errors.fat}
          keyboardType="decimal-pad"
        />
        <FormInput
          label={t('barcode.manualForm.fiberLabel')}
          value={fiber}
          onChangeText={setFiber}
          keyboardType="decimal-pad"
        />
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && styles.submitBtnPressed,
            createMutation.isPending && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          <Text style={styles.submitBtnText}>
            {createMutation.isPending
              ? t('barcode.manualForm.saving')
              : t('barcode.manualForm.saveButton')}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
          onPress={onCancel}
        >
          <Text style={styles.cancelBtnText}>{t('barcode.manualForm.cancel')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
