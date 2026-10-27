import { useState } from "react";
import type { ComponentProps } from "react";
import { Image, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { layout, radius, useAppTheme, useThemedStyles } from "../../../../shared/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  imageUrl?: string | null;
  fallbackIcon: IconName;
  size?: number;
};

export function FoodThumb({ imageUrl, fallbackIcon, size = layout.thumbSize }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const [failed, setFailed] = useState(false);

  const showImage = Boolean(imageUrl) && !failed;

  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size >= 44 ? radius.md : radius.sm },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl as string }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailed(true)}
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
        backgroundColor: colors.surfaceMuted,
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
