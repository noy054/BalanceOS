import { useState } from "react";
import { FlatList, Modal, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { PantryProduct, PantryRecipe, ProductCategory } from "../../types";
import { sortByMealCategory } from "../../helpers/sortByMealCategory";
import { useAppTheme } from "../../../../shared/theme";
import { SearchField } from "../../../../shared/components/ui/SearchField";
import { StateView } from "../../../../shared/components/ui/StateView";
import { FoodItemCard } from "../food/FoodItemCard";
import { PickerHeader } from "../shared/PickerHeader";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";
import { useStyles } from "./styles/ProductPickerModal.styles";
import { ListGap } from "../../../../shared/components/ui/ListGap";
import { useKeyboardInset } from "../../../../shared/hooks/useKeyboardInset";
import { isAmbiguousName, useDuplicateNames } from "../../helpers/duplicateNames";

type ProductPickerModalProps = {
  visible: boolean;
  products: PantryProduct[];
  selectedIds?: string[];
  mealCategory?: ProductCategory | null;
  onSelect: (product: PantryProduct) => void;
  onClose: () => void;
  onEndReached?: () => void;
  onSearchChange?: (text: string) => void;
};

function AddIndicator({ added }: { added: boolean }) {
  const { colors } = useAppTheme();

  return (
    <MaterialCommunityIcons
      name={added ? "check-circle" : "plus-circle-outline"}
      size={24}
      color={added ? colors.accent : colors.textMuted}
    />
  );
}

export function ProductPickerModal({
  visible,
  products,
  selectedIds = [],
  mealCategory = null,
  onSelect,
  onClose,
  onEndReached,
  onSearchChange,
}: ProductPickerModalProps) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const models = useFoodCardModels();
  const keyboardInset = useKeyboardInset();

  const [search, setSearch] = useState("");

  const filtered = sortByMealCategory(products, mealCategory);
  const duplicateNames = useDuplicateNames(filtered.map((product) => product.name));

  function handleSearchChange(text: string) {
    setSearch(text);
    onSearchChange?.(text);
  }

  function handleSelect(product: PantryProduct) {
    setSearch("");
    onSearchChange?.("");
    onSelect(product);
  }

  function handleClose() {
    setSearch("");
    onSearchChange?.("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingBottom: keyboardInset }]}>
        <PickerHeader title={t("picker.productsTitle")} onClose={handleClose} />

        <View style={styles.searchWrap}>
          <SearchField
            value={search}
            onChangeText={handleSearchChange}
            placeholder={t("search.placeholder")}
            autoFocus
          />
        </View>

        {filtered.length === 0 ? (
          <StateView variant="empty" icon="magnify" title={t("picker.noResults")} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => {
              const isAdded = selectedIds.includes(item.id);

              return (
                <FoodItemCard
                  {...models.product(item, isAmbiguousName(duplicateNames, item.name))}
                  selected={isAdded}
                  onPress={() => handleSelect(item)}
                  trailing={<AddIndicator added={isAdded} />}
                />
              );
            }}
            ItemSeparatorComponent={ListGap}
            contentContainerStyle={[
              styles.list,
              {
                paddingBottom:
                  (keyboardInset > 0 ? 0 : insets.bottom) + styles.list.paddingBottom,
              },
            ]}
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
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const models = useFoodCardModels();
  const keyboardInset = useKeyboardInset();

  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : recipes;

  function handleSelect(recipe: PantryRecipe) {
    setSearch("");
    onSelect(recipe);
  }

  function handleClose() {
    setSearch("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingBottom: keyboardInset }]}>
        <PickerHeader title={t("picker.recipesTitle")} onClose={handleClose} />

        <View style={styles.searchWrap}>
          <SearchField
            value={search}
            onChangeText={setSearch}
            placeholder={t("search.placeholderRecipes")}
            autoFocus
          />
        </View>

        {filtered.length === 0 ? (
          <StateView variant="empty" icon="magnify" title={t("picker.noResults")} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <FoodItemCard
                {...models.recipe(item)}
                onPress={() => handleSelect(item)}
                trailing={<AddIndicator added={false} />}
              />
            )}
            ItemSeparatorComponent={ListGap}
            contentContainerStyle={[
              styles.list,
              {
                paddingBottom:
                  (keyboardInset > 0 ? 0 : insets.bottom) + styles.list.paddingBottom,
              },
            ]}
          />
        )}
      </View>
    </Modal>
  );
}
