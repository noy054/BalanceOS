import { StyleSheet, View } from "react-native";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, useAppTheme, useThemedStyles } from "../../../shared/theme";

type Props = {
  values: number[];
  height?: number;
  color?: string;
};

export function UsageBars({ values, height = 36, color }: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const max = Math.max(1, ...values);
  const ordered = dir.isRTL ? [...values].reverse() : values;

  return (
    <View style={[styles.row, { height }]} importantForAccessibility="no-hide-descendants">
      {ordered.map((value, index) => (
        <View key={index} style={styles.slot}>
          <View
            style={[
              styles.bar,
              {
                height: value > 0 ? Math.max(2, (value / max) * height) : 1,
                backgroundColor: value > 0 ? (color ?? colors.accentFill) : colors.glassBorder,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 1,
      },
      slot: {
        flex: 1,
        justifyContent: "flex-end",
      },
      bar: {
        borderRadius: radius.xs,
      },
    }),
  );
