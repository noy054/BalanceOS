import { StyleSheet } from "react-native";

import {
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      imageSection: {
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
      },

      imageBox: {
        width: 72,
        height: 72,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      },

      imagePreview: {
        width: "100%",
        height: "100%",
      },

      pressed: {
        opacity: 0.7,
      },

      textWrap: {
        flex: 1,
        gap: spacing.sm,
      },

      title: {
        ...typography.callout,
        fontWeight: "600",
        color: colors.textPrimary,
      },

      imageActionsRow: {
        flexWrap: "wrap",
        gap: spacing.sm,
      },
    }),
  );
