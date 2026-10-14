import { Modal, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { RecipeIngredientSelection } from "../../helpers/recipeIngredientPickerDraft";
import { useRecipeIngredientPicker } from "../../hooks/useRecipeIngredientPicker";
import { RecipeIngredientPickerHeader } from "./RecipeIngredientPickerHeader";
import { RecipeIngredientPickerSearchActions } from "./RecipeIngredientPickerSearchActions";
import { RecipeIngredientPickerProductList } from "./RecipeIngredientPickerProductList";
import { RecipeIngredientPickerSelectedPanel } from "./RecipeIngredientPickerSelectedPanel";
import { RecipeIngredientPickerFooter } from "./RecipeIngredientPickerFooter";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/RecipeIngredientPickerModal.styles";

export type { RecipeIngredientSelection };

type Props = {
  visible: boolean;
  products: PantryProduct[];
  onAdd: (items: RecipeIngredientSelection[]) => void;
  onClose: () => void;
};

export function RecipeIngredientPickerModal({
  visible,
  products,
  onAdd,
  onClose,
}: Props) {
  const { i18n } = useTranslation("pantry");
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const picker = useRecipeIngredientPicker(products);

  function handleClose() {
    picker.reset();
    onClose();
  }

  function handleAdd() {
    if (picker.selectedCount === 0) {
      return;
    }

    onAdd(picker.draftList);
    picker.reset();
    onClose();
  }

  function navigateToAddProduct() {
    handleClose();
    router.push("/(app)/pantry/add-product?returnTo=recipe");
  }

  function navigateToBarcode() {
    handleClose();
    router.push("/(app)/pantry/barcode?returnTo=recipe");
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <RecipeIngredientPickerHeader dir={dir} onClose={handleClose} />

        <RecipeIngredientPickerSearchActions
          search={picker.search}
          dir={dir}
          onChangeSearch={picker.setSearch}
          onAddProduct={navigateToAddProduct}
          onScanBarcode={navigateToBarcode}
        />

        <RecipeIngredientPickerProductList
          products={picker.filteredProducts}
          drafts={picker.drafts}
          dir={dir}
          onToggleProduct={picker.toggleProduct}
        />

        {picker.selectedCount > 0 ? (
          <RecipeIngredientPickerSelectedPanel
            drafts={picker.draftList}
            selectedCount={picker.selectedCount}
            dir={dir}
            onToggleProduct={picker.toggleProduct}
            onChangeQuantity={picker.updateQuantity}
            onToggleUnit={picker.toggleUnit}
          />
        ) : null}

        <RecipeIngredientPickerFooter
          selectedCount={picker.selectedCount}
          onAdd={handleAdd}
        />
      </View>
    </Modal>
  );
}
