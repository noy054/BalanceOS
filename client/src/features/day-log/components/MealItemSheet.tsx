import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { Button } from "../../../shared/components/ui/Button";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { NutritionStrip } from "../../pantry/components/nutrition/NutritionStrip";
import { fonts, radius, spacing, states, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
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
      : amount?.kind === "milliliters"
        ? t("itemSheet.unitMilliliters")
        : amount?.kind === "units"
        ? amount.unit
        : t("itemSheet.unitServings");

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
      <View style={styles.body}>
        <NutritionStrip nutrition={preview} />

        {amount ? (
          <View style={styles.section}>
            <View style={[styles.stepper, dir.row]}>
              <IconButton
                icon="minus"
                size={44}
                iconSize={20}
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
                size={44}
                iconSize={20}
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

        {amount ? (
          <Button
            label={t("itemSheet.save")}
            onPress={handleSave}
            loading={update.isPending}
            disabled={!isChanged}
            fullWidth
          />
        ) : null}

        <Pressable
          onPress={handleRemove}
          disabled={update.isPending}
          accessibilityRole="button"
          accessibilityLabel={t("itemSheet.remove", { meal: shown.mealLabel })}
          hitSlop={4}
          style={({ pressed }) => [styles.remove, dir.row, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
          <Text style={styles.removeText}>{t("itemSheet.remove", { meal: shown.mealLabel })}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      body: {
        gap: spacing.ms,
      },
      section: {
        gap: spacing.xs,
      },
      stepper: {
        alignItems: "center",
        gap: spacing.sm,
      },
      inputFrame: {
        flex: 1,
        minHeight: 44,
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      inputError: {
        borderColor: colors.danger,
      },
      input: {
        flex: 1,
        minWidth: 0,
        ...typography.value,
        fontSize: 18,
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
      remove: {
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        minHeight: 44,
        paddingHorizontal: spacing.md,
      },
      removeText: {
        ...typography.label,
        color: colors.danger,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
    }),
  );
