import { StyleSheet, View } from "react-native";

import { spacing } from "../../theme";

export function ListGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  gap: {
    height: spacing.sm,
  },
});
