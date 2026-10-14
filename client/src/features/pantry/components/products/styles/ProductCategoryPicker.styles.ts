import { Platform, StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        borderRadius: radius.xl,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        gap: spacing.md,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 1,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
          },
          android: { elevation: 6 },
        }),
      },
      label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
      },
      chipActive: {
        borderColor: colors.primaryGreen,
        backgroundColor: colors.primaryGreenLight,
      },
      chipText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textSecondary,
      },
      chipTextActive: {
        color: colors.primaryGreen,
        fontWeight: "600",
      },
    }),
  );
