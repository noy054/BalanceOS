import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { confirmAction } from "../../../shared/helpers/confirm";
import { router } from "expo-router";

import { useRecipe, useDeleteRecipe } from "../hooks/useRecipes";
import { useFoodCardModels, FOOD_ICONS } from "../hooks/useFoodCardModels";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { DetailHero } from "../components/food/DetailHero";
import { FoodLineItem } from "../components/food/FoodLineItem";
import { isAmbiguousName, useDuplicateNames } from "../helpers/duplicateNames";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { SectionHeader } from "../../../shared/components/ui/SectionHeader";
import { StateView } from "../../../shared/components/ui/StateView";
import { ActionSheet } from "../../../shared/components/ui/ActionSheet";
import { formatGrams } from "../../../shared/helpers/formatNumber";
import { useStyles } from "./styles/ItemDetailScreen.styles";
import { useServingFormat } from "../hooks/useServingFormat";

type Props = {
  id: string;
};

export function RecipeDetailScreen({ id }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const models = useFoodCardModels();
  const servingFormat = useServingFormat();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: recipe, isLoading } = useRecipe(id);
  const duplicateNames = useDuplicateNames(recipe?.items.map((item) => item.product.name) ?? []);
  const deleteRecipe = useDeleteRecipe();

  function handleEdit() {
    router.push({
      pathname: "/(app)/pantry/add-recipe",
      params: {
        id,
        mode: "edit",
      },
    });
  }

  async function handleDelete() {
    const confirmed = await confirmAction({
      title: t("recipe.deleteConfirmTitle"),
      message: t("recipe.deleteConfirmMessage"),
      confirmLabel: t("recipe.deleteConfirmYes"),
      cancelLabel: t("recipe.deleteConfirmNo"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteRecipe.mutateAsync(id);
      router.back();
    } catch {
      Alert.alert("", t("errors.deleteRecipeFailed"));
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("recipeDetail.title")} />
        <StateView variant="loading" />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("recipeDetail.title")} />
        <StateView variant="error" message={t("errors.loadRecipesFailed")} />
      </SafeAreaView>
    );
  }

  const model = models.recipe(recipe);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader
        title={t("recipeDetail.title")}
        rightIconName="dots-vertical"
        rightAccessibilityLabel={t("common.moreOptionsFor", { name: recipe.name })}
        onRightPress={() => setIsMenuOpen(true)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DetailHero
          title={recipe.name}
          meta={model.meta}
          description={recipe.description}
          imageUrl={model.imageUrl}
          fallbackIcon={FOOD_ICONS.recipe}
        />

        <View>
          <SectionHeader title={t("recipeDetail.totalsSection")} />
          <NutritionTotals totals={recipe.totals} label={t("foodCard.recipeTotal")} />
        </View>

        <View>
          <SectionHeader title={t("recipeDetail.ingredientsSection")} />

          <View style={styles.itemsCard}>
            {recipe.items.map((item, index) => {
              const product = item.product;
              const quantityText = servingFormat.amount(product, item);

              return (
                <FoodLineItem
                  key={item.id}
                  title={product.name}
                  meta={[quantityText, isAmbiguousName(duplicateNames, product.name) && product.brand]
                    .filter(Boolean)
                    .join(" · ")}
                  calories={item.nutrition.calories}
                  macros={item.nutrition}
                  last={index === recipe.items.length - 1}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      <ActionSheet
        visible={isMenuOpen}
        title={recipe.name}
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
            disabled: deleteRecipe.isPending,
            onPress: handleDelete,
          },
        ]}
      />
    </SafeAreaView>
  );
}
