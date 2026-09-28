// The one three.js view: orbit controls, a floor grid at y = 0 with a soft shadow, framed to the object's bounds,
// and an optional skeleton overlay drawn from the `userData.joint` tags.
import {
  Box3,
  BufferGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  GridHelper,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Material, Object3D } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type Stats = { meshes: number; triangles: number; joints: number; colors: number; size: Vector3 };

const isJoint = (object: Object3D) => typeof object.userData.joint === "string";

export function stats(object: Object3D): Stats {
  const colors = new Set<string>();
  let meshes = 0;
  let triangles = 0;
  let joints = 0;
  object.traverse((child) => {
    if (isJoint(child)) joints++;
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    meshes++;
    const geometry = mesh.geometry;
    triangles += (geometry.index ? geometry.index.count : geometry.getAttribute("position").count) / 3;
    for (const material of ([] as Material[]).concat(mesh.material)) {
      const color = (material as MeshBasicMaterial).color;
      if (color) colors.add(color.getHexString());
    }
  });
  const size = new Box3().setFromObject(object, true).getSize(new Vector3());
  return { meshes, triangles, joints, colors: colors.size, size };
}

export class Viewer {
  private readonly renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(35, 1, 0.01, 100);
  private readonly controls: OrbitControls;
  private readonly sun = new DirectionalLight(0xffffff, 2.2);
  private readonly floor = new Mesh(new PlaneGeometry(1, 1), new ShadowMaterial({ opacity: 0.16 }));
  private grid = new GridHelper(1, 10);
  private content: Object3D | null = null;
  private skeleton: Group | null = null;

  constructor(private readonly host: HTMLElement) {
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    host.append(this.renderer.domElement);
    this.scene.background = new Color("#eef0f2");
    this.scene.add(new HemisphereLight(0xf7f4ee, 0x80786f, 1.8), this.sun, this.sun.target, this.floor, this.grid);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.radius = 6;
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  private resize() {
    const { clientWidth: width, clientHeight: height } = this.host;
    // The canvas is sized by CSS; only the drawing buffer follows the host (no ResizeObserver feedback loop).
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }

  /** Replace the shown object and frame the camera, grid, floor and shadow to its bounds. */
  show(object: Object3D | null) {
    if (this.content) this.scene.remove(this.content);
    this.setSkeleton(false);
    this.content = object;
    if (!object) return;
    this.scene.add(object);
    object.updateMatrixWorld(true);
    object.traverse((child) => {
      if ((child as Mesh).isMesh) child.castShadow = true;
    });
    const box = new Box3().setFromObject(object, true);
    if (box.isEmpty()) box.set(new Vector3(-0.5, 0, -0.5), new Vector3(0.5, 1, 0.5));
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const radius = Math.max(size.length() / 2, 0.05);
    const span = Math.max(1, Math.ceil(Math.max(size.x, size.z) * 2));
    this.scene.remove(this.grid);
    // 10 cm cells for small objects, 50 cm for large ones.
    this.grid = new GridHelper(span, span <= 2 ? span * 10 : span * 2, 0xb9bec4, 0xd9dde1);
    this.scene.add(this.grid);
    this.floor.scale.set(span * 2, span * 2, 1);
    // Fit the bounding sphere in the narrower of the vertical and horizontal fields of view.
    const halfFov = Math.atan(Math.tan((this.camera.fov * Math.PI) / 360) * Math.min(1, this.camera.aspect));
    const distance = radius / Math.sin(halfFov);
    this.camera.near = distance / 100;
    this.camera.far = distance * 20;
    this.camera.position.copy(center).addScaledVector(new Vector3(0.9, 0.55, 1.3).normalize(), distance);
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(center);
    this.sun.position.copy(center).add(new Vector3(0.6, 1.4, 0.8).multiplyScalar(radius * 3));
    this.sun.target.position.copy(center);
    const shadow = this.sun.shadow.camera;
    shadow.left = shadow.bottom = -radius * 1.5;
    shadow.right = shadow.top = radius * 1.5;
    shadow.near = radius * 0.5;
    shadow.far = radius * 8;
    shadow.updateProjectionMatrix();
  }

  /** Bones as lines from each joint's nearest joint ancestor, drawn on top of the model. */
  setSkeleton(visible: boolean) {
    if (this.skeleton) this.scene.remove(this.skeleton);
    this.skeleton = null;
    if (!visible || !this.content) return;
    const joints: Object3D[] = [];
    this.content.traverse((child) => {
      if (isJoint(child)) joints.push(child);
    });
    const size = new Box3().setFromObject(this.content).getSize(new Vector3()).length();
    const group = new Group();
    const lines: number[] = [];
    const dotGeometry = new SphereGeometry(size * 0.006, 10, 8);
    const dotMaterial = new MeshBasicMaterial({ color: "#1f5fd1", depthTest: false });
    for (const joint of joints) {
      const at = joint.getWorldPosition(new Vector3());
      let parent = joint.parent;
      while (parent && !isJoint(parent)) parent = parent.parent;
      if (parent) lines.push(...parent.getWorldPosition(new Vector3()).toArray(), ...at.toArray());
      const dot = new Mesh(dotGeometry, dotMaterial);
      dot.position.copy(at);
      dot.renderOrder = 1000;
      group.add(dot);
    }
    const geometry = new BufferGeometry().setAttribute("position", new Float32BufferAttribute(lines, 3));
    const bones = new LineSegments(geometry, new LineBasicMaterial({ color: "#1f5fd1", depthTest: false }));
    bones.renderOrder = 999;
    group.add(bones);
    this.skeleton = group;
    this.scene.add(group);
  }
}
