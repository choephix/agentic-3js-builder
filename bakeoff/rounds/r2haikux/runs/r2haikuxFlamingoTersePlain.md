```ts
import * as THREE from "three";

export const meta = {
  name: "Flamingo",
  description:
    "A stylised standing flamingo: pale pink body, coral wing coverts with black flight-feather tips, an S-curved neck, a hooked two-tone beak and webbed feet.",
};

type Key = "body" | "chest" | "coverts" | "coverts2" | "legs" | "beak" | "flight" | "eye" | "white";

const COLOURS: Record<Key, string> = {
  body: "#ffc2d2",
  chest: "#ffe3ea",
  coverts: "#ff6b8f",
  coverts2: "#ff8fab",
  legs: "#ff7a9d",
  beak: "#ffb8ca",
  flight: "#1c1a21",
  eye: "#120f16",
  white: "#fff8fa",
};

const UP = new THREE.Vector3(0, 1, 0);

export default function flamingo(): THREE.Object3D {
  // One shared material per colour.
  const M = {} as Record<Key, THREE.MeshStandardMaterial>;
  for (const k of Object.keys(COLOURS) as Key[]) {
    M[k] = new THREE.MeshStandardMaterial({ color: COLOURS[k], roughness: 0.6, metalness: 0 });
  }

  // Ellipsoid: unit sphere, scaled and rotated in place.
  const blob = (
    parent: THREE.Object3D,
    mat: THREE.Material,
    at: [number, number, number],
    radii: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
  ): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat);
    m.position.set(at[0], at[1], at[2]);
    m.scale.set(radii[0], radii[1], radii[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    return m;
  };

  // Round joint or tip.
  const ball = (parent: THREE.Object3D, mat: THREE.Material, at: THREE.Vector3, r: number, seg = 10): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, 8), mat);
    m.position.copy(at);
    parent.add(m);
    return m;
  };

  // Tapered cylinder from a to b; radius ra at a, rb at b.
  const bone = (
    parent: THREE.Object3D,
    mat: THREE.Material,
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    seg = 8,
  ): THREE.Mesh => {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(UP, dir.normalize());
    parent.add(m);
    return m;
  };

  // Flat slab (feathers, toes, tail fan).
  const plate = (
    parent: THREE.Object3D,
    mat: THREE.Material,
    size: [number, number, number],
    at: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
  ): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
    m.position.set(at[0], at[1], at[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    return m;
  };

  const root = new THREE.Group();
  root.name = "flamingo";

  // ---- Body: a tilted group so the tail rides up and the breast sits low ----
  const body = new THREE.Group();
  body.position.set(0, 0.8, 0);
  body.rotation.x = 0.14;
  root.add(body);

  blob(body, M.body, [0, 0, 0], [0.165, 0.15, 0.25]);
  blob(body, M.chest, [0, -0.005, 0.12], [0.145, 0.14, 0.13]); // rounded breast

  // Tail: two upturned fan plates.
  plate(body, M.body, [0.13, 0.012, 0.09], [0, 0.03, -0.27], [0.55, 0, 0]);
  plate(body, M.coverts2, [0.08, 0.012, 0.07], [0, 0.07, -0.29], [0.95, 0, 0]);

  // Folded wings: stacked coral coverts, each feather layer overlapping the next.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const k = 1 - i * 0.11;
      blob(
        body,
        i % 2 === 0 ? M.coverts : M.coverts2,
        [s * 0.135, 0.02 - i * 0.012, 0.10 - i * 0.085],
        [0.034, 0.088 * k, 0.105 * k],
        [0, 0, s * 0.08],
      );
    }
    // Black flight-feather tips fanning out past the wing ends.
    for (let j = 0; j < 3; j++) {
      plate(
        body,
        M.flight,
        [0.018, 0.07, 0.17],
        [s * (0.125 + j * 0.006), -j * 0.012, -0.15 - j * 0.055],
        [0, -s * (0.1 + j * 0.05), 0],
      );
    }
  }

  // ---- Legs: thin, pink, with the backward-bending joint ----
  for (const s of [-1, 1]) {
    const x = s * 0.06;
    const hip = new THREE.Vector3(x, 0.67, 0.0);
    const knee = new THREE.Vector3(x, 0.37, -0.05);
    const ankle = new THREE.Vector3(x, 0.02, 0.03);

    bone(root, M.legs, hip, knee, 0.02, 0.016);
    ball(root, M.legs, knee, 0.016);
    bone(root, M.legs, knee, ankle, 0.016, 0.011);

    // Three forward toes spread in a fan, one short hind toe.
    for (const a of [-0.5, 0, 0.5]) {
      plate(root, M.legs, [0.014, 0.01, 0.075], [x + Math.sin(a) * 0.035, 0.005, 0.03 + Math.cos(a) * 0.035], [0, a, 0]);
    }
    plate(root, M.legs, [0.012, 0.01, 0.03], [x, 0.005, 0.005]);

    // Webbing between the toes.
    blob(root, M.legs, [x, 0.006, 0.04], [0.028, 0.005, 0.045]);
  }

  // ---- Neck: an S-curve built from tapered segments ----
  const neckCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0.88, 0.14),
      new THREE.Vector3(0, 1.0, 0.23),
      new THREE.Vector3(0, 1.1, 0.2),
      new THREE.Vector3(0, 1.19, 0.26),
    ],
    false,
    "catmullrom",
    0.5,
  );
  const neckPts = neckCurve.getSpacedPoints(12);
  const last = neckPts.length - 1;
  for (let i = 0; i < last; i++) {
    const r0 = THREE.MathUtils.lerp(0.056, 0.03, i / last);
    const r1 = THREE.MathUtils.lerp(0.056, 0.03, (i + 1) / last);
    bone(root, M.body, neckPts[i], neckPts[i + 1], r0, r1, 10);
    ball(root, M.body, neckPts[i], r0, 10);
  }
  ball(root, M.body, neckPts[last], 0.03, 10);

  // ---- Head: tilted down, with a pale eye ring and a dark eye ----
  const head = new THREE.Group();
  head.position.set(0, 1.215, 0.33);
  head.rotation.x = 0.3;
  root.add(head);

  blob(head, M.body, [0, 0, 0], [0.07, 0.065, 0.1]);
  for (const s of [-1, 1]) {
    blob(head, M.white, [s * 0.064, 0.02, 0.05], [0.017, 0.017, 0.017]);
    blob(head, M.eye, [s * 0.072, 0.022, 0.054], [0.01, 0.01, 0.01]);
  }

  // ---- Beak: thick, hooked down, black tip ----
  const b0 = new THREE.Vector3(0, 1.19, 0.38);
  const b1 = new THREE.Vector3(0, 1.165, 0.535);
  const b2 = new THREE.Vector3(0, 1.075, 0.5);
  bone(root, M.beak, b0, b1, 0.03, 0.024, 10);
  bone(root, M.beak, b1, b2, 0.024, 0.012, 10);
  const tipStart = b1.clone().lerp(b2, 0.55);
  bone(root, M.flight, tipStart, b2, 0.0168, 0.011, 10);
  ball(root, M.flight, b2, 0.011, 8);

  return root;
}
```