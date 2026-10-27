import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { SearchField } from "../../../../shared/components/ui/SearchField";
import { Button } from "../../../../shared/components/ui/Button";
import { useStyles } from "./styles/RecipeIngredientPickerSearchActions.styles";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  search: string;
  dir: DirectionStyles;
  onChangeSearch: (value: string) => void;
  onAddProduct: () => void;
  onScanBarcode: () => void;
};

export function RecipeIngredientPickerSearchActions({
  search,
  dir,
  onChangeSearch,
  onAddProduct,
  onScanBarcode,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();

  return (
    <View style={styles.wrapper}>
      <SearchField
        value={search}
        onChangeText={onChangeSearch}
        placeholder={t("search.placeholder")}
      />

      <View style={[styles.quickActionsRow, dir.row]}>
        <Button
          label={t("recipe.createManualBtn")}
          icon="plus"
          variant="secondary"
          size="sm"
          onPress={onAddProduct}
          style={styles.quickAction}
        />

        <Button
          label={t("recipe.scanBarcodeBtn")}
          icon="barcode-scan"
          variant="secondary"
          size="sm"
          onPress={onScanBarcode}
          style={styles.quickAction}
        />
      </View>
    </View>
  );
}
