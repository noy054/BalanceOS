import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { PantryProduct, PantryRecipe } from '../types';
import { colors, spacing } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/ProductPickerModal.styles';

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
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

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
        <View style={[styles.header, dir.row]}>
          <Text style={styles.title}>{t('picker.productsTitle')}</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={[styles.searchRow, dir.row]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, dir.input]}
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
                style={({ pressed }) => [styles.item, dir.row, pressed && styles.itemPressed]}
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
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

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
        <View style={[styles.header, dir.row]}>
          <Text style={styles.title}>{t('picker.recipesTitle')}</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={[styles.searchRow, dir.row]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, dir.input]}
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
                style={({ pressed }) => [styles.item, dir.row, pressed && styles.itemPressed]}
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
