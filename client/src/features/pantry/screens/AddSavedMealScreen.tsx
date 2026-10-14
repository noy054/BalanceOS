import {
  ActivityIndicator,
  Alert,
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
  useCreateSavedMeal,
  useSavedMeal,
  useUpdateSavedMeal,
} from "../hooks/useSavedMeals";
import { usePantryProducts } from "../hooks/usePantry";
import { useRecipes } from "../hooks/useRecipes";
import { useAddSavedMealForm } from "../hooks/useAddSavedMealForm";
import {
  ProductPickerModal,
  RecipePickerModal,
} from "../components/products/ProductPickerModal";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { SavedMealBasicInfoCard } from "../components/saved-meals/SavedMealBasicInfoCard";
import { SavedMealItemsCard } from "../components/saved-meals/SavedMealItemsCard";
import { ImagePickerCard } from "../components/shared/ImagePickerCard";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/AddSavedMealScreen.styles";

type RouteParams = {
  id?: string;
  mode?: string;
};

export function AddSavedMealScreen() {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const params = useLocalSearchParams<RouteParams>();
  const savedMealId = typeof params.id === "string" ? params.id : "";
  const isEditMode = params.mode === "edit" && Boolean(savedMealId);

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const createSavedMeal = useCreateSavedMeal();
  const updateSavedMeal = useUpdateSavedMeal(savedMealId);
  const { data: existingMeal, isLoading: isMealLoading } =
    useSavedMeal(savedMealId);

  const { data: products = [], loadMore: loadMoreProducts } = usePantryProducts();
  const { data: recipes = [] } = useRecipes();

  const form = useAddSavedMealForm(existingMeal, isEditMode);

  const isSaving = createSavedMeal.isPending || updateSavedMeal.isPending;

  async function handleSave() {
    if (!form.name.trim()) {
      form.setNameError(t("errors.requiredField"));
      return;
    }

    if (form.items.length === 0 || form.validItems.length === 0) {
      Alert.alert("", t("errors.noItems"));
      return;
    }

    const payload = {
      name: form.name.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      mealType: form.mealType ?? undefined,
      items: form.validItems,
    };

    try {
      if (isEditMode) {
        await updateSavedMeal.mutateAsync(payload);
      } else {
        await createSavedMeal.mutateAsync(payload);
      }

      router.back();
    } catch {
      Alert.alert(
        "",
        isEditMode
          ? t("errors.updateSavedMealFailed", {
              defaultValue: "שמירת השינויים נכשלה",
            })
          : t("errors.saveSavedMealFailed"),
      );
    }
  }

  if (isEditMode && isMealLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={styles.loadingText}>
            {t("savedMeal.loading", { defaultValue: "טוען ארוחה..." })}
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
            ? t("editSavedMeal.title", { defaultValue: "עריכת ארוחה שמורה" })
            : t("addSavedMeal.title")
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
              ? t("editSavedMeal.subtitle", {
                  defaultValue: "עדכני את פרטי הארוחה והמצרכים.",
                })
              : t("addSavedMeal.subtitle")}
          </Text>
        </View>

        <ImagePickerCard
          imageUrl={form.imageUrl}
          isRTL={isRTL}
          title={t("savedMeal.imageTitle", {
            defaultValue: "תמונה לארוחה",
          })}
          subtitle={t("savedMeal.imageSubtitle", {
            defaultValue: "אפשר להוסיף תמונה שתעזור לזהות מהר את הארוחה.",
          })}
          selectedSubtitle={t("savedMeal.imageSelected", {
            defaultValue: "התמונה תופיע בכרטיס הארוחה.",
          })}
          addLabel={t("savedMeal.addImage", {
            defaultValue: "הוספת תמונה",
          })}
          changeLabel={t("savedMeal.changeImage", {
            defaultValue: "החלפת תמונה",
          })}
          removeLabel={t("savedMeal.removeImage", {
            defaultValue: "הסרה",
          })}
          placeholderIcon="bookmark-outline"
          onChangeImage={form.setImageUrl}
          onRemoveImage={() => form.setImageUrl("")}
        />

        <SavedMealBasicInfoCard
          name={form.name}
          nameError={form.nameError}
          mealType={form.mealType}
          isRTL={isRTL}
          onChangeName={form.handleNameChange}
          onChangeMealType={form.setMealType}
        />

        <SavedMealItemsCard
          items={form.items}
          isRTL={isRTL}
          onChangeAmount={form.updateAmount}
          onRemoveItem={form.removeItem}
          onAddProduct={() => form.setProductPickerVisible(true)}
          onAddRecipe={() => form.setRecipePickerVisible(true)}
        />

        {form.hasTotals ? (
          <View style={styles.totalsContainer}>
            <NutritionTotals
              totals={form.liveTotals}
              label={t("savedMeal.totalsSection")}
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
              ? t("savedMeal.saving")
              : isEditMode
                ? t("savedMeal.updateButton", { defaultValue: "שמור שינויים" })
                : t("savedMeal.saveButton")}
          </Text>
        </Pressable>
      </View>

      <ProductPickerModal
        visible={form.productPickerVisible}
        products={products}
        onEndReached={loadMoreProducts}
        selectedIds={form.selectedProductIds}
        onSelect={form.addProduct}
        onClose={() => form.setProductPickerVisible(false)}
      />

      <RecipePickerModal
        visible={form.recipePickerVisible}
        recipes={recipes}
        onSelect={form.addRecipe}
        onClose={() => form.setRecipePickerVisible(false)}
      />
    </SafeAreaView>
  );
}
