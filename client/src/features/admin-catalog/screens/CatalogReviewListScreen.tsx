import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import { SearchField } from "../../../shared/components/ui/SearchField";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { StateView } from "../../../shared/components/ui/StateView";
import { ListGap } from "../../../shared/components/ui/ListGap";
import { spacing, useThemedStyles } from "../../../shared/theme";
import { FoodThumb } from "../../pantry/components/food/FoodThumb";
import { FOOD_ICONS } from "../../pantry/hooks/useFoodCardModels";
import { AdminScaffold } from "../../admin/components/AdminScaffold";
import { AdminListRow } from "../../admin/components/AdminListRow";
import { ChoiceChips } from "../../../shared/components/ui/ChoiceChips";
import { StatusBadge } from "../../admin/components/StatusBadge";
import { ADMIN_ROUTES } from "../../admin/constants";
import { formatShortDate, personName } from "../../admin/helpers/format";
import { readParam } from "../../admin/helpers/navigation";
import { submissionStatusTone } from "../helpers/tones";
import { useCatalogReviewSummary, useCatalogSubmissions, useIsAdmin } from "../hooks/useAdminCatalog";
import { CatalogSubmission, CatalogSubmissionKind, CatalogSubmissionStatus } from "../types";

const KINDS = ["NEW_PRODUCT", "CORRECTION"] as const;
const STATUSES = ["PENDING", "APPROVED", "MERGED", "REJECTED"] as const;

export function CatalogReviewListScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const isAdmin = useIsAdmin();
  const params = useLocalSearchParams<{ kind?: string; status?: string }>();

  const [kind, setKind] = useState<CatalogSubmissionKind>(
    () => readParam(params.kind, KINDS) ?? "NEW_PRODUCT",
  );
  const [status, setStatus] = useState<CatalogSubmissionStatus>(
    () => readParam(params.status, STATUSES) ?? "PENDING",
  );
  const [search, setSearch] = useState("");
  const { data: summary } = useCatalogReviewSummary(isAdmin);
  const { data = [], isLoading, isError, refetch, loadMore } = useCatalogSubmissions(
    status,
    kind,
    search,
    isAdmin,
  );

  function renderItem({ item }: { item: CatalogSubmission }) {
    const proposed = item.proposed;
    return (
      <AdminListRow
        title={proposed?.name ?? "—"}
        leading={proposed?.imageUrl ? <FoodThumb imageUrl={proposed?.imageUrl ?? null} fallbackIcon={FOOD_ICONS.product} size={44} /> : undefined}
        lines={[
          [proposed?.brand, item.normalizedBarcode ?? t("admin.submissions.noBarcode")].filter(Boolean).join(" · "),
          t("catalogReview.submittedBy", {
            name: personName(item.submitter),
            date: formatShortDate(item.updatedAt, i18n.language),
          }),
        ]}
        badges={
          status !== "PENDING" ? (
            <StatusBadge label={t(`catalogReview.status.${item.status}`)} tone={submissionStatusTone(item.status)} />
          ) : null
        }
        onPress={() => router.push(ADMIN_ROUTES.submission(item.id))}
      />
    );
  }

  return (
    <AdminScaffold title={t("catalogReview.title")}>
      <View style={styles.controls}>
        <SegmentedControl
          options={[
            {
              value: "NEW_PRODUCT" as CatalogSubmissionKind,
              label: t("catalogReview.newProducts", { count: summary?.pendingNewProducts ?? 0 }),
            },
            {
              value: "CORRECTION" as CatalogSubmissionKind,
              label: t("catalogReview.corrections", { count: summary?.pendingCorrections ?? 0 }),
            },
          ]}
          value={kind}
          onChange={setKind}
        />
        <SearchField value={search} onChangeText={setSearch} placeholder={t("admin.submissions.search")} />
        <ChoiceChips
          options={STATUSES.map((value) => ({ value, label: t(`catalogReview.status.${value}`) }))}
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
          keyboardShouldPersistTaps="handled"
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <StateView
              variant="empty"
              compact
              icon={search.trim() ? "magnify" : "check-all"}
              title={search.trim() ? t("admin.common.noResults") : t("catalogReview.empty")}
            />
          }
        />
      )}
    </AdminScaffold>
  );
}

const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
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
    }),
  );
