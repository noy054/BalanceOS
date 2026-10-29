import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { useAppTheme } from "../../../shared/theme";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { Collapsible } from "../../../shared/components/ui/Collapsible";
import { formatCalories, formatGrams } from "../../../shared/helpers/formatNumber";
import { useItemAmountLabel } from "../hooks/useItemAmountLabel";
import { CopyTarget, MealEntrySummary, MealItemSummary } from "../types";
import { useStyles } from "./styles/MealSectionCard.styles";

type Props = {
  mealType: string;
  labelKey: string;
  meal: MealEntrySummary | null;
  expanded: boolean;
  pendingIds?: ReadonlySet<string>;
  onAdd: (mealType: string) => void;
  onCopy?: (target: CopyTarget) => void;
  onEditItem?: (item: MealItemSummary, mealLabel: string) => void;
  onRemoveItem?: (item: MealItemSummary, mealLabel: string) => void;
};

export function MealSectionCard({
  mealType,
  labelKey,
  meal,
  expanded,
  pendingIds,
  onAdd,
  onCopy,
  onEditItem,
  onRemoveItem,
}: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const amountLabel = useItemAmountLabel();

  const mealLabel = t(`mealTypes.${labelKey}`);
  const items = meal?.items ?? [];
  const hasItems = Boolean(meal) && items.length > 0;
  const isMealPending = meal ? Boolean(pendingIds?.has(meal.id)) : false;
  const endText = { textAlign: dir.isRTL ? ("left" as const) : ("right" as const) };

  return (
    <View style={[styles.card, isMealPending && styles.pending]}>
      <View style={[styles.header, dir.row]}>
        <View style={[styles.titleRow, dir.row]}>
          <Text style={[styles.mealLabel, dir.text]} numberOfLines={1} accessibilityRole="header">
            {mealLabel}
          </Text>
          {meal && hasItems ? (
            <Text style={styles.total} numberOfLines={1}>
              {t("meals.itemCalories", { calories: formatCalories(meal.calories) })}
            </Text>
          ) : null}
        </View>

        <View style={styles.iconSpacer} />

        <IconButton
          icon="plus"
          variant="accent"
          size={40}
          iconSize={22}
          accessibilityLabel={t("meals.addToMeal", { meal: mealLabel })}
          onPress={() => onAdd(mealType)}
          style={styles.endAction}
        />
      </View>

      {hasItems ? (
        <Collapsible expanded={expanded}>
          <View style={styles.items}>
            {items.map((item, index) => {
              const isPending = Boolean(pendingIds?.has(item.id));
              const amount = amountLabel(item);
              const detail = [amount, t("meals.itemProtein", { protein: formatGrams(item.protein) })]
                .filter(Boolean)
                .join(" · ");

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    index === items.length - 1 && styles.itemRowLast,
                    dir.row,
                    isPending && styles.pending,
                  ]}
                >
                  <Pressable
                    onPress={() => onEditItem?.(item, mealLabel)}
                    disabled={!onEditItem || isPending || isMealPending}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, ${detail}, ${t("meals.itemCalories", {
                      calories: formatCalories(item.calories),
                    })}`}
                    accessibilityHint={t("meals.editItemHint")}
                    style={({ pressed }) => [styles.itemMain, dir.row, pressed && styles.actionPressed]}
                  >
                    <View style={styles.itemText}>
                      <Text style={[styles.itemName, dir.text]} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={[styles.itemDetail, dir.text]} numberOfLines={1}>
                        {detail}
                      </Text>
                    </View>

                    <Text style={[styles.itemCalories, endText]} numberOfLines={1}>
                      {formatCalories(item.calories)}
                    </Text>
                  </Pressable>

                  {onRemoveItem ? (
                    <IconButton
                      icon="trash-can-outline"
                      size={40}
                      iconSize={20}
                      color={colors.textMuted}
                      accessibilityLabel={t("remove.itemA11y", { name: item.name })}
                      onPress={() => onRemoveItem(item, mealLabel)}
                      disabled={isPending || isMealPending}
                    />
                  ) : null}

                  {onCopy ? (
                    <IconButton
                      icon="content-copy"
                      size={40}
                      iconSize={19}
                      accessibilityLabel={t("meals.copyItemA11y", { name: item.name })}
                      onPress={() => onCopy({ kind: "item", id: item.id, name: item.name })}
                      disabled={isPending || isMealPending}
                      style={styles.endAction}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        </Collapsible>
      ) : null}
    </View>
  );
}
