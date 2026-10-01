// Renders a sample through this repo's render harness, harness/snap.ts (shared NVIDIA Chromium on :9333):
//
//   npm run snap -- <slug | path/to/file.ts> <tag>
//   npm run snap -- <slug | path/to/file.ts> [<tag>] --report-only   (checks only, no render, tag optional)
//
// A slug names `samples/<slug>.ts`. A path renders any module with the sample contract, such as a throwaway smoke
// file under scratch/, without adding it to samples/ (which the showcase publishes); its file name is the slug.
// Output lands in ~/tmp/public/nilo/agentic-3js-builder/snaps/<slug>/<B|A>/ (B with joints, A for plain objects):
// snaps/<tag>-sheet.jpg, the individual shots, <tag>-report.json, <tag>-creature.ts (the sample as rendered), out/*.glb.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Object3D } from "three";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");

const USAGE =
  "Usage: npm run snap -- <slug | path/to/file.ts> <tag>   (a render; tag v01, v02, v03-legs, ...)\n       npm run snap -- <slug | path/to/file.ts> --report-only   (checks only, no render)";
function fail(message: string): never {
  console.error(`${message}\n${USAGE}`);
  process.exit(2);
}

const args = process.argv.slice(2);
const reportOnly = args.includes("--report-only");
const [target, given] = args.filter((arg) => !arg.startsWith("--"));
if (!target) fail("Missing <slug | path/to/file.ts>.");
if (given !== undefined && !/^v\d{2}[a-z0-9-]*$/.test(given)) fail(`Invalid tag "${given}".`);
if (!given && !reportOnly) fail("Missing <tag>.");
const tag = given ?? "v00";
const isPath = target.endsWith(".ts");
const sample = isPath ? resolve(process.cwd(), target) : join(ROOT, "samples", `${target}.ts`);
const slug = isPath ? basename(target, ".ts") : target;
if (!existsSync(sample)) fail(`No sample at ${sample}.`);

// The sample is chosen on the command line, so it can only be imported at run time.
const built: Object3D = (await import(sample)).default();
let rigged = false;
built.traverse((node) => (rigged ||= Boolean(node.userData.joint)));
const lane = rigged ? "B" : "A";
const arm = join(OUT, slug, lane);
mkdirSync(arm, { recursive: true });
const from = JSON.stringify(sample);
writeFileSync(join(arm, "creature.ts"), `export * from ${from};\nexport { default } from ${from};\n`);

const harnessArgs = ["harness/snap.ts", slug, lane, tag, ...args.filter((arg) => arg.startsWith("--"))];
const result = spawnSync(join(ROOT, "node_modules/.bin/tsx"), harnessArgs, {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, SNAPS_DIR: OUT },
});
const copy = join(arm, "snaps", `${tag}-creature.ts`);
if (!reportOnly && result.status === 0 && existsSync(copy)) copyFileSync(sample, copy);
process.exit(result.status ?? 1);
