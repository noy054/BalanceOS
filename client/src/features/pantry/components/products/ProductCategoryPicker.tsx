import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { ALL_PRODUCT_CATEGORIES, ProductCategory } from "../../types";
import { useStyles } from "./styles/ProductCategoryPicker.styles";

type Props = {
  t: TFunction<"pantry">;
  isRTL: boolean;
  selectedCategories: ProductCategory[];
  onToggle: (category: ProductCategory) => void;
};

export function ProductCategoryPicker({
  t,
  isRTL,
  selectedCategories,
  onToggle,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();

  return (
    <FormSection
      title={t("addProduct.categoriesLabel")}
      hint={t("addProduct.categoriesHint")}
      contentStyle={styles.card}
    >
      <View
        style={[
          styles.chipsRow,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        {ALL_PRODUCT_CATEGORIES.map((cat) => {
          const active = selectedCategories.includes(cat);
          const label = t(`categories.${cat}` as Parameters<typeof t>[0]);

          return (
            <Pressable
              key={cat}
              style={({ pressed }) => [
                styles.chip,
                { flexDirection: isRTL ? "row-reverse" : "row" },
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => onToggle(cat)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={label}
            >
              {active ? (
                <MaterialCommunityIcons name="check" size={16} color={colors.accent} />
              ) : null}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FormSection>
  );
}
