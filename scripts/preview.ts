// A quick look at a sample without spending a render: its textures, a parts table and, on request, two lit shots.
//
//   npm run preview -- <slug | path/to/file.ts> [--shot] [--gap <A> <B>]... [--bones <A>]... [--box <A>]...
//
// Builds the sample in the shared headless Chromium on :9333 and bakes it with the creature-lab harness's assemble(),
// so its numbers match `npm run snap`. Writes to ~/tmp/public/nilo/agentic-3js-builder/preview/<slug>/ (replaced on
// every run): textures/*.png (each svg() drawing and the baked paint sheet, v up), parts.json (the parts table and
// summary printed here) and with --shot three-quarter.png and front.png (900 px). Nothing lands in snaps/.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import type { Plugin } from "esbuild";
import type { PreviewResult } from "./preview-page";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LAB_REPO = join(homedir(), "workspace/nilo-creature-lab");
const OUT = join(homedir(), "tmp/public/nilo/agentic-3js-builder/preview");
const CDP_URL = "http://127.0.0.1:9333";
const USAGE =
  "Usage: npm run preview -- <slug | path/to/file.ts> [--shot] [--gap <A> <B>]... [--bones <A>]... [--box <A>]...";

const started = Date.now();
const args = process.argv.slice(2);
let target: string | undefined;
let shot = false;
const gaps: Array<[string, string]> = [];
const bones: string[] = [];
const boxes: string[] = [];
const usageError = (message: string): never => {
  console.error(`${message}\n${USAGE}`);
  process.exit(2);
};
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--shot") {
    shot = true;
  } else if (arg === "--gap") {
    const a = args[++i];
    const b = args[++i];
    if (!a || !b || a.startsWith("--") || b.startsWith("--")) usageError("The --gap flag needs two selectors.");
    gaps.push([a, b]);
  } else if (arg === "--bones") {
    const selector = args[++i];
    if (!selector || selector.startsWith("--")) usageError("The --bones flag needs one selector.");
    bones.push(selector);
  } else if (arg === "--box") {
    const selector = args[++i];
    if (!selector || selector.startsWith("--")) usageError("The --box flag needs one selector.");
    boxes.push(selector);
  } else if (arg.startsWith("--")) {
    usageError(`Unknown flag ${arg}.`);
  } else if (target === undefined) {
    target = arg;
  } else {
    usageError(`Unexpected argument ${arg}.`);
  }
}
if (target === undefined) usageError("A sample is required.");
const isPath = target?.endsWith(".ts") ?? false;
const sample = isPath ? resolve(process.cwd(), target) : join(ROOT, "samples", `${target}.ts`);
const slug = isPath ? basename(target, ".ts") : target;
try {
  readFileSync(sample);
} catch {
  console.error(`No sample at ${sample}.\n${USAGE}`);
  process.exit(2);
}

// `three` (and its addons) resolve to this repo's copy for the page, and to the page's global THREE for the sample,
// so sample, SDK and harness share one three.js.
const threeHere: Plugin = {
  name: "three-here",
  setup(builder) {
    builder.onResolve({ filter: /^three(\/.*)?$/ }, (args) =>
      args.resolveDir === ROOT ? undefined : builder.resolve(args.path, { resolveDir: ROOT, kind: args.kind }),
    );
    builder.onResolve({ filter: /^creature-lab\// }, (args) => ({
      path: join(LAB_REPO, "harness", `${args.path.slice("creature-lab/".length)}.ts`),
    }));
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
const [creatureBundle, pageBundle] = await Promise.all([
  // The repo's strict tsconfig makes the bundle "use strict", where an eval's `var` stays local: publish it by hand.
  build({
    ...common,
    entryPoints: [sample],
    globalName: "__creature",
    footer: { js: "globalThis.__creature = __creature;" },
    nodePaths: [join(ROOT, "node_modules")],
    plugins: [threeGlobal],
  }),
  build({ ...common, entryPoints: [join(ROOT, "scripts/preview-page.ts")], plugins: [threeHere] }),
]).catch(
  (reason: { errors?: Array<{ text: string; location?: { file: string; line: number; column: number } | null }> }) => {
    console.error("Bundling failed:");
    for (const error of reason.errors ?? []) {
      const where = error.location ? `${error.location.file}:${error.location.line}:${error.location.column} ` : "";
      console.error(`  ${where}${error.text}`);
    }
    process.exit(1);
  },
);

// Shots use WebGL, so they hold one of the harness's GPU slots (lock files naming our pid), like `npm run snap`.
let slotPath: string | null = null;
process.on("exit", () => {
  if (slotPath) rmSync(slotPath, { force: true });
});
if (shot) {
  const slotDir = join(homedir(), "tmp/public/nilo/creature-lab/.gpu-slots");
  mkdirSync(slotDir, { recursive: true });
  for (let waited = 0; !slotPath; waited++) {
    for (let i = 0; i < 3 && !slotPath; i++) {
      const path = join(slotDir, `slot-${i}`);
      try {
        writeFileSync(path, String(process.pid), { flag: "wx" });
        slotPath = path;
      } catch {
        const owner = Number(readFileSync(path, "utf8") || 0);
        let alive = false;
        try {
          alive = owner > 0 && process.kill(owner, 0);
        } catch {}
        if (!alive) rmSync(path, { force: true });
      }
    }
    if (!slotPath) {
      if (waited === 0) console.log("Waiting for a free GPU slot…");
      await setTimeout(1000);
    }
  }
}

// playwright-core lives in the lab checkout, found from the home directory like snap.ts's LAB_REPO, so its path is
// only known at run time.
const { chromium } = await import(pathToFileURL(join(LAB_REPO, "node_modules/playwright-core/index.mjs")).href);
const browser = await chromium.connectOverCDP(CDP_URL).catch((reason: Error) => {
  console.error(`Cannot reach the shared Chromium at ${CDP_URL}: ${reason.message}. Do not launch your own browser.`);
  process.exit(3);
});
const context = await browser.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
let result: PreviewResult;
try {
  const page = await context.newPage();
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setContent("<!doctype html><html><body style='margin:0'></body></html>");
  await page.addScriptTag({ content: pageBundle.outputFiles[0].text });
  result = await page
    .evaluate(
      (options) =>
        (window as unknown as { preview: { run(options: unknown): Promise<PreviewResult> } }).preview.run(options),
      { code: creatureBundle.outputFiles[0].text, shot, gaps, bones, boxes },
    )
    .catch((reason: Error) => {
      console.error(`Build failed: ${reason.message.replace(/^page\.evaluate: /, "")}`);
      for (const message of pageErrors) console.error(`  page error: ${message}`);
      process.exit(1);
    });
} finally {
  await context.close();
}

const dir = join(OUT, slug);
rmSync(dir, { recursive: true, force: true });
mkdirSync(join(dir, "textures"), { recursive: true });
const decode = (dataUrl: string) => Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
for (const texture of result.textures) writeFileSync(join(dir, "textures", texture.file), decode(texture.png));
for (const image of result.shots) writeFileSync(join(dir, `${image.name}.png`), decode(image.png));

const { parts, bounds } = result;
const size = bounds.max.map((max, axis) => Number((max - bounds.min[axis]).toFixed(3)));
const lowest = parts.length ? parts.reduce((best, part) => (part.min[1] < best.min[1] ? part : best)) : null;
const highest = parts.length ? parts.reduce((best, part) => (part.max[1] > best.max[1] ? part : best)) : null;
// Parts may sink into the floor by up to 2% of the model's height; list the ones that go deeper.
const sinkAllowance = 0.02 * (bounds.max[1] - bounds.min[1]);
const below = parts
  .filter((part) => part.min[1] < -sinkAllowance)
  .sort((a, b) => a.min[1] - b.min[1])
  .map((part) => ({ index: part.index, name: part.name, group: part.group, depth: -part.min[1] }));
writeFileSync(
  join(dir, "parts.json"),
  JSON.stringify(
    {
      slug,
      sample,
      meta: result.meta,
      rigged: result.rigged,
      partCount: parts.length,
      triangles: result.triangles,
      size,
      bounds,
      lowest: lowest && { index: lowest.index, name: lowest.name, group: lowest.group, y: lowest.min[1] },
      highest: highest && { index: highest.index, name: highest.name, group: highest.group, y: highest.max[1] },
      below,
      issues: result.issues,
      ...(result.questions ? { questions: result.questions } : {}),
      textures: result.textures.map(({ png: _, ...texture }) => texture),
      parts,
    },
    null,
    2,
  ),
);

const vec = (values: number[]) => values.map((value) => value.toFixed(3).padStart(7)).join(" ");
const columns = [
  ["#", ...parts.map((part) => String(part.index))],
  ["part", ...parts.map((part) => part.name)],
  ["group", ...parts.map((part) => part.group)],
  ["bone(s)", ...parts.map((part) => part.bones.join(",") || "-")],
  ["tris", ...parts.map((part) => String(part.triangles))],
  ["min x y z", ...parts.map((part) => vec(part.min))],
  ["max x y z", ...parts.map((part) => vec(part.max))],
];
const widths = columns.map((column) => Math.max(...column.map((cell) => cell.length)));
for (let row = 0; row <= parts.length; row++)
  console.log(
    columns
      .map((column, index) => column[row].padEnd(widths[index]))
      .join("  ")
      .trimEnd(),
  );
console.log("");
for (const issue of result.issues) console.log(`${issue.level.toUpperCase().padEnd(7)} ${issue.message}`);
console.log(
  `Parts: ${parts.length} · triangles: ${result.triangles} · size (x, y, z): ${size.join(" × ")} m · bounds min ${vec(bounds.min)} max ${vec(bounds.max)}`,
);
if (lowest && highest) {
  console.log(`Lowest: #${lowest.index} ${lowest.name} (group ${lowest.group}) at y = ${lowest.min[1].toFixed(4)}`);
  console.log(
    `Highest: #${highest.index} ${highest.name} (group ${highest.group}) at y = ${highest.max[1].toFixed(4)}`,
  );
}
console.log(
  below.length
    ? `Sunk deeper than ${(sinkAllowance * 1000).toFixed(1)} mm (2% of height) (${below.length}): ${below.map((part) => `#${part.index} ${part.name} ${(part.depth * 1000).toFixed(1)} mm`).join(", ")}`
    : `Sunk deeper than ${(sinkAllowance * 1000).toFixed(1)} mm (2% of height): none`,
);
console.log(
  `Textures (${result.textures.length}): ${result.textures.map((texture) => texture.file).join(", ") || "none"}`,
);
if (result.shots.length) console.log(`Shots: ${result.shots.map((image) => `${image.name}.png`).join(", ")}`);
else if (shot) console.log("Shots: skipped (the model has errors)");
for (const question of result.questions ?? []) (question.error ? console.error : console.log)(question.text);
console.log(`Output: ${dir}`);
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)} s (a preview, not a render)`);
const questionError = result.questions?.some((question) => question.error) ?? false;
process.exit(questionError ? 2 : result.issues.some((issue) => issue.level === "error") ? 1 : 0);
