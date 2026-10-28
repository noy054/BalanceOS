import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import { FormInput } from "../../../shared/components/FormInput";
import { ActionSheet, SheetAction } from "../../../shared/components/ui/ActionSheet";
import { Button } from "../../../shared/components/ui/Button";
import { FormSection } from "../../../shared/components/ui/FormSection";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { KeyboardAvoider } from "../../../shared/components/ui/KeyboardAvoider";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { confirmAction } from "../../../shared/helpers/confirm";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import {
  ANNOUNCEMENT_PLATFORMS,
  ANNOUNCEMENT_ROUTES,
  AnnouncementActionType,
  AnnouncementContent,
  AnnouncementDisplay,
  AnnouncementKind,
  AnnouncementPlatform,
} from "../../announcements/types";
import { useIsAdmin } from "../../admin-catalog/hooks/useAdminCatalog";
import { AdminHistoryList } from "../components/AdminHistoryList";
import { AdminScaffold } from "../components/AdminScaffold";
import { AnnouncementPreview } from "../components/AnnouncementPreview";
import { DateTimeField } from "../components/DateTimeField";
import { FilterChips } from "../components/FilterChips";
import { StatusBadge } from "../components/StatusBadge";
import { ToggleChips } from "../components/ToggleChips";
import { ADMIN_ROUTES, AnnouncementActionName } from "../constants";
import {
  AnnouncementFormErrors,
  AnnouncementFormState,
  buildAnnouncementPayload,
  combineDateTime,
  EMPTY_ANNOUNCEMENT_FORM,
  formFromAnnouncement,
} from "../helpers/announcementForm";
import { announcementStateTone, audienceSummary } from "../helpers/announcementLabels";
import { adminErrorMessage } from "../helpers/errors";
import { formatDateTime, personName } from "../helpers/format";
import {
  useAdminAnnouncement,
  useAnnouncementAction,
  useDeleteAnnouncement,
  useSaveAnnouncement,
} from "../hooks/useAdmin";

const KINDS: AnnouncementKind[] = ["UPDATE", "NOTICE", "IMPORTANT"];
const DISPLAYS: AnnouncementDisplay[] = ["BANNER", "POPUP"];
const ACTIONS: AnnouncementActionType[] = ["NONE", "ROUTE", "URL"];

export function AnnouncementEditorScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();
  const isAdmin = useIsAdmin();
  const params = useLocalSearchParams<{ id?: string }>();
  const routeId = typeof params.id === "string" ? params.id : "new";
  const isNew = routeId === "new";

  const { data: existing, isLoading, isError, refetch } = useAdminAnnouncement(
    isAdmin && !isNew ? routeId : null,
  );
  const save = useSaveAnnouncement(isNew ? null : routeId);
  const action = useAnnouncementAction();
  const remove = useDeleteAnnouncement();

  const [form, setForm] = useState<AnnouncementFormState>(EMPTY_ANNOUNCEMENT_FORM);
  const [errors, setErrors] = useState<AnnouncementFormErrors>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const hydrated = useRef<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    const key = `${existing.id}:${existing.updatedAt}`;
    if (hydrated.current === key) return;
    hydrated.current = key;
    setForm(formFromAnnouncement(existing));
    setErrors({});
  }, [existing]);

  const messages = useMemo(
    () => ({
      required: t("admin.validation.required"),
      tooLong: t("admin.validation.tooLong"),
      invalidUrl: t("admin.validation.invalidUrl"),
      invalidRoute: t("admin.validation.invalidRoute"),
      invalidVersion: t("admin.validation.invalidVersion"),
      versionOrder: t("admin.validation.versionOrder"),
      invalidTime: t("admin.validation.invalidTime"),
      endBeforeStart: t("admin.validation.endBeforeStart"),
    }),
    [t],
  );

  const previewContent: AnnouncementContent = {
    kind: form.kind,
    display: form.display,
    titleHe: form.titleHe,
    titleEn: form.titleEn,
    bodyHe: form.bodyHe,
    bodyEn: form.bodyEn,
    actionType: form.actionType,
    actionTarget: form.actionType === "ROUTE" ? form.route : form.url,
    actionLabelHe: form.actionLabelHe,
    actionLabelEn: form.actionLabelEn,
  };

  const title = isNew ? t("admin.announcements.newTitle") : t("admin.announcements.editTitle");

  if (!isNew && (isLoading || (isAdmin && !existing && !isError))) {
    return (
      <AdminScaffold title={title}>
        <StateView variant="loading" />
      </AdminScaffold>
    );
  }

  if (!isNew && !existing) {
    return (
      <AdminScaffold title={title}>
        <StateView
          variant="error"
          message={t("admin.loadFailed")}
          actionLabel={t("admin.common.retry")}
          onAction={() => refetch()}
        />
      </AdminScaffold>
    );
  }

  const status = existing?.status ?? "DRAFT";
  const readOnly = status === "ARCHIVED";
  const busy = save.isPending || action.isPending || remove.isPending;

  function update<K extends keyof AnnouncementFormState>(key: K, value: AnnouncementFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function togglePlatform(platform: AnnouncementPlatform) {
    update(
      "platforms",
      form.platforms.includes(platform)
        ? form.platforms.filter((value) => value !== platform)
        : [...form.platforms, platform],
    );
  }

  function validate() {
    const result = buildAnnouncementPayload(form, messages);
    setErrors(result.errors);
    if (!result.payload) Alert.alert("", t("admin.validation.fixErrors"));
    return result.payload;
  }

  function showError(err: unknown) {
    Alert.alert("", adminErrorMessage(err, t, t("admin.errors.generic")));
  }

  async function persist() {
    const payload = validate();
    if (!payload) return null;
    const saved = await save.mutateAsync(payload);
    return saved;
  }

  async function handleSave() {
    try {
      const saved = await persist();
      if (saved && isNew) router.replace(ADMIN_ROUTES.announcement(saved.id));
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function handlePublish() {
    const payload = buildAnnouncementPayload(form, messages);
    setErrors(payload.errors);
    if (!payload.payload) {
      Alert.alert("", t("admin.validation.fixErrors"));
      return;
    }
    const start = combineDateTime(form.startDate, form.startTime);
    const scheduled = Boolean(start && start.getTime() > Date.now() + 60 * 1000);
    const confirmed = await confirmAction({
      title: scheduled ? t("admin.announcements.scheduleTitle") : t("admin.announcements.publishTitle"),
      message: t("admin.announcements.publishMessage", {
        audience: audienceSummary(payload.payload, t),
        start: scheduled ? formatDateTime(start?.toISOString(), i18n.language) : t("admin.announcements.now"),
      }),
      confirmLabel: scheduled ? t("admin.announcements.schedule") : t("admin.announcements.publish"),
      cancelLabel: t("admin.common.cancel"),
    });
    if (!confirmed) return;
    try {
      const saved = await save.mutateAsync(payload.payload);
      await action.mutateAsync({
        id: saved.id,
        action: "publish",
        ...(scheduled && start ? { publishAt: start.toISOString() } : {}),
      });
      if (isNew) router.replace(ADMIN_ROUTES.announcement(saved.id));
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function runAction(name: AnnouncementActionName, titleKey: string, messageKey: string, destructive: boolean) {
    if (!existing) return;
    const confirmed = await confirmAction({
      title: t(titleKey),
      message: t(messageKey),
      confirmLabel: t(`admin.announcements.actions.${name}`),
      cancelLabel: t("admin.common.cancel"),
      destructive,
    });
    if (!confirmed) return;
    try {
      await action.mutateAsync({ id: existing.id, action: name });
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    const confirmed = await confirmAction({
      title: t("admin.announcements.deleteTitle"),
      message: t("admin.announcements.deleteMessage"),
      confirmLabel: t("admin.announcements.actions.delete"),
      cancelLabel: t("admin.common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await remove.mutateAsync(existing.id);
      router.back();
    } catch (err: unknown) {
      showError(err);
    }
  }

  const menuActions: SheetAction[] = existing
    ? [
        ...(status === "PUBLISHED"
          ? [
              {
                key: "unpublish",
                label: t("admin.announcements.actions.unpublish"),
                icon: "eye-off-outline" as const,
                onPress: () =>
                  runAction("unpublish", "admin.announcements.unpublishTitle", "admin.announcements.unpublishMessage", false),
              },
            ]
          : []),
        ...(status !== "ARCHIVED"
          ? [
              {
                key: "archive",
                label: t("admin.announcements.actions.archive"),
                icon: "archive-outline" as const,
                destructive: true,
                onPress: () =>
                  runAction("archive", "admin.announcements.archiveTitle", "admin.announcements.archiveMessage", true),
              },
            ]
          : [
              {
                key: "restore",
                label: t("admin.announcements.actions.restore"),
                icon: "restore" as const,
                onPress: () =>
                  runAction("restore", "admin.announcements.restoreTitle", "admin.announcements.restoreMessage", false),
              },
            ]),
        ...(status === "DRAFT"
          ? [
              {
                key: "delete",
                label: t("admin.announcements.actions.delete"),
                icon: "trash-can-outline" as const,
                destructive: true,
                onPress: handleDelete,
              },
            ]
          : []),
      ]
    : [];

  const start = combineDateTime(form.startDate, form.startTime);
  const willSchedule = Boolean(start && start.getTime() > Date.now() + 60 * 1000);

  return (
    <AdminScaffold
      title={title}
      rightElement={
        existing ? (
          <IconButton
            icon="dots-vertical"
            accessibilityLabel={t("admin.announcements.moreActions")}
            onPress={() => setMenuOpen(true)}
          />
        ) : undefined
      }
    >
      <KeyboardAvoider>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {existing ? (
            <View style={[styles.statusCard, dir.alignStart]}>
              <StatusBadge
                label={t(`admin.announcementStates.${existing.state}`)}
                tone={announcementStateTone(existing.state)}
              />
              <Text style={[styles.statusText, dir.text]}>
                {t("admin.announcements.createdBy", {
                  name: personName(existing.createdBy),
                  date: formatDateTime(existing.createdAt, i18n.language),
                })}
              </Text>
              <Text style={[styles.statusText, dir.text]}>
                {t("admin.announcements.updatedBy", {
                  name: personName(existing.updatedBy),
                  date: formatDateTime(existing.updatedAt, i18n.language),
                })}
              </Text>
              <Text style={[styles.statusStrong, dir.text]}>
                {t("admin.announcements.stats", {
                  seen: existing.stats.seen,
                  dismissed: existing.stats.dismissed,
                })}
              </Text>
              {readOnly ? (
                <Text style={[styles.statusText, dir.text]}>{t("admin.announcements.archivedHint")}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.intro, dir.text]}>{t("admin.announcements.inAppOnly")}</Text>
          )}

          <FormSection title={t("admin.announcements.typeSection")}>
            <View style={styles.fieldGroup}>
              <SegmentedControl
                options={KINDS.map((value) => ({ value, label: t(`admin.announcements.kinds.${value}`) }))}
                value={form.kind}
                onChange={(value) => !readOnly && update("kind", value)}
              />
              <SegmentedControl
                size="sm"
                options={DISPLAYS.map((value) => ({ value, label: t(`admin.announcements.displays.${value}`) }))}
                value={form.display}
                onChange={(value) => !readOnly && update("display", value)}
              />
              <Text style={[styles.hint, dir.text]}>{t(`admin.announcements.displayHints.${form.display}`)}</Text>
            </View>
          </FormSection>

          <FormSection title={t("admin.announcements.hebrew")}>
            <View style={styles.fieldGroup}>
              <FormInput
                label={t("admin.announcements.titleLabel")}
                value={form.titleHe}
                onChangeText={(value) => update("titleHe", value)}
                error={errors.titleHe}
                editable={!readOnly}
              />
              <FormInput
                label={t("admin.announcements.bodyLabel")}
                value={form.bodyHe}
                onChangeText={(value) => update("bodyHe", value)}
                error={errors.bodyHe}
                multiline
                editable={!readOnly}
              />
            </View>
          </FormSection>

          <FormSection title={t("admin.announcements.english")}>
            <View style={styles.fieldGroup}>
              <FormInput
                label={t("admin.announcements.titleLabel")}
                value={form.titleEn}
                onChangeText={(value) => update("titleEn", value)}
                error={errors.titleEn}
                editable={!readOnly}
              />
              <FormInput
                label={t("admin.announcements.bodyLabel")}
                value={form.bodyEn}
                onChangeText={(value) => update("bodyEn", value)}
                error={errors.bodyEn}
                multiline
                editable={!readOnly}
              />
            </View>
          </FormSection>

          <FormSection title={t("admin.announcements.actionSection")} hint={t("admin.announcements.actionHint")}>
            <View style={styles.fieldGroup}>
              <SegmentedControl
                size="sm"
                options={ACTIONS.map((value) => ({ value, label: t(`admin.announcements.actionTypes.${value}`) }))}
                value={form.actionType}
                onChange={(value) => !readOnly && update("actionType", value)}
              />
              {form.actionType === "ROUTE" ? (
                <View style={styles.fieldGroup}>
                  <FilterChips
                    options={ANNOUNCEMENT_ROUTES.map((value) => ({
                      value,
                      label: t(`admin.announcements.routes.${value}`),
                    }))}
                    value={form.route}
                    onChange={(value) => !readOnly && update("route", value)}
                  />
                  {errors.route ? <Text style={[styles.error, dir.text]}>{errors.route}</Text> : null}
                </View>
              ) : null}
              {form.actionType === "URL" ? (
                <FormInput
                  label={t("admin.announcements.urlLabel")}
                  value={form.url}
                  onChangeText={(value) => update("url", value)}
                  error={errors.url}
                  placeholder="https://"
                  keyboardType="url"
                  editable={!readOnly}
                />
              ) : null}
              {form.actionType !== "NONE" ? (
                <View style={[styles.pair, dir.row]}>
                  <View style={styles.pairItem}>
                    <FormInput
                      label={t("admin.announcements.buttonHe")}
                      value={form.actionLabelHe}
                      onChangeText={(value) => update("actionLabelHe", value)}
                      error={errors.actionLabelHe}
                      editable={!readOnly}
                    />
                  </View>
                  <View style={styles.pairItem}>
                    <FormInput
                      label={t("admin.announcements.buttonEn")}
                      value={form.actionLabelEn}
                      onChangeText={(value) => update("actionLabelEn", value)}
                      error={errors.actionLabelEn}
                      editable={!readOnly}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          </FormSection>

          <FormSection title={t("admin.announcements.audienceSection")} hint={t("admin.announcements.audienceHint")}>
            <View style={styles.fieldGroup}>
              <ToggleChips
                options={ANNOUNCEMENT_PLATFORMS.map((value) => ({
                  value,
                  label: t(`admin.announcements.platforms.${value}`),
                }))}
                selected={form.platforms}
                onToggle={(value) => !readOnly && togglePlatform(value)}
              />
              <View style={[styles.pair, dir.row]}>
                <View style={styles.pairItem}>
                  <FormInput
                    label={t("admin.announcements.minVersion")}
                    value={form.minAppVersion}
                    onChangeText={(value) => update("minAppVersion", value)}
                    error={errors.minAppVersion}
                    placeholder="1.0.0"
                    keyboardType="numbers-and-punctuation"
                    editable={!readOnly}
                  />
                </View>
                <View style={styles.pairItem}>
                  <FormInput
                    label={t("admin.announcements.maxVersion")}
                    value={form.maxAppVersion}
                    onChangeText={(value) => update("maxAppVersion", value)}
                    error={errors.maxAppVersion}
                    placeholder="2.0.0"
                    keyboardType="numbers-and-punctuation"
                    editable={!readOnly}
                  />
                </View>
              </View>
              <Text style={[styles.hint, dir.text]}>
                {audienceSummary(
                  {
                    platforms: form.platforms,
                    minAppVersion: form.minAppVersion.trim() || null,
                    maxAppVersion: form.maxAppVersion.trim() || null,
                  },
                  t,
                )}
              </Text>
            </View>
          </FormSection>

          <FormSection title={t("admin.announcements.scheduleSection")}>
            <View style={styles.fieldGroup}>
              <DateTimeField
                label={t("admin.announcements.startLabel")}
                emptyLabel={t("admin.announcements.startEmpty")}
                date={form.startDate}
                time={form.startTime}
                error={errors.startTime}
                disabled={readOnly}
                onChangeDate={(value) => update("startDate", value)}
                onChangeTime={(value) => update("startTime", value)}
              />
              <DateTimeField
                label={t("admin.announcements.endLabel")}
                emptyLabel={t("admin.announcements.endEmpty")}
                date={form.endDate}
                time={form.endTime}
                error={errors.endTime}
                disabled={readOnly}
                onChangeDate={(value) => update("endDate", value)}
                onChangeTime={(value) => update("endTime", value)}
              />
            </View>
          </FormSection>

          <FormSection title={t("admin.announcements.previewSection")}>
            <AnnouncementPreview content={previewContent} />
          </FormSection>

          {existing ? (
            <FormSection title={t("admin.history.title")}>
              <AdminHistoryList entries={existing.history} />
            </FormSection>
          ) : null}
        </ScrollView>

        <StickyFooter>
          <View style={[styles.footerRow, dir.row]}>
            {readOnly ? (
              <Button
                label={t("admin.announcements.actions.restore")}
                icon="restore"
                onPress={() =>
                  runAction("restore", "admin.announcements.restoreTitle", "admin.announcements.restoreMessage", false)
                }
                loading={action.isPending}
                style={styles.footerButton}
              />
            ) : status === "PUBLISHED" ? (
              <Button
                label={t("admin.announcements.saveChanges")}
                icon="check"
                onPress={handleSave}
                loading={save.isPending}
                disabled={busy}
                style={styles.footerButton}
              />
            ) : (
              <>
                <Button
                  label={t("admin.announcements.saveDraft")}
                  variant="secondary"
                  onPress={handleSave}
                  loading={save.isPending && !action.isPending}
                  disabled={busy}
                  style={styles.footerButton}
                />
                <Button
                  label={willSchedule ? t("admin.announcements.schedule") : t("admin.announcements.publish")}
                  icon={willSchedule ? "calendar-clock" : "send-outline"}
                  onPress={handlePublish}
                  loading={action.isPending}
                  disabled={busy}
                  style={styles.footerButton}
                />
              </>
            )}
          </View>
        </StickyFooter>
      </KeyboardAvoider>

      <ActionSheet
        visible={menuOpen}
        title={t("admin.announcements.moreActions")}
        actions={menuActions}
        onClose={() => setMenuOpen(false)}
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
        gap: spacing.lg,
      },
      statusCard: {
        gap: spacing.xs,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
      },
      statusText: { ...typography.footnote, color: colors.textSecondary },
      statusStrong: { ...typography.footnote, ...typography.number, fontWeight: "600", color: colors.textPrimary },
      intro: {
        ...typography.footnote,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xs,
      },
      fieldGroup: { gap: spacing.ms },
      hint: { ...typography.caption, color: colors.textMuted },
      error: { ...typography.caption, color: colors.danger },
      pair: { gap: spacing.sm },
      pairItem: { flex: 1, minWidth: 0 },
      footerRow: { gap: spacing.sm },
      footerButton: { flex: 1 },
    }),
  );
