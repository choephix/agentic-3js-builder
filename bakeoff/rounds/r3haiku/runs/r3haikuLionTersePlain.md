```ts
import * as THREE from "three";

export const meta = {
  name: "Lion",
  description: "A stylized low-poly male lion in a neutral standing pose, built from primitives with a dark mane, amber eyes and a tufted tail.",
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createLion(): THREE.Object3D {
  const rng = mulberry32(2024);
  const root = new THREE.Group();

  // Shared materials, one per colour
  const fur = new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.85 });
  const belly = new THREE.MeshStandardMaterial({ color: 0xf0d9a0, roughness: 0.9 });
  const mane = new THREE.MeshStandardMaterial({ color: 0x6b3e1d, roughness: 0.95 });
  const maneDark = new THREE.MeshStandardMaterial({ color: 0x3a2213, roughness: 0.95 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1e1410, roughness: 0.6 });
  const nose = new THREE.MeshStandardMaterial({ color: 0x2a1614, roughness: 0.4 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xfff4e0, roughness: 0.3 });
  const iris = new THREE.MeshStandardMaterial({ color: 0xe0a020, roughness: 0.3 });

  const add = (
    geom: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rot: [number, number, number] = [0, 0, 0],
    parent: THREE.Object3D = root
  ) => {
    const m = new THREE.Mesh(geom, mat);
    m.position.set(pos[0], pos[1], pos[2]);
    m.scale.set(scale[0], scale[1], scale[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    return m;
  };

  // Body and torso
  const sphereBody = new THREE.SphereGeometry(1, 20, 14);
  add(sphereBody, fur, [0, 0.92, 0], [0.36, 0.34, 0.75]);
  add(sphereBody, fur, [0, 0.9, 0.46], [0.37, 0.39, 0.35]); // chest
  add(sphereBody, fur, [0, 0.92, -0.46], [0.33, 0.34, 0.36]); // hips
  add(sphereBody, belly, [0, 0.7, 0.0], [0.28, 0.12, 0.58]); // underbelly
  add(sphereBody, fur, [0, 1.0, 0.6], [0.24, 0.26, 0.25]); // neck base

  // Legs: upper, lower, paw
  const upperGeom = new THREE.CylinderGeometry(0.095, 0.075, 0.42, 10);
  const lowerGeom = new THREE.CylinderGeometry(0.07, 0.055, 0.4, 10);
  const pawGeom = new THREE.SphereGeometry(1, 12, 8);
  const legs: [number, number, boolean][] = [
    [0.18, 0.38, true],
    [-0.18, 0.38, true],
    [0.18, -0.42, false],
    [-0.18, -0.42, false],
  ];
  for (const [x, z, front] of legs) {
    const zOff = front ? 0.03 : -0.02;
    add(upperGeom, fur, [x, 0.66, z]);
    add(lowerGeom, fur, [x, 0.25, z + zOff]);
    add(pawGeom, dark, [x, 0.05, z + 0.05], [0.085, 0.06, 0.12]);
    // small dark toe ridge for stylized detail
    add(pawGeom, dark, [x, 0.04, z + 0.13], [0.07, 0.04, 0.03]);
  }

  // Head
  add(sphereBody, fur, [0, 1.18, 0.78], [0.2, 0.19, 0.22]);
  add(sphereBody, belly, [0, 1.13, 0.97], [0.11, 0.085, 0.13]); // muzzle
  add(sphereBody, nose, [0, 1.16, 1.09], [0.045, 0.03, 0.035]);
  add(new THREE.BoxGeometry(1, 1, 1), dark, [0, 1.085, 1.03], [0.07, 0.012, 0.03]); // mouth line

  // Ears
  const earGeom = new THREE.ConeGeometry(0.045, 0.08, 8);
  add(earGeom, fur, [0.13, 1.38, 0.76], [1, 1, 1], [-0.3, 0, -0.2]);
  add(earGeom, fur, [-0.13, 1.38, 0.76], [1, 1, 1], [-0.3, 0, 0.2]);

  // Eyes: almond white, amber iris, dark pupil, brow ridge
  for (const side of [1, -1]) {
    const ex = 0.085 * side;
    add(sphereBody, eyeWhite, [ex, 1.22, 0.95], [0.042, 0.03, 0.026]);
    add(sphereBody, iris, [ex, 1.22, 0.965], [0.024, 0.024, 0.012]);
    add(sphereBody, dark, [ex, 1.22, 0.972], [0.01, 0.014, 0.008]);
    add(new THREE.BoxGeometry(1, 1, 1), maneDark, [ex, 1.27, 0.94], [0.06, 0.016, 0.03], [0, 0, -0.3 * side]);
  }

  // Mane: two layered rings of tufts around the head
  const tuftGeom = new THREE.SphereGeometry(1, 10, 8);
  const innerCount = 44;
  for (let i = 0; i < innerCount; i++) {
    const t = (i / innerCount) * Math.PI * 2;
    const j = (rng() - 0.5) * 0.25;
    const r = 0.27 * (1 + j);
    const s = 0.085 + rng() * 0.03;
    add(
      tuftGeom,
      mane,
      [Math.cos(t) * r, 1.2 + Math.sin(t) * r * 0.95, 0.66 + (rng() - 0.5) * 0.06],
      [s, s * 1.1, s * 1.05]
    );
  }
  const outerCount = 26;
  for (let i = 0; i < outerCount; i++) {
    const t = (i / outerCount) * Math.PI * 2 + 0.1;
    const j = (rng() - 0.5) * 0.2;
    const r = 0.36 * (1 + j);
    const s = 0.1 + rng() * 0.03;
    add(
      tuftGeom,
      rng() > 0.5 ? mane : maneDark,
      [Math.cos(t) * r, 1.2 + Math.sin(t) * r * 0.95, 0.58 + (rng() - 0.5) * 0.08],
      [s, s * 1.15, s * 0.9]
    );
  }

  // Tail: curved tube ending in a dark tuft
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.98, -0.7),
    new THREE.Vector3(0, 0.94, -0.95),
    new THREE.Vector3(0, 0.62, -1.1),
    new THREE.Vector3(0, 0.3, -1.14),
  ]);
  const tailGeom = new THREE.TubeGeometry(tailCurve, 24, 0.028, 8, false);
  add(tailGeom, fur, [0, 0, 0]);
  add(tuftGeom, maneDark, [0, 0.22, -1.15], [0.07, 0.11, 0.07]);

  return root;
}
```