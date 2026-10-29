import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { spacing, states, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { MacroValues } from "./NutritionLine";
import { FoodCardValues } from "./FoodCardValues";

type Props = {
  title: string;
  meta?: string | null;
  basis?: string | null;
  calories?: number;
  macros?: MacroValues;
  last?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityHint?: string;
};

export function FoodLineItem({
  title,
  meta,
  basis,
  calories,
  macros,
  last = false,
  trailing,
  onPress,
  accessibilityHint,
}: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();

  const content = (
    <>
      <View style={[styles.header, dir.row]}>
        <View style={styles.body}>
          <Text style={[styles.title, dir.text]} numberOfLines={2}>
            {title}
          </Text>
          {meta ? (
            <Text style={[styles.meta, dir.text]} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
        </View>
        {basis ? (
          <Text
            style={[styles.basis, { textAlign: dir.isRTL ? "left" : "right" }]}
            numberOfLines={2}
          >
            {basis}
          </Text>
        ) : null}
        {trailing}
      </View>

      {calories != null && macros ? (
        <View style={[styles.footer, dir.row]}>
          <View style={styles.values}>
            <FoodCardValues calories={calories} macros={macros} />
          </View>
          {onPress ? (
            <MaterialCommunityIcons name={dir.forwardIcon} size={22} color={colors.textMuted} />
          ) : null}
        </View>
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, !last && styles.rowBorder]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, basis].filter(Boolean).join(", ")}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        gap: spacing.md,
        paddingVertical: spacing.md,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      footer: {
        alignItems: "center",
        gap: spacing.sm,
      },
      values: {
        flex: 1,
        minWidth: 0,
      },
      rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      header: {
        alignItems: "flex-start",
        gap: spacing.md,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xxs,
      },
      title: {
        ...typography.bodyStrong,
        fontSize: 17,
        lineHeight: 24,
        color: colors.textPrimary,
      },
      meta: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      basis: {
        ...typography.footnote,
        ...typography.number,
        lineHeight: 24,
        maxWidth: "45%",
        color: colors.textSecondary,
      },
    }),
  );
