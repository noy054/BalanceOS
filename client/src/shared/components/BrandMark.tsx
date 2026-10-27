import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { useThemedStyles } from "../theme";

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function BrandMark({ size = 22, style }: Props) {
  const styles = useStyles();

  return (
    <View style={[styles.row, style]} accessible accessibilityLabel="BalanceOS">
      <Text style={[styles.balance, { fontSize: size, lineHeight: Math.round(size * 1.2) }]}>
        Balance
      </Text>
      <Text style={[styles.os, { fontSize: size, lineHeight: Math.round(size * 1.2) }]}>
        OS
      </Text>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "baseline",
      },
      balance: {
        fontWeight: "700",
        letterSpacing: -0.4,
        color: colors.textPrimary,
      },
      os: {
        fontWeight: "700",
        letterSpacing: -0.4,
        color: colors.accent,
      },
    }),
  );
