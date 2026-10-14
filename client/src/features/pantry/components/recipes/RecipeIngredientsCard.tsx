import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { RecipeIngredientDraft } from "../../helpers/recipeDraft";
import { RecipeIngredientDraftRow } from "./RecipeIngredientDraftRow";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/RecipeIngredientsCard.styles";

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
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={styles.formCard}>
      <Text style={[styles.sectionTitle, dir.text]}>
        {t("recipe.ingredientsSection")}
      </Text>

      {ingredients.map((ingredient) => (
        <RecipeIngredientDraftRow
          key={ingredient.key}
          ingredient={ingredient}
          isRTL={isRTL}
          onChangeAmount={onChangeAmount}
          onToggleUnit={onToggleUnit}
          onRemove={onRemoveIngredient}
        />
      ))}

      <Pressable
        style={({ pressed }) => [
          styles.addIngredientBtn,
          pressed && styles.addIngredientBtnPressed,
        ]}
        onPress={onAddIngredient}
      >
        <Text style={[styles.addIngredientText, dir.text]}>
          {t("recipe.addIngredient")}
        </Text>
      </Pressable>
    </View>
  );
}
