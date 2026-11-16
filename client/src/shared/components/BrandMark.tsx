import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { fonts, useThemedStyles } from "../theme";

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function BrandMark({ size = 22, style }: Props) {
  const styles = useStyles();

  return (
    <View style={[styles.row, style]} accessible accessibilityLabel="TrackMode">
      <Text style={[styles.track, { fontSize: size, lineHeight: Math.round(size * 1.2) }]}>
        Track
      </Text>
      <Text style={[styles.mode, { fontSize: size, lineHeight: Math.round(size * 1.2) }]}>
        Mode
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
      track: {
        fontFamily: fonts.semibold,
        letterSpacing: -0.4,
        color: colors.textPrimary,
      },
      mode: {
        fontFamily: fonts.semibold,
        letterSpacing: -0.4,
        color: colors.accent,
      },
    }),
  );
