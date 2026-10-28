import { Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { AmountUnit, getServing, ServingSource } from "../../helpers/serving";
import { useDraftRowStyles } from "./styles/DraftItemRow.styles";

type Props = {
  name: string;
  value: string;
  unit: AmountUnit;
  product?: ServingSource | null;
  fixedUnitLabel?: string;
  onChangeValue: (value: string) => void;
  onToggleUnit?: () => void;
};

export function AmountUnitInput({
  name,
  value,
  unit,
  product,
  fixedUnitLabel,
  onChangeValue,
  onToggleUnit,
}: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useDraftRowStyles();
  const dir = useDirection();

  const serving = product ? getServing(product) : null;
  const servingsLabel = serving?.unit ?? t("recipe.servingsLabel");
  const unitLabel = fixedUnitLabel ?? (unit === "servings" ? servingsLabel : t("recipe.gramsLabel"));
  const canToggle = Boolean(serving?.unitGrams && onToggleUnit && !fixedUnitLabel);
  const accessibilityName = `${name}, ${unitLabel}`;

  return (
    <View style={[styles.amountBox, dir.row]}>
      <TextInput
        style={styles.amountInput}
        value={value}
        onChangeText={onChangeValue}
        keyboardType="decimal-pad"
        placeholder={t("recipe.gramsPlaceholder")}
        placeholderTextColor={colors.textMuted}
        textAlign="center"
        accessibilityLabel={accessibilityName}
      />

      {canToggle ? (
        <Pressable
          onPress={onToggleUnit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("serving.toggleA11y", { unit: servingsLabel })}
          style={({ pressed }) => [
            styles.unitToggle,
            unit === "servings" && styles.unitToggleActive,
            pressed && styles.unitTogglePressed,
          ]}
        >
          <Text
            style={[styles.unitToggleText, unit === "servings" && styles.unitToggleTextActive]}
            numberOfLines={1}
          >
            {unitLabel}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.unitLabel} numberOfLines={1}>
          {unitLabel}
        </Text>
      )}
    </View>
  );
}
