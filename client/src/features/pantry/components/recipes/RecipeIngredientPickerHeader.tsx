import { useTranslation } from "react-i18next";

import { PickerHeader } from "../shared/PickerHeader";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  dir: DirectionStyles;
  onClose: () => void;
};

export function RecipeIngredientPickerHeader({ onClose }: Props) {
  const { t } = useTranslation("pantry");

  return <PickerHeader title={t("picker.productsTitle")} onClose={onClose} />;
}
