import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { useAppTheme } from "../../../shared/theme";
import {
  useCreateRecipe,
  useRecipe,
  useUpdateRecipe,
} from "../hooks/useRecipes";
import { usePantryProducts } from "../hooks/usePantry";
import { RecipeIngredientPickerModal } from "../components/recipes/RecipeIngredientPickerModal";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { RecipeBasicInfoCard } from "../components/recipes/RecipeBasicInfoCard";
import { RecipeIngredientsCard } from "../components/recipes/RecipeIngredientsCard";
import { ImagePickerCard } from "../components/shared/ImagePickerCard";
import { useAddRecipeForm } from "../hooks/useAddRecipeForm";
import { getDirectionStyles, useStyles } from "./styles/AddRecipeScreen.styles";

type RouteParams = {
  id?: string;
  mode?: string;
};

type RecipeWithImage = {
  imageUrl?: string | null;
};

export function AddRecipeScreen() {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const params = useLocalSearchParams<RouteParams>();
  const recipeId = typeof params.id === "string" ? params.id : "";
  const isEditMode = params.mode === "edit" && Boolean(recipeId);

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe(recipeId);
  const { data: existingRecipe, isLoading: isRecipeLoading } =
    useRecipe(recipeId);

  const [pickerSearch, setPickerSearch] = useState("");
  const { data: products = [], loadMore: loadMoreProducts } = usePantryProducts(pickerSearch);

  const form = useAddRecipeForm(existingRecipe, isEditMode);
  const hydratedRecipeImageIdRef = useRef<string | null>(null);

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!isEditMode || !existingRecipe) {
      return;
    }

    if (hydratedRecipeImageIdRef.current === existingRecipe.id) {
      return;
    }

    hydratedRecipeImageIdRef.current = existingRecipe.id;
    setImageUrl((existingRecipe as RecipeWithImage).imageUrl ?? "");
  }, [existingRecipe, isEditMode]);

  const isSaving = createRecipe.isPending || updateRecipe.isPending;

  async function handleSave() {
    if (!form.name.trim()) {
      form.setNameError(t("errors.requiredField"));
      return;
    }

    if (form.ingredients.length === 0) {
      Alert.alert("", t("errors.noIngredients"));
      return;
    }

    if (form.validItems.length === 0) {
      Alert.alert("", t("errors.noIngredients"));
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      mealType: form.mealType ?? undefined,
      items: form.validItems,
    };

    try {
      if (isEditMode) {
        await updateRecipe.mutateAsync(payload);
      } else {
        await createRecipe.mutateAsync(payload);
      }

      router.back();
    } catch {
      Alert.alert(
        "",
        isEditMode
          ? t("errors.updateRecipeFailed")
          : t("errors.saveRecipeFailed"),
      );
    }
  }

  if (isEditMode && isRecipeLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={styles.loadingText}>
            {t("recipe.loading", { defaultValue: "טוען מתכון..." })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader
        title={
          isEditMode
            ? t("editRecipe.title", { defaultValue: "עריכת מתכון" })
            : t("addRecipe.title")
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Text style={[styles.subtitle, dir.text]}>
            {isEditMode
              ? t("editRecipe.subtitle", {
                  defaultValue: "עדכני את פרטי המתכון והמצרכים.",
                })
              : t("addRecipe.subtitle")}
          </Text>
        </View>

        <ImagePickerCard
          imageUrl={imageUrl}
          isRTL={isRTL}
          title={t("recipe.imageTitle", {
            defaultValue: "תמונה למתכון",
          })}
          subtitle={t("recipe.imageSubtitle", {
            defaultValue: "אפשר להוסיף תמונה שתעזור לזהות מהר את המתכון.",
          })}
          selectedSubtitle={t("recipe.imageSelected", {
            defaultValue: "התמונה תופיע בכרטיס המתכון.",
          })}
          addLabel={t("recipe.addImage", {
            defaultValue: "הוספת תמונה",
          })}
          changeLabel={t("recipe.changeImage", {
            defaultValue: "החלפת תמונה",
          })}
          removeLabel={t("recipe.removeImage", {
            defaultValue: "הסרה",
          })}
          placeholderIcon="chef-hat"
          onChangeImage={setImageUrl}
          onRemoveImage={() => setImageUrl("")}
        />

        <RecipeBasicInfoCard
          name={form.name}
          description={form.description}
          mealType={form.mealType}
          nameError={form.nameError}
          isRTL={isRTL}
          onChangeName={form.setName}
          onChangeDescription={form.setDescription}
          onChangeMealType={form.setMealType}
        />

        <RecipeIngredientsCard
          ingredients={form.ingredients}
          isRTL={isRTL}
          onChangeAmount={form.updateAmount}
          onToggleUnit={form.toggleUnit}
          onRemoveIngredient={form.removeIngredient}
          onAddIngredient={() => form.setPickerVisible(true)}
        />

        {form.hasTotals ? (
          <View style={styles.totalsContainer}>
            <NutritionTotals
              totals={form.liveTotals}
              label={t("recipe.totalsSection")}
              variant="highlight"
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
            isSaving && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving
              ? t("recipe.saving")
              : isEditMode
                ? t("recipe.updateButton", { defaultValue: "שמור שינויים" })
                : t("recipe.saveButton")}
          </Text>
        </Pressable>
      </View>

      <RecipeIngredientPickerModal
        visible={form.pickerVisible}
        products={products}
        onEndReached={loadMoreProducts}
        onSearchChange={setPickerSearch}
        onAdd={form.addIngredients}
        onClose={() => form.setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
