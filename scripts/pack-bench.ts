// npm run pack-bench -- [--world N] [slug ...]
// Uses the shared Chromium, never launches or closes a browser. JSON goes only to ~/tmp-archive/pack-bench/.
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import type { Plugin } from "esbuild";
import { chromium } from "playwright-core";
import type { BenchResult, WorldResult } from "./pack-bench-page";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9333";
const USAGE = "Usage: npm run pack-bench -- [--world N] [slug ...]";
const args = process.argv.slice(2);
let worldSize = 43;
const slugs: string[] = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--world") {
    const value = args[++i];
    if (!value || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1)
      throw new Error(`--world needs a positive integer.\n${USAGE}`);
    worldSize = Number(value);
  } else if (arg.startsWith("-")) {
    throw new Error(`Unknown flag ${arg}.\n${USAGE}`);
  } else {
    slugs.push(arg);
  }
}

const files = readdirSync(join(ROOT, "samples"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts"))
  .map((entry) => entry.name)
  .sort();
if (!files.length) throw new Error("No sample TypeScript modules found");
for (const slug of slugs) if (!files.includes(`${slug}.ts`)) throw new Error(`No samples/${slug}.ts.\n${USAGE}`);
// Explicit slugs avoid bundling unrelated models. Without slugs every sample is measured, not just the world subset.
const bundledFiles = slugs.length ? files.filter((file) => slugs.includes(file.slice(0, -3))) : files;
const threeHere: Plugin = {
  name: "three-here",
  setup(builder) {
    builder.onResolve({ filter: /^three(\/.*)?$/ }, (args) =>
      args.resolveDir === ROOT ? undefined : builder.resolve(args.path, { resolveDir: ROOT, kind: args.kind }),
    );
  },
};
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
const common = {
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2022",
  logLevel: "silent",
} as const;
// One generated entry keeps SDK helpers shared across samples; namespace imports allow runtime default-function filtering.
const imports = bundledFiles.map((file, i) => `import * as sample${i} from ${JSON.stringify(`./samples/${file}`)};`);
const entries = bundledFiles.map((file, i) => `{ slug: ${JSON.stringify(file.slice(0, -3))}, module: sample${i} }`);
const [sampleBundle, pageBundle] = await Promise.all([
  build({
    ...common,
    stdin: {
      contents: `${imports.join("\n")}\nexport const samples = [${entries.join(",\n")}];`,
      resolveDir: ROOT,
      loader: "ts",
    },
    globalName: "__packBenchSamples",
    footer: { js: "globalThis.__packBenchSamples = __packBenchSamples;" },
    nodePaths: [join(ROOT, "node_modules")],
    plugins: [threeGlobal],
  }),
  build({ ...common, entryPoints: [join(ROOT, "scripts/pack-bench-page.ts")], plugins: [threeHere] }),
]);

const startedAt = new Date().toISOString();
const browser = await chromium.connectOverCDP(CDP_URL).catch((reason: Error) => {
  throw new Error(`Cannot reach shared Chromium at ${CDP_URL}: ${reason.message}. Do not launch a separate browser.`);
});
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
let result: BenchResult;
try {
  const page = await context.newPage();
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setContent("<!doctype html><html><body style='margin:0'></body></html>");
  await page.addScriptTag({ content: pageBundle.outputFiles[0].text });
  await page.addScriptTag({ content: sampleBundle.outputFiles[0].text });
  try {
    result = await page.evaluate(
      async (options) => {
        // The injected page bundle owns this in-process API; no external data is asserted here.
        const host = window as unknown as {
          packBench: { run(options: { worldSize: number; slugs: string[] }): Promise<BenchResult> };
        };
        return host.packBench.run(options);
      },
      { worldSize, slugs },
    );
  } catch (error) {
    for (const message of pageErrors) console.error(`Page error: ${message}`);
    throw error;
  }
} finally {
  // Close only the context/target we created. browser.close() would terminate the shared browser.
  await context.close();
}

const directory = join(homedir(), "tmp-archive/pack-bench");
mkdirSync(directory, { recursive: true });
const output = join(directory, `${startedAt}.json`);
writeFileSync(
  output,
  JSON.stringify({ startedAt, finishedAt: new Date().toISOString(), cdpUrl: CDP_URL, ...result }, null, 2) + "\n",
);
console.log(`WebGL renderer: ${result.gpu}`);
const rows: string[][] = [
  ["sample", "build ms", "wait ms", "pack/block≤ ms", "meshes", "draws off U/P", "draws on U/P", "atlas", "tris U/P"],
];
for (const sample of result.samples) {
  rows.push([
    sample.slug,
    sample.buildMs?.toFixed(1) ?? "-",
    sample.textureWaitMs?.toFixed(1) ?? "-",
    sample.packMs?.toFixed(1) ?? "-",
    String(sample.visibleMeshes ?? "-"),
    sample.draws ? `${sample.draws.unpacked.off.calls}/${sample.draws.packed.off.calls}` : "-",
    sample.draws ? `${sample.draws.unpacked.on.calls}/${sample.draws.packed.on.calls}` : "-",
    sample.atlas ? `${sample.atlas.width}×${sample.atlas.height}` : "-",
    sample.triangles ? `${sample.triangles.unpacked}/${sample.triangles.packed}` : "-",
  ]);
}
const widths = rows[0].map((_, i) => Math.max(...rows.map((row) => row[i].length)));
for (const row of rows)
  console.log(
    row
      .map((cell, i) => cell.padEnd(widths[i]))
      .join("  ")
      .trimEnd(),
  );
console.log(
  `\nWorld: ${result.world.included.length}/${result.world.selected.length} selected models (requested ${worldSize}); pack total ${result.world.totalPackMs.toFixed(1)} ms, longest ${result.world.longestPackMs.toFixed(1)} ms`,
);
console.log("mode        calls  triangles  geometries  textures  median ms   p95 ms");
for (const [name, metrics] of [
  ["unpacked", result.world.unpacked],
  ["packed", result.world.packed],
] as const) {
  if (!metrics) continue;
  const world: WorldResult = metrics;
  console.log(
    `${name.padEnd(10)}  ${String(world.calls).padStart(5)}  ${String(world.triangles).padStart(9)}  ${String(world.memory.geometries).padStart(10)}  ${String(world.memory.textures).padStart(8)}  ${world.medianMs.toFixed(2).padStart(9)}  ${world.p95Ms.toFixed(2).padStart(7)}`,
  );
}
if (result.longestSinglePack)
  console.log(
    `Longest single pack: ${result.longestSinglePack.slug}: ${result.longestSinglePack.ms.toFixed(1)} ms (conservative main-thread blocking upper bound; internal awaits included)`,
  );
for (const sample of result.samples) if (sample.error) console.error(`ERROR ${sample.slug}: ${sample.error}`);
if (result.skipped.length) console.log(`Skipped (no default function): ${result.skipped.join(", ")}`);
console.log(
  `Timing: render + gl.finish(), 20 warm-up + 120 measured frames per world mode. U/P = unpacked/packed; all times ms.`,
);
console.log(`JSON: ${output}`);
// CDP's connection belongs to the shared browser and can keep Node alive; do not close that browser to disconnect.
process.exit(result.samples.some((sample) => sample.error) ? 1 : 0);
