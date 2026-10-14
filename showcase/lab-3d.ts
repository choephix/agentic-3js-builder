// The lab viewer's 3D view: the harness's exported GLB of a build in an orbiting three.js scene, lit like the
// renders (a room environment and a key light) on the renders' grey. It loads the rigged GLB when there is one, so
// the bones can wiggle and show; otherwise the static mesh. Loaded only when the 3D view opens.
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  Euler,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  Scene,
  SkeletonHelper,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Bone,
  type Material,
  type Object3D,
  type SkinnedMesh,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/** What the 3D view shows; it carries over from build to build. */
export type Options = { turntable: boolean; wiggle: boolean; skeleton: boolean; wire: boolean };

/** The harness's flex test bends each bone up to this many degrees per axis (FLEX_DEGREES in viewer.ts). */
const FLEX_DEGREES = 28;
/** The seed the showcase viewer poses with, so a wiggle here bends the same way as on the showcase. */
const SEED = 11;

/** Deterministic PRNG in [0, 1) (mulberry32), as harness/page.ts uses for its flex poses. */
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

/**
 * Shows the model at `url` in `host`; `status` hears about loading and failures, `changed` about options the view
 * changed itself. Returns `set` to change the options, `reset` to frame the model again, and `dispose`.
 */
export function mount(
  host: HTMLElement,
  url: string,
  options: Options,
  status: (text: string | null) => void,
  changed: () => void,
) {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  host.prepend(renderer.domElement);

  const scene = new Scene();
  scene.background = new Color("#d5dbe0");
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new DirectionalLight("#ffffff", 1.6);
  key.position.set(2, 4, 3);
  scene.add(key);

  const camera = new PerspectiveCamera(35, 1, 0.01, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotateSpeed = 1.2;
  // Grabbing the model stops the turntable.
  controls.addEventListener("start", () => {
    if (!options.turntable) return;
    options.turntable = false;
    controls.autoRotate = false;
    changed();
  });

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  let model: Object3D | null = null;
  let helper: SkeletonHelper | null = null;
  const dots: Mesh[] = [];
  const disposables: Array<{ dispose(): void }> = [];
  let bones: Bone[] = [];
  let rest: Quaternion[] = [];
  const materials: Material[] = [];
  const alphaTests: number[] = [];
  let alive = true;
  let wiggleStart = 0;

  /** Frame the model three-quarter, a little above, like the harness's shot. */
  const frame = () => {
    if (!model) return;
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    const radius = box.getSize(new Vector3()).length() / 2 || 1;
    const distance = radius / Math.sin((camera.fov * Math.PI) / 360);
    camera.position.copy(center).add(new Vector3(1, 0.55, 1.15).normalize().multiplyScalar(distance * 0.85));
    camera.near = distance / 100;
    camera.far = distance * 10;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
  };

  /** Bend every bone but the root by a seeded random angle, scaled by `amount` (-1 to 1), as the showcase does. */
  const pose = (amount: number) => {
    const random = rng(SEED);
    const euler = new Euler();
    const turn = new Quaternion();
    const limit = FLEX_DEGREES * (Math.PI / 180) * amount;
    bones.forEach((bone, index) => {
      bone.quaternion.copy(rest[index]);
      if (index === 0) return;
      euler.set((random() * 2 - 1) * limit, (random() * 2 - 1) * limit, (random() * 2 - 1) * limit);
      bone.quaternion.multiply(turn.setFromEuler(euler));
    });
  };

  const apply = () => {
    controls.autoRotate = options.turntable;
    if (helper) helper.visible = options.skeleton;
    for (const dot of dots) dot.visible = options.skeleton;
    // The skeleton shows through a see-through body.
    // The exported materials cut away texels below an alpha threshold; a see-through body must not be cut away.
    materials.forEach((material, index) => {
      Object.assign(material, { wireframe: options.wire });
      material.transparent = options.skeleton;
      material.opacity = options.skeleton ? 0.3 : 1;
      material.depthWrite = !options.skeleton;
      material.alphaTest = options.skeleton ? 0 : alphaTests[index];
      material.needsUpdate = true;
    });
    if (options.wiggle) wiggleStart = performance.now();
    else pose(0);
  };

  status("Loading the model…");
  new GLTFLoader().load(
    url,
    (gltf) => {
      if (!alive) return;
      model = gltf.scene;
      scene.add(model);
      model.traverse((object) => {
        const mesh = object as Mesh;
        if (mesh.isMesh)
          for (const material of ([] as Material[]).concat(mesh.material)) {
            materials.push(material);
            alphaTests.push(material.alphaTest);
          }
        const skinned = object as SkinnedMesh;
        if (skinned.isSkinnedMesh && !bones.length) {
          bones = skinned.skeleton.bones;
          rest = bones.map((bone) => bone.quaternion.clone());
        }
      });
      if (bones.length) {
        // The skeleton as the harness's x-ray shot draws it: blue bones and joints, a red root, drawn over the body.
        helper = new SkeletonHelper(model);
        Object.assign(helper.material, { vertexColors: false, color: new Color("#2448e0") });
        scene.add(helper);
        const size = new Box3().setFromObject(model).getSize(new Vector3()).length();
        const ball = new SphereGeometry(size * 0.008, 12, 8);
        disposables.push(ball);
        bones.forEach((bone, index) => {
          const material = new MeshBasicMaterial({
            color: index ? "#2448e0" : "#e03131",
            depthTest: false,
            // Drawn in the transparent pass, after the see-through body.
            transparent: true,
          });
          const dot = new Mesh(ball, material);
          dot.renderOrder = 2;
          // A bone may carry its node's scale; the dot keeps its size in model space.
          dot.scale.divide(bone.getWorldScale(new Vector3()));
          bone.add(dot);
          dots.push(dot);
          disposables.push(material);
        });
      }
      frame();
      apply();
      status(null);
    },
    (event) => {
      if (alive && event.total) status(`Loading the model… ${Math.round((event.loaded / event.total) * 100)}%`);
    },
    () => alive && status("Couldn't load this build's model."),
  );

  renderer.setAnimationLoop((time) => {
    if (options.wiggle && bones.length) pose(Math.sin(((time - wiggleStart) / 1000) * Math.PI));
    controls.update();
    renderer.render(scene, camera);
  });

  return {
    set(next: Partial<Options>) {
      Object.assign(options, next);
      apply();
    },
    reset: frame,
    dispose() {
      alive = false;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      helper?.dispose();
      for (const item of disposables) item.dispose();
      model?.traverse((object) => (object as Mesh).geometry?.dispose());
      for (const material of materials) {
        (material as Material & { map?: { dispose(): void } }).map?.dispose();
        material.dispose();
      }
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      // Stepping through builds makes a context per build; give each back at once.
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
