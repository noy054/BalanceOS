import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

type Args = {
  onPick: (uri: string) => void;
  permissionDeniedMessage: string;
};

export function useProductImagePicker({
  onPick,
  permissionDeniedMessage,
}: Args) {
  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("", permissionDeniedMessage);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    onPick(result.assets[0].uri);
  }

  return {
    pickImage,
  };
}
