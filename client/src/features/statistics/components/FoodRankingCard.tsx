import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { FoodThumb } from "../../pantry/components/food/FoodThumb";
import { FOOD_ICONS } from "../../pantry/hooks/useFoodCardModels";
import { formatStat } from "../helpers/nutrients";
import { MostUsedFood, TopFoodItem } from "../types";
import { StatCard } from "./StatCard";

type Row = {
  name: string;
  imageUrl: string | null;
  tag: string | null;
  detail: string;
  value: string;
  valueLabel: string;
};

type Props = {
  title: string;
  subtitle: string;
  rows: Row[];
};

export function FoodRankingCard({ title, subtitle, rows }: Props) {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const { colors } = useAppTheme();
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
              accessibilityLabel={`${index + 1}. ${row.name}${row.tag ? `, ${row.tag}` : ""}, ${row.detail}, ${row.value} ${row.valueLabel}`}
            >
              <View style={[styles.rank, index === 0 && styles.rankFirst]}>
                <Text style={[styles.rankText, index === 0 && styles.rankTextFirst]}>{index + 1}</Text>
              </View>
              <FoodThumb imageUrl={row.imageUrl} fallbackIcon={FOOD_ICONS.product} size={44} />
              <View style={[styles.body, dir.alignStart]}>
                <View style={[styles.nameRow, dir.row]}>
                  <Text style={[styles.name, dir.text]} numberOfLines={2}>
                    {row.name}
                  </Text>
                  {row.tag ? (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{row.tag}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={[styles.countRow, dir.row]}>
                  <MaterialCommunityIcons name="history" size={13} color={colors.textMuted} />
                  <Text style={[styles.detail, dir.text]} numberOfLines={1}>
                    {row.detail}
                  </Text>
                </View>
              </View>
              <View style={styles.valueBox}>
                <Text style={styles.value} numberOfLines={1}>
                  {row.value}
                </Text>
                <Text style={styles.valueLabel} numberOfLines={2}>
                  {row.valueLabel}
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
    byCalories: (items: TopFoodItem[]): Row[] =>
      items.map((item) => {
        const perEntry = item.count > 0 ? item.totalCalories / item.count : 0;
        const basis = item.unitBasis ?? "entry";
        return {
          name: item.name,
          imageUrl: item.imageUrl,
          tag: item.unitBasis === "meal" ? t("foodInsights.mealTag") : null,
          detail: t("foodInsights.loggedCount", { count: item.count }),
          value: formatStat(item.unitCalories ?? perEntry, "kcal"),
          valueLabel: t(`foodInsights.perBasis.${basis}`),
        };
      }),
    byFrequency: (items: MostUsedFood[]): Row[] =>
      items.map((item) => ({
        name: item.name,
        imageUrl: item.imageUrl,
        tag: item.isSnack ? t("foodInsights.snackTag") : null,
        detail: t("foodInsights.avgCalories", { value: formatStat(item.avgCalories, "kcal") }),
        value: `${item.count}×`,
        valueLabel: t("foodInsights.times"),
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
        fontFamily: fonts.medium,
        color: colors.textSecondary,
      },
      rankTextFirst: {
        color: colors.accent,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: 3,
      },
      nameRow: {
        alignItems: "center",
        gap: 6,
        maxWidth: "100%",
      },
      name: {
        ...typography.bodyStrong,
        flexShrink: 1,
        color: colors.textPrimary,
      },
      tag: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 6,
        backgroundColor: withAlpha(colors.textPrimary, 0.07),
      },
      tagText: {
        fontFamily: fonts.medium,
        fontSize: 11,
        color: colors.textSecondary,
      },
      countRow: {
        alignItems: "center",
        gap: 4,
      },
      detail: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      valueBox: {
        alignItems: "center",
        width: 74,
      },
      value: {
        ...typography.value,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },
      valueLabel: {
        ...typography.caption,
        fontFamily: fonts.regular,
        fontSize: 11,
        lineHeight: 14,
        textAlign: "center",
        color: colors.textMuted,
      },
    }),
  );
