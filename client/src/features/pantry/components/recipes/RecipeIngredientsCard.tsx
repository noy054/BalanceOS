import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormSection } from "../../../../shared/components/ui/FormSection";
import { Button } from "../../../../shared/components/ui/Button";
import { RecipeIngredientDraft } from "../../helpers/recipeDraft";
import { RecipeIngredientDraftRow } from "./RecipeIngredientDraftRow";
import { isAmbiguousName, useDuplicateNames } from "../../helpers/duplicateNames";
import { useStyles } from "./styles/RecipeIngredientsCard.styles";

type Props = {
  ingredients: RecipeIngredientDraft[];
  isRTL: boolean;
  onChangeAmount: (key: string, value: string) => void;
  onToggleUnit: (key: string) => void;
  onRemoveIngredient: (key: string) => void;
  onAddIngredient: () => void;
};

export function RecipeIngredientsCard({
  ingredients,
  isRTL,
  onChangeAmount,
  onToggleUnit,
  onRemoveIngredient,
  onAddIngredient,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const duplicateNames = useDuplicateNames(
    ingredients.map((ingredient) => ingredient.product.name),
  );

  return (
    <FormSection title={t("recipe.ingredientsSection")} contentStyle={styles.card}>
      {ingredients.map((ingredient) => (
        <RecipeIngredientDraftRow
          key={ingredient.key}
          ingredient={ingredient}
          isRTL={isRTL}
          showBrand={isAmbiguousName(duplicateNames, ingredient.product.name)}
          onChangeAmount={onChangeAmount}
          onToggleUnit={onToggleUnit}
          onRemove={onRemoveIngredient}
        />
      ))}

      <View style={styles.addRow}>
        <Button
          label={t("recipe.addIngredient")}
          icon="plus"
          variant="tonal"
          onPress={onAddIngredient}
          fullWidth
        />
      </View>
    </FormSection>
  );
}
