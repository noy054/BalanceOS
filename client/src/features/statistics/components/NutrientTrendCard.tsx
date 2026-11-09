import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { dayDate, formatStat, NutrientMeta } from "../helpers/nutrients";
import { niceScale, smoothRuns } from "../helpers/chart";
import { DayTrendPoint, NutrientKey } from "../types";
import { StatCard } from "./StatCard";

type Props = {
  trend: DayTrendPoint[];
  nutrients: NutrientMeta[];
  selected: NutrientKey;
  onSelect: (key: NutrientKey) => void;
};

const CHART_HEIGHT = 168;
const PLOT_TOP = 12;
const AXIS_WIDTH = 36;
const LINE = 2.5;
const FILL_STEP = 3;
const FILL_ALPHA = 0.3;
const LABEL_WIDTH = 44;

export function NutrientTrendCard({ trend, nutrients, selected, onSelect }: Props) {
  const { t, i18n } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();
  const [width, setWidth] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);

  const nutrient = nutrients.find((item) => item.key === selected) ?? nutrients[0];
  const key = nutrient.key;
  const unit = t(`units.${nutrient.unit}`);
  const valueOf = (day: DayTrendPoint) => day[key];
  const targetOf = (day: DayTrendPoint) => day.targets[key];

  const peak = Math.max(0, ...trend.map((day) => Math.max(day.logged ? valueOf(day) : 0, targetOf(day))));
  const scale = niceScale(peak);
  const plotHeight = CHART_HEIGHT - PLOT_TOP;
  const slot = trend.length > 0 ? width / trend.length : 0;
  const x = (index: number) => {
    const position = slot * index + slot / 2;
    return dir.isRTL ? width - position : position;
  };
  const y = (value: number) => PLOT_TOP + plotHeight - (value / scale.max) * plotHeight;

  const points = trend.map((day, index) =>
    day.logged && width > 0 ? { x: x(index), y: y(valueOf(day)) } : null,
  );
  const runs = smoothRuns(points);

  const segments = runs.flatMap((run, runIndex) =>
    run.slice(1).map((point, index) => {
      const previous = run[index];
      const length = Math.hypot(point.x - previous.x, point.y - previous.y);
      const angle = (Math.atan2(point.y - previous.y, point.x - previous.x) * 180) / Math.PI;
      return {
        key: `${runIndex}-${index}`,
        left: (previous.x + point.x) / 2 - (length + LINE) / 2,
        top: (previous.y + point.y) / 2 - LINE / 2,
        width: length + LINE,
        angle,
      };
    }),
  );

  const columns = runs.flatMap((run, runIndex) => {
    if (run.length < 2) return [];
    const ordered = [...run].sort((a, b) => a.x - b.x);
    const start = Math.round(ordered[0].x);
    const end = Math.round(ordered[ordered.length - 1].x);
    const result: { key: string; left: number; top: number; width: number }[] = [];
    let cursor = 0;
    for (let left = start; left < end; left += FILL_STEP) {
      while (cursor < ordered.length - 2 && ordered[cursor + 1].x < left) cursor += 1;
      const a = ordered[cursor];
      const b = ordered[cursor + 1];
      const ratio = b.x === a.x ? 0 : (left - a.x) / (b.x - a.x);
      result.push({
        key: `${runIndex}-${left}`,
        left,
        top: a.y + (b.y - a.y) * ratio,
        width: Math.min(FILL_STEP, end - left),
      });
    }
    return result;
  });

  const latestTarget = trend.length > 0 ? targetOf(trend[trend.length - 1]) : 0;
  const point = focus !== null ? trend[focus] : null;
  const labelEvery = trend.length > 14 ? 5 : trend.length > 7 ? 2 : 1;
  const latestIndex = trend.length - 1;
  const indexed = trend.map((day, index) => ({ day, index }));
  const hitColumns = dir.isRTL ? [...indexed].reverse() : indexed;

  const labelWidth = labelEvery === 1 && slot > 0 ? Math.min(LABEL_WIDTH, slot) : LABEL_WIDTH;
  const weekdayStyle = labelEvery === 1 && slot > 0 && slot < 40 ? "narrow" : "short";
  const weekday = (date: string, style: "narrow" | "short" = "short") =>
    dayDate(date).toLocaleDateString(i18n.language, { weekday: style, timeZone: "UTC" });
  const dayMonth = (date: string) => `${Number(date.slice(8))}.${Number(date.slice(5, 7))}`;
  const dayLabel = (date: string) => `${weekday(date)} ${dayMonth(date)}`;
  const describe = (day: DayTrendPoint) =>
    day.logged
      ? t("nutrientTrend.readout", {
          day: dayLabel(day.date),
          value: formatStat(valueOf(day), nutrient.unit),
          target: formatStat(targetOf(day), nutrient.unit),
          unit,
        })
      : t("trend.readoutEmpty", { day: dayLabel(day.date) });

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const ticks = [scale.max, scale.max / 2, 0];

  return (
    <StatCard title={t("nutrientTrend.title")} subtitle={t("nutrientTrend.subtitle")}>
      <View style={[styles.selector, dir.row]} accessibilityRole="tablist">
        {nutrients.map((item) => {
          const active = item.key === key;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                onSelect(item.key);
                setFocus(null);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.pressed]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={1}>
                {t(`macros.${item.key}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.readout, dir.row]} accessibilityLiveRegion="polite">
        {point ? (
          <>
            <Text style={[styles.readoutDay, dir.text]} numberOfLines={1}>
              {dayLabel(point.date)}
            </Text>
            {point.logged ? (
              <View style={[styles.readoutValues, dir.row]}>
                <View style={[styles.valueGroup, dir.row]}>
                  <Text style={[styles.readoutValue, { color: nutrient.color }]}>
                    {formatStat(valueOf(point), nutrient.unit)}
                  </Text>
                  <Text style={styles.readoutUnit}>{unit}</Text>
                </View>
                {targetOf(point) > 0 ? (
                  <View style={[styles.valueGroup, dir.row]}>
                    <Text style={styles.readoutUnit}>{t("comparison.target")}</Text>
                    <Text style={styles.readoutTarget}>{formatStat(targetOf(point), nutrient.unit)}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={styles.readoutUnit}>{t("trend.notLogged")}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.readoutHint, dir.text]}>{t("trend.tapHint")}</Text>
            {latestTarget > 0 ? (
              <View style={[styles.valueGroup, styles.targetLegend, dir.row]}>
                <View style={styles.targetSwatch} />
                <Text style={styles.readoutUnit}>{t("comparison.target")}</Text>
                <Text style={styles.readoutTarget}>{formatStat(latestTarget, nutrient.unit)}</Text>
              </View>
            ) : null}
          </>
        )}
      </View>

      <View style={[styles.chartRow, dir.row]}>
        <View style={styles.axis}>
          {ticks.map((tick) => (
            <Text
              key={tick}
              style={[styles.axisText, { top: y(tick) - 8, textAlign: dir.isRTL ? "left" : "right" }]}
              numberOfLines={1}
            >
              {formatStat(tick, nutrient.unit)}
            </Text>
          ))}
        </View>

        <View style={styles.plotWrap}>
          <View style={styles.plot} onLayout={handleLayout}>
            {ticks.map((tick) => (
              <View key={tick} style={[styles.grid, { top: y(tick) }]} />
            ))}

            {columns.map((column) => (
              <View
                key={column.key}
                style={[
                  styles.fill,
                  {
                    left: column.left,
                    top: column.top,
                    width: column.width,
                    height: Math.max(0, CHART_HEIGHT - column.top),
                    backgroundImage: `linear-gradient(180deg, ${withAlpha(nutrient.color, FILL_ALPHA * ((CHART_HEIGHT - column.top) / plotHeight))} 0%, ${withAlpha(nutrient.color, 0)} 100%)`,
                  },
                ]}
              />
            ))}

            {latestTarget > 0 ? <View style={[styles.targetLine, { top: y(latestTarget) }]} /> : null}

            {segments.map((segment) => (
              <View
                key={segment.key}
                style={[
                  styles.segment,
                  {
                    left: segment.left,
                    top: segment.top,
                    width: segment.width,
                    backgroundColor: nutrient.color,
                    transform: [{ rotate: `${segment.angle}deg` }],
                  },
                ]}
              />
            ))}

            {focus !== null && width > 0 ? (
              <View style={[styles.focusLine, { left: x(focus) - 0.5 }]} />
            ) : null}

            {points.map((item, index) => {
              if (!item) return null;
              const active = focus === index;
              const size = active ? 14 : index === latestIndex ? 11 : 9;
              return (
                <View
                  key={trend[index].date}
                  style={[
                    styles.dot,
                    {
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      left: item.x - size / 2,
                      top: item.y - size / 2,
                      backgroundColor: nutrient.color,
                      boxShadow: `0 0 ${active ? 14 : 8}px ${withAlpha(nutrient.color, 0.55)}`,
                    },
                  ]}
                />
              );
            })}

            <View style={styles.hitRow}>
              {hitColumns.map(({ day, index }) => (
                <Pressable
                  key={day.date}
                  style={styles.hit}
                  onPress={() => setFocus(focus === index ? null : index)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: focus === index }}
                  accessibilityLabel={describe(day)}
                />
              ))}
            </View>
          </View>

          <View style={[styles.xAxis, { height: labelEvery === 1 ? 36 : 18 }]}>
            {width > 0
              ? trend.map((day, index) => {
                  const fromEnd = latestIndex - index;
                  const active = focus === index;
                  if (fromEnd % labelEvery !== 0 && !active) return null;
                  const centered = x(index) - labelWidth / 2;
                  const left = Math.min(Math.max(centered, -spacing.xs), width - labelWidth + spacing.xs);
                  const edge = left > centered ? styles.xCellStart : left < centered ? styles.xCellEnd : null;
                  return (
                    <View key={day.date} style={[styles.xCell, edge, active && styles.xCellActive, { left, width: labelWidth }]}>
                      {labelEvery === 1 ? (
                        <Text style={[styles.xDay, active && styles.xActive]} numberOfLines={1}>
                          {weekday(day.date, weekdayStyle)}
                        </Text>
                      ) : null}
                      <Text style={[styles.xDate, active && styles.xActive]} numberOfLines={1}>
                        {labelEvery === 1 || active ? dayMonth(day.date) : Number(day.date.slice(8))}
                      </Text>
                    </View>
                  );
                })
              : null}
          </View>
        </View>
      </View>
    </StatCard>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      selector: {
        flexWrap: "wrap",
        gap: spacing.xs,
        padding: spacing.xs,
        borderRadius: radius.xxl,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      option: {
        flexGrow: 1,
        minHeight: 36,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.sm2,
        borderRadius: radius.round,
      },
      optionActive: {
        backgroundColor: colors.accentFill,
      },
      optionText: {
        ...typography.label,
        fontSize: 14,
        color: colors.textSecondary,
      },
      optionTextActive: {
        fontFamily: fonts.semibold,
        color: colors.onAccent,
      },
      pressed: {
        opacity: 0.75,
      },
      readout: {
        minHeight: 26,
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      readoutDay: {
        flexShrink: 1,
        ...typography.footnote,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      readoutValues: {
        alignItems: "baseline",
        gap: spacing.ms,
      },
      valueGroup: {
        alignItems: "baseline",
        gap: spacing.xs,
      },
      readoutValue: {
        ...typography.value,
        writingDirection: "ltr",
      },
      readoutTarget: {
        ...typography.callout,
        ...typography.number,
        writingDirection: "ltr",
        color: colors.textSecondary,
      },
      readoutUnit: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },
      readoutHint: {
        flex: 1,
        ...typography.footnote,
        color: colors.textSecondary,
      },
      chartRow: {
        gap: spacing.xs,
      },
      axis: {
        width: AXIS_WIDTH,
        height: CHART_HEIGHT,
      },
      axisText: {
        position: "absolute",
        left: 0,
        right: 0,
        ...typography.caption,
        ...typography.number,
        fontSize: 10,
        lineHeight: 16,
        fontFamily: fonts.regular,
        writingDirection: "ltr",
        color: colors.textMuted,
      },
      plotWrap: {
        flex: 1,
        minWidth: 0,
      },
      plot: {
        height: CHART_HEIGHT,
      },
      grid: {
        position: "absolute",
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.glassBorder,
      },
      fill: {
        position: "absolute",
      },
      targetLine: {
        position: "absolute",
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.textMuted,
      },
      targetLegend: {
        alignItems: "center",
      },
      targetSwatch: {
        width: 14,
        borderTopWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.textMuted,
      },
      segment: {
        position: "absolute",
        height: LINE,
        borderRadius: LINE,
      },
      dot: {
        position: "absolute",
        borderWidth: 2,
        borderColor: colors.canvas,
      },
      focusLine: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: colors.glassBorder,
      },
      hitRow: {
        position: "absolute",
        flexDirection: "row",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      hit: {
        flex: 1,
      },
      xAxis: {
        marginTop: spacing.sm,
      },
      xCellStart: {
        alignItems: "flex-start",
      },
      xCellEnd: {
        alignItems: "flex-end",
      },
      xCell: {
        position: "absolute",
        top: 0,
        alignItems: "center",
      },
      xCellActive: {
        zIndex: 1,
        borderRadius: radius.sm,
        backgroundColor: colors.glassSurface,
      },
      xDay: {
        ...typography.caption,
        fontSize: 11,
        color: colors.textSecondary,
      },
      xDate: {
        ...typography.caption,
        ...typography.number,
        fontSize: 10,
        fontFamily: fonts.regular,
        writingDirection: "ltr",
        color: colors.textMuted,
      },
      xActive: {
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },
    }),
  );
