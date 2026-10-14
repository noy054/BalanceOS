import { useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { PantryProduct, PantryRecipe, ProductCategory } from "../../types";
import { sortByMealCategory } from "../../helpers/sortByMealCategory";
import { useAppTheme, spacing } from "../../../../shared/theme";
import {
  useStyles,
  getDirectionStyles,
} from "./styles/ProductPickerModal.styles";

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
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const [search, setSearch] = useState("");

  const filtered = sortByMealCategory(products, mealCategory);

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
      <View style={styles.container}>
        <View style={[styles.header, dir.row]}>
          <Text style={styles.title}>{t("picker.productsTitle")}</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>
        <View style={[styles.searchRow, dir.row]}>
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, dir.input]}
            value={search}
            onChangeText={handleSearchChange}
            placeholder={t("picker.searchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </View>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t("picker.noResults")}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => {
              const isAdded = selectedIds.includes(item.id);
              const hasServing =
                item.servingSizeG != null && item.servingSizeG > 0;
              const dispCal = hasServing
                ? Math.round((item.caloriesPer100g * item.servingSizeG!) / 100)
                : item.caloriesPer100g;
              const basisLabel = hasServing
                ? `${t("addProduct.perServing")} · ${item.servingSizeG}${t("product.gramsUnit")}`
                : `100${t("product.gramsUnit")}`;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.item,
                    dir.row,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.brand ? (
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.itemCals}>
                    {dispCal} {t("product.calUnit")} / {basisLabel}
                  </Text>
                  {isAdded ? (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={colors.primaryGreen}
                      style={{ marginStart: spacing.xs }}
                    />
                  ) : null}
                </Pressable>
              );
            }}
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
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

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
      <View style={styles.container}>
        <View style={[styles.header, dir.row]}>
          <Text style={styles.title}>{t("picker.recipesTitle")}</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>
        <View style={[styles.searchRow, dir.row]}>
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, dir.input]}
            value={search}
            onChangeText={setSearch}
            placeholder={t("picker.searchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </View>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t("picker.noResults")}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.item,
                  dir.row,
                  pressed && styles.itemPressed,
                ]}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.itemBrand}>{item.description}</Text>
                  ) : null}
                </View>
                <Text style={styles.itemCals}>
                  {item.totals.calories} {t("product.calUnit")}
                </Text>
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
