// The render harness behind `npm run snap` (scripts/snap.ts picks the lane and calls this):
//
//   node_modules/.bin/tsx harness/snap.ts <slug> <A|B> <tag> [--report-only]
//
// Bundles <snaps>/<slug>/<lane>/creature.ts with esbuild, runs it in the shared NVIDIA headless Chromium
// (CDP :9333), bakes it into one mesh, renders the review shots and writes:
//   <lane>/snaps/<tag>-<shot>.png, <tag>-sheet.jpg, <tag>-report.json, <tag>-creature.ts
//   <lane>/out/<slug>.glb (lane A) or <slug>-rigged.glb + <slug>-mesh.glb (lane B)
// and refreshes the progress gallery <snaps>/index.html. <snaps> is SNAPS_DIR, default
// ~/tmp/public/nilo/agentic-3js-builder/snaps. Copied from the Creature Lab's harness (nilo-creature-lab
// 12f5eb6); this repo owns its copy. The GPU slot lock files stay in the Creature Lab's folder, because both
// projects render on the same GPU and must share the slots.
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { setTimeout } from "node:timers/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import type { Plugin } from "esbuild";
import { chromium } from "playwright-core";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const LAB = process.env.SNAPS_DIR ?? join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");
/** Shared with the Creature Lab and `npm run preview`: every render on this GPU takes a slot here. */
const GPU_SLOT_DIR = join(homedir(), "tmp/public/nilo/creature-lab/.gpu-slots");
const CDP_URL = "http://127.0.0.1:9333";
const ARMS = ["A", "B", "C"];

function usage(message: string): never {
  console.error(`${message}\nUsage: snap.ts <slug> <A|B|C> <tag> [--report-only]`);
  process.exit(2);
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const [slug, arm, tag] = args.filter((arg) => !arg.startsWith("--"));
if (!slug || !/^[A-Za-z0-9]+$/.test(slug)) usage("Missing or invalid <slug>.");
if (!arm || !ARMS.includes(arm)) usage("Missing or invalid <arm>; use A, B or C.");
const reportOnly = flags.has("--report-only");
if (!tag || !/^v\d{2}[a-z0-9-]*$/.test(tag))
  usage("Missing or invalid <tag>; use v01, v02, ... (optionally v03-legs).");
for (const flag of flags) if (flag !== "--report-only") usage(`Unknown flag ${flag}.`);

const armDir = join(LAB, slug, arm);
const entry = join(armDir, "creature.ts");
const snapsDir = join(armDir, "snaps");
const outDir = join(armDir, "out");
await stat(entry).catch(() => usage(`No creature module at ${entry}.`));
if (!reportOnly && (await stat(join(snapsDir, `${tag}-sheet.jpg`)).catch(() => null)))
  usage(`Tag ${tag} already exists for ${slug}/${arm}; never reuse a tag, pick the next one.`);

/** `three` resolves to the page's global THREE, so creature and harness share one copy. */
const threeGlobal: Plugin = {
  name: "three-global",
  setup(builder) {
    builder.onResolve({ filter: /^three$/ }, () => ({ path: "three", namespace: "three-global" }));
    builder.onLoad({ filter: /.*/, namespace: "three-global" }, () => ({
      contents: "module.exports = globalThis.THREE;",
      loader: "js",
    }));
  },
};

const started = Date.now();
const creatureBundle = await build({
  entryPoints: [entry],
  bundle: true,
  write: false,
  format: "iife",
  globalName: "__creature",
  platform: "browser",
  target: "es2022",
  nodePaths: [join(REPO, "node_modules")],
  plugins: [threeGlobal],
  logLevel: "silent",
}).catch(
  (reason: { errors?: Array<{ text: string; location?: { file: string; line: number; column: number } | null }> }) => {
    console.error("Bundling creature.ts failed:");
    for (const error of reason.errors ?? []) {
      const where = error.location ? `${error.location.file}:${error.location.line}:${error.location.column} ` : "";
      console.error(`  ${where}${error.text}`);
    }
    process.exit(1);
  },
);
const harnessBundle = await build({
  entryPoints: [join(REPO, "harness/page.ts")],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2022",
  logLevel: "silent",
});

// Many builders share one browser on a GPU with little free memory; too many
// concurrent WebGL renders exhaust it and Chromium blocks WebGL for everyone.
// Hold one of a few slots (lock files naming our pid) while rendering.
const GPU_SLOTS = 3;
const slotDir = GPU_SLOT_DIR;
await mkdir(slotDir, { recursive: true });
let slotPath: string | null = null;
const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
process.on("exit", () => {
  if (slotPath) rmSync(slotPath, { force: true });
});
for (let waited = 0; !slotPath; waited++) {
  for (let i = 0; i < GPU_SLOTS && !slotPath; i++) {
    const path = join(slotDir, `slot-${i}`);
    try {
      await writeFile(path, String(process.pid), { flag: "wx" });
      slotPath = path;
    } catch {
      const owner = Number(await readFile(path, "utf8").catch(() => "0"));
      if (owner && !alive(owner)) await rm(path, { force: true });
    }
  }
  if (!slotPath) {
    if (waited === 0) console.log("Waiting for a free GPU slot…");
    await setTimeout(1000);
  }
}

const browser = await chromium.connectOverCDP(CDP_URL).catch((reason: Error) => {
  console.error(
    `Cannot reach the shared NVIDIA Chromium at ${CDP_URL}: ${reason.message}. Tell the orchestrator; do not launch your own browser.`,
  );
  process.exit(3);
});
const context = await browser.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });

type Report = {
  parts: number;
  triangles: number;
  vertices: number;
  colors: number;
  textures: number;
  atlas: { size: number; tiles: number; alpha: boolean };
  size: number[];
  bounds: { min: number[]; max: number[] };
  groups: Array<{ name: string; parts: number }>;
  joints: Array<{ name: string; parent: string | null; depth: number; position: number[]; parts: number }>;
  headParts: number;
  stiff: Array<{ part: string; group: string; bone: string; share: number; joints: string[] }>;
  fine: Array<{ part: string; triangles: number; edge: number }>;
  fineEdge: number;
  loose: {
    tolerance: number;
    clusters: Array<{
      parts: Array<{ name: string; group: string; bone: string | null; shape: string; triangles: number }>;
      count: number;
      area: number;
      gap: number;
      nearest: { name: string; shape: string; group: string; bone: string | null };
      label: string;
      flat: boolean;
      points: { cluster: number[]; main: number[] };
      onFloor: boolean;
    }>;
  };
  looseMs: number;
  measureMs: number;
  issues: Array<{ level: string; message: string }>;
};
type Result = {
  report: Report;
  shots: Array<{ name: string; caption: string; png: string }>;
  sheet: string | null;
  /** The texture atlas, v up, as a PNG data URL. */
  atlas: string | null;
  glb: Record<string, string>;
};

let result: Result;
try {
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.setContent("<!doctype html><html><body style='margin:0;background:#d5dadf'></body></html>");
  await page.addScriptTag({ content: harnessBundle.outputFiles[0].text });
  const gpu = await page.evaluate(() => (window as unknown as { lab: { gpu(): string } }).lab.gpu());
  if (!/nvidia/i.test(gpu)) {
    console.error(`GPU gate failed: renderer is "${gpu}", not NVIDIA. Tell the orchestrator.`);
    process.exit(3);
  }
  result = await page
    .evaluate(
      (options) => (window as unknown as { lab: { run(options: unknown): Promise<Result> } }).lab.run(options),
      { code: creatureBundle.outputFiles[0].text, arm, slug, tag, reportOnly },
    )
    .catch((reason: Error) => {
      console.error(`Build or render failed: ${reason.message.replace(/^page\.evaluate: /, "")}`);
      for (const message of consoleErrors) console.error(`  page error: ${message}`);
      process.exit(1);
    });
  console.log(`Renderer: ${gpu}`);
} finally {
  await context.close();
}

const { report } = result;
const round = (value: number) => Number(value.toFixed(3));
const errors = report.issues.filter((issue) => issue.level === "error");
const warnings = report.issues.filter((issue) => issue.level === "warning");
console.log(`Issues: ${errors.length} error(s), ${warnings.length} warning(s)`);
for (const issue of report.issues) console.log(`  ${issue.level.toUpperCase().padEnd(7)} ${issue.message}`);
console.log(
  `Parts: ${report.parts} · triangles: ${report.triangles} · vertices: ${report.vertices} · colors: ${report.colors} · textures: ${report.textures} · atlas: ${report.atlas.size} px, ${report.atlas.tiles} tile(s)${report.atlas.alpha ? ", cut-out" : ""}`,
);
if (report.fine.length) {
  const mm = (m: number) => `${Math.round(m * 1000)} mm`;
  const fineTris = report.fine.reduce((sum, entry) => sum + entry.triangles, 0);
  console.log(
    `Fine meshes (${report.fine.length} parts, ${fineTris} triangles; mean edge under ${mm(report.fineEdge)}, 1/150 of the model's diagonal):`,
  );
  for (const entry of report.fine.slice(0, 12))
    console.log(`  ${entry.part}: ${entry.triangles} triangles, mean edge ${mm(entry.edge)}`);
  if (report.fine.length > 12) console.log(`  … ${report.fine.length - 12} more`);
}
if (report.loose.clusters.length) {
  const mm = (m: number) => `${Math.round(m * 1000)} mm`;
  console.log(
    `Loose parts (clusters touching nothing within ${mm(report.loose.tolerance)} of the main body; ${report.loose.clusters.length}, largest gap first):`,
  );
  for (const entry of report.loose.clusters.slice(0, 8)) {
    const floor = entry.onFloor ? "; rests on the floor" : "";
    const near = entry.nearest;
    console.log(
      `  ${entry.label}: ${mm(entry.gap)} from ${near.group} (${near.name}${near.bone ? ` on ${near.bone}` : ""})${floor}`,
    );
  }
  if (report.loose.clusters.length > 8) console.log(`  … ${report.loose.clusters.length - 8} more (largest gap first)`);
}
if (report.stiff.length) {
  console.log(
    `Stiff parts (large parts moved by one bone while joints below that bone pivot inside them; ${report.stiff.length}):`,
  );
  for (const entry of report.stiff.slice(0, 8))
    console.log(
      `  ${entry.part} (group ${entry.group}): ${Math.round(entry.share * 100)}% on ${entry.bone}; inside it but not moving it: ${entry.joints.join(", ")}`,
    );
  if (report.stiff.length > 8) console.log(`  … ${report.stiff.length - 8} more`);
}
console.log(
  `Size (x, y, z): ${report.size.map(round).join(" × ")} m · bounds min ${JSON.stringify(report.bounds.min.map(round))} max ${JSON.stringify(report.bounds.max.map(round))}`,
);
console.log(
  `Groups (${report.groups.length}): ${report.groups.map((group) => `${group.name}(${group.parts})`).join(", ")}`,
);
console.log(
  report.headParts
    ? `Head close-up: ${report.headParts} parts matched`
    : "Head close-up: no parts tagged head/skull/face/jaw/snout/muzzle/beak/mouth; shot skipped",
);
if (report.joints.length) {
  console.log(`Skeleton (${report.joints.length} joints; parts per bone in brackets):`);
  for (const joint of report.joints)
    console.log(
      `  ${"  ".repeat(joint.depth)}${joint.name} [${joint.parts}] @ ${JSON.stringify(joint.position.map(round))}`,
    );
}
if (errors.length) process.exit(1);
if (reportOnly) process.exit(0);

await mkdir(snapsDir, { recursive: true });
await mkdir(outDir, { recursive: true });
const decode = (dataUrl: string) => Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
for (const shot of result.shots) await writeFile(join(snapsDir, `${tag}-${shot.name}.png`), decode(shot.png));
const sheetPath = join(snapsDir, `${tag}-sheet.jpg`);
await writeFile(sheetPath, decode(result.sheet!));
if (result.atlas) await writeFile(join(snapsDir, `${tag}-atlas.png`), decode(result.atlas));
await writeFile(join(snapsDir, `${tag}-report.json`), JSON.stringify(report, null, 2));
await copyFile(entry, join(snapsDir, `${tag}-creature.ts`));
for (const [name, base64] of Object.entries(result.glb))
  await writeFile(join(outDir, name), Buffer.from(base64, "base64"));

console.log(`Contact sheet (view this first): ${sheetPath}`);
console.log(`Shots: ${result.shots.map((shot) => shot.name).join(", ")} (900px PNGs in ${snapsDir})`);
if (result.atlas) console.log(`Texture atlas: ${join(snapsDir, `${tag}-atlas.png`)}`);
console.log(
  `GLB: ${Object.keys(result.glb)
    .map((name) => join(outDir, name))
    .join(", ")}`,
);
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)} s`);

await writeGallery();
process.exit(0);

async function writeGallery() {
  const slugs = (await readdir(LAB, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const sections: string[] = [];
  for (const creature of slugs) {
    const title =
      (await readFile(join(LAB, creature, "BRIEF.md"), "utf8").catch(() => "")).match(/^#\s+(.+)$/m)?.[1] ?? creature;
    const columns: string[] = [];
    for (const lane of ARMS) {
      const files = await readdir(join(LAB, creature, lane, "snaps")).catch(() => [] as string[]);
      const tags = files
        .filter((file) => file.endsWith("-sheet.jpg"))
        .map((file) => file.slice(0, -"-sheet.jpg".length))
        .sort()
        .reverse();
      columns.push(
        `<div class="arm"><h3>Arm ${lane} <small>${tags.length} rounds</small></h3>${tags
          .map(
            (t) =>
              `<a href="${creature}/${lane}/snaps/${t}-sheet.jpg"><img loading="lazy" src="${creature}/${lane}/snaps/${t}-sheet.jpg"><span>${t}</span></a>`,
          )
          .join("")}</div>`,
      );
    }
    sections.push(
      `<section><h2>${title} <small>${creature}</small></h2><div class="arms">${columns.join("")}</div></section>`,
    );
  }
  await writeFile(
    join(LAB, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Snapshots</title><style>body{font:15px system-ui;background:#15181b;color:#e8eaed;margin:24px}h2{margin:32px 0 8px}small{color:#8a939c;font-weight:400}.arms{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.arm a{display:block;position:relative;margin-bottom:8px}.arm img{width:100%;display:block;border-radius:4px}.arm span{position:absolute;left:6px;top:6px;background:#000a;padding:2px 6px;border-radius:3px}</style><h1>Snapshots</h1><p>Newest round first. A = plain object, B = rigged.</p>${sections.join("")}`,
  );
}
