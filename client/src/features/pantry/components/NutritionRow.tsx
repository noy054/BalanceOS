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

      <View
        style={[
          rowStyles.valueRow,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <Text
          style={[rowStyles.value, highlight && rowStyles.valueHighlight]}
          numberOfLines={1}
        >
          {value}
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
