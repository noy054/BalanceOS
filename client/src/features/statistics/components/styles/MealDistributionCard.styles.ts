import { StyleSheet } from "react-native";
import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      list: {
        marginTop: spacing.sm,
        gap: spacing.sm,
      },
      row: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: "rgba(255,255,255,0.035)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.055)",
      },
      topLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: 8,
      },
      topLineRtl: {
        flexDirection: "row-reverse",
      },
      textBlock: {
        flex: 1,
        minWidth: 0,
      },
      mealName: {
        fontSize: 14,
        fontWeight: "800",
        color: colors.textPrimary,
      },
      mealSubText: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: "700",
        color: colors.textMuted,
      },
      percentBadge: {
        minWidth: 44,
        height: 28,
        paddingHorizontal: 10,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(74, 222, 128, 0.12)",
      },
      percentText: {
        fontSize: 12,
        fontWeight: "800",
        color: colors.primaryGreen,
      },
      track: {
        height: 7,
        borderRadius: radius.full,
        backgroundColor: colors.progressTrack,
        overflow: "hidden",
      },
      fill: {
        height: "100%",
        borderRadius: radius.full,
        backgroundColor: colors.primaryGreen,
      },
      emptyBox: {
        marginTop: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: "rgba(255,255,255,0.035)",
      },
      emptyText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textMuted,
      },
    }),
  );
