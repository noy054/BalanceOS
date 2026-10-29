import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

import { diffDays } from "../../../shared/helpers/dateKey";
import { spacing, typography, useThemedStyles } from "../../../shared/theme";
import { MetricPoint } from "../types";

type Props = {
  points: MetricPoint[];
  accessibilityLabel: string;
  formatValue: (value: number) => string;
  formatDate: (date: string) => string;
};

const HEIGHT = 150;
const DOT = 8;
const LINE = 2;
const PADDING = DOT;

type Position = { x: number; y: number };

export function ProgressChart({ points, accessibilityLabel, formatValue, formatDate }: Props) {
  const styles = useStyles();
  const [width, setWidth] = useState(0);

  function onLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin;
  const pad = spread === 0 ? Math.max(1, rawMax * 0.02) : spread * 0.15;
  const min = rawMin - pad;
  const max = rawMax + pad;

  const first = points[0]?.date;
  const totalDays = first ? Math.max(diffDays(first, points[points.length - 1].date), 1) : 1;
  const plotWidth = Math.max(width - PADDING * 2, 0);
  const plotHeight = HEIGHT - PADDING * 2;

  const positions: Position[] = points.map((point) => ({
    x: PADDING + (points.length === 1 ? plotWidth / 2 : (diffDays(first, point.date) / totalDays) * plotWidth),
    y: PADDING + (1 - (point.value - min) / (max - min)) * plotHeight,
  }));

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View style={styles.plot} onLayout={onLayout}>
        <View style={[styles.gridLine, { top: PADDING }]} />
        <View style={[styles.gridLine, { top: HEIGHT / 2 }]} />
        <View style={[styles.gridLine, { top: HEIGHT - PADDING }]} />
        {width > 0
          ? positions.slice(1).map((end, index) => {
              const start = positions[index];
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              return (
                <View
                  key={`line-${points[index].date}`}
                  style={[
                    styles.line,
                    {
                      width: length,
                      left: (start.x + end.x) / 2 - length / 2,
                      top: (start.y + end.y) / 2 - LINE / 2,
                      transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
                    },
                  ]}
                />
              );
            })
          : null}
        {width > 0
          ? positions.map((position, index) => (
              <View
                key={`dot-${points[index].date}`}
                style={[
                  styles.dot,
                  index === positions.length - 1 && styles.dotLast,
                  { left: position.x - DOT / 2, top: position.y - DOT / 2 },
                ]}
              />
            ))
          : null}
        <Text style={[styles.axisValue, styles.axisTop]}>{formatValue(rawMax)}</Text>
        {spread > 0 ? <Text style={[styles.axisValue, styles.axisBottom]}>{formatValue(rawMin)}</Text> : null}
      </View>
      {first ? (
        <View style={styles.dates}>
          <Text style={styles.dateLabel}>{formatDate(first)}</Text>
          {points.length > 1 ? <Text style={styles.dateLabel}>{formatDate(points[points.length - 1].date)}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      plot: { height: HEIGHT, position: "relative" },
      gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
      },
      line: { position: "absolute", height: LINE, borderRadius: LINE, backgroundColor: colors.accent },
      dot: {
        position: "absolute",
        width: DOT,
        height: DOT,
        borderRadius: DOT / 2,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.accent,
      },
      dotLast: { backgroundColor: colors.accent },
      axisValue: {
        position: "absolute",
        left: 0,
        ...typography.caption,
        ...typography.number,
        color: colors.textMuted,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.xxs,
      },
      axisTop: { top: 0 },
      axisBottom: { bottom: 0 },
      dates: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xs },
      dateLabel: { ...typography.caption, color: colors.textMuted },
    }),
  );
