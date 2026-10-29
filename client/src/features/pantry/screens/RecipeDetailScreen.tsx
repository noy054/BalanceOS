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
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { formatGrams } from "../../../shared/helpers/formatNumber";
import { useStyles } from "./styles/ItemDetailScreen.styles";
import { useServingFormat } from "../hooks/useServingFormat";

type Props = {
  id: string;
};

export function RecipeDetailScreen({ id }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const models = useFoodCardModels();
  const servingFormat = useServingFormat();


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
        rightElement={
          <View style={[styles.headerActions, dir.row]}>
            <IconButton
              icon="pencil-outline"
              iconSize={22}
              accessibilityLabel={t("common.editItem", { name: recipe.name })}
              onPress={handleEdit}
            />
            <IconButton
              icon="trash-can-outline"
              iconSize={22}
              accessibilityLabel={t("common.deleteItem", { name: recipe.name })}
              onPress={handleDelete}
              disabled={deleteRecipe.isPending}
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
          title={recipe.name}
          meta={model.summary}
          tags={model.tags}
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
                  basis={quantityText}
                  meta={isAmbiguousName(duplicateNames, product.name) ? product.brand : null}
                  calories={item.nutrition.calories}
                  macros={item.nutrition}
                  last={index === recipe.items.length - 1}
                  onPress={() => router.push(`/(app)/pantry/${product.id}`)}
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
