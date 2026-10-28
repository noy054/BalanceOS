import { Image, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { useImageSource } from "../../../../shared/hooks/useImageSource";
import { Button } from "../../../../shared/components/ui/Button";
import { useStyles } from "./styles/ProductImagePicker.styles";

type Props = {
  imageUrl: string;
  title?: string;
  onChangeImage: (uri: string) => void;
  onRemoveImage: () => void;
};

const SQUARE: [number, number] = [1, 1];

export function ProductImagePicker({ imageUrl, title, onChangeImage, onRemoveImage }: Props) {
  const { t } = useTranslation("pantry");
  const { t: tCommon } = useTranslation("common");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const source = useImageSource({ onPick: onChangeImage, aspect: SQUARE });
  const hasImage = Boolean(imageUrl.trim());

  return (
    <View style={[styles.imageSection, dir.row]}>
      <Pressable
        onPress={source.pickFromLibrary}
        style={({ pressed }) => [styles.imageBox, pressed && styles.pressed]}
        accessibilityRole="imagebutton"
        accessibilityLabel={hasImage ? t("product.changeImage") : tCommon("image.chooseFromLibrary")}
      >
        {hasImage ? (
          <Image source={{ uri: imageUrl.trim() }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="image-plus-outline" size={26} color={colors.textMuted} />
        )}
      </Pressable>

      <View style={styles.textWrap}>
        <Text style={[styles.title, dir.text]}>{title ?? t("product.imagePlaceholder")}</Text>

        <View style={[styles.imageActionsRow, dir.row]}>
          <Button
            label={tCommon("image.takePhoto")}
            icon="camera-outline"
            variant="secondary"
            size="sm"
            onPress={source.takePhoto}
          />

          <Button
            label={tCommon("image.chooseFromLibrary")}
            icon="image-outline"
            variant="secondary"
            size="sm"
            onPress={source.pickFromLibrary}
          />

          {hasImage ? (
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
