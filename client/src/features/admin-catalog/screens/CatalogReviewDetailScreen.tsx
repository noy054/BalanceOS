import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
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
  useApproveSubmission,
  useCatalogSubmission,
  useIsAdmin,
  useMergeSubmission,
  useRejectSubmission,
} from "../hooks/useAdminCatalog";
import { CatalogItemView } from "../types";

export function CatalogReviewDetailScreen() {
  const { t, i18n } = useTranslation("settings");
  const { t: tPantry } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const isAdmin = useIsAdmin();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const submissionId = typeof id === "string" ? id : "";

  const { data: submission, isLoading, isError, refetch } = useCatalogSubmission(isAdmin ? submissionId : "");
  const approve = useApproveSubmission(submissionId);
  const reject = useRejectSubmission(submissionId);
  const merge = useMergeSubmission(submissionId);
  const [reviewNote, setReviewNote] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  const source = useMemo<ProductFormPrefill | null>(
    () =>
      submission?.proposed ? { ...submission.proposed, id: submission.id, mealCategories: [] } : null,
    [submission],
  );

  const form = useAddProductForm({
    source,
    requireCoreValues: true,
    preferPer100g: true,
    requiredFieldError: tPantry("errors.requiredField"),
    invalidNumberError: tPantry("errors.invalidNumber"),
  });

  const title = t("catalogReview.detailTitle");

  if (isLoading || (isAdmin && !submission && !isError)) {
    return (
      <AdminScaffold title={title}>
        <StateView variant="loading" />
      </AdminScaffold>
    );
  }

  if (!submission) {
    return (
      <AdminScaffold title={title}>
        <StateView
          variant="error"
          message={t("catalogReview.loadFailed")}
          actionLabel={t("catalogReview.retry")}
          onAction={() => refetch()}
        />
      </AdminScaffold>
    );
  }

  const isPending = submission.status === "PENDING";
  const isCorrection = submission.kind === "CORRECTION";
  const target = submission.similarItems.find((item) => item.id === targetId) ?? null;
  const columns = [
    ...(submission.catalogItem?.original
      ? [{ key: "original", label: t("catalogReview.columns.original"), data: submission.catalogItem.original }]
      : []),
    ...(submission.catalogItem
      ? [{ key: "current", label: t("catalogReview.columns.current"), data: submission.catalogItem.current }]
      : []),
    ...(target ? [{ key: "target", label: t("admin.submissions.targetColumn"), data: target.current }] : []),
    { key: "proposed", label: t("catalogReview.columns.proposed"), data: submission.proposed },
  ];

  function showError(err: unknown) {
    Alert.alert("", adminErrorMessage(err, t, t("catalogReview.actionFailed")));
  }

  async function handleApprove() {
    const payload = form.validate();
    if (!payload) return;
    const confirmed = await confirmAction({
      title: target ? t("admin.submissions.approveIntoTitle") : t("admin.submissions.approveTitle"),
      message: target
        ? t("admin.submissions.approveIntoMessage", { name: target.current.name })
        : t("admin.submissions.approveMessage"),
      confirmLabel: t("catalogReview.approve"),
      cancelLabel: t("catalogReview.cancel"),
    });
    if (!confirmed) return;
    try {
      await approve.mutateAsync({
        ...payload,
        ...(targetId ? { targetCatalogItemId: targetId } : {}),
        ...(reviewNote.trim() ? { reviewNote: reviewNote.trim() } : {}),
      });
      router.back();
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function handleMerge(item: CatalogItemView) {
    const confirmed = await confirmAction({
      title: t("admin.submissions.mergeTitle"),
      message: t("admin.submissions.mergeMessage", { name: item.current.name }),
      confirmLabel: t("admin.submissions.merge"),
      cancelLabel: t("catalogReview.cancel"),
    });
    if (!confirmed) return;
    try {
      await merge.mutateAsync({
        targetCatalogItemId: item.id,
        ...(reviewNote.trim() ? { reviewNote: reviewNote.trim() } : {}),
      });
      router.back();
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function handleReject(reason: string) {
    try {
      await reject.mutateAsync(reason);
      setRejectOpen(false);
      router.back();
    } catch (err: unknown) {
      showError(err);
    }
  }

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
              <StatusBadge
                label={t(`catalogReview.kind.${submission.kind}`)}
                tone={isCorrection ? "warning" : "accent"}
              />
              <StatusBadge
                label={t(`catalogReview.status.${submission.status}`)}
                tone={submissionStatusTone(submission.status)}
              />
            </View>
            <Text style={[styles.metaTitle, dir.text]}>{submission.proposed?.name ?? "—"}</Text>
            <Text style={[styles.metaText, dir.text]}>
              {t("catalogReview.submittedBy", {
                name: personName(submission.submitter),
                date: formatDateTime(submission.updatedAt, i18n.language),
              })}
            </Text>
            <Text style={[styles.metaText, dir.text]}>
              {submission.normalizedBarcode
                ? t("catalogReview.barcode", { barcode: submission.normalizedBarcode })
                : t("admin.submissions.noBarcode")}
            </Text>
            {submission.catalogItem ? (
              <Text style={[styles.metaText, dir.text]}>
                {t("catalogReview.source", {
                  source: t(`admin.sources.${submission.catalogItem.source}`, {
                    defaultValue: submission.catalogItem.externalProvider ?? submission.catalogItem.source,
                  }),
                })}
              </Text>
            ) : null}
            {!isPending ? (
              <Text style={[styles.metaStrong, dir.text]}>
                {t("admin.submissions.reviewedBy", {
                  name: personName(submission.reviewer),
                  date: formatDateTime(submission.reviewedAt, i18n.language),
                })}
                {submission.reviewNote ? ` · “${submission.reviewNote}”` : ""}
              </Text>
            ) : (
              <Text style={[styles.privacyNote, dir.text]}>{t("admin.submissions.privateNote")}</Text>
            )}
          </View>

          <FormSection title={t("catalogReview.compare")}>
            <CatalogComparisonTable columns={columns} highlightKey="proposed" />
          </FormSection>

          {submission.similarSubmissions.length > 0 ? (
            <FormSection
              title={t("admin.submissions.duplicatesTitle")}
              hint={t("admin.submissions.duplicatesHint")}
            >
              <View style={styles.stack}>
                {submission.similarSubmissions.map((other) => (
                  <AdminListRow
                    key={other.id}
                    title={other.proposed?.name ?? "—"}
                    lines={[
                      t("catalogReview.submittedBy", {
                        name: personName(other.submitter),
                        date: formatShortDate(other.updatedAt, i18n.language),
                      }),
                    ]}
                    onPress={() => router.push(ADMIN_ROUTES.submission(other.id))}
                  />
                ))}
              </View>
            </FormSection>
          ) : null}

          {isPending && !isCorrection && submission.similarItems.length > 0 ? (
            <FormSection title={t("catalogReview.similarTitle")} hint={t("catalogReview.similarHint")}>
              <View style={styles.similarList}>
                {[null, ...submission.similarItems].map((item) => {
                  const archived = Boolean(item?.archivedAt);
                  const selected = (item?.id ?? null) === targetId;
                  return (
                    <Pressable
                      key={item?.id ?? "new"}
                      onPress={() => !archived && setTargetId(item?.id ?? null)}
                      disabled={archived}
                      accessibilityRole="radio"
                      accessibilityState={{ selected, disabled: archived }}
                      style={[
                        styles.similarRow,
                        dir.row,
                        selected && styles.similarRowSelected,
                        archived && styles.similarRowDisabled,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={selected ? "radiobox-marked" : "radiobox-blank"}
                        size={20}
                        color={selected ? colors.accent : colors.textMuted}
                      />
                      <View style={styles.similarBody}>
                        <Text style={[styles.similarText, dir.text]} numberOfLines={2}>
                          {item
                            ? [item.current.name, item.current.brand, item.normalizedBarcode]
                                .filter(Boolean)
                                .join(" · ")
                            : t("catalogReview.createNew")}
                        </Text>
                        {archived ? <StatusBadge label={t("admin.catalog.archived")} tone="neutral" /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              {target ? (
                <Button
                  label={t("admin.submissions.mergeWithoutChanges")}
                  icon="call-merge"
                  variant="tonal"
                  onPress={() => handleMerge(target)}
                  loading={merge.isPending}
                  style={styles.mergeButton}
                />
              ) : null}
            </FormSection>
          ) : null}

          {isPending ? (
            <>
              <Text style={[styles.sectionIntro, dir.text]}>{t("catalogReview.editIntro")}</Text>

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

              <FormInput
                label={t("catalogReview.noteLabel")}
                value={reviewNote}
                onChangeText={setReviewNote}
                multiline
              />
            </>
          ) : null}

          <FormSection title={t("admin.history.title")}>
            <AdminHistoryList entries={submission.history} />
          </FormSection>
        </ScrollView>

        {isPending ? (
          <StickyFooter>
            <View style={[styles.footerRow, dir.row]}>
              <Button
                label={t("catalogReview.reject")}
                variant="secondary"
                onPress={() => setRejectOpen(true)}
                style={styles.footerButton}
              />
              <Button
                label={target ? t("admin.submissions.approveInto") : t("catalogReview.approve")}
                icon="check"
                onPress={handleApprove}
                loading={approve.isPending}
                style={styles.footerButton}
              />
            </View>
          </StickyFooter>
        ) : null}
      </KeyboardAvoider>

      <ReasonSheet
        visible={rejectOpen}
        title={t("catalogReview.rejectTitle")}
        message={t("catalogReview.rejectMessage")}
        label={t("admin.submissions.rejectReason")}
        confirmLabel={t("catalogReview.reject")}
        destructive
        loading={reject.isPending}
        onConfirm={handleReject}
        onClose={() => setRejectOpen(false)}
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
      metaStrong: { ...typography.footnote, fontFamily: fonts.semibold, color: colors.textPrimary },
      privacyNote: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
      stack: { gap: spacing.sm },
      sectionIntro: {
        ...typography.callout,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xs,
      },
      similarList: { gap: spacing.xs },
      similarRow: {
        alignItems: "center",
        gap: spacing.sm,
        padding: spacing.sm,
        borderRadius: radius.md,
      },
      similarRowSelected: { backgroundColor: colors.accentSoft },
      similarRowDisabled: { opacity: 0.55 },
      similarBody: { flex: 1, gap: 2 },
      similarText: { ...typography.callout, color: colors.textPrimary },
      mergeButton: { marginTop: spacing.sm },
      footerRow: { gap: spacing.sm },
      footerButton: { flex: 1 },
    }),
  );
