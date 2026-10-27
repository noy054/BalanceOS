import { useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { FoodItemCard } from "../food/FoodItemCard";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";
import { useStyles } from "./styles/ProductCard.styles";

type Props = {
  product: PantryProduct;
  onPress: (product: PantryProduct) => void;
  onMore?: (product: PantryProduct) => void;
  isHighlighted?: boolean;
};

export function ProductCard({
  product,
  onPress,
  onMore,
  isHighlighted = false,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const models = useFoodCardModels();

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const model = models.product(product);

  return (
    <>
      <FoodItemCard
        {...model}
        highlighted={isHighlighted}
        onPress={() => onPress(product)}
        onImagePress={product.imageUrl ? () => setIsImagePreviewOpen(true) : undefined}
        trailing={
          onMore ? (
            <IconButton
              icon="dots-vertical"
              size={36}
              iconSize={20}
              accessibilityLabel={t("common.moreOptionsFor", { name: product.name })}
              onPress={() => onMore(product)}
            />
          ) : null
        }
      />

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
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        >
          <Pressable style={styles.imageModalContent} onPress={() => {}}>
            <View style={[styles.imageModalHeader, dir.row]}>
              <Text style={[styles.imageModalTitle, dir.text]} numberOfLines={2}>
                {product.name}
              </Text>

              <IconButton
                icon="close"
                variant="tonal"
                size={36}
                iconSize={20}
                accessibilityLabel={t("common.close")}
                onPress={() => setIsImagePreviewOpen(false)}
              />
            </View>

            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.imageModalImage}
                resizeMode="contain"
              />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
