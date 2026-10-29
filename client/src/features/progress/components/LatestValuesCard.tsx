import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { MEASUREMENT_METRICS } from "../constants";
import { formatMetricNumber, metricUnitKey } from "../helpers/format";
import { BodyMetric, MetricPoint } from "../types";

type Props = {
  latest: Record<BodyMetric, MetricPoint | null>;
  formatDate: (date: string) => string;
};

export function LatestValuesCard({ latest, formatDate }: Props) {
  const { t, i18n } = useTranslation("progress");
  const styles = useStyles();
  const dir = useDirection();
  const recorded = MEASUREMENT_METRICS.filter((metric) => latest[metric] !== null);

  if (recorded.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={[styles.title, dir.text]}>{t("overview.latestMeasurements")}</Text>
      <View style={[styles.grid, dir.row]}>
        {recorded.map((metric) => {
          const point = latest[metric] as MetricPoint;
          return (
            <View key={metric} style={styles.cell}>
              <Text style={[styles.label, dir.text]}>{t(`metrics.${metric}`)}</Text>
              <Text style={[styles.value, dir.text]}>
                {formatMetricNumber(point.value, i18n.language)} {t(metricUnitKey(metric))}
              </Text>
              <Text style={[styles.date, dir.text]}>{formatDate(point.date)}</Text>
            </View>
          );
        })}
      </View>
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
        gap: spacing.ms,
      },
      title: { ...typography.label, color: colors.textSecondary },
      grid: { flexWrap: "wrap", rowGap: spacing.ms },
      cell: { width: "33.33%", minWidth: 96, gap: 2, paddingHorizontal: spacing.xs },
      label: { ...typography.caption, color: colors.textSecondary },
      value: { ...typography.bodyStrong, ...typography.number, color: colors.textPrimary },
      date: { ...typography.caption, color: colors.textMuted },
    }),
  );
