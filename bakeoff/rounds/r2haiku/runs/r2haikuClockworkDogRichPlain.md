```ts
import * as THREE from "three";

export const meta = {
  name: "Clockwork Terrier",
  description:
    "A wind-up terrier of polished brass and copper: riveted plates, a turning gear window in the chest, a winding key on the back, spring-coil legs, leather ears, green lens eyes, a coiled spring tail and a red collar with a brass tag.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeGear(r: number, teeth: number, mat: THREE.Material, toothMat: THREE.Material) {
  const g = new THREE.Group();
  const disc = new THREE.CylinderGeometry(r, r, 0.008, 20);
  disc.rotateX(Math.PI / 2);
  g.add(new THREE.Mesh(disc, mat));
  const hubGeo = new THREE.CylinderGeometry(r * 0.28, r * 0.28, 0.012, 10);
  hubGeo.rotateX(Math.PI / 2);
  g.add(new THREE.Mesh(hubGeo, toothMat));
  const toothGeo = new THREE.BoxGeometry(0.012, 0.012, 0.008);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const t = new THREE.Mesh(toothGeo, toothMat);
    t.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    t.rotation.z = a;
    g.add(t);
  }
  return g;
}

export default function buildClockworkTerrier(): THREE.Object3D {
  const rand = rng(1907);

  // Materials (one per colour, shared)
  const brass = new THREE.MeshStandardMaterial({ color: 0xd4a64a, metalness: 1, roughness: 0.27 });
  const brassDark = new THREE.MeshStandardMaterial({ color: 0x9c7428, metalness: 1, roughness: 0.4 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xb8703a, metalness: 1, roughness: 0.33 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x5e3720, metalness: 0, roughness: 0.78 });
  const redLeather = new THREE.MeshStandardMaterial({ color: 0xb01e27, metalness: 0, roughness: 0.55 });
  const lens = new THREE.MeshStandardMaterial({
    color: 0x7ee8a8,
    emissive: 0x1f6b45,
    emissiveIntensity: 0.6,
    metalness: 0.1,
    roughness: 0.05,
    transparent: true,
    opacity: 0.78,
  });
  const black = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5 });

  const root = new THREE.Group();
  root.name = "ClockworkTerrier";

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    parent: THREE.Object3D = root
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  const rivet = (x: number, y: number, z: number, parent: THREE.Object3D = root) =>
    add(new THREE.SphereGeometry(0.0045, 6, 4), brassDark, x, y, z, parent);

  // ---- Body ----
  const body = add(new THREE.SphereGeometry(1, 22, 14), brass, 0, 0.26, 0);
  body.scale.set(0.12, 0.11, 0.22);

  // Riveted flank plates
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(0.02, 0.1, 0.16), copper, s * 0.118, 0.26, -0.02);
    for (const dy of [-0.04, 0.04]) {
      for (const dz of [-0.065, 0.065]) {
        rivet(s * 0.13, 0.26 + dy, -0.02 + dz);
      }
    }
  }

  // Top back plate with rivets
  add(new THREE.BoxGeometry(0.1, 0.008, 0.2), copper, 0, 0.366, -0.02);
  for (const x of [-0.035, 0.035]) {
    for (const z of [-0.1, 0.06]) rivet(x, 0.372, -0.02 + z);
  }

  // ---- Chest gear window ----
  const chestRing = add(new THREE.TorusGeometry(0.058, 0.008, 8, 24), copper, 0, 0.24, 0.222);
  chestRing.rotation.set(0, 0, 0);
  add(new THREE.CylinderGeometry(0.052, 0.052, 0.008, 24).rotateX(Math.PI / 2) as THREE.BufferGeometry,
    brassDark, 0, 0.24, 0.218);

  const gearA = makeGear(0.03, 10, brass, copper);
  gearA.position.set(-0.016, 0.245, 0.228);
  gearA.rotation.z = rand() * Math.PI;
  root.add(gearA);

  const gearB = makeGear(0.018, 8, copper, brass);
  gearB.position.set(0.024, 0.228, 0.23);
  gearB.rotation.z = rand() * Math.PI;
  root.add(gearB);

  const gearC = makeGear(0.012, 6, brass, copper);
  gearC.position.set(0.012, 0.262, 0.23);
  root.add(gearC);
  root.userData.gears = [gearA, gearB, gearC];

  // ---- Winding key on the back ----
  add(new THREE.CylinderGeometry(0.022, 0.024, 0.016, 14), brassDark, 0, 0.388, -0.06);
  add(new THREE.CylinderGeometry(0.007, 0.007, 0.083, 8), brass, 0, 0.4365, -0.06);
  const keyRing = add(new THREE.TorusGeometry(0.035, 0.007, 8, 24), brass, 0, 0.49, -0.06);
  keyRing.rotation.x = Math.PI / 2;
  add(new THREE.BoxGeometry(0.07, 0.008, 0.012), brassDark, 0, 0.45, -0.06);

  // ---- Neck and head ----
  const head = add(new THREE.SphereGeometry(0.07, 20, 14), brass, 0, 0.35, 0.28);
  head.scale.set(1, 0.95, 1.1);

  const snout = add(new THREE.CylinderGeometry(0.025, 0.04, 0.09, 12), brass, 0, 0.31, 0.36);
  snout.rotation.x = Math.PI / 2;

  add(new THREE.SphereGeometry(0.02, 10, 8), black, 0, 0.31, 0.405).scale.set(1.2, 0.8, 1);

  // Copper brow band
  const brow = add(new THREE.TorusGeometry(0.068, 0.005, 6, 24), copper, 0, 0.385, 0.28);
  brow.rotation.set(Math.PI / 2 - 0.25, 0, 0);

  // Glass lens eyes with brass rims
  for (const s of [1, -1]) {
    const ex = s * 0.04;
    const rim = add(new THREE.TorusGeometry(0.022, 0.005, 8, 16), brass, ex, 0.37, 0.334);
    rim.rotation.set(0, 0, 0);
    const l = add(new THREE.SphereGeometry(0.017, 12, 10), lens, ex, 0.37, 0.336);
    l.scale.set(1, 1, 0.6);
    rivet(ex + s * 0.0, 0.37 - 0.03, 0.335);
  }

  // Floppy leather ears on hinged pivots
  for (const s of [1, -1]) {
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.055, 0.4, 0.27);
    pivot.rotation.set(0.2, 0, s * 0.4);
    root.add(pivot);
    const ear = add(new THREE.SphereGeometry(0.03, 12, 10), leather, 0, -0.05, 0, pivot);
    ear.scale.set(0.75, 1.9, 0.3);
    ear.rotation.x = 0.15;
  }

  // ---- Collar and brass tag ----
  const collar = add(new THREE.TorusGeometry(0.064, 0.012, 10, 28), redLeather, 0, 0.32, 0.2);
  collar.rotation.x = -0.31;
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 6), brassDark, 0, 0.298, 0.255);
  const tagRing = add(new THREE.TorusGeometry(0.005, 0.0015, 6, 10), brass, 0, 0.285, 0.258);
  tagRing.rotation.x = 0.0;
  const tag = add(new THREE.CylinderGeometry(0.018, 0.018, 0.004, 16), brass, 0, 0.268, 0.262);
  tag.rotation.x = Math.PI / 2 + 0.3;
  rivet(0, 0.268, 0.265);

  // ---- Legs with spring-coil lower sections ----
  const legs: [number, number][] = [
    [0.09, 0.13],
    [-0.09, 0.13],
    [0.09, -0.14],
    [-0.09, -0.14],
  ];
  for (const [x, z] of legs) {
    const hip = new THREE.Group();
    hip.position.set(x, 0.19, z);
    root.add(hip);

    // Hip joint and upper leg
    add(new THREE.SphereGeometry(0.03, 10, 8), brassDark, 0, 0, 0, hip);
    add(new THREE.CylinderGeometry(0.022, 0.02, 0.08, 10), brass, 0, -0.04, 0, hip);
    // Knee
    add(new THREE.SphereGeometry(0.026, 10, 8), brassDark, 0, -0.08, 0, hip);
    // Lower leg core
    add(new THREE.CylinderGeometry(0.009, 0.011, 0.09, 8), copper, 0, -0.125, 0, hip);
    // Spring coils
    for (const cy of [-0.095, -0.11, -0.125, -0.14, -0.155]) {
      const coil = add(new THREE.TorusGeometry(0.014, 0.0038, 6, 14), copper, 0, cy, 0, hip);
      coil.rotation.x = Math.PI / 2;
    }
    // Foot
    const foot = add(new THREE.SphereGeometry(0.03, 12, 8), brass, 0, -0.175, 0.015, hip);
    foot.scale.set(1, 0.6, 1.6);
  }

  // ---- Coiled spring tail ----
  {
    const base = new THREE.Vector3(0, 0.31, -0.2);
    const dir = new THREE.Vector3(0, 0.55, -0.85).normalize();
    const u = new THREE.Vector3(1, 0, 0);
    const v = new THREE.Vector3().crossVectors(dir, u).normalize();
    const pts: THREE.Vector3[] = [];
    const N = 120;
    const turns = 6;
    const length = 0.3;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const c = base.clone().addScaledVector(dir, length * t);
      const ang = t * Math.PI * 2 * turns;
      const r = 0.016;
      c.addScaledVector(u, Math.cos(ang) * r).addScaledVector(v, Math.sin(ang) * r);
      pts.push(c);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    add(new THREE.TubeGeometry(curve, 240, 0.0045, 6, false), copper);
    const tip = pts[pts.length - 1];
    add(new THREE.SphereGeometry(0.008, 8, 6), brass, tip.x, tip.y, tip.z);
  }

  return root;
}
```