// Thumbnails for the lab page (showcase/lab.html): every bake-off build's `v01` renders from the views in `VIEWS`,
// cropped to the model and shrunk to 360 px WebPs in showcase/public/lab-thumbs/ (`<slug>.webp` for three-quarter,
// `<slug>-<view>.webp` for the rest), a cache outside git like the sidebar thumbs.
// Only missing or outdated thumbnails are drawn. Needs `cwebp`.
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const roundsDir = resolve("bakeoff/rounds");
const snapshotRoot = "/home/cx/tmp/public/nilo/agentic-3js-builder/snaps";
const out = resolve("showcase/public/lab-thumbs");
const VIEWS = ["three-quarter", "front", "side", "back", "top"];
mkdirSync(out, { recursive: true });

const jobs: Array<{ source: string; target: string }> = [];
for (const round of readdirSync(roundsDir)) {
  const checks = join(roundsDir, round, "checks");
  if (!existsSync(checks)) continue;
  for (const file of readdirSync(checks)) {
    const slug = file.replace(/\.json$/, "");
    const lane = (JSON.parse(readFileSync(join(checks, file), "utf8")) as { lane?: string }).lane;
    const dir = [lane, "A", "B"]
      .filter(Boolean)
      .map((arm) => join(snapshotRoot, slug, arm!, "snaps"))
      .find((path) => existsSync(join(path, "v01-three-quarter.png")));
    if (!dir) continue;
    for (const view of VIEWS) {
      const source = join(dir, `v01-${view}.png`);
      if (!existsSync(source)) continue;
      const target = join(out, view === "three-quarter" ? `${slug}.webp` : `${slug}-${view}.webp`);
      if (existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs) continue;
      jobs.push({ source, target });
    }
  }
}

// The harness shot is 900 px with a title above and a view label in the bottom-right corner; the middle 800 px
// square drops both.
let done = 0;
async function worker() {
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    await run(
      "cwebp",
      ["-quiet", "-q", "80", "-crop", "50", "50", "800", "800", "-resize", "360", "360"].concat([
        job.source,
        "-o",
        job.target,
      ]),
    );
    done++;
  }
}
const total = jobs.length;
await Promise.all(Array.from({ length: 12 }, worker));
console.log(`lab-thumbs: ${done} of ${total} drawn, in ${out}`);
