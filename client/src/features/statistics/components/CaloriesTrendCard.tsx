import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DayTrendPoint } from '../types';
import { useStyles as useSectionStyles } from './styles/SectionCard.styles';
import { useStyles } from './styles/CaloriesTrendCard.styles';
import { useAppTheme } from '../../../shared/theme';
import { getDirection } from '../../../shared/theme/direction';

type Props = {
  trend: DayTrendPoint[];
  isRTL: boolean;
};

const CHART_HEIGHT = 130;
const BAR_FIXED_WIDTH = 16; // used when trend.length > 14

export function CaloriesTrendCard({ trend, isRTL }: Props) {
  const dir = getDirection(isRTL);
  const { t } = useTranslation('statistics');
  const { colors } = useAppTheme();
  const sectionStyles = useSectionStyles();
  const styles = useStyles();

  const target = trend[0]?.target ?? 0;
  const maxCalories = Math.max(...trend.map((d) => d.calories), target, 1);
  const isScrollable = trend.length > 14;
  const showValues = trend.length <= 7;

  const loggedPoints = trend.filter((p) => p.calories > 0);
  const onTargetCount = loggedPoints.filter(
    (p) => Math.abs(p.calories - p.target) / p.target <= 0.15,
  ).length;

  const onTargetColor = colors.accent;
  const overColor = colors.warning;
  const underColor = colors.accentBorder;

  function barColor(point: DayTrendPoint): string {
    if (point.calories === 0) return colors.progressTrack;
    const diff = Math.abs(point.calories - point.target) / point.target;
    if (diff <= 0.15) return onTargetColor;
    if (point.calories > point.target) return overColor;
    return underColor;
  }

  function valueColor(point: DayTrendPoint): string {
    const color = barColor(point);
    return color === underColor ? colors.textSecondary : color;
  }

  function barHeight(point: DayTrendPoint): number {
    if (point.calories === 0) return 3;
    return Math.max((point.calories / maxCalories) * CHART_HEIGHT, 5);
  }

  function dayInitial(date: string): string {
    const index = new Date(date + 'T12:00:00Z').getUTCDay();
    return t(`weekdaysShort.${index}` as Parameters<typeof t>[0]);
  }

  function formatCal(v: number): string {
    if (v === 0) return '';
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
  }

  const targetPx = target > 0 ? (target / maxCalories) * CHART_HEIGHT : null;

  // Shared inline style for fixed-width cells in scroll mode
  const cellFixed = isScrollable ? { width: BAR_FIXED_WIDTH, flex: 0 as const } : undefined;

  const chartBody = (
    <View>
      {/* Calorie values — 7D only */}
      {showValues && (
        <View style={styles.valuesRow}>
          {trend.map((point) => (
            <View key={point.date} style={[styles.valueCell, cellFixed]}>
              <Text style={[styles.barValue, { color: valueColor(point) }]}>
                {formatCal(point.calories)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Bars + target line */}
      <View style={{ position: 'relative', height: CHART_HEIGHT }}>
        {targetPx !== null && (
          <View style={[styles.targetLine, { bottom: targetPx }]} />
        )}
        <View style={styles.barsRow}>
          {trend.map((point) => (
            <View key={point.date} style={[styles.barWrapper, cellFixed]}>
              <View
                style={[styles.bar, { height: barHeight(point), backgroundColor: barColor(point) }]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* X-axis */}
      <View style={styles.xAxis}>
        {trend.map((point) => (
          <View key={point.date} style={[styles.xCell, cellFixed]}>
            <Text style={styles.dayInitial}>{dayInitial(point.date)}</Text>
            <Text style={styles.dateNum}>{point.date.slice(8)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const legend = [
    { key: 'on', color: onTargetColor, label: t('trend.onTarget') },
    { key: 'under', color: underColor, label: t('trend.under') },
    { key: 'over', color: overColor, label: t('trend.over') },
  ];

  return (
    <View style={sectionStyles.card}>
      <View style={[styles.headerRow, dir.row]}>
        <Text style={[sectionStyles.cardTitle, styles.titleInline]}>
          {t('trend.title')}
        </Text>
        {target > 0 && (
          <Text style={styles.targetBadge}>
            {t('trend.targetLabel', { value: target.toLocaleString() })}
          </Text>
        )}
      </View>

      {isScrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={styles.chartWrapper}
        >
          {chartBody}
        </ScrollView>
      ) : (
        <View style={styles.chartWrapper}>{chartBody}</View>
      )}

      <View style={[styles.footerRow, dir.row]}>
        <View style={[styles.legend, dir.row]}>
          {legend.map((item) => (
            <View
              key={item.key}
              style={[styles.legendItem, dir.row]}
            >
              <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {loggedPoints.length > 0 && (
          <Text style={styles.summary}>
            {t('trend.summary', { on: onTargetCount, total: loggedPoints.length })}
          </Text>
        )}
      </View>
    </View>
  );
}
