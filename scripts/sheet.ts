// A collage of rendered shots, for comparing samples or versions side by side:
//
//   npm run sheet -- <slug | slug@tag> ... [--view three-quarter] [--cols N] [--out file.jpg]
//
// `slug` takes its latest rendered tag, `slug@tag` that tag (`redFox@v01 redFox@v03` compares two versions). Views are
// the single shots `npm run snap` writes: front, three-quarter, side, back, top, low, head, bones, skeleton,
// skeleton-side, flex-a, flex-b. Nothing is rendered; the shots must exist. Writes a JPEG (default
// ~/tmp/public/nilo/agentic-3js-builder/sheets/<first-slug>-<view>.jpg). Each shot loses the slug and view caption the
// harness burns in. A bake-off build is labelled with its model, effort, model time (repairs included), output tokens
// and triangles, and a subject or arm all tiles share goes in the sheet's title once; anything else is labelled
// `slug · tag`. Needs ImageMagick's `montage` and `omp` (model names).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const SNAPS = join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");
const ROUNDS = join(import.meta.dirname, "..", "bakeoff", "rounds");
const USAGE = "Usage: npm run sheet -- <slug | slug@tag> ... [--view three-quarter] [--cols N] [--out file.jpg]";

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

type Run = {
  from?: string;
  arm: string;
  subject: string;
  model: string;
  effort: string;
  wallMs: number;
  usage?: { completion_tokens?: number; output_tokens?: number } | null;
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

const modelNames = (() => {
  const out = spawnSync("omp", ["models", "--json"], { encoding: "utf8" });
  const names = new Map<string, string>();
  try {
    for (const m of JSON.parse(out.stdout).models as Array<{ selector: string; name: string }>)
      names.set(m.selector, m.name);
  } catch {}
  return names;
})();

const duration = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${s % 60} s`;
  return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`;
};
const thousands = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

/** Model, effort, time and tokens of a build summed over its repair chain, and its triangles. */
const stats = (slug: string) => {
  const found = record(slug);
  if (!found) return null;
  const { round, run } = found;
  let wallMs = 0;
  let tokens = 0;
  let repairs = -1;
  for (let step: Run | undefined = run; step; step = step.from ? record(step.from)?.run : undefined) {
    wallMs += step.wallMs;
    tokens += step.usage?.completion_tokens ?? step.usage?.output_tokens ?? 0;
    repairs++;
  }
  const check = join(ROUNDS, round, "checks", `${slug}.json`);
  const triangles: number | undefined = existsSync(check)
    ? JSON.parse(readFileSync(check, "utf8")).report?.triangles
    : undefined;
  return { run, wallMs, tokens, repairs, triangles };
};

const builds = args.map((arg) => stats(arg.split("@")[0]));
const shared = (pick: (run: Run) => string) => {
  const values = new Set(builds.map((b) => (b ? pick(b.run) : null)));
  return values.size === 1 && !values.has(null) ? [...values][0] : null;
};
const subject = shared((run) => run.subject);
const arm = shared((run) => run.arm);
const title = [subject, arm].filter(Boolean).join(" · ");
const labels = builds.map((b, i) => {
  if (!b) return `${args[i].split("@")[0]} · ${tiles[i].tag}`;
  const model = modelNames.get(b.run.model) ?? b.run.model.split("/").pop()!;
  const head = [model, b.run.effort, !subject && b.run.subject, !arm && b.run.arm].filter(Boolean);
  const facts = [
    duration(b.wallMs) + (b.repairs ? ` (${b.repairs} repair${b.repairs > 1 ? "s" : ""})` : ""),
    `${thousands(b.tokens)} tokens`,
    b.triangles != null && `${thousands(b.triangles)} tris`,
  ].filter(Boolean);
  return `${head.join(" · ")}\n${facts.join(" · ")}`;
});

const target = resolve(out ?? join(SNAPS, "..", "sheets", `${args[0].split("@")[0]}-${view}.jpg`));
mkdirSync(dirname(target), { recursive: true });
const columns = cols > 0 ? cols : Math.min(tiles.length, 5);
// The harness burns `slug · arm · tag` into the top 46 px of every shot and the view caption into the bottom 46 px.
const montage = spawnSync(
  "montage",
  [
    ...tiles.flatMap((tile, i) => {
      const size = spawnSync("identify", ["-format", "%w %h", tile.file], { encoding: "utf8" }).stdout.split(" ");
      return ["-label", labels[i], `${tile.file}[${size[0]}x${Number(size[1]) - 92}+0+46]`];
    }),
    ...(title ? ["-title", title] : []),
    "-tile",
    `${columns}x`,
    "-geometry",
    "560x+4+4",
    "-pointsize",
    "20",
    "-quality",
    "88",
    target,
  ],
  { encoding: "utf8" },
);
if (montage.error || montage.status !== 0) {
  console.error(montage.error?.message ?? montage.stderr);
  process.exit(1);
}
console.log(`${tiles.length} shots → ${target}`);
