import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { formatCalories } from "../../../shared/helpers/formatNumber";
import { showToast } from "../../../shared/helpers/toast";
import { fonts, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { useLiveAmountEdit, useMealItemComponents } from "../hooks/useDayLog";
import { MealItemSummary } from "../types";
import { AmountSource } from "../helpers/itemAmount";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { InlineQuantityEditor } from "./InlineQuantityEditor";
import { FoodThumb } from "../../pantry/components/food/FoodThumb";
import { FOOD_ICONS } from "../../pantry/hooks/useFoodCardModels";
import { withAlpha } from "../../../shared/helpers/progressColor";

type Props = {
  item: MealItemSummary;
  date: string;
};

export function MealItemIngredients({ item, date }: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const components = item.components ?? [];
  const isComposite = item.source === "RECIPE" || item.source === "SAVED_MEAL";
  const legacy = useMealItemComponents(item.id, date, isComposite && components.length === 0);

  if (!isComposite || (components.length === 0 && legacy.isError)) {
    return (
      <View style={styles.panel}>
        {isComposite ? <Text style={[styles.note, dir.text]}>{t("ingredients.unavailable")}</Text> : null}
        <AmountRow
          itemId={item.id}
          date={date}
          name={item.name}
          title={t("ingredients.amount")}
          calories={item.calories}
          source={item}
          last
        />
      </View>
    );
  }

  if (components.length === 0) {
    return (
      <View style={styles.panel}>
        <ActivityIndicator color={colors.textMuted} style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      {components.map((component, index) => (
        <AmountRow
          key={component.id}
          itemId={item.id}
          componentId={component.id}
          date={date}
          name={component.name}
          title={component.name}
          calories={component.calories}
          imageUrl={component.imageUrl}
          icon={component.source === "RECIPE" ? FOOD_ICONS.recipe : FOOD_ICONS.product}
          source={component}
          last={index === components.length - 1}
        />
      ))}
    </View>
  );
}

function AmountRow({
  itemId,
  componentId,
  date,
  name,
  title,
  calories,
  source,
  last,
  imageUrl,
  icon,
}: {
  itemId: string;
  componentId?: string;
  date: string;
  name: string;
  title: string;
  calories: number;
  source: AmountSource;
  last: boolean;
  imageUrl?: string | null;
  icon?: (typeof FOOD_ICONS)[keyof typeof FOOD_ICONS];
}) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();
  const edit = useLiveAmountEdit(date, { itemId, componentId });
  const { colors } = useAppTheme();

  return (
    <View style={[styles.row, dir.row, !last && styles.divider]}>
      {icon ? (
        imageUrl ? (
          <View style={styles.tile}>
            <FoodThumb imageUrl={imageUrl} fallbackIcon={icon} size={TILE_SIZE} />
          </View>
        ) : (
          <View style={[styles.tile, styles.iconTile]}>
            <MaterialCommunityIcons name={icon} size={20} color={colors.accent} />
          </View>
        )
      ) : null}
      <View style={styles.info}>
        <Text style={[styles.name, dir.text]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.calories, dir.text]} numberOfLines={1}>
          {t("meals.itemCalories", { calories: formatCalories(calories) })}
        </Text>
      </View>
      <InlineQuantityEditor
        name={name}
        source={source}
        onPreview={edit.preview}
        onCommit={(change) =>
          edit.save(change, { onError: () => showToast({ message: t("ingredients.saveFailed") }) })
        }
      />
    </View>
  );
}

const TILE_SIZE = 40;

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      panel: {
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: withAlpha(colors.gloss, 0.07),
        backgroundColor: withAlpha(colors.canvas, 0.35),
      },
      tile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: 10,
        overflow: "hidden",
      },
      iconTile: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: withAlpha(colors.calorieGauge, 0.13),
      },
      loader: {
        paddingVertical: spacing.md,
      },
      note: {
        ...typography.footnote,
        color: colors.textSecondary,
        paddingTop: spacing.ms,
      },
      row: {
        alignItems: "center",
        gap: 12,
        minHeight: 58,
        paddingVertical: 8,
      },
      divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: withAlpha(colors.gloss, 0.08),
      },
      info: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      name: {
        fontFamily: fonts.semibold,
        fontSize: 15,
        lineHeight: 20,
        color: colors.textPrimary,
      },
      calories: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
    }),
  );
