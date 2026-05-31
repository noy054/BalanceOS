import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSavedMeal, useDeleteSavedMeal } from '../hooks/useSavedMeals';
import { NutritionTotals } from '../components/NutritionTotals';
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

type Props = { id: string };

export function SavedMealDetailScreen({ id }: Props) {
  const { t } = useTranslation('pantry');
  const { data: meal, isLoading } = useSavedMeal(id);
  const deleteMeal = useDeleteSavedMeal();

  function handleDelete() {
    Alert.alert(
      t('savedMeal.deleteConfirmTitle'),
      t('savedMeal.deleteConfirmMessage'),
      [
        { text: t('savedMeal.deleteConfirmNo'), style: 'cancel' },
        {
          text: t('savedMeal.deleteConfirmYes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeal.mutateAsync(id);
              router.back();
            } catch {
              Alert.alert('', t('errors.deleteSavedMealFailed'));
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

  if (!meal) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('errors.loadSavedMealsFailed')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mealTypeLabel = meal.mealType
    ? t(`mealTypes.${meal.mealType}` as Parameters<typeof t>[0])
    : null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{meal.name}</Text>
        <Pressable onPress={handleDelete} hitSlop={12} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {mealTypeLabel ? (
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{mealTypeLabel}</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>{t('savedMealDetail.totalsSection')}</Text>
        <View style={styles.card}>
          <NutritionTotals totals={meal.totals} variant="highlight" />
        </View>

        <Text style={styles.sectionTitle}>{t('savedMealDetail.itemsSection')}</Text>
        <View style={styles.card}>
          {meal.items.map((item, index) => {
            const name = item.product?.name ?? item.recipe?.name ?? '—';
            const detail = item.product
              ? `${item.grams} ${t('recipe.gramsLabel')}`
              : `${item.servings} ${t('savedMeal.servingsLabel')}`;

            return (
              <View
                key={item.id}
                style={[styles.itemRow, index < meal.items.length - 1 && styles.rowBorder]}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{name}</Text>
                  <Text style={styles.itemDetail}>{detail}</Text>
                </View>
                <Text style={styles.itemCals}>
                  {item.nutrition.calories} {t('product.calUnit')}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 14, color: colors.textMuted },
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
  deleteBtn: { padding: spacing.xs },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  badgeRow: { alignItems: 'flex-end', marginBottom: spacing.sm },
  badge: {
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: { fontSize: 12, color: colors.primaryGreen, fontWeight: '600' },
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
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    ...cardShadow,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  itemDetail: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  itemCals: { fontSize: 14, fontWeight: '700', color: colors.primaryGreen, marginStart: spacing.sm },
});
