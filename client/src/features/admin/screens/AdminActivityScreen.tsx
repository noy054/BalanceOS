import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { StateView } from "../../../shared/components/ui/StateView";
import { spacing, useThemedStyles } from "../../../shared/theme";
import { useIsAdmin } from "../../admin-catalog/hooks/useAdminCatalog";
import { AdminHistoryList } from "../components/AdminHistoryList";
import { AdminScaffold } from "../components/AdminScaffold";
import { ChoiceChips } from "../../../shared/components/ui/ChoiceChips";
import { openHistoryEntity } from "../helpers/navigation";
import { useAdminActivity } from "../hooks/useAdmin";
import { AdminEntityType, AdminHistoryEntry } from "../types";

type Filter = "ALL" | AdminEntityType;

export function AdminActivityScreen() {
  const { t } = useTranslation("settings");
  const styles = useStyles();
  const isAdmin = useIsAdmin();
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data = [], isLoading, isError, refetch, loadMore, isFetchingNextPage } = useAdminActivity(
    filter === "ALL" ? null : filter,
    isAdmin,
  );

  const options: Array<{ value: Filter; label: string }> = [
    { value: "ALL", label: t("admin.activity.all") },
    { value: "CATALOG_SUBMISSION", label: t("admin.entities.CATALOG_SUBMISSION") },
    { value: "CATALOG_ITEM", label: t("admin.entities.CATALOG_ITEM") },
    { value: "ANNOUNCEMENT", label: t("admin.entities.ANNOUNCEMENT") },
  ];

  return (
    <AdminScaffold title={t("admin.activity.title")}>
      <View style={styles.controls}>
        <ChoiceChips options={options} value={filter} onChange={setFilter} />
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
      ) : data.length === 0 ? (
        <StateView variant="empty" icon="history" title={t("admin.history.empty")} />
      ) : (
        <FlatList<AdminHistoryEntry[]>
          data={[data]}
          keyExtractor={() => "history"}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AdminHistoryList entries={item} showEntity onPressEntry={openHistoryEntity} />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={isFetchingNextPage ? <StateView variant="loading" compact /> : undefined}
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
      },
      list: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
      },
    }),
  );
