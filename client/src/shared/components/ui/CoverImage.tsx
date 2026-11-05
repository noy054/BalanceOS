import { useState } from "react";
import { Image, ImageSourcePropType, LayoutChangeEvent, StyleSheet, View } from "react-native";

type Props = {
  source: ImageSourcePropType;
  mirrored?: boolean;
};

type Size = {
  width: number;
  height: number;
};

export function CoverImage({ source, mirrored = false }: Props) {
  const [size, setSize] = useState<Size | null>(null);

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) =>
      current && current.width === width && current.height === height ? current : { width, height },
    );
  }

  return (
    <View pointerEvents="none" style={styles.fill} onLayout={handleLayout}>
      {size ? (
        <Image
          source={source}
          resizeMode="cover"
          accessible={false}
          style={[
            { width: size.width, height: size.height },
            mirrored && styles.mirrored,
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
});
