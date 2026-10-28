import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { FormInput } from "../../../shared/components/FormInput";
import { Button } from "../../../shared/components/ui/Button";
import { FormSection } from "../../../shared/components/ui/FormSection";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { KeyboardAvoider } from "../../../shared/components/ui/KeyboardAvoider";
import { confirmAction } from "../../../shared/helpers/confirm";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { ProductBasicInfoForm } from "../../pantry/components/products/ProductBasicInfoForm";
import { ProductNutritionForm } from "../../pantry/components/products/ProductNutritionForm";
import { ProductFormPrefill, useAddProductForm } from "../../pantry/hooks/useAddProductForm";
import { CatalogComparisonTable } from "../components/CatalogComparisonTable";
import {
  useApproveSubmission,
  useCatalogSubmission,
  useIsAdmin,
  useRejectSubmission,
} from "../hooks/useAdminCatalog";

export function CatalogReviewDetailScreen() {
  const { t, i18n } = useTranslation("settings");
  const { t: tPantry } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const isAdmin = useIsAdmin();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const submissionId = typeof id === "string" ? id : "";

  const { data: submission, isLoading, isError } = useCatalogSubmission(isAdmin ? submissionId : "");
  const approve = useApproveSubmission(submissionId);
  const reject = useRejectSubmission(submissionId);
  const [reviewNote, setReviewNote] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);

  const source = useMemo<ProductFormPrefill | null>(
    () =>
      submission?.proposed
        ? { ...submission.proposed, id: submission.id, mealCategories: [] }
        : null,
    [submission],
  );

  const form = useAddProductForm({
    source,
    requireCoreValues: true,
    preferPer100g: true,
    requiredFieldError: tPantry("errors.requiredField"),
    invalidNumberError: tPantry("errors.invalidNumber"),
  });

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("catalogReview.title")} />
        <StateView variant="error" message={t("catalogReview.notAllowed")} />
      </SafeAreaView>
    );
  }

  if (isLoading || (!submission && !isError)) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("catalogReview.detailTitle")} />
        <StateView variant="loading" />
      </SafeAreaView>
    );
  }

  if (!submission) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("catalogReview.detailTitle")} />
        <StateView variant="error" message={t("catalogReview.loadFailed")} />
      </SafeAreaView>
    );
  }

  const isPending = submission.status === "PENDING";
  const isCorrection = submission.kind === "CORRECTION";
  const columns = [
    ...(submission.catalogItem?.original
      ? [{ key: "original", label: t("catalogReview.columns.original"), data: submission.catalogItem.original }]
      : []),
    ...(submission.catalogItem
      ? [{ key: "current", label: t("catalogReview.columns.current"), data: submission.catalogItem.current }]
      : []),
    { key: "proposed", label: t("catalogReview.columns.proposed"), data: submission.proposed },
  ];

  async function handleApprove() {
    const payload = form.validate();
    if (!payload) return;
    try {
      await approve.mutateAsync({
        ...payload,
        ...(targetId ? { targetCatalogItemId: targetId } : {}),
        ...(reviewNote.trim() ? { reviewNote: reviewNote.trim() } : {}),
      });
      router.back();
    } catch {
      Alert.alert("", t("catalogReview.actionFailed"));
    }
  }

  async function handleReject() {
    const confirmed = await confirmAction({
      title: t("catalogReview.rejectTitle"),
      message: t("catalogReview.rejectMessage"),
      confirmLabel: t("catalogReview.reject"),
      cancelLabel: t("catalogReview.cancel"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await reject.mutateAsync(reviewNote.trim() || undefined);
      router.back();
    } catch {
      Alert.alert("", t("catalogReview.actionFailed"));
    }
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(i18n.language, { dateStyle: "medium", timeStyle: "short" });

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("catalogReview.detailTitle")} />

      <KeyboardAvoider>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={[styles.metaCard, dir.alignStart]}>
            <Text style={[styles.badge, isCorrection ? styles.badgeCorrection : styles.badgeNew]}>
              {isCorrection ? t("catalogReview.kind.CORRECTION") : t("catalogReview.kind.NEW_PRODUCT")}
            </Text>
            <Text style={[styles.metaText, dir.text]}>
              {t("catalogReview.submittedBy", {
                name: submission.submitter.fullName || submission.submitter.email,
                date: formatDate(submission.updatedAt),
              })}
            </Text>
            {submission.normalizedBarcode ? (
              <Text style={[styles.metaText, dir.text]}>
                {t("catalogReview.barcode", { barcode: submission.normalizedBarcode })}
              </Text>
            ) : null}
            {submission.catalogItem ? (
              <Text style={[styles.metaText, dir.text]}>
                {t("catalogReview.source", {
                  source: submission.catalogItem.externalProvider ?? submission.catalogItem.source,
                })}
              </Text>
            ) : null}
            {!isPending ? (
              <Text style={[styles.metaStrong, dir.text]}>
                {t(`catalogReview.status.${submission.status}`)}
                {submission.reviewNote ? ` · ${submission.reviewNote}` : ""}
              </Text>
            ) : null}
          </View>

          <FormSection title={t("catalogReview.compare")}>
            <CatalogComparisonTable columns={columns} highlightKey="proposed" />
          </FormSection>

          {submission.similarItems.length > 0 && isPending ? (
            <FormSection
              title={t("catalogReview.similarTitle")}
              hint={t("catalogReview.similarHint")}
            >
              <View style={styles.similarList}>
                {[null, ...submission.similarItems].map((item) => {
                  const selected = (item?.id ?? null) === targetId;
                  return (
                    <Pressable
                      key={item?.id ?? "new"}
                      onPress={() => setTargetId(item?.id ?? null)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[styles.similarRow, dir.row, selected && styles.similarRowSelected]}
                    >
                      <MaterialCommunityIcons
                        name={selected ? "radiobox-marked" : "radiobox-blank"}
                        size={20}
                        color={selected ? colors.accent : colors.textMuted}
                      />
                      <Text style={[styles.similarText, dir.text]} numberOfLines={2}>
                        {item
                          ? [item.current.name, item.current.brand, item.normalizedBarcode]
                              .filter(Boolean)
                              .join(" · ")
                          : t("catalogReview.createNew")}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
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
        </ScrollView>

        {isPending ? (
          <StickyFooter>
            <View style={[styles.footerRow, dir.row]}>
              <Button
                label={t("catalogReview.reject")}
                variant="secondary"
                onPress={handleReject}
                loading={reject.isPending}
                style={styles.footerButton}
              />
              <Button
                label={t("catalogReview.approve")}
                icon="check"
                onPress={handleApprove}
                loading={approve.isPending}
                style={styles.footerButton}
              />
            </View>
          </StickyFooter>
        ) : null}
      </KeyboardAvoider>
    </SafeAreaView>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      content: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      },
      metaCard: {
        gap: spacing.xs,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
      },
      badge: {
        ...typography.caption,
        fontWeight: "700",
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        overflow: "hidden",
      },
      badgeCorrection: { color: colors.warning, backgroundColor: colors.warningSoft },
      badgeNew: { color: colors.accent, backgroundColor: colors.accentSoft },
      metaText: { ...typography.footnote, color: colors.textSecondary },
      metaStrong: { ...typography.footnote, fontWeight: "600", color: colors.textPrimary },
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
      similarText: { flex: 1, ...typography.callout, color: colors.textPrimary },
      footerRow: { gap: spacing.sm },
      footerButton: { flex: 1 },
    }),
  );
