import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: spacing.xs,
      },

      checkCircleActive: {
        backgroundColor: colors.accentFill,
        borderColor: colors.accent,
      },
    }),
  );
