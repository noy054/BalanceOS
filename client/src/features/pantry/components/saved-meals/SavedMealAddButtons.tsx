import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { spacing } from "../../../../shared/theme";
import { Button } from "../../../../shared/components/ui/Button";

type Props = {
  isRTL: boolean;
  onAddProduct: () => void;
  onAddRecipe: () => void;
};

export function SavedMealAddButtons({
  isRTL,
  onAddProduct,
  onAddRecipe,
}: Props) {
  const { t } = useTranslation("pantry");

  return (
    <View style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
      <Button
        label={t("savedMeal.addProductItem")}
        icon="food-apple-outline"
        variant="tonal"
        onPress={onAddProduct}
        style={styles.button}
      />

      <Button
        label={t("savedMeal.addRecipeItem")}
        icon="chef-hat"
        variant="tonal"
        onPress={onAddRecipe}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingTop: spacing.ms,
  },
  button: {
    flex: 1,
  },
});
