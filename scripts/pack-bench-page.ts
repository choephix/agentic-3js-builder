// Browser half of pack-bench.ts. Samples share this page's three.js, just as in preview-page.ts.
import * as THREE from "three";
import { pack } from "../src/pack";
import type { Packed } from "../src/pack";

export type SampleModule = { slug: string; module: { default?: unknown } };
export type RenderCounts = { calls: number; triangles: number };
export type SampleResult = {
  slug: string;
  buildMs?: number;
  textureWaitMs?: number;
  packMs?: number;
  /** Conservative bound: one awaited pack invocation, including its internal awaits, after textures are ready. */
  blockingUpperBoundMs?: number;
  visibleMeshes?: number;
  triangles?: { unpacked: number; packed: number };
  atlas?: { width: number; height: number };
  draws?: { unpacked: { off: RenderCounts; on: RenderCounts }; packed: { off: RenderCounts; on: RenderCounts } };
  issues?: Packed["issues"];
  error?: string;
};
export type WorldResult = RenderCounts & {
  memory: { geometries: number; textures: number };
  medianMs: number;
  p95Ms: number;
  frameMs: number[];
};
export type BenchResult = {
  gpu: string;
  samples: SampleResult[];
  skipped: string[];
  world: {
    requested: number;
    selected: string[];
    included: string[];
    totalPackMs: number;
    longestPackMs: number;
    unpacked: WorldResult | null;
    packed: WorldResult | null;
  };
  longestSinglePack: { slug: string; ms: number } | null;
  methodology: string[];
};

type BuiltSample = { root: THREE.Object3D; packed: Packed; result: SampleResult };
const WIDTH = 1280;
const HEIGHT = 720;
const WARMUP = 20;
const FRAMES = 120;

function makeRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(1);
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColor(0xd5dadf);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Keep shadow and colour passes in one counter; reset explicitly once per render.
  renderer.info.autoReset = false;
  document.body.append(renderer.domElement);
  return renderer;
}

function closeRenderer(renderer: THREE.WebGLRenderer) {
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}

function rendererString(renderer: THREE.WebGLRenderer) {
  const gl = renderer.getContext();
  const extension = gl.getExtension("WEBGL_debug_renderer_info");
  return String(gl.getParameter(extension ? extension.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
}

function texturesOf(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    for (const material of [node.material].flat())
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
  });
  return textures;
}

function disposeRoot(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = texturesOf(root);
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    for (const material of [node.material].flat()) materials.add(material);
    if (node instanceof THREE.SkinnedMesh) node.skeleton.dispose();
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  for (const texture of textures) texture.dispose();
}

function meshStats(root: THREE.Object3D) {
  let meshes = 0;
  let triangles = 0;
  root.traverseVisible((node) => {
    if (!(node instanceof THREE.Mesh) || ![node.material].flat().some((material) => material.visible)) return;
    meshes++;
    const geometry = node.geometry;
    triangles += (geometry.index?.count ?? geometry.getAttribute("position").count) / 3;
  });
  return { meshes, triangles };
}

function shadows(root: THREE.Object3D) {
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
  });
}

/** Orthographic framing of all eight bounds corners; unchanged between unpacked and packed renders. */
function setupScene(bounds: THREE.Box3) {
  const scene = new THREE.Scene();
  const center = bounds.getCenter(new THREE.Vector3());
  const extent = Math.max(bounds.getSize(new THREE.Vector3()).length(), 1);
  const direction = new THREE.Vector3(1, 0.8, 1).normalize();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, extent * 6);
  camera.position.copy(center).addScaledVector(direction, extent * 2);
  camera.lookAt(center);
  camera.updateMatrixWorld(true);
  let halfWidth = 0;
  let halfHeight = 0;
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse);
        halfWidth = Math.max(halfWidth, Math.abs(corner.x));
        halfHeight = Math.max(halfHeight, Math.abs(corner.y));
      }
  const height = Math.max(halfHeight, halfWidth / (WIDTH / HEIGHT), 0.1) * 1.1;
  Object.assign(camera, {
    left: -height * (WIDTH / HEIGHT),
    right: height * (WIDTH / HEIGHT),
    top: height,
    bottom: -height,
  });
  camera.updateProjectionMatrix();
  scene.add(new THREE.HemisphereLight(0xf5f1ea, 0x6d655c, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.copy(center).add(new THREE.Vector3(1.2, 2.4, 1.6).multiplyScalar(extent));
  sun.target.position.copy(center);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -extent,
    right: extent,
    top: extent,
    bottom: -extent,
    near: 0.01,
    far: extent * 8,
  });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = extent * 0.001;
  scene.add(sun, sun.target);
  return { scene, camera, sun };
}

function renderCounts(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): RenderCounts {
  renderer.info.reset();
  renderer.render(scene, camera);
  return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
}

function sampleDraws(renderer: THREE.WebGLRenderer, root: THREE.Object3D, bounds: THREE.Box3) {
  const { scene, camera, sun } = setupScene(bounds);
  scene.add(root);
  try {
    const count = (enabled: boolean) => {
      sun.castShadow = enabled;
      // Prime uploads/programs and the new shadow target before counting one render.
      renderCounts(renderer, scene, camera);
      return renderCounts(renderer, scene, camera);
    };
    return { off: count(false), on: count(true) };
  } finally {
    scene.remove(root);
    sun.shadow.dispose();
  }
}

function grid(samples: BuiltSample[]) {
  const columns = Math.ceil(Math.sqrt(samples.length));
  const widths = Array<number>(columns).fill(0);
  const depths = Array<number>(Math.ceil(samples.length / columns)).fill(0);
  const bounds = samples.map(({ root }, i) => {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    widths[i % columns] = Math.max(widths[i % columns], size.x);
    depths[Math.floor(i / columns)] = Math.max(depths[Math.floor(i / columns)], size.z);
    return box;
  });
  const offset = (sizes: number[], index: number) =>
    sizes.slice(0, index).reduce((sum, size) => sum + size + 1, 0) + sizes[index] / 2;
  const unpacked = new THREE.Group();
  const packed = new THREE.Group();
  samples.forEach((sample, i) => {
    const box = bounds[i];
    const center = box.getCenter(new THREE.Vector3());
    const position = new THREE.Vector3(
      offset(widths, i % columns) - center.x,
      -box.min.y,
      offset(depths, Math.floor(i / columns)) - center.z,
    );
    for (const [world, object] of [
      [unpacked, sample.root],
      [packed, sample.packed.object],
    ] as const) {
      const cell = new THREE.Group();
      cell.position.copy(position);
      cell.add(object);
      world.add(cell);
    }
  });
  return { unpacked, packed, bounds: new THREE.Box3().setFromObject(unpacked) };
}

async function worldFrames(root: THREE.Object3D, bounds: THREE.Box3): Promise<WorldResult> {
  // A fresh renderer per mode makes memory counts independent of the other mode's uploads.
  const renderer = makeRenderer();
  const { scene, camera, sun } = setupScene(bounds);
  scene.add(root);
  const gl = renderer.getContext();
  const frameMs: number[] = [];
  let counts: RenderCounts = { calls: 0, triangles: 0 };
  try {
    for (let i = 0; i < WARMUP + FRAMES; i++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      renderer.info.reset();
      const start = performance.now();
      renderer.render(scene, camera);
      gl.finish();
      const elapsed = performance.now() - start;
      if (i >= WARMUP) frameMs.push(elapsed);
      counts = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
    }
    const sorted = [...frameMs].sort((a, b) => a - b);
    return {
      ...counts,
      memory: { ...renderer.info.memory },
      medianMs: (sorted[59] + sorted[60]) / 2,
      p95Ms: sorted[Math.ceil(FRAMES * 0.95) - 1],
      frameMs,
    };
  } finally {
    scene.remove(root);
    sun.shadow.dispose();
    closeRenderer(renderer);
  }
}

async function run({ worldSize, slugs }: { worldSize: number; slugs: string[] }): Promise<BenchResult> {
  const page = globalThis as unknown as { THREE: typeof THREE; __packBenchSamples: { samples: SampleModule[] } };
  page.THREE = THREE;
  const imported = page.__packBenchSamples.samples;
  const skipped = imported.filter((sample) => typeof sample.module.default !== "function").map((sample) => sample.slug);
  const modules = imported.filter((sample) => typeof sample.module.default === "function");
  for (const slug of slugs)
    if (!modules.some((sample) => sample.slug === slug))
      throw new Error(`No sample with a default export function: ${slug}`);
  const selected = slugs.length ? modules.filter((sample) => slugs.includes(sample.slug)) : modules;
  const count = Math.min(worldSize, selected.length);
  const worldSlugs = Array.from({ length: count }, (_, i) => selected[Math.floor((i * selected.length) / count)].slug);
  const worldSet = new Set(worldSlugs);
  const retained: BuiltSample[] = [];
  const samples: SampleResult[] = [];
  const renderer = makeRenderer();
  const gpu = rendererString(renderer);
  try {
    for (const sample of selected) {
      const result: SampleResult = { slug: sample.slug };
      samples.push(result);
      let root: THREE.Object3D | undefined;
      let packed: Packed | undefined;
      let keep = false;
      try {
        // default() returns b.root, whose getter performs lazy paint baking. Time that entire call, like preview.
        const buildStart = performance.now();
        const build = sample.module.default as () => unknown;
        const built: unknown = await build();
        result.buildMs = performance.now() - buildStart;
        if (!(built instanceof THREE.Object3D)) throw new Error("build() must return a THREE.Object3D");
        root = built;
        const waitStart = performance.now();
        // atlas.pixels() awaits this same readiness promise before reading SVG/texture pixels.
        await Promise.all(
          [...texturesOf(root)].map((texture) => texture.userData.ready as Promise<unknown> | undefined),
        );
        result.textureWaitMs = performance.now() - waitStart;
        const before = meshStats(root);
        result.visibleMeshes = before.meshes;
        const packStart = performance.now();
        try {
          packed = await pack(root, { name: sample.slug });
        } finally {
          result.packMs = performance.now() - packStart;
          result.blockingUpperBoundMs = result.packMs;
        }
        result.issues = packed.issues;
        const material = [packed.object.material].flat()[0];
        const atlas =
          "map" in material && material.map instanceof THREE.Texture
            ? (material.map.image as { width: number; height: number })
            : null;
        if (!atlas) throw new Error("Packed mesh has no atlas texture");
        result.atlas = { width: atlas.width, height: atlas.height };
        result.triangles = { unpacked: before.triangles, packed: meshStats(packed.object).triangles };
        shadows(root);
        shadows(packed.object);
        const bounds = new THREE.Box3().setFromObject(root);
        result.draws = {
          unpacked: sampleDraws(renderer, root, bounds),
          packed: sampleDraws(renderer, packed.object, bounds),
        };
        if (worldSet.has(sample.slug)) {
          retained.push({ root, packed, result });
          keep = true;
        }
      } catch (error) {
        result.error = error instanceof Error ? error.message : String(error);
      } finally {
        if (!keep) {
          if (root) disposeRoot(root);
          if (packed) {
            if (packed.object instanceof THREE.SkinnedMesh) packed.object.skeleton.dispose();
            packed.dispose();
          }
        }
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  } finally {
    closeRenderer(renderer);
  }
  let unpacked: WorldResult | null = null;
  let packed: WorldResult | null = null;
  try {
    if (retained.length) {
      const world = grid(retained);
      unpacked = await worldFrames(world.unpacked, world.bounds);
      packed = await worldFrames(world.packed, world.bounds);
    }
  } finally {
    for (const sample of retained) {
      disposeRoot(sample.root);
      if (sample.packed.object instanceof THREE.SkinnedMesh) sample.packed.object.skeleton.dispose();
      sample.packed.dispose();
    }
  }
  const longest = samples
    .filter((sample) => sample.packMs !== undefined)
    .reduce<SampleResult | null>((best, sample) => (!best || sample.packMs! > best.packMs! ? sample : best), null);
  return {
    gpu,
    samples,
    skipped,
    world: {
      requested: worldSize,
      selected: worldSlugs,
      included: retained.map((sample) => sample.result.slug),
      totalPackMs: retained.reduce((sum, sample) => sum + sample.result.packMs!, 0),
      longestPackMs: Math.max(0, ...retained.map((sample) => sample.result.packMs!)),
      unpacked,
      packed,
    },
    longestSinglePack: longest ? { slug: longest.slug, ms: longest.packMs! } : null,
    methodology: [
      "All .ts sample modules sorted by filename; only function default exports run. Explicit slugs restrict both sample and world pools.",
      "World picks floor(i * poolSize / N), N capped to the available pool; failed samples are reported and omitted, never replaced.",
      "Build includes default() and its returned b.root lazy paint bake. Texture userData.ready promises are awaited separately before pack().",
      "Pack and blockingUpperBoundMs are the same single awaited wall duration; internal awaits are included, so this is a conservative blocking bound, not CPU-only profiling.",
      "All model meshes cast/receive shadows; no ground or other drawable is added. Single-model counts are one render after priming, shadows off/on.",
      "World uses the already timed packed objects, bounding-box-sized grid cells with 1-unit gaps, fixed orthographic camera, 1280x720, pixel ratio 1, hemisphere + directional light, 2048 shadow map.",
      "Each world mode has a fresh renderer (isolated GPU memory counts), 20 warm-up + 120 measured requestAnimationFrame frames; timing is render() + gl.finish(), excluding the wait for the frame.",
      "autoReset=false with one info.reset() before each render includes shadow and colour passes in calls/triangles. Triangle topology counts are separately reported per sample.",
      "Median is the mean of middle two sorted times; p95 uses nearest rank. World total/longest pack times sum/max the included samples' single pack invocations.",
    ],
  };
}

// This bundle publishes the browser API consumed by the Node runner.
const host = globalThis as unknown as { packBench: { run: typeof run }; THREE: typeof THREE };
host.packBench = { run };
host.THREE = THREE;
