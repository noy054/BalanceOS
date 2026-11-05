import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { MealType } from "../../types";
import { MealTypeBoxes } from "../form/MealTypeBoxes";

type Props = {
  name: string;
  nameError: string;
  mealTypes: MealType[];
  isRTL: boolean;
  onChangeName: (value: string) => void;
  onToggleMealType: (value: MealType) => void;
};

export function SavedMealBasicInfoCard({
  name,
  nameError,
  mealTypes,
  isRTL,
  onChangeName,
  onToggleMealType,
}: Props) {
  const { t } = useTranslation("pantry");

  return (
    <FormSection>
      <FormInput
        label={t("savedMeal.nameLabel")}
        value={name}
        onChangeText={onChangeName}
        error={nameError || undefined}
        placeholder={t("savedMeal.namePlaceholder")}
        returnKeyType="done"
      />

      <MealTypeBoxes
        label={t("savedMeal.mealTypeLabel")}
        selected={mealTypes}
        isRTL={isRTL}
        onToggle={onToggleMealType}
      />
    </FormSection>
  );
}
