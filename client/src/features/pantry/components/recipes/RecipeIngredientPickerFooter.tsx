import { useTranslation } from "react-i18next";

import { Button } from "../../../../shared/components/ui/Button";
import { StickyFooter } from "../../../../shared/components/ui/StickyFooter";

type Props = {
  selectedCount: number;
  onAdd: () => void;
};

export function RecipeIngredientPickerFooter({ selectedCount, onAdd }: Props) {
  const { t } = useTranslation("pantry");

  return (
    <StickyFooter>
      <Button
        label={
          selectedCount > 0
            ? t("recipe.addSelectedBtn", { count: selectedCount })
            : t("recipe.addSelectedBtnClean")
        }
        onPress={onAdd}
        disabled={selectedCount === 0}
        fullWidth
      />
    </StickyFooter>
  );
}
