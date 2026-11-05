import { ReactNode } from "react";
import type { ComponentProps } from "react";
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
import { FoodThumb } from "./FoodThumb";

type Props = {
  title: string;
  meta?: string | null;
  basis?: string | null;
  calories: number;
  macros: MacroValues;
  onPress: () => void;
  onLongPress?: () => void;
  actions?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  imageUrl?: string | null;
  fallbackIcon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  selected?: boolean;
  highlighted?: boolean;
  accessibilityHint?: string;
};

const THUMB_SIZE = 48;

export function FoodItemCard({
  title,
  meta,
  basis,
  calories,
  macros,
  onPress,
  onLongPress,
  actions,
  leading,
  trailing,
  imageUrl,
  fallbackIcon,
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
  const subline = [basis, meta].filter(Boolean).join(" · ");
  const thumb =
    leading ??
    (fallbackIcon ? (
      <FoodThumb imageUrl={imageUrl} fallbackIcon={fallbackIcon} size={THUMB_SIZE} />
    ) : null);

  const end = selected ? (
    <MaterialCommunityIcons name="check-circle" size={24} color={colors.accent} />
  ) : actions ? (
    <View style={[styles.actions, dir.row]}>{actions}</View>
  ) : (
    trailing ?? null
  );

  return (
    <View
      style={[
        styles.card,
        dir.row,
        highlighted && styles.cardHighlighted,
        selected && styles.cardSelected,
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
        accessibilityRole="button"
        accessibilityLabel={[title, basis, meta, `${calorieText} ${unit}`].filter(Boolean).join(", ")}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ selected }}
        style={({ pressed }) => [styles.main, dir.row, pressed && !selected && styles.cardPressed]}
      >
        {thumb}

        <View style={styles.body}>
          <Text style={[styles.title, dir.text]} numberOfLines={2}>
            {title}
          </Text>
          {subline ? (
            <Text style={[styles.subline, dir.text]} numberOfLines={1}>
              {subline}
            </Text>
          ) : null}
          <View style={styles.values}>
            <FoodCardValues calories={calories} macros={macros} />
          </View>
        </View>
      </Pressable>

      {end ? (
        <View style={[styles.end, actions && !selected ? styles.endActions : null]}>{end}</View>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        alignItems: "stretch",
        backgroundColor: colors.glassCard,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        overflow: "hidden",
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
      main: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: spacing.ms,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.ms,
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
      subline: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
      values: {
        marginTop: 2,
      },
      actions: {
        gap: spacing.xs,
      },
      end: {
        minWidth: 32,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.sm,
      },
      endActions: {
        justifyContent: "flex-end",
        paddingBottom: spacing.sm,
      },
    }),
  );
