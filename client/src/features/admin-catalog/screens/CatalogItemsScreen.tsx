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
import { formatShortDate } from "../../admin/helpers/format";
import { readParam } from "../../admin/helpers/navigation";
import { CATALOG_SOURCES } from "../constants";
import { useCatalogItems, useIsAdmin } from "../hooks/useAdminCatalog";
import { CatalogItemAdmin, CatalogItemState, CatalogSource } from "../types";

const STATES = ["active", "archived", "all"] as const;
type SourceFilter = "ALL" | CatalogSource;

export function CatalogItemsScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const isAdmin = useIsAdmin();
  const params = useLocalSearchParams<{ state?: string }>();
  const [state, setState] = useState<CatalogItemState>(() => readParam(params.state, STATES) ?? "active");
  const [source, setSource] = useState<SourceFilter>("ALL");
  const [search, setSearch] = useState("");
  const { data = [], isLoading, isError, refetch, loadMore } = useCatalogItems(
    state,
    source === "ALL" ? null : source,
    search,
    isAdmin,
  );

  function renderItem({ item }: { item: CatalogItemAdmin }) {
    return (
      <AdminListRow
        title={item.current.name}
        leading={item.current.imageUrl ? <FoodThumb imageUrl={item.current.imageUrl} fallbackIcon={FOOD_ICONS.product} size={44} /> : undefined}
        lines={[
          [item.current.brand, item.normalizedBarcode ?? t("admin.submissions.noBarcode")].filter(Boolean).join(" · "),
          t("admin.catalog.updated", { date: formatShortDate(item.updatedAt, i18n.language) }),
        ]}
        badges={
          <>
            <StatusBadge label={t(`admin.sources.${item.source}`)} tone="neutral" />
            {item.verificationStatus === "ADMIN_VERIFIED" ? (
              <StatusBadge label={t("admin.catalog.verified")} tone="success" />
            ) : null}
            {item.archivedAt ? <StatusBadge label={t("admin.catalog.archived")} tone="danger" /> : null}
            <StatusBadge label={t("admin.catalog.linkedCount", { count: item.linkedProducts })} tone="neutral" />
          </>
        }
        onPress={() => router.push(ADMIN_ROUTES.catalogItem(item.id))}
      />
    );
  }

  return (
    <AdminScaffold title={t("admin.catalog.title")}>
      <View style={styles.controls}>
        <SegmentedControl
          options={STATES.map((value) => ({ value, label: t(`admin.catalog.states.${value}`) }))}
          value={state}
          onChange={setState}
        />
        <SearchField value={search} onChangeText={setSearch} placeholder={t("admin.catalog.search")} />
        <ChoiceChips<SourceFilter>
          options={[
            { value: "ALL", label: t("admin.catalog.allSources") },
            ...CATALOG_SOURCES.map((value) => ({ value, label: t(`admin.sources.${value}`) })),
          ]}
          value={source}
          onChange={setSource}
        />
      </View>

      {isLoading ? (
        <StateView variant="loading" />
      ) : isError ? (
        <StateView
          variant="error"
          message={t("admin.loadFailed")}
          actionLabel={t("admin.common.retry")}
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
              icon={search.trim() ? "magnify" : "package-variant"}
              title={search.trim() ? t("admin.common.noResults") : t("admin.catalog.empty")}
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
