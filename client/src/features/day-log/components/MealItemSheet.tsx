import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { Button } from "../../../shared/components/ui/Button";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../shared/helpers/formatNumber";
import {
  fonts,
  radius,
  spacing,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../shared/theme";
import {
  editableAmount,
  formatAmountInput,
  parseAmountInput,
  scaleMacros,
} from "../helpers/itemAmount";
import { useItemAmountLabel } from "../hooks/useItemAmountLabel";
import { useUpdateMealItem } from "../hooks/useDayLog";
import { MealItemSummary } from "../types";

type Props = {
  date: string;
  item: MealItemSummary | null;
  mealLabel: string;
  onClose: () => void;
  onRemove: (item: MealItemSummary, mealLabel: string) => Promise<boolean>;
};

const MACRO_KEYS = ["protein", "carbs", "fat", "fiber"] as const;

export function MealItemSheet({ date, item, mealLabel, onClose, onRemove }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const amountLabel = useItemAmountLabel();
  const update = useUpdateMealItem(date);
  const inFlight = useRef(false);
  const shownRef = useRef<{ item: MealItemSummary; mealLabel: string } | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (item) {
    shownRef.current = { item, mealLabel };
  }
  const shown = shownRef.current;
  const amount = useMemo(() => (shown ? editableAmount(shown.item) : null), [shown]);

  useEffect(() => {
    if (item) {
      const next = editableAmount(item);
      setText(next ? formatAmountInput(next.initial) : "");
      setError(null);
    }
  }, [item]);

  if (!shown) {
    return null;
  }

  const value = parseAmountInput(text);
  const isChanged = amount != null && value != null && Math.abs(value - amount.initial) > 1e-9;
  const preview = amount && value ? scaleMacros(shown.item, amount.ratio(value)) : shown.item;
  const unitLabel =
    amount?.kind === "grams"
      ? t("itemSheet.unitGrams")
      : amount?.kind === "units"
        ? amount.unit
        : t("itemSheet.unitServings");
  const endText = { textAlign: dir.isRTL ? ("left" as const) : ("right" as const) };

  function step(direction: 1 | -1) {
    if (!amount) return;
    const base = value ?? amount.initial;
    const next = Math.max(amount.min, Math.round((base + direction * amount.step) * 100) / 100);
    setText(formatAmountInput(next));
    setError(null);
  }

  async function handleSave() {
    if (!amount || !shown || inFlight.current) return;
    if (value == null) {
      setError(t("itemSheet.invalidAmount"));
      return;
    }
    inFlight.current = true;
    try {
      await update.mutateAsync({ itemId: shown.item.id, ...amount.toPayload(value) });
      onClose();
    } catch {
      setError(t("itemSheet.saveFailed"));
    } finally {
      inFlight.current = false;
    }
  }

  async function handleRemove() {
    if (!shown) return;
    const removed = await onRemove(shown.item, shown.mealLabel);
    if (removed) onClose();
  }

  return (
    <BottomSheet
      visible={item !== null}
      onClose={onClose}
      title={shown.item.name}
      subtitle={[shown.mealLabel, amountLabel(shown.item)].filter(Boolean).join(" · ")}
    >
      {amount ? (
        <View style={styles.section}>
          <Text style={[styles.label, dir.text]}>{t("itemSheet.amountLabel")}</Text>
          <View style={[styles.stepper, dir.row]}>
            <IconButton
              icon="minus"
              size={48}
              iconSize={22}
              variant="tonal"
              accessibilityLabel={t("itemSheet.decrease")}
              onPress={() => step(-1)}
              disabled={value != null && value <= amount.min}
            />
            <View style={[styles.inputFrame, error && styles.inputError, dir.row]}>
              <TextInput
                value={text}
                onChangeText={(next) => {
                  setText(next);
                  setError(null);
                }}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                selectTextOnFocus
                style={styles.input}
                accessibilityLabel={`${t("itemSheet.amountLabel")} (${unitLabel})`}
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.unit} numberOfLines={1}>
                {unitLabel}
              </Text>
            </View>
            <IconButton
              icon="plus"
              size={48}
              iconSize={22}
              variant="tonal"
              accessibilityLabel={t("itemSheet.increase")}
              onPress={() => step(1)}
            />
          </View>
          {error ? (
            <Text style={[styles.error, dir.text]} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={[styles.note, dir.text]}>{t("itemSheet.fixedAmount")}</Text>
      )}

      <View style={[styles.nutrition, dir.row]} accessible accessibilityLabel={t("itemSheet.nutritionA11y", {
        calories: formatCalories(preview.calories),
        protein: formatGrams(preview.protein),
        carbs: formatGrams(preview.carbs),
        fat: formatGrams(preview.fat),
      })}>
        <View style={[styles.cell, styles.cellWide]}>
          <Text style={[styles.cellValue, styles.cellValueStrong, dir.text]} numberOfLines={1}>
            {formatCalories(preview.calories)}
          </Text>
          <Text style={[styles.cellLabel, dir.text]} numberOfLines={1}>
            {t("calories.unitShort")}
          </Text>
        </View>
        {MACRO_KEYS.map((key) => (
          <View key={key} style={styles.cell}>
            <Text style={[styles.cellValue, endText]} numberOfLines={1}>
              {formatGrams(preview[key])}
              <Text style={styles.cellUnit}> {t("itemSheet.unitGrams")}</Text>
            </Text>
            <Text style={[styles.cellLabel, endText]} numberOfLines={1}>
              {t(`macros.${key}`)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {amount ? (
          <Button
            label={t("itemSheet.save")}
            onPress={handleSave}
            loading={update.isPending}
            disabled={!isChanged}
            fullWidth
          />
        ) : null}
        <Button
          label={t("itemSheet.remove", { meal: shown.mealLabel })}
          variant="danger"
          onPress={handleRemove}
          disabled={update.isPending}
          fullWidth
        />
      </View>
    </BottomSheet>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      section: {
        gap: spacing.xs,
      },
      label: {
        ...typography.label,
        color: colors.textSecondary,
      },
      stepper: {
        alignItems: "center",
        gap: spacing.sm,
      },
      inputFrame: {
        borderRadius: radius.md,
        flex: 1,
        minHeight: 48,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.inputBackground,
        paddingHorizontal: spacing.ms,
        gap: spacing.sm,
      },
      inputError: {
        borderColor: colors.danger,
      },
      input: {
        flex: 1,
        minWidth: 0,
        ...typography.value,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
        textAlign: "center",
        paddingVertical: spacing.sm,
      },
      unit: {
        ...typography.callout,
        color: colors.textSecondary,
        maxWidth: 120,
      },
      error: {
        ...typography.footnote,
        color: colors.danger,
      },
      note: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      nutrition: {
        alignItems: "flex-start",
        marginTop: spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingVertical: spacing.ms,
        gap: spacing.sm,
      },
      cell: {
        flex: 1,
        minWidth: 0,
      },
      cellWide: {
        flex: 1.3,
      },
      cellValue: {
        ...typography.bodyStrong,
        ...typography.number,
        color: colors.textPrimary,
      },
      cellValueStrong: {
        fontFamily: fonts.semibold,
      },
      cellUnit: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      cellLabel: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      actions: {
        marginTop: spacing.md,
        gap: spacing.sm,
      },
    }),
  );
