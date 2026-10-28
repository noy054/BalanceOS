import { Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAppTheme } from "../../../../shared/theme";
import { Button } from "../../../../shared/components/ui/Button";
import { useImageSource } from "../../../../shared/hooks/useImageSource";
import { getDirectionStyles, useStyles } from "./styles/ImagePickerCard.styles";

type Props = {
  imageUrl: string;
  title: string;
  subtitle: string;
  selectedSubtitle: string;
  addLabel: string;
  changeLabel: string;
  removeLabel: string;
  placeholderIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  isRTL: boolean;
  onChangeImage: (uri: string) => void;
  onRemoveImage: () => void;
};

export function ImagePickerCard({
  imageUrl,
  title,
  subtitle,
  selectedSubtitle,
  addLabel,
  changeLabel,
  removeLabel,
  placeholderIcon = "image-plus-outline",
  isRTL,
  onChangeImage,
  onRemoveImage,
}: Props) {
  const { t } = useTranslation("common");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);
  const source = useImageSource({ onPick: onChangeImage });
  const handlePickImage = source.pickFromLibrary;

  return (
    <View style={[styles.card, dir.row]}>
      <Pressable
        onPress={handlePickImage}
        style={({ pressed }) => [styles.imageButton, pressed && styles.pressed]}
        accessibilityRole="imagebutton"
        accessibilityLabel={imageUrl ? changeLabel : addLabel}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name={placeholderIcon} size={26} color={colors.textMuted} />
        )}
      </Pressable>

      <View style={styles.textWrap}>
        <Text style={[styles.title, dir.text]}>{title}</Text>

        <Text style={[styles.subtitle, dir.text]}>
          {imageUrl ? selectedSubtitle : subtitle}
        </Text>

        <View style={[styles.actionsRow, dir.row]}>
          <Button
            label={t("image.takePhoto")}
            icon="camera-outline"
            variant="secondary"
            size="sm"
            onPress={source.takePhoto}
          />

          <Button
            label={imageUrl ? changeLabel : addLabel}
            icon={imageUrl ? "image-edit-outline" : "image-plus"}
            variant="secondary"
            size="sm"
            onPress={handlePickImage}
          />

          {imageUrl ? (
            <Button label={removeLabel} variant="ghost" size="sm" onPress={onRemoveImage} />
          ) : null}
        </View>
      </View>
    </View>
  );
}
