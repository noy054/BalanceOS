import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing, useThemedStyles } from "../../theme";
import { useFormTone } from "../FormTone";

type Props = {
  children: ReactNode;
};

export function StickyFooter({ children }: Props) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const glass = useFormTone() === "glass";

  return (
    <View
      style={[
        styles.footer,
        glass && styles.footerGlass,
        { paddingBottom: Math.max(insets.bottom, spacing.md) },
      ]}
    >
      {children}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      footer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.ms,
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        gap: spacing.sm,
      },
      footerGlass: {
        backgroundColor: colors.canvas,
        borderTopColor: colors.glassBorder,
      },
    }),
  );
