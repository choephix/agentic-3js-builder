// The lab page's data (`/__lab`, lab-data.mjs) and what the page derives from it: model and arm labels and colours,
// each round's place in the story, a build's outcome, and small statistics helpers.
import type { Arm, Subject } from "./bakeoff-files";

export type LabBuild = {
  slug: string;
  round: string;
  model: string;
  effort: string;
  arm: string;
  subject: string;
  level: "terse" | "rich";
  started: string;
  wallMs: number;
  status: number;
  apiError: string | null;
  finish: string | null;
  hasCode: boolean;
  input: number | null;
  cached: number | null;
  output: number | null;
  reasoningChars: number;
  cost: number | null;
  checked: boolean;
  typeErrors: number | null;
  typeErrorSample: string[];
  rendered: boolean;
  lane: string | null;
  crash: string | null;
  crashWhere: string | null;
  parts: number | null;
  triangles: number | null;
  colors: number | null;
  textures: number | null;
  joints: number | null;
  size: [number, number, number] | null;
  errorCount: number;
  errors: string[];
  warnings: number;
  thumb: string | null;
  thumbViews: string[];
  sheet: string | null;
  shots: Record<string, string>;
  /** The exported model (the harness's static mesh GLB), for the viewer's 3D view. */
  glb: string | null;
  /** The rigged GLB (skinned mesh and bones), for wiggle and skeleton; null when the rig failed. */
  rig: string | null;
};
export type LabRound = {
  id: string;
  started: string;
  model: string;
  effort: string;
  sdkCommit?: string;
  promptsFrom?: string;
  note?: string;
  maxTokens: number;
  pricing: { input: number; output: number; cacheRead: number; cacheWrite: number } | null;
  subjects: string[];
  prompts: Record<string, number | null>;
};
export type LabSubject = Subject & { set: string };
export type LabData = {
  generated: string;
  arms: Arm[];
  subjects: LabSubject[];
  rounds: LabRound[];
  builds: LabBuild[];
};

// ── Models, arms, rounds ─────────────────────────────────────────────────────────────────────────────────────────

export const MODELS: Record<string, { name: string; short: string; color: string; maker: string }> = {
  "anthropic/claude-sonnet-5-5": { name: "Sonnet 5.5", short: "Sonnet", color: "#ff8a65", maker: "Anthropic" },
  "anthropic/claude-opus-5-5": { name: "Opus 5.5", short: "Opus", color: "#a78bfa", maker: "Anthropic" },
  "anthropic/claude-haiku-5-5": { name: "Haiku 5.5", short: "Haiku", color: "#34d399", maker: "Anthropic" },
  "openai-codex/gpt-6-astra": { name: "GPT-6 Astra", short: "Astra", color: "#60a5fa", maker: "OpenAI" },
  "openai-codex/gpt-6.1-sol": { name: "GPT-6.1 Sol", short: "Sol", color: "#facc15", maker: "OpenAI" },
};
export const model = (id: string) =>
  MODELS[id] ?? { name: id.split("/").pop() ?? id, short: id.split("/").pop() ?? id, color: "#adb5bd", maker: "" };

/** The /bakeoff page's arm colours, A to G. */
export const ARM_COLORS: Record<string, string> = {
  "source-sdk": "#e64980",
  "source-prim": "#fd7e14",
  "docs-sdk": "#4dabf7",
  "docs-prim": "#22b8cf",
  "brief-sdk": "#51cf66",
  "brief-prim": "#9775fa",
  plain: "#adb5bd",
};

/**
 * Each round in the order it ran, with the pitch set it used and the SDK its builds were checked (built and
 * rendered) on. The prompts' SDK is the pitch set's: r1's prompts carry SDK cb52341, every later set's 6cc54cd.
 */
export const ROUND_INFO: Record<
  string,
  { set: string; checkedOn: string; order: number; label?: string; note?: string }
> = {
  r1: { set: "r1", checkedOn: "cb52341", order: 1 },
  r2: { set: "r2", checkedOn: "6cc54cd", order: 2 },
  r1opus: { set: "r1", checkedOn: "6cc54cd", order: 3 },
  r1resdk: {
    set: "r1",
    checkedOn: "6cc54cd",
    order: 4,
    label: "re-checked",
    note: "Round 1's Sonnet replies, unchanged, built again on SDK 6cc54cd: a control for r1opus, which ran on the fixed SDK.",
  },
  r3: { set: "r3", checkedOn: "6cc54cd", order: 5 },
  r3opus: { set: "r3", checkedOn: "6cc54cd", order: 6 },
  r4sonnet: { set: "r4", checkedOn: "c000f88", order: 7 },
  r4opus: { set: "r4", checkedOn: "c000f88", order: 8, note: "High was the top effort available for Opus 5.5." },
  r4astra: { set: "r4", checkedOn: "c000f88", order: 9 },
  r4sol: { set: "r4", checkedOn: "c000f88", order: 10 },
  r1haiku: { set: "r1", checkedOn: "c000f88", order: 11 },
  r3haiku: { set: "r3", checkedOn: "c000f88", order: 12 },
  r4haiku: { set: "r4", checkedOn: "c000f88", order: 13 },
  r2haiku: { set: "r2", checkedOn: "c000f88", order: 14 },
  r1haikux: { set: "r1", checkedOn: "c000f88", order: 15 },
  r3haikux: { set: "r3", checkedOn: "c000f88", order: 16 },
  r2haikux: {
    set: "r2",
    checkedOn: "c000f88",
    order: 17,
    note: "Partial: stopped at 44 of 280 builds.",
  },
};
export const roundInfo = (id: string) => ROUND_INFO[id] ?? { set: id.slice(0, 2), checkedOn: "?", order: 99 };

export const SETS: Record<string, string> = {
  r1: "Round 1 pitches",
  r2: "Round 2 pitches",
  r3: "Round 3 pitches",
  r4: "Round 4 pitches",
};

/** "Sonnet medium", "Haiku xhigh", "Sonnet medium (re-checked)": what a round ran, without its pitch set. */
export function runnerLabel(round: LabRound) {
  const label = roundInfo(round.id).label;
  return `${model(round.model).short} ${round.effort}${label ? ` (${label})` : ""}`;
}

// ── Outcomes ─────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * What came of a build. `rigless`: it rendered, but failed the rig check (say, meshes on no
 * bone), so it shows as a static mesh. `nocode`: the reply had no code block (every one ran out of tokens).
 */
export type Outcome = "clean" | "rigless" | "crashed" | "nocode" | "unchecked";
export const OUTCOMES: Record<Outcome, { name: string; short: string; color: string }> = {
  clean: { name: "Rendered", short: "rendered", color: "#40c057" },
  rigless: { name: "Rendered, rig rejected", short: "no rig", color: "#f59f00" },
  crashed: { name: "Crashed", short: "crashed", color: "#fa5252" },
  nocode: { name: "Out of tokens", short: "no code", color: "#868e96" },
  unchecked: { name: "Not checked", short: "unchecked", color: "#495057" },
};
export function outcome(build: LabBuild): Outcome {
  if (!build.hasCode) return "nocode";
  if (!build.checked) return "unchecked";
  if (!build.rendered) return "crashed";
  return build.errorCount ? "rigless" : "clean";
}
export const rendered = (build: LabBuild) => build.rendered;

/** A crash message with names and numbers taken out, so the same mistake in two builds reads the same. */
export function crashClass(message: string | null) {
  if (!message) return "(no message)";
  return message
    .replace(/^Build or render failed: /, "")
    .replace(/"[^"]*"/g, "“…”")
    .replace(/\d+(\.\d+)?/g, "N")
    .replace(/; got .*$/, "")
    .replace(/(got (an?|the) [a-z]+).*$/, "$1 …")
    .replace(/edge N→N meets edge N→N/, "edges cross")
    .slice(0, 140);
}

// ── Statistics ───────────────────────────────────────────────────────────────────────────────────────────────────

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
export function quantile(values: number[], q: number) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  const at = (sorted.length - 1) * q;
  const low = Math.floor(at);
  return sorted[low] + (sorted[Math.ceil(at)] - sorted[low]) * (at - low);
}
export const median = (values: number[]) => quantile(values, 0.5);
export const mean = (values: number[]) => (values.length ? sum(values) / values.length : NaN);
/** Output tokens per second of wall time. */
export const speed = (build: LabBuild) => (build.output && build.wallMs ? build.output / (build.wallMs / 1000) : NaN);

export function groupBy<T, K>(items: T[], key: (item: T) => K) {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = groups.get(k);
    if (list) list.push(item);
    else groups.set(k, [item]);
  }
  return groups;
}

/** A group of builds in numbers. */
export function tally(builds: LabBuild[]) {
  const counts = { clean: 0, rigless: 0, crashed: 0, nocode: 0, unchecked: 0 } as Record<Outcome, number>;
  for (const build of builds) counts[outcome(build)]++;
  const costs = builds.map((build) => build.cost ?? 0);
  const walls = builds.map((build) => build.wallMs / 1000);
  return {
    n: builds.length,
    counts,
    rendered: counts.clean + counts.rigless,
    rate: builds.length ? (counts.clean + counts.rigless) / builds.length : NaN,
    cost: sum(costs),
    costPer: mean(costs),
    wallMedian: median(walls),
    wallP90: quantile(walls, 0.9),
    wallMin: Math.min(...walls),
    wallMax: Math.max(...walls),
    outputMedian: median(builds.map((build) => build.output ?? NaN)),
    speedMedian: median(builds.map(speed)),
    trianglesMedian: median(builds.filter(rendered).map((build) => build.triangles ?? NaN)),
    partsMedian: median(builds.filter(rendered).map((build) => build.parts ?? NaN)),
  };
}

// ── Formatting ───────────────────────────────────────────────────────────────────────────────────────────────────

export const money = (usd: number) =>
  !Number.isFinite(usd)
    ? "–"
    : usd >= 100
      ? `$${usd.toFixed(0)}`
      : usd >= 1
        ? `$${usd.toFixed(2)}`
        : `${(usd * 100).toFixed(1)}¢`;
export const pct = (rate: number) => (Number.isFinite(rate) ? `${Math.round(rate * 100)}%` : "–");
export function duration(seconds: number) {
  if (!Number.isFinite(seconds)) return "–";
  if (seconds < 90) return `${Math.round(seconds)} s`;
  if (seconds < 5400) return `${(seconds / 60).toFixed(seconds < 600 ? 1 : 0)} min`;
  return `${(seconds / 3600).toFixed(1)} h`;
}
export const tokens = (count: number) =>
  !Number.isFinite(count)
    ? "–"
    : count >= 1e6
      ? `${(count / 1e6).toFixed(1)}M`
      : count >= 1e3
        ? `${(count / 1e3).toFixed(count >= 1e4 ? 0 : 1)}k`
        : `${Math.round(count)}`;
export const int = (count: number | null | undefined) =>
  count === null || count === undefined || !Number.isFinite(count) ? "–" : Math.round(count).toLocaleString("en-US");
export const title = (id: string) => id.replace(/([A-Z])/g, " $1").replace(/^./, (first) => first.toUpperCase());
export const esc = (text: unknown) => String(text ?? "").replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
