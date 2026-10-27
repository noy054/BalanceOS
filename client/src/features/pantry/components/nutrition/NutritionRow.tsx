import { Text, View } from "react-native";

import { formatGrams } from "../../../../shared/helpers/formatNumber";
import { useRowStyles } from "./styles/NutritionRow.styles";

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
  const rowStyles = useRowStyles();
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
