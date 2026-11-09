import { useLayoutEffect, useState } from "react";
import { ScrollView, Alert, KeyboardAvoidingView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { confirmAction } from "../../../shared/helpers/confirm";
import { router, useNavigation } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { StateView } from "../../../shared/components/ui/StateView";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { CategoryChips } from "../../../shared/components/CategoryChips";
import { AddToMealPanel } from "../../meals/components/AddToMealPanel";
import { usePantryProduct, useDeletePantryProduct } from "../hooks/usePantry";
import { useProductCalculator } from "../hooks/useProductCalculator";
import { useProductUsageWarning } from "../hooks/useRecipes";
import { NutritionFactsCard } from "../components/nutrition/NutritionFactsCard";
import { DetailHero } from "../components/food/DetailHero";
import { FOOD_ICONS } from "../hooks/useFoodCardModels";
import { ProductCalculatorCard } from "../components/products/ProductCalculatorCard";
import { getDirectionStyles, useStyles } from "./styles/ProductDetailScreen.styles";
import { keyboardBehavior } from "../../../shared/components/ui/KeyboardAvoider";
import { Button } from "../../../shared/components/ui/Button";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAppTheme } from "../../../shared/theme";
import { IngredientContext, useIngredientQuantityUpdate } from "../hooks/useIngredientQuantityUpdate";

type Props = {
  id: string;
  ingredient?: IngredientContext | null;
};

export function ProductDetailScreen({ id, ingredient = null }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";

  const { data: product, isLoading } = usePantryProduct(id);
  const deleteProduct = useDeletePantryProduct();
  const recipeWarning = useProductUsageWarning();

  const calculator = useProductCalculator(
    product,
    ingredient ? { quantity: ingredient.amount, unit: ingredient.unit } : null,
  );
  const { colors } = useAppTheme();
  const ingredientUpdate = useIngredientQuantityUpdate(ingredient);

  async function handleUpdateIngredient() {
    if (!ingredient || !product || !calculator.result || ingredientUpdate.isSaving) return;
    const ok = await ingredientUpdate.apply(product, calculator.result.amount);
    if (!ok) {
      Alert.alert("", t("ingredientEdit.failed"));
      return;
    }
    if (router.canGoBack()) router.back();
  }
  const navigation = useNavigation();
  const [rulerActive, setRulerActive] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ fullScreenGestureEnabled: false });
  }, [navigation]);

  function handleRulerActive(active: boolean) {
    setRulerActive(active);
    navigation.setOptions({ gestureEnabled: !active });
  }

  function handleEdit() {
    router.push({
      pathname: "/(app)/pantry/add-product",
      params: {
        id,
        mode: "edit",
      },
    });
  }

  function navigateAfterDelete() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(app)/pantry");
  }

  async function handleDelete() {
    const warning = await recipeWarning(id);
    const confirmed = await confirmAction({
      title: t("productDetail.deleteConfirmTitle"),
      message: [t("productDetail.deleteConfirmMessage"), warning].filter(Boolean).join("\n\n"),
      confirmLabel: t("productDetail.deleteConfirmYes"),
      cancelLabel: t("productDetail.deleteConfirmNo"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteProduct.mutateAsync(id);
      navigateAfterDelete();
    } catch {
      Alert.alert("", t("errors.deleteFailed"));
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("productDetail.title")} fallbackRoute="/(app)/pantry" />
        <StateView variant="loading" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("productDetail.title")} fallbackRoute="/(app)/pantry" />
        <StateView variant="error" message={t("errors.loadFailed")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader
        title={ingredient ? t("ingredientEdit.title") : t("productDetail.title")}
        fallbackRoute="/(app)/pantry"
        rightElement={
          ingredient ? undefined : <View style={[styles.headerActions, getDirectionStyles(isRTL).row]}>
            <IconButton
              icon="pencil-outline"
              iconSize={22}
              accessibilityLabel={t("common.editItem", { name: product.name })}
              onPress={handleEdit}
            />
            <IconButton
              icon="trash-can-outline"
              iconSize={22}
              accessibilityLabel={t("common.deleteItem", { name: product.name })}
              onPress={handleDelete}
              disabled={deleteProduct.isPending}
            />
          </View>
        }
      />

      <KeyboardAvoidingView
        style={styles.scroll}
        behavior={keyboardBehavior}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!rulerActive}
        >
          {ingredient ? (
            <View style={[styles.contextBanner, getDirectionStyles(isRTL).row]}>
              <MaterialCommunityIcons
                name={ingredient.target === "recipe" ? "chef-hat" : "silverware-fork-knife"}
                size={18}
                color={colors.accent}
              />
              <Text style={[styles.contextText, getDirectionStyles(isRTL).text]} numberOfLines={2}>
                {ingredientUpdate.parentName
                  ? t(ingredient.target === "recipe" ? "ingredientEdit.inRecipe" : "ingredientEdit.inMeal", {
                      name: ingredientUpdate.parentName,
                    })
                  : t(ingredient.target === "recipe" ? "ingredientEdit.inRecipeUnnamed" : "ingredientEdit.inMealUnnamed")}
              </Text>
            </View>
          ) : null}

          <DetailHero
            title={product.name}
            meta={product.brand}
            imageUrl={product.imageUrl}
            fallbackIcon={FOOD_ICONS.product}
          >
            {(product.mealCategories ?? []).length > 0 ? (
              <CategoryChips categories={product.mealCategories ?? []} isRTL={isRTL} />
            ) : null}
          </DetailHero>

          <ProductCalculatorCard
            quantity={calculator.quantity}
            unit={calculator.unit}
            units={calculator.units}
            serving={product}
            result={calculator.result}
            isRTL={isRTL}
            t={t}
            onChangeQuantity={calculator.updateQuantity}
            onSelectUnit={calculator.selectUnit}
            onRulerActiveChange={handleRulerActive}
          >
            {calculator.units.length === 0 ? null : ingredient ? (
              <View style={styles.ingredientAction}>
                <Text style={[styles.ingredientHint, getDirectionStyles(isRTL).text]}>
                  {ingredient.mode === "saved"
                    ? t(ingredient.target === "recipe" ? "ingredientEdit.savedRecipeHint" : "ingredientEdit.savedMealHint")
                    : t(ingredient.target === "recipe" ? "ingredientEdit.recipeHint" : "ingredientEdit.mealHint")}
                </Text>
                <Button
                  label={t("ingredientEdit.update")}
                  icon="check"
                  onPress={handleUpdateIngredient}
                  loading={ingredientUpdate.isSaving}
                  disabled={!calculator.result || !ingredientUpdate.ready}
                  fullWidth
                />
                <Button
                  label={t("common.cancel")}
                  variant="ghost"
                  onPress={() => router.back()}
                  fullWidth
                />
              </View>
            ) : (
              <AddToMealPanel product={product} result={calculator.result} />
            )}
          </ProductCalculatorCard>

          <NutritionFactsCard product={product} t={t} isRTL={isRTL} />
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
