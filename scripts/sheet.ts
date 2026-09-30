// A collage of rendered shots, for comparing samples or versions side by side:
//
//   npm run sheet -- <slug | slug@tag> ... [--view three-quarter] [--cols N] [--out file.jpg]
//
// `slug` takes its latest rendered tag, `slug@tag` that tag (`redFox@v01 redFox@v03` compares two versions). Views are
// the single shots `npm run snap` writes: front, three-quarter, side, back, top, low, head, bones, skeleton,
// skeleton-side, flex-a, flex-b. Nothing is rendered; the shots must exist. Writes a JPEG (default
// ~/tmp/public/nilo/agentic-3js-builder/sheets/<first-slug>-<view>.jpg) with each tile labelled `slug · tag`.
// Needs ImageMagick's `montage`.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const SNAPS = join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");
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

const target = resolve(out ?? join(SNAPS, "..", "sheets", `${args[0].split("@")[0]}-${view}.jpg`));
mkdirSync(dirname(target), { recursive: true });
const columns = cols > 0 ? cols : Math.min(tiles.length, 5);
const montage = spawnSync(
  "montage",
  [
    ...tiles.flatMap((tile, i) => ["-label", `${args[i].split("@")[0]} · ${tile.tag}`, tile.file]),
    "-tile",
    `${columns}x`,
    "-geometry",
    "560x560+4+4",
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
