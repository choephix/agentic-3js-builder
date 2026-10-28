// Box check for parallel-parts builds (`parallel.fit`, see `parallelBuild` in bakeoff.ts): runs an assembled module
// through `npm run preview` with each part's meshes tagged by the part that made them, and measures every part
// against its spec box and the floor. No model call; about two seconds.
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW = join(homedir(), "tmp/public/nilo/agentic-3js-builder/preview");
const TAG = "§";
/** A mesh reaching further than this past its part's box (or below the floor) is out of place. */
export const FIT_LIMIT = 0.15;

type Vec = [number, number, number];
export type FitPart = { id: string; box: [Vec, Vec]; floor: boolean };
type Mesh = { name: string; bones: string[]; min: Vec; max: Vec };
export type Probe = {
  ms: number;
  /** Set when the module didn't build at all (bundling failed, or `build()` threw outside the parts). */
  error: string | null;
  /** Meshes by the part that made them. */
  meshes: Record<string, Mesh[]>;
  /** Parts whose function threw, with the message; the probe carries on with the next part. */
  threw: Record<string, string>;
};
type Outside = { name: string; bones: string[]; min: Vec; max: Vec; over: number; where: string[] };
export type PartFit = {
  id: string;
  meshes: number;
  /** Meshes reaching more than FIT_LIMIT past the box or below the floor. */
  outside: number;
  maxOver: number;
  bounds: [Vec, Vec] | null;
  /** For a `floor` part: its lowest point's height, when it is more than FIT_LIMIT above y = 0. */
  floats: number | null;
  threw: string | null;
  worst: Outside[];
  /** Whether the part needs a repair: something outside, or a floor part floating. */
  misfit: boolean;
};

/** The assembled module with each part's call wrapped: its meshes get `<id>§` name prefixes, a throw is caught and
 *  noted on `meta.fitThrew`, and the next part runs. `ids` are the parts in `PARTS` order. */
function probeModule(module: string, ids: string[]) {
  const parallelLine = "  for (const part of PARTS) part({ b, J, P, M });";
  const baseFirstLine = "  for (const add of PARTS) add(b);";
  const line = module.includes(parallelLine) ? parallelLine : module.includes(baseFirstLine) ? baseFirstLine : null;
  if (!line) throw new Error("not an assembled parts module");
  const call = line === parallelLine ? "part({ b, J, P, M });" : "part(b);";
  const probe = [
    `  const fitIds = ${JSON.stringify(ids)};`,
    "  const fitSeen = new Set<unknown>();",
    "  const fitThrew: Record<string, string> = {};",
    "  PARTS.forEach((part, i) => {",
    "    try {",
    `      ${call}`,
    "    } catch (error) {",
    "      fitThrew[fitIds[i]] = error instanceof Error ? error.message : String(error);",
    "    }",
    "    b.ctx.root.traverse((node) => {",
    "      if (!(node as THREE.Mesh).isMesh || fitSeen.has(node)) return;",
    "      fitSeen.add(node);",
    `      node.name = fitIds[i] + ${JSON.stringify(TAG)} + node.name;`,
    "    });",
    "  });",
    '  if (typeof meta !== "undefined") (meta as Record<string, unknown>).fitThrew = fitThrew;',
  ].join("\n");
  return module.replace(line, probe);
}

/** Builds `buildFile`'s module with part tags in the shared Chromium (through `npm run preview`) and returns each
 *  part's meshes. The probe file sits next to `builds/` at the same depth, so the module's relative imports hold. */
export async function probe(buildFile: string, ids: string[], stage: string): Promise<Probe> {
  const started = Date.now();
  const name = `${basename(buildFile, ".ts")}-${stage}`;
  const file = join(dirname(buildFile), "..", "fit", `${name}.ts`);
  const out = join(PREVIEW, name);
  mkdirSync(dirname(file), { recursive: true });
  rmSync(out, { recursive: true, force: true });
  const meshes: Record<string, Mesh[]> = Object.fromEntries(ids.map((id) => [id, []]));
  try {
    writeFileSync(file, probeModule(readFileSync(buildFile, "utf8"), ids));
    // Executor form: the project's lib (es2023) has no Promise.withResolvers.
    const run = await new Promise<{ stdout: string; stderr: string }>((resolve) =>
      execFile(
        join(ROOT, "node_modules/.bin/tsx"),
        ["scripts/preview.ts", file],
        { cwd: ROOT, timeout: 120_000, maxBuffer: 64 << 20 },
        (_error, stdout, stderr) => resolve({ stdout, stderr }),
      ),
    );
    const report = join(out, "parts.json");
    if (!existsSync(report))
      return { ms: Date.now() - started, error: (run.stderr || run.stdout).trim().slice(-2000), meshes, threw: {} };
    const previewed: {
      meta: { fitThrew?: Record<string, string> } | null;
      parts: { name: string; bones: string[]; min: (number | null)[]; max: (number | null)[] }[];
    } = JSON.parse(readFileSync(report, "utf8"));
    for (const part of previewed.parts) {
      const at = part.name.indexOf(TAG);
      const id = at > 0 ? part.name.slice(0, at) : null;
      if (!id || !meshes[id] || part.min.some((v) => v == null) || part.max.some((v) => v == null)) continue;
      meshes[id].push({ name: part.name.slice(at + 1), bones: part.bones, min: part.min as Vec, max: part.max as Vec });
    }
    return { ms: Date.now() - started, error: null, meshes, threw: previewed.meta?.fitThrew ?? {} };
  } finally {
    rmSync(file, { force: true });
    rmSync(out, { recursive: true, force: true });
  }
}

const AXES = ["x", "y", "z"];
const num = (v: number) => Number(v.toFixed(2));

/** Each part's meshes against its box and the floor. */
export function measure(parts: FitPart[], probed: Probe): PartFit[] {
  return parts.map((part) => {
    const meshes = probed.meshes[part.id] ?? [];
    // A spec part without a box is held to the floor only.
    const [lo, hi] = part.box ?? [
      [-Infinity, -Infinity, -Infinity],
      [Infinity, Infinity, Infinity],
    ];
    const outside: Outside[] = [];
    for (const mesh of meshes) {
      const where: string[] = [];
      let over = 0;
      for (let a = 0; a < 3; a++) {
        const below = lo[a] - mesh.min[a];
        const above = mesh.max[a] - hi[a];
        if (below > FIT_LIMIT) where.push(`${num(below)} m past the box's -${AXES[a]} face (${AXES[a]} = ${lo[a]})`);
        if (above > FIT_LIMIT) where.push(`${num(above)} m past the box's +${AXES[a]} face (${AXES[a]} = ${hi[a]})`);
        over = Math.max(over, below, above);
      }
      if (-mesh.min[1] > FIT_LIMIT && lo[1] >= 0) where.push(`${num(-mesh.min[1])} m below the floor (y = 0)`);
      over = Math.max(over, -mesh.min[1]);
      if (over > FIT_LIMIT) outside.push({ ...mesh, over: num(over), where });
    }
    outside.sort((a, b) => b.over - a.over);
    const bounds: [Vec, Vec] | null = meshes.length
      ? [
          [0, 1, 2].map((a) => Math.min(...meshes.map((m) => m.min[a]))) as Vec,
          [0, 1, 2].map((a) => Math.max(...meshes.map((m) => m.max[a]))) as Vec,
        ]
      : null;
    const floats = part.floor && bounds && bounds[0][1] > FIT_LIMIT ? num(bounds[0][1]) : null;
    const threw = probed.threw[part.id] ?? null;
    return {
      id: part.id,
      meshes: meshes.length,
      outside: outside.length,
      maxOver: outside[0]?.over ?? 0,
      bounds,
      floats,
      threw,
      worst: outside.slice(0, 20),
      misfit: !threw && meshes.length > 0 && (outside.length > 0 || floats != null),
    };
  });
}

const vec = (v: Vec) => `[${v.map((x) => x.toFixed(2)).join(", ")}]`;

/** The `{measured}` paragraph of the fit prompt: the part's span, the meshes outside its box, the floor. */
export function measuredText(fit: PartFit) {
  const lines = [`Measured: your part spans min ${vec(fit.bounds![0])} to max ${vec(fit.bounds![1])}.`];
  if (fit.outside) {
    lines.push(
      `${fit.outside} of its ${fit.meshes} meshes reach more than ${FIT_LIMIT * 100} cm outside the box` +
        (fit.outside > fit.worst.length ? `; the ${fit.worst.length} furthest` : "") +
        " (mesh, its bone, its min and max corners, how far past which face):",
      "",
      ...fit.worst.map(
        (m) =>
          `- \`${m.name}\`${m.bones[0] ? ` on ${m.bones[0]}` : ""}: min ${vec(m.min)}, max ${vec(m.max)}; ${m.where.join(", ")}`,
      ),
    );
  }
  if (fit.floats != null)
    lines.push(
      "",
      `Your part rests on the floor, and its lowest point is at y = ${fit.floats}: it comes down to stand on y = 0.`,
    );
  return lines.join("\n");
}
