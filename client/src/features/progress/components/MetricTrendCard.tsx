import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
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
  const number = (value: number) => formatMetricNumber(value, i18n.language);
  const value = (amount: number) => `${number(amount)} ${unit}`;

  if (!summary.end || !summary.start) {
    return (
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>{name}</Text>
        <Text style={styles.empty}>{t("overview.noDataInPeriod", { metric: name })}</Text>
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
    <View style={styles.container}>
      <View style={styles.hero} accessible accessibilityLabel={`${name}: ${value(summary.end.value)}`}>
        <Text style={styles.heroLabel}>{name}</Text>
        <View style={[styles.heroValueRow, dir.row]}>
          <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {number(summary.end.value)}
          </Text>
          <Text style={styles.heroUnit} numberOfLines={1}>
            {unit}
          </Text>
        </View>
        <Text style={styles.caption} numberOfLines={1}>
          {t("overview.lastRecorded", { date: formatDate(summary.end.date) })}
        </Text>
        {summary.change !== null ? (
          <View style={[styles.changePill, dir.row]}>
            <Text style={styles.changeValue} numberOfLines={1}>
              {`${formatChange(summary.change, i18n.language)} ${unit}`}
            </Text>
            <Text style={styles.changeSince} numberOfLines={1}>
              {t("overview.changeSince", { date: formatDate(summary.start.date) })}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chartCard}>
        <ProgressChart
          points={summary.points}
          unit={unit}
          accessibilityLabel={chartLabel}
          formatValue={number}
        />

        {summary.min !== null && summary.max !== null && summary.points.length > 1 ? (
          <View style={[styles.stats, dir.row]}>
            <Stat label={t("overview.lowestLabel")} value={value(summary.min)} />
            <Stat label={t("overview.highestLabel")} value={value(summary.max)} />
            <Stat label={t("overview.entriesLabel")} value={number(summary.points.length)} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: { gap: spacing.md },
      hero: {
        alignItems: "center",
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
      },
      heroLabel: { ...typography.label, color: colors.textSecondary, textAlign: "center" },
      heroValueRow: {
        alignItems: "baseline",
        justifyContent: "center",
        gap: spacing.sm,
        maxWidth: "100%",
        marginTop: spacing.xxs,
      },
      heroValue: {
        ...typography.number,
        fontFamily: fonts.medium,
        fontSize: 52,
        lineHeight: 60,
        letterSpacing: -0.5,
        color: colors.textPrimary,
        flexShrink: 1,
      },
      heroUnit: {
        fontFamily: fonts.regular,
        fontSize: 20,
        lineHeight: 24,
        color: colors.textSecondary,
      },
      caption: {
        ...typography.footnote,
        marginTop: spacing.xs,
        color: colors.textMuted,
        textAlign: "center",
      },
      changePill: {
        alignItems: "center",
        gap: spacing.sm,
        maxWidth: "100%",
        marginTop: spacing.ms,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm - 2,
        borderRadius: radius.round,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      changeValue: { ...typography.bodyStrong, ...typography.number, color: colors.textPrimary },
      changeSince: { ...typography.footnote, flexShrink: 1, color: colors.textSecondary },
      chartCard: {
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      stats: {
        gap: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },
      stat: { flex: 1, minWidth: 0, alignItems: "center", gap: 2 },
      statLabel: { ...typography.caption, color: colors.textMuted },
      statValue: { ...typography.footnote, ...typography.number, fontFamily: fonts.medium, color: colors.textPrimary },
      empty: { ...typography.callout, color: colors.textSecondary, textAlign: "center" },
    }),
  );
