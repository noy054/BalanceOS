import { ReactNode } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  spacing,
  states,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { MacroValues } from "./NutritionLine";
import { FoodCardValues } from "./FoodCardValues";
import { FoodThumb } from "./FoodThumb";

type Props = {
  title: string;
  meta?: string | null;
  basis?: string | null;
  calories?: number;
  macros?: MacroValues;
  last?: boolean;
  trailing?: ReactNode;
  imageUrl?: string | null;
  fallbackIcon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
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
  imageUrl,
  fallbackIcon,
  onPress,
  accessibilityHint,
}: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();

  const subline = [basis, meta].filter(Boolean).join(" · ");

  const content = (
    <View style={[styles.main, dir.row]}>
      {fallbackIcon ? (
        <FoodThumb imageUrl={imageUrl} fallbackIcon={fallbackIcon} size={44} />
      ) : null}

      <View style={styles.body}>
        <View style={[styles.header, dir.row]}>
          <Text style={[styles.title, dir.text]} numberOfLines={2}>
            {title}
          </Text>
          {trailing}
        </View>
        {subline ? (
          <Text style={[styles.subline, dir.text]} numberOfLines={2}>
            {subline}
          </Text>
        ) : null}

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
      </View>
    </View>
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
        paddingVertical: spacing.ms,
      },
      main: {
        alignItems: "center",
        gap: spacing.ms,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      footer: {
        alignItems: "center",
        gap: spacing.sm,
        marginTop: 2,
      },
      values: {
        flex: 1,
        minWidth: 0,
      },
      rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.glassBorder,
      },
      header: {
        alignItems: "flex-start",
        gap: spacing.sm,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xxs,
      },
      title: {
        ...typography.bodyStrong,
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
        color: colors.textPrimary,
      },
      subline: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
    }),
  );
