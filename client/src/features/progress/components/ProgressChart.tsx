import { useId, useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { useTranslation } from "react-i18next";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { diffDays, fromDateKey } from "../../../shared/helpers/dateKey";
import { fonts, useAppTheme } from "../../../shared/theme";
import { MetricPoint } from "../types";
import { axisDateTicks, niceScale } from "../helpers/chartScale";

type Props = {
  points: MetricPoint[];
  unit: string;
  accessibilityLabel: string;
  formatValue: (value: number) => string;
};

const HEIGHT = 196;
const TOP = 22;
const BOTTOM = 26;
const AXIS_WIDTH = 44;
const END_PAD = 12;
const DOT = 4;

export function ProgressChart({
  points,
  unit,
  accessibilityLabel,
  formatValue,
}: Props) {
  const { colors } = useAppTheme();
  const { i18n } = useTranslation();
  const [width, setWidth] = useState(0);
  const gradientId = `progress-area-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  function onLayout(event: LayoutChangeEvent) {
    setWidth(Math.round(event.nativeEvent.layout.width));
  }

  const chart = useMemo(() => {
    if (width === 0 || points.length === 0) return null;
    const scale = niceScale(points.map((point) => point.value));
    const first = points[0].date;
    const last = points[points.length - 1].date;
    const span = Math.max(diffDays(first, last), 0);
    const plotLeft = AXIS_WIDTH;
    const plotRight = width - END_PAD;
    const plotWidth = Math.max(plotRight - plotLeft, 1);
    const plotBottom = HEIGHT - BOTTOM;
    const plotHeight = plotBottom - TOP;

    const xOf = (date: string) =>
      span === 0
        ? plotLeft + plotWidth / 2
        : plotLeft + (diffDays(first, date) / span) * plotWidth;
    const yOf = (value: number) =>
      plotBottom - ((value - scale.min) / (scale.max - scale.min)) * plotHeight;

    const coords = points.map((point) => ({
      x: xOf(point.date),
      y: yOf(point.value),
    }));
    const line = coords
      .map(
        (c, index) =>
          `${index === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`,
      )
      .join(" ");
    const area =
      coords.length > 1
        ? `${line} L ${coords[coords.length - 1].x.toFixed(1)} ${plotBottom} L ${coords[0].x.toFixed(1)} ${plotBottom} Z`
        : null;

    const spansYears =
      fromDateKey(first).getFullYear() !== fromDateKey(last).getFullYear();
    const dateFormat = new Intl.DateTimeFormat(i18n.language, {
      day: "numeric",
      month: "short",
      ...(spansYears ? { year: "2-digit" as const } : {}),
    });
    const maxTicks = Math.max(2, Math.min(5, Math.floor(plotWidth / 72)));
    const dateTicks = axisDateTicks(first, last, maxTicks).map((date) => ({
      x: xOf(date),
      label: dateFormat.format(fromDateKey(date)),
    }));

    return {
      scale,
      coords,
      line,
      area,
      dateTicks,
      plotLeft,
      plotRight,
      plotBottom,
      yOf,
    };
  }, [width, points, i18n.language]);

  const labelColor = colors.textMuted;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      style={{ height: HEIGHT }}
    >
      {chart ? (
        <Svg key={width} width={width} height={HEIGHT}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.22} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          <SvgText
            x={0}
            y={11}
            fontSize={11}
            fontFamily={fonts.medium}
            fill={labelColor}
          >
            {unit}
          </SvgText>

          {chart.scale.ticks.map((tick) => {
            const y = chart.yOf(tick);
            return (
              <G key={`tick-${tick}`}>
                <Line
                  x1={chart.plotLeft}
                  x2={chart.plotRight}
                  y1={y}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth={1}
                  strokeDasharray={tick === chart.scale.min ? undefined : "3 4"}
                />
                <SvgText
                  x={chart.plotLeft - 8}
                  y={y + 4}
                  fontSize={11}
                  fontFamily={fonts.regular}
                  fill={labelColor}
                  textAnchor="end"
                >
                  {formatValue(tick)}
                </SvgText>
              </G>
            );
          })}

          {chart.dateTicks.map((tick, index) => (
            <SvgText
              key={`date-${index}`}
              x={tick.x}
              y={HEIGHT - 6}
              fontSize={11}
              fontFamily={fonts.regular}
              fill={labelColor}
              textAnchor={
                chart.dateTicks.length === 1
                  ? "middle"
                  : index === 0
                    ? "start"
                    : index === chart.dateTicks.length - 1
                      ? "end"
                      : "middle"
              }
            >
              {tick.label}
            </SvgText>
          ))}

          {chart.area ? (
            <Path d={chart.area} fill={`url(#${gradientId})`} />
          ) : null}
          {chart.coords.length > 1 ? (
            <Path
              d={chart.line}
              fill="none"
              stroke={colors.accent}
              strokeWidth={2.2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {chart.coords.map((coord, index) => {
            const isLast = index === chart.coords.length - 1;
            return (
              <Circle
                key={`dot-${points[index].date}`}
                cx={coord.x}
                cy={coord.y}
                r={isLast ? DOT + 1 : DOT}
                fill={isLast ? colors.accent : colors.surface}
                stroke={colors.accent}
                strokeWidth={2}
              />
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}
