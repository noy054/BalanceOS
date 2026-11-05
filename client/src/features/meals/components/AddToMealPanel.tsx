import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { Button } from "../../../shared/components/ui/Button";
import { showToast } from "../../../shared/helpers/toast";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { DayCalendar } from "../../day-log/components/DayCalendar";
import { useDayLabels } from "../../day-log/hooks/useDayLabels";
import { CalculatorResult } from "../../pantry/hooks/useProductCalculator";
import { useServingFormat } from "../../pantry/hooks/useServingFormat";
import { PantryProduct } from "../../pantry/types";
import { MEAL_TYPE_ICONS } from "../constants/mealTypes";
import { useAddToMeal } from "../hooks/useAddToMeal";

type Props = {
  product: PantryProduct;
  result: CalculatorResult | null;
  onDone?: () => void;
};

export function AddToMealPanel({ product, result, onDone }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const servingFormat = useServingFormat();
  const flow = useAddToMeal(product.id, result?.amount ?? null);
  const labels = useDayLabels(flow.today);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const dayLabel = (key: string) => labels.relative(key) ?? labels.short(key);

  async function handleSave() {
    if (!result) return;
    const amountLabel = servingFormat.amount(product, result.amount);
    const target = await flow.save();
    if (!target) return;
    showToast({
      message: t("calculatorMeal.savedText", {
        amount: amountLabel,
        meal: t(`mealTypes.${target.mealType}`),
        date: dayLabel(target.date),
      }),
      actionLabel: t("calculatorMeal.viewDay"),
      onAction: () => flow.viewDay(target),
    });
    onDone?.();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, dir.row]}>
        <Text style={[styles.title, dir.text]} accessibilityRole="header" numberOfLines={1}>
          {t("calculatorMeal.title")}
        </Text>
        <Pressable
          onPress={() => setCalendarOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: calendarOpen }}
          accessibilityLabel={t("calculatorMeal.chooseDate", { date: labels.full(flow.date) })}
          hitSlop={4}
          style={({ pressed }) => [styles.datePill, dir.row, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.dateText} numberOfLines={1}>
            {dayLabel(flow.date)}
          </Text>
          <MaterialCommunityIcons
            name={calendarOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {calendarOpen ? (
        <View style={styles.calendar}>
          <DayCalendar
            date={flow.date}
            today={flow.today}
            maxDate={flow.maxDate}
            onSelect={(key) => {
              flow.chooseDate(key);
              setCalendarOpen(false);
            }}
          />
        </View>
      ) : null}

      <View style={[styles.meals, dir.row]} accessibilityRole="radiogroup" accessibilityLabel={t("calculatorMeal.mealLabel")}>
        {flow.mealTypes.map((mealType) => {
          const selected = mealType === flow.mealType;
          const label = t(`mealTypes.${mealType}`);
          return (
            <Pressable
              key={mealType}
              onPress={() => flow.setMealType(mealType)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={label}
              style={({ pressed }) => [
                styles.meal,
                selected && styles.mealSelected,
                pressed && !selected && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons
                name={MEAL_TYPE_ICONS[mealType]}
                size={22}
                color={selected ? colors.accent : colors.textSecondary}
              />
              <Text style={[styles.mealLabel, selected && styles.mealLabelSelected]} numberOfLines={2}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        label={t("calculatorMeal.save", { meal: t(`mealTypes.${flow.mealType}`) })}
        icon="plus"
        onPress={handleSave}
        loading={flow.isSaving}
        disabled={!flow.canSave}
        fullWidth
      />
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: { gap: spacing.ms },
      header: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      title: { ...typography.headline, flexShrink: 1, color: colors.textPrimary },
      datePill: {
        alignItems: "center",
        gap: spacing.xs,
        minHeight: 40,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.round,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      dateText: { ...typography.label, color: colors.textPrimary },
      pressed: { opacity: 0.7 },
      calendar: {
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        padding: spacing.sm,
      },
      meals: { gap: spacing.xs },
      meal: {
        flex: 1,
        minWidth: 0,
        minHeight: 64,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: spacing.sm,
        paddingHorizontal: 2,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      mealSelected: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
      },
      mealLabel: {
        ...typography.caption,
        fontSize: 11,
        lineHeight: 14,
        textAlign: "center",
        color: colors.textSecondary,
      },
      mealLabelSelected: { color: colors.accent },
    }),
  );
