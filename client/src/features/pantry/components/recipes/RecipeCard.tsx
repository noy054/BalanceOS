import { Image, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { PantryRecipe } from "../../types";
import { NutritionTotals } from "../nutrition/NutritionTotals";
import { useAppTheme } from "../../../../shared/theme";
import { getDirectionStyles, useStyles } from "./styles/RecipeCard.styles";

type Props = {
  recipe: PantryRecipe;
  onPress: (recipe: PantryRecipe) => void;
};

function getRecipeImageUrl(recipe: PantryRecipe) {
  return (
    recipe.items.find((item) => item.product?.imageUrl)?.product?.imageUrl ??
    null
  );
}

export function RecipeCard({ recipe, onPress }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const imageUrl = getRecipeImageUrl(recipe);

  const mealTypeLabel = recipe.mealType
    ? t(`mealTypes.${recipe.mealType}` as Parameters<typeof t>[0])
    : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(recipe)}
    >
      <View style={[styles.topRow, dir.row]}>
        <View style={styles.imageBox}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="chef-hat"
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
                {recipe.name}
              </Text>

              {recipe.description ? (
                <Text style={[styles.description, dir.text]} numberOfLines={1}>
                  {recipe.description}
                </Text>
              ) : null}

              <View style={[styles.metaRow, dir.row]}>
                {mealTypeLabel ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText} numberOfLines={1}>
                      {mealTypeLabel}
                    </Text>
                  </View>
                ) : null}

                <Text style={[styles.count, dir.text]} numberOfLines={1}>
                  {t("recipeDetail.itemsCount", {
                    count: recipe.items.length,
                    defaultValue: `${recipe.items.length} מצרכים`,
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
        <NutritionTotals totals={recipe.totals} />
      </View>
    </Pressable>
  );
}
