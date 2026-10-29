import { StyleSheet, View } from "react-native";

import { spacing, useThemedStyles } from "../../theme";

export function ListDivider() {
  const styles = useStyles();
  return <View style={styles.divider} />;
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      divider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: spacing.md,
        backgroundColor: colors.border,
      },
    }),
  );
