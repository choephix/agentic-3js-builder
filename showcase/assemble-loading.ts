// The assemble page (assemble.ts) reworked as a loading animation. Every model finishes assembling within a hard
// cap (0.4 / 0.8 / 1.2 s) however many parts it has; the build order and mirrored pairs still decide what comes
// first, but there is no bloom, skeleton or paint wash, and once a model is done its original materials come back.
// World mode streams all the models into a grid, building them one after another the way a world would load.
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
import { growth, modules, MODELS, pairMirrors, record } from "./assemble-shared";
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

let style: Style = "rise";
let cap = 0.8;
let mode: "single" | "world" = "single";
let models: Model[] = [];
let session = 0;

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
  await new Promise(requestAnimationFrame);
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

/** Every model into a grid, built one after another; each starts assembling the moment it is ready. */
async function showWorld() {
  clear();
  mode = "world";
  syncButtons();
  const ticket = session;
  for (const a of document.querySelectorAll("#list a")) a.classList.remove("on");
  const cols = Math.ceil(Math.sqrt(MODELS.length));
  const rows = Math.ceil(MODELS.length / cols);
  frame(cols, rows);
  titleName.textContent = "World";
  const t0 = performance.now();
  let blocked = 0;
  for (let i = 0; i < MODELS.length; i++) {
    const slug = MODELS[i][1];
    status.textContent = `building ${i + 1}/${MODELS.length}`;
    // Let the models already placed animate for a frame between builds.
    await new Promise(requestAnimationFrame);
    if (ticket !== session) return;
    const place = new Vector3((i % cols) - (cols - 1) / 2, 0, Math.floor(i / cols) - (rows - 1) / 2);
    const model = await load(slug, place);
    if (ticket !== session) return;
    blocked += model.recording.total;
    models.push(model);
    stage.add(model.holder);
    start(model, performance.now());
    stats.textContent = [
      `built    ${models.length}/${MODELS.length} in ${((performance.now() - t0) / 1000).toFixed(1)} s`,
      `blocked  ${(blocked / 1000).toFixed(1)} s of synchronous builds`,
      `assembly ${cap} s cap each`,
    ].join("\n");
  }
  status.textContent = "";
}

/** Single: assemble again. World: every model arrives again at a random moment within 2 s, as if from a cache. */
function replay() {
  const now = performance.now();
  for (const model of models) start(model, mode === "world" ? now + Math.random() * 2000 : now);
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
for (const [name, slug] of MODELS) {
  const a = document.createElement("a");
  a.textContent = name;
  a.dataset.slug = slug;
  a.href = `#${slug}`;
  list.append(a);
}

function syncButtons() {
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-mode]"))
    b.classList.toggle("on", b.dataset.mode === mode);
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-style]"))
    b.classList.toggle("on", b.dataset.style === style);
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-cap]"))
    b.classList.toggle("on", Number(b.dataset.cap) === cap);
}

for (const b of document.querySelectorAll<HTMLButtonElement>("[data-style]"))
  b.addEventListener("click", () => {
    style = b.dataset.style as Style;
    syncButtons();
    replay();
  });
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-cap]"))
  b.addEventListener("click", () => {
    cap = Number(b.dataset.cap);
    syncButtons();
    replay();
  });
document.querySelector("[data-mode=world]")!.addEventListener("click", () => {
  if (location.hash === "#world") showWorld();
  else location.hash = "world";
});
document.querySelector("[data-mode=single]")!.addEventListener("click", () => {
  location.hash = models[0]?.slug ?? MODELS[0][1];
});
document.getElementById("replay")!.addEventListener("click", replay);
addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === " ") {
    event.preventDefault();
    replay();
  }
});

function fromHash() {
  const slug = decodeURIComponent(location.hash.slice(1));
  if (slug === "world") return showWorld();
  return showSingle(`../samples/${slug}.ts` in modules ? slug : MODELS[0][1]);
}
addEventListener("hashchange", fromHash);
syncButtons();
fromHash();
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
