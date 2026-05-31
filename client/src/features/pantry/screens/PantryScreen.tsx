import { useMemo, useState } from 'react';
import { View, FlatList, Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { PantryHeader } from '../components/PantryHeader';
import { PantrySearchBar } from '../components/PantrySearchBar';
import { PantryTabBar } from '../components/PantryTabBar';
import { ProductCard } from '../components/ProductCard';
import { RecipeCard } from '../components/RecipeCard';
import { SavedMealCard } from '../components/SavedMealCard';
import { PantryEmptyState } from '../components/PantryEmptyState';
import { BottomTabBar } from '../../../shared/components/BottomTabBar';
import { usePantryProducts } from '../hooks/usePantry';
import { useRecipes } from '../hooks/useRecipes';
import { useSavedMeals } from '../hooks/useSavedMeals';
import { PantryProduct, PantryRecipe, PantryTab, SavedMeal } from '../types';
import { colors, spacing, radius } from '../../../shared/theme';

export function PantryScreen() {
  const { t } = useTranslation('pantry');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<PantryTab>('products');

  const { data: products = [], isLoading: loadingProducts, isError: errorProducts } = usePantryProducts();
  const { data: recipes = [], isLoading: loadingRecipes, isError: errorRecipes } = useRecipes();
  const { data: savedMeals = [], isLoading: loadingSavedMeals, isError: errorSavedMeals } = useSavedMeals();

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes;
    const q = search.toLowerCase();
    return recipes.filter((r) => r.name.toLowerCase().includes(q));
  }, [recipes, search]);

  const filteredMeals = useMemo(() => {
    if (!search.trim()) return savedMeals;
    const q = search.toLowerCase();
    return savedMeals.filter((m) => m.name.toLowerCase().includes(q));
  }, [savedMeals, search]);

  function handleAdd() {
    if (activeTab === 'products') router.push('/(app)/pantry/add-product');
    else if (activeTab === 'recipes') router.push('/(app)/pantry/add-recipe');
    else router.push('/(app)/pantry/add-saved-meal');
  }

  function handleScanBarcode() {
    router.push('/(app)/pantry/barcode');
  }

  function addLabel() {
    if (activeTab === 'products') return t('actions.addProduct');
    if (activeTab === 'recipes') return t('actions.addRecipe');
    return t('actions.addSavedMeal');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <PantryHeader />

      <View style={styles.searchRow}>
        <PantrySearchBar value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionBtn} onPress={handleAdd}>
          <MaterialCommunityIcons name="plus" size={16} color={colors.cardBackground} />
          <Text style={styles.actionBtnText}>{addLabel()}</Text>
        </Pressable>
        {activeTab === 'products' ? (
          <Pressable style={[styles.actionBtn, styles.actionBtnOutline]} onPress={handleScanBarcode}>
            <MaterialCommunityIcons name="barcode-scan" size={16} color={colors.primaryGreen} />
            <Text style={[styles.actionBtnText, styles.actionBtnTextOutline]}>
              {t('actions.scanBarcode')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <PantryTabBar activeTab={activeTab} onTabPress={setActiveTab} />

      <View style={styles.content}>
        {activeTab === 'products' && (
          <TabContent
            isLoading={loadingProducts}
            isError={errorProducts}
            isEmpty={filteredProducts.length === 0}
            errorKey="errors.loadFailed"
            tab="products"
          >
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={(p: PantryProduct) => router.push(`/(app)/pantry/${p.id}`)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </TabContent>
        )}

        {activeTab === 'recipes' && (
          <TabContent
            isLoading={loadingRecipes}
            isError={errorRecipes}
            isEmpty={filteredRecipes.length === 0}
            errorKey="errors.loadRecipesFailed"
            tab="recipes"
          >
            <FlatList
              data={filteredRecipes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RecipeCard
                  recipe={item}
                  onPress={(r: PantryRecipe) => router.push(`/(app)/pantry/recipes/${r.id}`)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </TabContent>
        )}

        {activeTab === 'savedMeals' && (
          <TabContent
            isLoading={loadingSavedMeals}
            isError={errorSavedMeals}
            isEmpty={filteredMeals.length === 0}
            errorKey="errors.loadSavedMealsFailed"
            tab="savedMeals"
          >
            <FlatList
              data={filteredMeals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SavedMealCard
                  meal={item}
                  onPress={(m: SavedMeal) => router.push(`/(app)/pantry/saved-meals/${m.id}`)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </TabContent>
        )}
      </View>

      <BottomTabBar activeTab="pantry" />
    </SafeAreaView>
  );
}

function TabContent({
  isLoading,
  isError,
  isEmpty,
  errorKey,
  tab,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorKey: string;
  tab: PantryTab;
  children: React.ReactNode;
}) {
  const { t } = useTranslation('pantry');
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t(errorKey as Parameters<typeof t>[0])}</Text>
      </View>
    );
  }
  if (isEmpty) return <PantryEmptyState tab={tab} />;
  return <>{children}</>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchRow: { marginBottom: spacing.sm },
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  actionBtnOutline: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: colors.cardBackground },
  actionBtnTextOutline: { color: colors.primaryGreen },
  content: { flex: 1, marginTop: spacing.sm },
  listContent: { paddingTop: spacing.xs, paddingBottom: spacing.xl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
