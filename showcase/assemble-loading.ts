// The assemble page (assemble.ts) reworked as a loading animation. Every model finishes assembling within a hard
// cap (0.2 to 3 s) however many parts it has; the build order and mirrored pairs still decide what comes
// first, but there is no bloom, skeleton or paint wash, and once a model is done its original materials come back.
// World builds every model first, with nothing animating meanwhile, then lets them all arrive in a shuffled order.
// The model and settings live in the URL hash, so a link opens the same view.
import {
  Box3,
  BufferAttribute,
  Color,
  DirectionalLight,
  DoubleSide,
  FrontSide,
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
import type { Material, Mesh, Object3D, Texture } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { growth, hashOf, modules, MODELS, pairMirrors, readHash, record } from "./assemble-shared";
import type { Recording, SampleModule } from "./assemble-shared";

// ── Styles and timing ─────────────────────────────────────────────────────────────────────────────────────────────

/** Shader indices: rise grows each part out of its bone; ghost first stipples the whole model in, then rises; pop
 * scales parts in with a small overshoot; print sweeps one cut plane up through the model. */
const STYLES = ["rise", "ghost", "pop", "print"] as const;
type Style = (typeof STYLES)[number];
/** Share of the cap in which parts start; each part then grows for the rest. */
const SPAWN = 0.65;

const global = { uStyle: { value: 0 }, uGhost: { value: new Color("#5d7a9c") } };

const FRAGMENT_HEAD = /* glsl */ `
uniform float uK;
uniform float uCross;
uniform int uStyle;
uniform vec3 uGhost;
uniform float uFront;
uniform float uBand;
varying float vGrow;
varying float vLdY;
`;

const FRAGMENT_START = /* glsl */ `
float ldEdge = 0.0;
bool ldGhost = false;
if (uStyle == 3) {
  if (vLdY > uFront) discard;
  ldEdge = 1.0 - smoothstep(0.0, uBand, uFront - vLdY);
} else if (uStyle <= 1 && uK < 1.0) {
  float front = uK * 1.05;
  if (vGrow > front) {
    if (uStyle == 0) discard;
    if (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) > 0.3) discard;
    ldGhost = true;
  } else ldEdge = 1.0 - smoothstep(0.0, 0.08, front - vGrow);
}
`;

const FRAGMENT_END = /* glsl */ `
if (ldGhost) gl_FragColor.rgb = uGhost;
else {
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), ldEdge * 0.35);
  if (!gl_FrontFacing && uCross > 0.5) gl_FragColor.rgb *= 0.3;
}
#include <dithering_fragment>
`;

type Piece = {
  mesh: Mesh;
  original: Material | Material[];
  animated: Material | Material[] | null;
  k: { value: number };
  scale: Vector3;
  size: number;
  center: Vector3;
  /** Start as a share of the cap. */
  start: number;
};

type Model = {
  slug: string;
  name: string;
  recording: Recording;
  holder: Group;
  pieces: Piece[];
  front: { value: number };
  band: { value: number };
  bottom: number;
  top: number;
  startedAt: number;
  done: boolean;
  pairs: number;
};

function animate(original: Material, piece: Piece, model: Model): Material | null {
  const m = original as Material & {
    isMeshStandardMaterial?: boolean;
    isMeshLambertMaterial?: boolean;
    isMeshPhongMaterial?: boolean;
    isMeshBasicMaterial?: boolean;
  };
  if (!(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshBasicMaterial))
    return null;
  const material = original.clone();
  const cross = original.side === FrontSide;
  if (cross) material.side = DoubleSide;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, global, {
      uK: piece.k,
      uCross: { value: cross ? 1 : 0 },
      uFront: model.front,
      uBand: model.band,
    });
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "attribute float aGrow;\nvarying float vGrow;\nvarying float vLdY;\nvoid main() {")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvGrow = aGrow;\nvLdY = (modelMatrix * vec4(transformed, 1.0)).y;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", `${FRAGMENT_HEAD}\nvoid main() {`)
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>\n${FRAGMENT_START}`)
      .replace("#include <dithering_fragment>", FRAGMENT_END);
  };
  material.customProgramCacheKey = () => "load-1";
  return material;
}

/**
 * When each part starts, as a share of the cap: units (a call, or a call and its mirror image) in build order, each
 * given a slice of the spawn window in proportion to its size, so the big parts set the pace and runs of small ones
 * land almost together.
 */
function schedule(recording: Recording, byObject: Map<Object3D, Piece>, extent: number) {
  const units = recording.calls
    .filter((call) => call.objects.length && !call.twinOf)
    .map((call) => (call.twin ? [call, call.twin] : [call]));
  const weights = units.map((unit) =>
    Math.max(0.002, ...unit[0].objects.map((o) => (byObject.get(o)?.size ?? 0) / extent)),
  );
  const total = weights.reduce((s, w) => s + w, 0);
  let before = 0;
  units.forEach((unit, i) => {
    for (const call of unit)
      for (const object of call.objects) {
        const piece = byObject.get(object);
        if (piece) piece.start = (SPAWN * before) / total;
      }
    before += weights[i];
  });
}

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

let style: Style = "pop";
let cap = 1.2;
let mode: "single" | "world" = "single";
let models: Model[] = [];
let session = 0;
/** World: the arrival order's seed, base 36 in the URL. */
const newSeed = () => Math.floor(Math.random() * 36 ** 5);
let seed = newSeed();
/** World: every model has started arriving within this many ms. */
const WORLD_SPREAD = 2500;

/** Build one sample, measure it, and set it up to assemble; the holder scales it to a 1 m footprint at `place`. */
async function load(slug: string, place: Vector3): Promise<Model> {
  const module: SampleModule = await modules[`../samples/${slug}.ts`]!();
  const recording = record(module.default, slug);
  const textures = new Set<Texture>();
  recording.root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const map = (m as Material & { map?: Texture }).map;
      if (map) textures.add(map);
    }
  });
  await Promise.allSettled([...textures].map((t) => t.userData.ready).filter(Boolean));

  recording.root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(recording.root);
  const size = bounds.getSize(new Vector3());
  const extent = Math.max(size.x, size.y, size.z, 0.05);
  const model: Model = {
    slug,
    name: MODELS.find(([, s]) => s === slug)?.[0] ?? module.meta?.name ?? slug,
    recording,
    holder: new Group(),
    pieces: [],
    front: { value: 0 },
    band: { value: 0.02 },
    bottom: 0,
    top: 1,
    startedAt: Infinity,
    done: false,
    pairs: 0,
  };
  const cards = new Set(recording.calls.filter((c) => c.label === "cards").flatMap((c) => c.objects));
  const byObject = new Map<Object3D, Piece>();
  for (const call of recording.calls)
    for (const object of call.objects) {
      const mesh = object as Mesh;
      if (!mesh.geometry || byObject.has(mesh)) continue;
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      const piece: Piece = {
        mesh,
        original: mesh.material,
        animated: null,
        k: { value: 0 },
        scale: mesh.scale.clone(),
        size: mesh.geometry.boundingSphere!.radius * mesh.matrixWorld.getMaxScaleOnAxis(),
        center: mesh.geometry.boundingSphere!.center.clone().applyMatrix4(mesh.matrixWorld),
        start: 0,
      };
      if (mesh.isMesh) {
        mesh.geometry.setAttribute("aGrow", new BufferAttribute(growth(mesh.geometry, cards.has(mesh)), 1));
        const list = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(
          (m) => animate(m, piece, model) ?? m,
        );
        piece.animated = Array.isArray(mesh.material) ? list : list[0];
      }
      byObject.set(mesh, piece);
      model.pieces.push(piece);
    }
  pairMirrors(recording.calls, byObject, extent);
  model.pairs = recording.calls.filter((c) => c.twin).length;
  schedule(recording, byObject, extent);

  // Fit into a 1 m cell standing on the floor.
  const scale = 0.85 / extent;
  const center = bounds.getCenter(new Vector3());
  model.holder.scale.setScalar(scale);
  model.holder.position.set(place.x - center.x * scale, place.y - bounds.min.y * scale, place.z - center.z * scale);
  model.holder.add(recording.root);
  model.holder.updateMatrixWorld(true);
  model.bottom = place.y;
  model.top = place.y + size.y * scale;
  model.band.value = 0.03;
  return model;
}

function start(model: Model, at: number) {
  model.startedAt = at;
  model.done = false;
  for (const piece of model.pieces) if (piece.animated) piece.mesh.material = piece.animated;
  model.holder.visible = false;
}

function finish(model: Model) {
  model.done = true;
  model.holder.visible = true;
  for (const piece of model.pieces) {
    piece.mesh.material = piece.original;
    piece.mesh.scale.copy(piece.scale);
    piece.mesh.visible = true;
  }
}

const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const easeBack = (k: number) => 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2);

/** Smoke-script override: every unfinished model is drawn at this many seconds into its assembly. */
let held: number | null = null;

function step(model: Model, now: number) {
  const t = held ?? (now - model.startedAt) / 1000;
  if (t < 0) return;
  if (t >= cap) return finish(model);
  model.holder.visible = true;
  const grow = cap * (1 - SPAWN);
  model.front.value = model.bottom + (model.top - model.bottom) * 1.04 * easeOut(t / cap);
  for (const piece of model.pieces) {
    const k = Math.min(Math.max((t - piece.start * cap) / grow, 0), 1);
    if (style === "print") {
      piece.k.value = 1;
      piece.mesh.visible =
        piece.animated !== null || piece.center.y * model.holder.scale.y + model.holder.position.y < model.front.value;
      piece.mesh.scale.copy(piece.scale);
    } else if (style === "pop") {
      piece.k.value = 1;
      piece.mesh.visible = k > 0;
      piece.mesh.scale.copy(piece.scale).multiplyScalar(Math.max(easeBack(k), 0.001));
    } else {
      piece.k.value = easeOut(k);
      piece.mesh.visible = style === "ghost" || k > 0;
      piece.mesh.scale.copy(piece.scale);
    }
  }
}

function clear() {
  session++;
  stage.clear();
  stats.textContent = "";
  for (const model of models)
    model.recording.root.traverse((node) => {
      const mesh = node as Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) m.dispose();
    });
  for (const model of models)
    for (const piece of model.pieces)
      if (piece.animated)
        for (const m of Array.isArray(piece.animated) ? piece.animated : [piece.animated]) m.dispose();
  models = [];
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
  // Two frames, so "building…" and the spinner are on screen before the synchronous build holds this thread.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (ticket !== session) return;
  const model = await load(slug, new Vector3());
  if (ticket !== session) return;
  models = [model];
  stage.add(model.holder);
  status.textContent = "";
  stats.textContent = [
    `build    ${model.recording.total.toFixed(0)} ms (the page is blocked meanwhile)`,
    `parts    ${model.pieces.length} meshes, ${model.pairs} mirrored pairs`,
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
  let blocked = 0;
  // Kept in `models` (so leaving mid-build disposes them) but off the stage until every one is built.
  for (let i = 0; i < MODELS.length; i++) {
    const slug = MODELS[i][1];
    status.textContent = `building ${i + 1}/${MODELS.length}`;
    // Let the progress paint between builds.
    await new Promise(requestAnimationFrame);
    if (ticket !== session) return;
    const place = new Vector3((i % cols) - (cols - 1) / 2, 0, Math.floor(i / cols) - (rows - 1) / 2);
    const model = await load(slug, place);
    if (ticket !== session) return;
    blocked += model.recording.total;
    models.push(model);
    stats.textContent = [
      `building ${models.length}/${MODELS.length}, ${((performance.now() - t0) / 1000).toFixed(1)} s`,
      `blocked  ${(blocked / 1000).toFixed(1)} s of synchronous builds`,
    ].join("\n");
  }
  // Compile both material sets and upload every texture before anything moves, so neither a model's first frame
  // nor its swap back to the original materials stalls the arrival. One model at a time, off the stage but lit by the
  // scene's lights, yielding a frame whenever a frame's worth of work is done: all at once held one frame ~480 ms.
  status.textContent = "compiling shaders";
  const compiling: Promise<unknown>[] = [];
  let slice = performance.now();
  for (const model of models) {
    compiling.push(renderer.compileAsync(model.holder, camera, scene));
    for (const piece of model.pieces) {
      if (piece.animated) piece.mesh.material = piece.animated;
      for (const m of Array.isArray(piece.original) ? piece.original : [piece.original])
        for (const value of Object.values(m)) if ((value as Texture | null)?.isTexture) renderer.initTexture(value);
    }
    compiling.push(renderer.compileAsync(model.holder, camera, scene));
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
    `built    ${MODELS.length} models in ${((performance.now() - t0) / 1000).toFixed(1)} s, before any assembly`,
    `blocked  ${(blocked / 1000).toFixed(1)} s of synchronous builds`,
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
  global.uStyle.value = STYLES.indexOf(style);
  for (const model of models) if (!model.done) step(model, now);
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
  const nextStyle = (STYLES as readonly string[]).includes(params.get("style") ?? "")
    ? (params.get("style") as Style)
    : "pop";
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
    style = b.dataset.style as Style;
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
    done: models.filter((m) => m.done).length,
    status: status.textContent,
  }),
  hold: (seconds: number | null) => {
    held = seconds;
    for (const model of models) start(model, performance.now());
  },
});
