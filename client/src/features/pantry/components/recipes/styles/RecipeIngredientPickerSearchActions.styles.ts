import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      searchRow: {
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        height: 50,
        gap: spacing.sm,
      },

      searchInput: {
        flex: 1,
        minWidth: 0,
        fontSize: 15,
        color: colors.textPrimary,
        paddingVertical: 0,
      },

      quickActionsRow: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
        alignItems: "center",
      },

      secondaryBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 36,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 4,
      },

      secondaryBtnPressed: {
        opacity: 0.7,
      },

      secondaryBtnText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
      },
    }),
  );
