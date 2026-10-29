import { StyleSheet } from "react-native";

import { spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useEditorStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      fieldGroup: { gap: spacing.ms },
      hint: { ...typography.caption, color: colors.textMuted },
      error: { ...typography.caption, color: colors.danger },
      pair: { gap: spacing.sm },
      pairItem: { flex: 1, minWidth: 0 },
    }),
  );
