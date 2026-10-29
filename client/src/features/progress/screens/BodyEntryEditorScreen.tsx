import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";

import { FormInput } from "../../../shared/components/FormInput";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { FormSection } from "../../../shared/components/ui/FormSection";
import { KeyboardAvoider } from "../../../shared/components/ui/KeyboardAvoider";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { DayPickerSheet } from "../../day-log/components/DayPickerSheet";
import { useDayLabels } from "../../day-log/hooks/useDayLabels";
import { PhotoSection } from "../components/PhotoSection";
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

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
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
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Pressable
            onPress={() => setPickingDate(true)}
            disabled={editor.busy}
            accessibilityRole="button"
            accessibilityLabel={t("entry.chooseDate", { date: labels.full(editor.form.date) })}
            style={({ pressed }) => [styles.dateCard, dir.row, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="calendar-month-outline" size={22} color={colors.accent} />
            <View style={styles.dateText}>
              <Text style={[styles.dateLabel, dir.text]}>{t("entry.date")}</Text>
              <Text style={[styles.dateValue, dir.text]}>
                {dateRelative ? `${dateRelative} · ${labels.short(editor.form.date)}` : labels.full(editor.form.date)}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textMuted} />
          </Pressable>

          <FormSection title={t("entry.weightSection")}>{metricInput("weightKg")}</FormSection>

          <FormSection title={t("entry.measurementsSection")} hint={t("entry.measurementsHint")}>
            <View style={styles.grid}>
              {MEASUREMENT_METRICS.map((metric) => (
                <View key={metric} style={styles.gridItem}>
                  {metricInput(metric)}
                </View>
              ))}
            </View>
          </FormSection>

          <FormSection title={t("entry.photosSection")}>
            <PhotoSection
              photos={editor.photos}
              disabled={editor.busy}
              onAdd={editor.addPhoto}
              onReplace={editor.replacePhoto}
              onRemove={editor.removePhoto}
            />
          </FormSection>

          <FormSection title={t("entry.noteSection")}>
            <FormInput
              label={t("entry.noteLabel")}
              value={editor.form.note}
              onChangeText={(value) => editor.update("note", value)}
              error={editor.errors.note}
              multiline
              editable={!editor.busy}
              returnKeyType="done"
            />
          </FormSection>

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
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg },
      dateCard: {
        alignItems: "center",
        gap: spacing.ms,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
      },
      dateText: { flex: 1, gap: spacing.xxs },
      dateLabel: { ...typography.caption, color: colors.textSecondary },
      dateValue: { ...typography.bodyStrong, color: colors.textPrimary },
      pressed: { opacity: 0.75 },
      grid: { flexDirection: "row", flexWrap: "wrap", columnGap: spacing.sm, rowGap: spacing.ms },
      gridItem: { flexGrow: 1, flexBasis: "45%", minWidth: 130 },
      formError: { ...typography.footnote, color: colors.danger, textAlign: "center" },
    }),
  );
