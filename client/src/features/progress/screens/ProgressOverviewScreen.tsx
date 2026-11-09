import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { FormToneProvider } from "../../../shared/components/FormTone";
import { ChoiceChips } from "../../../shared/components/ui/ChoiceChips";
import { StateView } from "../../../shared/components/ui/StateView";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { useDayLabels } from "../../day-log/hooks/useDayLabels";
import { EntryRow } from "../components/EntryRow";
import { LatestValuesCard } from "../components/LatestValuesCard";
import { MetricTrendCard } from "../components/MetricTrendCard";
import { ProfileWeightCard } from "../components/ProfileWeightCard";
import { WeighInReminderRow } from "../components/WeighInReminderRow";
import { BODY_METRICS, PROGRESS_PERIODS, PROGRESS_ROUTES } from "../constants";
import { useBodyEntries, usePeriodRange, useProgressOverview } from "../hooks/useProgress";
import { BodyEntry, BodyMetric, ProgressPeriod } from "../types";

export function ProgressOverviewScreen() {
  const { t } = useTranslation("progress");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const [period, setPeriod] = useState<ProgressPeriod>("90D");
  const [chosenMetric, setChosenMetric] = useState<BodyMetric | null>(null);
  const range = usePeriodRange(period);
  const labels = useDayLabels(range.to);
  const overview = useProgressOverview(range);
  const history = useBodyEntries(range);

  const formatDate = (date: string) => labels.short(date);
  const data = overview.data;
  const trackedMetrics = data ? BODY_METRICS.filter((metric) => data.latest[metric] !== null) : [];
  const metric = chosenMetric && trackedMetrics.includes(chosenMetric) ? chosenMetric : (trackedMetrics[0] ?? "weightKg");

  function refresh() {
    void overview.refetch();
    void history.refetch();
  }

  function renderHeader() {
    if (!data) return null;
    return (
      <View style={styles.header}>
        {trackedMetrics.length > 1 ? (
          <ChoiceChips
            options={trackedMetrics.map((value) => ({ value, label: t(`metrics.${value}`) }))}
            value={metric}
            onChange={setChosenMetric}
          />
        ) : null}
        <MetricTrendCard metric={metric} summary={data.metrics[metric]} formatDate={formatDate} />
        <ChoiceChips
          options={PROGRESS_PERIODS.map((value) => ({ value, label: t(`periods.${value}`) }))}
          value={period}
          onChange={setPeriod}
        />
        {data.latest.weightKg ? (
          <ProfileWeightCard
            profileWeightKg={data.profileWeightKg}
            latestWeight={data.latest.weightKg}
            formatDate={formatDate}
          />
        ) : null}
        <LatestValuesCard latest={data.latest} formatDate={formatDate} />
        <WeighInReminderRow />
        <Text style={[styles.sectionTitle, dir.text]} accessibilityRole="header">
          {t("history.title")}
        </Text>
        {history.entries.length === 0 && !history.isLoading ? (
          <Text style={[styles.emptyHistory, dir.text]}>{t("history.emptyInPeriod")}</Text>
        ) : null}
      </View>
    );
  }

  function renderItem({ item, index }: { item: BodyEntry; index: number }) {
    const isFirst = index === 0;
    const isLast = index === history.entries.length - 1;
    return (
      <View style={[styles.rowWrap, isFirst && styles.rowFirst, isLast && styles.rowLast, !isLast && styles.rowDivider]}>
        <EntryRow
          entry={item}
          dateLabel={labels.full(item.date)}
          onPress={() => router.push(PROGRESS_ROUTES.entry(item.id))}
        />
      </View>
    );
  }

  let body;
  if (overview.isLoading) {
    body = <StateView variant="loading" />;
  } else if (overview.isError || !data) {
    body = (
      <StateView
        variant="error"
        message={t("overview.loadFailed")}
        actionLabel={t("overview.retry")}
        onAction={refresh}
      />
    );
  } else if (data.entryCount === 0) {
    body = (
      <StateView
        variant="empty"
        icon="chart-timeline-variant"
        title={t("overview.emptyTitle")}
        message={t("overview.emptyMessage")}
        actionLabel={t("overview.addFirst")}
        onAction={() => router.push(PROGRESS_ROUTES.newEntry)}
      />
    );
  } else {
    body = (
      <FlatList
        data={history.entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader() ?? undefined}
        contentContainerStyle={styles.content}
        onEndReached={() => {
          if (history.hasNextPage && !history.isFetchingNextPage) void history.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={history.isFetchingNextPage ? <StateView variant="loading" compact /> : undefined}
        refreshControl={
          <RefreshControl
            refreshing={overview.isRefetching && !overview.isLoading}
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }
      />
    );
  }

  return (
    <FormToneProvider tone="glass">
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("overview.title")} />
        {body}
        {data && data.entryCount > 0 ? (
          <StickyFooter>
            <Button
              label={t("overview.logWeight")}
              icon="plus"
              onPress={() => router.push(PROGRESS_ROUTES.newEntry)}
              fullWidth
            />
          </StickyFooter>
        ) : null}
      </SafeAreaView>
    </FormToneProvider>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.canvas },
      content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
      header: { gap: spacing.md, paddingBottom: spacing.sm },
      sectionTitle: { ...typography.headline, color: colors.textPrimary, marginTop: spacing.sm },
      emptyHistory: { ...typography.callout, color: colors.textSecondary },
      rowWrap: {
        backgroundColor: colors.glassCard,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
        overflow: "hidden",
      },
      rowFirst: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
      },
      rowLast: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
      },
      rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    }),
  );
