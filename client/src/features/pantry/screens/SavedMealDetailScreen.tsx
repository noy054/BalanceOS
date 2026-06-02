import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useDeleteSavedMeal, useSavedMeal } from "../hooks/useSavedMeals";
import { NutritionTotals } from "../components/NutritionTotals";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { colors } from "../../../shared/theme";
import {
  styles,
  getDirectionStyles,
} from "./styles/SavedMealDetailScreen.styles";

type Props = {
  id: string;
};

export function SavedMealDetailScreen({ id }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const { data: meal, isLoading } = useSavedMeal(id);
  const deleteMeal = useDeleteSavedMeal();

  function handleDelete() {
    Alert.alert(
      t("savedMeal.deleteConfirmTitle"),
      t("savedMeal.deleteConfirmMessage"),
      [
        { text: t("savedMeal.deleteConfirmNo"), style: "cancel" },
        {
          text: t("savedMeal.deleteConfirmYes"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMeal.mutateAsync(id);
              router.back();
            } catch {
              Alert.alert("", t("errors.deleteSavedMealFailed"));
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

  const deleteBtn = (
    <Pressable onPress={handleDelete} hitSlop={12} style={styles.deleteBtn}>
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={22}
        color={colors.danger}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={meal.name} rightElement={deleteBtn} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {mealTypeLabel ? (
          <View style={[styles.badgeRow, dir.badgeRow]}>
            <View style={[styles.badge, dir.badge]}>
              <Text style={[styles.badgeText, dir.badgeText]}>
                {mealTypeLabel}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, dir.sectionTitle]}>
          {t("savedMealDetail.itemsSection")}
        </Text>

        <View style={styles.card}>
          {meal.items.map((item, index) => {
            const name = item.product?.name ?? item.recipe?.name ?? "—";

            const detail = item.product
              ? `${item.grams} ${t("recipe.gramsLabel")}`
              : `${item.servings} ${t("savedMeal.servingsLabel")}`;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  dir.row,
                  index < meal.items.length - 1 && styles.rowBorder,
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, dir.text]} numberOfLines={1}>
                    {name}
                  </Text>

                  <Text style={[styles.itemDetail, dir.text]}>{detail}</Text>
                </View>

                <Text style={[styles.itemCals, dir.text]}>
                  {item.nutrition.calories} {t("product.calUnit")}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={[styles.sectionTitle, dir.text]}>
          {t("savedMealDetail.totalsSection")}
        </Text>

        <View style={styles.totalsCard}>
          <NutritionTotals totals={meal.totals} variant="highlight" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
