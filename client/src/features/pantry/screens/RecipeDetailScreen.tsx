import { Alert, ScrollView, Text, View } from "react-native";
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
import { RecipeStepsList } from "../components/recipes/RecipeStepsList";
import { StateView } from "../../../shared/components/ui/StateView";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { formatGrams } from "../../../shared/helpers/formatNumber";
import { useStyles } from "./styles/ItemDetailScreen.styles";
import { useServingFormat } from "../hooks/useServingFormat";
import { Button } from "../../../shared/components/ui/Button";
import { amountFromStored } from "../helpers/serving";

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
          <IconButton
            icon="trash-can-outline"
            iconSize={22}
            accessibilityLabel={t("common.deleteItem", { name: recipe.name })}
            onPress={handleDelete}
            disabled={deleteRecipe.isPending}
          />
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

        <Button
          label={t("recipeDetail.editButton")}
          icon="pencil-outline"
          variant="tonal"
          onPress={handleEdit}
          fullWidth
        />

        <View>
          <SectionHeader title={t("recipeDetail.totalsSection")} />
          <NutritionTotals totals={recipe.totals} label={t("foodCard.recipeTotal")} />
        </View>

        <View>
          <SectionHeader title={t("recipeDetail.ingredientsSection")} />
          <Text style={[styles.sectionHint, dir.text]}>{t("ingredientEdit.detailHint")}</Text>

          <View style={styles.itemsCard}>
            {recipe.items.map((item, index) => {
              const product = item.product;
              const quantityText = servingFormat.amount(product, item);

              return (
                <FoodLineItem
                  key={item.id}
                  title={product.name}
                  imageUrl={product.imageUrl}
                  fallbackIcon={FOOD_ICONS.product}
                  basis={quantityText}
                  meta={isAmbiguousName(duplicateNames, product.name) ? product.brand : null}
                  calories={item.nutrition.calories}
                  macros={item.nutrition}
                  last={index === recipe.items.length - 1}
                  onPress={() => {
                    const current = amountFromStored(product, item);
                    router.push({
                      pathname: "/(app)/pantry/[id]",
                      params: {
                        id: product.id,
                        ingredientOf: "recipe",
                        parentId: recipe.id,
                        itemId: item.id,
                        parentName: recipe.name,
                        amount: current.amount,
                        unit: current.unit,
                      },
                    });
                  }}
                  accessibilityHint={t("ingredientEdit.editHint")}
                />
              );
            })}
          </View>
        </View>

        {recipe.steps && recipe.steps.length > 0 ? (
          <View>
            <SectionHeader title={t("recipeDetail.stepsSection")} />
            <RecipeStepsList steps={recipe.steps} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
