import { useTranslation } from "react-i18next";

import { Button } from "../../../../shared/components/ui/Button";
import { StickyFooter } from "../../../../shared/components/ui/StickyFooter";

type Props = {
  target?: "recipe" | "savedMeal";
  selectedCount: number;
  onAdd: () => void;
};

export function RecipeIngredientPickerFooter({ target = "recipe", selectedCount, onAdd }: Props) {
  const { t } = useTranslation("pantry");

  return (
    <StickyFooter>
      <Button
        label={
          selectedCount > 0
            ? t(`${target}.addSelectedBtn`, { count: selectedCount })
            : t(`${target}.addSelectedBtnClean`)
        }
        onPress={onAdd}
        disabled={selectedCount === 0}
        fullWidth
      />
    </StickyFooter>
  );
}
