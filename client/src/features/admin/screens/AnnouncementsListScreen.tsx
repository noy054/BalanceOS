import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import { Button } from "../../../shared/components/ui/Button";
import { SearchField } from "../../../shared/components/ui/SearchField";
import { StateView } from "../../../shared/components/ui/StateView";
import { ListGap } from "../../../shared/components/ui/ListGap";
import { spacing, useThemedStyles } from "../../../shared/theme";
import { useIsAdmin } from "../../admin-catalog/hooks/useAdminCatalog";
import { AdminListRow } from "../components/AdminListRow";
import { AdminScaffold } from "../components/AdminScaffold";
import { FilterChips } from "../components/FilterChips";
import { StatusBadge } from "../components/StatusBadge";
import { ADMIN_ROUTES } from "../constants";
import { formatDateTime } from "../helpers/format";
import { announcementStateTone, audienceSummary } from "../helpers/announcementLabels";
import { readParam } from "../helpers/navigation";
import { useAdminAnnouncements } from "../hooks/useAdmin";
import { AdminAnnouncement, AnnouncementState } from "../types";

const STATES = ["ACTIVE", "SCHEDULED", "DRAFT", "EXPIRED", "ARCHIVED"] as const;
type Filter = "ALL" | AnnouncementState;

export function AnnouncementsListScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const isAdmin = useIsAdmin();
  const params = useLocalSearchParams<{ state?: string }>();
  const [filter, setFilter] = useState<Filter>(() => readParam(params.state, STATES) ?? "ALL");
  const [search, setSearch] = useState("");
  const { data = [], isLoading, isError, refetch, loadMore } = useAdminAnnouncements(
    filter === "ALL" ? null : filter,
    search,
    isAdmin,
  );
  const hebrew = i18n.language.startsWith("he");

  function renderItem({ item }: { item: AdminAnnouncement }) {
    const schedule =
      item.state === "SCHEDULED"
        ? t("admin.announcements.startsAt", { date: formatDateTime(item.publishAt, i18n.language) })
        : item.expiresAt
          ? t("admin.announcements.endsAt", { date: formatDateTime(item.expiresAt, i18n.language) })
          : t("admin.announcements.updatedAt", { date: formatDateTime(item.updatedAt, i18n.language) });
    return (
      <AdminListRow
        title={(hebrew ? item.titleHe : item.titleEn) || item.titleEn}
        lines={[schedule, audienceSummary(item, t)]}
        badges={
          <>
            <StatusBadge label={t(`admin.announcementStates.${item.state}`)} tone={announcementStateTone(item.state)} />
            <StatusBadge label={t(`admin.announcements.kinds.${item.kind}`)} tone="neutral" />
            <StatusBadge label={t(`admin.announcements.displays.${item.display}`)} tone="neutral" />
          </>
        }
        onPress={() => router.push(ADMIN_ROUTES.announcement(item.id))}
      />
    );
  }

  return (
    <AdminScaffold
      title={t("admin.announcements.title")}
      rightElement={
        <Button
          label={t("admin.announcements.new")}
          variant="ghost"
          size="sm"
          icon="plus"
          onPress={() => router.push(ADMIN_ROUTES.announcement("new"))}
        />
      }
    >
      <View style={styles.controls}>
        <SearchField value={search} onChangeText={setSearch} placeholder={t("admin.announcements.search")} />
        <FilterChips<Filter>
          options={[
            { value: "ALL", label: t("admin.activity.all") },
            ...STATES.map((value) => ({ value, label: t(`admin.announcementStates.${value}`) })),
          ]}
          value={filter}
          onChange={setFilter}
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
              icon="bullhorn-outline"
              title={search.trim() ? t("admin.common.noResults") : t("admin.announcements.empty")}
              actionLabel={t("admin.announcements.new")}
              onAction={() => router.push(ADMIN_ROUTES.announcement("new"))}
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
