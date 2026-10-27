import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../shared/theme";
import { useDirection } from "../../../shared/hooks/useDirection";
import { Button } from "../../../shared/components/ui/Button";
import { formatCalories, formatGrams } from "../../../shared/helpers/formatNumber";
import { MealEntrySummary } from "../types";
import { useStyles } from "./styles/MealSectionCard.styles";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  mealType: string;
  labelKey: string;
  icon: IconName;
  meal: MealEntrySummary | null;
  onAdd: (mealType: string) => void;
  onCopy?: (meal: MealEntrySummary) => void;
};

export function MealSectionCard({ mealType, labelKey, icon, meal, onAdd, onCopy }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();

  const mealLabel = t(`mealTypes.${labelKey}`);
  const items = meal?.items ?? [];
  const hasItems = items.length > 0;
  const addLabel = t("meals.addToMeal", { meal: mealLabel });

  const meta = hasItems
    ? `${t("meals.itemsCount", { count: items.length })} · ${t("meals.itemProtein", {
        protein: formatGrams(meal?.protein),
      })}`
    : t("meals.emptyMeal");

  return (
    <View style={styles.card}>
      <View style={[styles.headerRow, dir.row]}>
        <Pressable
          onPress={() => onAdd(mealType)}
          accessibilityRole="button"
          accessibilityLabel={
            hasItems
              ? `${mealLabel}, ${t("meals.itemCalories", { calories: formatCalories(meal?.calories) })}, ${meta}`
              : `${mealLabel}, ${meta}`
          }
          accessibilityHint={addLabel}
          style={({ pressed }) => [styles.headerMain, dir.row, pressed && styles.pressed]}
        >
          <View style={[styles.iconWrap, hasItems && styles.iconWrapActive]}>
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={hasItems ? colors.accent : colors.textMuted}
            />
          </View>

          <View style={styles.titleBlock}>
            <Text style={[styles.mealLabel, dir.text]} numberOfLines={1}>
              {mealLabel}
            </Text>
            <Text
              style={[styles.meta, !hasItems && styles.metaEmpty, dir.text]}
              numberOfLines={2}
            >
              {meta}
            </Text>
          </View>

          {hasItems ? (
            <View style={styles.totalBlock}>
              <Text style={styles.totalValue} numberOfLines={1}>
                {formatCalories(meal?.calories)}
              </Text>
              <Text style={styles.totalUnit} numberOfLines={1}>
                {t("calories.unitShort")}
              </Text>
            </View>
          ) : null}
        </Pressable>

        {hasItems ? null : (
          <Button
            label={t("meals.add")}
            icon="plus"
            variant="tonal"
            size="sm"
            onPress={() => onAdd(mealType)}
            accessibilityLabel={addLabel}
          />
        )}
      </View>

      {hasItems ? (
        <>
          <View style={styles.items}>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={[styles.itemRow, dir.row, index > 0 && styles.itemRowBorder]}
              >
                <View style={styles.itemText}>
                  <Text style={[styles.itemName, dir.text]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemProtein, dir.text]} numberOfLines={1}>
                    {t("meals.itemProtein", { protein: formatGrams(item.protein) })}
                  </Text>
                </View>

                <Text style={styles.itemCalories} numberOfLines={1}>
                  {formatCalories(item.calories)}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.footer, dir.row]}>
            <Button
              label={t("meals.addFood")}
              icon="plus"
              variant="ghost"
              size="sm"
              onPress={() => onAdd(mealType)}
              accessibilityLabel={addLabel}
            />

            {meal && onCopy ? (
              <Button
                label={t("meals.copyToMoreDays")}
                icon="calendar-plus"
                variant="ghost"
                size="sm"
                onPress={() => onCopy(meal)}
              />
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}
