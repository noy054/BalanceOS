import { StyleSheet } from "react-native";

import { useThemedStyles } from "../../theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      content: {
        flex: 1,
        backgroundColor: colors.background,
      },
    }),
  );
