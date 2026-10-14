import { useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import type { GestureResponderEvent } from "react-native";

import { PantryProduct } from "../../types";
import { useAppTheme } from "../../../../shared/theme";
import { CategoryChips } from "../../../../shared/components/CategoryChips";
import {
  useStyles,
  useMacroStyles,
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
  isHighlighted?: boolean;
};

export function ProductCard({
  product,
  onPress,
  onDelete,
  onQuickCalculate,
  isHighlighted = false,
}: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  function stopAndRun(
    event: GestureResponderEvent,
    action?: (product: ProductWithImage) => void,
  ) {
    event.stopPropagation();
    action?.(product);
  }

  function openImagePreview(event: GestureResponderEvent) {
    event.stopPropagation();

    if (!product.imageUrl) {
      return;
    }

    setIsImagePreviewOpen(true);
  }

  const hasServing = product.servingSizeG != null && product.servingSizeG > 0;
  const mul = hasServing ? product.servingSizeG! / 100 : 1;
  const r1 = (n: number) => Math.round(n * mul * 10) / 10;

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isHighlighted && styles.cardHighlighted,
          pressed && styles.cardPressed,
        ]}
        onPress={() => onPress(product)}
      >
        <View style={[styles.topRow, dir.row]}>
          <Pressable
            style={({ pressed }) => [
              styles.imageBox,
              product.imageUrl && pressed && styles.imageBoxPressed,
            ]}
            onPress={openImagePreview}
            disabled={!product.imageUrl}
          >
            {product.imageUrl ? (
              <>
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                <View style={styles.imageZoomBadge}>
                  <MaterialCommunityIcons
                    name="magnify-plus-outline"
                    size={13}
                    color={colors.textPrimary}
                  />
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons
                  name="food-apple-outline"
                  size={28}
                  color={colors.primaryGreen}
                />
              </View>
            )}
          </Pressable>

          <View style={styles.info}>
            <Text style={[styles.name, dir.text]} numberOfLines={1}>
              {product.name}
            </Text>

            <Text style={[styles.brand, dir.text]} numberOfLines={1}>
              {product.brand ||
                t("product.noBrand", { defaultValue: "ללא מותג" })}
            </Text>

            <Text style={[styles.basisBadge, dir.text]}>
              {hasServing
                ? `${t("addProduct.perServing")} · ${product.servingSizeG}g`
                : t("product.per100g")}
            </Text>
          </View>

          <View style={[styles.actionsRow, dir.row]}>
            {onQuickCalculate ? (
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
            ) : null}

            {onDelete ? (
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
            ) : null}
          </View>
        </View>

        <CategoryChips
          categories={product.mealCategories}
          isRTL={isRTL}
          style={{ marginBottom: 8 }}
        />

        <View style={[styles.macroGrid, dir.row]}>
          <MacroBox
            label={t("macros.calories")}
            value={`${r1(product.caloriesPer100g)}`}
            unit={t("product.calUnit")}
            highlight
            isRTL={isRTL}
          />

          <MacroBox
            label={t("macros.protein")}
            value={`${r1(product.proteinPer100g)}`}
            unit={t("product.gramsUnit")}
            isRTL={isRTL}
          />

          <MacroBox
            label={t("macros.carbs")}
            value={`${r1(product.carbsPer100g)}`}
            unit={t("product.gramsUnit")}
            isRTL={isRTL}
          />

          <MacroBox
            label={t("macros.fat")}
            value={`${r1(product.fatPer100g)}`}
            unit={t("product.gramsUnit")}
            isRTL={isRTL}
          />
        </View>
      </Pressable>

      <Modal
        visible={isImagePreviewOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsImagePreviewOpen(false)}
      >
        <Pressable
          style={styles.imageModalOverlay}
          onPress={() => setIsImagePreviewOpen(false)}
        >
          <Pressable style={styles.imageModalContent} onPress={() => {}}>
            <Pressable
              hitSlop={10}
              style={({ pressed }) => [
                styles.imageModalCloseButton,
                pressed && styles.imageModalCloseButtonPressed,
              ]}
              onPress={() => setIsImagePreviewOpen(false)}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>

            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.imageModalImage}
                resizeMode="contain"
              />
            ) : null}

            <Text style={[styles.imageModalTitle, dir.text]} numberOfLines={2}>
              {product.name}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  const macroStyles = useMacroStyles();

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
