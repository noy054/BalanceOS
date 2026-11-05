export type ChartPoint = { x: number; y: number };

const SAMPLE_SPACING = 4;

export function niceScale(peak: number) {
  if (peak <= 0) return { max: 1 };
  const rough = (peak * 1.1) / 2;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((f) => f * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  return { max: step * 2 };
}

function monotoneSlopes(points: ChartPoint[]) {
  const n = points.length;
  const delta = points.slice(1).map((p, i) => (p.y - points[i].y) / (p.x - points[i].x));
  const slopes = points.map((_, i) => {
    if (i === 0) return delta[0];
    if (i === n - 1) return delta[n - 2];
    return delta[i - 1] * delta[i] <= 0 ? 0 : (delta[i - 1] + delta[i]) / 2;
  });
  delta.forEach((d, i) => {
    if (d === 0) {
      slopes[i] = 0;
      slopes[i + 1] = 0;
      return;
    }
    const a = slopes[i] / d;
    const b = slopes[i + 1] / d;
    const h = a * a + b * b;
    if (h > 9) {
      const s = 3 / Math.sqrt(h);
      slopes[i] = s * a * d;
      slopes[i + 1] = s * b * d;
    }
  });
  return slopes;
}

function smooth(points: ChartPoint[]): ChartPoint[] {
  if (points.length < 3) return points;
  const slopes = monotoneSlopes(points);
  const result: ChartPoint[] = [points[0]];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const h = b.x - a.x;
    const steps = Math.max(2, Math.ceil(h / SAMPLE_SPACING));
    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const y =
        (2 * t3 - 3 * t2 + 1) * a.y +
        (t3 - 2 * t2 + t) * h * slopes[i] +
        (-2 * t3 + 3 * t2) * b.y +
        (t3 - t2) * h * slopes[i + 1];
      result.push({ x: a.x + h * t, y });
    }
  }
  return result;
}

export function smoothRuns(points: (ChartPoint | null)[]): ChartPoint[][] {
  const runs: ChartPoint[][] = [];
  let current: ChartPoint[] = [];
  points.forEach((point) => {
    if (point) {
      current.push(point);
      return;
    }
    if (current.length > 0) runs.push(current);
    current = [];
  });
  if (current.length > 0) runs.push(current);
  return runs.map((run) => smooth([...run].sort((a, b) => a.x - b.x)));
}
