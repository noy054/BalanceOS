import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { FoodItemCard } from "../food/FoodItemCard";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";

type Props = {
  product: PantryProduct;
  onPress: (product: PantryProduct) => void;
  onCalculate?: (product: PantryProduct) => void;
  onEdit?: (product: PantryProduct) => void;
  onMore?: (product: PantryProduct) => void;
  isHighlighted?: boolean;
  showBrand?: boolean;
};

export function ProductCard({
  product,
  onPress,
  onCalculate,
  onEdit,
  onMore,
  isHighlighted = false,
  showBrand = false,
}: Props) {
  const { t } = useTranslation("pantry");
  const models = useFoodCardModels();

  return (
    <FoodItemCard
      {...models.product(product, showBrand)}
      highlighted={isHighlighted}
      onPress={() => onPress(product)}
      onLongPress={onMore ? () => onMore(product) : undefined}
      actions={
        <>
          {onCalculate ? (
            <IconButton
              icon="calculator-variant-outline"
              variant="accent"
              size={40}
              iconSize={20}
              accessibilityLabel={t("productCalculator.quickFor", { name: product.name })}
              onPress={() => onCalculate(product)}
            />
          ) : null}
          {onEdit ? (
            <IconButton
              icon="pencil-outline"
              variant="tonal"
              size={40}
              iconSize={20}
              accessibilityLabel={t("common.editItem", { name: product.name })}
              onPress={() => onEdit(product)}
            />
          ) : null}
        </>
      }
    />
  );
}
