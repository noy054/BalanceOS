import { StyleSheet } from "react-native";

import { radius, spacing, useThemedStyles } from "../../../../shared/theme";

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
        paddingBottom: spacing.lg,
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
      },

      body: {
        paddingHorizontal: spacing.md,
        gap: spacing.lg,
      },

      bodySwitching: {
        opacity: 0.55,
      },

      stateCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      },

      mealsList: {
        gap: spacing.ms,
      },
    }),
  );
