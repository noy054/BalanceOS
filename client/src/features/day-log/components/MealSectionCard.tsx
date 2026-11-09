import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { useAppTheme } from "../../../shared/theme";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { ActionSheet } from "../../../shared/components/ui/ActionSheet";
import { Collapsible } from "../../../shared/components/ui/Collapsible";
import {
  formatCalories,
  formatGrams,
} from "../../../shared/helpers/formatNumber";
import { FoodThumb } from "../../pantry/components/food/FoodThumb";
import { FOOD_ICONS } from "../../pantry/hooks/useFoodCardModels";
import { useItemAmountLabel } from "../hooks/useItemAmountLabel";
import { CopyTarget, MealEntrySummary, MealItemSummary } from "../types";
import { MealItemIngredients } from "./MealItemIngredients";
import { useStyles } from "./styles/MealSectionCard.styles";

type Props = {
  date: string;
  mealType: string;
  labelKey: string;
  meal: MealEntrySummary | null;
  expanded: boolean;
  pendingIds?: ReadonlySet<string>;
  onAdd: (mealType: string) => void;
  onCopy?: (target: CopyTarget) => void;
  onRemoveItem?: (item: MealItemSummary, mealLabel: string) => void;
};

const THUMB_WIDTH = 56;

function fallbackIcon(item: MealItemSummary) {
  if (item.source === "RECIPE") return FOOD_ICONS.recipe;
  if (item.source === "SAVED_MEAL") return FOOD_ICONS.savedMeal;
  return FOOD_ICONS.product;
}

export function MealSectionCard({
  date,
  mealType,
  labelKey,
  meal,
  expanded,
  pendingIds,
  onAdd,
  onCopy,
  onRemoveItem,
}: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const amountLabel = useItemAmountLabel();
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());
  const [menuItem, setMenuItem] = useState<MealItemSummary | null>(null);

  function toggleItem(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const mealLabel = t(`mealTypes.${labelKey}`);
  const items = meal?.items ?? [];
  const hasItems = Boolean(meal) && items.length > 0;
  const isMealPending = meal ? Boolean(pendingIds?.has(meal.id)) : false;

  return (
    <View style={[styles.section, isMealPending && styles.pending]}>
      <View style={[styles.header, dir.row]}>
        <View style={[styles.titleRow, dir.row]}>
          <Text
            style={[styles.mealLabel, dir.text]}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {mealLabel}
          </Text>
          {meal && hasItems ? (
            <Text style={styles.total} numberOfLines={1}>
              {t("meals.itemCalories", {
                calories: formatCalories(meal.calories),
              })}
            </Text>
          ) : null}
        </View>
        <IconButton
          icon="plus"
          variant="glass"
          size={34}
          iconSize={20}
          color={colors.accent}
          accessibilityLabel={t("meals.addToMeal", { meal: mealLabel })}
          onPress={() => onAdd(mealType)}
          style={styles.emptyAdd}
        />
      </View>

      {hasItems ? (
        <Collapsible expanded={expanded}>
          <View style={styles.items}>
            {items.map((item) => {
              const isPending =
                Boolean(pendingIds?.has(item.id)) || isMealPending;
              const isOpen = openIds.has(item.id);
              const amount = amountLabel(item);
              const protein = t("meals.itemProtein", {
                protein: formatGrams(item.protein),
              });
              const detail = [amount, protein].filter(Boolean).join(" · ");

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    isOpen && styles.itemCardOpen,
                    isPending && styles.pending,
                  ]}
                >
                  <View style={[styles.itemRowWrap, dir.row]}>
                    <Pressable
                      onPress={() => toggleItem(item.id)}
                      disabled={isPending}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isOpen }}
                      accessibilityLabel={`${item.name}, ${detail}, ${t(
                        "meals.itemCalories",
                        {
                          calories: formatCalories(item.calories),
                        },
                      )}`}
                      accessibilityHint={
                        isOpen
                          ? t("meals.collapseItemHint")
                          : t("meals.expandItemHint")
                      }
                      style={({ pressed }) => [
                        styles.itemRow,
                        dir.row,
                        (onCopy || onRemoveItem) && styles.itemRowWithMore,
                        pressed && styles.pressed,
                      ]}
                    >
                      {item.imageUrl ? (
                        <View style={styles.thumb}>
                          <FoodThumb
                            imageUrl={item.imageUrl}
                            fallbackIcon={fallbackIcon(item)}
                            size={THUMB_WIDTH}
                          />
                        </View>
                      ) : (
                        <View style={[styles.thumb, styles.thumbIcon]}>
                          <MaterialCommunityIcons
                            name={fallbackIcon(item)}
                            size={22}
                            color={colors.textSecondary}
                          />
                        </View>
                      )}
                      <View style={[styles.itemText, dir.alignStart]}>
                        <Text
                          style={[styles.itemName, dir.text]}
                          numberOfLines={2}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={[styles.itemDetail, dir.text]}
                          numberOfLines={1}
                        >
                          {amount ? (
                            <>
                              {amount}
                              <Text style={styles.detailDivider}>
                                {"  |  "}
                              </Text>
                            </>
                          ) : null}
                          {protein}
                        </Text>
                      </View>
                      <View style={[styles.calorieBlock, dir.row]}>
                        <Text style={styles.itemCalories} numberOfLines={1}>
                          {formatCalories(item.calories)}
                        </Text>
                        <Text style={styles.itemCaloriesUnit} numberOfLines={1}>
                          {t("meals.calUnit")}
                        </Text>
                      </View>
                      <View style={styles.chevron}>
                        <MaterialCommunityIcons
                          name={isOpen ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={colors.textPrimary}
                        />
                      </View>
                    </Pressable>
                    {onCopy || onRemoveItem ? (
                      <IconButton
                        icon="dots-horizontal"
                        size={34}
                        iconSize={20}
                        color={colors.textSecondary}
                        accessibilityLabel={t("meals.itemActionsA11y", {
                          name: item.name,
                        })}
                        onPress={() => setMenuItem(item)}
                        disabled={isPending}
                        style={styles.moreButton}
                      />
                    ) : null}
                  </View>

                  {isOpen ? (
                    <View style={styles.expanded}>
                      <MealItemIngredients item={item} date={date} />
                      <View style={[styles.footer, dir.row]}>
                        <Text
                          style={[styles.footerHint, dir.text]}
                          numberOfLines={2}
                        >
                          {t("ingredients.dayOnly")}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Collapsible>
      ) : null}

      <ActionSheet
        visible={menuItem !== null}
        title={menuItem?.name}
        actions={
          menuItem
            ? [
                ...(onCopy
                  ? [
                      {
                        key: "copy",
                        label: t("meals.copyToMoreDays"),
                        icon: "content-copy" as const,
                        onPress: () =>
                          onCopy({
                            kind: "item",
                            id: menuItem.id,
                            name: menuItem.name,
                          }),
                      },
                    ]
                  : []),
                ...(onRemoveItem
                  ? [
                      {
                        key: "remove",
                        label: t("remove.confirm"),
                        icon: "trash-can-outline" as const,
                        destructive: true,
                        onPress: () => onRemoveItem(menuItem, mealLabel),
                      },
                    ]
                  : []),
              ]
            : []
        }
        onClose={() => setMenuItem(null)}
      />
    </View>
  );
}
