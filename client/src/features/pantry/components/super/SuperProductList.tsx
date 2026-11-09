import { useCallback } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { CatalogBrowseItem } from "../../types";
import { useSuperPantry } from "../../hooks/useSuperCatalog";
import { ListGap } from "../../../../shared/components/ui/ListGap";
import { StateView } from "../../../../shared/components/ui/StateView";
import { spacing, useAppTheme } from "../../../../shared/theme";
import { SuperProductCard } from "./SuperProductCard";

type Props = {
  items: CatalogBrowseItem[];
  isLoading: boolean;
  isError: boolean;
  isFetchingMore?: boolean;
  emptyMessage: string;
  errorMessage: string;
  retryLabel: string;
  onRetry: () => void;
  onEndReached: () => void;
};

export function SuperProductList({
  items,
  isLoading,
  isError,
  isFetchingMore = false,
  emptyMessage,
  errorMessage,
  retryLabel,
  onRetry,
  onEndReached,
}: Props) {
  const { add, remove, pendingIds } = useSuperPantry();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const openItem = useCallback(
    (entry: CatalogBrowseItem) => router.push(`/(app)/pantry/super/product/${encodeURIComponent(entry.id)}`),
    [],
  );
  const renderItem = useCallback<ListRenderItem<CatalogBrowseItem>>(
    ({ item }) => (
      <SuperProductCard
        item={item}
        isAdding={pendingIds.has(item.id)}
        onPress={openItem}
        onAdd={add}
        onRemove={remove}
      />
    ),
    [pendingIds, openItem, add, remove],
  );

  if (isLoading) return <StateView variant="loading" />;
  if (isError) {
    return (
      <StateView variant="error" message={errorMessage} actionLabel={retryLabel} onAction={onRetry} />
    );
  }
  if (items.length === 0) return <StateView variant="empty" icon="basket-outline" title={emptyMessage} />;

  return (
    <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={pendingIds}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={40}
        windowSize={9}
        removeClippedSubviews={Platform.OS === "android"}
        ListFooterComponent={
          isFetchingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.textMuted} />
            </View>
          ) : undefined
        }
        ItemSeparatorComponent={ListGap}
        style={styles.list}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={1.5}
      />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
