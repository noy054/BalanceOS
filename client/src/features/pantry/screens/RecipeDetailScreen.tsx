import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useRecipe, useDeleteRecipe } from "../hooks/useRecipes";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { useAppTheme } from "../../../shared/theme";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/RecipeDetailScreen.styles";

type Props = {
  id: string;
};

function roundValue(value: number | null | undefined) {
  return Math.round(Number(value || 0) * 10) / 10;
}

export function RecipeDetailScreen({ id }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const { data: recipe, isLoading } = useRecipe(id);
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

  function handleDelete() {
    Alert.alert(
      t("recipe.deleteConfirmTitle"),
      t("recipe.deleteConfirmMessage"),
      [
        {
          text: t("recipe.deleteConfirmNo"),
          style: "cancel",
        },
        {
          text: t("recipe.deleteConfirmYes"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecipe.mutateAsync(id);
              router.back();
            } catch {
              Alert.alert("", t("errors.deleteRecipeFailed"));
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("errors.loadRecipesFailed")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mealTypeLabel = recipe.mealType
    ? t(`mealTypes.${recipe.mealType}` as Parameters<typeof t>[0])
    : null;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={recipe.name} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.actionsRow, dir.row]}>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
            ]}
            onPress={handleEdit}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color={colors.primaryGreen}
            />

            <Text style={styles.actionBtnText}>
              {t("common.edit", { defaultValue: "עריכה" })}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionBtnDanger,
              pressed && styles.actionBtnPressed,
            ]}
            onPress={handleDelete}
            disabled={deleteRecipe.isPending}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color={colors.danger}
            />

            <Text style={styles.actionBtnDangerText}>
              {t("common.delete", { defaultValue: "מחיקה" })}
            </Text>
          </Pressable>
        </View>

        {mealTypeLabel ? (
          <View style={[styles.badgeRow, dir.badgeRow]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{mealTypeLabel}</Text>
            </View>
          </View>
        ) : null}

        {recipe.description ? (
          <View style={styles.descriptionCard}>
            <Text style={[styles.descriptionText, dir.text]}>
              {recipe.description}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dir.text]}>
            {t("recipeDetail.totalsSection")}
          </Text>

          <View style={styles.totalsCard}>
            <NutritionTotals totals={recipe.totals} variant="highlight" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dir.text]}>
            {t("recipeDetail.ingredientsSection")}
          </Text>

          <View style={styles.itemsCard}>
            {recipe.items.map((item, index) => {
              const product = item.product;
              const servingSize = product.servingSizeG;
              const hasServing = servingSize != null && servingSize > 0;

              const servings = hasServing
                ? Math.round((item.grams / servingSize!) * 10) / 10
                : null;

              const quantityText = hasServing
                ? `${servings} ${t("recipe.servingsLabel")}`
                : `${item.grams} ${t("recipe.gramsLabel")}`;

              const servingHint = hasServing
                ? `${t("addProduct.perServing")} = ${servingSize}${t(
                    "product.gramsUnit",
                  )}`
                : null;

              const calories = roundValue(item.nutrition.calories);
              const protein = roundValue(item.nutrition.protein);
              const carbs = roundValue(item.nutrition.carbs);
              const fat = roundValue(item.nutrition.fat);
              const fiber = roundValue(item.nutrition.fiber);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    dir.row,
                    index < recipe.items.length - 1 && styles.rowBorder,
                  ]}
                >
                  <View style={styles.imageBox}>
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons
                          name="food-apple-outline"
                          size={24}
                          color={colors.primaryGreen}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <View style={[styles.itemTopRow, dir.row]}>
                      <View style={styles.itemNameBox}>
                        <Text
                          style={[styles.itemName, dir.text]}
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>

                        {product.brand ? (
                          <Text
                            style={[styles.itemBrand, dir.text]}
                            numberOfLines={1}
                          >
                            {product.brand}
                          </Text>
                        ) : null}

                        {servingHint ? (
                          <Text
                            style={[styles.servingHint, dir.text]}
                            numberOfLines={1}
                          >
                            {servingHint}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityBadgeText}>
                          {quantityText}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.valuesRow, dir.row]}>
                      <View style={styles.caloriePill}>
                        <Text style={styles.calorieValue}>
                          {calories} {t("product.calUnit")}
                        </Text>
                      </View>

                      <View style={styles.valuePill}>
                        <Text style={styles.valuePillText}>
                          {protein} {t("product.gramsUnit")}{" "}
                          {t("macros.protein")}
                        </Text>
                      </View>

                      <View style={styles.valuePill}>
                        <Text style={styles.valuePillText}>
                          {carbs} {t("product.gramsUnit")} {t("macros.carbs")}
                        </Text>
                      </View>

                      <View style={styles.valuePill}>
                        <Text style={styles.valuePillText}>
                          {fat} {t("product.gramsUnit")} {t("macros.fat")}
                        </Text>
                      </View>

                      {fiber > 0 ? (
                        <View style={styles.valuePill}>
                          <Text style={styles.valuePillText}>
                            {fiber} {t("product.gramsUnit")} {t("macros.fiber")}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
