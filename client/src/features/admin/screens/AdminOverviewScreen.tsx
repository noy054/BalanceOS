import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { SectionHeader } from "../../../shared/components/ui/SectionHeader";
import { StateView } from "../../../shared/components/ui/StateView";
import { Button } from "../../../shared/components/ui/Button";
import { useDirection } from "../../../shared/hooks/useDirection";
import { spacing, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { useIsAdmin } from "../../admin-catalog/hooks/useAdminCatalog";
import { AdminHistoryList } from "../components/AdminHistoryList";
import { AdminScaffold } from "../components/AdminScaffold";
import { StatTile } from "../components/StatTile";
import { ADMIN_ROUTES } from "../constants";
import { openHistoryEntity } from "../helpers/navigation";
import { useAdminOverview } from "../hooks/useAdmin";

export function AdminOverviewScreen() {
  const { t } = useTranslation("settings");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const isAdmin = useIsAdmin();
  const { data, isLoading, isError, refetch } = useAdminOverview(isAdmin);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <AdminScaffold title={t("admin.title")}>
      {isLoading ? (
        <StateView variant="loading" />
      ) : isError || !data ? (
        <StateView
          variant="error"
          message={t("admin.loadFailed")}
          actionLabel={t("admin.common.retry")}
          onAction={() => refetch()}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.textMuted}
              colors={[colors.accent]}
            />
          }
        >
          <View>
            <SectionHeader title={t("admin.overview.review")} />
            <View style={[styles.tiles, dir.row]}>
              <StatTile
                value={data.submissions.pendingNewProducts}
                label={t("admin.overview.pendingNewProducts")}
                highlight
                onPress={() => router.push(`${ADMIN_ROUTES.submissions}?kind=NEW_PRODUCT`)}
              />
              <StatTile
                value={data.submissions.pendingCorrections}
                label={t("admin.overview.pendingCorrections")}
                highlight
                onPress={() => router.push(`${ADMIN_ROUTES.submissions}?kind=CORRECTION`)}
              />
            </View>
          </View>

          <View>
            <SectionHeader title={t("admin.overview.catalog")} />
            <View style={[styles.tiles, dir.row]}>
              <StatTile
                value={data.catalog.active}
                label={t("admin.overview.activeProducts")}
                onPress={() => router.push(`${ADMIN_ROUTES.catalog}?state=active`)}
              />
              <StatTile
                value={data.catalog.archived}
                label={t("admin.overview.archivedProducts")}
                onPress={() => router.push(`${ADMIN_ROUTES.catalog}?state=archived`)}
              />
            </View>
          </View>

          <View>
            <SectionHeader title={t("admin.overview.announcements")} />
            <View style={[styles.tiles, dir.row]}>
              <StatTile
                value={data.announcements.active}
                label={t("admin.announcementStates.ACTIVE")}
                highlight
                onPress={() => router.push(`${ADMIN_ROUTES.announcements}?state=ACTIVE`)}
              />
              <StatTile
                value={data.announcements.scheduled}
                label={t("admin.announcementStates.SCHEDULED")}
                onPress={() => router.push(`${ADMIN_ROUTES.announcements}?state=SCHEDULED`)}
              />
              <StatTile
                value={data.announcements.drafts}
                label={t("admin.announcementStates.DRAFT")}
                onPress={() => router.push(`${ADMIN_ROUTES.announcements}?state=DRAFT`)}
              />
            </View>
            <Button
              label={t("admin.announcements.new")}
              icon="plus"
              variant="tonal"
              onPress={() => router.push(ADMIN_ROUTES.announcement("new"))}
              style={styles.inlineAction}
            />
          </View>

          <View>
            <SectionHeader
              title={t("admin.overview.recentActivity")}
              trailing={
                <Button
                  label={t("admin.overview.viewAll")}
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push(ADMIN_ROUTES.activity)}
                />
              }
            />
            <AdminHistoryList entries={data.recentActivity} showEntity onPressEntry={openHistoryEntity} />
          </View>
        </ScrollView>
      )}
    </AdminScaffold>
  );
}

const useStyles = () =>
  useThemedStyles(() =>
    StyleSheet.create({
      content: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
      },
      tiles: { gap: spacing.sm },
      inlineAction: { marginTop: spacing.sm },
    }),
  );
