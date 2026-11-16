import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { SectionHeader } from "../../../shared/components/ui/SectionHeader";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { StateView } from "../../../shared/components/ui/StateView";
import { addDays, fromDateKey, todayKey } from "../../../shared/helpers/dateKey";
import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { useIsAdmin } from "../../admin-catalog/hooks/useAdminCatalog";
import { DayPickerSheet } from "../../day-log/components/DayPickerSheet";
import { AdminScaffold } from "../components/AdminScaffold";
import { UsageBars } from "../components/UsageBars";
import { useAdminAnalytics } from "../hooks/useAdmin";

type Preset = "7" | "30" | "90" | "custom";

function percent(value: number | null) {
  return value == null ? "—" : `${Math.round(value * 10) / 10}%`;
}

function signed(value: number | null) {
  if (value == null) return null;
  const rounded = Math.round(value * 10) / 10;
  return `\u2066${rounded > 0 ? "+" : ""}${rounded}%\u2069`;
}

export function AdminAnalyticsScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const isAdmin = useIsAdmin();
  const today = todayKey();

  const [preset, setPreset] = useState<Preset>("30");
  const [customFrom, setCustomFrom] = useState(addDays(today, -29));
  const [customTo, setCustomTo] = useState(today);
  const [picking, setPicking] = useState<"from" | "to" | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const range = useMemo(() => {
    if (preset === "custom") {
      return customFrom <= customTo ? { from: customFrom, to: customTo } : { from: customTo, to: customFrom };
    }
    return { from: addDays(today, -(Number(preset) - 1)), to: today };
  }, [preset, customFrom, customTo, today]);

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useAdminAnalytics(range.from, range.to, isAdmin);

  const formatDate = (date: string) =>
    fromDateKey(date).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" });
  const updatedLabel = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })
    : null;

  async function refresh() {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  const presets: { value: Preset; label: string }[] = [
    { value: "7", label: t("admin.analytics.presets.7") },
    { value: "30", label: t("admin.analytics.presets.30") },
    { value: "90", label: t("admin.analytics.presets.90") },
    { value: "custom", label: t("admin.analytics.presets.custom") },
  ];

  return (
    <AdminScaffold title={t("admin.analytics.title")}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textMuted} colors={[colors.accent]} />
        }
      >
        <SegmentedControl options={presets} value={preset} onChange={setPreset} pill />

        {preset === "custom" ? (
          <View style={[styles.customRow, dir.row]}>
            {(["from", "to"] as const).map((edge) => (
              <Pressable
                key={edge}
                onPress={() => setPicking(edge)}
                accessibilityRole="button"
                accessibilityLabel={`${t(`admin.analytics.${edge}`)}, ${formatDate(edge === "from" ? customFrom : customTo)}`}
                style={({ pressed }) => [styles.dateField, pressed && styles.pressed]}
              >
                <Text style={[styles.dateLabel, dir.text]}>{t(`admin.analytics.${edge}`)}</Text>
                <View style={[styles.dateValueRow, dir.row]}>
                  <MaterialCommunityIcons name="calendar-outline" size={16} color={colors.accent} />
                  <Text style={styles.dateValue}>{formatDate(edge === "from" ? customFrom : customTo)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={[styles.statusRow, dir.row]}>
          <Text style={[styles.status, dir.text]}>
            {updatedLabel ? t("admin.analytics.lastUpdated", { time: updatedLabel }) : ""}
          </Text>
          {data?.lastEventAt ? (
            <Text style={styles.status}>
              {t("admin.analytics.lastEvent", {
                time: new Date(data.lastEventAt).toLocaleString(i18n.language, { dateStyle: "short", timeStyle: "short" }),
              })}
            </Text>
          ) : null}
        </View>

        {isLoading && !data ? (
          <StateView variant="loading" compact />
        ) : isError && !data ? (
          <StateView
            variant="error"
            compact
            message={t("admin.loadFailed")}
            actionLabel={t("admin.common.retry")}
            onAction={() => refetch()}
          />
        ) : data ? (
          <>
            <View style={[styles.tiles, dir.row]}>
              {[
                { key: "users", value: String(data.totals.activeUsers), label: t("admin.analytics.activeUsers"), change: data.totals.activeUsersChange },
                { key: "events", value: data.totals.events.toLocaleString("en-US"), label: t("admin.analytics.events"), change: data.totals.eventsChange },
                { key: "rate", value: percent(data.totals.completionRate), label: t("admin.analytics.completion"), change: null },
              ].map((tile) => (
                <View key={tile.key} style={styles.tile} accessible accessibilityLabel={`${tile.label} ${tile.value}`}>
                  <Text style={styles.tileValue}>{tile.value}</Text>
                  <Text style={styles.tileLabel} numberOfLines={2}>
                    {tile.label}
                  </Text>
                  {signed(tile.change) ? (
                    <Text style={[styles.change, (tile.change ?? 0) < 0 && styles.changeDown]}>
                      {t("admin.analytics.vsPrevious", { value: signed(tile.change) })}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={[styles.cardTitle, dir.text]}>{t("admin.analytics.dailyActive")}</Text>
              <UsageBars values={data.activeUsers.map((day) => day.users)} height={72} />
              <View style={[styles.axis, dir.row]}>
                <Text style={styles.axisText}>{formatDate(data.from)}</Text>
                <Text style={styles.axisText}>{formatDate(data.to)}</Text>
              </View>
            </View>

            <View>
              <SectionHeader title={t("admin.analytics.byFeature")} />
              <View style={styles.card}>
                {data.features.map((feature, index) => (
                  <View
                    key={feature.feature}
                    style={[styles.featureRow, index < data.features.length - 1 && styles.divider]}
                    accessible
                    accessibilityLabel={`${t(`admin.analytics.features.${feature.feature}`)}: ${feature.events} ${t("admin.analytics.events")}, ${feature.uniqueUsers} ${t("admin.analytics.users")}`}
                  >
                    <View style={[styles.featureHead, dir.row]}>
                      <Text style={[styles.featureName, dir.text]} numberOfLines={1}>
                        {t(`admin.analytics.features.${feature.feature}`)}
                      </Text>
                      {signed(feature.change) ? (
                        <Text style={[styles.change, (feature.change ?? 0) < 0 && styles.changeDown]}>
                          {signed(feature.change)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.metrics, dir.row]}>
                      <Text style={styles.metric}>
                        <Text style={styles.metricValue}>{feature.events.toLocaleString("en-US")}</Text> {t("admin.analytics.events")}
                      </Text>
                      <Text style={styles.metric}>
                        <Text style={styles.metricValue}>{feature.uniqueUsers}</Text> {t("admin.analytics.users")}
                      </Text>
                      <Text style={styles.metric}>
                        <Text style={styles.metricValue}>{percent(feature.completionRate)}</Text> {t("admin.analytics.success")}
                      </Text>
                    </View>
                    <UsageBars values={feature.daily} height={28} />
                  </View>
                ))}
              </View>
            </View>

            <View>
              <SectionHeader title={t("admin.analytics.topActions")} />
              <View style={styles.card}>
                {data.actions.length === 0 ? (
                  <Text style={[styles.empty, dir.text]}>{t("admin.analytics.noEvents")}</Text>
                ) : (
                  data.actions.slice(0, 12).map((action, index) => (
                    <View
                      key={action.action}
                      style={[styles.actionRow, dir.row, index < Math.min(data.actions.length, 12) - 1 && styles.divider]}
                    >
                      <View style={styles.actionText}>
                        <Text style={[styles.actionName, dir.text]} numberOfLines={1}>
                          {t(`admin.analytics.actions.${action.action}`)}
                        </Text>
                        <Text style={[styles.actionMeta, dir.text]} numberOfLines={1}>
                          {t(`admin.analytics.features.${action.feature}`)} · {action.uniqueUsers} {t("admin.analytics.users")}
                          {action.failed > 0 ? ` · ${t("admin.analytics.failedCount", { count: action.failed })}` : ""}
                        </Text>
                      </View>
                      <Text style={styles.actionCount}>{action.events.toLocaleString("en-US")}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            <Text style={[styles.footnote, dir.text]}>{t("admin.analytics.footnote")}</Text>
          </>
        ) : null}
      </ScrollView>

      <DayPickerSheet
        visible={picking !== null}
        date={picking === "to" ? customTo : customFrom}
        today={today}
        maxDate={today}
        onSelect={(date) => {
          if (picking === "from") setCustomFrom(date);
          if (picking === "to") setCustomTo(date);
          setPicking(null);
        }}
        onClose={() => setPicking(null)}
      />
    </AdminScaffold>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      content: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.md,
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
      },
      customRow: {
        gap: spacing.sm,
      },
      dateField: {
        flex: 1,
        gap: 2,
        padding: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      },
      pressed: {
        opacity: 0.75,
      },
      dateLabel: {
        ...typography.caption,
        color: colors.textSecondary,
      },
      dateValueRow: {
        alignItems: "center",
        gap: spacing.xs,
      },
      dateValue: {
        ...typography.callout,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      statusRow: {
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: spacing.xs,
      },
      status: {
        ...typography.caption,
        color: colors.textMuted,
      },
      tiles: {
        gap: spacing.sm,
      },
      tile: {
        flex: 1,
        minWidth: 0,
        gap: 2,
        padding: spacing.ms,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
      },
      tileValue: {
        ...typography.value,
        fontSize: 22,
        lineHeight: 28,
        color: colors.textPrimary,
      },
      tileLabel: {
        ...typography.caption,
        color: colors.textSecondary,
      },
      change: {
        ...typography.caption,
        ...typography.number,
        color: colors.success,
      },
      changeDown: {
        color: colors.warning,
      },
      card: {
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
      },
      cardTitle: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      axis: {
        justifyContent: "space-between",
      },
      axisText: {
        ...typography.caption,
        color: colors.textMuted,
      },
      featureRow: {
        gap: spacing.xs,
        paddingVertical: spacing.sm,
      },
      divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      featureHead: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      featureName: {
        flex: 1,
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      metrics: {
        flexWrap: "wrap",
        columnGap: spacing.md,
      },
      metric: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      metricValue: {
        ...typography.number,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      actionRow: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
      },
      actionText: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      actionName: {
        ...typography.callout,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      actionMeta: {
        ...typography.caption,
        color: colors.textSecondary,
      },
      actionCount: {
        ...typography.value,
        fontSize: 16,
        color: colors.textPrimary,
      },
      empty: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      footnote: {
        ...typography.caption,
        color: colors.textMuted,
      },
    }),
  );
