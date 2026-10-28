import { FlatList } from "react-native";
import { useTranslation } from "react-i18next";

import { StateView } from "../../../../shared/components/ui/StateView";
import { PantryProduct } from "../../types";
import { PickerDraft } from "../../helpers/recipeIngredientPickerDraft";
import { RecipeIngredientPickerProductRow } from "./RecipeIngredientPickerProductRow";
import { useStyles } from "./styles/RecipeIngredientPickerProductList.styles";
import { ListGap } from "../../../../shared/components/ui/ListGap";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  products: PantryProduct[];
  drafts: Map<string, PickerDraft>;
  dir: DirectionStyles;
  onToggleProduct: (product: PantryProduct) => void;
  onEndReached?: () => void;
};

export function RecipeIngredientPickerProductList({
  products,
  drafts,
  dir,
  onToggleProduct,
  onEndReached,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();

  if (products.length === 0) {
    return <StateView variant="empty" icon="magnify" title={t("picker.noResults")} />;
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      renderItem={({ item }) => (
        <RecipeIngredientPickerProductRow
          product={item}
          isSelected={drafts.has(item.id)}
          dir={dir}
          onPress={() => onToggleProduct(item)}
        />
      )}
      ItemSeparatorComponent={ListGap}
    />
  );
}
