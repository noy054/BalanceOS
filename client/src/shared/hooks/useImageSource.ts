import { useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";

type Options = {
  onPick: (uri: string) => void;
  aspect?: [number, number];
};

type PermissionResult = { granted: boolean; canAskAgain: boolean };

export function useImageSource({ onPick, aspect }: Options) {
  const { t } = useTranslation("common");

  const explainDenied = useCallback(
    (permission: PermissionResult, messageKey: "image.cameraDenied" | "image.libraryDenied") => {
      if (permission.canAskAgain) {
        Alert.alert(t("image.permissionTitle"), t(messageKey));
        return;
      }
      Alert.alert(t("image.permissionTitle"), t(messageKey), [
        { text: t("image.cancel"), style: "cancel" },
        { text: t("image.openSettings"), onPress: () => void Linking.openSettings() },
      ]);
    },
    [t],
  );

  const handleResult = useCallback(
    (result: ImagePicker.ImagePickerResult) => {
      const uri = result.canceled ? null : result.assets?.[0]?.uri;
      if (uri) onPick(uri);
    },
    [onPick],
  );

  const pickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      explainDenied(permission, "image.libraryDenied");
      return;
    }
    try {
      handleResult(
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect,
          quality: 0.85,
        }),
      );
    } catch {
      Alert.alert("", t("image.failed"));
    }
  }, [aspect, explainDenied, handleResult, t]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      explainDenied(permission, "image.cameraDenied");
      return;
    }
    try {
      handleResult(
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect,
          quality: 0.85,
        }),
      );
    } catch {
      Alert.alert("", t("image.cameraUnavailable"));
    }
  }, [aspect, explainDenied, handleResult, t]);

  return { pickFromLibrary, takePhoto };
}
