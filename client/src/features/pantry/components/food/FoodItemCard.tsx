import { ReactNode } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import {
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories } from "../../../../shared/helpers/formatNumber";
import { FoodThumb } from "./FoodThumb";
import { MacroValues } from "./NutritionLine";
import { NutritionStrip } from "./NutritionStrip";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  title: string;
  meta?: string | null;
  imageUrl?: string | null;
  fallbackIcon: IconName;
  calories: number;
  macros: MacroValues;
  onPress: () => void;
  onImagePress?: () => void;
  trailing?: ReactNode;
  selected?: boolean;
  highlighted?: boolean;
  accessibilityHint?: string;
};

export function FoodItemCard({
  title,
  meta,
  imageUrl,
  fallbackIcon,
  calories,
  macros,
  onPress,
  onImagePress,
  trailing,
  selected = false,
  highlighted = false,
  accessibilityHint,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();

  const calorieText = formatCalories(calories);
  const unit = t("product.calUnit");

  const thumb = <FoodThumb imageUrl={imageUrl} fallbackIcon={fallbackIcon} />;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, meta, `${calorieText} ${unit}`].filter(Boolean).join(", ")}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.cardHighlighted,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.topRow, dir.row]}>
        {onImagePress && imageUrl ? (
          <Pressable
            onPress={onImagePress}
            hitSlop={4}
            accessibilityRole="imagebutton"
            accessibilityLabel={title}
          >
            {thumb}
          </Pressable>
        ) : (
          thumb
        )}

        <View style={styles.body}>
          <View style={[styles.titleRow, dir.row]}>
            <Text style={[styles.title, dir.text]} numberOfLines={2}>
              {title}
            </Text>

            {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
          </View>

          {meta ? (
            <Text style={[styles.meta, dir.text]} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
        </View>
      </View>

      <NutritionStrip calories={calories} macros={macros} />
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.ms,
      },
      cardHighlighted: {
        backgroundColor: colors.accentSoft,
        borderColor: colors.accentBorder,
      },
      cardSelected: {
        borderColor: colors.accent,
        borderWidth: 1.5,
        backgroundColor: colors.accentSoft,
      },
      cardPressed: {
        backgroundColor: colors.surfaceMuted,
      },
      topRow: {
        alignItems: "flex-start",
        gap: spacing.ms,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      titleRow: {
        alignItems: "flex-start",
        gap: spacing.sm,
      },
      title: {
        flex: 1,
        ...typography.bodyStrong,
        color: colors.textPrimary,
        paddingTop: 1,
      },
      trailing: {
        marginVertical: -spacing.sm,
        marginHorizontal: -spacing.xs - 2,
      },
      meta: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
    }),
  );
