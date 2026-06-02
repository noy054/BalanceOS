import { Image, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import type { GestureResponderEvent } from "react-native";

import { PantryProduct } from "../types";
import { colors } from "../../../shared/theme";
import {
  styles,
  macroStyles,
  getDirectionStyles,
} from "./styles/ProductCard.styles";

type ProductWithImage = PantryProduct & {
  imageUrl?: string | null;
};

type Props = {
  product: ProductWithImage;
  onPress: (product: ProductWithImage) => void;
  onDelete?: (product: ProductWithImage) => void;
  onQuickCalculate?: (product: ProductWithImage) => void;
};

export function ProductCard({
  product,
  onPress,
  onDelete,
  onQuickCalculate,
}: Props) {
  const { t, i18n } = useTranslation("pantry");
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  function stopAndRun(
    event: GestureResponderEvent,
    action?: (product: ProductWithImage) => void,
  ) {
    event.stopPropagation();
    action?.(product);
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(product)}
    >
      <View style={[styles.topRow, dir.row]}>
        <View style={styles.imageBox}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="food-apple-outline"
                size={28}
                color={colors.primaryGreen}
              />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, dir.text]} numberOfLines={1}>
            {product.name}
          </Text>

          <Text style={[styles.brand, dir.text]} numberOfLines={1}>
            {product.brand ||
              t("product.noBrand", { defaultValue: "ללא מותג" })}
          </Text>
        </View>

        <View style={[styles.actionsRow, dir.row]}>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
            ]}
            onPress={(event) => stopAndRun(event, onQuickCalculate)}
          >
            <MaterialCommunityIcons
              name="calculator"
              size={18}
              color={colors.primaryGreen}
            />
          </Pressable>

          <Pressable
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.deleteBtn,
              pressed && styles.actionBtnPressed,
            ]}
            onPress={(event) => stopAndRun(event, onDelete)}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color={colors.danger}
            />
          </Pressable>
        </View>
      </View>

      <View style={[styles.macroGrid, dir.row]}>
        <MacroBox
          label={t("macros.calories")}
          value={`${product.caloriesPer100g}`}
          unit={t("product.calUnit")}
          highlight
          isRTL={isRTL}
        />

        <MacroBox
          label={t("macros.protein")}
          value={`${product.proteinPer100g}`}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <MacroBox
          label={t("macros.carbs")}
          value={`${product.carbsPer100g}`}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <MacroBox
          label={t("macros.fat")}
          value={`${product.fatPer100g}`}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />
      </View>
    </Pressable>
  );
}

function MacroBox({
  label,
  value,
  unit,
  highlight,
  isRTL,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  isRTL: boolean;
}) {
  return (
    <View style={macroStyles.box}>
      <Text
        style={[
          macroStyles.label,
          {
            textAlign: "center",
            writingDirection: isRTL ? "rtl" : "ltr",
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      <View
        style={[
          macroStyles.valueRow,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <Text
          style={[macroStyles.value, highlight && macroStyles.valueHighlight]}
          numberOfLines={1}
        >
          {value}
        </Text>

        <Text
          style={[
            macroStyles.unit,
            {
              writingDirection: isRTL ? "rtl" : "ltr",
            },
          ]}
          numberOfLines={1}
        >
          {unit}
        </Text>
      </View>
    </View>
  );
}
