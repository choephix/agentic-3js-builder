// The lab viewer's 3D view: the harness's exported GLB of a build in an orbiting three.js scene, lit like the
// renders (a room environment and a key light) on the renders' grey. Loaded only when the 3D view opens.
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/** Shows `url` in `host` until the returned function is called; `status` hears about loading and failures. */
export function mount(host: HTMLElement, url: string, status: (text: string | null) => void) {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  host.append(renderer.domElement);

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
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  // The first drag or scroll stops the turntable.
  controls.addEventListener("start", () => (controls.autoRotate = false));

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
  let alive = true;
  status("Loading the model…");
  new GLTFLoader().load(
    url,
    (gltf) => {
      if (!alive) return;
      model = gltf.scene;
      scene.add(model);
      // Frame the model three-quarter, a little above, like the harness's shot.
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
      status(null);
    },
    (event) => {
      if (alive && event.total) status(`Loading the model… ${Math.round((event.loaded / event.total) * 100)}%`);
    },
    () => alive && status("Couldn't load this build's GLB."),
  );

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });

  return () => {
    alive = false;
    renderer.setAnimationLoop(null);
    observer.disconnect();
    controls.dispose();
    model?.traverse((object) => {
      const mesh = object as Object3D & { geometry?: { dispose(): void }; material?: unknown };
      mesh.geometry?.dispose();
      for (const material of [mesh.material].flat() as Array<{ dispose?(): void; map?: { dispose(): void } }>) {
        material?.map?.dispose();
        material?.dispose?.();
      }
    });
    scene.environment?.dispose();
    pmrem.dispose();
    renderer.dispose();
    // Stepping through builds makes a context per build; give each back at once.
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
