import { Image, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
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
    <View style={styles.imageSection}>
      {hasImagePreview ? (
        <Image
          source={{ uri: imageUrl.trim() }}
          style={styles.imagePreview}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons
            name="image-plus-outline"
            size={28}
            color={colors.primaryGreen}
          />

          <Text style={styles.imagePlaceholderText}>
            {t("product.imagePlaceholder")}
          </Text>
        </View>
      )}

      <View style={[styles.imageActionsRow, dir.row]}>
        <Pressable
          style={({ pressed }) => [
            styles.imageActionBtn,
            pressed && styles.imageActionBtnPressed,
          ]}
          onPress={onPickImage}
        >
          <MaterialCommunityIcons
            name={hasImagePreview ? "image-edit-outline" : "image-plus"}
            size={18}
            color={colors.primaryGreen}
          />

          <Text style={styles.imageActionText}>
            {hasImagePreview
              ? t("product.changeImage", { defaultValue: "החלפת תמונה" })
              : t("product.pickFromGallery", {
                  defaultValue: "בחירה מהגלריה",
                })}
          </Text>
        </Pressable>

        {hasImagePreview ? (
          <Pressable
            style={({ pressed }) => [
              styles.imageRemoveBtn,
              pressed && styles.imageActionBtnPressed,
            ]}
            onPress={onRemoveImage}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color={colors.danger}
            />

            <Text style={styles.imageRemoveText}>
              {t("product.removeImage", { defaultValue: "הסרת תמונה" })}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
