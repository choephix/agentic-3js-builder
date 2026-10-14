// The assemble page: build a sample once while recording every builder call (which joints and meshes it added, and when),
// then play the finished creature back in that order: skeleton first, each helper call's parts growing out of their
// bones with a glowing edge, fur batches sprouting card by card, and the paint sheet washing over at the end.
// Nothing here touches the SDK's files: the recorder wraps prototypes for the duration of one build.
import {
  AdditiveBlending,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  FrontSide,
  GridHelper,
  Group,
  HemisphereLight,
  LineSegments,
  Mesh,
  NeutralToneMapping,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  ShadowMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Material, Texture } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { growth, hashOf, modules, MODELS, pairMirrors, readHash, record } from "./assemble-shared";
import type { Call, Recording } from "./assemble-shared";

// ── The animated material ─────────────────────────────────────────────────────────────────────────────────────────

const GLOW = new Color("#ffc46b");
const shared = {
  uWash: { value: 0 },
  uWashSpan: { value: new Vector2(0, 1) },
  uWashFreq: { value: 3 },
  uClay: { value: new Color("#d9d1c3") },
  uGlow: { value: GLOW },
  uPaintGlow: { value: new Color("#ffd9ef") },
};

const FRAGMENT_HEAD = /* glsl */ `
uniform float uGrow;
uniform float uCross;
uniform float uWashable;
uniform float uWash;
uniform vec2 uWashSpan;
uniform float uWashFreq;
uniform vec3 uClay;
uniform vec3 uGlow;
uniform vec3 uPaintGlow;
varying float vGrow;
varying vec3 vAsmWorld;
float asmHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float asmNoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(asmHash(i), asmHash(i + vec3(1, 0, 0)), f.x), mix(asmHash(i + vec3(0, 1, 0)), asmHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(asmHash(i + vec3(0, 0, 1)), asmHash(i + vec3(1, 0, 1)), f.x), mix(asmHash(i + vec3(0, 1, 1)), asmHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
`;

const FRAGMENT_START = /* glsl */ `
if (vGrow > uGrow) discard;
if (!gl_FrontFacing && uCross > 0.5 && uGrow >= 1.0) discard;
float asmEdge = uGrow < 1.0 ? 1.0 - smoothstep(0.0, 0.06, uGrow - vGrow) : 0.0;
float asmN = asmNoise(vAsmWorld * uWashFreq) * 0.6 + asmNoise(vAsmWorld * uWashFreq * 3.7) * 0.4;
float asmW = clamp((uWashSpan.y - vAsmWorld.y) / max(uWashSpan.y - uWashSpan.x, 1e-4), 0.0, 1.0) * 0.82 + asmN * 0.18;
float asmWashed = uWashable > 0.5 ? smoothstep(asmW - 0.012, asmW + 0.012, uWash) : 1.0;
float asmFront = uWashable > 0.5 ? exp(-abs(uWash - asmW) * 55.0) * (1.0 - smoothstep(1.0, 1.06, uWash)) : 0.0;
`;

type Piece = {
  object: Object3D;
  materials: Material[];
  grow: { value: number }[];
  washable: { value: number }[];
  painted: boolean;
  cards: boolean;
  scale: Vector3;
  /** World bounding-sphere radius and centre, measured once the finished model is staged. */
  size: number;
  center: Vector3;
};

function animated(original: Material, cards: boolean): [Material, { value: number }, { value: number }] | null {
  const m = original as Material & {
    isMeshStandardMaterial?: boolean;
    isMeshBasicMaterial?: boolean;
    isMeshLambertMaterial?: boolean;
    isMeshPhongMaterial?: boolean;
  };
  if (!(m.isMeshStandardMaterial || m.isMeshBasicMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial))
    return null;
  const material = original.clone();
  const grow = { value: 0 };
  const washable = { value: 0 };
  const cross = original.side === FrontSide && !cards;
  if (cross) material.side = DoubleSide;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, { uGrow: grow, uWashable: washable, uCross: { value: cross ? 1 : 0 } });
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "attribute float aGrow;\nvarying float vGrow;\nvarying vec3 vAsmWorld;\nvoid main() {")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvGrow = aGrow;\nvAsmWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", `${FRAGMENT_HEAD}\nvoid main() {`)
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>\n${FRAGMENT_START}`)
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.rgb = mix(uClay, diffuseColor.rgb, asmWashed);",
      )
      .replace(
        "#include <dithering_fragment>",
        `gl_FragColor.rgb += uGlow * asmEdge * 2.6 + uPaintGlow * asmFront * 1.4;
if (!gl_FrontFacing && uCross > 0.5) gl_FragColor.rgb = uGlow * 0.9;
#include <dithering_fragment>`,
      );
  };
  material.customProgramCacheKey = () => "assemble-1";
  return [material, grow, washable];
}

function prepare(object: Object3D, cards: boolean): Piece {
  const piece: Piece = {
    object,
    materials: [],
    grow: [],
    washable: [],
    painted: false,
    cards,
    scale: object.scale.clone(),
    size: 0,
    center: new Vector3(),
  };
  const mesh = object as Mesh;
  if (!mesh.isMesh) return piece;
  mesh.geometry.setAttribute("aGrow", new BufferAttribute(growth(mesh.geometry, cards), 1));
  const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const next = list.map((original) => {
    if (original.name === "paint") piece.painted = true;
    const made = animated(original, cards);
    if (!made) return original;
    piece.materials.push(original);
    piece.grow.push(made[1]);
    piece.washable.push(made[2]);
    return made[0];
  });
  mesh.material = Array.isArray(mesh.material) ? next : next[0];
  mesh.castShadow = true;
  return piece;
}

// ── The skeleton ──────────────────────────────────────────────────────────────────────────────────────────────────

type Skeleton = {
  group: Group;
  uniforms: {
    uTime: { value: number };
    uDur: { value: number };
    uFade: { value: number };
    uColor: { value: Color };
    uPx: { value: number };
  };
  size: number;
};

function skeleton(joints: Array<{ joint: Object3D; t0: number }>, extent: number): Skeleton {
  const index = new Map(joints.map((j) => [j.joint, j]));
  const parentOf = (joint: Object3D) => {
    for (let node = joint.parent; node; node = node.parent) if (index.has(node)) return node;
    return null;
  };
  const position: number[] = [];
  const from: number[] = [];
  const time: number[] = [];
  const dots: number[] = [];
  const dotTime: number[] = [];
  const a = new Vector3();
  const b = new Vector3();
  for (const { joint, t0 } of joints) {
    joint.getWorldPosition(b);
    dots.push(b.x, b.y, b.z);
    dotTime.push(t0);
    const parent = parentOf(joint);
    if (!parent) continue;
    parent.getWorldPosition(a);
    position.push(a.x, a.y, a.z, b.x, b.y, b.z);
    from.push(a.x, a.y, a.z, a.x, a.y, a.z);
    time.push(t0, t0);
  }
  const uniforms = {
    uTime: { value: 0 },
    uDur: { value: 0.35 },
    uFade: { value: 1 },
    uColor: { value: new Color("#7fd8ff") },
    uPx: { value: 1 },
  };
  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute("position", new Float32BufferAttribute(position, 3));
  lineGeometry.setAttribute("aFrom", new Float32BufferAttribute(from, 3));
  lineGeometry.setAttribute("aT0", new Float32BufferAttribute(time, 1));
  const lines = new LineSegments(
    lineGeometry,
    new ShaderMaterial({
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uDur;
        attribute vec3 aFrom; attribute float aT0;
        varying float vOn;
        void main() {
          float k = clamp((uTime - aT0) / uDur, 0.0, 1.0);
          vOn = step(aT0, uTime);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(aFrom, position, k), 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uFade; varying float vOn;
        void main() { if (vOn < 0.5) discard; gl_FragColor = vec4(uColor * 1.6, 0.85 * uFade); }`,
    }),
  );
  const dotGeometry = new BufferGeometry();
  dotGeometry.setAttribute("position", new Float32BufferAttribute(dots, 3));
  dotGeometry.setAttribute("aT0", new Float32BufferAttribute(dotTime, 1));
  const points = new Points(
    dotGeometry,
    new ShaderMaterial({
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uPx;
        attribute float aT0;
        varying float vA;
        void main() {
          float age = uTime - aT0;
          float flash = exp(-max(age, 0.0) * 5.0);
          vA = age < 0.0 ? 0.0 : 0.8 + 2.5 * flash;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uPx * (1.0 + 2.0 * flash) / -mv.z;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uFade; varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5 || vA <= 0.0) discard;
          gl_FragColor = vec4(uColor * vA, smoothstep(0.5, 0.05, d) * uFade);
        }`,
    }),
  );
  lines.renderOrder = points.renderOrder = 10;
  lines.frustumCulled = points.frustumCulled = false;
  const group = new Group();
  group.add(lines, points);
  return { group, uniforms, size: extent * 0.014 };
}

// ── Planning the playback ─────────────────────────────────────────────────────────────────────────────────────────

type Beat = {
  call: Call;
  start: number;
  dur: number;
  pieces: Array<{ piece: Piece; start: number; dur: number }>;
  joints: Array<{ joint: Object3D; t0: number }>;
  logged: boolean;
  /** Calls in this beat's wave; only the wave's first beat is logged, with the count and their summed time. */
  count: number;
  ms: number;
  silent: boolean;
  /** Mirrored pairs in this beat's wave. */
  pairs: number;
};
type Plan = { beats: Beat[]; wash: { start: number; dur: number } | null; geometryEnd: number; end: number };
type Options = { timing: string; colour: string };

/** Staged playback length at 1× before the paint wash; longer builds are compressed to fit. */
const STAGED = 4.5;
/** Parts smaller than this fraction of the model run together with the small parts around them. */
const TINY = 0.06;

/**
 * A wave: consecutive units (a call, or a call and its mirror image) that play as one beat. Repeated units (the same
 * helper, look and similar size: a loop of coins, a chain of joints) join a wave, and so does any run of tiny parts.
 * Within a wave parts rise from the bottom up, so heaps build up instead of arriving one call at a time.
 */
type Wave = {
  units: Call[][];
  mass: number;
  lastKind: string;
  lastMass: number;
  joints: boolean;
  spread: number;
  gap: number;
};

function plan(recording: Recording, pieces: Map<Object3D, Piece>, extent: number, options: Options): Plan {
  const real = options.timing.startsWith("real") ? Number(options.timing.slice(4)) : 0;
  const lead = 0.4;
  const beats: Beat[] = [];
  const masses = new Map(
    recording.calls.map((call) => [call, Math.max(0, ...call.objects.map((o) => (pieces.get(o)?.size ?? 0) / extent))]),
  );
  const kind = (call: Call) => {
    const first = call.objects[0];
    if (!first) return "joints";
    const m = pieces.get(first)?.materials[0] as (Material & { color?: Color; map?: Texture | null }) | undefined;
    return `${call.label}|${m?.color?.getHexString() ?? ""}|${m?.map?.uuid ?? ""}|${call.objects.length}`;
  };
  const beatOf = (
    call: Call,
    start: number,
    dur: number,
    count: number,
    ms: number,
    silent: boolean,
    pairs: number,
  ): Beat => ({
    call,
    start,
    dur,
    pieces: [],
    joints: [],
    logged: false,
    count,
    ms,
    silent,
    pairs,
  });

  if (real) {
    for (const call of recording.calls) {
      const start = lead + (call.t0 / 1000) * real;
      const dur = Math.max(((call.t1 - call.t0) / 1000) * real, 1 / 60);
      const beat = beatOf(call, start, dur, 1, call.t1 - call.t0, false, 0);
      for (const object of call.objects) {
        const piece = pieces.get(object);
        if (piece) beat.pieces.push({ piece, start, dur });
      }
      call.joints.forEach((joint, i) => beat.joints.push({ joint, t0: start + (i * dur) / call.joints.length }));
      beats.push(beat);
    }
  } else {
    const waves: Wave[] = [];
    for (const call of recording.calls) {
      if ((!call.objects.length && !call.joints.length) || call.twinOf) continue;
      const unit = call.twin ? [call, call.twin] : [call];
      const k = kind(call);
      const m = masses.get(call)!;
      const last = waves[waves.length - 1];
      const joints = k === "joints";
      const ratio = last ? Math.max(m, last.lastMass) / Math.max(Math.min(m, last.lastMass), 1e-4) : Infinity;
      const repeat = last && k === last.lastKind && (joints || ratio < 2.5);
      const crumbs = last && !joints && !last.joints && call.label !== "cards" && m < TINY && last.mass < TINY;
      if (last && (repeat || crumbs)) {
        last.units.push(unit);
        last.mass = Math.max(last.mass, m);
        last.lastKind = k;
        last.lastMass = m;
      } else waves.push({ units: [unit], mass: m, lastKind: k, lastMass: m, joints, spread: 0, gap: 0 });
    }
    // Big parts get a long grow and a pause after them; small ones pass quickly and overlap the next wave.
    for (const w of waves) {
      if (w.units.length > 1)
        w.spread = Math.min((w.joints ? 0.04 : 0.05) * (w.units.length - 1), w.joints ? 0.4 : 1.1);
      w.gap = w.joints ? 0.04 + w.spread * 0.5 : 0.05 + 0.55 * Math.sqrt(w.mass) + 0.6 * w.spread;
    }
    const natural = waves.reduce((s, w) => s + w.gap, 0);
    const squeeze = natural > STAGED ? STAGED / natural : 1;
    const slow = Math.max(Math.sqrt(squeeze), 0.6);
    const startOf = new Map<Call, number>();
    let t = lead;
    for (const wave of waves) {
      const spread = wave.spread * squeeze;
      // Offsets inside the wave: joints in call order (chains grow outwards), parts from the bottom up. Both calls of
      // a mirrored unit share one start.
      const heights = wave.units.map(([call]) => {
        const own = call.objects.map((o) => pieces.get(o)?.center.y).filter((y) => y !== undefined) as number[];
        return own.length ? own.reduce((s, y) => s + y, 0) / own.length : 0;
      });
      const lo = Math.min(...heights);
      const hi = Math.max(...heights);
      const calls = wave.units.flat();
      const ms = calls.reduce((s, c) => s + c.t1 - c.t0, 0);
      const pairs = wave.units.filter((unit) => unit.length > 1).length;
      wave.units.forEach((unit, index) => {
        const along =
          wave.joints || hi - lo < 1e-6
            ? index / Math.max(wave.units.length - 1, 1)
            : (heights[index] - lo) / (hi - lo);
        const start = t + spread * along;
        unit.forEach((call, side) => {
          startOf.set(call, start);
          const cards = call.label === "cards";
          const m = masses.get(call)!;
          const dur = (cards ? 0.9 + 0.8 * Math.sqrt(m) : 0.25 + 0.9 * Math.sqrt(m)) * slow;
          const beat = beatOf(call, start, dur, calls.length, ms, index > 0 || side > 0, pairs);
          call.objects.forEach((object, i) => {
            const piece = pieces.get(object);
            if (piece) beat.pieces.push({ piece, start: start + Math.min(i * 0.03, 0.4) * slow, dur });
          });
          const step = Math.min(0.05, 0.4 / Math.max(call.joints.length, 1)) * slow;
          call.joints.forEach((joint, i) => beat.joints.push({ joint, t0: start + i * step }));
          beats.push(beat);
        });
      });
      t += wave.gap * squeeze;
    }
    // Calls that added nothing visible are logged where they ran, between the waves around them.
    let previous = lead;
    for (const call of recording.calls) {
      const start = startOf.get(call);
      if (start !== undefined) previous = start;
      else beats.push(beatOf(call, previous, 0, 1, call.t1 - call.t0, false, 0));
    }
    beats.sort((a, b) => a.start - b.start);
  }

  const geometryEnd = Math.max(
    lead,
    ...beats.flatMap((b) => b.pieces.map((p) => p.start + p.dur)),
    ...beats.flatMap((b) => b.joints.map((j) => j.t0 + 0.35)),
  );
  const anyPaint = [...pieces.values()].some((p) => p.painted);
  const sculpt = options.colour === "sculpt";
  let wash: Plan["wash"] = null;
  if (anyPaint || sculpt) {
    const bake = recording.bakes[recording.bakes.length - 1];
    if (real && bake)
      wash = { start: lead + (bake.t0 / 1000) * real, dur: Math.max(((bake.t1 - bake.t0) / 1000) * real, 1 / 60) };
    else if (real) wash = { start: geometryEnd, dur: 1 / 60 };
    else wash = { start: Math.max(lead, geometryEnd - 0.8), dur: 1.8 };
  }
  const end = Math.max(geometryEnd, wash ? wash.start + wash.dur : 0) + 0.2;
  return { beats, wash, geometryEnd, end };
}

// ── The page ──────────────────────────────────────────────────────────────────────────────────────────────────────

const host = document.getElementById("view")!;
const busy = document.getElementById("busy")!;
const log = document.getElementById("log")!;
const bar = document.querySelector<HTMLDivElement>("#progress div")!;
const titleName = document.querySelector("#title b")!;
const titleBy = document.querySelector("#title small")!;
const stats = document.getElementById("stats")!;
const timingSelect = document.getElementById("timing") as HTMLSelectElement;
const colourSelect = document.getElementById("colour") as HTMLSelectElement;
const orbitBox = document.getElementById("orbit") as HTMLInputElement;

const renderer = new WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = NeutralToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
host.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color("#0d1015");
const camera = new PerspectiveCamera(30, 1, 0.01, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotateSpeed = 0.9;
const sun = new DirectionalLight(0xffffff, 2.4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.radius = 4;
sun.shadow.bias = -0.0004;
scene.add(new HemisphereLight(0xf5f1ea, 0x6d655c, 1.9), sun, sun.target);
const stage = new Group();
scene.add(stage);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.55, 0.45, 1.05);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function resize() {
  const { clientWidth: w, clientHeight: h } = host;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.resolution.set(w, h);
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

type Current = {
  slug: string;
  recording: Recording;
  pieces: Map<Object3D, Piece>;
  skeleton: Skeleton;
  floor: Group;
  shadow: ShadowMaterial;
  extent: number;
  plan: Plan;
  time: number;
};
let current: Current | null = null;
let loading = 0;

const options = (): Options => ({ timing: timingSelect.value, colour: colourSelect.value });
let speed = 1;

function dispose(model: Current) {
  stage.clear();
  model.recording.root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) m.dispose();
  });
  for (const piece of model.pieces.values()) for (const m of piece.materials) m.dispose();
  model.skeleton.group.traverse((node) => {
    const line = node as LineSegments;
    if (line.geometry) line.geometry.dispose();
    if (line.material) (line.material as Material).dispose();
  });
}

async function show(slug: string) {
  const ticket = ++loading;
  for (const a of document.querySelectorAll("#list a"))
    a.classList.toggle("on", (a as HTMLElement).dataset.slug === slug);
  if (current) dispose(current);
  current = null;
  log.replaceChildren();
  busy.className = "";
  busy.textContent = "building…";
  try {
    const module = await modules[`../samples/${slug}.ts`]!();
    // Let "building…" paint before the synchronous build.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (ticket !== loading) return;
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
    if (ticket !== loading) return;
    busy.textContent = "";

    const cardsOf = new Set(recording.calls.filter((c) => c.label === "cards").flatMap((c) => c.objects));
    const pieces = new Map<Object3D, Piece>();
    for (const call of recording.calls)
      for (const object of call.objects) pieces.set(object, prepare(object, cardsOf.has(object)));

    stage.add(recording.root);
    recording.root.updateMatrixWorld(true);
    for (const piece of pieces.values()) {
      const geometry = (piece.object as Mesh).geometry;
      if (!geometry) continue;
      if (!geometry.boundingSphere) geometry.computeBoundingSphere();
      piece.center.copy(geometry.boundingSphere!.center).applyMatrix4(piece.object.matrixWorld);
      piece.size = geometry.boundingSphere!.radius * piece.object.matrixWorld.getMaxScaleOnAxis();
    }
    const bounds = new Box3().setFromObject(recording.root);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const extent = Math.max(size.x, size.y, size.z, 0.2);
    pairMirrors(recording.calls, pieces, extent);
    shared.uWashSpan.value.set(bounds.min.y, bounds.max.y);
    shared.uWashFreq.value = 4 / extent;

    // Floor: a faint grid and a contact shadow that fades in once the build is done.
    const floor = new Group();
    const grid = new GridHelper(extent * 6, 24, 0x2a3240, 0x1a2029);
    (grid.material as Material).transparent = true;
    (grid.material as Material).opacity = 0.6;
    const shadow = new ShadowMaterial({ opacity: 0, transparent: true });
    const plane = new Mesh(new PlaneGeometry(extent * 8, extent * 8), shadow);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    floor.add(grid, plane);
    floor.position.set(center.x, Math.min(bounds.min.y, 0) - extent * 0.002, center.z);
    stage.add(floor);
    sun.position.copy(center).add(new Vector3(0.6, 1.4, 0.8).multiplyScalar(extent * 1.5));
    sun.target.position.copy(center);
    Object.assign(sun.shadow.camera, {
      left: -extent,
      right: extent,
      top: extent,
      bottom: -extent,
      near: 0.01,
      far: extent * 6,
    });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.normalBias = extent * 0.004;

    const view = new Vector3(0.78, 0.34, 0.85).normalize();
    const radius = size.length() / 2;
    const distance = (radius / Math.sin(((camera.fov / 2) * Math.PI) / 180)) * 1.05;
    camera.position.copy(center).addScaledVector(view, distance);
    camera.near = distance / 100;
    camera.far = distance * 20;
    camera.updateProjectionMatrix();
    controls.target.copy(center);

    const p = plan(recording, pieces, extent, options());
    const bones = skeleton(
      p.beats.flatMap((b) => b.joints),
      extent,
    );
    stage.add(bones.group);

    let triangles = 0;
    for (const object of pieces.keys()) {
      const g = (object as Mesh).geometry;
      if (g) triangles += (g.index ? g.index.count : g.getAttribute("position").count) / 3;
    }
    const bake = recording.bakes.reduce((s, b) => s + b.t1 - b.t0, 0);
    titleName.textContent = module.meta?.name ?? slug;
    titleBy.textContent = module.meta?.builtBy ? `built by ${module.meta.builtBy}` : slug;
    const visualCalls = recording.calls.filter((c) => c.objects.length || c.joints.length).length;
    const waves = p.beats.filter((b) => !b.silent && (b.call.objects.length || b.call.joints.length)).length;
    stats.textContent = [
      `real build   ${recording.total.toFixed(0)} ms in this browser`,
      `paint bake   ${bake.toFixed(0)} ms`,
      `calls        ${visualCalls} that added parts or joints${options().timing === "staged" ? `, played in ${waves} waves` : ""}`,
      `mirrored     ${recording.calls.filter((c) => c.twin).length} pairs built both sides at once`,
      `parts        ${pieces.size} meshes · ${Math.round(triangles).toLocaleString()} triangles`,
    ].join("\n");

    current = { slug, recording, pieces, skeleton: bones, floor, shadow, extent, plan: p, time: 0 };
    replay();
  } catch (error) {
    if (ticket !== loading) return;
    busy.className = "error";
    busy.textContent = `${slug}: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`;
  }
}

function replay() {
  if (!current) return;
  current.plan = plan(current.recording, current.pieces, current.extent, options());
  // Re-time the skeleton to the new plan.
  const joints = current.plan.beats.flatMap((b) => b.joints);
  stage.remove(current.skeleton.group);
  current.skeleton.group.traverse((node) => {
    const line = node as LineSegments;
    if (line.geometry) line.geometry.dispose();
  });
  current.skeleton = skeleton(joints, current.extent);
  stage.add(current.skeleton.group);
  current.time = 0;
  for (const beat of current.plan.beats) beat.logged = false;
  log.replaceChildren();
  apply(current, 0);
}

function skip() {
  if (!current) return;
  current.time = current.plan.end + 1;
}

const ease = (k: number) => 1 - Math.pow(1 - k, 3);
const back = (k: number) => 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);

function logLine(beat: Beat) {
  const { call } = beat;
  const line = document.createElement("div");
  const names = [...call.objects.map((o) => o.name), ...call.joints.map((j) => j.name)].filter(Boolean);
  const detail = names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3}` : "");
  const ms = beat.ms;
  const count = (beat.count > 1 ? ` ×${beat.count}` : "") + (beat.pairs ? " ⇄" : "");
  line.className = call.objects.length ? "" : call.joints.length ? "joint" : "quiet";
  line.innerHTML = `<i>${call.t0.toFixed(0).padStart(5)} ms</i> <b>${call.label}${count}</b> ${detail}${ms >= 1 ? ` <i>(${ms.toFixed(ms < 10 ? 1 : 0)} ms)</i>` : ""}`;
  log.append(line);
  while (log.childElementCount > 40) log.firstElementChild!.remove();
}

function apply(model: Current, time: number) {
  const { plan: p } = model;
  const sculpt = options().colour === "sculpt";
  const wash = p.wash ? Math.min(Math.max((time - p.wash.start) / p.wash.dur, 0), 1) : 1;
  shared.uWash.value = p.wash ? (wash >= 1 ? 1.1 : wash * 1.06) : 1.1;
  for (const beat of p.beats) {
    if (
      !beat.logged &&
      !beat.silent &&
      time >= beat.start &&
      (beat.call.objects.length || beat.call.joints.length || beat.ms >= 2)
    ) {
      beat.logged = true;
      logLine(beat);
    }
    for (const { piece, start, dur } of beat.pieces) {
      const k = Math.min(Math.max((time - start) / dur, 0), 1);
      piece.object.visible = time >= start;
      const grow = piece.cards ? k : ease(k);
      for (const u of piece.grow) u.value = k >= 1 ? 1.001 : grow;
      for (const u of piece.washable) u.value = sculpt || piece.painted ? 1 : 0;
      const pop = piece.cards ? 1 : 0.86 + 0.14 * back(k);
      piece.object.scale.copy(piece.scale).multiplyScalar(k >= 1 ? 1 : pop);
    }
  }
  const bones = model.skeleton.uniforms;
  bones.uTime.value = time;
  bones.uFade.value = 1 - Math.min(Math.max((time - p.geometryEnd * 0.85) / 0.8, 0), 1);
  bones.uPx.value =
    model.skeleton.size * (renderer.domElement.height / (2 * Math.tan(((camera.fov / 2) * Math.PI) / 180)));
  model.skeleton.group.visible = bones.uFade.value > 0;
  model.shadow.opacity = 0.18 * Math.min(Math.max((time - p.end + 0.2) / 0.6, 0), 1);
  bar.style.width = `${Math.min(time / p.end, 1) * 100}%`;
}

let last = performance.now();
renderer.setAnimationLoop(() => {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (current) {
    const before = current.time;
    current.time += dt * speed;
    if (current.plan.wash && before < current.plan.wash.start && current.time >= current.plan.wash.start) {
      const bake = current.recording.bakes[current.recording.bakes.length - 1];
      const line = document.createElement("div");
      line.className = "paint";
      line.innerHTML = bake
        ? `<i>${bake.t0.toFixed(0).padStart(5)} ms</i> <b>bake</b> paint sheet <i>(${(bake.t1 - bake.t0).toFixed(0)} ms)</i>`
        : `<b>wash</b> colour over clay`;
      log.append(line);
    }
    apply(current, current.time);
  }
  controls.autoRotate = orbitBox.checked;
  controls.update();
  composer.render();
});

// ── Controls ──────────────────────────────────────────────────────────────────────────────────────────────────────

const list = document.getElementById("list")!;
for (const [name, slug] of MODELS) {
  if (!(`../samples/${slug}.ts` in modules)) continue;
  const link = document.createElement("a");
  link.className = "item";
  link.textContent = name;
  link.dataset.slug = slug;
  link.href = `#${slug}`;
  list.append(link);
}

const speedButtons = [...document.querySelectorAll<HTMLButtonElement>("#speeds button")];
const DEFAULTS = { timing: "staged", colour: "honest", speed: "1", orbit: "1" };
let shown = "";

const settings = () => ({
  timing: timingSelect.value,
  colour: colourSelect.value,
  speed: String(speed),
  orbit: orbitBox.checked ? "1" : "0",
});

/** Mirror the model and settings into the hash (without a history entry) and into the sidebar links. */
function writeHash() {
  history.replaceState(null, "", hashOf(shown, settings(), DEFAULTS));
  for (const link of list.querySelectorAll<HTMLAnchorElement>("a"))
    link.href = hashOf(link.dataset.slug!, settings(), DEFAULTS);
}

function setSpeed(value: number) {
  speed = value;
  for (const button of speedButtons) button.classList.toggle("on", Number(button.dataset.speed) === value);
}

function applyHash() {
  const { model, params } = readHash();
  const pick = (select: HTMLSelectElement, key: keyof typeof DEFAULTS) => {
    const value = params.get(key);
    select.value = [...select.options].some((o) => o.value === value) ? value! : DEFAULTS[key];
  };
  const before = `${timingSelect.value}|${colourSelect.value}`;
  pick(timingSelect, "timing");
  pick(colourSelect, "colour");
  setSpeed(speedButtons.some((b) => b.dataset.speed === params.get("speed")) ? Number(params.get("speed")) : 1);
  orbitBox.checked = params.get("orbit") !== "0";
  const slug = `../samples/${model}.ts` in modules ? model : MODELS[0][1];
  if (slug !== shown) {
    shown = slug;
    show(slug);
  } else if (before !== `${timingSelect.value}|${colourSelect.value}`) replay();
  writeHash();
}

addEventListener("hashchange", applyHash);
document.getElementById("replay")!.addEventListener("click", replay);
document.getElementById("skip")!.addEventListener("click", skip);
for (const select of [timingSelect, colourSelect])
  select.addEventListener("change", () => {
    replay();
    writeHash();
  });
orbitBox.addEventListener("change", writeHash);
for (const button of speedButtons)
  button.addEventListener("click", () => {
    setSpeed(Number(button.dataset.speed));
    writeHash();
  });
addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLSelectElement) return;
  if (event.key === "r" || event.key === " ") {
    event.preventDefault();
    replay();
  } else if (event.key === "s") skip();
  else if (["1", "2", "3", "4"].includes(event.key)) {
    setSpeed(Number(event.key));
    writeHash();
  }
});
// For the smoke script: the current playback's length and clock.
Object.assign(window, { assemble: () => (current ? { end: current.plan.end, time: current.time } : null) });
applyHash();
