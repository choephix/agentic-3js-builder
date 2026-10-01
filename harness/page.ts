// Runs inside the shared NVIDIA Chromium, driven by harness/snap.ts.
// Evaluates a bundled creature module, bakes it with assemble(), renders the
// review shots, composes the contact sheet and exports the GLB downloads.
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { assemble, createSkinnedMesh, createStaticMesh, surfaceOf } from "./assemble";
import type { Assembly } from "./assemble";
import { looseClusters, measureIndex } from "./measure";
import { createKit } from "./kit";
import { stiffParts } from "./weights";
import type { Kit } from "./kit";

type Arm = "A" | "B" | "C";
type Mode = "shaded" | "groups" | "bones" | "xray";
type Pose = "rest" | "flexA" | "flexB";
type Shot = { name: string; caption: string; view: keyof typeof VIEWS; mode: Mode; pose: Pose; focus?: "head" };

const SHOT_SIZE = 900;
const TILE = 600;
const BACKGROUND = "#d5dadf";
const HEAD_PATTERN = /head|skull|face|jaw|snout|muzzle|beak|mouth/i;
const VIEWS = {
  front: [0, 0.14, 1],
  threeQuarter: [0.78, 0.34, 0.85],
  side: [1, 0.1, 0],
  back: [0, 0.18, -1],
  top: [0, 1, 0.32],
  low: [-0.85, 0.06, 0.7],
  otherQuarter: [-0.8, 0.4, 0.75],
} as const;

const BASE_SHOTS: Shot[] = [
  { name: "front", caption: "front", view: "front", mode: "shaded", pose: "rest" },
  { name: "three-quarter", caption: "three-quarter", view: "threeQuarter", mode: "shaded", pose: "rest" },
  { name: "side", caption: "side (left)", view: "side", mode: "shaded", pose: "rest" },
  { name: "back", caption: "back", view: "back", mode: "shaded", pose: "rest" },
  { name: "top", caption: "top", view: "top", mode: "shaded", pose: "rest" },
  { name: "low", caption: "low hero angle", view: "low", mode: "shaded", pose: "rest" },
  { name: "head", caption: "head close-up", view: "threeQuarter", mode: "shaded", pose: "rest", focus: "head" },
];
const GROUP_SHOTS: Shot[] = [
  { name: "groups", caption: "part groups (false color)", view: "threeQuarter", mode: "groups", pose: "rest" },
];
const RIG_SHOTS: Shot[] = [
  { name: "bones", caption: "bone assignment (false color)", view: "threeQuarter", mode: "bones", pose: "rest" },
  { name: "skeleton", caption: "skeleton x-ray", view: "threeQuarter", mode: "xray", pose: "rest" },
  { name: "skeleton-side", caption: "skeleton x-ray · side", view: "side", mode: "xray", pose: "rest" },
  { name: "flex-a", caption: "flex test A (random bend)", view: "threeQuarter", mode: "shaded", pose: "flexA" },
  { name: "flex-b", caption: "flex test B (random bend)", view: "otherQuarter", mode: "shaded", pose: "flexB" },
];

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(SHOT_SIZE, SHOT_SIZE);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

function gpu() {
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
}

function hue(index: number, total: number) {
  return new THREE.Color().setHSL((index * 0.618034) % 1, 0.72, total > 12 && index % 2 ? 0.42 : 0.56);
}

/** Per-vertex false colors keyed by part group or bone. */
function falseColors(assembly: Assembly, key: "group" | "bone") {
  const names = [...new Set(assembly.parts.map((part) => part[key] ?? "(none)"))];
  const palette = names.map((_, index) => hue(index, names.length));
  const partIndex = assembly.geometry.getAttribute("_part");
  const colors = new Float32Array(partIndex.count * 3);
  for (let i = 0; i < partIndex.count; i++) {
    const name = assembly.parts[partIndex.getX(i)][key] ?? "(none)";
    palette[names.indexOf(name)].toArray(colors, i * 3);
  }
  return { names, palette, colors };
}

function fitCamera(camera: THREE.PerspectiveCamera, points: Float32Array, direction: THREE.Vector3, padding: number) {
  const bounds = new THREE.Box3();
  const vertex = new THREE.Vector3();
  for (let i = 0; i < points.length; i += 3) bounds.expandByPoint(vertex.fromArray(points, i));
  const worldUp = Math.abs(direction.y) > 0.95 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(worldUp, direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const center = bounds.getCenter(new THREE.Vector3());
  const middle = (axis: THREE.Vector3) => {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < points.length; i += 3) {
      const value =
        (points[i] - center.x) * axis.x + (points[i + 1] - center.y) * axis.y + (points[i + 2] - center.z) * axis.z;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    return (min + max) / 2;
  };
  center.addScaledVector(right, middle(right)).addScaledVector(up, middle(up));
  const tangent = Math.tan((camera.fov * Math.PI) / 360);
  let distance = 0;
  for (let i = 0; i < points.length; i += 3) {
    vertex.fromArray(points, i).sub(center);
    const lateral = Math.max(Math.abs(vertex.dot(right)), Math.abs(vertex.dot(up))) / tangent;
    distance = Math.max(distance, lateral * padding + vertex.dot(direction));
  }
  camera.up.copy(worldUp);
  camera.position.copy(center).addScaledVector(direction, distance);
  camera.near = Math.max(distance / 200, 0.005);
  camera.far = distance * 20;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

/**
 * Renders with readPixels. The first frame after the scene changes can come out with its first draws missing (a
 * known ANGLE glitch: no model, or a skeleton overlay missing some bones), so every shot renders once before the
 * frame it keeps, and frames without the model are retried. In x-ray shots the model is see-through and only the
 * overlay is opaque; a frame that still shows none after the retries is kept.
 */
function snapshot(scene: THREE.Scene, camera: THREE.Camera, xray: boolean) {
  const gl = renderer.getContext();
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  const pixels = new Uint8Array(width * height * 4);
  renderer.render(scene, camera);
  for (let attempt = 0; ; attempt++) {
    renderer.render(scene, camera);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let opaque = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] === 255) opaque++;
    if (opaque > (width * height) / 2000) break;
    if (attempt === 8) {
      if (xray) break;
      throw new Error(`Only ${opaque} opaque pixels after ${attempt + 1} renders`);
    }
  }
  const image = new ImageData(width, height);
  for (let y = 0; y < height; y++) {
    const source = (height - 1 - y) * width * 4;
    const target = y * width * 4;
    for (let x = 0; x < width * 4; x += 4) {
      const alpha = pixels[source + x + 3];
      const scale = alpha ? 255 / alpha : 0;
      image.data[target + x] = pixels[source + x] * scale;
      image.data[target + x + 1] = pixels[source + x + 1] * scale;
      image.data[target + x + 2] = pixels[source + x + 2] * scale;
      image.data[target + x + 3] = alpha;
    }
  }
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  layer.getContext("2d")!.putImageData(image, 0, 0);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);
  context.drawImage(layer, 0, 0);
  return canvas;
}

function label(
  canvas: HTMLCanvasElement,
  heading: string,
  caption: string,
  legend?: { names: string[]; palette: THREE.Color[] },
) {
  const context = canvas.getContext("2d")!;
  context.font = "600 22px system-ui, sans-serif";
  context.fillStyle = "#1c2126";
  context.fillText(heading, 18, 34);
  context.font = "600 22px system-ui, sans-serif";
  const width = context.measureText(caption).width;
  context.fillStyle = "#000a";
  context.fillRect(canvas.width - width - 34, canvas.height - 46, width + 22, 34);
  context.fillStyle = "#fff";
  context.fillText(caption, canvas.width - width - 23, canvas.height - 21);
  if (!legend) return;
  context.font = "500 15px system-ui, sans-serif";
  const rows = Math.min(legend.names.length, 36);
  legend.names.slice(0, rows).forEach((name, index) => {
    const column = Math.floor(index / 18);
    const row = index % 18;
    const x = 18 + column * 170;
    const y = 62 + row * 21;
    context.fillStyle = `#${legend.palette[index].getHexString()}`;
    context.fillRect(x, y - 12, 14, 14);
    context.fillStyle = "#1c2126";
    context.fillText(name.length > 18 ? `${name.slice(0, 17)}…` : name, x + 20, y);
  });
  if (legend.names.length > rows) context.fillText(`+${legend.names.length - rows} more`, 18, 62 + 18 * 21);
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

/**
 * RGBA PNG of a data texture's rows as stored (row 0 on top, which is v = 0 in both three with flipY off and glTF).
 * Written by hand because a canvas premultiplies alpha and so blanks the colour of transparent texels, which the
 * atlas fills on purpose so filtered cut-out edges keep their colour.
 */
async function encodePng(image: { data: ArrayLike<number>; width: number; height: number }) {
  const { data, width, height } = image;
  const stride = width * 4 + 1;
  const raw = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++)
    raw.set(
      Uint8Array.from({ length: width * 4 }, (_, i) => data[y * width * 4 + i]),
      y * stride + 1,
    );
  const deflated = new Uint8Array(
    await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer(),
  );
  const chunk = (type: string, body: Uint8Array) => {
    const out = new Uint8Array(12 + body.length);
    const view = new DataView(out.buffer);
    view.setUint32(0, body.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(body, 8);
    let crc = 0xffffffff;
    for (let i = 4; i < 8 + body.length; i++) crc = CRC_TABLE[(crc ^ out[i]) & 255] ^ (crc >>> 8);
    view.setUint32(8 + body.length, (crc ^ 0xffffffff) >>> 0);
    return out;
  };
  const header = new Uint8Array(13);
  new DataView(header.buffer).setUint32(0, width);
  new DataView(header.buffer).setUint32(4, height);
  header.set([8, 6, 0, 0, 0], 8);
  const parts = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflated),
    chunk("IEND", new Uint8Array(0)),
  ];
  return new Blob(parts, { type: "image/png" });
}

/** The exporter's internals this harness reaches into to hand it the atlas PNG (three 0.185). */
type Writer = {
  json: { images?: Array<{ mimeType: string; bufferView?: number }> };
  cache: { images: Map<unknown, Record<string, number>> };
  pending: Array<Promise<unknown>>;
  processBufferViewImage(blob: Blob): Promise<number>;
};

async function exportGlb(object: THREE.Object3D, atlas: THREE.DataTexture) {
  const png = await encodePng(atlas.image as { data: Uint8Array; width: number; height: number });
  const exporter = new GLTFExporter().register((writer) => ({
    beforeParse() {
      const w = writer as unknown as Writer;
      const imageDef: { mimeType: string; bufferView?: number } = { mimeType: "image/png" };
      w.pending.push(w.processBufferViewImage(png).then((index) => (imageDef.bufferView = index)));
      w.json.images ??= [];
      w.cache.images.set(atlas.image, { [`image/png:flipY/${atlas.flipY}`]: w.json.images.push(imageDef) - 1 });
    },
  }));
  const result = await exporter.parseAsync(object, { binary: true });
  if (!(result instanceof ArrayBuffer)) throw new Error("GLB export did not produce a binary buffer");
  return toBase64(result);
}

type RunOptions = { code: string; arm: Arm; slug: string; tag: string; reportOnly: boolean };

async function run({ code, arm, slug, tag, reportOnly }: RunOptions) {
  const rigged = arm !== "A";
  (globalThis as { THREE?: typeof THREE }).THREE = THREE;
  (0, eval)(code);
  const module = (globalThis as { __creature?: { default?: unknown; build?: unknown; meta?: unknown } }).__creature;
  const build = (module?.default ?? module?.build) as ((kit: Kit) => unknown) | undefined;
  if (typeof build !== "function") throw new Error("creature.ts must `export default function build(kit)`");
  const built = await build(createKit());
  if (!(built instanceof THREE.Object3D)) throw new Error("build(kit) must return a THREE.Object3D");

  const started = performance.now();
  const assembly = await assemble(built, rigged);
  const errors = assembly.issues.filter((issue) => issue.level === "error");
  const size = assembly.bounds.max.map((max, axis) => Number((max - assembly.bounds.min[axis]).toFixed(3)));
  const headParts = assembly.parts.filter(
    (part) => HEAD_PATTERN.test(part.group) || HEAD_PATTERN.test(part.bone ?? ""),
  );
  // Finely meshed parts: mean triangle edge (from area and count) under 1/150 of the model's diagonal. Cut-out
  // parts are left out: their count is the number of cards, not how finely each is cut.
  const diagonal = Math.hypot(...size);
  const fine = assembly.parts
    .filter((part) => !part.cutout && part.triangles >= 48)
    .map((part) => ({
      part: `${part.name}${part.shape === "BufferGeometry" ? "" : ` ${part.shape}`} (${part.bone ? `bone ${part.bone}, ` : ""}group ${part.group})`,
      triangles: part.triangles,
      edge: Number(Math.sqrt((4 * part.area) / (Math.sqrt(3) * part.triangles)).toFixed(4)),
    }))
    .filter((entry) => entry.edge < diagonal / 150)
    .sort((a, b) => b.triangles - a.triangles);
  const looseStarted = performance.now();
  const measureStarted = performance.now();
  const measure = measureIndex(assembly);
  const measureMs = Number((performance.now() - measureStarted).toFixed(2));
  const looseMeasurement = looseClusters(measure);
  const looseMs = Number((performance.now() - looseStarted).toFixed(2));
  const loose = {
    tolerance: Number(looseMeasurement.tolerance.toFixed(4)),
    clusters: looseMeasurement.loose
      .map((cluster) => {
        const parts = cluster.parts
          .map((part) => assembly.parts[part])
          .sort((a, b) => b.area - a.area)
          .map((part) => ({
            name: part.name,
            group: part.group,
            bone: part.bone,
            shape: part.shape,
            triangles: part.triangles,
          }));
        const largest = parts[0];
        const generic = /^(?:part\d+|sweep|extrude|lathe|slab)$/i.test(largest.name);
        const countLabel = `${parts.length} part${parts.length === 1 ? "" : "s"}`;
        const label = generic
          ? `${largest.group} cluster (${largest.name}${largest.bone ? ` on ${largest.bone}` : ""}, ${countLabel})`
          : `${largest.name} (${largest.group}${largest.bone ? `, bone ${largest.bone}` : ""}${parts.length > 1 ? `, ${countLabel}` : ""})`;
        const nearest = assembly.parts[cluster.nearest.b.part];
        return {
          parts,
          count: parts.length,
          area: Number(cluster.area.toFixed(4)),
          gap: Number(cluster.nearest.distance.toFixed(4)),
          nearest: { name: nearest.name, shape: nearest.shape, group: nearest.group, bone: nearest.bone },
          label,
          flat: cluster.flat,
          points: {
            cluster: cluster.nearest.a.point.map((value) => Number(value.toFixed(4))),
            main: cluster.nearest.b.point.map((value) => Number(value.toFixed(4))),
          },
          onFloor: cluster.onFloor,
        };
      })
      .filter((cluster) => !cluster.flat)
      .sort((a, b) => b.gap - a.gap || b.area - a.area),
  };
  const stiffStarted = performance.now();
  const stiffEntries = rigged ? stiffParts(assembly) : [];
  const stiffMs = Number((performance.now() - stiffStarted).toFixed(2));
  const stiff = stiffEntries.map((entry) => ({
    part: assembly.parts[entry.part].name,
    group: assembly.parts[entry.part].group,
    bone: entry.bone,
    share: Number(entry.share.toFixed(4)),
    joints: entry.joints,
  }));
  const report = {
    slug,
    arm,
    tag,
    meta: module?.meta ?? null,
    parts: assembly.parts.length,
    triangles: assembly.triangles,
    vertices: assembly.geometry.getAttribute("position")?.count ?? 0,
    colors: assembly.colors.length,
    textures: assembly.textures.length,
    atlas: assembly.atlas,
    size,
    bounds: assembly.bounds,
    groups: assembly.groups.map((group) => ({
      name: group,
      parts: assembly.parts.filter((part) => part.group === group).length,
    })),
    joints: assembly.joints,
    /** Rig answer key (limb kinds, sides, contacts, hinges, fan banks) when the builder provides one. */
    rig: built.userData.rig as unknown,
    headParts: headParts.length,
    /** Large parts moved by one bone while other joints sit inside them. */
    stiff,
    stiffMs,
    /** Finely meshed parts, most triangles first; `edge` is the mean triangle edge in meters. */
    fine,
    /** Parts in clusters whose surfaces are farther than tolerance from the main body cluster. */
    loose,
    looseMs,
    measureMs,
    fineEdge: Number((diagonal / 150).toFixed(4)),
    issues: assembly.issues,
    assembleMs: Math.round(performance.now() - started),
  };
  if (errors.length || reportOnly) return { report, shots: [], sheet: null, atlas: null, glb: {} };

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xf5f1ea, 0x6d655c, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  const extent = Math.max(...size, 0.5);
  sun.position.set(extent * 1.2, extent * 2.4, extent * 1.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -extent * 1.5,
    right: extent * 1.5,
    top: extent * 1.5,
    bottom: -extent * 1.5,
    near: 0.01,
    far: extent * 8,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = extent * 0.004;
  scene.add(sun);
  const center = new THREE.Vector3(
    (assembly.bounds.min[0] + assembly.bounds.max[0]) / 2,
    0,
    (assembly.bounds.min[2] + assembly.bounds.max[2]) / 2,
  );
  sun.target.position.copy(center);
  sun.position.add(center);
  scene.add(sun.target);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(extent * 8, extent * 8),
    new THREE.ShadowMaterial({ opacity: 0.22 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.copy(center);
  ground.receiveShadow = true;
  scene.add(ground);

  const skinned = rigged ? createSkinnedMesh(assembly, slug) : null;
  const model = skinned ? skinned.mesh : createStaticMesh(assembly, slug);
  model.castShadow = true;
  model.receiveShadow = true;
  scene.add(model);

  const falseGroup = falseColors(assembly, rigged ? "bone" : "group");
  const falseGeometry = assembly.geometry.clone();
  falseGeometry.setAttribute("color", new THREE.Float32BufferAttribute(falseGroup.colors, 3));
  // Cut-out texels (cards, drawn leaves) stay cut out in the false-colour and x-ray shots: the atlas alpha as an alpha map.
  const atlas = assembly.material.map as THREE.DataTexture;
  let alphaMap: THREE.DataTexture | null = null;
  if (assembly.atlas.alpha) {
    const source = atlas.image.data as Uint8Array;
    const data = new Uint8Array(source.length);
    for (let i = 0; i < data.length; i += 4) data.set([source[i + 3], source[i + 3], source[i + 3], 255], i);
    alphaMap = new THREE.DataTexture(data, atlas.image.width, atlas.image.height);
    alphaMap.needsUpdate = true;
  }
  const cutout = alphaMap ? { alphaMap, alphaTest: 0.5 } : {};
  const falseMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0, ...cutout });
  // The x-ray is already see-through (opacity 0.22), so an alpha cut-off would discard all of it: the map alone fades cut-out texels.
  const xrayMaterial = new THREE.MeshStandardMaterial({
    color: 0x9aa7b4,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    ...(alphaMap ? { alphaMap } : {}),
  });

  // Skeleton overlay: joint balls and parent→child sticks drawn on top.
  const overlay = new THREE.Group();
  const jointBalls: Array<{ ball: THREE.Mesh; bone: THREE.Bone }> = [];
  const sticks: Array<{ line: THREE.Mesh; from: THREE.Bone; to: THREE.Bone }> = [];
  if (skinned) {
    const radius = extent * 0.011;
    const ballGeometry = new THREE.SphereGeometry(radius, 12, 8);
    const stickGeometry = new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, 1, 6).translate(0, 0.5, 0);
    const rootMaterial = new THREE.MeshBasicMaterial({ color: 0xff3355, depthTest: false });
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0x1b3cff, depthTest: false });
    const stickMaterial = new THREE.MeshBasicMaterial({ color: 0x0f1a40, depthTest: false });
    for (const bone of skinned.bones) {
      const ball = new THREE.Mesh(ballGeometry, bone === skinned.bones[0] ? rootMaterial : ballMaterial);
      ball.renderOrder = 11;
      overlay.add(ball);
      jointBalls.push({ ball, bone });
      if (bone.parent instanceof THREE.Bone) {
        const line = new THREE.Mesh(stickGeometry, stickMaterial);
        line.renderOrder = 10;
        overlay.add(line);
        sticks.push({ line, from: bone.parent, to: bone });
      }
    }
  }
  const syncOverlay = () => {
    const from = new THREE.Vector3();
    const to = new THREE.Vector3();
    for (const { ball, bone } of jointBalls) bone.getWorldPosition(ball.position);
    for (const { line, from: parent, to: child } of sticks) {
      parent.getWorldPosition(from);
      child.getWorldPosition(to);
      line.position.copy(from);
      const length = from.distanceTo(to);
      line.scale.set(1, Math.max(length, 1e-4), 1);
      line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.sub(from).normalize());
    }
  };

  const restRotations = skinned?.bones.map((bone) => bone.quaternion.clone()) ?? [];
  const setPose = (pose: Pose) => {
    if (!skinned) return;
    const random = createKit().rng(pose === "flexA" ? 11 : pose === "flexB" ? 29 : 1);
    const euler = new THREE.Euler();
    skinned.bones.forEach((bone, index) => {
      bone.quaternion.copy(restRotations[index]);
      if (pose === "rest" || index === 0) return;
      const amount = 28 * (Math.PI / 180);
      euler.set((random() * 2 - 1) * amount, (random() * 2 - 1) * amount, (random() * 2 - 1) * amount);
      bone.quaternion.multiply(new THREE.Quaternion().setFromEuler(euler));
    });
    model.updateMatrixWorld(true);
  };

  const posedPoints = (onlyHead: boolean) => {
    model.updateMatrixWorld(true);
    const position = assembly.geometry.getAttribute("position");
    const partIndex = assembly.geometry.getAttribute("_part");
    const headSet = new Set(headParts.map((part) => part.index));
    const values: number[] = [];
    const vertex = new THREE.Vector3();
    const stride = position.count > 60_000 ? 3 : 1;
    for (let i = 0; i < position.count; i += stride) {
      if (onlyHead && !headSet.has(partIndex.getX(i))) continue;
      (model as THREE.Mesh).getVertexPosition(i, vertex).applyMatrix4(model.matrixWorld);
      values.push(vertex.x, vertex.y, vertex.z);
    }
    return new Float32Array(values);
  };

  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  const heading = `${slug} · arm ${arm} · ${tag}`;
  const shots = [...BASE_SHOTS, ...(rigged ? RIG_SHOTS : GROUP_SHOTS)].filter(
    (shot) => shot.focus !== "head" || headParts.length,
  );
  const images: Array<{ name: string; caption: string; png: string }> = [];
  for (const shot of shots) {
    setPose(shot.pose);
    const originalGeometry = model.geometry;
    if (shot.mode === "groups" || shot.mode === "bones") {
      model.geometry = falseGeometry;
      model.material = falseMaterial;
    } else if (shot.mode === "xray") {
      model.material = xrayMaterial;
      model.castShadow = false;
    }
    if (shot.mode === "xray") {
      syncOverlay();
      scene.add(overlay);
    }
    fitCamera(
      camera,
      posedPoints(shot.focus === "head"),
      new THREE.Vector3(...VIEWS[shot.view]).normalize(),
      shot.focus === "head" ? 1.25 : 1.08,
    );
    const canvas = snapshot(scene, camera, shot.mode === "xray");
    label(canvas, heading, shot.caption, shot.mode === "groups" || shot.mode === "bones" ? falseGroup : undefined);
    images.push({ name: shot.name, caption: shot.caption, png: canvas.toDataURL("image/png") });
    model.geometry = originalGeometry;
    model.material = surfaceOf(assembly);
    model.castShadow = true;
    scene.remove(overlay);
  }
  setPose("rest");

  const columns = 3;
  const sheetCanvas = document.createElement("canvas");
  sheetCanvas.width = TILE * columns;
  sheetCanvas.height = TILE * Math.ceil(images.length / columns);
  const sheetContext = sheetCanvas.getContext("2d")!;
  sheetContext.fillStyle = "#111";
  sheetContext.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);
  for (const [index, image] of images.entries()) {
    const element = new Image();
    element.src = image.png;
    await element.decode();
    sheetContext.drawImage(element, (index % columns) * TILE, Math.floor(index / columns) * TILE, TILE, TILE);
  }
  const sheet = sheetCanvas.toDataURL("image/jpeg", 0.88);

  // The atlas as a picture, v up so drawings stand upright; transparent texels stay transparent.
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = atlasCanvas.height = atlas.image.width;
  const pixels = new ImageData(atlas.image.width, atlas.image.height);
  const row = atlas.image.width * 4;
  const stored = atlas.image.data as Uint8Array;
  for (let y = 0; y < atlas.image.height; y++)
    pixels.data.set(stored.subarray((atlas.image.height - 1 - y) * row, (atlas.image.height - y) * row), y * row);
  atlasCanvas.getContext("2d")!.putImageData(pixels, 0, 0);
  const atlasPng = atlasCanvas.toDataURL("image/png");

  const extras = {
    creatureLab: {
      slug,
      arm,
      tag,
      meta: report.meta,
      parts: assembly.parts.map(({ index, name, group, bone, color, texture }) => ({
        index,
        name,
        group,
        bone,
        color,
        texture,
      })),
      textures: assembly.textures,
      groups: assembly.groups,
      note: "Vertex attribute _PART holds the index into parts[].",
    },
  };
  const glb: Record<string, string> = {};
  const staticMesh = createStaticMesh(assembly, slug);
  staticMesh.userData = extras;
  glb[rigged ? `${slug}-mesh.glb` : `${slug}.glb`] = await exportGlb(staticMesh, atlas);
  if (skinned) {
    model.userData = {
      ...extras,
      creatureLab: {
        ...extras.creatureLab,
        joints: assembly.joints.map(({ name, parent }) => ({ name, parent })),
        rig: report.rig,
      },
    };
    glb[`${slug}-rigged.glb`] = await exportGlb(model, atlas);
  }
  return {
    report,
    shots: images.map(({ name, caption, png }) => ({ name, caption, png })),
    sheet,
    atlas: atlasPng,
    glb,
  };
}

Object.assign(window, { lab: { gpu, run } });
