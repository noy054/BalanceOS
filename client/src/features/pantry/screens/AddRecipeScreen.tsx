import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
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
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/AddRecipeScreen.styles';

type IngredientDraft = {
  key: string;
  product: PantryProduct;
  grams: string;
};

function makeKey() {
  return Math.random().toString(36).slice(2);
}

export function AddRecipeScreen() {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

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
      <ScreenHeader title={t('addRecipe.title')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }, dir.text]}>
          {t('addRecipe.subtitle')}
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }, dir.text]}>
            {t('recipe.nameLabel')}
          </Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            textAlign={isRTL ? 'right' : 'left'}
            autoFocus
          />
          {nameError ? (
            <Text style={[{ fontSize: 12, color: colors.danger, marginTop: 4 }, dir.text]}>{nameError}</Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }, dir.text]}>
            {t('recipe.descriptionLabel')}
          </Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            textAlign={isRTL ? 'right' : 'left'}
            multiline
          />
        </View>

        <Text style={[{
          fontSize: 11,
          fontWeight: '700',
          color: colors.textMuted,
          marginBottom: 8,
          marginTop: 4,
          paddingBottom: 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }, dir.text]}>
          {t('recipe.ingredientsSection')}
        </Text>

        {ingredients.map((ing) => (
          <View key={ing.key} style={[styles.ingredientRow, dir.row]}>
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
