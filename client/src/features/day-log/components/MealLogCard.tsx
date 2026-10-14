import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { MealEntrySummary } from "../types";
import { useAppTheme } from "../../../shared/theme";
import { getDirectionStyles, useStyles } from "./styles/MealLogCard.styles";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type MealConfig = {
  labelKey: string;
  icon: IconName;
};

function getMealConfig(mealType: string): MealConfig {
  switch (mealType) {
    case "BREAKFAST":
      return { labelKey: "breakfast", icon: "coffee-outline" };
    case "LUNCH":
      return { labelKey: "lunch", icon: "silverware-fork-knife" };
    case "DINNER":
      return { labelKey: "dinner", icon: "food-outline" };
    default:
      return { labelKey: "snack", icon: "food-apple-outline" };
  }
}

const PREVIEW_LIMIT = 3;

type Props = {
  meal: MealEntrySummary;
  isRTL: boolean;
  onPress: (mealType: string) => void;
  onCopy?: (meal: MealEntrySummary) => void;
};

export function MealLogCard({ meal, isRTL, onPress, onCopy }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  const { labelKey, icon } = getMealConfig(meal.mealType);

  const shownItems = meal.items.slice(0, PREVIEW_LIMIT);
  const extraCount = Math.max(meal.items.length - PREVIEW_LIMIT, 0);

  const previewText =
    shownItems.map((item) => item.name).join(" · ") +
    (extraCount > 0
      ? ` · ${t("meals.andMore", {
          count: extraCount,
          defaultValue: `+${extraCount}`,
        })}`
      : "");

  const hasItems = previewText.trim().length > 0;

  const proteinText = t("meals.proteinValue", {
    protein: meal.protein,
    defaultValue: `${meal.protein} גרם חלבון`,
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(meal.mealType)}
    >
      <View style={[styles.accentLine, isRTL && styles.accentLineRtl]} />
      <View style={[styles.softGlow, isRTL && styles.softGlowRtl]} />

      <View style={[styles.mainRow, dir.row]}>
        <View style={[styles.mealInfoRow, dir.row]}>
          <View style={styles.iconBubble}>
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={colors.primaryGreen}
            />
          </View>

          <View style={styles.titleBox}>
            <Text
              style={[styles.mealLabel, dir.text]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.84}
            >
              {t(`mealTypes.${labelKey}`)}
            </Text>

            <Text style={[styles.itemsCount, dir.text]} numberOfLines={1}>
              {t("meals.itemsCount", {
                count: meal.items.length,
                defaultValue: `${meal.items.length} פריטים`,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.nutritionPanel}>
          <Text
            style={styles.calorieValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {meal.calories}
          </Text>

          <Text style={styles.calorieUnit}>
            {t("meals.calUnit", { defaultValue: "קל׳" })}
          </Text>

          <View style={styles.nutritionDivider} />

          <View style={styles.proteinPill}>
            <Text
              style={styles.proteinValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {proteinText}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.previewBox, dir.row]}>
        <View style={styles.previewIconWrap}>
          <MaterialCommunityIcons
            name={hasItems ? "playlist-check" : "plus-circle-outline"}
            size={15}
            color={colors.textMuted}
          />
        </View>

        <Text style={[styles.preview, dir.text]} numberOfLines={1}>
          {hasItems
            ? previewText
            : t("meals.emptyMeal", {
                defaultValue: "עדיין לא נוספו פריטים",
              })}
        </Text>

        <MaterialCommunityIcons
          name={isRTL ? "chevron-left" : "chevron-right"}
          size={18}
          color={colors.textMuted}
        />

        {onCopy && (
          <Pressable style={styles.copyBtn} onPress={() => onCopy(meal)}>
            <MaterialCommunityIcons
              name="calendar-plus"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
