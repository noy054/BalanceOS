import { FlatList, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { PickerDraft } from "../../helpers/recipeIngredientPickerDraft";
import { RecipeIngredientPickerProductRow } from "./RecipeIngredientPickerProductRow";
import { useStyles } from "./styles/RecipeIngredientPickerProductList.styles";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  products: PantryProduct[];
  drafts: Map<string, PickerDraft>;
  dir: DirectionStyles;
  onToggleProduct: (product: PantryProduct) => void;
};

export function RecipeIngredientPickerProductList({
  products,
  drafts,
  dir,
  onToggleProduct,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();

  if (products.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, dir.text]}>
          {t("picker.noResults")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <RecipeIngredientPickerProductRow
          product={item}
          isSelected={drafts.has(item.id)}
          dir={dir}
          onPress={() => onToggleProduct(item)}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}
