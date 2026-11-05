import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { fonts, spacing, typography, useThemedStyles, radius } from "../../theme";
import { useDirection } from "../../hooks/useDirection";
import { SectionHeader } from "./SectionHeader";
import { useFormTone } from "../FormTone";

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
  const glass = useFormTone() === "glass";

  return (
    <View style={style}>
      {title ? <SectionHeader title={title} trailing={trailing} /> : null}

      <View style={[glass ? styles.plain : styles.card, contentStyle]}>{children}</View>

      {hint ? <Text style={[styles.hint, dir.text]}>{hint}</Text> : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
      },
      plain: {
        gap: 0,
      },
      hint: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: spacing.sm,
      },
    }),
  );
