import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { BottomSheet } from "../../../../shared/components/ui/BottomSheet";
import { useProductCalculator } from "../../hooks/useProductCalculator";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";
import { AddToMealPanel } from "../../../meals/components/AddToMealPanel";
import { ProductCalculatorCard } from "./ProductCalculatorCard";

type Props = {
  product: PantryProduct | null;
  visible: boolean;
  onClose: () => void;
};

export function ProductCalculatorModal({ product, visible, onClose }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const models = useFoodCardModels();
  const [step, setStep] = useState<"calculate" | "meal">("calculate");

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const calculator = useProductCalculator(product);

  useEffect(() => {
    if (visible) setStep("calculate");
  }, [visible, product?.id]);

  if (!product) {
    return null;
  }

  const addingToMeal = step === "meal" && calculator.result !== null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={addingToMeal ? t("calculatorMeal.title") : product.name}
      subtitle={
        addingToMeal
          ? product.name
          : `${t("productCalculator.quickTitle")} · ${models.productBasisLabel(product)}`
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {addingToMeal && calculator.result ? (
          <AddToMealPanel
            product={product}
            result={calculator.result}
            onDone={onClose}
            onBack={() => setStep("calculate")}
          />
        ) : (
          <ProductCalculatorCard
            plain
            quantity={calculator.quantity}
            unit={calculator.unit}
            units={calculator.units}
            serving={product}
            result={calculator.result}
            isRTL={isRTL}
            t={t}
            onChangeQuantity={calculator.updateQuantity}
            onSelectUnit={calculator.selectUnit}
            onAddToMeal={() => setStep("meal")}
          />
        )}
      </ScrollView>
    </BottomSheet>
  );
}
