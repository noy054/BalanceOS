import { memo, ReactNode, useId, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  FeGaussianBlur,
  Filter,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { mixColors } from "../../helpers/progressColor";
import { useAnimatedProgress } from "../../hooks/useAnimatedProgress";

type Palette = {
  color: string;
  deep: string;
  edge: string;
  canvas: string;
  surface: string;
};

type Props = {
  width: number;
  progress: number;
  palette: Palette;
  dark: boolean;
  badge?: ReactNode;
  children?: ReactNode;
};

type Point = { x: number; y: number };

type Strand = {
  phase: number;
  scale: number;
  width: number;
  twist: number;
  opacity: number;
};

const SAMPLES = 160;
const START = -Math.PI / 2;
const BADGE_ANGLE = START + Math.PI * 2 * 0.135;

const STRANDS: Strand[] = [
  { phase: 0, scale: 1, width: 0.24, twist: 0.4, opacity: 0.5 },
  { phase: 0.5, scale: 1.04, width: 0.16, twist: 2.1, opacity: 0.38 },
  { phase: -0.6, scale: 0.955, width: 0.14, twist: 3.7, opacity: 0.32 },
  { phase: 1.1, scale: 1.015, width: 0.08, twist: 5.2, opacity: 0.55 },
];

function radiusAt(theta: number, phase: number) {
  return (
    1 +
    0.1 * Math.sin(2 * theta + 0.9 + phase) +
    0.075 * Math.sin(3 * theta + 2.2 + phase * 1.3) +
    0.03 * Math.sin(5 * theta + 0.3 + phase * 0.7)
  );
}

function geometry(width: number) {
  const height = Math.round(width * 0.84);
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.37;
  const ry = height * 0.4;

  const at = (theta: number, phase = 0, scale = 1): Point => {
    const r = radiusAt(theta, phase) * scale;
    return { x: cx + rx * r * Math.cos(theta), y: cy + ry * r * Math.sin(theta) };
  };

  const angles = Array.from({ length: SAMPLES + 1 }, (_, index) => START + (index / SAMPLES) * Math.PI * 2);

  return { height, cx, cy, rx, ry, at, angles };
}

type Geometry = ReturnType<typeof geometry>;

function line(points: Point[], close = false) {
  const body = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  return `${body.join(" ")}${close ? " Z" : ""}`;
}

function strandPath(geo: Geometry, strand: Strand) {
  const half = (theta: number) =>
    (strand.width * (0.12 + 0.88 * (0.5 + 0.5 * Math.sin(2 * theta + strand.twist)))) / 2;
  const outer = geo.angles.map((theta) => geo.at(theta, strand.phase, strand.scale * (1 + half(theta))));
  const inner = geo.angles.map((theta) => geo.at(theta, strand.phase, strand.scale * (1 - half(theta))));
  return {
    fill: line([...outer, ...[...inner].reverse()], true),
    edges: `${line(outer, true)} ${line(inner, true)}`,
  };
}

function centerLine(geo: Geometry) {
  const points = geo.angles.map((theta) => geo.at(theta));
  let length = 0;
  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
    lengths.push(length);
  }
  return { d: line(points), points, lengths, length };
}

function arcPath(geo: Geometry, from: number, to: number, scale: number) {
  const steps = 40;
  return line(Array.from({ length: steps + 1 }, (_, index) => geo.at(from + ((to - from) * index) / steps, 0, scale)));
}

export function CalorieRibbon({ width, progress, palette, dark, badge, children }: Props) {
  const geo = useMemo(() => geometry(width), [width]);
  const badgeSize = Math.max(64, Math.round(width * 0.2));
  const badgePoint = geo.at(BADGE_ANGLE, 0, 1.02);

  return (
    <View style={{ width, height: geo.height }}>
      <RibbonArt width={width} palette={palette} dark={dark} badgeSize={badgeSize} showBadge={badge != null} />
      <RibbonProgress width={width} progress={progress} palette={palette} />
      <View
        pointerEvents="none"
        style={[
          styles.center,
          { left: geo.cx - geo.rx * 0.78, right: geo.cx - geo.rx * 0.78, top: geo.cy - geo.ry * 0.72, bottom: geo.cy - geo.ry * 0.72 },
        ]}
      >
        {children}
      </View>
      {badge != null ? (
        <View
          pointerEvents="none"
          style={[
            styles.badge,
            { width: badgeSize, height: badgeSize, left: badgePoint.x - badgeSize / 2, top: badgePoint.y - badgeSize / 2 },
          ]}
        >
          {badge}
        </View>
      ) : null}
    </View>
  );
}

const RibbonArt = memo(function RibbonArt({
  width,
  palette,
  dark,
  badgeSize,
  showBadge,
}: {
  width: number;
  palette: Palette;
  dark: boolean;
  badgeSize: number;
  showBadge: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (key: string) => `${key}-${uid}`;
  const url = (key: string) => `url(#${id(key)})`;
  const geo = useMemo(() => geometry(width), [width]);
  const center = useMemo(() => centerLine(geo), [geo]);
  const strands = useMemo(() => STRANDS.map((strand) => strandPath(geo, strand)), [geo]);
  const pad = Math.round(width * 0.14);
  const blur = (amount: number) => (width / 320) * amount;
  const glow = dark ? 1 : 0.45;
  const badgePoint = geo.at(BADGE_ANGLE, 0, 1.02);
  const light = mixColors(palette.color, "#FFFFFF", 0.3);
  const highlightTop = arcPath(geo, START - Math.PI * 0.42, START - Math.PI * 0.08, 1.06);
  const highlightBottom = arcPath(geo, START + Math.PI * 1.08, START + Math.PI * 1.38, 0.95);

  return (
    <Svg
      pointerEvents="none"
      width={width + pad * 2}
      height={geo.height + pad * 2}
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${geo.height + pad * 2}`}
      style={{ position: "absolute", left: -pad, top: -pad }}
    >
      <Defs>
        {[3, 7, 16].map((amount) => (
          <Filter
            key={amount}
            id={id(`blur-${amount}`)}
            x={-pad}
            y={-pad}
            width={width + pad * 2}
            height={geo.height + pad * 2}
            filterUnits="userSpaceOnUse"
          >
            <FeGaussianBlur stdDeviation={blur(amount)} />
          </Filter>
        ))}

        <RadialGradient id={id("glass")} cx={geo.cx} cy={geo.cy} rx={geo.rx * 1.1} ry={geo.ry * 1.1} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={palette.color} stopOpacity={0} />
          <Stop offset="0.7" stopColor={palette.color} stopOpacity={dark ? 0.03 : 0.04} />
          <Stop offset="1" stopColor={palette.color} stopOpacity={dark ? 0.16 : 0.14} />
        </RadialGradient>

        <LinearGradient id={id("strand")} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={light} stopOpacity={0.95} />
          <Stop offset="0.28" stopColor={palette.color} stopOpacity={0.85} />
          <Stop offset="0.62" stopColor={palette.deep} stopOpacity={0.55} />
          <Stop offset="1" stopColor={palette.color} stopOpacity={0.9} />
        </LinearGradient>

        <LinearGradient id={id("edge")} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={palette.edge} stopOpacity={0.95} />
          <Stop offset="0.55" stopColor={palette.edge} stopOpacity={0.35} />
          <Stop offset="1" stopColor={palette.edge} stopOpacity={0.7} />
        </LinearGradient>

        <RadialGradient id={id("badge")} cx="40%" cy="30%" rx="70%" ry="70%">
          <Stop offset="0" stopColor={mixColors(palette.surface, palette.color, dark ? 0.12 : 0.06)} />
          <Stop offset="1" stopColor={palette.surface} />
        </RadialGradient>
      </Defs>

      <Path d={center.d} fill={url("glass")} />

      <Path d={center.d} fill="none" stroke={palette.color} strokeWidth={width * 0.14} opacity={0.24 * glow} filter={url("blur-16")} />
      <Path d={center.d} fill="none" stroke={palette.deep} strokeWidth={width * 0.05} opacity={0.5 * glow} filter={url("blur-7")} />

      <Path d={arcPath(geo, START, START + Math.PI * 2, 0.86)} fill="none" stroke={palette.canvas} strokeWidth={width * 0.06} opacity={dark ? 0.55 : 0.2} filter={url("blur-7")} />

      {strands.map((strand, index) => (
        <Path key={`fill-${index}`} d={strand.fill} fill={url("strand")} fillOpacity={STRANDS[index].opacity} />
      ))}
      {strands.map((strand, index) => (
        <Path
          key={`edge-${index}`}
          d={strand.edges}
          fill="none"
          stroke={url("edge")}
          strokeWidth={1.1}
          strokeOpacity={dark ? 0.85 : 0.5}
          strokeLinejoin="round"
        />
      ))}

      <Path d={highlightTop} fill="none" stroke={light} strokeWidth={4} strokeLinecap="round" opacity={0.55 * glow} filter={url("blur-3")} />
      <Path d={highlightTop} fill="none" stroke={palette.edge} strokeWidth={1.4} strokeLinecap="round" opacity={dark ? 0.85 : 0.3} />
      <Path d={highlightBottom} fill="none" stroke={light} strokeWidth={3} strokeLinecap="round" opacity={0.45 * glow} filter={url("blur-3")} />
      <Path d={highlightBottom} fill="none" stroke={palette.edge} strokeWidth={1.1} strokeLinecap="round" opacity={dark ? 0.7 : 0.25} />

      {showBadge ? (
        <>
          <Circle cx={badgePoint.x} cy={badgePoint.y} r={badgeSize * 0.56} fill={palette.color} opacity={0.35 * glow} filter={url("blur-7")} />
          <Circle cx={badgePoint.x} cy={badgePoint.y} r={badgeSize / 2} fill={url("badge")} stroke={palette.color} strokeWidth={1.4} />
          <Circle cx={badgePoint.x} cy={badgePoint.y} r={badgeSize / 2 - 3} fill="none" stroke={palette.edge} strokeWidth={0.6} opacity={0.35} />
        </>
      ) : null}
    </Svg>
  );
});

function RibbonProgress({ width, progress, palette }: { width: number; progress: number; palette: Palette }) {
  const geo = useMemo(() => geometry(width), [width]);
  const center = useMemo(() => centerLine(geo), [geo]);
  const target = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 0;
  const value = useAnimatedProgress(target);
  if (value <= 0.002) return null;

  const pad = Math.round(width * 0.14);
  const drawn = center.length * value;
  const dash = [drawn, center.length + 1];
  const tipIndex = Math.max(0, center.lengths.findIndex((entry) => entry >= drawn));
  const tip = center.points[tipIndex] ?? center.points[center.points.length - 1];
  const light = mixColors(palette.color, "#FFFFFF", 0.6);

  return (
    <Svg
      pointerEvents="none"
      width={width + pad * 2}
      height={geo.height + pad * 2}
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${geo.height + pad * 2}`}
      style={{ position: "absolute", left: -pad, top: -pad }}
    >
      <Path d={center.d} fill="none" stroke={palette.color} strokeWidth={12} strokeOpacity={0.12} strokeDasharray={dash} strokeLinecap="round" />
      <Path d={center.d} fill="none" stroke={palette.color} strokeWidth={6} strokeOpacity={0.3} strokeDasharray={dash} strokeLinecap="round" />
      <Path d={center.d} fill="none" stroke={light} strokeWidth={2.4} strokeDasharray={dash} strokeLinecap="round" />
      {value < 0.995 ? (
        <>
          <Circle cx={tip.x} cy={tip.y} r={10} fill={palette.color} opacity={0.22} />
          <Circle cx={tip.x} cy={tip.y} r={4.5} fill={light} stroke={palette.color} strokeWidth={1.2} />
        </>
      ) : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  badge: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
