import { TFunction } from "i18next";

import { FormSection } from "../../../../shared/components/ui/FormSection";
import { ALL_PRODUCT_CATEGORIES, ProductCategory } from "../../types";
import { ChoiceBoxes } from "../form/ChoiceBoxes";

type Props = {
  t: TFunction<"pantry">;
  isRTL: boolean;
  selectedCategories: ProductCategory[];
  onToggle: (category: ProductCategory) => void;
};

export function ProductCategoryPicker({ t, selectedCategories, onToggle }: Props) {
  return (
    <FormSection title={t("addProduct.categoriesLabel")} hint={t("addProduct.categoriesHint")}>
      <ChoiceBoxes
        options={ALL_PRODUCT_CATEGORIES.map((category) => ({
          value: category,
          label: t(`categories.${category}` as Parameters<typeof t>[0]),
        }))}
        selected={selectedCategories}
        onToggle={onToggle}
      />
    </FormSection>
  );
}
