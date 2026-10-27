import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
      wrapper: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.ms,
        gap: spacing.sm,
      },

      quickActionsRow: {
        gap: spacing.sm,
      },

      quickAction: {
        flex: 1,
      },
    }),
  );
