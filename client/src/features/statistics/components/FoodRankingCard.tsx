import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { FoodThumb } from "../../pantry/components/food/FoodThumb";
import { FOOD_ICONS } from "../../pantry/hooks/useFoodCardModels";
import { formatStat } from "../helpers/nutrients";
import { StatCard } from "./StatCard";

type Row = {
  name: string;
  imageUrl: string | null;
  value: string;
  detail: string;
};

type Props = {
  title: string;
  subtitle: string;
  valueLabel: string;
  rows: Row[];
};

export function FoodRankingCard({ title, subtitle, valueLabel, rows }: Props) {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();

  return (
    <StatCard title={title} subtitle={subtitle}>
      {rows.length === 0 ? (
        <Text style={[styles.empty, dir.text]}>{t("noData")}</Text>
      ) : (
        <View>
          {rows.map((row, index) => (
            <View
              key={`${row.name}-${index}`}
              style={[styles.row, dir.row, index < rows.length - 1 && styles.divider]}
              accessible
              accessibilityLabel={`${index + 1}. ${row.name}, ${row.value} ${valueLabel}, ${row.detail}`}
            >
              <View style={[styles.rank, index === 0 && styles.rankFirst]}>
                <Text style={[styles.rankText, index === 0 && styles.rankTextFirst]}>{index + 1}</Text>
              </View>
              <FoodThumb imageUrl={row.imageUrl} fallbackIcon={FOOD_ICONS.product} size={44} />
              <View style={styles.body}>
                <Text style={[styles.name, dir.text]} numberOfLines={2}>
                  {row.name}
                </Text>
                <Text style={[styles.detail, dir.text]} numberOfLines={1}>
                  {row.detail}
                </Text>
              </View>
              <View style={styles.valueBox}>
                <Text style={styles.value} numberOfLines={1}>
                  {row.value}
                </Text>
                <Text style={styles.valueLabel} numberOfLines={1}>
                  {valueLabel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </StatCard>
  );
}

export function useFoodRankingRows() {
  const { t } = useTranslation("statistics");
  return {
    byCalories: (items: { name: string; imageUrl: string | null; totalCalories: number; count: number }[]) =>
      items.map((item) => ({
        name: item.name,
        imageUrl: item.imageUrl,
        value: formatStat(item.totalCalories, "kcal"),
        detail: t("foodInsights.usedTimes", { count: item.count }),
      })),
    byFrequency: (items: { name: string; imageUrl: string | null; count: number; avgCalories: number }[]) =>
      items.map((item) => ({
        name: item.name,
        imageUrl: item.imageUrl,
        value: `${item.count}×`,
        detail: t("foodInsights.avgCalories", { value: formatStat(item.avgCalories, "kcal") }),
      })),
  };
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      empty: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      row: {
        alignItems: "center",
        gap: spacing.ms,
        paddingVertical: spacing.ms,
      },
      divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.glassBorder,
      },
      rank: {
        width: 26,
        height: 26,
        borderRadius: radius.sm,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.glassBorder,
      },
      rankFirst: {
        backgroundColor: colors.accentSoft,
      },
      rankText: {
        ...typography.caption,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textSecondary,
      },
      rankTextFirst: {
        color: colors.accent,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      name: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      detail: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      valueBox: {
        alignItems: "center",
        minWidth: 52,
      },
      value: {
        ...typography.value,
        fontFamily: fonts.bold,
        color: colors.textPrimary,
      },
      valueLabel: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },
    }),
  );
