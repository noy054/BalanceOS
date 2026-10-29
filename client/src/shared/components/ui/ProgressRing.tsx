import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { mixColors, ProgressGradient } from "../../helpers/progressColor";
import { useAnimatedProgress } from "../../hooks/useAnimatedProgress";
import { useAppTheme } from "../../theme";

type Props = {
  size: number;
  thickness: number;
  progress: number;
  gradient: ProgressGradient;
  trackColor: string;
  halo?: boolean;
  mirrored?: boolean;
  children?: ReactNode;
};

const SEGMENT_DEGREES = 3;
const GLOW_LAYERS = [
  { spread: 3, opacity: 0.28 },
  { spread: 8, opacity: 0.1 },
];

export function ProgressRing({
  size,
  thickness,
  progress,
  gradient,
  trackColor,
  halo = false,
  mirrored = false,
  children,
}: Props) {
  const { colors } = useAppTheme();
  const shownProgress = useAnimatedProgress(Math.min(Math.max(progress, 0), 1));
  const degrees = shownProgress * 360;
  const half = size / 2;
  const arcLength = (spanDegrees: number) => (half * spanDegrees * Math.PI) / 180;
  const segmentCount = Math.ceil(degrees / SEGMENT_DEGREES);
  const hasStartCap = degrees > 0 && degrees < 360;
  const colorAt = (angle: number) =>
    mixColors(gradient[0], gradient[1], degrees > 0 ? angle / degrees : 0);
  const tipColor = gradient[1];
  const glassInset = thickness + 10;

  const segments = Array.from({ length: segmentCount }, (_, index) => {
    const start = index * SEGMENT_DEGREES;
    const span = Math.min(SEGMENT_DEGREES, degrees - start);
    const angle = start + span / 2;
    return {
      angle,
      length: arcLength(span) + 1.5,
      glowLength: (spread: number) => ((half + spread) * span * Math.PI) / 180 + 1.5,
      color: colorAt(angle),
    };
  });

  const piece = (
    angle: number,
    width: number,
    color: string,
    round: boolean,
    key: string,
    opacity = 1,
  ) => (
    <View
      key={key}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${angle}deg` }] }]}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: half - width / 2,
          width,
          height: thickness,
          borderRadius: round ? thickness / 2 : 0,
          backgroundColor: color,
          opacity,
        }}
      />
    </View>
  );

  const dot = (angle: number, diameter: number, color: string, key: string, opacity = 1) => (
    <View
      key={key}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${angle}deg` }] }]}
    >
      <View
        style={{
          position: "absolute",
          top: thickness / 2 - diameter / 2,
          left: half - diameter / 2,
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: color,
          opacity,
        }}
      />
    </View>
  );

  return (
    <View style={{ width: size, height: size }}>
      <View
        pointerEvents="none"
        style={[
          styles.glass,
          {
            top: glassInset,
            left: glassInset,
            width: size - glassInset * 2,
            height: size - glassInset * 2,
            borderRadius: half - glassInset,
            backgroundColor: colors.glassSurface,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: half - glassInset,
              borderWidth: 1.5,
              borderColor: "transparent",
              borderTopColor: colors.glassHighlight,
            },
          ]}
        />
      </View>


      <View style={[StyleSheet.absoluteFill, mirrored && styles.mirrored]}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: half, borderWidth: thickness, borderColor: trackColor },
          ]}
        />

        {halo
          ? GLOW_LAYERS.map(({ spread, opacity }) => (
              <View
                key={`glow${spread}`}
                pointerEvents="none"
                needsOffscreenAlphaCompositing
                style={[StyleSheet.absoluteFill, { opacity }]}
              >
                {segments.map((segment, index) => (
                  <View
                    key={index}
                    style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${segment.angle}deg` }] }]}
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: -spread,
                        left: half - segment.glowLength(spread) / 2,
                        width: segment.glowLength(spread),
                        height: thickness + spread * 2,
                        borderRadius: spread,
                        backgroundColor: segment.color,
                      }}
                    />
                  </View>
                ))}
              </View>
            ))
          : null}

        {segments.map((segment, index) =>
          piece(segment.angle, segment.length, segment.color, false, `s${index}`),
        )}

        {hasStartCap ? piece(0, thickness, colorAt(0), true, "start") : null}

        {degrees > 0 ? (
          <>
            {halo ? dot(degrees, thickness * 2.4, tipColor, "tip-halo", 0.16) : null}
            {halo ? dot(degrees, thickness * 1.8, tipColor, "tip-glow", 0.3) : null}
            {dot(degrees, thickness + 6, tipColor, "tip")}
            {dot(degrees, thickness * 0.55, colors.onAccent, "tip-core")}
          </>
        ) : null}
      </View>

      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
  glass: {
    position: "absolute",
    borderWidth: 1,
    overflow: "hidden",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});
