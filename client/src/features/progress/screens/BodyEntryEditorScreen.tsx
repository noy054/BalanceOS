import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";

import { FormInput } from "../../../shared/components/FormInput";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { FormToneProvider } from "../../../shared/components/FormTone";
import { AppBackdrop } from "../../../shared/components/ui/AppBackdrop";
import { KeyboardAvoider } from "../../../shared/components/ui/KeyboardAvoider";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { DayPickerSheet } from "../../day-log/components/DayPickerSheet";
import { useDayLabels } from "../../day-log/hooks/useDayLabels";
import { SettingsSection } from "../../settings/components/SettingsSection";
import { TargetSuggestionSheet } from "../../settings/components/TargetSuggestionSheet";
import { PhotoSection } from "../components/PhotoSection";
import { WeightInputCard } from "../components/WeightInputCard";
import { usePeriodRange, useProgressOverview } from "../hooks/useProgress";
import { MEASUREMENT_METRICS, PROGRESS_ROUTES } from "../constants";
import { metricUnitKey } from "../helpers/format";
import { useBodyEntryEditor } from "../hooks/useBodyEntryEditor";
import { BodyMetric } from "../types";

export function BodyEntryEditorScreen() {
  const { t } = useTranslation("progress");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const params = useLocalSearchParams<{ id?: string }>();
  const editor = useBodyEntryEditor(typeof params.id === "string" ? params.id : "new");
  const labels = useDayLabels(editor.today);
  const [pickingDate, setPickingDate] = useState(false);
  const history = useProgressOverview(usePeriodRange("ALL"));
  const weightPoints = history.data?.metrics.weightKg.points;
  const previousWeight = useMemo(
    () => [...(weightPoints ?? [])].reverse().find((point) => point.date < editor.form.date) ?? null,
    [weightPoints, editor.form.date],
  );

  const title = editor.isNew ? t("entry.newTitle") : t("entry.editTitle");

  if (!editor.isNew && !editor.entry) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={title} fallbackRoute={PROGRESS_ROUTES.overview} />
        {editor.query.isError ? (
          <StateView
            variant="error"
            message={t("entry.loadFailed")}
            actionLabel={t("overview.retry")}
            onAction={() => editor.query.refetch()}
          />
        ) : (
          <StateView variant="loading" />
        )}
      </SafeAreaView>
    );
  }

  function metricInput(metric: BodyMetric) {
    return (
      <FormInput
        label={t("metrics.withUnit", { metric: t(`metrics.${metric}`), unit: t(metricUnitKey(metric)) })}
        value={editor.form[metric]}
        onChangeText={(value) => editor.update(metric, value)}
        error={editor.errors[metric]}
        keyboardType="decimal-pad"
        editable={!editor.busy}
      />
    );
  }

  const dateRelative = labels.relative(editor.form.date);
  const dateText = dateRelative ? `${dateRelative} · ${labels.short(editor.form.date)}` : labels.full(editor.form.date);

  return (
    <FormToneProvider tone="glass">
      <SafeAreaView style={styles.root} edges={["top"]}>
        <AppBackdrop />
        <ScreenHeader
          title={title}
          fallbackRoute={PROGRESS_ROUTES.overview}
          {...(editor.entry
            ? {
                rightIconName: "trash-can-outline" as const,
                rightIconColor: colors.danger,
                rightAccessibilityLabel: t("entry.delete"),
                onRightPress: editor.handleDelete,
              }
            : {})}
        />
        <KeyboardAvoider>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <SettingsSection title={t("entry.weightSection")}>
              <View style={styles.card}>
                <View style={styles.group}>
                  <Text style={[styles.label, dir.text]}>{t("entry.date")}</Text>
                  <Pressable
                    onPress={() => setPickingDate(true)}
                    disabled={editor.busy}
                    accessibilityRole="button"
                    accessibilityLabel={t("entry.chooseDate", { date: labels.full(editor.form.date) })}
                    style={({ pressed }) => [styles.dateField, dir.row, pressed && styles.pressed]}
                  >
                    <Text style={[styles.dateValue, dir.text]} numberOfLines={1}>
                      {dateText}
                    </Text>
                    <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.accent} />
                  </Pressable>
                </View>

                <WeightInputCard
                  value={editor.form.weightKg}
                  onChange={(value) => editor.update("weightKg", value)}
                  previous={previousWeight}
                  formatDate={labels.short}
                  error={editor.errors.weightKg}
                  disabled={editor.busy}
                />
              </View>
            </SettingsSection>

            <SettingsSection title={t("entry.measurementsSection")}>
              <View style={styles.card}>
                <View style={[styles.grid, dir.row]}>
                  {MEASUREMENT_METRICS.map((metric) => (
                    <View key={metric} style={styles.gridItem}>
                      {metricInput(metric)}
                    </View>
                  ))}
                </View>
              </View>
            </SettingsSection>
            <Text style={[styles.sectionHint, dir.text]}>{t("entry.measurementsHint")}</Text>

            <SettingsSection title={t("entry.photosSection")}>
              <View style={styles.photos}>
                <PhotoSection
                  photos={editor.photos}
                  disabled={editor.busy}
                  onAdd={editor.addPhoto}
                  onReplace={editor.replacePhoto}
                  onRemove={editor.removePhoto}
                />
              </View>
            </SettingsSection>

            <SettingsSection title={t("entry.noteSection")}>
              <View style={styles.card}>
                <FormInput
                  label={t("entry.noteLabel")}
                  value={editor.form.note}
                  onChangeText={(value) => editor.update("note", value)}
                  error={editor.errors.note}
                  multiline
                  editable={!editor.busy}
                  returnKeyType="done"
                />
              </View>
            </SettingsSection>

            {editor.errors.form ? (
              <Text style={[styles.formError, dir.text]} accessibilityLiveRegion="polite">
                {editor.errors.form}
              </Text>
            ) : null}
          </ScrollView>

          <StickyFooter>
            <Button
              label={t("entry.save")}
              icon="check"
              onPress={editor.handleSave}
              loading={editor.isSaving}
              disabled={editor.busy}
              fullWidth
            />
          </StickyFooter>
        </KeyboardAvoider>

        <TargetSuggestionSheet suggestion={editor.suggestion} onClose={editor.dismissSuggestion} />

        <DayPickerSheet
          visible={pickingDate}
          date={editor.form.date}
          today={editor.today}
          maxDate={editor.today}
          showMarkers={false}
          title={t("entry.chooseDateTitle")}
          onSelect={(date) => editor.update("date", date)}
          onClose={() => setPickingDate(false)}
        />
      </SafeAreaView>
    </FormToneProvider>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.canvas },
      flex: { flex: 1 },
      content: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.lg },
      card: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
      photos: { padding: spacing.md },
      group: { marginBottom: spacing.md },
      label: {
        ...typography.label,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs + 2,
      },
      dateField: {
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 52,
        paddingHorizontal: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      dateValue: { flex: 1, ...typography.body, color: colors.textPrimary },
      pressed: { opacity: 0.7 },
      grid: { flexWrap: "wrap", columnGap: spacing.ms },
      gridItem: { flexGrow: 1, flexBasis: "45%", minWidth: 130 },
      sectionHint: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: -spacing.md,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.xs,
      },
      formError: { ...typography.footnote, color: colors.danger, textAlign: "center" },
    }),
  );
