import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { ServingFormState } from "../../helpers/productForm";
import { parsePositiveNumber } from "../../helpers/savedMealDraft";
import { useServingFormat } from "../../hooks/useServingFormat";
import { formatAmount } from "../../helpers/serving";
import {
  SERVING_UNIT_KEYS,
  ServingReference,
  ServingUnitKey,
  servingUnitKey,
} from "../../helpers/servingReferences";

type Props = {
  serving: ServingFormState;
  perServingMode: boolean;
  language: string;
  weightError?: string;
  volumeError?: string;
  volumeRequired?: boolean;
  quantityError?: string;
  references?: ServingReference[];
  onChange: (key: keyof ServingFormState, value: string) => void;
  onLinkedFocus?: () => void;
  onLinkedBlur?: (key: "quantity" | "grams" | "milliliters") => void;
  onApplyReference?: (quantity: number, grams: number) => void;
};

export function ServingFields({
  serving,
  perServingMode,
  language,
  weightError,
  volumeError,
  volumeRequired = false,
  quantityError,
  references = [],
  onChange,
  onLinkedFocus,
  onLinkedBlur,
  onApplyReference,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const format = useServingFormat();

  const grams = parsePositiveNumber(serving.grams);
  const quantity = parsePositiveNumber(serving.quantity);
  const unit = serving.unit.trim();
  const [autoGrams, setAutoGrams] = useState<string | null>(null);
  const cookedSuffix = t("serving.cookedSuffix");
  const isCooked = unit.endsWith(cookedSuffix);
  const baseUnit = isCooked ? unit.slice(0, -cookedSuffix.length).trim() : unit;
  const weightAutoFilled = autoGrams !== null && serving.grams === autoGrams;

  function applyUnit(nextBase: string, cooked: boolean) {
    const label = cooked ? `${nextBase || t("serving.units.portion")} ${cookedSuffix}` : nextBase;
    onChange("unit", label);
    const key = cooked ? null : servingUnitKey(nextBase);
    const reference = key ? references.find((entry) => entry.unitKey === key) : undefined;
    if (reference) {
      const nextGrams = formatAmount(reference.grams);
      if (onApplyReference) {
        onApplyReference(reference.quantity, reference.grams);
      } else {
        onChange("quantity", formatAmount(reference.quantity));
        onChange("grams", nextGrams);
      }
      setAutoGrams(nextGrams);
      return;
    }
    if (weightAutoFilled) {
      onChange("grams", "");
      onChange("quantity", "1");
    }
    setAutoGrams(null);
  }

  function chipLabel(key: ServingUnitKey) {
    return t(`serving.units.${key}`);
  }
  const preview =
    grams && (!unit || quantity)
      ? format.unitWeight({
          nutritionBasis: "PER_100G",
          servingSizeG: grams,
          servingQuantity: unit ? quantity : null,
          servingUnit: unit || null,
        })
      : null;

  return (
    <View style={styles.root}>
      <Text style={[styles.title, dir.text]}>
        {perServingMode ? t("serving.sectionTitle") : t("serving.sectionTitleOptional")}
      </Text>

      <View style={[styles.grid, dir.row]}>
        <View style={styles.quantityCell}>
          <FormInput
            key={`serving-quantity-${language}`}
            label={t("serving.quantityLabel")}
            value={serving.quantity}
            onChangeText={(value) => onChange("quantity", value)}
            onFocus={onLinkedFocus}
            onBlur={() => onLinkedBlur?.("quantity")}
            error={quantityError}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.unitCell}>
          <FormInput
            key={`serving-unit-${language}`}
            label={t("serving.unitLabel")}
            value={serving.unit}
            onChangeText={(value) => onChange("unit", value)}
            placeholder={t("serving.unitPlaceholder")}
          />
        </View>
      </View>

      <View style={[styles.suggestions, dir.row]}>
        {SERVING_UNIT_KEYS.map((key) => {
          const label = chipLabel(key);
          const active = baseUnit === label;
          return (
            <Pressable
              key={key}
              onPress={() => applyUnit(active ? "" : label, isCooked)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.chipPressed]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => applyUnit(baseUnit, !isCooked)}
          accessibilityRole="button"
          accessibilityState={{ selected: isCooked }}
          style={({ pressed }) => [styles.chip, styles.cookedChip, isCooked && styles.chipActive, pressed && styles.chipPressed]}
        >
          <Text style={[styles.chipText, isCooked && styles.chipTextActive]}>{t("serving.cooked")}</Text>
        </Pressable>
      </View>

      <FormInput
        key={`serving-weight-${language}`}
        label={perServingMode ? t("serving.weightLabelServing") : t("serving.weightLabelOptional")}
        value={serving.grams}
        onChangeText={(value) => onChange("grams", value)}
        onFocus={onLinkedFocus}
        onBlur={() => onLinkedBlur?.("grams")}
        error={weightError}
        keyboardType="decimal-pad"
      />

      <FormInput
        key={`serving-volume-${language}`}
        label={volumeRequired ? t("serving.volumeLabelRequired") : t("serving.volumeLabelOptional")}
        value={serving.milliliters}
        onChangeText={(value) => onChange("milliliters", value)}
        onFocus={onLinkedFocus}
        onBlur={() => onLinkedBlur?.("milliliters")}
        error={volumeError}
        keyboardType="decimal-pad"
      />

      {weightAutoFilled ? (
        <Text style={[styles.hint, styles.hintSource, dir.text]}>{t("serving.weightFromProduct")}</Text>
      ) : null}
      {isCooked ? (
        <Text style={[styles.hint, dir.text]}>{t("serving.cookedHint")}</Text>
      ) : null}

      <Text style={[styles.hint, dir.text]}>
        {perServingMode ? t("serving.hintServing") : t("serving.hint")}
      </Text>

      {preview ? (
        <View style={[styles.preview, dir.alignStart]}>
          <Text style={styles.previewText}>{preview}</Text>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        gap: spacing.xs,
      },
      title: {
        ...typography.footnote,
        fontFamily: fonts.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
      },
      grid: {
        gap: spacing.ms,
      },
      quantityCell: {
        flex: 2,
      },
      unitCell: {
        flex: 3,
      },
      suggestions: {
        flexWrap: "wrap",
        gap: spacing.xs + 2,
        marginTop: -spacing.xs,
        marginBottom: spacing.sm,
      },
      chip: {
        minHeight: 32,
        justifyContent: "center",
        paddingHorizontal: spacing.ms,
        borderRadius: radius.round,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      chipActive: {
        borderColor: colors.accentFill,
        backgroundColor: colors.accentFill,
      },
      cookedChip: {
        borderStyle: "dashed",
      },
      hintSource: {
        color: colors.accent,
      },
      chipPressed: {
        opacity: 0.75,
      },
      chipText: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      chipTextActive: {
        fontFamily: fonts.semibold,
        color: colors.onAccent,
      },
      hint: {
        ...typography.caption,
        color: colors.textMuted,
      },
      preview: {
        marginTop: spacing.xs,
      },
      previewText: {
        ...typography.caption,
        ...typography.number,
        color: colors.accent,
        backgroundColor: colors.accentSoft,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        overflow: "hidden",
      },
    }),
  );
