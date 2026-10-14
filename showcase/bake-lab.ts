// Bake lab (experiment): can the page keep animating while creatures paint? Builds a set of samples one per frame
// and paints them three ways:
//   sync     today: the paint bake runs inside the sample's default(), one long task per model;
//   sliced   the bake runs on the main thread in ~10 ms slices between frames;
//   workers  a worker pool builds each sample again and sends back its sheets.
// Optionally a 1/k preview sheet (same layout) shows first. Reports time to geometry, time to final paint and frame
// gaps, and checks every final sheet and uv byte for byte against the last sync run of the same set.
import {
  Box3,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  HemisphereLight,
  NeutralToneMapping,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Material, Mesh, MeshStandardMaterial, Object3D } from "three";
import { Ctx } from "../src/context";
import { MODELS } from "./assemble-shared";
import { bake, pack, preview, sheetTexture } from "./bake-lab-sheet";
import type { Layout, Sheet } from "./bake-lab-sheet";
import type { Reply, Request } from "./bake-lab-worker";

type Mode = "sync" | "sliced" | "workers";
type Options = { set: keyof typeof SETS; preview: 0 | 2 | 4; workers: number };
export type Row = {
  mode: Mode;
  set: string;
  preview: number;
  workers: number;
  models: number;
  geometryMs: number;
  finalMs: number;
  maxGapMs: number;
  over50: number;
  over100: number;
  blockingMs: number;
  /** The longest single main-thread step: a model's build (with its preview), or a frame's draw (texture uploads). */
  slowest: string;
  identical: string;
  errors: string[];
};

const SETS = {
  heavy: ["clayWalrus", "jadeSerpent", "porcelainElephant", "ukiyoeOctopus", "scarecrow", "pixelMammoth"],
  world: MODELS.map(([, slug]) => slug),
};
/** Main-thread time per frame for sliced baking. */
const BUDGET = 10;

const modules = import.meta.glob<{ default: () => Object3D }>("../samples/*.ts");
const load = (slug: string) => modules[`../samples/${slug}.ts`]!();

// Deferred modes: reading `b.root` records the builder instead of baking.
const realBake = Ctx.prototype.bake;
let deferred: Ctx[] | null = null;
Ctx.prototype.bake = function (this: Ctx) {
  if (!deferred) return realBake.call(this);
  if (!deferred.includes(this)) deferred.push(this);
};

// ── Scene ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const host = document.getElementById("view")!;
const status = document.getElementById("status")!;
const table = document.getElementById("results")!;

const renderer = new WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = NeutralToneMapping;
host.append(renderer.domElement);
const scene = new Scene();
scene.background = new Color("#0d1015");
const camera = new PerspectiveCamera(30, 1, 0.01, 200);
const sun = new DirectionalLight(0xffffff, 2.2);
sun.position.set(3, 6, 4);
scene.add(new HemisphereLight(0xf5f1ea, 0x6d655c, 1.9), sun);
const stage = new Group();
scene.add(stage);
let grid = new GridHelper(1, 1, 0x2a3240, 0x1a2029);
scene.add(grid);
let distance = 4;

function resize() {
  renderer.setSize(host.clientWidth, host.clientHeight);
  camera.aspect = host.clientWidth / host.clientHeight;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

/** rAF timestamps: a gap between two is a frame the page couldn't draw on time. */
let frames: number[] = [];
renderer.setAnimationLoop((time: number) => {
  frames.push(time);
  const angle = time * 0.0003;
  camera.position.set(Math.sin(angle) * distance, distance * 0.55, Math.cos(angle) * distance);
  camera.lookAt(0, 0.2, 0);
  const drawStart = performance.now();
  renderer.render(scene, camera);
  note("draw", performance.now() - drawStart);
});

let slowest = { what: "", ms: 0 };
const note = (what: string, ms: number) => {
  if (ms > slowest.ms) slowest = { what, ms };
};

let longTasks: PerformanceEntry[] = [];
new PerformanceObserver((list) => longTasks.push(...list.getEntries())).observe({ type: "longtask" });

/** Resolves in a task just after the next frame is drawn. */
const nextFrame = () => new Promise<void>((done) => requestAnimationFrame(() => setTimeout(done, 0)));

function clear() {
  stage.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    for (const material of materialsOf(mesh)) {
      mapOf(material)?.dispose();
      material.dispose();
    }
  });
  stage.clear();
}

const materialsOf = (mesh: Mesh): Material[] => (Array.isArray(mesh.material) ? mesh.material : [mesh.material]);
const mapOf = (material: Material) => ("map" in material && material.map instanceof Texture ? material.map : null);

/** Scale to a 1 m footprint and put it in cell `i` of a square grid. */
function place(root: Object3D, i: number, columns: number) {
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root);
  const size = box.getSize(new Vector3());
  const scale = 0.85 / Math.max(size.x, size.y, size.z, 0.05);
  const holder = new Group();
  holder.add(root);
  root.scale.multiplyScalar(scale);
  const center = box.getCenter(new Vector3());
  root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  holder.position.set((i % columns) - (columns - 1) / 2, 0, Math.floor(i / columns) - (columns - 1) / 2);
  stage.add(holder);
}

function setMap(material: MeshStandardMaterial, texture: Texture) {
  material.map?.dispose();
  material.map = texture;
  material.needsUpdate = true;
}

// ── Worker pool ───────────────────────────────────────────────────────────────────────────────────────────────────

class Pool {
  private readonly idle: Worker[] = [];
  private readonly waiting = new Map<Worker, { resolve: (reply: Reply) => void }>();
  private readonly queue: Array<{ request: Request; resolve: (reply: Reply) => void }> = [];
  readonly workers: Worker[] = [];

  constructor(readonly size: number) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(new URL("./bake-lab-worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = ({ data }: MessageEvent<Reply>) => {
        const job = this.waiting.get(worker)!;
        this.waiting.delete(worker);
        this.idle.push(worker);
        job.resolve(data);
        this.pump();
      };
      worker.onerror = (event) => {
        const job = this.waiting.get(worker);
        this.waiting.delete(worker);
        this.idle.push(worker);
        job?.resolve({ kind: "error", message: event.message });
        this.pump();
      };
      this.workers.push(worker);
      this.idle.push(worker);
    }
  }

  /** Every worker imports the set once, so module loading isn't timed. */
  preload(slugs: string[]) {
    return Promise.all(
      this.workers.map(
        (worker) =>
          new Promise<Reply>((resolve) => {
            this.idle.splice(this.idle.indexOf(worker), 1);
            this.waiting.set(worker, { resolve });
            worker.postMessage({ kind: "preload", slugs } satisfies Request);
          }),
      ),
    );
  }

  bake(slug: string) {
    return new Promise<Reply>((resolve) => {
      this.queue.push({ request: { kind: "bake", slug }, resolve });
      this.pump();
    });
  }

  private pump() {
    while (this.idle.length && this.queue.length) {
      const worker = this.idle.pop()!;
      const job = this.queue.shift()!;
      this.waiting.set(worker, job);
      worker.postMessage(job.request);
    }
  }

  terminate() {
    for (const worker of this.workers) worker.terminate();
  }
}

let pool: Pool | null = null;

// ── A run ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/** Sync-run fingerprints per set, the reference for the other modes. */
const reference = new Map<string, Map<string, string>>();

async function run(mode: Mode, options: Options): Promise<Row> {
  clear();
  const slugs = SETS[options.set];
  const columns = Math.ceil(Math.sqrt(slugs.length));
  distance = columns * 1.15 + 1.2;
  scene.remove(grid);
  grid = new GridHelper(columns, columns, 0x2a3240, 0x1a2029);
  scene.add(grid);
  status.textContent = `${mode}: loading modules…`;
  const loaded = await Promise.all(slugs.map(load));
  if (mode === "workers") {
    if (pool?.size !== options.workers) {
      pool?.terminate();
      pool = new Pool(options.workers);
    }
    await pool.preload(slugs);
  }
  await nextFrame();
  await nextFrame();
  status.textContent = `${mode}: building ${slugs.length}…`;

  const errors: string[] = [];
  const start = performance.now();
  frames = [];
  slowest = { what: "", ms: 0 };
  longTasks = [];
  const replies = mode === "workers" ? slugs.map((slug) => pool!.bake(slug)) : [];
  const jobs: Array<{ steps: Generator<void, Sheet>; material: MeshStandardMaterial }> = [];
  const finals: Array<Promise<void>> = [];
  const roots: Array<Object3D | null> = [];

  const slice = (until: number) => {
    const sliceStart = performance.now();
    while (jobs.length && performance.now() < until) {
      const step = jobs[0].steps.next();
      if (step.done) setMap(jobs.shift()!.material, sheetTexture(step.value));
    }
    note("bake slice", performance.now() - sliceStart);
  };

  for (let i = 0; i < slugs.length; i++) {
    await nextFrame();
    const sliceStart = performance.now();
    deferred = mode === "sync" ? null : [];
    let root: Object3D | null = null;
    let builders: Ctx[] = [];
    try {
      root = loaded[i].default();
    } catch (error) {
      errors.push(`${slugs[i]}: ${error instanceof Error ? error.message : error}`);
    } finally {
      builders = (deferred ?? []).filter((ctx) => ctx.paints.length);
      deferred = null;
    }
    roots.push(root);
    if (!root) continue;
    place(root, i, columns);
    note(`build ${slugs[i]}`, performance.now() - sliceStart);
    if (mode === "sync") continue;

    const layouts: Layout[] = builders.map((ctx) => pack(ctx.paints, ctx.paintSize));
    builders.forEach((ctx, k) => {
      if (options.preview) setMap(ctx.paintMaterial(), sheetTexture(preview(layouts[k], options.preview)));
      if (mode === "sliced") jobs.push({ steps: bake(layouts[k]), material: ctx.paintMaterial() });
    });
    note(`build+pack+preview ${slugs[i]}`, performance.now() - sliceStart);
    if (mode === "workers")
      finals.push(
        replies[i].then((reply) => {
          if (reply.kind === "error") return void errors.push(`${slugs[i]} (worker): ${reply.message}`);
          const sheets = reply.sheets ?? [];
          if (sheets.length !== builders.length) return void errors.push(`${slugs[i]}: worker built other builders`);
          const applyStart = performance.now();
          builders.forEach((ctx, k) => {
            const sheet = sheets[k];
            const same =
              sheet.width === layouts[k].width &&
              sheet.height === layouts[k].height &&
              ctx.paints.every((entry, e) =>
                equal(entry.mesh.geometry.getAttribute("uv").array as Float32Array, sheet.uvs[e]),
              );
            if (!same) errors.push(`${slugs[i]}: worker layout differs from the page's`);
            setMap(ctx.paintMaterial(), sheetTexture(sheet));
          });
          note(`apply ${slugs[i]}`, performance.now() - applyStart);
        }),
      );
    if (mode === "sliced") slice(sliceStart + BUDGET);
  }
  const geometryMs = performance.now() - start;
  status.textContent = `${mode}: painting…`;
  while (jobs.length) {
    await nextFrame();
    slice(performance.now() + BUDGET);
  }
  await Promise.all(finals);
  await nextFrame();
  await nextFrame();
  const finalMs = performance.now() - start;

  const gaps = frames.slice(1).map((t, i) => t - frames[i]);
  const row: Row = {
    mode,
    set: options.set,
    preview: mode === "sync" ? 0 : options.preview,
    workers: mode === "workers" ? options.workers : 0,
    models: roots.filter(Boolean).length,
    geometryMs: Math.round(geometryMs),
    finalMs: Math.round(finalMs),
    maxGapMs: Math.round(Math.max(0, ...gaps)),
    over50: gaps.filter((g) => g > 50).length,
    over100: gaps.filter((g) => g > 100).length,
    blockingMs: Math.round(longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0)),
    slowest: `${slowest.what} ${Math.round(slowest.ms)} ms`,
    identical: "",
    errors,
  };

  status.textContent = `${mode}: checking bytes…`;
  const prints = new Map<string, string>();
  for (let i = 0; i < slugs.length; i++) if (roots[i]) prints.set(slugs[i], await fingerprint(roots[i]!));
  if (mode === "sync") {
    reference.set(options.set, prints);
    row.identical = "reference";
  } else {
    const ref = reference.get(options.set);
    row.identical = ref
      ? `${[...prints].filter(([slug, print]) => ref.get(slug) === print).length}/${prints.size}`
      : "no sync run yet";
  }
  status.textContent = `${mode}: done`;
  show(row);
  return row;
}

function equal(a: Float32Array, b: Float32Array) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && !(Number.isNaN(a[i]) && Number.isNaN(b[i]))) return false;
  return true;
}

/** Every paint sheet's texels and every painted mesh's uv, in traversal order. */
async function fingerprint(root: Object3D) {
  const parts: ArrayBufferView[] = [];
  const sheets = new Set<Texture>();
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    for (const material of materialsOf(mesh)) {
      if (material.name !== "paint") continue;
      const map = mapOf(material);
      const image: unknown = map?.image;
      if (map && !sheets.has(map) && image && typeof image === "object" && "data" in image) {
        sheets.add(map);
        if (image.data instanceof Uint8Array) parts.push(image.data);
      }
      parts.push(mesh.geometry.getAttribute("uv").array);
    }
  });
  const hashes = await Promise.all(
    parts.map((part) =>
      crypto.subtle.digest("SHA-256", new Uint8Array(part.buffer, part.byteOffset, part.byteLength).slice()),
    ),
  );
  return hashes.map((hash) => [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("")).join();
}

// ── Controls ──────────────────────────────────────────────────────────────────────────────────────────────────────

const rows: Row[] = [];
const COLUMNS: Array<[keyof Row, string]> = [
  ["mode", "Mode"],
  ["set", "Set"],
  ["preview", "Preview 1/k"],
  ["workers", "Workers"],
  ["models", "Models"],
  ["geometryMs", "All geometry (ms)"],
  ["finalMs", "All final paint (ms)"],
  ["maxGapMs", "Longest frame (ms)"],
  ["over50", "Frames > 50 ms"],
  ["over100", "Frames > 100 ms"],
  ["blockingMs", "Blocking (ms)"],
  ["slowest", "Slowest step"],
  ["identical", "Identical to sync"],
];

function show(row: Row) {
  rows.push(row);
  table.innerHTML = `<tr>${COLUMNS.map(([, label]) => `<th>${label}</th>`).join("")}</tr>${rows
    .map((r) => `<tr>${COLUMNS.map(([key]) => `<td>${r[key]}</td>`).join("")}</tr>`)
    .join("")}`;
  for (const error of row.errors) console.warn(error);
}

const field = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const options = (): Options => ({
  set: field<HTMLSelectElement>("set").value as Options["set"],
  preview: Number(field<HTMLSelectElement>("preview").value) as Options["preview"],
  workers: Math.max(1, Number(field<HTMLInputElement>("workers").value) || 1),
});
field<HTMLInputElement>("workers").value = String(Math.max(1, Math.min(8, navigator.hardwareConcurrency - 2)));

let busy = false;
async function guarded(work: () => Promise<unknown>) {
  if (busy) return;
  busy = true;
  document.body.classList.add("busy");
  try {
    await work();
  } finally {
    busy = false;
    document.body.classList.remove("busy");
  }
}
for (const mode of ["sync", "sliced", "workers"] as const)
  field(`run-${mode}`).addEventListener("click", () => guarded(() => run(mode, options())));
field("run-all").addEventListener("click", () =>
  guarded(async () => {
    for (const mode of ["sync", "sliced", "workers"] as const) await run(mode, options());
  }),
);

Object.assign(window, { __bakeLab: { run, rows, SETS } });
