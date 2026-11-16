import { AppBackdrop } from "../../../shared/components/ui/AppBackdrop";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { SearchField } from "../../../shared/components/ui/SearchField";
import { spacing, useThemedStyles } from "../../../shared/theme";
import { useCatalogBrowse, useCatalogSubcategories } from "../hooks/useSuperCatalog";
import { SuperProductList } from "../components/super/SuperProductList";
import { SubcategoryChips } from "../components/super/SubcategoryChips";
import { CatalogDepartment } from "../types";

type Props = {
  department: CatalogDepartment;
};

export function SuperDepartmentScreen({ department }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const subcategories = useCatalogSubcategories(department);
  const products = useCatalogBrowse(department, search, true, subcategory);
  const name = t(`super.departments.${department}`);
  const chips = subcategories.data ?? [];

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <AppBackdrop />
      <ScreenHeader title={name} fallbackRoute="/(app)/pantry/super" />

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t("super.searchIn", { department: name })}
        tone="glass"
        style={styles.search}
      />

      {chips.length > 1 ? (
        <SubcategoryChips
          value={subcategory}
          onChange={setSubcategory}
          options={[
            { key: null, label: t("super.all") },
            ...chips.map((entry) => ({
              key: entry.key,
              label: t(`super.subcategories.${entry.key}`, { defaultValue: entry.key }),
            })),
          ]}
        />
      ) : null}

      <SuperProductList
        items={products.data ?? []}
        isLoading={products.isLoading || (products.isDebouncing && !products.data)}
        isError={products.isError}
        emptyMessage={
          search.trim() || subcategory ? t("super.noResults") : t("super.emptyDepartment")
        }
        errorMessage={t("super.loadFailed")}
        retryLabel={t("super.retry")}
        onRetry={() => void products.refetch()}
        isFetchingMore={products.isFetchingNextPage}
        onEndReached={products.loadMore}
      />
    </SafeAreaView>
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
        marginHorizontal: spacing.md,
        marginBottom: spacing.ms,
      },
    }),
  );
