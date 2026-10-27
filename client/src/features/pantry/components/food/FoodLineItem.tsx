import { ReactNode } from "react";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories } from "../../../../shared/helpers/formatNumber";
import { FoodThumb } from "./FoodThumb";
import { MacroValues, NutritionLine } from "./NutritionLine";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  title: string;
  meta?: string | null;
  imageUrl?: string | null;
  fallbackIcon: IconName;
  calories?: number;
  macros?: MacroValues;
  last?: boolean;
  trailing?: ReactNode;
};

export function FoodLineItem({
  title,
  meta,
  imageUrl,
  fallbackIcon,
  calories,
  macros,
  last = false,
  trailing,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.row, dir.row, !last && styles.rowBorder]}>
      <FoodThumb imageUrl={imageUrl} fallbackIcon={fallbackIcon} size={40} />

      <View style={styles.body}>
        <Text style={[styles.title, dir.text]} numberOfLines={2}>
          {title}
        </Text>

        {meta ? (
          <Text style={[styles.meta, dir.text]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}

        {macros ? <NutritionLine macros={macros} /> : null}
      </View>

      {calories != null ? (
        <View style={styles.calories}>
          <Text style={styles.calorieValue}>{formatCalories(calories)}</Text>
          <Text style={styles.calorieUnit}>{t("product.calUnit")}</Text>
        </View>
      ) : null}

      {trailing}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        gap: spacing.ms,
        paddingVertical: spacing.ms,
      },
      rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      title: {
        ...typography.callout,
        fontWeight: "600",
        color: colors.textPrimary,
      },
      meta: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      calories: {
        alignItems: "center",
        minWidth: 44,
      },
      calorieValue: {
        ...typography.bodyStrong,
        ...typography.number,
        color: colors.textPrimary,
      },
      calorieUnit: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
      },
    }),
  );
