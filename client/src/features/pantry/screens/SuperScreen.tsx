import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { SearchField } from "../../../shared/components/ui/SearchField";
import { StateView } from "../../../shared/components/ui/StateView";
import { spacing, typography, useThemedStyles } from "../../../shared/theme";
import { useDirection } from "../../../shared/hooks/useDirection";
import { prefetchCatalogDepartment, useCatalogBrowse, useCatalogDepartments } from "../hooks/useSuperCatalog";
import { SUPER_BANNER_DEPARTMENT } from "../helpers/superDepartments";
import { SuperProductList } from "../components/super/SuperProductList";
import { SuperBanner } from "../components/super/SuperBanner";
import { DepartmentTile } from "../components/super/DepartmentTile";
import { SUPER_HERO_OVERLAP, SuperHero } from "../components/super/SuperHero";
import { CatalogDepartment } from "../types";
import { track } from "../../analytics/analytics";

const GRID_GAP = spacing.ms;

export function SuperScreen() {
  useEffect(() => {
    track("super_opened");
  }, []);
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const isSearching = search.trim().length >= 2;

  const departments = useCatalogDepartments();
  const results = useCatalogBrowse(null, search, isSearching);
  const entries = departments.data ?? [];
  const hasBanner = entries.some((entry) => entry.department === SUPER_BANNER_DEPARTMENT);
  const tileWidth = Math.floor((width - spacing.md * 2 - GRID_GAP) / 2);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(app)/pantry");
  }

  function openDepartment(department: CatalogDepartment) {
    void prefetchCatalogDepartment(queryClient, department);
    router.push(`/(app)/pantry/super/${department}`);
  }

  return (
    <View style={styles.root}>
      <SuperHero
        title={t("super.title")}
        subtitle={t("super.heroSubtitle")}
        backLabel={t("productDetail.back")}
        topInset={insets.top}
        onBack={goBack}
      />

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t("super.searchPlaceholder")}
        tone="glass"
        style={styles.search}
      />

      {isSearching ? (
        <SuperProductList
          items={results.data ?? []}
          isLoading={results.isLoading || (results.isDebouncing && !results.data)}
          isError={results.isError}
          emptyMessage={t("super.noResults")}
          errorMessage={t("super.loadFailed")}
          retryLabel={t("super.retry")}
          onRetry={() => void results.refetch()}
          isFetchingMore={results.isFetchingNextPage}
          onEndReached={results.loadMore}
        />
      ) : departments.isLoading ? (
        <StateView variant="loading" />
      ) : departments.isError ? (
        <StateView
          variant="error"
          message={t("super.loadFailed")}
          actionLabel={t("super.retry")}
          onAction={() => void departments.refetch()}
        />
      ) : entries.length === 0 ? (
        <StateView variant="empty" icon="storefront-outline" title={t("super.empty")} />
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {hasBanner ? (
            <SuperBanner
              departmentName={t(`super.departments.${SUPER_BANNER_DEPARTMENT}`)}
              onPress={() => openDepartment(SUPER_BANNER_DEPARTMENT)}
            />
          ) : null}

          <Text style={[styles.sectionTitle, dir.text]} accessibilityRole="header">
            {t("super.categoriesTitle")}
          </Text>

          <View style={[styles.grid, dir.row]}>
            {entries.map((entry) => {
              const name = t(`super.departments.${entry.department}`);
              return (
                <DepartmentTile
                  key={entry.department}
                  department={entry.department}
                  name={name}
                  width={tileWidth}
                  accessibilityLabel={`${name}, ${t("super.productsCount", { count: entry.count })}`}
                  onPress={() => openDepartment(entry.department)}
                />
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.canvas,
      },
      search: {
        marginTop: -SUPER_HERO_OVERLAP,
        marginHorizontal: spacing.md,
        marginBottom: spacing.ms,
      },
      sectionTitle: {
        ...typography.title,
        color: colors.textPrimary,
      },
      scroll: {
        flex: 1,
      },
      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        gap: spacing.md,
      },
      grid: {
        flexWrap: "wrap",
        gap: GRID_GAP,
      },
    }),
  );
