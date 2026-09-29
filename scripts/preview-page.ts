// Runs inside the shared headless Chromium, driven by scripts/preview.ts. Builds a bundled sample, bakes it with the
// creature-lab harness's assemble() (so bounds, triangles and textures match what `npm run snap` reports) and returns
// its textures, per-part table and, on request, two lit shots. `creature-lab/*` resolves to the lab's harness modules.
import * as THREE from "three";
import { assemble, createStaticMesh } from "creature-lab/assemble";
import { createKit } from "creature-lab/kit";

const SHOT_SIZE = 900;
const BACKGROUND = 0xd5dadf;
const VIEWS = { "three-quarter": [0.78, 0.34, 0.85], front: [0, 0.14, 1] } as const;

type Vec3 = [number, number, number];
export type PreviewPart = {
  index: number;
  name: string;
  group: string;
  /** The part's bone first, then any other bones its own skin weights reach. Empty for unrigged models. */
  bones: string[];
  triangles: number;
  texture: string | null;
  min: Vec3;
  max: Vec3;
};
export type PreviewTexture = {
  file: string;
  kind: string;
  width: number;
  height: number;
  parts: string[];
  png: string;
};
export type PreviewResult = {
  rigged: boolean;
  meta: unknown;
  issues: Array<{ level: string; message: string }>;
  parts: PreviewPart[];
  textures: PreviewTexture[];
  triangles: number;
  bounds: { min: Vec3; max: Vec3 };
  shots: Array<{ name: string; png: string }>;
};

const slugify = (text: string) => text.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "part";

/** The texture as an upright picture (v up), whether it holds raw texels or a drawable image. */
function texturePng(texture: THREE.Texture) {
  const image = texture.image as {
    data?: ArrayLike<number>;
    width: number;
    height: number;
  } & Partial<CanvasImageSource>;
  const { width, height } = image;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  if (image.data) {
    // Data textures store row 0 at v = 0 (flipY is off), so rows are reversed to put v = 1 on top.
    const pixels = new ImageData(width, height);
    const row = width * 4;
    const data = Uint8Array.from(image.data);
    for (let y = 0; y < height; y++)
      pixels.data.set(data.subarray((height - 1 - y) * row, (height - y) * row), y * row);
    context.putImageData(pixels, 0, 0);
  } else {
    context.drawImage(image as CanvasImageSource, 0, 0, width, height);
  }
  return canvas.toDataURL("image/png");
}

function fitCamera(camera: THREE.PerspectiveCamera, positions: ArrayLike<number>, direction: THREE.Vector3) {
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(up, direction).normalize();
  up.crossVectors(direction, right).normalize();
  const vertex = new THREE.Vector3();
  const low = [Infinity, Infinity];
  const high = [-Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    vertex.fromArray(positions, i);
    const [a, b] = [vertex.dot(right), vertex.dot(up)];
    low[0] = Math.min(low[0], a);
    low[1] = Math.min(low[1], b);
    high[0] = Math.max(high[0], a);
    high[1] = Math.max(high[1], b);
  }
  const center = new THREE.Vector3()
    .addScaledVector(right, (low[0] + high[0]) / 2)
    .addScaledVector(up, (low[1] + high[1]) / 2);
  const tangent = Math.tan((camera.fov * Math.PI) / 360);
  let distance = 0;
  for (let i = 0; i < positions.length; i += 3) {
    vertex.fromArray(positions, i).sub(center);
    const lateral = Math.max(Math.abs(vertex.dot(right)), Math.abs(vertex.dot(up))) / tangent;
    distance = Math.max(distance, lateral * 1.08 + vertex.dot(direction));
  }
  camera.position.copy(center).addScaledVector(direction, distance);
  camera.near = Math.max(distance / 200, 0.005);
  camera.far = distance * 20;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

/** Lit shots of the baked model on a shadow-catching ground, lit like the harness's shaded shots. */
function shots(model: THREE.Mesh, bounds: { min: Vec3; max: Vec3 }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(SHOT_SIZE, SHOT_SIZE);
  renderer.setClearColor(BACKGROUND, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  if (!/nvidia/i.test(gpu)) throw new Error(`GPU gate failed: renderer is "${gpu}", not NVIDIA`);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xf5f1ea, 0x6d655c, 1.9));
  const size = bounds.max.map((max, axis) => max - bounds.min[axis]);
  const extent = Math.max(...size, 0.5);
  const center = new THREE.Vector3((bounds.min[0] + bounds.max[0]) / 2, 0, (bounds.min[2] + bounds.max[2]) / 2);
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(extent * 1.2, extent * 2.4, extent * 1.6).add(center);
  sun.target.position.copy(center);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const reach = extent * 1.5;
  Object.assign(sun.shadow.camera, {
    left: -reach,
    right: reach,
    top: reach,
    bottom: -reach,
    near: 0.01,
    far: extent * 8,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = extent * 0.004;
  scene.add(sun, sun.target);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(extent * 8, extent * 8),
    new THREE.ShadowMaterial({ opacity: 0.22 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.copy(center);
  ground.receiveShadow = true;
  scene.add(ground);
  model.castShadow = model.receiveShadow = true;
  scene.add(model);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  const positions = model.geometry.getAttribute("position").array;
  const pixels = new Uint8Array(SHOT_SIZE * SHOT_SIZE * 4);
  const [r, g, b] = [(BACKGROUND >> 16) & 255, (BACKGROUND >> 8) & 255, BACKGROUND & 255];
  const result = Object.entries(VIEWS).map(([name, view]) => {
    fitCamera(camera, positions, new THREE.Vector3(...view).normalize());
    // The first frame after a scene change can lose draws (an ANGLE glitch); render until the model shows.
    for (let attempt = 0; attempt < 6; attempt++) {
      renderer.render(scene, camera);
      gl.readPixels(0, 0, SHOT_SIZE, SHOT_SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      let drawn = 0;
      for (let i = 0; i < pixels.length; i += 4)
        if (Math.abs(pixels[i] - r) + Math.abs(pixels[i + 1] - g) + Math.abs(pixels[i + 2] - b) > 12) drawn++;
      if (attempt > 0 && drawn > (SHOT_SIZE * SHOT_SIZE) / 2000) break;
    }
    return { name, png: renderer.domElement.toDataURL("image/png") };
  });
  renderer.dispose();
  renderer.forceContextLoss();
  return result;
}

async function run({ code, shot }: { code: string; shot: boolean }): Promise<PreviewResult> {
  // The creature bundle maps `three` to this global (so both share one copy) and assigns its exports to __creature.
  const page = globalThis as {
    THREE?: typeof THREE;
    __creature?: { default?: unknown; build?: unknown; meta?: unknown };
  };
  page.THREE = THREE;
  (0, eval)(code);
  const module = page.__creature;
  const build = (module?.default ?? module?.build) as ((kit: unknown) => unknown) | undefined;
  if (typeof build !== "function") throw new Error("The module must `export default function build()`");
  const built = await build(createKit());
  if (!(built instanceof THREE.Object3D)) throw new Error("build() must return a THREE.Object3D");

  let rigged = false;
  built.traverse((node) => (rigged ||= typeof node.userData.joint === "string"));
  // Every texture the meshes use, keyed the way assemble() names them in its parts table.
  const textures = new Map<string, THREE.Texture>();
  built.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const material: THREE.Material | THREE.Material[] = node.material;
    for (const entry of [material].flat()) {
      const map = "map" in entry && entry.map instanceof THREE.Texture ? entry.map : null;
      if (map?.image) textures.set(map.name ? `${map.name}:${map.uuid.slice(0, 8)}` : map.uuid, map);
    }
  });
  const assembly = await assemble(built, rigged);

  const geometry = assembly.geometry;
  const position = geometry.getAttribute("position");
  const partOf = geometry.getAttribute("_part");
  const skinIndex = geometry.getAttribute("skinIndex");
  const skinWeight = geometry.getAttribute("skinWeight");
  const min = assembly.parts.map(() => [Infinity, Infinity, Infinity] as Vec3);
  const max = assembly.parts.map(() => [-Infinity, -Infinity, -Infinity] as Vec3);
  const weights = assembly.parts.map(() => new Map<number, number>());
  for (let i = 0; i < position.count; i++) {
    const part = partOf.getX(i);
    for (let axis = 0; axis < 3; axis++) {
      const value = position.getComponent(i, axis);
      if (value < min[part][axis]) min[part][axis] = value;
      if (value > max[part][axis]) max[part][axis] = value;
    }
    if (skinIndex && skinWeight)
      for (let k = 0; k < 4; k++) {
        const weight = skinWeight.getComponent(i, k);
        if (weight > 1e-3) {
          const bone = skinIndex.getComponent(i, k);
          weights[part].set(bone, (weights[part].get(bone) ?? 0) + weight);
        }
      }
  }

  const parts = assembly.parts.map((part, index): PreviewPart => {
    const reached = [...weights[index]]
      .sort((a, b) => b[1] - a[1])
      .map(([bone]) => assembly.joints[bone].name)
      .filter((name) => name !== part.bone);
    return {
      index,
      name: part.name,
      group: part.group,
      bones: part.bone ? [part.bone, ...reached] : reached,
      triangles: part.triangles,
      texture: part.texture === null ? null : assembly.textures[part.texture],
      min: min[index].map((value) => Number(value.toFixed(4))) as Vec3,
      max: max[index].map((value) => Number(value.toFixed(4))) as Vec3,
    };
  });

  const counts = new Map<string, number>();
  // Only textures of baked (visible) parts; hidden meshes are not part of the model.
  const pictures = [...textures].flatMap(([key, texture]): PreviewTexture[] => {
    const users = parts.filter((part) => part.texture === key);
    if (!users.length) return [];
    const kind = slugify(texture.name || "texture");
    const { group, name: first } = users[0];
    const name = kind === "paint" ? "paint-sheet" : `${kind}-${slugify(group === first ? group : `${group}-${first}`)}`;
    const seen = (counts.get(name) ?? 0) + 1;
    counts.set(name, seen);
    const { width, height } = texture.image as { width: number; height: number };
    const file = `${name}${seen > 1 ? `-${seen}` : ""}-${width}x${height}.png`;
    return [{ file, kind, width, height, parts: users.map((part) => part.name), png: texturePng(texture) }];
  });

  const errors = assembly.issues.some((issue) => issue.level === "error");
  return {
    rigged,
    meta: module?.meta ?? null,
    issues: assembly.issues,
    parts,
    textures: pictures,
    triangles: assembly.triangles,
    bounds: assembly.bounds,
    shots: shot && !errors && parts.length ? shots(createStaticMesh(assembly, "preview"), assembly.bounds) : [],
  };
}

Object.assign(window, { preview: { run } });
