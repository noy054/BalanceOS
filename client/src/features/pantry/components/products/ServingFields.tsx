import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { useDirection } from "../../../../shared/hooks/useDirection";
import {
  fonts,
  radius,
  spacing,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../../shared/theme";
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
import {
  estimateServing,
  ServingAmountField,
} from "../../helpers/servingEstimates";

type Props = {
  serving: ServingFormState;
  perServingMode: boolean;
  language: string;
  weightError?: string;
  volumeError?: string;
  volumeRequired?: boolean;
  quantityError?: string;
  references?: ServingReference[];
  productName?: string;
  basis?: ServingAmountField;
  lockedBasis?: ServingAmountField | null;
  onChange: (key: keyof ServingFormState, value: string) => void;
  onLinkedFocus?: () => void;
  onLinkedBlur?: (key: "quantity" | "grams" | "milliliters") => void;
  onApplyReference?: (
    quantity: number,
    amount: number,
    field: ServingAmountField,
  ) => void;
  onPatch?: (patch: Partial<ServingFormState>) => void;
};

type AutoAmount = {
  field: ServingAmountField;
  perUnit: number;
  source: "product" | "volume" | "food";
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
  productName = "",
  basis = "grams",
  lockedBasis = null,
  onChange,
  onLinkedFocus,
  onLinkedBlur,
  onApplyReference,
  onPatch,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const format = useServingFormat();

  const grams = parsePositiveNumber(serving.grams);
  const quantity = parsePositiveNumber(serving.quantity);
  const unit = serving.unit.trim();
  const [auto, setAuto] = useState<AutoAmount | null>(null);
  const [noEstimate, setNoEstimate] = useState(false);
  const cookedSuffix = t("serving.cookedSuffix");
  const isCooked = unit.endsWith(cookedSuffix);
  const baseUnit = isCooked ? unit.slice(0, -cookedSuffix.length).trim() : unit;
  const autoAmount = auto ? parsePositiveNumber(serving[auto.field]) : null;
  const autoFilled =
    auto !== null &&
    autoAmount !== null &&
    quantity !== null &&
    Math.abs(autoAmount - quantity * auto.perUnit) < 0.051;

  function fill(
    nextQuantity: number,
    amount: number,
    field: ServingAmountField,
  ) {
    if (onApplyReference) {
      onApplyReference(nextQuantity, amount, field);
    } else {
      onChange("quantity", formatAmount(nextQuantity));
      onChange(field, formatAmount(amount));
    }
  }

  function applyUnit(nextBase: string, cooked: boolean) {
    const label = cooked
      ? `${nextBase || t("serving.units.portion")} ${cookedSuffix}`
      : nextBase;
    const key = cooked ? null : servingUnitKey(nextBase);
    const reference = key
      ? references.find((entry) => entry.unitKey === key)
      : undefined;
    const estimate =
      key && !reference ? estimateServing(key, basis, productName) : null;
    setNoEstimate(Boolean(key) && !reference && !estimate);

    if (reference) {
      onChange("unit", label);
      fill(reference.quantity, reference.grams, "grams");
      setAuto({
        field: "grams",
        perUnit: reference.grams / reference.quantity,
        source: "product",
      });
      return;
    }
    if (estimate) {
      const count = quantity ?? 1;
      onChange("unit", label);
      fill(
        count,
        Math.round(count * estimate.perUnit * 10) / 10,
        estimate.field,
      );
      setAuto({
        field: estimate.field,
        perUnit: estimate.perUnit,
        source: estimate.source,
      });
      return;
    }
    if (autoFilled && auto) {
      const patch: Partial<ServingFormState> = {
        unit: label,
        quantity: "1",
        [auto.field]: "",
      };
      if (onPatch) onPatch(patch);
      else
        Object.entries(patch).forEach(([field, value]) =>
          onChange(field as keyof ServingFormState, value),
        );
    } else {
      onChange("unit", label);
    }
    setAuto(null);
  }

  function changeQuantity(value: string) {
    onChange("quantity", value);
    const next = parsePositiveNumber(value);
    if (!perServingMode && autoFilled && auto && next) {
      onChange(
        auto.field,
        formatAmount(Math.round(next * auto.perUnit * 10) / 10),
      );
    }
  }

  const estimateLabel =
    autoFilled && auto
      ? auto.source === "product"
        ? t("serving.weightFromProduct")
        : t(
            auto.source === "volume"
              ? "serving.estimateVolume"
              : "serving.estimateFood",
            {
              amount: formatAmount(auto.perUnit),
              measure:
                auto.field === "milliliters"
                  ? t("serving.millilitersShort")
                  : t("serving.gramsShort"),
              unit: baseUnit,
            },
          )
      : noEstimate && unit
        ? t(
            basis === "milliliters"
              ? "serving.noEstimateVolume"
              : "serving.noEstimate",
          )
        : null;

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
        {perServingMode
          ? t("serving.sectionTitle")
          : t("serving.sectionTitleOptional")}
      </Text>

      <View style={[styles.grid, dir.row]}>
        <View style={styles.quantityCell}>
          <FormInput
            key={`serving-quantity-${language}`}
            label={t("serving.quantityLabel")}
            value={serving.quantity}
            onChangeText={changeQuantity}
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
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => applyUnit(baseUnit, !isCooked)}
          accessibilityRole="button"
          accessibilityState={{ selected: isCooked }}
          style={({ pressed }) => [
            styles.chip,
            styles.cookedChip,
            isCooked && styles.chipActive,
            pressed && styles.chipPressed,
          ]}
        >
          <Text style={[styles.chipText, isCooked && styles.chipTextActive]}>
            {t("serving.cooked")}
          </Text>
        </Pressable>
      </View>

      {lockedBasis === "milliliters" ? null : (
        <FormInput
          key={`serving-weight-${language}`}
          label={
            perServingMode
              ? t("serving.weightLabelServing")
              : t("serving.weightLabelOptional")
          }
          value={serving.grams}
          onChangeText={(value) => onChange("grams", value)}
          onFocus={onLinkedFocus}
          onBlur={() => onLinkedBlur?.("grams")}
          error={weightError}
          keyboardType="decimal-pad"
        />
      )}

      {lockedBasis === "grams" ? null : (
        <FormInput
          key={`serving-volume-${language}`}
          label={
            volumeRequired
              ? t("serving.volumeLabelRequired")
              : t("serving.volumeLabelOptional")
          }
          value={serving.milliliters}
          onChangeText={(value) => onChange("milliliters", value)}
          onFocus={onLinkedFocus}
          onBlur={() => onLinkedBlur?.("milliliters")}
          error={volumeError}
          keyboardType="decimal-pad"
        />
      )}

      {estimateLabel ? (
        <View
          style={[styles.estimate, dir.row]}
          accessibilityLiveRegion="polite"
        >
          <MaterialCommunityIcons
            name={autoFilled ? "information-outline" : "pencil-outline"}
            size={14}
            color={autoFilled ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.hint,
              autoFilled ? styles.hintSource : styles.hintManual,
              styles.estimateText,
              dir.text,
            ]}
          >
            {estimateLabel}
          </Text>
        </View>
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
        fontFamily: fonts.medium,
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
      hintManual: {
        color: colors.textSecondary,
      },
      estimate: {
        alignItems: "flex-start",
        gap: 6,
      },
      estimateText: {
        flex: 1,
      },
      chipPressed: {
        opacity: 0.75,
      },
      chipText: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      chipTextActive: {
        fontFamily: fonts.medium,
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
