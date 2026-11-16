import { memo, useId, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

import { useAppTheme } from "../../theme";
import { useCalorieToneStore } from "../../store/calorieToneStore";

type Glow = { cx: number; cy: number; rx: number; ry: number; opacity: number };

const GLOWS: Glow[] = [
  { cx: 0.62, cy: -0.02, rx: 0.95, ry: 0.3, opacity: 0.16 },
  { cx: 0.08, cy: 0.42, rx: 0.55, ry: 0.22, opacity: 0.06 },
  { cx: 0.96, cy: 0.78, rx: 0.6, ry: 0.24, opacity: 0.05 },
];

export const AppBackdrop = memo(function AppBackdrop() {
  const { colors, resolvedTheme } = useAppTheme();
  const overTarget = useCalorieToneStore((state) => state.overTarget);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const tone = overTarget ? colors.overTarget : colors.calorieGauge;
  const strength = resolvedTheme === "dark" ? 1 : 0.55;

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={({ nativeEvent }) =>
        setSize({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })
      }
    >
      {size.width > 0 ? (
        <Svg width={size.width} height={size.height}>
          <Defs>
            {GLOWS.map((glow, index) => (
              <RadialGradient key={index} id={`glow-${uid}-${index}`} cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor={tone} stopOpacity={glow.opacity * strength} />
                <Stop offset="0.55" stopColor={tone} stopOpacity={glow.opacity * strength * 0.35} />
                <Stop offset="1" stopColor={tone} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {GLOWS.map((glow, index) => (
            <Ellipse
              key={index}
              cx={glow.cx * size.width}
              cy={glow.cy * size.height}
              rx={glow.rx * size.width}
              ry={glow.ry * size.height}
              fill={`url(#glow-${uid}-${index})`}
            />
          ))}
        </Svg>
      ) : null}
    </View>
  );
});
