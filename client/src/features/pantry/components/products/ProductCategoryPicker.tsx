import { Pressable, Text, View } from "react-native";
import { TFunction } from "i18next";

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
  const styles = useStyles();

  return (
    <View style={styles.card}>
      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
        {t("addProduct.categoriesLabel")}
      </Text>

      <View
        style={[
          styles.chipsRow,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        {ALL_PRODUCT_CATEGORIES.map((cat) => {
          const active = selectedCategories.includes(cat);
          return (
            <Pressable
              key={cat}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(cat)}
              hitSlop={6}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t(`categories.${cat}` as Parameters<typeof t>[0])}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
