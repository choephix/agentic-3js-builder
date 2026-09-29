// The one three.js view. It frames a sample like the creature-lab harness (three-quarter view, floor grid at y = 0
// with a soft shadow) and adds what the harness renders as stills, live: false colours by bone or group, weight
// paint for one bone, a skeleton x-ray, and the bend test. For the bend test every smooth-skinned part becomes a
// `SkinnedMesh` over its `userData.skinBones`, so it deforms through its own weights; rigid parts ride their joint.
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Euler,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  ShadowMaterial,
  Skeleton,
  SkinnedMesh,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Bone, Material, Object3D } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Inspection, JointInfo, Part } from "./inspect";

/** The harness's three-quarter view direction and lens. */
const VIEW = new Vector3(0.78, 0.34, 0.85).normalize();
const FOV = 30;
/** The harness flex test bends each bone up to this many degrees per axis. */
export const FLEX_DEGREES = 28;
const ACCENT = new Color("#ff5b1f");
const COLD = new Color("#d5d9df");
const NONE = new Color("#a3a8b0");

const GRID_VERTEX = /* glsl */ `
  varying vec2 ground;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    ground = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
/** Anti-aliased lines every `cellSize` and every 10 cells, in world space, fading from `center` out to `radius`. */
const GRID_FRAGMENT = /* glsl */ `
  uniform float cellSize;
  uniform vec3 center;
  uniform float radius;
  uniform vec3 minor;
  uniform vec3 major;
  varying vec2 ground;
  float lines(float size) {
    vec2 cell = ground / size;
    vec2 gap = abs(fract(cell - 0.5) - 0.5) / fwidth(cell);
    return 1.0 - min(min(gap.x, gap.y), 1.0);
  }
  void main() {
    float small = lines(cellSize);
    float large = lines(cellSize * 10.0);
    float fade = 1.0 - smoothstep(radius * 0.2, radius, length(ground - center.xz));
    gl_FragColor = vec4(mix(minor, major, large), max(small * 0.3, large * 0.55) * fade);
    #include <colorspace_fragment>
  }
`;

export type ColorMode = "shaded" | "bones" | "groups";
/** What to single out: bones (weight paint), groups, or one part; everything else fades. */
export type Focus = { bones?: readonly string[]; groups?: readonly string[]; part?: number };
export type Hit =
  | { kind: "part"; part: Part; weights: Array<[string, number]> | null }
  | { kind: "joint"; joint: JointInfo };
export type Display = { mode: ColorMode; skeleton: boolean; wire: boolean; focus: Focus | null };

/** harness/kit.ts rng: deterministic PRNG in [0, 1). */
function rng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** harness/page.ts false-colour palette. */
export function hue(index: number, total: number) {
  return new Color().setHSL((index * 0.618034) % 1, 0.72, total > 12 && index % 2 ? 0.42 : 0.56);
}

type View = {
  part: Part;
  mesh: Mesh;
  shaded: Material | Material[];
  /** Per-vertex blend of bone colours, skinned parts only. */
  blend: BufferAttribute | null;
  /** Weight paint for the focused bones, and which bones it was painted for. */
  heat: { key: string; colors: BufferAttribute } | null;
  /** The part's own vertex colours (tinted cards), put back when it is shown shaded. */
  own: BufferAttribute | null;
};

export class Viewer {
  readonly canvas: HTMLCanvasElement;
  onHover: (hit: Hit | null, x: number, y: number) => void = () => {};
  onPick: (hit: Hit | null) => void = () => {};
  /** Called every frame the wiggle runs, with the current bend (-1 to 1). */
  onBend: (amount: number) => void = () => {};

  private readonly renderer = new WebGLRenderer({ antialias: true, alpha: true });
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.01, 100);
  private readonly controls: OrbitControls;
  private readonly sun = new DirectionalLight(0xffffff, 2.4);
  private readonly floor = new Group();
  private readonly overlay = new Group();
  private readonly markers = new Group();
  private readonly raycaster = new Raycaster();
  private root: Object3D | null = null;
  private info: Inspection | null = null;
  private views: View[] = [];
  private joints: JointInfo[] = [];
  private rest: Quaternion[] = [];
  private balls: Array<{ ball: Mesh; joint: JointInfo }> = [];
  private sticks: Array<{ stick: Mesh; from: Object3D; to: Object3D }> = [];
  private contacts: Array<{ ring: Mesh; chain: string }> = [];
  private hinges: Line[] = [];
  private bounds = new Box3();
  private display: Display = { mode: "shaded", skeleton: false, wire: false, focus: null };
  private bend = 0;
  private seed = 11;
  private wiggleStart: number | null = null;
  private dirty = true;
  /** Settles once the shown sample's SVG textures have drawn. */
  private textures: Promise<unknown> = Promise.resolve();
  /** The camera is still where `frame()` put it, so a resize re-frames instead of cropping. */
  private framed = true;
  private pointer: { x: number; y: number } | null = null;
  private pointerMoved = false;
  private hoveredJoint: string | null = null;

  private readonly palette = new Map<string, MeshStandardMaterial>();
  private readonly variants = new Map<Material, Map<string, Material>>();
  private readonly ghost = new MeshStandardMaterial({
    color: "#aab1ba",
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  });
  private readonly boneColors = new Map<string, Color>();
  private readonly groupColors = new Map<string, Color>();
  private readonly ballMaterial = new MeshBasicMaterial({ color: "#2f54eb", depthTest: false, transparent: true });
  private readonly rootMaterial = new MeshBasicMaterial({ color: "#ef3e5c", depthTest: false, transparent: true });
  private readonly hotMaterial = new MeshBasicMaterial({ color: ACCENT, depthTest: false, transparent: true });
  private readonly stickMaterial = new MeshBasicMaterial({
    color: "#141a33",
    depthTest: false,
    transparent: true,
    opacity: 0.85,
  });
  private readonly sideMaterials = {
    L: new MeshBasicMaterial({ color: "#2f54eb", transparent: true, opacity: 0.85, depthTest: false }),
    R: new MeshBasicMaterial({ color: "#ef3e5c", transparent: true, opacity: 0.85, depthTest: false }),
    C: new MeshBasicMaterial({ color: "#6b7280", transparent: true, opacity: 0.85, depthTest: false }),
  };
  private readonly hingeMaterial = new LineBasicMaterial({ color: "#9b3fd6", depthTest: false });

  /**
   * `pixelRatio` fixes the drawing buffer's scale (default: the screen's, at most 2); `grid: false` leaves the floor
   * grid out and keeps only the contact shadow.
   */
  constructor(
    private readonly host: HTMLElement,
    private readonly options: { pixelRatio?: number; grid?: boolean } = {},
  ) {
    const renderer = this.renderer;
    renderer.setPixelRatio(options.pixelRatio ?? Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    this.canvas = renderer.domElement;
    host.append(this.canvas);
    this.scene.add(new HemisphereLight(0xf5f1ea, 0x6d655c, 1.9), this.sun, this.sun.target, this.floor);
    this.scene.add(this.overlay, this.markers);
    this.overlay.visible = this.markers.visible = false;
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.radius = 4;
    this.sun.shadow.bias = -0.0004;
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.addEventListener("change", () => (this.dirty = true));
    this.controls.addEventListener("start", () => (this.framed = false));
    new ResizeObserver(() => this.resize()).observe(host);
    this.canvas.addEventListener("pointermove", (event) => {
      this.pointer = { x: event.clientX, y: event.clientY };
      this.pointerMoved = true;
    });
    this.canvas.addEventListener("pointerleave", () => {
      this.pointer = null;
      this.setHoveredJoint(null);
      this.onHover(null, 0, 0);
    });
    let down: { x: number; y: number } | null = null;
    this.canvas.addEventListener("pointerdown", (event) => (down = { x: event.clientX, y: event.clientY }));
    this.canvas.addEventListener("pointerup", (event) => {
      if (event.button !== 0 || !down) return;
      const still = Math.hypot(event.clientX - down.x, event.clientY - down.y) < 4;
      down = null;
      if (still) this.onPick(this.hit(event.clientX, event.clientY));
    });
    this.resize();
    const loop = (time: number) => {
      requestAnimationFrame(loop);
      this.frameTick(time);
    };
    requestAnimationFrame(loop);
  }

  get rigged() {
    return this.joints.length > 0;
  }

  get wiggling() {
    return this.wiggleStart !== null;
  }

  /** Bone and group false colours, for legends. */
  colorOf(kind: "bones" | "groups", name: string | null) {
    const color = name === null ? undefined : (kind === "bones" ? this.boneColors : this.groupColors).get(name);
    return `#${(color ?? NONE).getHexString()}`;
  }

  private resize() {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    // The canvas is sized by CSS; only the drawing buffer follows the host (no ResizeObserver feedback loop).
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
    if (this.framed && this.root) this.frame();
  }

  private frameTick(time: number) {
    if (this.wiggleStart !== null) {
      this.bend = Math.sin(((time - this.wiggleStart) / 1000) * Math.PI);
      this.applyPose();
      this.onBend(this.bend);
    }
    if (this.controls.update()) this.dirty = true;
    if (this.pointerMoved && this.pointer) {
      this.pointerMoved = false;
      const hit = this.hit(this.pointer.x, this.pointer.y);
      this.setHoveredJoint(hit?.kind === "joint" ? hit.joint.name : null);
      this.onHover(hit, this.pointer.x, this.pointer.y);
    }
    if (!this.dirty) return;
    this.dirty = false;
    if (this.overlay.visible) this.updateOverlay();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Show a built sample (or nothing). `keepCamera` keeps the orbit when the same sample reloads after an edit.
   * Pose and display settings carry over.
   */
  show(root: Object3D | null, info: Inspection | null, keepCamera = false) {
    this.clear();
    this.root = root;
    this.info = info;
    if (!root || !info) {
      this.dirty = true;
      return;
    }
    this.scene.add(root);
    root.updateMatrixWorld(true);
    this.joints = info.joints;
    this.rest = this.joints.map((joint) => joint.object.quaternion.clone());
    const byName = new Map(this.joints.map((joint) => [joint.name, joint.object]));
    this.boneColors.clear();
    this.joints.forEach((joint, index) => this.boneColors.set(joint.name, hue(index, this.joints.length)));
    this.groupColors.clear();
    info.groups.forEach((group, index) => this.groupColors.set(group.name, hue(index, info.groups.length)));
    this.views = info.parts.map((part) => this.prepare(part, byName));
    this.bounds = info.bounds.isEmpty() ? new Box3(new Vector3(-0.5, 0, -0.5), new Vector3(0.5, 1, 0.5)) : info.bounds;
    this.stage();
    if (!keepCamera) this.frame();
    this.applyPose();
    this.paint();
    // SVG textures draw asynchronously; show them once they are in.
    const pending = info.parts.flatMap(
      (part) =>
        ([] as Material[])
          .concat(part.mesh.material)
          .map((material) => (material as MeshStandardMaterial).map?.userData.ready as Promise<unknown> | undefined)
          .filter(Boolean) as Array<Promise<unknown>>,
    );
    this.textures = Promise.allSettled(pending).then(() => {
      if (this.root === root) this.dirty = true;
    });
  }

  /** The shown sample as a bitmap of the canvas, once its textures are in. */
  async snapshot() {
    await this.textures;
    // Draw and copy in the same task: without `preserveDrawingBuffer` the buffer is only good until it is shown.
    this.renderer.render(this.scene, this.camera);
    return createImageBitmap(this.canvas);
  }

  /** Swap a skinned part for a `SkinnedMesh` bound to its bones at rest; returns what painting needs. */
  private prepare(part: Part, byName: Map<string, Object3D>): View {
    let mesh = part.mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    let blend: BufferAttribute | null = null;
    const bones = part.skin?.map((name) => byName.get(name));
    if (part.skin && bones?.every(Boolean) && mesh.parent) {
      const skinned = new SkinnedMesh(mesh.geometry, mesh.material);
      skinned.name = mesh.name;
      skinned.userData = mesh.userData;
      skinned.position.copy(mesh.position);
      skinned.quaternion.copy(mesh.quaternion);
      skinned.scale.copy(mesh.scale);
      skinned.castShadow = skinned.receiveShadow = true;
      skinned.frustumCulled = false;
      const parent = mesh.parent;
      parent.children[parent.children.indexOf(mesh)] = skinned;
      skinned.parent = parent;
      mesh.parent = null;
      if (mesh.children.length) skinned.add(...mesh.children);
      skinned.updateMatrixWorld(true);
      skinned.bind(new Skeleton(bones as Bone[]));
      part.mesh = mesh = skinned;
      blend = this.weightColors(part, (name) => this.boneColors.get(name) ?? NONE);
    }
    return {
      part,
      mesh,
      shaded: mesh.material,
      blend,
      heat: null,
      own: (mesh.geometry.getAttribute("color") as BufferAttribute | undefined) ?? null,
    };
  }

  /** Per-vertex colour mixed from each skin bone's colour by its weight. */
  private weightColors(part: Part, colorOf: (bone: string) => Color) {
    const geometry = part.mesh.geometry;
    const index = geometry.getAttribute("skinIndex");
    const weight = geometry.getAttribute("skinWeight");
    const colors = new Float32Array(index.count * 3);
    const mix = new Color();
    for (let i = 0; i < index.count; i++) {
      mix.setRGB(0, 0, 0);
      for (let k = 0; k < 4; k++) {
        const w = weight.getComponent(i, k);
        if (w) mix.add(colorOf(part.skin![index.getComponent(i, k)]).clone().multiplyScalar(w));
      }
      mix.toArray(colors, i * 3);
    }
    return new Float32BufferAttribute(colors, 3);
  }

  private clear() {
    if (this.root) {
      this.scene.remove(this.root);
      this.root.traverse((object) => {
        (object as Mesh).geometry?.dispose();
        (object as SkinnedMesh).skeleton?.dispose();
      });
      for (const view of this.views)
        for (const material of ([] as Material[]).concat(view.shaded)) {
          (material as MeshStandardMaterial).map?.dispose();
          material.dispose();
        }
    }
    for (const variants of this.variants.values()) for (const material of variants.values()) material.dispose();
    this.variants.clear();
    // Cut-out solids hold this sample's textures.
    for (const [key, material] of this.palette)
      if (key.includes("|")) {
        material.dispose();
        this.palette.delete(key);
      }
    for (const object of this.floor.children)
      ([] as Material[]).concat((object as Mesh).material).forEach((m) => m.dispose());
    for (const group of [this.floor, this.overlay, this.markers]) {
      group.traverse((object) => (object as Mesh).geometry?.dispose());
      group.clear();
    }
    this.root = null;
    this.views = [];
    this.joints = [];
    this.rest = [];
    this.balls = [];
    this.sticks = [];
    this.contacts = [];
    this.hinges = [];
  }

  /** Lights, floor, skeleton overlay and rig markers sized to the sample. */
  private stage() {
    const bounds = this.bounds;
    const size = bounds.getSize(new Vector3());
    const extent = Math.max(size.x, size.y, size.z, 0.25);
    const center = new Vector3((bounds.min.x + bounds.max.x) / 2, 0, (bounds.min.z + bounds.max.z) / 2);
    this.sun.position.set(extent * 1.2, extent * 2.4, extent * 1.6).add(center);
    this.sun.target.position.copy(center);
    Object.assign(this.sun.shadow.camera, {
      left: -extent * 1.5,
      right: extent * 1.5,
      top: extent * 1.5,
      bottom: -extent * 1.5,
      near: 0.01,
      far: extent * 8,
    });
    this.sun.shadow.camera.updateProjectionMatrix();
    this.sun.shadow.normalBias = extent * 0.004;

    const shadow = new Mesh(new PlaneGeometry(extent * 8, extent * 8), new ShadowMaterial({ opacity: 0.16 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.copy(center);
    shadow.receiveShadow = true;
    this.floor.add(shadow);
    if (this.options.grid !== false) {
      // 10 cm cells with metre lines for small objects, 50 cm and 5 m for large ones; the grid fades out with distance.
      const grid = new Mesh(
        new PlaneGeometry(extent * 8, extent * 8).rotateX(-Math.PI / 2),
        new ShaderMaterial({
          uniforms: {
            cellSize: { value: extent > 3 ? 0.5 : 0.1 },
            center: { value: center.clone() },
            radius: { value: extent * 1.3 },
            minor: { value: new Color("#a4a9b1") },
            major: { value: new Color("#80868f") },
          },
          vertexShader: GRID_VERTEX,
          fragmentShader: GRID_FRAGMENT,
          transparent: true,
          depthWrite: false,
        }),
      );
      grid.position.set(center.x, 0.0005, center.z);
      this.floor.add(grid);
    }

    const radius = extent * 0.0075;
    const ball = new SphereGeometry(radius, 14, 10);
    const stick = new CylinderGeometry(radius * 0.42, radius * 0.42, 1, 6).translate(0, 0.5, 0);
    for (const joint of this.joints) {
      const mesh = new Mesh(ball, joint.parent ? this.ballMaterial : this.rootMaterial);
      mesh.renderOrder = 11;
      this.overlay.add(mesh);
      this.balls.push({ ball: mesh, joint });
      const parent = this.joints.find((other) => other.name === joint.parent);
      if (!parent) continue;
      const bar = new Mesh(stick, this.stickMaterial);
      bar.renderOrder = 10;
      this.overlay.add(bar);
      this.sticks.push({ stick: bar, from: parent.object, to: joint.object });
    }

    const rig = this.info?.rig;
    if (!rig) return;
    const ring = new RingGeometry(extent * 0.018, extent * 0.028, 32).rotateX(-Math.PI / 2);
    for (const chain of rig.chains) {
      if (!chain.contact) continue;
      const mesh = new Mesh(ring, this.sideMaterials[chain.side]);
      mesh.position.set(chain.contact[0], chain.contact[1] + 0.001, chain.contact[2]);
      mesh.renderOrder = 12;
      this.markers.add(mesh);
      this.contacts.push({ ring: mesh, chain: chain.name });
    }
    for (const record of rig.joints) {
      const joint = this.joints.find((entry) => entry.name === record.name);
      if (!record.hinge || !joint) continue;
      // Hinges ride their joint, so the axis bends along in the bend test.
      const axis = new Vector3(...record.hinge).applyQuaternion(
        joint.object.getWorldQuaternion(new Quaternion()).invert(),
      );
      const half = axis.multiplyScalar(extent * 0.06);
      const geometry = new BufferGeometry().setFromPoints([half.clone().negate(), half]);
      const line = new Line(geometry, this.hingeMaterial);
      line.renderOrder = 12;
      joint.object.add(line);
      line.visible = this.markers.visible;
      this.hinges.push(line);
    }
  }

  private updateOverlay() {
    const from = new Vector3();
    const to = new Vector3();
    const up = new Vector3(0, 1, 0);
    for (const { ball, joint } of this.balls) joint.object.getWorldPosition(ball.position);
    for (const { stick, from: parent, to: child } of this.sticks) {
      parent.getWorldPosition(from);
      child.getWorldPosition(to);
      stick.position.copy(from);
      stick.scale.set(1, Math.max(from.distanceTo(to), 1e-4), 1);
      stick.quaternion.setFromUnitVectors(up, to.sub(from).normalize());
    }
  }

  /** Frame the sample's bounds from the three-quarter view so every corner fits (like harness fitCamera). */
  frame() {
    const bounds = this.bounds;
    const center = bounds.getCenter(new Vector3());
    const right = new Vector3().crossVectors(new Vector3(0, 1, 0), VIEW).normalize();
    const up = new Vector3().crossVectors(VIEW, right).normalize();
    const vertical = Math.tan((FOV * Math.PI) / 360);
    const horizontal = vertical * this.camera.aspect;
    const corner = new Vector3();
    let distance = 0;
    for (let i = 0; i < 8; i++) {
      corner
        .set(
          i & 1 ? bounds.max.x : bounds.min.x,
          i & 2 ? bounds.max.y : bounds.min.y,
          i & 4 ? bounds.max.z : bounds.min.z,
        )
        .sub(center);
      const lateral = Math.max(Math.abs(corner.dot(right)) / horizontal, Math.abs(corner.dot(up)) / vertical);
      distance = Math.max(distance, lateral * 1.18 + corner.dot(VIEW));
    }
    const radius = bounds.getSize(new Vector3()).length() / 2;
    this.camera.position.copy(center).addScaledVector(VIEW, distance);
    this.camera.near = distance / 100;
    this.camera.far = distance * 20;
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(center);
    this.controls.minDistance = radius * 0.3;
    this.controls.maxDistance = distance * 4;
    this.controls.update();
    this.dirty = true;
    this.framed = true;
  }

  setDisplay(display: Partial<Display>) {
    Object.assign(this.display, display);
    this.overlay.visible = this.display.skeleton && this.rigged;
    this.paint();
  }

  setRigMarkers(visible: boolean, chains: readonly string[] = []) {
    this.markers.visible = visible;
    for (const line of this.hinges) line.visible = visible;
    for (const { ring, chain } of this.contacts) ring.scale.setScalar(chains.includes(chain) ? 1.6 : 1);
    this.dirty = true;
  }

  /** Bend every bone but the root by a seeded random angle, scaled by `amount` (-1 to 1). */
  pose(amount: number, seed = this.seed) {
    this.bend = Math.max(-1, Math.min(1, amount));
    this.seed = seed;
    if (this.wiggleStart !== null) this.wiggle(true);
    this.applyPose();
  }

  wiggle(on: boolean) {
    // Start at the current bend so the motion continues from there.
    this.wiggleStart = on ? performance.now() - (Math.asin(this.bend) / Math.PI) * 1000 : null;
  }

  private applyPose() {
    const random = rng(this.seed);
    const euler = new Euler();
    const bend = new Quaternion();
    const limit = FLEX_DEGREES * (Math.PI / 180) * this.bend;
    this.joints.forEach((joint, index) => {
      joint.object.quaternion.copy(this.rest[index]);
      if (index === 0) return;
      euler.set((random() * 2 - 1) * limit, (random() * 2 - 1) * limit, (random() * 2 - 1) * limit);
      joint.object.quaternion.multiply(bend.setFromEuler(euler));
    });
    // Picking a skinned part checks its bounding sphere, which the pose just moved.
    for (const view of this.views) if (view.blend) Object.assign(view.mesh, { boundingSphere: null });
    this.root?.updateMatrixWorld(true);
    this.dirty = true;
  }

  /** Give every part the material the display asks for. */
  private paint() {
    const { mode, skeleton, wire, focus } = this.display;
    const xray = skeleton && this.rigged;
    const bones = focus?.bones ? new Set(focus.bones) : null;
    const key = focus?.bones?.join(",") ?? "";
    for (const view of this.views) {
      const { part, mesh } = view;
      let material: Material | Material[];
      let faded = false;
      if (bones) {
        if (part.skin && view.blend) {
          faded = !part.skin.some((name) => bones.has(name));
          if (!faded && view.heat?.key !== key)
            view.heat = { key, colors: this.weightColors(part, (name) => (bones.has(name) ? ACCENT : COLD)) };
          if (!faded) mesh.geometry.setAttribute("color", view.heat!.colors);
          material = this.solid(null, view);
        } else {
          material = this.solid(ACCENT, view);
          faded = !bones.has(part.bone ?? "");
        }
      } else {
        if (mode === "shaded") {
          material = view.shaded;
          if (view.own) mesh.geometry.setAttribute("color", view.own);
        } else if (mode === "bones" && view.blend) {
          mesh.geometry.setAttribute("color", view.blend);
          material = this.solid(null, view);
        } else if (mode === "bones") material = this.solid(this.boneColors.get(part.bone ?? "") ?? NONE, view);
        else material = this.solid(this.groupColors.get(part.group) ?? NONE, view);
        if (focus?.groups && !focus.groups.includes(part.group)) faded = true;
        if (focus?.part !== undefined && focus.part !== part.index) faded = true;
      }
      mesh.material = faded
        ? this.variant(this.ghost, false, wire)
        : Array.isArray(material)
          ? material.map((entry) => this.variant(entry, xray, wire))
          : this.variant(material, xray, wire);
      mesh.castShadow = !faded && !xray;
    }
    for (const { ball, joint } of this.balls) {
      const hot = bones?.has(joint.name) || this.hoveredJoint === joint.name;
      ball.material = hot ? this.hotMaterial : joint.parent ? this.ballMaterial : this.rootMaterial;
      ball.scale.setScalar(hot ? 1.6 : 1);
    }
    this.dirty = true;
  }

  private setHoveredJoint(name: string | null) {
    if (name === this.hoveredJoint) return;
    this.hoveredJoint = name;
    this.paint();
  }

  /**
   * A flat matte colour, or the vertex colours (weight paint, bone blends) when `color` is null. A cut-out part
   * (cards) keeps its texture's shape.
   */
  private solid(color: Color | null, view?: View) {
    const cut = ([] as Material[]).concat(view?.shaded ?? [])[0] as MeshStandardMaterial | undefined;
    const shape = cut?.map && cut.alphaTest > 0 ? cut.map : null;
    const key = `${color ? color.getHexString() : "vertex"}${shape ? `|${shape.uuid}` : ""}`;
    let material = this.palette.get(key);
    if (!material)
      this.palette.set(
        key,
        (material = new MeshStandardMaterial({
          ...(color ? { color } : { vertexColors: true }),
          roughness: 0.8,
          metalness: 0,
          ...(shape ? { map: shape, alphaTest: 0.5 } : {}),
        })),
      );
    return material;
  }

  /** The material as is, see-through for the skeleton x-ray, and/or as wireframe. */
  private variant(material: Material, xray: boolean, wire: boolean) {
    if (!xray && !wire) return material;
    const key = `${xray ? "x" : ""}${wire ? "w" : ""}`;
    let variants = this.variants.get(material);
    if (!variants) this.variants.set(material, (variants = new Map()));
    let variant = variants.get(key);
    if (!variant) {
      variant = material.clone();
      if (xray) Object.assign(variant, { transparent: true, opacity: 0.26, depthWrite: false });
      if (wire) (variant as MeshStandardMaterial).wireframe = true;
      variants.set(key, variant);
    }
    return variant;
  }

  /** What is under a client point: a joint of the skeleton x-ray first, else a part. */
  private hit(x: number, y: number): Hit | null {
    if (!this.root) return null;
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new Vector2(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    if (this.overlay.visible) {
      this.updateOverlay();
      const [joint] = this.raycaster.intersectObjects(
        this.balls.map((entry) => entry.ball),
        false,
      );
      const found = joint && this.balls.find((entry) => entry.ball === joint.object);
      if (found) return { kind: "joint", joint: found.joint };
    }
    const hits = this.raycaster.intersectObjects(
      this.views.map((view) => view.mesh),
      false,
    );
    const first = hits[0];
    const view = first && this.views.find((entry) => entry.mesh === first.object);
    if (!view) return null;
    let weights: Array<[string, number]> | null = null;
    if (view.part.skin && first.face) {
      const mesh = view.mesh;
      const vertex = new Vector3();
      const nearest = [first.face.a, first.face.b, first.face.c]
        .map((index) => ({
          index,
          distance: mesh.localToWorld(mesh.getVertexPosition(index, vertex)).distanceTo(first.point),
        }))
        .sort((a, b) => a.distance - b.distance)[0].index;
      const index = mesh.geometry.getAttribute("skinIndex");
      const weight = mesh.geometry.getAttribute("skinWeight");
      weights = [];
      for (let k = 0; k < 4; k++) {
        const w = weight.getComponent(nearest, k);
        if (w > 0.005) weights.push([view.part.skin[index.getComponent(nearest, k)], w]);
      }
      weights.sort((a, b) => b[1] - a[1]);
    }
    return { kind: "part", part: view.part, weights };
  }
}
