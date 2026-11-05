import { Pressable, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { AmountUnit, amountUnits, getServing, ServingSource } from "../../helpers/serving";
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
  const unitLabel =
    fixedUnitLabel ??
    (unit === "servings"
      ? servingsLabel
      : unit === "milliliters"
        ? t("product.millilitersUnit")
        : t("recipe.gramsLabel"));
  const canToggle = Boolean(product && amountUnits(product).length > 1 && onToggleUnit && !fixedUnitLabel);
  const accessibilityName = `${name}, ${unitLabel}`;

  const isEmpty = !(parseFloat(value.replace(",", ".")) > 0);

  return (
    <View style={[styles.amountBox, isEmpty && styles.amountBoxEmpty, dir.row]}>
      <TextInput
        style={styles.amountInput}
        value={value}
        onChangeText={onChangeValue}
        keyboardType="decimal-pad"
        placeholder={t("recipe.gramsPlaceholder")}
        placeholderTextColor={colors.textMuted}
        textAlign="center"
        selectTextOnFocus
        accessibilityLabel={accessibilityName}
      />

      <View style={styles.amountDivider} />

      {canToggle ? (
        <Pressable
          onPress={onToggleUnit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("serving.toggleA11y", { unit: servingsLabel })}
          style={({ pressed }) => [styles.unitToggle, dir.row, pressed && styles.unitTogglePressed]}
        >
          <Text style={styles.unitToggleText} numberOfLines={1}>
            {unitLabel}
          </Text>
          <MaterialCommunityIcons name="swap-horizontal" size={14} color={colors.accent} />
        </Pressable>
      ) : (
        <Text style={styles.unitLabel} numberOfLines={1}>
          {unitLabel}
        </Text>
      )}
    </View>
  );
}
