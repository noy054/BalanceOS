import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      scroll: {
        flex: 1,
      },

      scrollContent: {
        paddingBottom: spacing.xl,
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.ml,
        gap: spacing.xl,
      },

      body: {
        gap: spacing.md,
      },

      bodySwitching: {
        opacity: 0.55,
      },

      meals: {
        gap: spacing.sm2,
      },
    }),
  );
