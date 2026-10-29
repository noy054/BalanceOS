import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { confirmAction } from "../../../shared/helpers/confirm";
import { router } from "expo-router";

import { useDeleteSavedMeal, useSavedMeal } from "../hooks/useSavedMeals";
import { useFoodCardModels, FOOD_ICONS } from "../hooks/useFoodCardModels";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { DetailHero } from "../components/food/DetailHero";
import { FoodLineItem } from "../components/food/FoodLineItem";
import { isAmbiguousName, useDuplicateNames } from "../helpers/duplicateNames";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { SectionHeader } from "../../../shared/components/ui/SectionHeader";
import { StateView } from "../../../shared/components/ui/StateView";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { formatGrams } from "../../../shared/helpers/formatNumber";
import { useStyles } from "./styles/ItemDetailScreen.styles";
import { useServingFormat } from "../hooks/useServingFormat";

type Props = {
  id: string;
};

export function SavedMealDetailScreen({ id }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const models = useFoodCardModels();
  const servingFormat = useServingFormat();


  const { data: meal, isLoading } = useSavedMeal(id);
  const duplicateNames = useDuplicateNames(
    meal?.items.map((item) => item.product?.name ?? item.recipe?.name ?? "") ?? [],
  );
  const deleteMeal = useDeleteSavedMeal();

  function handleEdit() {
    router.push({
      pathname: "/(app)/pantry/add-saved-meal",
      params: {
        id,
        mode: "edit",
      },
    });
  }

  async function handleDelete() {
    try {
      await deleteMeal.mutateAsync(id);
      router.back();
    } catch {
      Alert.alert("", t("errors.deleteSavedMealFailed"));
    }
  }

  async function confirmDelete() {
    const confirmed = await confirmAction({
      title: t("savedMeal.deleteTitle"),
      message: t("savedMeal.deleteMessage"),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (confirmed) handleDelete();
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("savedMealDetail.title")} />
        <StateView variant="loading" />
      </SafeAreaView>
    );
  }

  if (!meal) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("savedMealDetail.title")} />
        <StateView variant="error" message={t("errors.loadSavedMealsFailed")} />
      </SafeAreaView>
    );
  }

  const model = models.savedMeal(meal);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader
        title={t("savedMealDetail.title")}
        rightElement={
          <View style={[styles.headerActions, dir.row]}>
            <IconButton
              icon="pencil-outline"
              iconSize={22}
              accessibilityLabel={t("common.editItem", { name: meal.name })}
              onPress={handleEdit}
            />
            <IconButton
              icon="trash-can-outline"
              iconSize={22}
              accessibilityLabel={t("common.deleteItem", { name: meal.name })}
              onPress={confirmDelete}
              disabled={deleteMeal.isPending}
            />
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DetailHero
          title={meal.name}
          meta={model.summary}
          tags={model.tags}
          imageUrl={model.imageUrl}
          fallbackIcon={FOOD_ICONS.savedMeal}
        />

        <View>
          <SectionHeader title={t("savedMealDetail.totalsSection")} />
          <NutritionTotals totals={meal.totals} label={t("foodCard.mealTotal")} />
        </View>

        <View>
          <SectionHeader title={t("savedMealDetail.itemsSection")} />

          <View style={styles.itemsCard}>
            {meal.items.map((item, index) => {
              const product = item.product;
              const recipe = item.recipe;

              const name = product?.name ?? recipe?.name ?? "—";

              const detail = product
                ? servingFormat.amount(product, item)
                : t("foodCard.recipeServings", { count: item.servings ?? 0 });

              return (
                <FoodLineItem
                  key={item.id}
                  title={name}
                  basis={detail}
                  meta={product && isAmbiguousName(duplicateNames, product.name) ? product.brand : null}
                  calories={item.nutrition.calories}
                  macros={item.nutrition}
                  last={index === meal.items.length - 1}
                  onPress={
                    product
                      ? () => router.push(`/(app)/pantry/${product.id}`)
                      : recipe
                        ? () => router.push(`/(app)/pantry/recipes/${recipe.id}`)
                        : undefined
                  }
                  accessibilityHint={t("common.openDetailsHint")}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
