import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useCreatePantryProduct } from '../hooks/usePantry';
import { CreatePantryProductPayload } from '../types';
import { colors, spacing, radius } from '../../../shared/theme';

type FormState = {
  name: string;
  brand: string;
  barcode: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
  fiberPer100g: string;
};

const INITIAL: FormState = {
  name: '',
  brand: '',
  barcode: '',
  caloriesPer100g: '',
  proteinPer100g: '',
  carbsPer100g: '',
  fatPer100g: '',
  fiberPer100g: '',
};

function parseNum(val: string): number | undefined {
  const n = parseFloat(val.replace(',', '.'));
  return isNaN(n) || n < 0 ? undefined : n;
}

export function AddProductScreen() {
  const { t } = useTranslation('pantry');
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const createProduct = useCreatePantryProduct();

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChangeText: (text: string) => {
        setForm((prev) => ({ ...prev, [key]: text }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
      },
    };
  }

  function validate(): CreatePantryProductPayload | null {
    const newErrors: typeof errors = {};

    if (!form.name.trim()) newErrors.name = t('errors.requiredField');

    const calories = parseNum(form.caloriesPer100g);
    if (calories === undefined) newErrors.caloriesPer100g = t('errors.invalidNumber');

    const protein = parseNum(form.proteinPer100g);
    if (protein === undefined) newErrors.proteinPer100g = t('errors.invalidNumber');

    const carbs = parseNum(form.carbsPer100g);
    if (carbs === undefined) newErrors.carbsPer100g = t('errors.invalidNumber');

    const fat = parseNum(form.fatPer100g);
    if (fat === undefined) newErrors.fatPer100g = t('errors.invalidNumber');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }

    const fiber = form.fiberPer100g.trim() ? parseNum(form.fiberPer100g) : undefined;

    return {
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      barcode: form.barcode.trim() || undefined,
      caloriesPer100g: calories!,
      proteinPer100g: protein!,
      carbsPer100g: carbs!,
      fatPer100g: fat!,
      fiberPer100g: fiber,
    };
  }

  async function handleSave() {
    const payload = validate();
    if (!payload) return;

    try {
      await createProduct.mutateAsync(payload);
      router.back();
    } catch {
      Alert.alert('', t('errors.saveFailed'));
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('addProduct.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t('addProduct.subtitle')}</Text>
        <Text style={styles.requiredHint}>{t('addProduct.requiredHint')}</Text>

        <FormField
          label={t('product.nameLabel')}
          error={errors.name}
          {...field('name')}
          autoFocus
        />
        <FormField label={t('product.brandLabel')} error={errors.brand} {...field('brand')} />
        <FormField label={t('product.barcodeLabel')} error={errors.barcode} {...field('barcode')} keyboardType="number-pad" />

        <Text style={styles.sectionTitle}>{t('addProduct.nutritionSection')}</Text>

        <FormField
          label={t('product.caloriesLabel')}
          error={errors.caloriesPer100g}
          {...field('caloriesPer100g')}
          keyboardType="decimal-pad"
        />
        <FormField
          label={t('product.proteinLabel')}
          error={errors.proteinPer100g}
          {...field('proteinPer100g')}
          keyboardType="decimal-pad"
        />
        <FormField
          label={t('product.carbsLabel')}
          error={errors.carbsPer100g}
          {...field('carbsPer100g')}
          keyboardType="decimal-pad"
        />
        <FormField
          label={t('product.fatLabel')}
          error={errors.fatPer100g}
          {...field('fatPer100g')}
          keyboardType="decimal-pad"
        />
        <FormField
          label={t('product.fiberLabel')}
          error={errors.fiberPer100g}
          {...field('fiberPer100g')}
          keyboardType="decimal-pad"
        />

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={createProduct.isPending}
        >
          <Text style={styles.saveBtnText}>
            {createProduct.isPending ? t('addProduct.saving') : t('addProduct.saveButton')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  autoFocus?: boolean;
};

function FormField({ label, value, onChangeText, error, keyboardType = 'default', autoFocus }: FormFieldProps) {
  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, error ? fieldStyles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        textAlign="right"
        returnKeyType="next"
      />
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  requiredHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cardBackground,
  },
});
