import { Text, View } from "react-native";

import { rowStyles } from "./styles/NutritionRow.styles";

type Props = {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
  last?: boolean;
  isRTL: boolean;
};

export function NutritionRow({
  label,
  value,
  unit,
  highlight,
  last,
  isRTL,
}: Props) {
  return (
    <View
      style={[
        rowStyles.row,
        !last && rowStyles.rowBorder,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
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

      <Text
        style={[
          rowStyles.value,
          highlight && rowStyles.valueHighlight,
          {
            textAlign: isRTL ? "left" : "right",
            writingDirection: "ltr",
          },
        ]}
      >
        {value} <Text style={rowStyles.unit}>{unit}</Text>
      </Text>
    </View>
  );
}
