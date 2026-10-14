import { StyleSheet } from "react-native";
import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      content: {
        marginTop: spacing.sm,
        gap: spacing.md,
      },
      section: {
        gap: spacing.sm,
      },
      subTitle: {
        fontSize: 13,
        fontWeight: "800",
        color: colors.textMuted,
      },
      list: {
        gap: spacing.sm,
      },
      foodRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: "rgba(255,255,255,0.035)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.055)",
      },
      foodRowRtl: {
        flexDirection: "row-reverse",
      },
      rankBadge: {
        width: 28,
        height: 28,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.07)",
      },
      rankText: {
        fontSize: 12,
        fontWeight: "800",
        color: colors.textPrimary,
      },
      foodTextBlock: {
        flex: 1,
        minWidth: 0,
      },
      foodName: {
        fontSize: 13,
        fontWeight: "800",
        color: colors.textPrimary,
      },
      foodMeta: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: "700",
        color: colors.textMuted,
      },
      foodStat: {
        fontSize: 12,
        fontWeight: "800",
        color: colors.primaryGreen,
      },
      divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.07)",
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
