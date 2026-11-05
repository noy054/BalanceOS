import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { spacing, useThemedStyles } from "../../../../shared/theme";
import { CALCULATOR_STEPS, stepQuantity } from "../../helpers/calculatorAmount";
import { AmountUnit, formatAmount } from "../../helpers/serving";

type Props = {
  value: string;
  unit: AmountUnit;
  onChange: (value: string) => void;
  children: ReactNode;
};

export function QuantityStepper({ value, unit, onChange, children }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const steps = CALCULATOR_STEPS[unit];
  const parsed = parseFloat(value.replace(",", "."));
  const current = Number.isFinite(parsed) ? parsed : 0;

  function step(direction: 1 | -1) {
    onChange(formatAmount(stepQuantity(current, steps.quick, direction, steps.precision)));
  }

  return (
    <View style={[styles.row, dir.row]}>
      <IconButton
        icon="minus"
        variant="tonal"
        size={36}
        iconSize={18}
        accessibilityLabel={t("ingredientEdit.decrease")}
        onPress={() => step(-1)}
        disabled={current <= steps.precision}
      />
      {children}
      <IconButton
        icon="plus"
        variant="tonal"
        size={36}
        iconSize={18}
        accessibilityLabel={t("ingredientEdit.increase")}
        onPress={() => step(1)}
      />
    </View>
  );
}

const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        gap: spacing.xs,
      },
    }),
  );
