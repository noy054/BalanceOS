import { Image, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
import { Button } from "../../../../shared/components/ui/Button";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/ProductImagePicker.styles";

type Props = {
  imageUrl: string;
  hasImagePreview: boolean;
  isRTL: boolean;
  t: TFunction<"pantry">;
  onPickImage: () => void;
  onRemoveImage: () => void;
};

export function ProductImagePicker({
  imageUrl,
  hasImagePreview,
  isRTL,
  t,
  onPickImage,
  onRemoveImage,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.imageSection, dir.row]}>
      <Pressable
        onPress={onPickImage}
        style={({ pressed }) => [styles.imageBox, pressed && styles.pressed]}
        accessibilityRole="imagebutton"
        accessibilityLabel={
          hasImagePreview ? t("product.changeImage") : t("product.pickFromGallery")
        }
      >
        {hasImagePreview ? (
          <Image
            source={{ uri: imageUrl.trim() }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : (
          <MaterialCommunityIcons
            name="image-plus-outline"
            size={26}
            color={colors.textMuted}
          />
        )}
      </Pressable>

      <View style={styles.textWrap}>
        <Text style={[styles.title, dir.text]}>{t("product.imagePlaceholder")}</Text>

        <View style={[styles.imageActionsRow, dir.row]}>
          <Button
            label={
              hasImagePreview
                ? t("product.changeImage")
                : t("product.pickFromGallery")
            }
            icon={hasImagePreview ? "image-edit-outline" : "image-plus"}
            variant="secondary"
            size="sm"
            onPress={onPickImage}
          />

          {hasImagePreview ? (
            <Button
              label={t("product.removeImage")}
              variant="ghost"
              size="sm"
              onPress={onRemoveImage}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
