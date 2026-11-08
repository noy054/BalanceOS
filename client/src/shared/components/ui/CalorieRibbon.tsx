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
  gloss: string;
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

type Band = {
  phase: number;
  scale: number;
  base: number;
  peak: number;
  at: number;
  sharpness: number;
};

type Stroke = { band: Band; edge: number; from: number; to: number; size: number };

const SAMPLES = 200;
const START = -Math.PI / 2;
const BADGE_ANGLE = -0.8;
const OUTER_BIAS = 0.68;
const CENTER_INSET = 0.78;

const MAIN: Band = { phase: 0, scale: 1, base: 0.08, peak: 0.34, at: Math.PI * 0.78, sharpness: 1 };

const FOLDS: Band[] = [
  { phase: 0.55, scale: 0.985, base: 0, peak: 0.18, at: Math.PI * 0.3, sharpness: 3 },
  { phase: -0.45, scale: 1.025, base: 0, peak: 0.13, at: -Math.PI * 0.6, sharpness: 3.6 },
  { phase: 0.3, scale: 0.935, base: 0, peak: 0.1, at: Math.PI * 1.05, sharpness: 4 },
];

const SPECULARS: Stroke[] = [
  { band: MAIN, edge: 0.97, from: Math.PI * 0.66, to: Math.PI * 1.24, size: 3.6 },
  { band: MAIN, edge: 0.97, from: Math.PI * 0.04, to: Math.PI * 0.56, size: 3.2 },
  { band: MAIN, edge: 0.97, from: -Math.PI * 0.98, to: -Math.PI * 0.6, size: 2 },
  { band: MAIN, edge: 0.04, from: Math.PI * 0.7, to: Math.PI * 1.14, size: 2.4 },
  { band: MAIN, edge: 0.04, from: Math.PI * 0.28, to: Math.PI * 0.58, size: 1.6 },
  { band: FOLDS[0], edge: 0.9, from: Math.PI * 0.05, to: Math.PI * 0.55, size: 2.2 },
  { band: FOLDS[1], edge: 0.9, from: -Math.PI * 0.85, to: -Math.PI * 0.38, size: 1.6 },
  { band: FOLDS[2], edge: 0.9, from: Math.PI * 0.85, to: Math.PI * 1.25, size: 1.6 },
];

function radiusAt(theta: number, phase: number) {
  return (
    1 +
    0.085 * Math.sin(2 * theta + 0.9 + phase) +
    0.06 * Math.sin(3 * theta + 2.2 + phase * 1.3) +
    0.025 * Math.sin(5 * theta + 0.3 + phase * 0.7)
  );
}

function bandWidth(band: Band, theta: number) {
  const bump = Math.pow((1 + Math.cos(theta - band.at)) / 2, band.sharpness);
  return band.base + (band.peak - band.base) * bump;
}

function edgeScale(band: Band, theta: number, fraction: number) {
  const width = bandWidth(band, theta);
  const inner = 1 - width * (1 - OUTER_BIAS);
  const outer = 1 + width * OUTER_BIAS;
  return band.scale * (inner + (outer - inner) * fraction);
}

function geometry(width: number) {
  const height = Math.round(width * 0.74);
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.36;
  const ry = height * 0.385;

  const at = (theta: number, phase = 0, scale = 1): Point => {
    const r = radiusAt(theta, phase) * scale;
    return { x: cx + rx * r * Math.cos(theta), y: cy + ry * r * Math.sin(theta) };
  };

  const angles = Array.from({ length: SAMPLES + 1 }, (_, index) => START + (index / SAMPLES) * Math.PI * 2);

  return { width, height, cx, cy, rx, ry, at, angles };
}

type Geometry = ReturnType<typeof geometry>;

function line(points: Point[], close = false) {
  const body = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  return `${body.join(" ")}${close ? " Z" : ""}`;
}

function ring(outer: Point[], inner: Point[]) {
  return line([...outer, ...[...inner].reverse()], true);
}

function strip(geo: Geometry, band: Band, from: number, to: number) {
  const outer = geo.angles.map((theta) => geo.at(theta, band.phase, edgeScale(band, theta, to)));
  const inner = geo.angles.map((theta) => geo.at(theta, band.phase, edgeScale(band, theta, from)));
  return ring(outer, inner);
}

function edgeLoop(geo: Geometry, band: Band, fraction: number) {
  return line(geo.angles.map((theta) => geo.at(theta, band.phase, edgeScale(band, theta, fraction))), true);
}

function tapered(geo: Geometry, band: Band, edge: number, from: number, to: number, thickness: number) {
  const steps = Math.max(12, Math.round((Math.abs(to - from) / (Math.PI * 2)) * SAMPLES));
  const offset = (index: number) => (thickness / geo.rx) * 0.5 * Math.sin((Math.PI * index) / steps);
  const side = (sign: number) =>
    Array.from({ length: steps + 1 }, (_, index) => {
      const theta = from + ((to - from) * index) / steps;
      return geo.at(theta, band.phase, edgeScale(band, theta, edge) + sign * offset(index));
    });
  return ring(side(1), side(-1));
}

function badgeCenter(geo: Geometry) {
  return geo.at(BADGE_ANGLE, MAIN.phase, edgeScale(MAIN, BADGE_ANGLE, 1) + 0.02);
}

export function CalorieRibbon({ width, progress, palette, dark, badge, children }: Props) {
  const geo = useMemo(() => geometry(width), [width]);
  const badgeSize = Math.max(56, Math.round(width * (width < 290 ? 0.21 : 0.23)));
  const badgePoint = badgeCenter(geo);

  return (
    <View style={{ width, height: geo.height }}>
      <RibbonArt width={width} palette={palette} dark={dark} />
      <RibbonProgress width={width} progress={progress} palette={palette} dark={dark} />
      <View
        pointerEvents="none"
        style={[
          styles.center,
          {
            left: geo.cx - geo.rx * 0.74,
            right: geo.cx - geo.rx * 0.74,
            top: geo.cy - geo.ry * CENTER_INSET,
            bottom: geo.cy - geo.ry * CENTER_INSET,
          },
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
          <BadgeDisc size={badgeSize} palette={palette} dark={dark} />
          {badge}
        </View>
      ) : null}
    </View>
  );
}

function padFor(width: number) {
  return Math.round(width * 0.18);
}

const MAIN_LAYERS = [
  { from: 0, to: 1, opacity: 0.5 },
  { from: 0.45, to: 1, opacity: 0.3 },
  { from: 0.76, to: 1, opacity: 0.36 },
  { from: 0, to: 0.34, opacity: 0.26 },
  { from: 0, to: 0.12, opacity: 0.32 },
];

const FOLD_LAYERS = [
  { from: 0, to: 1, opacity: 0.32 },
  { from: 0.6, to: 1, opacity: 0.3 },
  { from: 0, to: 0.25, opacity: 0.18 },
];

const RibbonArt = memo(function RibbonArt({ width, palette, dark }: { width: number; palette: Palette; dark: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (key: string) => `${key}-${uid}`;
  const url = (key: string) => `url(#${id(key)})`;
  const geo = useMemo(() => geometry(width), [width]);
  const pad = padFor(width);
  const unit = width / 320;
  const light = mixColors(palette.color, palette.gloss, 0.7);

  const paths = useMemo(
    () => ({
      body: strip(geo, MAIN, 0, 1),
      main: MAIN_LAYERS.map((layer) => ({ d: strip(geo, MAIN, layer.from, layer.to), opacity: layer.opacity })),
      folds: FOLDS.flatMap((fold) =>
        FOLD_LAYERS.map((layer) => ({ d: strip(geo, fold, layer.from, layer.to), opacity: layer.opacity })),
      ),
      foldBodies: FOLDS.map((fold) => strip(geo, fold, 0, 1)),
      fold: strip(geo, MAIN, 0.36, 0.6),
      rim: edgeLoop(geo, MAIN, 1),
      hole: edgeLoop(geo, MAIN, 0),
      speculars: SPECULARS.map((stroke) => ({
        glow: tapered(geo, stroke.band, stroke.edge, stroke.from, stroke.to, stroke.size * 4 * unit),
        core: tapered(geo, stroke.band, stroke.edge, stroke.from, stroke.to, stroke.size * unit),
      })),
    }),
    [geo, unit],
  );

  const tone = dark
    ? [
        { offset: 0, color: light, opacity: 1 },
        { offset: 0.3, color: palette.color, opacity: 0.95 },
        { offset: 0.62, color: palette.color, opacity: 0.62 },
        { offset: 0.86, color: palette.color, opacity: 0.26 },
        { offset: 1, color: palette.color, opacity: 0.5 },
      ]
    : [
        { offset: 0, color: palette.color, opacity: 1 },
        { offset: 0.35, color: palette.color, opacity: 0.9 },
        { offset: 0.65, color: palette.deep, opacity: 0.5 },
        { offset: 0.86, color: palette.deep, opacity: 0.25 },
        { offset: 1, color: palette.color, opacity: 0.6 },
      ];

  return (
    <Svg
      pointerEvents="none"
      width={width + pad * 2}
      height={geo.height + pad * 2}
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${geo.height + pad * 2}`}
      style={{ position: "absolute", left: -pad, top: -pad }}
    >
      <Defs>
        {[2.5, 8, 14].map((amount) => (
          <Filter
            key={amount}
            id={id(`blur-${amount}`.replace(".", "-"))}
            x={-pad}
            y={-pad}
            width={width + pad * 2}
            height={geo.height + pad * 2}
            filterUnits="userSpaceOnUse"
          >
            <FeGaussianBlur stdDeviation={amount * unit} />
          </Filter>
        ))}

        <LinearGradient
          id={id("tone")}
          x1={width * 0.05}
          y1={geo.height * 0.95}
          x2={width * 0.95}
          y2={geo.height * 0.05}
          gradientUnits="userSpaceOnUse"
        >
          {tone.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
          ))}
        </LinearGradient>

        <RadialGradient id={id("shade")} cx={geo.cx} cy={geo.cy} rx={geo.rx * 1.02} ry={geo.ry * 1.02} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={palette.canvas} stopOpacity={dark ? 0.95 : 0.85} />
          <Stop offset="0.7" stopColor={palette.canvas} stopOpacity={dark ? 0.9 : 0.7} />
          <Stop offset="1" stopColor={palette.canvas} stopOpacity={0} />
        </RadialGradient>

        <RadialGradient id={id("glass")} cx={geo.cx} cy={geo.cy} rx={geo.rx} ry={geo.ry} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={palette.canvas} stopOpacity={0} />
          <Stop offset="0.75" stopColor={palette.color} stopOpacity={dark ? 0.02 : 0.03} />
          <Stop offset="1" stopColor={palette.color} stopOpacity={dark ? 0.1 : 0.08} />
        </RadialGradient>
      </Defs>

      <Path d={paths.body} fill={url("tone")} opacity={dark ? 0.8 : 0.35} filter={url("blur-14")} />
      <Path d={paths.body} fill={url("tone")} opacity={dark ? 0.6 : 0.25} filter={url("blur-8")} />
      <Path d={paths.hole} fill={url("shade")} />
      <Path d={paths.hole} fill={url("glass")} />

      {paths.foldBodies.map((d, index) => (
        <Path key={`fold-shadow-${index}`} d={d} fill={palette.canvas} opacity={dark ? 0.35 : 0} />
      ))}
      {paths.main.map((layer, index) => (
        <Path key={`main-${index}`} d={layer.d} fill={url("tone")} fillOpacity={layer.opacity} />
      ))}
      <Path d={paths.fold} fill={palette.canvas} opacity={dark ? 0.24 : 0} />
      {paths.folds.map((layer, index) => (
        <Path key={`fold-${index}`} d={layer.d} fill={url("tone")} fillOpacity={layer.opacity} />
      ))}

      <Path d={paths.rim} fill="none" stroke={url("tone")} strokeWidth={1} strokeOpacity={dark ? 0.5 : 0.6} />

      {paths.speculars.map((stroke, index) => (
        <Path key={`spec-glow-${index}`} d={stroke.glow} fill={palette.color} opacity={dark ? 0.55 : 0.35} filter={url("blur-2-5")} />
      ))}
      {paths.speculars.map((stroke, index) => (
        <Path key={`spec-core-${index}`} d={stroke.core} fill={dark ? light : palette.deep} opacity={dark ? 0.95 : 0.75} />
      ))}
    </Svg>
  );
});

function rimPath(geo: Geometry) {
  const points = geo.angles.map((theta) => geo.at(theta, MAIN.phase, edgeScale(MAIN, theta, 1)));
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
  }
  return { d: line(points), length };
}

function RibbonProgress({ width, progress, palette, dark }: { width: number; progress: number; palette: Palette; dark: boolean }) {
  const geo = useMemo(() => geometry(width), [width]);
  const rim = useMemo(() => rimPath(geo), [geo]);
  const target = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 0;
  const value = useAnimatedProgress(target);
  if (value <= 0.002) return null;

  const pad = padFor(width);
  const unit = width / 320;
  const dash = [rim.length * value, rim.length + 1];
  const light = mixColors(palette.color, palette.gloss, 0.75);

  return (
    <Svg
      pointerEvents="none"
      width={width + pad * 2}
      height={geo.height + pad * 2}
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${geo.height + pad * 2}`}
      style={{ position: "absolute", left: -pad, top: -pad }}
    >
      <Path d={rim.d} fill="none" stroke={palette.color} strokeWidth={14 * unit} strokeOpacity={dark ? 0.14 : 0.18} strokeDasharray={dash} strokeLinecap="round" />
      <Path d={rim.d} fill="none" stroke={palette.color} strokeWidth={6 * unit} strokeOpacity={dark ? 0.45 : 0.5} strokeDasharray={dash} strokeLinecap="round" />
      <Path d={rim.d} fill="none" stroke={dark ? light : palette.deep} strokeWidth={2.4 * unit} strokeDasharray={dash} strokeLinecap="round" />
    </Svg>
  );
}

const BadgeDisc = memo(function BadgeDisc({ size, palette, dark }: { size: number; palette: Palette; dark: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fillId = `badge-fill-${uid}`;
  const blurId = `badge-blur-${uid}`;
  const pad = Math.round(size * 0.3);
  const total = size + pad * 2;
  const c = total / 2;
  const r = size / 2;
  const base = dark ? mixColors(palette.canvas, palette.color, 0.05) : palette.surface;
  const lift = dark ? mixColors(palette.canvas, palette.color, 0.16) : mixColors(palette.surface, palette.color, 0.12);
  const sheen = `M ${c - r * 0.62} ${c - r * 0.62} A ${r - 3} ${r - 3} 0 0 1 ${c + r * 0.62} ${c - r * 0.62}`;

  return (
    <Svg pointerEvents="none" width={total} height={total} style={{ position: "absolute", left: -pad, top: -pad }}>
      <Defs>
        <RadialGradient id={fillId} cx="50%" cy="28%" rx="62%" ry="62%">
          <Stop offset="0" stopColor={lift} />
          <Stop offset="1" stopColor={base} />
        </RadialGradient>
        <Filter id={blurId} x={0} y={0} width={total} height={total} filterUnits="userSpaceOnUse">
          <FeGaussianBlur stdDeviation={size * 0.06} />
        </Filter>
      </Defs>
      <Circle cx={c} cy={c} r={r + 1} fill="none" stroke={palette.color} strokeWidth={size * 0.1} opacity={dark ? 0.35 : 0.2} filter={`url(#${blurId})`} />
      <Circle cx={c} cy={c} r={r} fill={`url(#${fillId})`} fillOpacity={dark ? 0.96 : 1} />
      <Circle cx={c} cy={c} r={r - 0.75} fill="none" stroke={dark ? palette.color : palette.edge} strokeWidth={1.5} strokeOpacity={dark ? 0.9 : 0.6} />
      <Path d={sheen} fill="none" stroke={palette.gloss} strokeWidth={1} strokeLinecap="round" opacity={dark ? 0.1 : 0.4} />
    </Svg>
  );
});

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
