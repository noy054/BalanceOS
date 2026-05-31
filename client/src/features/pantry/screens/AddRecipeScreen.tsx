import { useState, useMemo } from 'react';
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
import { useCreateRecipe } from '../hooks/useRecipes';
import { usePantryProducts } from '../hooks/usePantry';
import { ProductPickerModal } from '../components/ProductPickerModal';
import { NutritionTotals } from '../components/NutritionTotals';
import { calcProductNutrition, sumNutrition } from '../helpers/nutrition';
import { PantryProduct } from '../types';
import { colors, spacing, radius } from '../../../shared/theme';

type IngredientDraft = {
  key: string;
  product: PantryProduct;
  grams: string;
};

function makeKey() {
  return Math.random().toString(36).slice(2);
}

export function AddRecipeScreen() {
  const { t } = useTranslation('pantry');
  const createRecipe = useCreateRecipe();
  const { data: products = [] } = usePantryProducts();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [nameError, setNameError] = useState('');

  const liveTotals = useMemo(() => {
    const items = ingredients
      .map((ing) => {
        const g = parseFloat(ing.grams);
        if (!isNaN(g) && g > 0) return calcProductNutrition(ing.product, g);
        return null;
      })
      .filter((n): n is NonNullable<typeof n> => n !== null);
    return sumNutrition(items);
  }, [ingredients]);

  function addIngredient(product: PantryProduct) {
    setIngredients((prev) => [...prev, { key: makeKey(), product, grams: '' }]);
    setPickerVisible(false);
  }

  function updateGrams(key: string, grams: string) {
    setIngredients((prev) =>
      prev.map((ing) => (ing.key === key ? { ...ing, grams } : ing)),
    );
  }

  function removeIngredient(key: string) {
    setIngredients((prev) => prev.filter((ing) => ing.key !== key));
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError(t('errors.requiredField'));
      return;
    }
    if (ingredients.length === 0) {
      Alert.alert('', t('errors.noIngredients'));
      return;
    }
    const validItems = ingredients
      .map((ing) => ({ productId: ing.product.id, grams: parseFloat(ing.grams) }))
      .filter((item) => !isNaN(item.grams) && item.grams > 0);
    if (validItems.length === 0) {
      Alert.alert('', t('errors.noIngredients'));
      return;
    }
    try {
      await createRecipe.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        items: validItems,
      });
      router.back();
    } catch {
      Alert.alert('', t('errors.saveRecipeFailed'));
    }
  }

  const hasTotals = ingredients.some((ing) => {
    const g = parseFloat(ing.grams);
    return !isNaN(g) && g > 0;
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('addRecipe.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t('addRecipe.subtitle')}</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('recipe.nameLabel')}</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            textAlign="right"
            autoFocus
          />
          {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('recipe.descriptionLabel')}</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            textAlign="right"
            multiline
          />
        </View>

        <Text style={styles.sectionTitle}>{t('recipe.ingredientsSection')}</Text>

        {ingredients.map((ing) => (
          <View key={ing.key} style={styles.ingredientRow}>
            <View style={styles.ingredientInfo}>
              <Text style={styles.ingredientName} numberOfLines={1}>{ing.product.name}</Text>
              {ing.product.brand ? (
                <Text style={styles.ingredientBrand}>{ing.product.brand}</Text>
              ) : null}
            </View>
            <TextInput
              style={styles.gramsInput}
              value={ing.grams}
              onChangeText={(v) => updateGrams(ing.key, v)}
              keyboardType="decimal-pad"
              placeholder={t('recipe.gramsPlaceholder')}
              placeholderTextColor={colors.textMuted}
              textAlign="center"
            />
            <Text style={styles.gramsLabel}>{t('recipe.gramsLabel')}</Text>
            <Pressable onPress={() => removeIngredient(ing.key)} hitSlop={8} style={styles.removeBtn}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addIngredientBtn} onPress={() => setPickerVisible(true)}>
          <Text style={styles.addIngredientText}>{t('recipe.addIngredient')}</Text>
        </Pressable>

        {hasTotals ? (
          <View style={styles.totalsContainer}>
            <NutritionTotals
              totals={liveTotals}
              label={t('recipe.totalsSection')}
              variant="highlight"
            />
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={createRecipe.isPending}
        >
          <Text style={styles.saveBtnText}>
            {createRecipe.isPending ? t('recipe.saving') : t('recipe.saveButton')}
          </Text>
        </Pressable>
      </ScrollView>

      <ProductPickerModal
        visible={pickerVisible}
        products={products}
        onSelect={addIngredient}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  fieldGroup: { marginBottom: spacing.md },
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
  inputError: { borderColor: '#EF4444' },
  fieldError: { fontSize: 12, color: '#EF4444', marginTop: spacing.xs, textAlign: 'right' },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  ingredientInfo: { flex: 1 },
  ingredientName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ingredientBrand: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  gramsInput: {
    width: 64,
    height: 36,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  gramsLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  removeBtn: { padding: spacing.xs },
  addIngredientBtn: {
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderStyle: 'dashed',
  },
  addIngredientText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  totalsContainer: { marginBottom: spacing.md },
  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveBtnPressed: { opacity: 0.85 },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cardBackground,
  },
});
