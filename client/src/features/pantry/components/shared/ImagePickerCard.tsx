import { Alert, Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAppTheme } from "../../../../shared/theme";
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
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "",
        t("errors.imagePermissionDenied", {
          defaultValue: "צריך לאשר גישה לתמונות כדי להוסיף תמונה.",
        }),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    onChangeImage(result.assets[0].uri);
  }

  return (
    <View style={styles.card}>
      <View style={[styles.row, dir.row]}>
        <Pressable
          onPress={handlePickImage}
          style={({ pressed }) => [
            styles.imageButton,
            pressed && styles.pressed,
          ]}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <MaterialCommunityIcons
              name={placeholderIcon}
              size={30}
              color={colors.primaryGreen}
            />
          )}
        </Pressable>

        <View style={styles.textWrap}>
          <Text style={[styles.title, dir.text]}>{title}</Text>

          <Text style={[styles.subtitle, dir.text]}>
            {imageUrl ? selectedSubtitle : subtitle}
          </Text>

          <View style={[styles.actionsRow, dir.row]}>
            <Pressable
              onPress={handlePickImage}
              style={({ pressed }) => [
                styles.primaryAction,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryActionText}>
                {imageUrl ? changeLabel : addLabel}
              </Text>
            </Pressable>

            {imageUrl ? (
              <Pressable
                onPress={onRemoveImage}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryActionText}>{removeLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
