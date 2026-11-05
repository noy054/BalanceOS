import { useState } from "react";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { layout, radius, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useFoodImage } from "../../hooks/useFoodImage";
import { thumbnailImageUrl } from "../../helpers/foodImage";

const THUMBNAIL_MAX_SIZE = 72;

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  imageUrl?: string | null;
  fallbackIcon: IconName;
  size?: number;
};

export function FoodThumb({ imageUrl, fallbackIcon, size = layout.thumbSize }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const image = useFoodImage(imageUrl);
  const original = image.uri;
  const small = original && size <= THUMBNAIL_MAX_SIZE ? thumbnailImageUrl(original) : original;
  const [failure, setFailure] = useState<{ uri: string | null; stage: number }>({ uri: null, stage: 0 });
  const stage = failure.uri === original ? failure.stage : 0;
  const uri = stage === 0 ? small : stage === 1 && small !== original ? original : null;

  function handleError() {
    setFailure({ uri: original, stage: stage === 0 && small !== original ? 1 : 2 });
  }

  const showImage = Boolean(uri);

  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size >= 44 ? radius.md : radius.sm },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={uri}
          transition={120}
          onError={handleError}
          accessible={false}
        />
      ) : (
        <MaterialCommunityIcons
          name={fallbackIcon}
          size={Math.round(size * 0.46)}
          color={colors.textMuted}
        />
      )}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      box: {
        backgroundColor: colors.glassBorder,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      },
      image: {
        width: "100%",
        height: "100%",
      },
    }),
  );
