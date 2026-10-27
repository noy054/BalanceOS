import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../theme";
import { useDirection } from "../../hooks/useDirection";
import { SectionHeader } from "./SectionHeader";

type Props = {
  title?: string;
  hint?: string;
  trailing?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function FormSection({ title, hint, trailing, children, style, contentStyle }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={style}>
      {title ? <SectionHeader title={title} trailing={trailing} /> : null}

      <View style={[styles.card, contentStyle]}>{children}</View>

      {hint ? <Text style={[styles.hint, dir.text]}>{hint}</Text> : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
      },
      hint: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.xs,
      },
    }),
  );
