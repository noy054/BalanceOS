import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { ServingFormState } from "../../helpers/productForm";
import { parsePositiveNumber } from "../../helpers/savedMealDraft";
import { useServingFormat } from "../../hooks/useServingFormat";

type Props = {
  serving: ServingFormState;
  perServingMode: boolean;
  language: string;
  weightError?: string;
  quantityError?: string;
  onChange: (key: keyof ServingFormState, value: string) => void;
};

export function ServingFields({
  serving,
  perServingMode,
  language,
  weightError,
  quantityError,
  onChange,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const format = useServingFormat();

  const grams = parsePositiveNumber(serving.grams);
  const quantity = parsePositiveNumber(serving.quantity);
  const unit = serving.unit.trim();
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

      <FormInput
        key={`serving-weight-${language}`}
        label={perServingMode ? t("serving.weightLabelServing") : t("serving.weightLabelOptional")}
        value={serving.grams}
        onChangeText={(value) => onChange("grams", value)}
        error={weightError}
        keyboardType="decimal-pad"
      />

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
        fontWeight: "600",
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
