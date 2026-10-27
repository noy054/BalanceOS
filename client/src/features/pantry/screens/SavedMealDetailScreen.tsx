import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useDeleteSavedMeal, useSavedMeal } from "../hooks/useSavedMeals";
import { useFoodCardModels, FOOD_ICONS } from "../hooks/useFoodCardModels";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { DetailHero } from "../components/food/DetailHero";
import { FoodLineItem } from "../components/food/FoodLineItem";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { SectionHeader } from "../../../shared/components/ui/SectionHeader";
import { StateView } from "../../../shared/components/ui/StateView";
import { ActionSheet } from "../../../shared/components/ui/ActionSheet";
import { formatGrams } from "../../../shared/helpers/formatNumber";
import { useStyles } from "./styles/ItemDetailScreen.styles";

type Props = {
  id: string;
};

export function SavedMealDetailScreen({ id }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const models = useFoodCardModels();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: meal, isLoading } = useSavedMeal(id);
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

  function confirmDelete() {
    Alert.alert(
      t("savedMeal.deleteTitle"),
      t("savedMeal.deleteMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: handleDelete,
        },
      ],
    );
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
        rightIconName="dots-vertical"
        rightAccessibilityLabel={t("common.moreOptionsFor", { name: meal.name })}
        onRightPress={() => setIsMenuOpen(true)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DetailHero
          title={meal.name}
          meta={model.meta}
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
              const isProduct = Boolean(item.product);
              const product = item.product;
              const recipe = item.recipe;

              const name = product?.name ?? recipe?.name ?? "—";

              const detail = isProduct
                ? t("foodCard.gramsQuantity", { grams: formatGrams(item.grams) })
                : t("foodCard.recipeServings", { count: item.servings ?? 0 });

              return (
                <FoodLineItem
                  key={item.id}
                  title={name}
                  meta={[detail, product?.brand].filter(Boolean).join(" · ")}
                  imageUrl={product?.imageUrl ?? null}
                  fallbackIcon={isProduct ? FOOD_ICONS.product : FOOD_ICONS.recipe}
                  calories={item.nutrition.calories}
                  macros={item.nutrition}
                  last={index === meal.items.length - 1}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      <ActionSheet
        visible={isMenuOpen}
        title={meal.name}
        onClose={() => setIsMenuOpen(false)}
        actions={[
          {
            key: "edit",
            label: t("common.edit"),
            icon: "pencil-outline",
            onPress: handleEdit,
          },
          {
            key: "delete",
            label: t("common.delete"),
            icon: "trash-can-outline",
            destructive: true,
            disabled: deleteMeal.isPending,
            onPress: confirmDelete,
          },
        ]}
      />
    </SafeAreaView>
  );
}
