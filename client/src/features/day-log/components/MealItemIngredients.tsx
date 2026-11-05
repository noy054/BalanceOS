import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { formatCalories } from "../../../shared/helpers/formatNumber";
import { showToast } from "../../../shared/helpers/toast";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { useLiveAmountEdit, useMealItemComponents } from "../hooks/useDayLog";
import { MealItemSummary } from "../types";
import { AmountSource } from "../helpers/itemAmount";
import { InlineQuantityEditor } from "./InlineQuantityEditor";

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
          source={component}
          last={index === components.length - 1}
        />
      ))}
      <Text style={[styles.hint, dir.text]}>{t("ingredients.dayOnly")}</Text>
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
}: {
  itemId: string;
  componentId?: string;
  date: string;
  name: string;
  title: string;
  calories: number;
  source: AmountSource;
  last: boolean;
}) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();
  const edit = useLiveAmountEdit(date, { itemId, componentId });

  return (
    <View style={[styles.row, dir.row, !last && styles.divider]}>
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

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      panel: {
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      loader: {
        paddingVertical: spacing.md,
      },
      note: {
        ...typography.footnote,
        color: colors.textSecondary,
        paddingTop: spacing.ms,
      },
      hint: {
        ...typography.caption,
        color: colors.textMuted,
        paddingBottom: spacing.sm,
      },
      row: {
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 56,
        paddingVertical: spacing.xs,
      },
      divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      info: {
        flex: 1,
        minWidth: 0,
        gap: 1,
      },
      name: {
        ...typography.footnote,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      calories: {
        ...typography.caption,
        ...typography.number,
        color: colors.textSecondary,
      },
    }),
  );
