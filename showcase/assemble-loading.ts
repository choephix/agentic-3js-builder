// The assemble page (assemble.ts) reworked as a loading animation, played by `src/reveal.ts`. Every model finishes
// assembling within a hard cap (0.2 to 3 s) however many parts it has; the build order and mirrored pairs still
// decide what comes first and posed joints swing into place, but there is no bloom, skeleton or paint wash, and once
// a model is done its original materials come back. World builds every model first, with nothing animating
// meanwhile, then lets them all arrive in a shuffled order. The model and settings live in the URL hash, so a link
// opens the same view.
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
  Vector3,
  WebGLRenderer,
} from "three";
import type { Mesh } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { hashOf, modules, MODELS, readHash } from "./assemble-shared";
import { recordingFrom } from "../src/record";
import type { Recording, RecordingData } from "../src/record";
import { Reveal, REVEAL_STYLES } from "../src/reveal";
import type { RevealStyle } from "../src/reveal";
import { createBuildPool } from "../src/worker";
import type { BuildPool, Built } from "../src/worker";

type Model = { slug: string; holder: Group; reveal: Reveal };

// ── The page ──────────────────────────────────────────────────────────────────────────────────────────────────────

const host = document.getElementById("view")!;
const status = document.getElementById("status")!;
const titleName = document.querySelector("#title b")!;
const stats = document.getElementById("stats")!;

const renderer = new WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = NeutralToneMapping;
host.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color("#0d1015");
const camera = new PerspectiveCamera(30, 1, 0.01, 200);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const sun = new DirectionalLight(0xffffff, 2.2);
sun.position.set(3, 6, 4);
scene.add(new HemisphereLight(0xf5f1ea, 0x6d655c, 1.9), sun);
const stage = new Group();
scene.add(stage);
const grid = new GridHelper(1, 1, 0x2a3240, 0x1a2029);
scene.add(grid);

function resize() {
  const { clientWidth: w, clientHeight: h } = host;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

let style: RevealStyle = "pop";
let cap = 1.2;
let mode: "single" | "world" = "single";
let models: Model[] = [];
let session = 0;
/** World: the arrival order's seed, base 36 in the URL. */
const newSeed = () => Math.floor(Math.random() * 36 ** 5);
let seed = newSeed();
/** World: every model has started arriving within this many ms. */
const WORLD_SPREAD = 2500;
/** Builds run in this pool of workers (src/worker.ts), so the page keeps drawing while they run. */
let pool: BuildPool | null = null;
const buildPool = () =>
  (pool ??= createBuildPool({
    spawn: () => new Worker(new URL("./assemble-worker.ts", import.meta.url), { type: "module" }),
  }));
/** Builds asked of the pool and not yet back; leaving a view closes the pool only while some are running. */
let inFlight = 0;
/** World: milliseconds per step of the last world load, for the smoke script. */
const worldSteps: Record<string, number> = {};

/** Build one sample in the pool and wait for its drawings. */
async function fromPool(slug: string): Promise<Built> {
  inFlight++;
  try {
    const built = await buildPool().build(slug);
    await built.ready;
    return built;
  } finally {
    inFlight--;
  }
}

/** Turn a pooled model's recording back into calls on its tree and set it up to assemble at `place`. */
function prepareBuilt(built: Built, slug: string, place: Vector3): Model {
  const { assembly, ...userData } = built.root.userData;
  built.root.userData = userData;
  return prepare(recordingFrom(built.root, assembly as RecordingData), slug, place);
}

/** Measure a recorded build and set it up to assemble; the holder scales it to a 1 m footprint at `place`. */
function prepare(recording: Recording, slug: string, place: Vector3): Model {
  recording.root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(recording.root);
  const size = bounds.getSize(new Vector3());
  const extent = Math.max(size.x, size.y, size.z, 0.05);
  const holder = new Group();
  const scale = 0.85 / extent;
  const center = bounds.getCenter(new Vector3());
  holder.scale.setScalar(scale);
  holder.position.set(place.x - center.x * scale, place.y - bounds.min.y * scale, place.z - center.z * scale);
  holder.add(recording.root);
  holder.updateMatrixWorld(true);
  return { slug, holder, reveal: new Reveal(recording, { style, cap }) };
}

function start(model: Model, at: number) {
  model.reveal.style = style;
  model.reveal.cap = cap;
  model.reveal.start(at);
}

function clear() {
  session++;
  stage.clear();
  stats.textContent = "";
  for (const model of models) {
    model.reveal.dispose();
    model.holder.traverse((node) => {
      const mesh = node as Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) m.dispose();
    });
  }
  models = [];
  // Builds still running belong to the view being left; an idle pool stays warm for the next one.
  if (inFlight) {
    pool?.close();
    pool = null;
  }
}

function frame(width: number, depth: number) {
  const radius = Math.hypot(width, depth, 1) / 2;
  const distance = (radius / Math.sin(((camera.fov / 2) * Math.PI) / 180)) * 0.62;
  const target = new Vector3(0, mode === "world" ? 0 : 0.3, 0);
  camera.position
    .copy(target)
    .addScaledVector(new Vector3(0.7, mode === "world" ? 0.75 : 0.35, 0.9).normalize(), distance);
  camera.near = distance / 100;
  camera.far = distance * 20;
  camera.updateProjectionMatrix();
  controls.target.copy(target);
  grid.scale.setScalar(Math.max(width, depth) * 1.6);
}

async function showSingle(slug: string) {
  clear();
  mode = "single";
  syncButtons();
  const ticket = session;
  status.textContent = "building…";
  titleName.textContent = MODELS.find(([, s]) => s === slug)?.[0] ?? slug;
  for (const a of document.querySelectorAll("#list a"))
    a.classList.toggle("on", (a as HTMLElement).dataset.slug === slug);
  frame(1, 1);
  let built: Built;
  try {
    built = await fromPool(slug);
  } catch (error) {
    if (ticket !== session) return;
    status.textContent = "";
    stats.textContent = `build failed: ${(error as Error).message}`;
    console.error(slug, error);
    return;
  }
  if (ticket !== session) return;
  const t = performance.now();
  const model = prepareBuilt(built, slug, new Vector3());
  const setup = built.ms.unpack + performance.now() - t;
  models = [model];
  stage.add(model.holder);
  status.textContent = "";
  stats.textContent = [
    `build    ${built.ms.build.toFixed(0)} ms in a worker`,
    `page     ${setup.toFixed(0)} ms of unpacking and setup on this thread`,
    `parts    ${model.reveal.parts} meshes, ${model.reveal.pairs} mirrored pairs, ${model.reveal.poses} poses`,
    `assembly ${cap} s cap`,
  ].join("\n");
  start(model, performance.now());
}

/** Every model built first, with nothing animating meanwhile; then all of them arrive in a shuffled order. */
async function showWorld() {
  clear();
  mode = "world";
  syncButtons();
  const ticket = session;
  for (const a of document.querySelectorAll("#list a"))
    a.classList.toggle("on", (a as HTMLElement).dataset.slug === "world");
  const cols = Math.ceil(Math.sqrt(MODELS.length));
  const rows = Math.ceil(MODELS.length / cols);
  frame(cols, rows);
  titleName.textContent = "World";
  const t0 = performance.now();
  let inWorkers = 0;
  let onPage = 0;
  let failed = 0;
  status.textContent = "building in workers";
  // Every build runs in the pool at once; each model is set up as it arrives. Kept in `models` (so leaving mid-build
  // disposes them) but off the stage until every one is in.
  await Promise.all(
    MODELS.map(async ([, slug], i) => {
      let built: Built;
      try {
        built = await fromPool(slug);
      } catch (error) {
        if (ticket === session) failed++;
        console.error(slug, error);
        return;
      }
      if (ticket !== session) return;
      const t = performance.now();
      const place = new Vector3((i % cols) - (cols - 1) / 2, 0, Math.floor(i / cols) - (rows - 1) / 2);
      models.push(prepareBuilt(built, slug, place));
      const setup = built.ms.unpack + performance.now() - t;
      onPage += setup;
      worldSteps.worstSetup = Math.max(worldSteps.worstSetup ?? 0, setup);
      inWorkers += built.ms.build;
      stats.textContent = [
        `building ${models.length}/${MODELS.length}, ${((performance.now() - t0) / 1000).toFixed(1)} s`,
        `page     ${(onPage / 1000).toFixed(2)} s of unpacking and setup on this thread`,
      ].join("\n");
    }),
  );
  if (ticket !== session) return;
  // Compile both material sets and upload every texture before anything moves, so neither a model's first frame
  // nor its swap back to the original materials stalls the arrival. One model at a time, off the stage but lit by the
  // scene's lights, yielding a frame whenever a frame's worth of work is done: all at once held one frame ~480 ms.
  status.textContent = "compiling shaders";
  const compiling: Promise<unknown>[] = [];
  let slice = performance.now();
  worldSteps.worstWarmup = 0;
  for (const model of models) {
    const start = performance.now();
    compiling.push(model.reveal.warm(renderer, camera, scene));
    worldSteps.worstWarmup = Math.max(worldSteps.worstWarmup, performance.now() - start);
    if (performance.now() - slice > 8) {
      await new Promise(requestAnimationFrame);
      if (ticket !== session) return;
      slice = performance.now();
    }
  }
  await Promise.all(compiling);
  if (ticket !== session) return;
  status.textContent = "";
  arrive();
  for (const model of models) stage.add(model.holder);
  stats.textContent = [
    `built    ${models.length} models in ${((performance.now() - t0) / 1000).toFixed(1)} s, before any assembly${failed ? `; ${failed} failed (console)` : ""}`,
    `page     ${(onPage / 1000).toFixed(2)} s of unpacking and setup on this thread`,
    `workers  ${(inWorkers / 1000).toFixed(1)} s of builds, side by side`,
    `arrival  shuffled over ${WORLD_SPREAD / 1000} s, ${cap} s cap each`,
  ].join("\n");
}

/** A seeded shuffle (mulberry32), so a shared link replays the same arrival order. */
function shuffled(count: number, from: number) {
  let state = from >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = [...Array(count).keys()];
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Start every world model in the seed's order, evenly spaced across the spread. */
function arrive() {
  const now = performance.now();
  shuffled(models.length, seed).forEach((index, rank) =>
    start(models[index], now + (rank * WORLD_SPREAD) / models.length),
  );
}

function replay() {
  if (mode === "world") return arrive();
  for (const model of models) start(model, performance.now());
}

renderer.setAnimationLoop(() => {
  const now = performance.now();
  for (const model of models) model.reveal.update(now);
  controls.update();
  renderer.render(scene, camera);
});

// ── Controls ──────────────────────────────────────────────────────────────────────────────────────────────────────

const list = document.getElementById("list")!;
const worldLink = document.createElement("a");
worldLink.className = "world";
worldLink.textContent = `World · all ${MODELS.length}`;
worldLink.dataset.slug = "world";
list.append(worldLink);
for (const [name, slug] of MODELS) {
  const a = document.createElement("a");
  a.textContent = name;
  a.dataset.slug = slug;
  list.append(a);
}

const shuffleButton = document.getElementById("shuffle")!;
function syncButtons() {
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-style]"))
    b.classList.toggle("on", b.dataset.style === style);
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-cap]"))
    b.classList.toggle("on", Number(b.dataset.cap) === cap);
  shuffleButton.hidden = mode !== "world";
}

const DEFAULTS = { style: "pop", cap: "1.2" };
/** The sidebar entry on show: a sample's slug, or "world". */
let shown = "";
const settings = (withSeed: boolean) => ({
  style,
  cap: String(cap),
  ...(withSeed ? { seed: seed.toString(36) } : {}),
});

/** Mirror the view and settings into the hash (without a history entry) and into the sidebar links. */
function writeHash() {
  history.replaceState(null, "", hashOf(shown, settings(shown === "world"), DEFAULTS));
  for (const a of list.querySelectorAll<HTMLAnchorElement>("a"))
    a.href = hashOf(a.dataset.slug!, settings(a.dataset.slug === "world"), DEFAULTS);
}

function applyHash() {
  const { model, params } = readHash();
  const nextStyle = REVEAL_STYLES.find((s) => s === params.get("style")) ?? "pop";
  const caps = [...document.querySelectorAll<HTMLButtonElement>("[data-cap]")].map((b) => b.dataset.cap);
  const nextCap = caps.includes(params.get("cap") ?? "") ? Number(params.get("cap")) : 1.2;
  const restyled = nextStyle !== style || nextCap !== cap;
  style = nextStyle;
  cap = nextCap;
  const target = model === "world" || `../samples/${model}.ts` in modules ? model : MODELS[0][1];
  const parsed = Number.parseInt(params.get("seed") ?? "", 36);
  const reseeded = target === "world" && Number.isFinite(parsed) && parsed !== seed;
  if (reseeded) seed = parsed;
  if (target !== shown) {
    shown = target;
    if (target === "world") showWorld();
    else showSingle(target);
  } else if (reseeded || restyled) replay();
  syncButtons();
  writeHash();
}

for (const b of document.querySelectorAll<HTMLButtonElement>("[data-style]"))
  b.addEventListener("click", () => {
    style = REVEAL_STYLES.find((s) => s === b.dataset.style) ?? "pop";
    syncButtons();
    writeHash();
    replay();
  });
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-cap]"))
  b.addEventListener("click", () => {
    cap = Number(b.dataset.cap);
    syncButtons();
    writeHash();
    replay();
  });
shuffleButton.addEventListener("click", () => {
  seed = newSeed();
  writeHash();
  replay();
});
document.getElementById("replay")!.addEventListener("click", replay);
addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === " ") {
    event.preventDefault();
    replay();
  }
});

addEventListener("hashchange", applyHash);
applyHash();
// For the smoke script: progress, and holding every model at a moment of its assembly.
Object.assign(window, {
  loading: () => ({
    mode,
    models: models.length,
    done: models.filter((m) => m.reveal.done).length,
    status: status.textContent,
    pieces: Object.fromEntries(models.map((m) => [m.slug, [m.reveal.parts, m.reveal.pairs, m.reveal.poses]])),
    steps: worldSteps,
  }),
  hold: (seconds: number | null) => {
    for (const model of models) {
      model.reveal.hold(seconds);
      start(model, performance.now());
    }
  },
});
