// Small SVG and HTML charts for the lab page, drawn as strings. Points and cells carry `data-slug` (a click opens the
// build) and `data-tip` (the page's hover tooltip).
import { esc } from "./lab-model";

export type Point = { v: number; slug?: string; tip: string; color?: string };
export type StripGroup = { label: string; sub?: string; color: string; points: Point[] };

type Axis = { min: number; max: number; log: boolean; format: (value: number) => string; ticks?: number[] };

/** Round durations in seconds, for time axes. */
const TIME_TICKS = [1, 2, 5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200];

function ticks({ min, max, log, ticks: fixed }: Axis) {
  if (fixed) return fixed.filter((value) => value >= min * 0.999 && value <= max * 1.001);
  if (log) {
    const out: number[] = [];
    for (let power = Math.floor(Math.log10(min)); power <= Math.ceil(Math.log10(max)); power++)
      for (const step of [1, 2, 5]) {
        const value = step * 10 ** power;
        if (value >= min * 0.999 && value <= max * 1.001) out.push(value);
      }
    return out;
  }
  const span = max - min || 1;
  const raw = span / 6;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => span / s <= 7) ?? raw;
  const out: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + 1e-9; value += step) out.push(value);
  return out;
}

function scale(axis: Axis, from: number, to: number) {
  const f = (value: number) => (axis.log ? Math.log10(Math.max(value, axis.min)) : value);
  const a = f(axis.min);
  const b = f(axis.max);
  return (value: number) => from + ((f(value) - a) / (b - a || 1)) * (to - from);
}

/** A nice axis around the values: log axes snap to 1-2-5 decades. */
export function axisFor(
  values: number[],
  log: boolean,
  format: (value: number) => string,
  options: { floor?: number; time?: boolean } = {},
): Axis {
  const finite = values.filter((value) => Number.isFinite(value) && (!log || value > 0));
  let min = options.floor ?? Math.min(...finite);
  let max = Math.max(...finite);
  if (!finite.length) ((min = log ? 1 : 0), (max = 1));
  if (log && options.time) {
    min = [...TIME_TICKS].reverse().find((value) => value <= min) ?? min;
    max = TIME_TICKS.find((value) => value >= max) ?? max;
    return { min, max, log, format, ticks: TIME_TICKS };
  }
  if (log) {
    min = 10 ** Math.floor(Math.log10(min));
    const top = 10 ** Math.floor(Math.log10(max));
    max = [1, 2, 5, 10].map((m) => m * top).find((value) => value >= max) ?? max;
  } else {
    min = Math.min(0, min);
    max = max * 1.05;
  }
  return { min, max, log, format };
}

/** Rows of jittered dots on one shared axis, each row with its median marked. */
export function strip(
  groups: StripGroup[],
  axis: Axis,
  options: { width?: number; row?: number; label?: number } = {},
) {
  const width = options.width ?? 900;
  const row = options.row ?? 34;
  const labelWidth = options.label ?? 190;
  const top = 8;
  const height = top + groups.length * row + 26;
  const x = scale(axis, labelWidth + 10, width - 16);
  const parts: string[] = [];
  for (const value of ticks(axis)) {
    const px = x(value);
    parts.push(
      `<line x1="${px}" x2="${px}" y1="${top}" y2="${height - 22}" class="grid"/>`,
      `<text x="${px}" y="${height - 6}" class="tick" text-anchor="middle">${esc(axis.format(value))}</text>`,
    );
  }
  groups.forEach((group, index) => {
    const y = top + index * row + row / 2;
    parts.push(
      `<text x="${labelWidth}" y="${y - (group.sub ? 2 : -4)}" class="label" text-anchor="end">${esc(group.label)}</text>`,
    );
    if (group.sub)
      parts.push(`<text x="${labelWidth}" y="${y + 11}" class="sub" text-anchor="end">${esc(group.sub)}</text>`);
    parts.push(`<line x1="${labelWidth + 10}" x2="${width - 16}" y1="${y}" y2="${y}" class="lane"/>`);
    let seed = index * 7919 + 13;
    const jitter = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * (row - 12);
    for (const point of group.points) {
      if (!Number.isFinite(point.v) || (axis.log && point.v <= 0)) continue;
      parts.push(
        `<circle cx="${x(point.v).toFixed(1)}" cy="${(y + jitter()).toFixed(1)}" r="3.2" fill="${point.color ?? group.color}"` +
          `${point.slug ? ` data-slug="${point.slug}"` : ""} data-tip="${esc(point.tip)}"/>`,
      );
    }
    const values = group.points.map((point) => point.v).filter((value) => Number.isFinite(value));
    if (values.length) {
      values.sort((a, b) => a - b);
      const mid = values[Math.floor((values.length - 1) / 2)];
      const px = x(mid);
      parts.push(
        `<line x1="${px}" x2="${px}" y1="${y - row / 2 + 3}" y2="${y + row / 2 - 3}" class="median"` +
          ` data-tip="${esc(`${group.label}: median ${axis.format(mid)}`)}"/>`,
      );
    }
  });
  return `<svg class="chart strip" viewBox="0 0 ${width} ${height}" width="100%">${parts.join("")}</svg>`;
}

export type ScatterPoint = { x: number; y: number; color: string; slug?: string; tip: string; ring?: boolean };

/** Dots on two axes, with optional straight guides `y = k·x` (on log axes, lines of constant ratio). */
export function scatter(
  points: ScatterPoint[],
  xAxis: Axis,
  yAxis: Axis,
  options: {
    width?: number;
    height?: number;
    xLabel: string;
    yLabel: string;
    guides?: Array<{ k: number; label: string }>;
  },
) {
  const width = options.width ?? 900;
  const height = options.height ?? 520;
  const left = 64;
  const bottom = height - 44;
  const x = scale(xAxis, left, width - 16);
  const y = scale(yAxis, bottom, 12);
  const parts: string[] = [];
  for (const value of ticks(xAxis))
    parts.push(
      `<line x1="${x(value)}" x2="${x(value)}" y1="12" y2="${bottom}" class="grid"/>`,
      `<text x="${x(value)}" y="${bottom + 16}" class="tick" text-anchor="middle">${esc(xAxis.format(value))}</text>`,
    );
  for (const value of ticks(yAxis))
    parts.push(
      `<line x1="${left}" x2="${width - 16}" y1="${y(value)}" y2="${y(value)}" class="grid"/>`,
      `<text x="${left - 6}" y="${y(value) + 4}" class="tick" text-anchor="end">${esc(yAxis.format(value))}</text>`,
    );
  for (const guide of options.guides ?? []) {
    // y = k·x: sample along x and clip to the plot.
    const samples: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const xv = xAxis.log
        ? 10 ** (Math.log10(xAxis.min) + t * (Math.log10(xAxis.max) - Math.log10(xAxis.min)))
        : xAxis.min + t * (xAxis.max - xAxis.min);
      const yv = guide.k * xv;
      if (yv < yAxis.min || yv > yAxis.max) continue;
      samples.push(`${x(xv).toFixed(1)},${y(yv).toFixed(1)}`);
    }
    if (samples.length < 2) continue;
    parts.push(`<polyline points="${samples.join(" ")}" class="guide"/>`);
    const [lx, ly] = samples[samples.length - 1].split(",");
    parts.push(
      `<text x="${Number(lx) - 4}" y="${Number(ly) + 14}" class="guide-label" text-anchor="end">${esc(guide.label)}</text>`,
    );
  }
  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    if ((xAxis.log && point.x <= 0) || (yAxis.log && point.y <= 0)) continue;
    parts.push(
      `<circle cx="${x(point.x).toFixed(1)}" cy="${y(point.y).toFixed(1)}" r="${point.ring ? 5 : 3.4}"` +
        ` ${point.ring ? `fill="none" stroke="${point.color}" stroke-width="2"` : `fill="${point.color}"`}` +
        `${point.slug ? ` data-slug="${point.slug}"` : ""} data-tip="${esc(point.tip)}"/>`,
    );
  }
  parts.push(
    `<text x="${(left + width) / 2}" y="${height - 6}" class="axis-label" text-anchor="middle">${esc(options.xLabel)}</text>`,
    `<text x="14" y="${(bottom + 12) / 2}" class="axis-label" text-anchor="middle" transform="rotate(-90 14 ${(bottom + 12) / 2})">${esc(options.yLabel)}</text>`,
  );
  return `<svg class="chart scatter" viewBox="0 0 ${width} ${height}" width="100%">${parts.join("")}</svg>`;
}

export type Segment = { value: number; color: string; tip: string };

/** Horizontal stacked bars, one per row, scaled to the largest total. */
export function stacks(rows: Array<{ label: string; sub?: string; segments: Segment[]; note?: string }>) {
  const max = Math.max(...rows.map((row) => row.segments.reduce((total, segment) => total + segment.value, 0)), 1);
  return `<div class="stacks">${rows
    .map(
      (row) =>
        `<div class="stack-label">${esc(row.label)}${row.sub ? `<small>${esc(row.sub)}</small>` : ""}</div>` +
        `<div class="stack-bar">${row.segments
          .filter((segment) => segment.value > 0)
          .map(
            (segment) =>
              `<span style="flex:${segment.value} 0 0;background:${segment.color}" data-tip="${esc(segment.tip)}">${segment.value / max > 0.035 ? segment.value : ""}</span>`,
          )
          .join(
            "",
          )}<i style="flex:${max - row.segments.reduce((total, segment) => total + segment.value, 0)} 0 0"></i></div>` +
        `<div class="stack-note">${esc(row.note ?? "")}</div>`,
    )
    .join("")}</div>`;
}

/** A red-to-green colour for a rate from 0 to 1, for heat-map cells. */
export function heat(rate: number) {
  if (!Number.isFinite(rate)) return "transparent";
  const hue = Math.max(0, Math.min(1, (rate - 0.5) / 0.5)) * 125;
  return `hsl(${hue} 62% ${30 + rate * 8}%)`;
}
