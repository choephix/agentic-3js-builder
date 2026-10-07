import * as THREE from "three";

export const meta = {
  name: "Elephant",
  description:
    "A stylized African elephant at rest: blocky grey body, big fan ears, a curled trunk, ivory tusks and creased legs. About 3 m at the shoulder.",
};

const UP = new THREE.Vector3(0, 1, 0);

const palette = {
  skin: 0x8c9199,
  legs: 0x6f747c,
  inner: 0xe0a9a6,
  tusk: 0xf3ead2,
  eye: 0x1a1a1a,
  nail: 0xe9e3d3,
  tuft: 0x3d342c,
  crease: 0x5b6069,
};

function makeMaterials() {
  const m: Record<string, THREE.MeshStandardMaterial> = {};
  for (const [key, color] of Object.entries(palette)) {
    m[key] = new THREE.MeshStandardMaterial({
      color,
      roughness: key === "tusk" || key === "nail" ? 0.45 : 0.85,
      metalness: 0,
      flatShading: true,
    });
  }
  return m;
}

// A cylinder stretched between two points (tapered if r0 != r1).
function limb(
  a: THREE.Vector3,
  b: THREE.Vector3,
  r0: number,
  r1: number,
  mat: THREE.Material,
  parent: THREE.Object3D,
  seg = 10
) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const geo = new THREE.CylinderGeometry(r1, r0, len, seg);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  parent.add(mesh);
  return mesh;
}

function place(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  parent: THREE.Object3D,
  pos: [number, number, number],
  scale: [number, number, number] = [1, 1, 1],
  rot: [number, number, number] = [0, 0, 0]
) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rot);
  parent.add(mesh);
  return mesh;
}

export default function createElephant(): THREE.Object3D {
  const mat = makeMaterials();
  const root = new THREE.Group();
  root.name = "Elephant";

  const body = new THREE.Group();
  body.name = "body";
  root.add(body);

  // Barrel body: a squashed sphere, slightly flattened on top.
  const sphere = (r: number, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);
  place(sphere(1, 16, 12), mat.skin, body, [0, 2.15, 0], [1.1, 0.85, 1.7]);

  // Chest bulge forward and a rounded hip at the back.
  place(sphere(1, 14, 10), mat.skin, body, [0, 2.0, 1.25], [0.95, 0.9, 0.7]);
  place(sphere(1, 14, 10), mat.skin, body, [0, 2.2, -1.25], [0.95, 0.95, 0.7]);

  // Head: big, slightly boxy, with a forehead dome.
  const head = new THREE.Group();
  head.name = "head";
  root.add(head);
  place(sphere(0.62, 16, 12), mat.skin, head, [0, 2.75, 2.0], [0.95, 1.05, 0.9]);
  place(sphere(0.45, 12, 10), mat.skin, head, [0, 3.2, 2.12], [1.0, 0.8, 0.9]);

  // Fan ears, with pink inner sides and a hint of a flap.
  for (const s of [1, -1]) {
    place(sphere(1, 12, 10), mat.skin, head, [s * 0.72, 2.6, 1.85], [0.1, 0.95, 0.75], [0, 0, -s * 0.22]);
    place(sphere(1, 10, 8), mat.inner, head, [s * 0.75, 2.6, 1.97], [0.05, 0.8, 0.6], [0, 0, -s * 0.22]);
  }

  // Eyes: small and dark, set on the sides of the head.
  for (const s of [1, -1]) {
    place(new THREE.SphereGeometry(0.05, 8, 6), mat.eye, head, [s * 0.52, 2.95, 2.36]);
  }

  // Trunk: a tapered chain of cylinders along a curled spline.
  const trunk = new THREE.Group();
  trunk.name = "trunk";
  root.add(trunk);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.7, 2.45),
    new THREE.Vector3(0, 2.3, 2.95),
    new THREE.Vector3(0, 1.8, 3.2),
    new THREE.Vector3(0, 1.35, 3.25),
    new THREE.Vector3(0.1, 1.0, 3.35),
    new THREE.Vector3(0.2, 1.1, 3.45),
  ]);
  const N = 14;
  const pts = curve.getSpacedPoints(N);
  const radius = (i: number) => 0.3 - 0.2 * (i / N);
  for (let i = 0; i < N; i++) {
    limb(pts[i], pts[i + 1], radius(i), radius(i + 1), mat.skin, trunk, 10);
  }
  for (let i = 0; i <= N; i++) {
    place(new THREE.SphereGeometry(radius(i), 10, 8), mat.skin, trunk, [pts[i].x, pts[i].y, pts[i].z]);
  }
  // Nostril tip: a darker cap on the trunk end.
  place(new THREE.SphereGeometry(0.1, 8, 6), mat.crease, trunk, [pts[N].x, pts[N].y, pts[N].z]);

  // Tusks: ivory cones angled forward and slightly down.
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(s * 0.22, 2.3, 2.5);
    const dir = new THREE.Vector3(s * 0.12, -0.3, 1).normalize();
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.9, 10), mat.tusk);
    tusk.position.copy(base).addScaledVector(dir, 0.45);
    tusk.quaternion.setFromUnitVectors(UP, dir);
    head.add(tusk);
  }

  // Legs: four tapered columns with knee creases and dark toenails.
  const legs = new THREE.Group();
  legs.name = "legs";
  root.add(legs);
  const legSpots: [number, number][] = [
    [0.7, 1.2],
    [-0.7, 1.2],
    [0.7, -1.0],
    [-0.7, -1.0],
  ];
  for (const [x, z] of legSpots) {
    limb(
      new THREE.Vector3(x, 0.2, z),
      new THREE.Vector3(x, 1.45, z),
      0.22,
      0.28,
      mat.legs,
      legs,
      10
    );
    // Creased ring at mid-leg for a wrinkled look.
    const crease = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 6, 12), mat.crease);
    crease.position.set(x, 0.95, z);
    crease.rotation.x = Math.PI / 2;
    legs.add(crease);
    // Foot pad.
    place(new THREE.CylinderGeometry(0.3, 0.32, 0.2, 12), mat.legs, legs, [x, 0.1, z]);
    // Toenails on the front of each foot.
    const frontZ = z + 0.28;
    for (const dx of [-0.11, 0, 0.11]) {
      place(new THREE.SphereGeometry(0.035, 6, 5), mat.nail, legs, [x + dx, 0.12, frontZ], [1, 1, 0.6]);
    }
  }

  // Tail: a thin hanging cord with a dark tuft.
  const tail = new THREE.Group();
  tail.name = "tail";
  root.add(tail);
  const tailTop = new THREE.Vector3(0, 2.85, -1.65);
  const tailEnd = new THREE.Vector3(0, 1.7, -1.85);
  limb(tailTop, tailEnd, 0.03, 0.06, mat.skin, tail, 6);
  place(new THREE.SphereGeometry(0.1, 8, 6), mat.tuft, tail, [tailEnd.x, tailEnd.y - 0.08, tailEnd.z]);

  return root;
}
