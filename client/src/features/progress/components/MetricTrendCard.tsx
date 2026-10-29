import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { formatChange, formatMetricNumber, metricUnitKey } from "../helpers/format";
import { BodyMetric, MetricSummary } from "../types";
import { ProgressChart } from "./ProgressChart";

type Props = {
  metric: BodyMetric;
  summary: MetricSummary;
  formatDate: (date: string) => string;
};

export function MetricTrendCard({ metric, summary, formatDate }: Props) {
  const { t, i18n } = useTranslation("progress");
  const styles = useStyles();
  const dir = useDirection();
  const unit = t(metricUnitKey(metric));
  const name = t(`metrics.${metric}`);
  const value = (number: number) => `${formatMetricNumber(number, i18n.language)} ${unit}`;

  if (!summary.end || !summary.start) {
    return (
      <View style={styles.card}>
        <Text style={[styles.title, dir.text]}>{name}</Text>
        <Text style={[styles.empty, dir.text]}>{t("overview.noDataInPeriod", { metric: name })}</Text>
      </View>
    );
  }

  const chartLabel = t("overview.chartLabel", {
    metric: name,
    count: summary.points.length,
    start: value(summary.start.value),
    startDate: formatDate(summary.start.date),
    end: value(summary.end.value),
    endDate: formatDate(summary.end.date),
  });

  return (
    <View style={styles.card}>
      <View style={[styles.header, dir.row]}>
        <View style={styles.headerText}>
          <Text style={[styles.title, dir.text]}>{name}</Text>
          <Text style={[styles.value, dir.text]}>{value(summary.end.value)}</Text>
          <Text style={[styles.caption, dir.text]}>{t("overview.lastRecorded", { date: formatDate(summary.end.date) })}</Text>
        </View>
        {summary.change !== null ? (
          <View style={[styles.change, dir.alignEnd]}>
            <Text style={styles.changeValue}>
              {formatChange(summary.change, i18n.language)} {unit}
            </Text>
            <Text style={styles.caption}>{t("overview.changeSince", { date: formatDate(summary.start.date) })}</Text>
          </View>
        ) : null}
      </View>

      <ProgressChart
        points={summary.points}
        accessibilityLabel={chartLabel}
        formatValue={(number) => formatMetricNumber(number, i18n.language)}
        formatDate={formatDate}
      />

      {summary.min !== null && summary.max !== null && summary.points.length > 1 ? (
        <View style={[styles.stats, dir.row]}>
          <Text style={styles.stat}>{t("overview.lowest", { value: value(summary.min) })}</Text>
          <Text style={styles.stat}>{t("overview.highest", { value: value(summary.max) })}</Text>
          <Text style={styles.stat}>{t("overview.measurements", { count: summary.points.length })}</Text>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        gap: spacing.md,
      },
      header: { alignItems: "flex-start", gap: spacing.md },
      headerText: { flex: 1, gap: spacing.xxs },
      title: { ...typography.label, color: colors.textSecondary },
      value: { ...typography.title, ...typography.number, color: colors.textPrimary },
      caption: { ...typography.caption, color: colors.textMuted },
      change: { gap: spacing.xxs, paddingTop: spacing.md },
      changeValue: { ...typography.bodyStrong, ...typography.number, color: colors.textPrimary },
      empty: { ...typography.callout, color: colors.textSecondary },
      stats: { flexWrap: "wrap", gap: spacing.md },
      stat: { ...typography.caption, ...typography.number, color: colors.textSecondary },
    }),
  );
