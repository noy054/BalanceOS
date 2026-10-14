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

import { useDeleteSavedMeal, useSavedMeal } from "../hooks/useSavedMeals";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { useAppTheme } from "../../../shared/theme";
import {
  useStyles,
  getDirectionStyles,
} from "./styles/SavedMealDetailScreen.styles";

type Props = {
  id: string;
};

function roundValue(value: number | null | undefined) {
  return Math.round(Number(value || 0) * 10) / 10;
}

export function SavedMealDetailScreen({ id }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

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
      t("savedMeal.deleteTitle", { defaultValue: "מחיקת ארוחה" }),
      t("savedMeal.deleteMessage", {
        defaultValue: "האם למחוק את הארוחה השמורה?",
      }),
      [
        {
          text: t("common.cancel", { defaultValue: "ביטול" }),
          style: "cancel",
        },
        {
          text: t("common.delete", { defaultValue: "מחק" }),
          style: "destructive",
          onPress: handleDelete,
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

  if (!meal) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {t("errors.loadSavedMealsFailed")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const mealTypeLabel = meal.mealType
    ? t(`mealTypes.${meal.mealType}` as Parameters<typeof t>[0])
    : null;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={meal.name} />

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
            onPress={confirmDelete}
            disabled={deleteMeal.isPending}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dir.text]}>
            {t("savedMealDetail.totalsSection")}
          </Text>

          <View style={styles.totalsCard}>
            <NutritionTotals totals={meal.totals} variant="highlight" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dir.text]}>
            {t("savedMealDetail.itemsSection")}
          </Text>

          <View style={styles.itemsCard}>
            {meal.items.map((item, index) => {
              const isProduct = Boolean(item.product);
              const product = item.product;
              const recipe = item.recipe;

              const name = product?.name ?? recipe?.name ?? "—";
              const brand = product?.brand ?? null;
              const imageUrl = product?.imageUrl ?? null;

              const detail = isProduct
                ? `${item.grams} ${t("recipe.gramsLabel")}`
                : `${item.servings} ${t("savedMeal.servingsLabel")}`;

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
                    index < meal.items.length - 1 && styles.rowBorder,
                  ]}
                >
                  <View style={styles.imageBox}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons
                          name={isProduct ? "food-apple-outline" : "chef-hat"}
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
                          {name}
                        </Text>

                        {brand ? (
                          <Text
                            style={[styles.itemBrand, dir.text]}
                            numberOfLines={1}
                          >
                            {brand}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityBadgeText}>{detail}</Text>
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
