import { Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../shared/components/ui/IconButton";
import { spacing } from "../../../shared/theme";
import { PrivatePhoto } from "./PrivatePhoto";

type Props = {
  photo: { photoId?: string; localUri?: string } | null;
  onClose: () => void;
};

export function PhotoViewer({ photo, onClose }: Props) {
  const { t } = useTranslation("progress");
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={photo !== null} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        {photo ? (
          <PrivatePhoto photoId={photo.photoId} localUri={photo.localUri} style={styles.image} resizeMode="contain" />
        ) : null}
        <View style={[styles.close, { top: insets.top + spacing.sm }]}>
          <IconButton icon="close" color="#FFFFFF" accessibilityLabel={t("photos.closeViewer")} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  close: { position: "absolute", right: spacing.md },
});
