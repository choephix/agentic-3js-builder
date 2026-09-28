// Renders a sample through the creature-lab harness (shared NVIDIA Chromium on :9333):
//
//   npm run snap -- <slug> <tag> [--report-only]
//
// Output lands in ~/tmp/public/nilo/agentic-3js-builder/snaps/<slug>/<B|A>/ (B with joints, A for plain objects):
// snaps/<tag>-sheet.jpg, the individual shots, <tag>-report.json, <tag>-creature.ts (the sample as rendered), out/*.glb.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Object3D } from "three";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LAB_REPO = join(homedir(), "workspace/nilo-creature-lab");
const OUT = join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");

const args = process.argv.slice(2);
const [slug, tag] = args.filter((arg) => !arg.startsWith("--"));
const sample = join(ROOT, "samples", `${slug}.ts`);
if (!slug || !existsSync(sample)) {
  console.error(`Usage: npm run snap -- <slug> <tag> [--report-only]\nNo sample at ${sample}.`);
  process.exit(2);
}

// The sample is chosen on the command line, so it can only be imported at run time.
const built: Object3D = (await import(sample)).default();
let rigged = false;
built.traverse((node) => (rigged ||= Boolean(node.userData.joint)));
const lane = rigged ? "B" : "A";
const arm = join(OUT, slug, lane);
mkdirSync(arm, { recursive: true });
const from = JSON.stringify(sample);
writeFileSync(join(arm, "creature.ts"), `export * from ${from};\nexport { default } from ${from};\n`);

const harnessArgs = ["harness/snap.ts", slug, lane, ...args.filter((arg) => arg !== slug)];
const result = spawnSync(join(LAB_REPO, "node_modules/.bin/tsx"), harnessArgs, {
  cwd: LAB_REPO,
  stdio: "inherit",
  env: { ...process.env, CREATURE_LAB_DIR: OUT },
});
const copy = join(arm, "snaps", `${tag}-creature.ts`);
if (result.status === 0 && existsSync(copy)) copyFileSync(sample, copy);
process.exit(result.status ?? 1);
