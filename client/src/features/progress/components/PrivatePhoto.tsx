import { ActivityIndicator, Image, ImageStyle, StyleProp, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme, useThemedStyles } from "../../../shared/theme";
import { usePrivatePhoto } from "../hooks/useProgress";

type Props = {
  photoId?: string;
  localUri?: string;
  style: StyleProp<ImageStyle>;
  resizeMode?: "cover" | "contain";
};

export function PrivatePhoto({ photoId, localUri, style, resizeMode = "cover" }: Props) {
  if (localUri) {
    return <PhotoImage uri={localUri} style={style} resizeMode={resizeMode} />;
  }
  if (!photoId) return null;
  return <RemotePhoto photoId={photoId} style={style} resizeMode={resizeMode} />;
}

function RemotePhoto({ photoId, style, resizeMode }: Required<Pick<Props, "photoId" | "resizeMode">> & Pick<Props, "style">) {
  const { t } = useTranslation("progress");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { data, isLoading, isError } = usePrivatePhoto(photoId);

  if (data) return <PhotoImage uri={data} style={style} resizeMode={resizeMode} />;

  return (
    <View
      style={[styles.placeholder, style as StyleProp<ImageStyle>]}
      accessible
      accessibilityLabel={isError ? t("photos.loadFailed") : t("photos.loading")}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.textMuted} />
      ) : (
        <MaterialCommunityIcons name="image-broken-variant" size={22} color={colors.textMuted} />
      )}
    </View>
  );
}

function PhotoImage({ uri, style, resizeMode }: { uri: string; style: StyleProp<ImageStyle>; resizeMode: "cover" | "contain" }) {
  const { t } = useTranslation("progress");
  return <Image source={{ uri }} style={style} resizeMode={resizeMode} accessibilityLabel={t("photos.photo")} />;
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      placeholder: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceMuted,
      },
    }),
  );
