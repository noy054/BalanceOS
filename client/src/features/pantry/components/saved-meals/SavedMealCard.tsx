import { Image, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { SavedMeal } from "../../types";
import { NutritionTotals } from "../nutrition/NutritionTotals";
import { useAppTheme } from "../../../../shared/theme";
import { getDirectionStyles, useStyles } from "./styles/SavedMealCard.styles";

type Props = {
  meal: SavedMeal;
  onPress: (meal: SavedMeal) => void;
};

function getSavedMealImageUrl(meal: SavedMeal) {
  const productImage = meal.items.find((item) => item.product?.imageUrl)
    ?.product?.imageUrl;

  if (productImage) {
    return productImage;
  }

  const recipeProductImage = meal.items
    .flatMap((item) => item.recipe?.items ?? [])
    .find((item) => item.product?.imageUrl)?.product?.imageUrl;

  return recipeProductImage ?? null;
}

export function SavedMealCard({ meal, onPress }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const imageUrl = getSavedMealImageUrl(meal);

  const mealTypeLabel = meal.mealType
    ? t(`mealTypes.${meal.mealType}` as Parameters<typeof t>[0])
    : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(meal)}
    >
      <View style={[styles.topRow, dir.row]}>
        <View style={styles.imageBox}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.mealImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="bookmark-outline"
                size={25}
                color={colors.primaryGreen}
              />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={[styles.titleRow, dir.row]}>
            <View style={styles.titleBox}>
              <Text style={[styles.name, dir.text]} numberOfLines={1}>
                {meal.name}
              </Text>

              <View style={[styles.metaRow, dir.row]}>
                {mealTypeLabel ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText} numberOfLines={1}>
                      {mealTypeLabel}
                    </Text>
                  </View>
                ) : null}

                <Text style={[styles.count, dir.text]} numberOfLines={1}>
                  {t("savedMealDetail.itemsCount", {
                    count: meal.items.length,
                    defaultValue: `${meal.items.length} פריטים`,
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.chevronBox}>
              <MaterialCommunityIcons
                name={isRTL ? "chevron-left" : "chevron-right"}
                size={22}
                color={colors.textMuted}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.totalsBox}>
        <NutritionTotals totals={meal.totals} />
      </View>
    </Pressable>
  );
}
