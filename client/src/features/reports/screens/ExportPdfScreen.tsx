import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { Button } from "../../../shared/components/ui/Button";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { fromDateKey, todayKey } from "../../../shared/helpers/dateKey";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { DayPickerSheet } from "../../day-log/components/DayPickerSheet";
import { SettingsScreenLayout } from "../../settings/components/SettingsScreenLayout";
import { SettingsSection } from "../../settings/components/SettingsSection";
import { reportRange } from "../helpers/period";
import { useExportPdf } from "../hooks/useExportPdf";
import { ReportPeriod } from "../types";
import { router } from "expo-router";
import { confirmAction } from "../../../shared/helpers/confirm";
import { useHasProAccess } from "../../billing/hooks/useBilling";
import { BILLING_ROUTE } from "../../billing/constants";

const PERIODS: ReportPeriod[] = ["day", "week", "month"];

export function ExportPdfScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const today = todayKey();
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [anchor, setAnchor] = useState(today);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { exportPdf, isExporting } = useExportPdf();
  const { t: tBilling } = useTranslation("billing");
  const access = useHasProAccess();

  const range = useMemo(
    () => reportRange(period, anchor, today, dir.isRTL ? 0 : 1),
    [period, anchor, today, dir.isRTL],
  );

  const format = (date: string) =>
    fromDateKey(date).toLocaleDateString(i18n.language, { day: "numeric", month: "long", year: "numeric" });
  const rangeLabel = range.from === range.to ? format(range.from) : `${format(range.from)} – ${format(range.to)}`;

  async function promptUpgrade() {
    const upgrade = await confirmAction({
      title: tBilling("paywall.reportsTitle"),
      message: tBilling("paywall.reportsMessage"),
      confirmLabel: tBilling("paywall.action"),
      cancelLabel: tBilling("paywall.notNow"),
    });
    if (upgrade) router.push(BILLING_ROUTE);
  }

  async function handleExport() {
    if (!access.isLoading && !access.hasProAccess) {
      await promptUpgrade();
      return;
    }
    const result = await exportPdf(period, range.from, range.to);
    if (result === "needs_pro") await promptUpgrade();
    else if (!result) Alert.alert("", t("export.failed"));
  }

  return (
    <SettingsScreenLayout title={t("export.screenTitle")}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsSection title={t("export.periodSection")}>
          <View style={styles.block}>
            <SegmentedControl
              options={PERIODS.map((value) => ({ value, label: t(`export.periods.${value}`) }))}
              value={period}
              onChange={setPeriod}
              pill
            />
          </View>
        </SettingsSection>

        <SettingsSection title={t("export.dateSection")}>
          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`${t("export.chooseDate")}, ${rangeLabel}`}
            style={({ pressed }) => [styles.dateRow, dir.row, pressed && styles.pressed]}
          >
            <View style={styles.dateIcon}>
              <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.dateText}>
              <Text style={[styles.dateValue, dir.text]}>{rangeLabel}</Text>
              <Text style={[styles.dateHint, dir.text]}>{t(`export.periodHint.${period}`)}</Text>
            </View>
            <MaterialCommunityIcons name={dir.forwardIcon} size={20} color={colors.textMuted} />
          </Pressable>
        </SettingsSection>

        <Text style={[styles.note, dir.text]}>{t("export.includes")}</Text>
      </ScrollView>

      <StickyFooter>
        <Button
          label={isExporting ? t("export.exporting") : t("export.button")}
          icon="file-pdf-box"
          onPress={handleExport}
          loading={isExporting}
          fullWidth
        />
      </StickyFooter>

      <DayPickerSheet
        visible={pickerOpen}
        date={anchor}
        today={today}
        maxDate={today}
        onSelect={(date) => {
          setAnchor(date);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </SettingsScreenLayout>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
      },
      block: {
        padding: spacing.md,
      },
      dateRow: {
        alignItems: "center",
        gap: spacing.ms,
        padding: spacing.md,
      },
      pressed: {
        backgroundColor: colors.glassBorder,
      },
      dateIcon: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.accentSoft,
      },
      dateText: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      dateValue: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      dateHint: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      note: {
        ...typography.footnote,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xs,
      },
    }),
  );
