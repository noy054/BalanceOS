import { StyleSheet } from "react-native";

import { colors, spacing, radius } from "../../../../shared/theme";

export const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: "rgba(49, 216, 107, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(49, 216, 107, 0.18)",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.sm,
    maxWidth: "100%",
  },

  text: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryGreen,
    textAlign: "center",
    writingDirection: "ltr",
  },

  textRtl: {
    writingDirection: "rtl",
  },

  textBold: {
    fontSize: 13,
    fontWeight: "900",
  },
});

export const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    paddingTop: 0,
  },

  containerHighlight: {
    backgroundColor: "transparent",
    borderRadius: radius.md,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  labelHighlight: {
    color: colors.textPrimary,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    alignItems: "center",
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    label: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },

    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      justifyContent: isRTL ? ("flex-start" as const) : ("flex-start" as const),
    },
  };
}
