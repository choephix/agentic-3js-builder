// Optional: play a recorded build (`src/record.ts`) back as a short loading animation. Every part arrives within a
// hard cap however many there are, in the order the build made them, both sides of a mirrored pair at once; joints
// the build posed swing from where they were into their pose; shadows grow with the parts. When it is done the
// model has its own materials back and is exactly the built model. Not part of `src/index.ts`.
import {
  Box3,
  BufferAttribute,
  Color,
  DoubleSide,
  FrontSide,
  Matrix4,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  RGBADepthPacking,
  Texture,
  Vector3,
} from "three";
import type {
  BufferGeometry,
  Camera,
  ColorRepresentation,
  Material,
  Mesh,
  Object3D,
  Scene,
  WebGLRenderer,
} from "three";
import { GROWTH } from "./context";
import { pairMirrors } from "./record";
import type { Call, Placement, Recording } from "./record";

// ── Growth coordinates ────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Per vertex, 0..1: how far the part's reveal front must be to show it. SDK shapes carry their own (`GROWTH`); for
 * other geometry (three.js shapes passed to `part()`), the part grows along its long axis from the end nearest its
 * origin (the bone it hangs on), mixed with distance from that origin, so tubes extend and blobs swell outwards.
 */
export function growthOf(geometry: BufferGeometry) {
  const own = geometry.getAttribute(GROWTH);
  if (own) return own;
  const position = geometry.getAttribute("position");
  const n = position.count;
  const out = new Float32Array(n);
  const c = new Vector3();
  const p = new Vector3();
  for (let i = 0; i < n; i++) c.add(p.fromBufferAttribute(position, i));
  c.divideScalar(Math.max(n, 1));
  let xx = 0,
    xy = 0,
    xz = 0,
    yy = 0,
    yz = 0,
    zz = 0;
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(position, i).sub(c);
    xx += p.x * p.x;
    xy += p.x * p.y;
    xz += p.x * p.z;
    yy += p.y * p.y;
    yz += p.y * p.z;
    zz += p.z * p.z;
  }
  // The principal axis, by power iteration on the covariance.
  const axis = new Vector3(1, 0.7, 0.3).normalize();
  for (let k = 0; k < 12; k++)
    axis
      .set(
        xx * axis.x + xy * axis.y + xz * axis.z,
        xy * axis.x + yy * axis.y + yz * axis.z,
        xz * axis.x + yz * axis.y + zz * axis.z,
      )
      .normalize();
  if (axis.lengthSq() === 0) axis.set(0, 1, 0);
  if (axis.dot(c) > 0) axis.negate();
  let lo = Infinity,
    hi = -Infinity,
    near = Infinity,
    far = 0;
  const along = new Float32Array(n);
  const radial = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(position, i);
    radial[i] = p.length();
    along[i] = p.sub(c).dot(axis);
    lo = Math.min(lo, along[i]);
    hi = Math.max(hi, along[i]);
    near = Math.min(near, radial[i]);
    far = Math.max(far, radial[i]);
  }
  for (let i = 0; i < n; i++) {
    const a = hi > lo ? (along[i] - lo) / (hi - lo) : 0;
    const r = far > near ? (radial[i] - near) / (far - near) : 0;
    out[i] = Math.min(1, 0.7 * a + 0.3 * r);
  }
  return new BufferAttribute(out, 1);
}

// ── Poses ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Replays the joint moves a build made (`Call.moves`, from `pose()`): `apply(progress)` puts every moved joint where
 * it stood at that point of the playback, `progress(call)` being 0 before a move call starts and 1 once it is done.
 * Rigid parts ride their joints; blend-skinned parts (`userData.skinBones`) are re-deformed from their finished
 * vertices by linear blend of each bone's motion since the finished pose.
 */
export type Poser = {
  /** The calls that moved joints. */
  calls: Call[];
  apply(progress: (call: Call) => number): void;
};

/** The build's joint moves as a `Poser`; null when it moved none. */
export function poser(recording: Recording): Poser | null {
  const { root } = recording;
  const tracks = new Map<Object3D, Array<{ call: Call; from: Placement; to: Placement }>>();
  for (const call of recording.calls)
    for (const move of call.moves) {
      const track = tracks.get(move.joint);
      if (track) track.push({ call, ...move });
      else tracks.set(move.joint, [{ call, ...move }]);
    }
  if (!tracks.size) return null;
  root.updateMatrixWorld(true);
  const toModel = (object: Object3D, inverseRoot: Matrix4) => inverseRoot.clone().multiply(object.matrixWorld);
  const finalRoot = root.matrixWorld.clone().invert();

  // Joints whose model-space placement any move changes: the moved ones and every joint below them.
  const moving = new Set<Object3D>();
  for (const joint of tracks.keys()) joint.traverse((node) => moving.add(node));
  const byName = new Map<string, Object3D>();
  root.traverse((node) => {
    if (typeof node.userData.joint === "string") byName.set(node.userData.joint, node);
  });
  const skins: Array<{
    mesh: Mesh;
    bones: Object3D[];
    /** Inverse model-space bone matrices in the finished pose. */
    bonesInverse: Matrix4[];
    meshFinal: Matrix4;
    positions: Float32Array;
    normals: Float32Array;
  }> = [];
  root.traverse((node) => {
    const mesh = node as Mesh;
    const names = mesh.userData.skinBones as string[] | undefined;
    if (!mesh.isMesh || !names || !mesh.geometry.getAttribute("skinWeight")) return;
    const bones = names.map((name) => byName.get(name)!);
    if (!bones.some((bone) => moving.has(bone))) return;
    skins.push({
      mesh,
      bones,
      bonesInverse: bones.map((bone) => toModel(bone, finalRoot).invert()),
      meshFinal: toModel(mesh, finalRoot),
      positions: Float32Array.from(mesh.geometry.getAttribute("position").array),
      normals: Float32Array.from(mesh.geometry.getAttribute("normal").array),
    });
  });

  let last = "";
  const motions: Matrix4[] = [];
  return {
    calls: [...new Set([...tracks.values()].flatMap((track) => track.map((m) => m.call)))],
    apply(progress: (call: Call) => number) {
      const ks = [...tracks.values()].map((track) => track.map((m) => Math.min(Math.max(progress(m.call), 0), 1)));
      const key = ks.flat().join();
      if (key === last) return;
      last = key;
      let settled = true;
      [...tracks].forEach(([joint, track], j) => {
        const i = ks[j].findIndex((k) => k < 1);
        if (i < 0) {
          const { to } = track[track.length - 1];
          joint.position.copy(to.position);
          joint.quaternion.copy(to.quaternion);
          return;
        }
        settled = false;
        const { from, to } = track[i];
        joint.position.lerpVectors(from.position, to.position, ks[j][i]);
        joint.quaternion.slerpQuaternions(from.quaternion, to.quaternion, ks[j][i]);
      });
      root.updateMatrixWorld(true);
      const inverseRoot = root.matrixWorld.clone().invert();
      for (const skin of skins) {
        const geometry = skin.mesh.geometry;
        const position = geometry.getAttribute("position") as BufferAttribute;
        const normal = geometry.getAttribute("normal") as BufferAttribute;
        if (settled) {
          (position.array as Float32Array).set(skin.positions);
          (normal.array as Float32Array).set(skin.normals);
        } else {
          // Per bone: finished mesh-local → finished model space → that bone's motion since → mesh-local now.
          const meshNowInverse = toModel(skin.mesh, inverseRoot).invert();
          skin.bones.forEach((bone, b) => {
            motions[b] = meshNowInverse
              .clone()
              .multiply(toModel(bone, inverseRoot))
              .multiply(skin.bonesInverse[b])
              .multiply(skin.meshFinal);
          });
          const index = geometry.getAttribute("skinIndex");
          const weight = geometry.getAttribute("skinWeight");
          const p = position.array as Float32Array;
          const n = normal.array as Float32Array;
          const { positions: p0, normals: n0 } = skin;
          for (let v = 0; v < position.count; v++) {
            let px = 0,
              py = 0,
              pz = 0,
              nx = 0,
              ny = 0,
              nz = 0;
            for (let k = 0; k < 4; k++) {
              const w = weight.getComponent(v, k);
              if (!w) continue;
              const e = motions[index.getComponent(v, k)].elements;
              const [x, y, z] = [p0[v * 3], p0[v * 3 + 1], p0[v * 3 + 2]];
              const [a, c, d] = [n0[v * 3], n0[v * 3 + 1], n0[v * 3 + 2]];
              px += w * (e[0] * x + e[4] * y + e[8] * z + e[12]);
              py += w * (e[1] * x + e[5] * y + e[9] * z + e[13]);
              pz += w * (e[2] * x + e[6] * y + e[10] * z + e[14]);
              nx += w * (e[0] * a + e[4] * c + e[8] * d);
              ny += w * (e[1] * a + e[5] * c + e[9] * d);
              nz += w * (e[2] * a + e[6] * c + e[10] * d);
            }
            const length = Math.hypot(nx, ny, nz) || 1;
            p.set([px, py, pz], v * 3);
            n.set([nx / length, ny / length, nz / length], v * 3);
          }
        }
        position.needsUpdate = true;
        normal.needsUpdate = true;
      }
    },
  };
}

// ── The reveal ────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * pop: parts scale in from their bones with a small overshoot. rise: each part grows along its own construction
 * (`growthOf`). ghost: a faint stippled outline of the whole model first, filled in as parts rise. print: one cut
 * plane sweeps up through the model, ignoring build order.
 */
export const REVEAL_STYLES = ["pop", "rise", "ghost", "print"] as const;
export type RevealStyle = (typeof REVEAL_STYLES)[number];
export type RevealOptions = {
  /** Default "pop". */
  style?: RevealStyle;
  /** Seconds from start to the finished model. Default 1.2. */
  cap?: number;
  /** The ghost style's outline colour. */
  ghost?: ColorRepresentation;
};

/** Share of the cap in which parts start; each part then grows for the rest. */
const SPAWN = 0.65;
/** Schedule weight of a pose, as a share of the model's size (a mid-sized part). */
const POSE_WEIGHT = 0.05;

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

// Style indices follow REVEAL_STYLES: 0 pop, 1 rise, 2 ghost, 3 print.
const FRAGMENT_START = /* glsl */ `
float ldEdge = 0.0;
bool ldGhost = false;
if (uStyle == 3) {
  if (vLdY > uFront) discard;
  ldEdge = 1.0 - smoothstep(0.0, uBand, uFront - vLdY);
} else if (uStyle >= 1 && uK < 1.0) {
  float front = uK * 1.05;
  if (vGrow > front) {
    if (uStyle == 1) discard;
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

// The shadow pass: a part casts only what has grown (the ghost's outline casts nothing).
const DEPTH_START = /* glsl */ `
if (uStyle == 3) {
  if (vLdY > uFront) discard;
} else if (uStyle >= 1 && uK < 1.0 && vGrow > uK * 1.05) discard;
`;

const VERTEX_HEAD = "attribute float aGrow;\nvarying float vGrow;\nvarying float vLdY;\nvoid main() {";
const VERTEX_BEGIN = "#include <begin_vertex>\nvGrow = aGrow;\nvLdY = (modelMatrix * vec4(transformed, 1.0)).y;";

type Piece = {
  mesh: Mesh;
  original: Material | Material[];
  animated: Material | Material[];
  depth: MeshDepthMaterial | null;
  originalDepth: Material | undefined;
  k: { value: number };
  scale: Vector3;
  /** Bounding-sphere radius and centre in model space. */
  size: number;
  center: Vector3;
  /** World height of the centre, measured at `start`. */
  height: number;
  /** Start as a share of the cap. */
  start: number;
};

const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const easeBack = (k: number) => 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2);

/**
 * A recorded build played back as a loading animation. Place `root` (the model the build returned), call `start`,
 * then `update` every frame until it returns false; the model is then exactly as built.
 */
export class Reveal {
  style: RevealStyle;
  cap: number;
  readonly root: Object3D;
  /** Meshes the recording added, each revealed on its own schedule. */
  readonly parts: number;
  /** Mirrored call pairs, which build both sides at once. */
  readonly pairs: number;
  /** Calls that moved joints (poses), replayed as the joints swing into place. */
  readonly poses: number;
  /** True once a started reveal has finished. */
  done = false;
  private readonly pieces: Piece[] = [];
  private readonly moves = new Map<Call, number>();
  private readonly poser: Poser | null;
  private readonly uniforms = {
    uStyle: { value: 0 },
    uGhost: { value: new Color("#5d7a9c") },
    uFront: { value: 0 },
    uBand: { value: 0.02 },
  };
  private startedAt = Infinity;
  private held: number | null = null;
  private bottom = 0;
  private top = 1;

  constructor(recording: Recording, options: RevealOptions = {}) {
    this.style = options.style ?? "pop";
    this.cap = options.cap ?? 1.2;
    if (options.ghost !== undefined) this.uniforms.uGhost.value.set(options.ghost);
    this.root = recording.root;
    this.root.updateMatrixWorld(true);
    const toModel = this.root.matrixWorld.clone().invert();
    const byObject = new Map<Object3D, Piece>();
    for (const call of recording.calls)
      for (const object of call.objects) {
        const mesh = object as Mesh;
        if (!mesh.isMesh || byObject.has(mesh)) continue;
        if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
        const world = toModel.clone().multiply(mesh.matrixWorld);
        mesh.geometry.setAttribute("aGrow", growthOf(mesh.geometry));
        const piece: Piece = {
          mesh,
          original: mesh.material,
          animated: mesh.material,
          depth: null,
          originalDepth: mesh.customDepthMaterial,
          k: { value: 0 },
          scale: mesh.scale.clone(),
          size: mesh.geometry.boundingSphere!.radius * world.getMaxScaleOnAxis(),
          center: mesh.geometry.boundingSphere!.center.clone().applyMatrix4(world),
          height: 0,
          start: 0,
        };
        const list = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(
          (m) => this.animated(m, piece) ?? m,
        );
        piece.animated = Array.isArray(mesh.material) ? list : list[0];
        if (mesh.castShadow) piece.depth = this.depthMaterial(list[0], piece);
        byObject.set(mesh, piece);
        this.pieces.push(piece);
      }
    pairMirrors(recording);
    this.pairs = recording.calls.filter((c) => c.twin).length;
    this.poser = poser(recording);
    this.poses = this.poser?.calls.length ?? 0;
    this.parts = this.pieces.length;

    // Units (a call, or a call and its mirror image) in build order, each given a slice of the spawn window in
    // proportion to its size, so the big parts set the pace and runs of small ones land almost together.
    const box = new Box3();
    for (const piece of this.pieces) box.expandByPoint(piece.center);
    const extent = Math.max(...box.getSize(new Vector3()).toArray(), 1e-3);
    const units = recording.calls
      .filter((call) => (call.objects.length || call.moves.length) && !call.twinOf)
      .map((call) => (call.twin ? [call, call.twin] : [call]));
    const weights = units.map(([call]) =>
      call.objects.length
        ? Math.max(0.002, ...call.objects.map((o) => (byObject.get(o)?.size ?? 0) / extent))
        : POSE_WEIGHT,
    );
    const total = weights.reduce((s, w) => s + w, 0);
    let before = 0;
    units.forEach((unit, i) => {
      const start = (SPAWN * before) / total;
      for (const call of unit) {
        if (call.moves.length) this.moves.set(call, start);
        for (const object of call.objects) {
          const piece = byObject.get(object);
          if (piece) piece.start = start;
        }
      }
      before += weights[i];
    });
  }

  private animated(original: Material, piece: Piece): Material | null {
    if (
      !(
        original instanceof MeshStandardMaterial ||
        original instanceof MeshLambertMaterial ||
        original instanceof MeshPhongMaterial ||
        original instanceof MeshBasicMaterial
      )
    )
      return null;
    const material = original.clone();
    const cross = original.side === FrontSide;
    if (cross) material.side = DoubleSide;
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms, { uK: piece.k, uCross: { value: cross ? 1 : 0 } });
      shader.vertexShader = shader.vertexShader
        .replace("void main() {", VERTEX_HEAD)
        .replace("#include <begin_vertex>", VERTEX_BEGIN);
      shader.fragmentShader = shader.fragmentShader
        .replace("void main() {", `${FRAGMENT_HEAD}\nvoid main() {`)
        .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>\n${FRAGMENT_START}`)
        .replace("#include <dithering_fragment>", FRAGMENT_END);
    };
    material.customProgramCacheKey = () => "reveal-1";
    return material;
  }

  private depthMaterial(source: Material, piece: Piece) {
    const material = new MeshDepthMaterial({
      depthPacking: RGBADepthPacking,
      map: "map" in source && source.map instanceof Texture ? source.map : null,
      alphaTest: source.alphaTest,
    });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms, { uK: piece.k });
      shader.vertexShader = shader.vertexShader
        .replace("void main() {", VERTEX_HEAD)
        .replace("#include <begin_vertex>", VERTEX_BEGIN);
      shader.fragmentShader = shader.fragmentShader
        .replace("void main() {", `${FRAGMENT_HEAD}\nvoid main() {`)
        .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>\n${DEPTH_START}`);
    };
    material.customProgramCacheKey = () => "reveal-depth-1";
    return material;
  }

  private useAnimated() {
    for (const piece of this.pieces) {
      piece.mesh.material = piece.animated;
      if (piece.depth) piece.mesh.customDepthMaterial = piece.depth;
    }
  }

  private useOriginal() {
    for (const piece of this.pieces) {
      piece.mesh.material = piece.original;
      piece.mesh.customDepthMaterial = piece.originalDepth;
    }
  }

  /**
   * Start (or restart) at `at` (a `performance.now()` time; default now). Place the model first: the print style's
   * cut plane runs from its lowest to its highest point where it stands.
   */
  start(at = performance.now()) {
    this.poser?.apply(() => 1);
    this.root.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(this.root);
    this.bottom = bounds.min.y;
    this.top = bounds.max.y;
    this.uniforms.uBand.value = (this.top - this.bottom) * 0.03;
    const toWorld = this.root.matrixWorld;
    for (const piece of this.pieces) piece.height = piece.center.clone().applyMatrix4(toWorld).y;
    this.startedAt = at;
    this.done = false;
    this.useAnimated();
    this.root.visible = false;
  }

  /** Hold every unfinished frame at `seconds` into the reveal (null resumes the clock): for screenshots and tests. */
  hold(seconds: number | null) {
    this.held = seconds;
  }

  /** Advance to `now`; false once the model is finished (and before `start`). */
  update(now = performance.now()) {
    if (this.done) return false;
    const t = this.held ?? (now - this.startedAt) / 1000;
    if (t < 0) return true;
    if (t >= this.cap) {
      this.finish();
      return false;
    }
    this.root.visible = true;
    const style = this.style;
    this.uniforms.uStyle.value = REVEAL_STYLES.indexOf(style);
    const grow = this.cap * (1 - SPAWN);
    const progress = (start: number) => Math.min(Math.max((t - start * this.cap) / grow, 0), 1);
    this.uniforms.uFront.value = this.bottom + (this.top - this.bottom) * 1.04 * easeOut(t / this.cap);
    this.poser?.apply((call) => (style === "print" ? 1 : easeOut(progress(this.moves.get(call) ?? 0))));
    for (const piece of this.pieces) {
      const k = progress(piece.start);
      piece.mesh.scale.copy(piece.scale);
      if (style === "print") {
        piece.k.value = 1;
        piece.mesh.visible = piece.animated !== piece.original || piece.height < this.uniforms.uFront.value;
      } else if (style === "pop") {
        piece.k.value = 1;
        piece.mesh.visible = k > 0;
        piece.mesh.scale.multiplyScalar(Math.max(easeBack(k), 0.001));
      } else {
        piece.k.value = easeOut(k);
        piece.mesh.visible = style === "ghost" || k > 0;
      }
    }
    return true;
  }

  /** Jump to the finished model: its own materials, scales, visibility and pose. */
  finish() {
    this.done = true;
    this.root.visible = true;
    this.poser?.apply(() => 1);
    this.useOriginal();
    for (const piece of this.pieces) {
      piece.mesh.scale.copy(piece.scale);
      piece.mesh.visible = true;
    }
  }

  /**
   * Compile both material sets and upload every texture before anything moves, so neither the first frame nor the
   * swap back to the model's own materials stalls. `scene` supplies the lights; the model need not be in it yet.
   */
  async warm(renderer: WebGLRenderer, camera: Camera, scene: Scene) {
    const visible = this.root.visible;
    this.root.visible = true;
    const compiling = [renderer.compileAsync(this.root, camera, scene)];
    this.useAnimated();
    compiling.push(renderer.compileAsync(this.root, camera, scene));
    if (this.startedAt === Infinity || this.done) this.useOriginal();
    this.root.visible = visible;
    for (const piece of this.pieces)
      for (const m of Array.isArray(piece.original) ? piece.original : [piece.original])
        for (const value of Object.values(m)) if (value instanceof Texture) renderer.initTexture(value);
    await Promise.all(compiling);
  }

  /** Restore the finished model and free the reveal's own materials. */
  dispose() {
    this.finish();
    for (const piece of this.pieces) {
      if (piece.animated !== piece.original)
        for (const m of Array.isArray(piece.animated) ? piece.animated : [piece.animated])
          if (!(Array.isArray(piece.original) ? piece.original : [piece.original]).includes(m)) m.dispose();
      piece.depth?.dispose();
      piece.mesh.geometry.deleteAttribute("aGrow");
    }
  }
}
