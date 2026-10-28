import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import { FormInput } from "../../../shared/components/FormInput";
import { Button } from "../../../shared/components/ui/Button";
import { FormSection } from "../../../shared/components/ui/FormSection";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { KeyboardAvoider } from "../../../shared/components/ui/KeyboardAvoider";
import { confirmAction } from "../../../shared/helpers/confirm";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { ProductBasicInfoForm } from "../../pantry/components/products/ProductBasicInfoForm";
import { ProductNutritionForm } from "../../pantry/components/products/ProductNutritionForm";
import { ProductFormPrefill, useAddProductForm } from "../../pantry/hooks/useAddProductForm";
import { AdminScaffold } from "../../admin/components/AdminScaffold";
import { AdminHistoryList } from "../../admin/components/AdminHistoryList";
import { AdminListRow } from "../../admin/components/AdminListRow";
import { ReasonSheet } from "../../admin/components/ReasonSheet";
import { StatusBadge } from "../../admin/components/StatusBadge";
import { ADMIN_ROUTES } from "../../admin/constants";
import { formatDateTime, formatShortDate, personName } from "../../admin/helpers/format";
import { adminErrorMessage } from "../../admin/helpers/errors";
import { CatalogComparisonTable } from "../components/CatalogComparisonTable";
import { submissionStatusTone } from "../helpers/tones";
import {
  useArchiveCatalogItem,
  useCatalogItem,
  useIsAdmin,
  useUpdateCatalogItem,
} from "../hooks/useAdminCatalog";

export function CatalogItemDetailScreen() {
  const { t, i18n } = useTranslation("settings");
  const { t: tPantry } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const isAdmin = useIsAdmin();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const itemId = typeof id === "string" ? id : "";

  const { data: item, isLoading, isError, refetch } = useCatalogItem(isAdmin ? itemId : "");
  const update = useUpdateCatalogItem(itemId);
  const archive = useArchiveCatalogItem(itemId);
  const [editing, setEditing] = useState(false);
  const [editSession, setEditSession] = useState(0);
  const [note, setNote] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);

  const source = useMemo<ProductFormPrefill | null>(
    () =>
      item && editing
        ? { ...item.current, id: `${item.id}:${editSession}`, mealCategories: [] }
        : null,
    [item, editing, editSession],
  );

  const form = useAddProductForm({
    source,
    requireCoreValues: true,
    preferPer100g: true,
    requiredFieldError: tPantry("errors.requiredField"),
    invalidNumberError: tPantry("errors.invalidNumber"),
  });

  const title = t("admin.catalog.detailTitle");

  if (isLoading || (isAdmin && !item && !isError)) {
    return (
      <AdminScaffold title={title}>
        <StateView variant="loading" />
      </AdminScaffold>
    );
  }

  if (!item) {
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

  const columns = [
    ...(item.original ? [{ key: "original", label: t("catalogReview.columns.original"), data: item.original }] : []),
    { key: "current", label: t("catalogReview.columns.current"), data: item.current },
  ];

  function showError(err: unknown) {
    Alert.alert("", adminErrorMessage(err, t, t("admin.errors.generic")));
  }

  async function handleSave() {
    const payload = form.validate();
    if (!payload) return;
    const confirmed = await confirmAction({
      title: t("admin.catalog.saveTitle"),
      message: t("admin.catalog.saveMessage"),
      confirmLabel: t("admin.common.save"),
      cancelLabel: t("admin.common.cancel"),
    });
    if (!confirmed) return;
    try {
      await update.mutateAsync({ ...payload, ...(note.trim() ? { note: note.trim() } : {}) });
      setEditing(false);
      setNote("");
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function handleArchive(reason: string) {
    try {
      await archive.mutateAsync({ archive: true, reason });
      setArchiveOpen(false);
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function handleRestore() {
    const confirmed = await confirmAction({
      title: t("admin.catalog.restoreTitle"),
      message: t("admin.catalog.restoreMessage"),
      confirmLabel: t("admin.catalog.restore"),
      cancelLabel: t("admin.common.cancel"),
    });
    if (!confirmed) return;
    try {
      await archive.mutateAsync({ archive: false });
    } catch (err: unknown) {
      showError(err);
    }
  }

  const sourceLabel = t(`admin.sources.${item.source}`);

  return (
    <AdminScaffold title={title}>
      <KeyboardAvoider>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={[styles.metaCard, dir.alignStart]}>
            <View style={[styles.badges, dir.row]}>
              <StatusBadge label={sourceLabel} tone="neutral" />
              {item.verificationStatus === "ADMIN_VERIFIED" ? (
                <StatusBadge label={t("admin.catalog.verified")} tone="success" />
              ) : null}
              {item.archivedAt ? <StatusBadge label={t("admin.catalog.archived")} tone="danger" /> : null}
            </View>
            <Text style={[styles.metaTitle, dir.text]}>{item.current.name}</Text>
            <Text style={[styles.metaText, dir.text]}>
              {item.normalizedBarcode
                ? t("catalogReview.barcode", { barcode: item.normalizedBarcode })
                : t("admin.submissions.noBarcode")}
            </Text>
            <Text style={[styles.metaText, dir.text]}>
              {t("admin.catalog.createdBy", {
                name: personName(item.createdBy),
                date: formatDateTime(item.createdAt, i18n.language),
              })}
            </Text>
            <Text style={[styles.metaText, dir.text]}>
              {t("admin.catalog.updatedBy", {
                name: personName(item.updatedBy),
                date: formatDateTime(item.updatedAt, i18n.language),
              })}
            </Text>
            {item.archivedAt ? (
              <Text style={[styles.metaStrong, dir.text]}>
                {t("admin.catalog.archivedBy", {
                  name: personName(item.archivedBy),
                  date: formatDateTime(item.archivedAt, i18n.language),
                })}
              </Text>
            ) : null}
            <Text style={[styles.metaText, dir.text]}>
              {t("admin.catalog.linkedCount", { count: item.linkedProducts })}
            </Text>
            <Text style={[styles.privacyNote, dir.text]}>{t("admin.catalog.historyNote")}</Text>
          </View>

          <FormSection title={t("catalogReview.compare")}>
            <CatalogComparisonTable columns={columns} highlightKey="current" />
          </FormSection>

          {editing ? (
            <>
              <Text style={[styles.sectionIntro, dir.text]}>{t("admin.catalog.editIntro")}</Text>
              <ProductBasicInfoForm
                t={tPantry}
                language={i18n.language}
                errors={form.errors}
                autoFocus={false}
                field={form.field}
              />
              <ProductNutritionForm
                t={tPantry}
                language={i18n.language}
                isRTL={dir.isRTL}
                errors={form.errors}
                nutritionMode={form.nutritionMode}
                isPerServing={form.isPerServing}
                serving={form.serving}
                requireCoreValues
                onSwitchMode={form.switchMode}
                onChangeServing={form.updateServing}
                field={form.field}
              />
              <FormInput label={t("admin.catalog.changeNote")} value={note} onChangeText={setNote} multiline />
            </>
          ) : null}

          {item.submissions.length > 0 ? (
            <FormSection title={t("admin.catalog.submissions")}>
              <View style={styles.stack}>
                {item.submissions.map((submission) => (
                  <AdminListRow
                    key={submission.id}
                    title={submission.productName || item.current.name}
                    lines={[
                      t("catalogReview.submittedBy", {
                        name: personName(submission.user),
                        date: formatShortDate(submission.createdAt, i18n.language),
                      }),
                    ]}
                    badges={
                      <StatusBadge
                        label={t(`catalogReview.status.${submission.status}`)}
                        tone={submissionStatusTone(submission.status)}
                      />
                    }
                    onPress={() => router.push(ADMIN_ROUTES.submission(submission.id))}
                  />
                ))}
              </View>
            </FormSection>
          ) : null}

          <FormSection title={t("admin.history.title")}>
            <AdminHistoryList entries={item.history} />
          </FormSection>
        </ScrollView>

        <StickyFooter>
          <View style={[styles.footerRow, dir.row]}>
            {editing ? (
              <>
                <Button
                  label={t("admin.common.cancel")}
                  variant="secondary"
                  onPress={() => setEditing(false)}
                  style={styles.footerButton}
                />
                <Button
                  label={t("admin.common.save")}
                  icon="check"
                  onPress={handleSave}
                  loading={update.isPending}
                  style={styles.footerButton}
                />
              </>
            ) : (
              <>
                {item.archivedAt ? (
                  <Button
                    label={t("admin.catalog.restore")}
                    icon="restore"
                    variant="secondary"
                    onPress={handleRestore}
                    loading={archive.isPending}
                    style={styles.footerButton}
                  />
                ) : (
                  <Button
                    label={t("admin.catalog.archive")}
                    icon="archive-outline"
                    variant="secondary"
                    onPress={() => setArchiveOpen(true)}
                    style={styles.footerButton}
                  />
                )}
                <Button
                  label={t("admin.catalog.edit")}
                  icon="pencil-outline"
                  onPress={() => {
                    setEditSession((value) => value + 1);
                    setEditing(true);
                  }}
                  style={styles.footerButton}
                />
              </>
            )}
          </View>
        </StickyFooter>
      </KeyboardAvoider>

      <ReasonSheet
        visible={archiveOpen}
        title={t("admin.catalog.archiveTitle")}
        message={t("admin.catalog.archiveMessage")}
        label={t("admin.catalog.archiveReason")}
        confirmLabel={t("admin.catalog.archive")}
        destructive
        loading={archive.isPending}
        onConfirm={handleArchive}
        onClose={() => setArchiveOpen(false)}
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
      metaCard: {
        gap: spacing.xs,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
      },
      badges: { gap: spacing.xs, flexWrap: "wrap" },
      metaTitle: { ...typography.headline, color: colors.textPrimary, marginTop: spacing.xs },
      metaText: { ...typography.footnote, color: colors.textSecondary },
      metaStrong: { ...typography.footnote, fontWeight: "600", color: colors.danger },
      privacyNote: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
      sectionIntro: {
        ...typography.callout,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xs,
      },
      stack: { gap: spacing.sm },
      footerRow: { gap: spacing.sm },
      footerButton: { flex: 1 },
    }),
  );
