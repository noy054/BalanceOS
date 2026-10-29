import { Text, View } from "react-native";

import { formatGrams } from "../../../../shared/helpers/formatNumber";
import { useAppTheme } from "../../../../shared/theme";
import { MacroKey, macroColor } from "../../helpers/macroColors";
import { useRowStyles } from "./styles/NutritionRow.styles";

type Props = {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
  macro?: MacroKey;
  last?: boolean;
  isRTL: boolean;
};

export function NutritionRow({
  label,
  value,
  unit,
  highlight,
  macro,
  last,
  isRTL,
}: Props) {
  const rowStyles = useRowStyles();
  const { colors } = useAppTheme();
  const color = macro ? macroColor(macro, colors) : null;
  const formatted = formatGrams(value);

  return (
    <View
      style={[
        rowStyles.row,
        !last && rowStyles.rowBorder,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
      accessible
      accessibilityLabel={`${label}: ${formatted} ${unit}`}
    >
      <View style={[rowStyles.labelRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {color ? <View style={[rowStyles.dot, { backgroundColor: color }]} /> : null}
        <Text
          style={[
            rowStyles.label,
            highlight && rowStyles.labelHighlight,
            {
              textAlign: isRTL ? "right" : "left",
              writingDirection: isRTL ? "rtl" : "ltr",
            },
          ]}
        >
          {label}
        </Text>
      </View>

      <View
        style={[
          rowStyles.valueRow,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <Text
          style={[rowStyles.value, highlight && rowStyles.valueHighlight, color ? { color } : null]}
          numberOfLines={1}
        >
          {formatted}
        </Text>

        <Text
          style={[
            rowStyles.unit,
            {
              writingDirection: isRTL ? "rtl" : "ltr",
            },
          ]}
          numberOfLines={1}
        >
          {unit}
        </Text>
      </View>
    </View>
  );
}
