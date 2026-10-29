import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { Button } from "../../../shared/components/ui/Button";
import { showToast } from "../../../shared/helpers/toast";
import { ChoiceChips } from "../../../shared/components/ui/ChoiceChips";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { DayCalendar } from "../../day-log/components/DayCalendar";
import { useDayLabels } from "../../day-log/hooks/useDayLabels";
import { CalculatorResult } from "../../pantry/hooks/useProductCalculator";
import { useServingFormat } from "../../pantry/hooks/useServingFormat";
import { PantryProduct } from "../../pantry/types";
import { useAddToMeal } from "../hooks/useAddToMeal";

type Props = {
  product: PantryProduct;
  result: CalculatorResult;
  onDone: () => void;
  onBack?: () => void;
};

export function AddToMealPanel({ product, result, onDone, onBack }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const servingFormat = useServingFormat();
  const flow = useAddToMeal(product.id, result.amount);
  const labels = useDayLabels(flow.today);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const amountLabel = servingFormat.amount(product, result.amount);
  const dayLabel = (key: string) => labels.relative(key) ?? labels.full(key);

  async function handleSave() {
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
    onDone();
  }

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={[styles.label, dir.text]}>{t("calculatorMeal.dateLabel")}</Text>
        <Pressable
          onPress={() => setCalendarOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: calendarOpen }}
          accessibilityLabel={t("calculatorMeal.chooseDate", { date: labels.full(flow.date) })}
          style={({ pressed }) => [styles.dateButton, dir.row, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.dateText, dir.text]} numberOfLines={1}>
            {dayLabel(flow.date)}
            {labels.relative(flow.date) ? ` · ${labels.short(flow.date)}` : ""}
          </Text>
          <MaterialCommunityIcons name={calendarOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
        </Pressable>
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
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, dir.text]}>{t("calculatorMeal.mealLabel")}</Text>
        <ChoiceChips
          options={flow.mealTypes.map((value) => ({ value, label: t(`mealTypes.${value}`) }))}
          value={flow.mealType}
          onChange={flow.setMealType}
        />
      </View>

      <Button
        label={t("calculatorMeal.save", { meal: t(`mealTypes.${flow.mealType}`) })}
        icon="plus"
        onPress={handleSave}
        loading={flow.isSaving}
        disabled={!flow.canSave}
        fullWidth
      />
      {onBack ? (
        <Button label={t("calculatorMeal.changeAmount")} variant="ghost" onPress={onBack} disabled={flow.isSaving} fullWidth />
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: { gap: spacing.md },
      field: { gap: spacing.sm },
      label: { ...typography.label, color: colors.textSecondary },
      dateButton: {
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 48,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
      },
      dateText: { flex: 1, ...typography.body, color: colors.textPrimary },
      pressed: { opacity: 0.7 },
      calendar: {
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.sm,
      },
    }),
  );
