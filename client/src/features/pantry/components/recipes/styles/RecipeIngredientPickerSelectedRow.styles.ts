import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      selectedRow: {
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },

      selectedInfo: {
        flex: 1,
        minWidth: 0,
      },

      selectedName: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
      },

      selectedServing: {
        fontSize: 10,
        fontWeight: "700",
        color: colors.primaryGreen,
        marginTop: 1,
      },

      qtyBox: {
        alignItems: "center",
        gap: spacing.xs,
      },

      qtyInput: {
        width: 64,
        height: 34,
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        borderRadius: radius.md,
        fontSize: 14,
        fontWeight: "800",
        color: colors.textPrimary,
        paddingHorizontal: spacing.xs,
      },

      unitLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.textMuted,
        minWidth: 28,
        textAlign: "center",
      },

      unitToggle: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.cardBackgroundSoft,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 28,
      },

      unitToggleActive: {
        borderColor: colors.primaryGreenMid,
        backgroundColor: colors.primaryGreenLight,
      },

      unitTogglePressed: {
        opacity: 0.7,
      },

      unitToggleText: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.textMuted,
      },

      unitToggleTextActive: {
        color: colors.primaryGreen,
      },

      removeBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        flexShrink: 0,
      },

      removeBtnPressed: {
        opacity: 0.7,
      },
    }),
  );
