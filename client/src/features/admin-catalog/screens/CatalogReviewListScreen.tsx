import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { StateView } from "../../../shared/components/ui/StateView";
import { ListGap } from "../../../shared/components/ui/ListGap";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { FoodThumb } from "../../pantry/components/food/FoodThumb";
import { FOOD_ICONS } from "../../pantry/hooks/useFoodCardModels";
import {
  useCatalogReviewSummary,
  useCatalogSubmissions,
  useIsAdmin,
} from "../hooks/useAdminCatalog";
import { CatalogSubmission, CatalogSubmissionKind, CatalogSubmissionStatus } from "../types";

export function CatalogReviewListScreen() {
  const { t, i18n } = useTranslation("settings");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const isAdmin = useIsAdmin();

  const [kind, setKind] = useState<CatalogSubmissionKind>("CORRECTION");
  const [status, setStatus] = useState<CatalogSubmissionStatus>("PENDING");
  const { data: summary } = useCatalogReviewSummary(isAdmin);
  const { data = [], isLoading, isError, refetch, loadMore } = useCatalogSubmissions(status, kind);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("catalogReview.title")} />
        <StateView variant="error" message={t("catalogReview.notAllowed")} />
      </SafeAreaView>
    );
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language, { day: "numeric", month: "short" });

  function renderItem({ item }: { item: CatalogSubmission }) {
    const data = item.proposed;
    return (
      <Pressable
        onPress={() => router.push(`/(app)/settings/catalog-review/${item.id}`)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.card, dir.row, pressed && styles.pressed]}
      >
        <FoodThumb imageUrl={data?.imageUrl ?? null} fallbackIcon={FOOD_ICONS.product} size={48} />
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, dir.text]} numberOfLines={1}>
            {data?.name ?? "—"}
          </Text>
          <Text style={[styles.cardMeta, dir.text]} numberOfLines={1}>
            {[data?.brand, item.normalizedBarcode].filter(Boolean).join(" · ") || "—"}
          </Text>
          <Text style={[styles.cardMeta, dir.text]} numberOfLines={1}>
            {t("catalogReview.submittedBy", {
              name: item.submitter.fullName || item.submitter.email,
              date: formatDate(item.updatedAt),
            })}
          </Text>
        </View>
        <MaterialCommunityIcons name={dir.forwardIcon} size={22} color={colors.textMuted} />
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("catalogReview.title")} />

      <View style={styles.controls}>
        <SegmentedControl
          options={[
            {
              value: "CORRECTION" as CatalogSubmissionKind,
              label: t("catalogReview.corrections", { count: summary?.pendingCorrections ?? 0 }),
            },
            {
              value: "NEW_PRODUCT" as CatalogSubmissionKind,
              label: t("catalogReview.newProducts", { count: summary?.pendingNewProducts ?? 0 }),
            },
          ]}
          value={kind}
          onChange={setKind}
        />
        <SegmentedControl
          size="sm"
          options={[
            { value: "PENDING" as CatalogSubmissionStatus, label: t("catalogReview.status.PENDING") },
            { value: "APPROVED" as CatalogSubmissionStatus, label: t("catalogReview.status.APPROVED") },
            { value: "REJECTED" as CatalogSubmissionStatus, label: t("catalogReview.status.REJECTED") },
          ]}
          value={status}
          onChange={setStatus}
        />
      </View>

      {isLoading ? (
        <StateView variant="loading" />
      ) : isError ? (
        <StateView
          variant="error"
          message={t("catalogReview.loadFailed")}
          actionLabel={t("catalogReview.retry")}
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={ListGap}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <StateView variant="empty" compact icon="check-all" title={t("catalogReview.empty")} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      controls: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.ms,
        gap: spacing.sm,
      },
      list: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        flexGrow: 1,
      },
      card: {
        alignItems: "center",
        gap: spacing.ms,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.ms,
      },
      pressed: { backgroundColor: colors.surfaceMuted },
      cardBody: { flex: 1, minWidth: 0, gap: 2 },
      cardTitle: { ...typography.bodyStrong, color: colors.textPrimary },
      cardMeta: { ...typography.footnote, color: colors.textSecondary },
    }),
  );
