import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { SavedMealDraftItem } from "../helpers/savedMealDraft";
import { SavedMealAddButtons } from "./SavedMealAddButtons";
import { SavedMealDraftItemRow } from "./SavedMealDraftItemRow";
import { styles } from "./styles/SavedMealForm.styles";

type Props = {
  items: SavedMealDraftItem[];
  isRTL: boolean;
  onChangeAmount: (key: string, value: string) => void;
  onRemoveItem: (key: string) => void;
  onAddProduct: () => void;
  onAddRecipe: () => void;
};

export function SavedMealItemsCard({
  items,
  isRTL,
  onChangeAmount,
  onRemoveItem,
  onAddProduct,
  onAddRecipe,
}: Props) {
  const { t } = useTranslation("pantry");

  const textDirection = {
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
  };

  return (
    <View style={styles.formCard}>
      <Text style={[styles.sectionTitle, textDirection]}>
        {t("savedMeal.itemsSection")}
      </Text>

      {items.map((item) => (
        <SavedMealDraftItemRow
          key={item.key}
          item={item}
          isRTL={isRTL}
          onChangeAmount={onChangeAmount}
          onRemove={onRemoveItem}
        />
      ))}

      <SavedMealAddButtons
        isRTL={isRTL}
        onAddProduct={onAddProduct}
        onAddRecipe={onAddRecipe}
      />
    </View>
  );
}
