import { StyleSheet, View } from "react-native";

import { mixColors, ProgressGradient } from "../../helpers/progressColor";
import { useAnimatedProgress } from "../../hooks/useAnimatedProgress";
import { radius, useAppTheme } from "../../theme";

type Props = {
  progress: number;
  gradient: ProgressGradient;
  mirrored?: boolean;
  height?: number;
};

const SLICES = 32;

export function GradientBar({ progress, gradient, mirrored = false, height = 8 }: Props) {
  const { colors } = useAppTheme();
  const value = useAnimatedProgress(Math.min(Math.max(progress, 0), 1));

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: colors.progressTrack },
        mirrored && styles.mirrored,
      ]}
    >
      {value > 0 ? (
        <View style={[styles.fill, { width: `${value * 100}%` }]}>
          {Array.from({ length: SLICES }, (_, index) => (
            <View
              key={index}
              style={[
                styles.slice,
                { backgroundColor: mixColors(gradient[0], gradient[1], index / (SLICES - 1)) },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.xs,
    overflow: "hidden",
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
  fill: {
    height: "100%",
    flexDirection: "row",
    borderRadius: radius.xs,
    overflow: "hidden",
  },
  slice: {
    flex: 1,
    marginEnd: -0.5,
  },
});
