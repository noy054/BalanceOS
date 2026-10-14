import { StyleSheet } from "react-native";
import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      grid: {
        marginTop: spacing.sm,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      item: {
        width: "48%",
        minHeight: 92,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: "rgba(255,255,255,0.035)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.055)",
        justifyContent: "space-between",
      },
      label: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.textMuted,
      },
      value: {
        marginTop: 6,
        fontSize: 19,
        fontWeight: "900",
      },
      valueDefault: {
        color: colors.textPrimary,
      },
      valueGood: {
        color: colors.primaryGreen,
      },
      valueDanger: {
        color: colors.danger,
      },
      valueMuted: {
        color: colors.textMuted,
      },
      sub: {
        marginTop: 5,
        fontSize: 10,
        fontWeight: "600",
        lineHeight: 14,
        color: colors.textMuted,
      },
    }),
  );
