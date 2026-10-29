import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import {
  radius,
  spacing,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories } from "../../../../shared/helpers/formatNumber";
import { MacroValues } from "./NutritionLine";
import { FoodCardValues } from "./FoodCardValues";

type Props = {
  title: string;
  meta?: string | null;
  calories: number;
  macros: MacroValues;
  onPress: () => void;
  onLongPress?: () => void;
  actions?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  highlighted?: boolean;
  accessibilityHint?: string;
};

export function FoodItemCard({
  title,
  meta,
  calories,
  macros,
  onPress,
  onLongPress,
  actions,
  trailing,
  selected = false,
  highlighted = false,
  accessibilityHint,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const calorieText = formatCalories(calories);
  const unit = t("product.calUnit");

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityLabel={[title, meta, `${calorieText} ${unit}`].filter(Boolean).join(", ")}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.cardHighlighted,
        selected && styles.cardSelected,
        pressed && !selected && styles.cardPressed,
      ]}
    >
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

        {selected ? (
          <View style={styles.end}>
            <MaterialCommunityIcons name="check-circle" size={24} color={colors.accent} />
          </View>
        ) : actions ? (
          <View style={[styles.actions, dir.row]}>{actions}</View>
        ) : trailing ? (
          <View style={styles.end}>{trailing}</View>
        ) : null}
      </View>

      <FoodCardValues calories={calories} macros={macros} />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        gap: spacing.ms,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: "transparent",
        paddingVertical: spacing.ms + 2,
        paddingHorizontal: spacing.md,
      },
      cardHighlighted: {
        borderColor: colors.accentBorder,
      },
      cardSelected: {
        borderColor: colors.accent,
      },
      cardPressed: {
        opacity: 0.85,
      },
      header: {
        alignItems: "center",
        gap: spacing.sm,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      title: {
        ...typography.bodyStrong,
        fontSize: 16,
        lineHeight: 22,
        color: colors.textPrimary,
      },
      meta: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      actions: {
        alignItems: "center",
        gap: spacing.sm,
      },
      end: {
        width: 32,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  );
