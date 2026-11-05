import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { formatStat } from "../helpers/nutrients";
import { StatisticsSummary } from "../types";
import { StatCard } from "./StatCard";

type Props = {
  summary: StatisticsSummary;
};

type MiniStat = {
  key: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  value: string;
  label: string;
  sub: string;
};

export function SummaryCard({ summary }: Props) {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const kcal = t("units.kcal");
  const grams = t("units.g");

  const stats: MiniStat[] = [
    {
      key: "protein",
      icon: "fire",
      color: colors.macroProtein,
      value: formatStat(summary.avgProtein, "g"),
      label: t("summary.avgProtein"),
      sub: t("summary.ofTarget", { value: `${formatStat(summary.targetProtein, "g")} ${grams}` }),
    },
    {
      key: "logged",
      icon: "calendar-check-outline",
      color: colors.accent,
      value: `${summary.loggedDays}/${summary.rangeDays}`,
      label: t("summary.loggedDays"),
      sub: t("summary.loggedDaysSub"),
    },
    {
      key: "onTarget",
      icon: "bullseye-arrow",
      color: colors.accent,
      value: `${summary.onTargetDays}/${summary.rangeDays}`,
      label: t("summary.onTarget"),
      sub: t("summary.onTargetSub"),
    },
  ];

  return (
    <StatCard title={t("summary.title")}>
      <View style={[styles.hero, dir.row]}>
        <View
          style={styles.heroCell}
          accessible
          accessibilityLabel={`${t("summary.avgCalories")} ${formatStat(summary.avgCalories, "kcal")} ${kcal}, ${t("summary.ofTarget", { value: `${formatStat(summary.targetCalories, "kcal")} ${kcal}` })}`}
        >
          <Text style={styles.heroLabel}>{t("summary.avgCalories")}</Text>
          <Text style={styles.heroValue} numberOfLines={1}>
            {formatStat(summary.avgCalories, "kcal")}
          </Text>
          <Text style={styles.heroSub} numberOfLines={1}>
            {t("summary.ofTarget", { value: `${formatStat(summary.targetCalories, "kcal")} ${kcal}` })}
          </Text>
        </View>

        <View style={styles.heroDivider} />

        <View
          style={styles.heroCell}
          accessible
          accessibilityLabel={`${t("summary.nutritionAccuracy")} ${summary.nutritionAccuracy}%. ${t("summary.nutritionAccuracySub")}`}
        >
          <Text style={styles.heroLabel}>{t("summary.nutritionAccuracy")}</Text>
          <Text style={styles.heroValue} numberOfLines={1}>
            {`${summary.nutritionAccuracy}%`}
          </Text>
          <Text style={styles.heroSub} numberOfLines={2}>
            {t("summary.nutritionAccuracySub")}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={[styles.stats, dir.row]}>
        {stats.map((stat) => (
          <View
            key={stat.key}
            style={styles.stat}
            accessible
            accessibilityLabel={`${stat.label} ${stat.value}, ${stat.sub}`}
          >
            <View style={[styles.statValueRow, dir.row]}>
              <MaterialCommunityIcons name={stat.icon} size={18} color={stat.color} />
              <Text style={styles.statValue} numberOfLines={1}>
                {stat.value}
              </Text>
            </View>
            <Text style={styles.statLabel} numberOfLines={2}>
              {stat.label}
            </Text>
            <Text style={styles.statSub} numberOfLines={2}>
              {stat.sub}
            </Text>
          </View>
        ))}
      </View>
    </StatCard>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      hero: {
        alignItems: "stretch",
      },
      heroCell: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: 2,
        paddingHorizontal: spacing.xs,
      },
      heroDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: colors.glassBorder,
      },
      heroLabel: {
        ...typography.footnote,
        textAlign: "center",
        color: colors.textSecondary,
      },
      heroValue: {
        ...typography.display,
        fontFamily: fonts.bold,
        fontSize: 36,
        lineHeight: 44,
        textAlign: "center",
        color: colors.textPrimary,
      },
      heroSub: {
        ...typography.caption,
        fontFamily: fonts.regular,
        textAlign: "center",
        color: colors.textSecondary,
      },
      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.glassBorder,
      },
      stats: {
        gap: spacing.xs,
      },
      stat: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: 2,
      },
      statValueRow: {
        alignItems: "center",
        gap: spacing.xs,
      },
      statValue: {
        ...typography.value,
        fontFamily: fonts.bold,
        fontSize: 20,
        color: colors.textPrimary,
      },
      statLabel: {
        ...typography.footnote,
        textAlign: "center",
        color: colors.textPrimary,
      },
      statSub: {
        ...typography.caption,
        fontFamily: fonts.regular,
        textAlign: "center",
        color: colors.textMuted,
      },
    }),
  );
