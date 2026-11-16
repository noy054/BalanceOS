import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { compactNumber, dayDate, formatStat } from "../helpers/nutrients";
import { DayTrendPoint } from "../types";
import { StatCard } from "./StatCard";

type Props = {
  trend: DayTrendPoint[];
};

type Status = "on" | "under" | "over" | "empty";

const CHART_HEIGHT = 150;
const TOLERANCE = 0.15;

function statusOf(point: DayTrendPoint): Status {
  if (!point.logged) return "empty";
  if (point.target <= 0) return "on";
  const diff = (point.calories - point.target) / point.target;
  if (Math.abs(diff) <= TOLERANCE) return "on";
  return diff > 0 ? "over" : "under";
}

export function CalorieBarsCard({ trend }: Props) {
  const { t, i18n } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();
  const { colors, resolvedTheme } = useAppTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const kcal = t("units.kcal");

  const palette: Record<Status, string> = {
    on: colors.accentFill,
    under: resolvedTheme === "dark" ? colors.accentBorder : withAlpha(colors.accent, 0.45),
    over: colors.warning,
    empty: colors.glassBorder,
  };

  const max = Math.max(1, ...trend.map((p) => Math.max(p.calories, p.target))) * 1.12;
  const latestTarget = trend[trend.length - 1]?.target ?? 0;
  const dense = trend.length > 14;
  const showValues = trend.length <= 7;
  const point = selected !== null ? trend[selected] : null;
  const indexed = trend.map((day, index) => ({ day, index }));
  const columns = dir.isRTL ? [...indexed].reverse() : indexed;

  const weekday = (date: string) =>
    dayDate(date).toLocaleDateString(i18n.language, { weekday: "short", timeZone: "UTC" });
  const dayMonth = (date: string) => `${Number(date.slice(8))}.${Number(date.slice(5, 7))}`;

  const legend: { key: Status; label: string }[] = [
    { key: "on", label: t("trend.onTarget") },
    { key: "under", label: t("trend.under") },
    { key: "over", label: t("trend.over") },
    { key: "empty", label: t("trend.notLogged") },
  ];

  return (
    <StatCard
      title={t("trend.title")}
      trailing={
        latestTarget > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {t("trend.targetLabel", { value: formatStat(latestTarget, "kcal") })}
            </Text>
          </View>
        ) : null
      }
    >
      <Text style={[styles.readout, dir.text]} accessibilityLiveRegion="polite">
        {point
          ? point.logged
            ? t("trend.readout", {
                day: `${weekday(point.date)} ${dayMonth(point.date)}`,
                value: formatStat(point.calories, "kcal"),
                target: formatStat(point.target, "kcal"),
                unit: kcal,
              })
            : t("trend.readoutEmpty", { day: `${weekday(point.date)} ${dayMonth(point.date)}` })
          : t("trend.tapHint")}
      </Text>

      <View style={styles.chart}>
        {columns.map(({ day, index }) => {
          const status = statusOf(day);
          const height = day.logged ? Math.max((day.calories / max) * CHART_HEIGHT, 4) : 3;
          const targetBottom = day.target > 0 ? (day.target / max) * CHART_HEIGHT : null;
          const isSelected = selected === index;
          const showLabel = !dense || index % 5 === (trend.length - 1) % 5 || isSelected;

          return (
            <Pressable
              key={day.date}
              style={styles.slot}
              onPress={() => setSelected(isSelected ? null : index)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={
                day.logged
                  ? t("trend.readout", {
                      day: `${weekday(day.date)} ${dayMonth(day.date)}`,
                      value: formatStat(day.calories, "kcal"),
                      target: formatStat(day.target, "kcal"),
                      unit: kcal,
                    })
                  : t("trend.readoutEmpty", { day: `${weekday(day.date)} ${dayMonth(day.date)}` })
              }
            >
              <View style={styles.plot}>
                {targetBottom !== null ? (
                  <View style={[styles.targetLine, { bottom: targetBottom }]} />
                ) : null}
                {(showValues && day.logged) || isSelected ? (
                  <Text
                    style={[
                      styles.value,
                      isSelected && styles.valueSelected,
                      { bottom: height + 4 },
                    ]}
                    numberOfLines={1}
                  >
                    {day.logged ? compactNumber(day.calories) : "—"}
                  </Text>
                ) : null}
                <View
                  style={[
                    styles.bar,
                    dense && styles.barDense,
                    { height, backgroundColor: palette[status] },
                    isSelected && styles.barSelected,
                  ]}
                />
              </View>
              <View style={styles.axisCell}>
                {showLabel ? (
                  <>
                    {!dense ? (
                      <Text style={[styles.axisDay, isSelected && styles.axisSelected]} numberOfLines={1}>
                        {weekday(day.date)}
                      </Text>
                    ) : null}
                    <Text style={[styles.axisDate, isSelected && styles.axisSelected]} numberOfLines={1}>
                      {Number(day.date.slice(8))}
                    </Text>
                  </>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.legend, dir.row]}>
        {legend.map((item) => (
          <View key={item.key} style={[styles.legendItem, dir.row]}>
            <View style={[styles.swatch, { backgroundColor: palette[item.key] }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </StatCard>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.sm,
        backgroundColor: colors.glassBorder,
      },
      badgeText: {
        ...typography.caption,
        ...typography.number,
        color: colors.textSecondary,
      },
      readout: {
        ...typography.footnote,
        ...typography.number,
        minHeight: 18,
        color: colors.textSecondary,
      },
      chart: {
        flexDirection: "row",
        alignItems: "flex-end",
      },
      slot: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
      },
      plot: {
        alignSelf: "stretch",
        height: CHART_HEIGHT,
        alignItems: "center",
        justifyContent: "flex-end",
      },
      targetLine: {
        position: "absolute",
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.textMuted,
      },
      value: {
        position: "absolute",
        left: -12,
        right: -12,
        ...typography.caption,
        ...typography.number,
        fontSize: 11,
        textAlign: "center",
        color: colors.textSecondary,
      },
      valueSelected: {
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      bar: {
        width: "56%",
        maxWidth: 26,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
      },
      barDense: {
        width: "64%",
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
      },
      barSelected: {
        borderWidth: 1.5,
        borderColor: colors.textPrimary,
      },
      axisCell: {
        alignItems: "center",
        minHeight: 32,
        paddingTop: spacing.xs,
      },
      axisDay: {
        ...typography.caption,
        fontSize: 11,
        color: colors.textSecondary,
      },
      axisDate: {
        ...typography.caption,
        ...typography.number,
        fontSize: 11,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },
      axisSelected: {
        color: colors.textPrimary,
        fontFamily: fonts.medium,
      },
      legend: {
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: spacing.md,
        rowGap: spacing.xs,
      },
      legendItem: {
        alignItems: "center",
        gap: spacing.xs,
      },
      swatch: {
        width: 10,
        height: 10,
        borderRadius: 3,
      },
      legendText: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
    }),
  );
