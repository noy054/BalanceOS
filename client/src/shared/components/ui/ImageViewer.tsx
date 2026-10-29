import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { IconButton } from "./IconButton";
import { cameraColors, spacing } from "../../theme";

type Props = {
  imageUrl: string | null;
  accessibilityLabel?: string;
  onClose: () => void;
};

export function ImageViewer({ imageUrl, accessibilityLabel, onClose }: Props) {
  const { t } = useTranslation("common");
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={imageUrl !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("actions.close")}
        />
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={accessibilityLabel}
          />
        ) : null}
        <View style={[styles.close, { top: insets.top + spacing.sm }]}>
          <IconButton
            icon="close"
            iconSize={26}
            color={cameraColors.foreground}
            accessibilityLabel={t("actions.close")}
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: cameraColors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  image: {
    width: "100%",
    height: "80%",
  },
  close: {
    position: "absolute",
    right: spacing.md,
  },
});
