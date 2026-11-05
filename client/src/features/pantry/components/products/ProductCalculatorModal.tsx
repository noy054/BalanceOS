import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { spacing } from "../../../../shared/theme";
import { BottomSheet } from "../../../../shared/components/ui/BottomSheet";
import { useProductCalculator } from "../../hooks/useProductCalculator";
import { FOOD_ICONS, useFoodCardModels } from "../../hooks/useFoodCardModels";
import { AddToMealPanel } from "../../../meals/components/AddToMealPanel";
import { DetailHero } from "../food/DetailHero";
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

  const calculator = useProductCalculator(product);
  const [rulerActive, setRulerActive] = useState(false);

  if (!product) {
    return null;
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("productCalculator.quickTitle")}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!rulerActive}
        contentContainerStyle={styles.content}
      >
        <DetailHero
          compact
          title={product.name}
          meta={[product.brand, models.productBasisLabel(product)].filter(Boolean).join(" · ")}
          imageUrl={product.imageUrl}
          fallbackIcon={FOOD_ICONS.product}
        />
        <ProductCalculatorCard
          quantity={calculator.quantity}
          unit={calculator.unit}
          units={calculator.units}
          serving={product}
          result={calculator.result}
          isRTL={isRTL}
          t={t}
          onChangeQuantity={calculator.updateQuantity}
          onSelectUnit={calculator.selectUnit}
          onRulerActiveChange={setRulerActive}
        >
          {calculator.units.length > 0 ? (
            <AddToMealPanel product={product} result={calculator.result} onDone={onClose} />
          ) : null}
        </ProductCalculatorCard>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
});
