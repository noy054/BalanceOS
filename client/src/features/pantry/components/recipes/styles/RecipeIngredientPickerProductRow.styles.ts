import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      item: {
        alignItems: "center",
        paddingVertical: spacing.sm2,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
      },

      itemSelected: {
        backgroundColor: colors.primaryGreenLight,
        borderRadius: radius.md,
      },

      itemPressed: {
        opacity: 0.65,
      },

      itemInfo: {
        flex: 1,
        minWidth: 0,
      },

      itemName: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
      },

      itemBrand: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 1,
      },

      itemCals: {
        fontSize: 12,
        color: colors.textMuted,
        marginStart: spacing.sm,
        flexShrink: 1,
        textAlign: "right",
      },

      checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
        alignItems: "center",
        justifyContent: "center",
        marginStart: spacing.sm,
        flexShrink: 0,
      },

      checkCircleActive: {
        borderColor: colors.primaryGreen,
        backgroundColor: colors.primaryGreen,
      },
    }),
  );
