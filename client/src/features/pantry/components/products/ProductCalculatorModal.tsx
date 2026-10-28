import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { BottomSheet } from "../../../../shared/components/ui/BottomSheet";
import { useProductCalculator } from "../../hooks/useProductCalculator";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";
import { ProductCalculatorCard } from "./ProductCalculatorCard";

type Props = {
  product: PantryProduct | null;
  visible: boolean;
  onClose: () => void;
};

export function ProductCalculatorModal({ product, visible, onClose }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const models = useFoodCardModels();

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const { quantity, unit, calcResult, gramsResult, updateQuantity, selectUnit, calculate } =
    useProductCalculator(product);

  if (!product) {
    return null;
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={product.name}
      subtitle={`${t("productCalculator.quickTitle")} · ${models.productBasisLabel(product)}`}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProductCalculatorCard
          plain
          quantity={quantity}
          unit={unit}
          serving={product}
          calcResult={calcResult}
          isRTL={isRTL}
          t={t}
          gramsResult={gramsResult}
          onChangeQuantity={updateQuantity}
          onSelectUnit={selectUnit}
          onCalculate={calculate}
        />
      </ScrollView>
    </BottomSheet>
  );
}
