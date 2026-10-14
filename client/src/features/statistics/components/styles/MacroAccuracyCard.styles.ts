import { StyleSheet } from "react-native";
import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      subtitle: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: "600",
        color: colors.textMuted,
      },
      rangeMeta: {
        marginTop: 3,
        marginBottom: spacing.sm,
        fontSize: 11,
        fontWeight: "600",
        color: colors.textMuted,
      },
      row: {
        marginBottom: spacing.sm2,
      },
      rowHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: 5,
      },
      rowHeaderRtl: {
        flexDirection: "row-reverse",
      },
      macroName: {
        flex: 1,
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
      },
      macroNumbers: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textMuted,
      },
      track: {
        height: 6,
        backgroundColor: colors.progressTrack,
        borderRadius: radius.full,
        overflow: "hidden",
      },
      fill: {
        height: "100%",
        borderRadius: radius.full,
      },
      pctLabel: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 3,
      },
    }),
  );
