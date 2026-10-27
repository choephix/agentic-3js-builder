// A collage of rendered shots, for comparing builds, models or versions side by side:
//
//   npm run sheet -- <slug | slug@tag> ... [--title "what is compared"] [--view three-quarter] [--cols N] [--out f.jpg]
//
// `slug` takes its latest rendered tag, `slug@tag` that tag (`redFox@v01 redFox@v03` compares two versions). Views are
// the single shots `npm run snap` writes: front, three-quarter, side, back, top, low, head, bones, skeleton,
// skeleton-side, flex-a, flex-b. Nothing is rendered; the shots must exist. Writes a JPEG (default
// ~/tmp/public/nilo/agentic-3js-builder/sheets/<first-slug>-<view>.jpg).
//
// Layout. The slug and view caption the harness burns into each shot are cut off. A bake-off build's tile is labelled
// `model · effort` over `model time · output tokens · tok/s · price` (summed over its repair chain;
// `≈$` marks a price worked out from list prices because the run recorded none), with its triangle count small in the
// shot's bottom-right corner; anything else is labelled `slug · tag`. The title is --title in large type, then in
// smaller type the models compared with the arm and effort they share, and the brief when all tiles share one.
// Needs ImageMagick (`montage`, `convert`) and `omp` (model names and prices).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const SNAPS = join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");
const ROUNDS = join(import.meta.dirname, "..", "bakeoff", "rounds");
const USAGE =
  'Usage: npm run sheet -- <slug | slug@tag> ... [--title "…"] [--view three-quarter] [--cols N] [--out file.jpg]';

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const value = args[i + 1];
  if (!value || value.startsWith("--")) fail(`--${name} needs a value.`);
  args.splice(i, 2);
  return value;
};
function fail(message: string): never {
  console.error(`${message}\n${USAGE}`);
  process.exit(2);
}

const view = flag("view") ?? "three-quarter";
const cols = Number(flag("cols") ?? 0);
const out = flag("out");
const heading = flag("title");
const unknown = args.find((arg) => arg.startsWith("--"));
if (unknown) fail(`Unknown flag ${unknown}.`);
if (!args.length) fail("Name at least one sample.");

/** The snaps folder of a slug: <slug>/B/snaps for rigged samples, <slug>/A/snaps for plain objects. */
const shotsOf = (slug: string) => {
  const dirs = ["B", "A"].map((arm) => join(SNAPS, slug, arm, "snaps")).filter(existsSync);
  if (!dirs.length) fail(`${slug} has no renders in ${join(SNAPS, slug)}.`);
  return dirs;
};

const tiles = args.map((arg) => {
  const [slug, wanted] = arg.split("@");
  let best: { file: string; tag: string; time: number } | null = null;
  for (const dir of shotsOf(slug))
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(`-${view}.png`)) continue;
      const tag = name.slice(0, -`-${view}.png`.length);
      if (wanted && tag !== wanted) continue;
      const file = join(dir, name);
      const time = statSync(file).mtimeMs;
      if (!best || time > best.time) best = { file, tag, time };
    }
  if (!best) fail(`${slug} has no ${view} shot${wanted ? ` tagged ${wanted}` : ""}.`);
  return best;
});

type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  output_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number };
};
type Run = {
  from?: string;
  arm: string;
  subject: string;
  pitch?: string;
  model: string;
  effort: string;
  wallMs: number;
  costUsd?: number | null;
  usage?: Usage | null;
};
const rounds = existsSync(ROUNDS) ? readdirSync(ROUNDS) : [];
/** A bake-off build's run record and the round it is in, or null for anything else. */
const record = (slug: string) => {
  for (const round of rounds) {
    const file = join(ROUNDS, round, "runs", `${slug}.json`);
    if (slug.startsWith(round) && existsSync(file))
      return { round, run: JSON.parse(readFileSync(file, "utf8")) as Run };
  }
  return null;
};

type Price = { input: number; output: number; cacheRead: number };
const models = new Map<string, { name: string; cost?: Price }>();
try {
  const list = JSON.parse(spawnSync("omp", ["models", "--json"], { encoding: "utf8" }).stdout).models;
  for (const m of list as Array<{ selector: string; name: string; cost?: Price }>) models.set(m.selector, m);
} catch {}

const duration = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${s % 60} s`;
  return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`;
};
const thousands = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

/** A build summed over its repair chain (model time, output tokens, price), its triangles and its arm's name. */
const stats = (slug: string) => {
  const found = record(slug);
  if (!found) return null;
  const { round, run } = found;
  let wallMs = 0;
  let tokens = 0;
  let usd = 0;
  let estimated = false;
  let repairs = -1;
  for (let step: Run | undefined = run; step; step = step.from ? record(step.from)?.run : undefined) {
    const out = step.usage?.completion_tokens ?? step.usage?.output_tokens ?? 0;
    wallMs += step.wallMs;
    tokens += out;
    repairs++;
    if (step.costUsd) usd += step.costUsd;
    else {
      // Subscription runs record no price; work it out from today's list prices (per million tokens).
      const cost = models.get(step.model)?.cost;
      const cached = step.usage?.prompt_tokens_details?.cached_tokens ?? 0;
      const fresh = (step.usage?.prompt_tokens ?? 0) - cached;
      if (cost) usd += (fresh * cost.input + cached * cost.cacheRead + out * cost.output) / 1e6;
      estimated = true;
    }
  }
  const check = join(ROUNDS, round, "checks", `${slug}.json`);
  const triangles: number | undefined = existsSync(check)
    ? JSON.parse(readFileSync(check, "utf8")).report?.triangles
    : undefined;
  const arms: Array<{ id: string; name: string }> = JSON.parse(
    readFileSync(join(ROUNDS, round, "round.json"), "utf8"),
  ).arms;
  const armName = arms.find((a) => a.id === run.arm)?.name ?? run.arm;
  return { run, wallMs, tokens, usd, estimated, repairs, triangles, armName };
};

const builds = args.map((arg) => stats(arg.split("@")[0]));
const shared = (pick: (b: NonNullable<(typeof builds)[number]>) => string) => {
  const values = new Set(builds.map((b) => (b ? pick(b) : null)));
  return values.size === 1 && !values.has(null) ? [...values][0] : null;
};
const subject = shared((b) => b.run.subject);
const arm = shared((b) => b.armName);
const effort = shared((b) => b.run.effort);
const pitch = shared((b) => b.run.pitch ?? "");
const nameOf = (model: string) => models.get(model)?.name ?? model.split("/").pop()!;

// Title: what is compared, then the brief they all got.
const compared = [...new Set(builds.flatMap((b) => (b ? [nameOf(b.run.model)] : [])))].join(" vs ");
const auto = [compared, arm, effort && `${effort} effort`].filter(Boolean).join(" · ");
const brief = pitch
  ? /^Category:/.test(pitch)
    ? pitch
        .split("\n")
        .map((line) => line.replace(/^\w+:\s*/, "").replace(/\.$/, ""))
        .filter(Boolean)
        .join(" · ")
    : pitch.replace(/\s+/g, " ").slice(0, 240)
  : "";
// A --title leads; the shared arm, effort and models follow it in the smaller lines with the brief.
const titleLines = [heading, auto, brief && `Brief: ${brief}`].filter(Boolean);

const labels = builds.map((b, i) => {
  if (!b) return `${args[i].split("@")[0]} · ${tiles[i].tag}`;
  const head = [nameOf(b.run.model), !effort && b.run.effort, !subject && b.run.subject];
  // An arm that differs between tiles gets its own line, cut to what fits a 560 px tile at this type size.
  const armLine = arm ? "" : b.armName.length > 50 ? `${b.armName.slice(0, 49)}…` : b.armName;
  const price = b.usd < 0.01 ? b.usd.toFixed(3) : b.usd.toFixed(2);
  const facts = [
    duration(b.wallMs) + (b.repairs ? ` (${b.repairs} repair${b.repairs > 1 ? "s" : ""})` : ""),
    `${thousands(b.tokens)} tokens`,
    // Output tokens over model time: streaming speed, with time to first token folded in.
    `${Math.round(b.tokens / (b.wallMs / 1000))} tok/s`,
    `${b.estimated ? "≈" : ""}$${price}`,
  ];
  return [head.filter(Boolean).join(" · "), armLine, facts.join(" · ")].filter(Boolean).join("\n");
});

const target = resolve(out ?? join(SNAPS, "..", "sheets", `${args[0].split("@")[0]}-${view}.jpg`));
mkdirSync(dirname(target), { recursive: true });
const columns = cols > 0 ? cols : Math.min(tiles.length, 5);
const scratch = mkdtempSync(join(tmpdir(), "sheet-"));
const run = (command: string, argv: string[]) => {
  const result = spawnSync(command, argv, { encoding: "utf8" });
  if (result.error || result.status !== 0) {
    rmSync(scratch, { recursive: true, force: true });
    console.error(result.error?.message ?? result.stderr);
    process.exit(1);
  }
  return result.stdout;
};

// Each shot: cut the harness's burned-in bands (`slug · arm · tag` in the top 46 px, the view caption in the bottom
// 46 px), then put the triangle count small in the bottom-right corner.
const shots = tiles.map((tile, i) => {
  const [width, height] = run("identify", ["-format", "%w %h", tile.file]).split(" ").map(Number);
  const file = join(scratch, `${i}.png`);
  const triangles = builds[i]?.triangles;
  // Half the label size once the tile is scaled to 560 px.
  const corner = ["-gravity", "southeast", "-fill", "#1c2126b0", "-pointsize", `${Math.round(width / 52)}`];
  run("convert", [
    `${tile.file}[${width}x${height - 92}+0+46]`,
    "+repage",
    ...(triangles == null ? [] : [...corner, "-annotate", "+12+10", `${thousands(triangles)} tris`]),
    file,
  ]);
  return file;
});

const grid = join(scratch, "grid.png");
run("montage", [
  ...shots.flatMap((file, i) => ["-label", labels[i], file]),
  "-tile",
  `${columns}x`,
  "-geometry",
  "560x+4+4",
  "-pointsize",
  "20",
  grid,
]);
const gridWidth = run("identify", ["-format", "%w", grid]);
run("convert", [
  "-background",
  "white",
  ...titleLines.flatMap((line, i) => [
    "(",
    "-size",
    `${Number(gridWidth) - 40}x`,
    "-fill",
    i === 0 ? "#1c2126" : "#5a6470",
    "-pointsize",
    i === 0 ? "30" : "21",
    "-gravity",
    "center",
    `caption:${line}`,
    "-bordercolor",
    "white",
    "-border",
    "20x6",
    ")",
  ]),
  grid,
  "-append",
  "-quality",
  "88",
  target,
]);
rmSync(scratch, { recursive: true, force: true });
console.log(`${tiles.length} shots → ${target}`);
