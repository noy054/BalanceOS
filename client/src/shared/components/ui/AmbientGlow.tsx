import { useId, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { useAppTheme } from "../../theme";

type Props = {
  intensity?: number;
};

const HEIGHT = 680;
const VIEWBOX_WIDTH = 400;

export function AmbientGlow({ intensity = 1 }: Props) {
  const { colors, resolvedTheme } = useAppTheme();
  const [width, setWidth] = useState(0);

  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const lightId = `ambient-light-${uniqueId}`;
  const fadeId = `ambient-fade-${uniqueId}`;

  const safeIntensity = Number.isFinite(intensity) ? Math.max(0, intensity) : 1;

  const strength = (resolvedTheme === "dark" ? 1 : 0.45) * safeIntensity;

  const opacity = (value: number) => Math.min(Math.max(value * strength, 0), 1);

  return (
    <View
      pointerEvents="none"
      style={styles.root}
      onLayout={({ nativeEvent }) =>
        setWidth(Math.max(0, nativeEvent.layout.width))
      }
    >
      {width > 0 ? (
        <Svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <RadialGradient id={lightId} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop
                offset="0"
                stopColor={colors.calorieGauge}
                stopOpacity={1}
              />
              <Stop
                offset="0.28"
                stopColor={colors.calorieGauge}
                stopOpacity={0.72}
              />
              <Stop
                offset="0.58"
                stopColor={colors.calorieGauge}
                stopOpacity={0.25}
              />
              <Stop
                offset="0.82"
                stopColor={colors.calorieGauge}
                stopOpacity={0.06}
              />
              <Stop
                offset="1"
                stopColor={colors.calorieGauge}
                stopOpacity={0}
              />
            </RadialGradient>

            <LinearGradient id={fadeId} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0" stopColor={colors.canvas} stopOpacity={0} />
              <Stop offset="0.45" stopColor={colors.canvas} stopOpacity={0} />
              <Stop
                offset="0.82"
                stopColor={colors.canvas}
                stopOpacity={0.85}
              />
              <Stop offset="1" stopColor={colors.canvas} stopOpacity={1} />
            </LinearGradient>
          </Defs>

          <Ellipse
            cx={150}
            cy={50}
            rx={290}
            ry={185}
            fill={`url(#${lightId})`}
            opacity={opacity(0.5)}
            transform="rotate(-24 150 50)"
          />

          <Ellipse
            cx={210}
            cy={140}
            rx={235}
            ry={105}
            fill={`url(#${lightId})`}
            opacity={opacity(0.25)}
            transform="rotate(-30 210 140)"
          />

          <Ellipse
            cx={350}
            cy={225}
            rx={200}
            ry={85}
            fill={`url(#${lightId})`}
            opacity={opacity(0.18)}
            transform="rotate(-28 350 225)"
          />

          <Ellipse
            cx={35}
            cy={305}
            rx={175}
            ry={85}
            fill={`url(#${lightId})`}
            opacity={opacity(0.08)}
            transform="rotate(-16 35 305)"
          />

          <Rect
            x={0}
            y={0}
            width={VIEWBOX_WIDTH}
            height={HEIGHT}
            fill={`url(#${fadeId})`}
          />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEIGHT,
    overflow: "hidden",
  },
});
