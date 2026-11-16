import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { MealType } from "../../types";
import { MealTypeBoxes } from "../form/MealTypeBoxes";

type Props = {
  name: string;
  description: string;
  mealTypes: MealType[];
  nameError: string;
  isRTL: boolean;
  onChangeName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onToggleMealType: (value: MealType) => void;
};

export function RecipeBasicInfoCard({
  name,
  description,
  mealTypes,
  nameError,
  isRTL,
  onChangeName,
  onChangeDescription,
  onToggleMealType,
}: Props) {
  const { t } = useTranslation("pantry");

  return (
    <FormSection>
      <FormInput
        label={t("recipe.nameLabel")}
        value={name}
        onChangeText={onChangeName}
        error={nameError || undefined}
      />

      <FormInput
        label={t("recipe.descriptionLabel")}
        value={description}
        onChangeText={onChangeDescription}
        multiline
      />

      <MealTypeBoxes
        label={t("recipe.categoryLabel")}
        selected={mealTypes}
        isRTL={isRTL}
        onToggle={onToggleMealType}
      />
    </FormSection>
  );
}
