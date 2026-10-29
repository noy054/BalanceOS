import { StyleSheet } from "react-native";

import {
  fonts,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      fieldGroup: {
        marginBottom: spacing.md,
      },

      fieldLabel: {
        ...typography.label,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs + 2,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
