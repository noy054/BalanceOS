import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { PantryProduct, PantryRecipe } from '../types';
import { colors, spacing, radius } from '../../../shared/theme';

type ProductPickerModalProps = {
  visible: boolean;
  products: PantryProduct[];
  onSelect: (product: PantryProduct) => void;
  onClose: () => void;
};

export function ProductPickerModal({
  visible,
  products,
  onSelect,
  onClose,
}: ProductPickerModalProps) {
  const { t } = useTranslation('pantry');
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand?.toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  function handleSelect(product: PantryProduct) {
    setSearch('');
    onSelect(product);
  }

  function handleClose() {
    setSearch('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('picker.productsTitle')}</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.searchRow}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('picker.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </View>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('picker.noResults')}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.brand ? <Text style={styles.itemBrand}>{item.brand}</Text> : null}
                </View>
                <Text style={styles.itemCals}>{item.caloriesPer100g} {t('product.calUnit')}/100{t('product.gramsUnit')}</Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </Modal>
  );
}

type RecipePickerModalProps = {
  visible: boolean;
  recipes: PantryRecipe[];
  onSelect: (recipe: PantryRecipe) => void;
  onClose: () => void;
};

export function RecipePickerModal({
  visible,
  recipes,
  onSelect,
  onClose,
}: RecipePickerModalProps) {
  const { t } = useTranslation('pantry');
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : recipes;

  function handleSelect(recipe: PantryRecipe) {
    setSearch('');
    onSelect(recipe);
  }

  function handleClose() {
    setSearch('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('picker.recipesTitle')}</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.searchRow}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('picker.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </View>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('picker.noResults')}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? <Text style={styles.itemBrand}>{item.description}</Text> : null}
                </View>
                <Text style={styles.itemCals}>{item.totals.calories} {t('product.calUnit')}</Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  searchIcon: { marginEnd: spacing.xs },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  list: { paddingHorizontal: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  itemPressed: { opacity: 0.7 },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemBrand: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemCals: {
    fontSize: 12,
    color: colors.textMuted,
    marginStart: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
