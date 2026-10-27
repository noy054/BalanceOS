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
      imageModalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.ml,
      },

      imageModalContent: {
        width: "100%",
        maxWidth: 420,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        padding: spacing.md,
        gap: spacing.ms,
      },

      imageModalHeader: {
        alignItems: "center",
        gap: spacing.ms,
      },

      imageModalTitle: {
        flex: 1,
        ...typography.headline,
        color: colors.textPrimary,
      },

      imageModalImage: {
        width: "100%",
        height: 340,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
      },
    }),
  );
