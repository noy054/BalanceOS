import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useCreateRecipe } from "../hooks/useRecipes";
import { usePantryProducts } from "../hooks/usePantry";
import { ProductPickerModal } from "../components/ProductPickerModal";
import { NutritionTotals } from "../components/NutritionTotals";
import { SavedMealTypeSelector } from "../components/SavedMealTypeSelector";
import { calcProductNutrition, sumNutrition } from "../helpers/nutrition";
import { MealType, PantryProduct } from "../types";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { colors } from "../../../shared/theme";
import { styles, getDirectionStyles } from "./styles/AddRecipeScreen.styles";

type IngredientDraft = {
  key: string;
  product: PantryProduct;
  grams: string;
};

function makeKey() {
  return Math.random().toString(36).slice(2);
}

export function AddRecipeScreen() {
  const { t, i18n } = useTranslation("pantry");
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const createRecipe = useCreateRecipe();
  const { data: products = [] } = usePantryProducts();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [nameError, setNameError] = useState("");

  const liveTotals = useMemo(() => {
    const items = ingredients
      .map((ing) => {
        const grams = parseFloat(ing.grams.replace(",", "."));

        if (!Number.isNaN(grams) && grams > 0) {
          return calcProductNutrition(ing.product, grams);
        }

        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return sumNutrition(items);
  }, [ingredients]);

  const selectedIngredientProductIds = ingredients.map((i) => i.product.id);

  function addIngredient(product: PantryProduct) {
    setIngredients((prev) => [
      ...prev,
      {
        key: makeKey(),
        product,
        grams: "100",
      },
    ]);
    // Picker stays open so multiple ingredients can be added in one session.
  }

  function updateGrams(key: string, grams: string) {
    setIngredients((prev) =>
      prev.map((ing) => (ing.key === key ? { ...ing, grams } : ing)),
    );
  }

  function removeIngredient(key: string) {
    setIngredients((prev) => prev.filter((ing) => ing.key !== key));
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError(t("errors.requiredField"));
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert("", t("errors.noIngredients"));
      return;
    }

    const validItems = ingredients
      .map((ing) => ({
        productId: ing.product.id,
        grams: parseFloat(ing.grams.replace(",", ".")),
      }))
      .filter((item) => !Number.isNaN(item.grams) && item.grams > 0);

    if (validItems.length === 0) {
      Alert.alert("", t("errors.noIngredients"));
      return;
    }

    try {
      await createRecipe.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        mealType: mealType ?? undefined,
        items: validItems,
      });

      router.back();
    } catch {
      Alert.alert("", t("errors.saveRecipeFailed"));
    }
  }

  const hasTotals = ingredients.some((ing) => {
    const grams = parseFloat(ing.grams.replace(",", "."));
    return !Number.isNaN(grams) && grams > 0;
  });

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("addRecipe.title")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Text style={[styles.subtitle, dir.text]}>
            {t("addRecipe.subtitle")}
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, dir.text]}>
              {t("recipe.nameLabel")}
            </Text>

            <TextInput
              style={[
                styles.input,
                nameError ? styles.inputError : null,
                dir.text,
              ]}
              value={name}
              onChangeText={(value) => {
                setName(value);
                setNameError("");
              }}
              autoFocus
            />

            {nameError ? (
              <Text style={[styles.errorText, dir.text]}>{nameError}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, dir.text]}>
              {t("recipe.descriptionLabel")}
            </Text>

            <TextInput
              style={[styles.input, styles.descriptionInput, dir.text]}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, dir.text]}>
              {t("recipe.categoryLabel")}
            </Text>

            <SavedMealTypeSelector
              selectedMealType={mealType}
              isRTL={isRTL}
              onSelect={setMealType}
            />
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={[styles.sectionTitle, dir.text]}>
            {t("recipe.ingredientsSection")}
          </Text>

          {ingredients.map((ing) => (
            <View key={ing.key} style={[styles.ingredientRow, dir.row]}>
              <View style={styles.ingredientInfo}>
                <Text
                  style={[styles.ingredientName, dir.text]}
                  numberOfLines={1}
                >
                  {ing.product.name}
                </Text>

                {ing.product.brand ? (
                  <Text
                    style={[styles.ingredientBrand, dir.text]}
                    numberOfLines={1}
                  >
                    {ing.product.brand}
                  </Text>
                ) : null}
              </View>

              <View style={[styles.gramsBox, dir.row]}>
                <TextInput
                  style={styles.gramsInput}
                  value={ing.grams}
                  onChangeText={(value) => updateGrams(ing.key, value)}
                  keyboardType="decimal-pad"
                  placeholder={t("recipe.gramsPlaceholder")}
                  placeholderTextColor={colors.textMuted}
                  textAlign="center"
                />

                <Text style={styles.gramsLabel}>{t("recipe.gramsLabel")}</Text>
              </View>

              <Pressable
                onPress={() => removeIngredient(ing.key)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.removeBtn,
                  pressed && styles.removeBtnPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.addIngredientBtn,
              pressed && styles.addIngredientBtnPressed,
            ]}
            onPress={() => setPickerVisible(true)}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color={colors.primaryGreen}
            />

            <Text style={styles.addIngredientText}>
              {t("recipe.addIngredient")}
            </Text>
          </Pressable>
        </View>

        {hasTotals ? (
          <View style={styles.totalsContainer}>
            <NutritionTotals
              totals={liveTotals}
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
            createRecipe.isPending && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={createRecipe.isPending}
        >
          <Text style={styles.saveBtnText}>
            {createRecipe.isPending
              ? t("recipe.saving")
              : t("recipe.saveButton")}
          </Text>
        </Pressable>
      </View>

      <ProductPickerModal
        visible={pickerVisible}
        products={products}
        selectedIds={selectedIngredientProductIds}
        onSelect={addIngredient}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
