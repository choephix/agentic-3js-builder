// The helper object every creature module receives as `build(kit)`.
// Builders may ignore it and use plain three.js; the harness only reads the
// returned Object3D tree (see GUIDE.md for the tagging contract).
import * as THREE from "three";

type Vec3 = [number, number, number];

export type PartOptions = {
  position?: Vec3;
  /** Euler angles in DEGREES, XYZ order. */
  rotation?: Vec3;
  scale?: number | Vec3;
  name?: string;
  group?: string;
  bone?: string;
};

export type JointOptions = {
  position?: Vec3;
  /** Euler angles in DEGREES, XYZ order. Sets the bone's local axes. */
  rotation?: Vec3;
  group?: string;
};

export type Kit = {
  THREE: typeof THREE;
  DEG: number;
  /** A shared matte material for `color` (#rrggbb). */
  material(color: string): THREE.MeshStandardMaterial;
  /** A mesh part with a flat color, optional transform and optional group/bone tag. */
  part(geometry: THREE.BufferGeometry, color: string, options?: PartOptions): THREE.Mesh;
  /** A plain transform node for organising parts. Tags are optional. */
  node(options?: PartOptions): THREE.Group;
  /** A skeleton joint (bone) named `name`. Descendant parts default to this bone. */
  joint(name: string, options?: JointOptions): THREE.Group;
  /** Deterministic PRNG in [0, 1). Math.random is not allowed in creature modules. */
  rng(seed: number): () => number;
};

const DEG = Math.PI / 180;

function place(object: THREE.Object3D, options: { position?: Vec3; rotation?: Vec3; scale?: number | Vec3 }) {
  if (options.position) object.position.fromArray(options.position);
  if (options.rotation)
    object.rotation.set(options.rotation[0] * DEG, options.rotation[1] * DEG, options.rotation[2] * DEG);
  if (options.scale !== undefined) {
    if (typeof options.scale === "number") object.scale.setScalar(options.scale);
    else object.scale.fromArray(options.scale);
  }
  return object;
}

export function createKit(): Kit {
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const material = (color: string) => {
    const key = color.toLowerCase();
    let cached = materials.get(key);
    if (!cached) {
      cached = new THREE.MeshStandardMaterial({ color: key, roughness: 0.72, metalness: 0.04 });
      materials.set(key, cached);
    }
    return cached;
  };

  return {
    THREE,
    DEG,
    material,
    part(geometry, color, options = {}) {
      const mesh = new THREE.Mesh(geometry, material(color));
      place(mesh, options);
      if (options.name) mesh.name = options.name;
      if (options.group) mesh.userData.group = options.group;
      if (options.bone) mesh.userData.bone = options.bone;
      return mesh;
    },
    node(options = {}) {
      const group = new THREE.Group();
      place(group, options);
      if (options.name) group.name = options.name;
      if (options.group) group.userData.group = options.group;
      if (options.bone) group.userData.bone = options.bone;
      return group;
    },
    joint(name, options = {}) {
      const group = new THREE.Group();
      place(group, options);
      group.name = name;
      group.userData.joint = name;
      if (options.group) group.userData.group = options.group;
      return group;
    },
    rng(seed) {
      let state = seed >>> 0 || 1;
      return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
  };
}
