```ts
import * as THREE from "three";

export const meta = {
  name: "Mossstone Hart",
  description:
    "A small forest spirit, part deer and part mossy river stone: a grey stone body under soft green moss, slender wooden legs ending in hooves, branching antlers with tiny white flowers and leaves, a pale wooden mask face with glowing green eyes, and fireflies circling its head.",
};

type Spec = {
  color: number;
  emissive?: number;
  emissiveIntensity?: number;
  opacity?: number;
};

const PALETTE: Record<string, Spec> = {
  stoneA: { color: 0x6e7469 },
  stoneB: { color: 0x878d84 },
  stoneC: { color: 0x575e57 },
  mossDark: { color: 0x3c6a2a },
  mossMid: { color: 0x5e9137 },
  mossLight: { color: 0x8fbc56 },
  wood: { color: 0x7e5733 },
  woodDark: { color: 0x4b3423 },
  hoof: { color: 0x2b211a },
  mask: { color: 0xead9b3 },
  cranium: { color: 0xc2a97d },
  socket: { color: 0x1d160f },
  glow: { color: 0xa6ff74, emissive: 0x5cff2e, emissiveIntensity: 2.6 },
  eyeHalo: { color: 0x7dff5a, emissive: 0x4cff20, emissiveIntensity: 1.2, opacity: 0.22 },
  antler: { color: 0xd2c19e },
  petal: { color: 0xf9f7ef },
  petalCore: { color: 0xf3cb4e, emissive: 0x806010, emissiveIntensity: 0.6 },
  leafA: { color: 0x6aa84a },
  leafB: { color: 0x9ccf62 },
  ear: { color: 0xc8ac7c },
  line: { color: 0x4b3827 },
  firefly: { color: 0xdcff73, emissive: 0xe6ff4a, emissiveIntensity: 3.2 },
  fireflyHalo: { color: 0xeaff9c, emissive: 0xd8ff5a, emissiveIntensity: 1.4, opacity: 0.3 },
};

type Vec3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildForestSpirit(): THREE.Object3D {
  const rng = mulberry32(7741);

  // One shared material per colour name.
  const cache = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (name: string): THREE.MeshStandardMaterial => {
    let m = cache.get(name);
    if (!m) {
      const s = PALETTE[name];
      m = new THREE.MeshStandardMaterial({
        color: s.color,
        emissive: s.emissive ?? 0x000000,
        emissiveIntensity: s.emissiveIntensity ?? 1,
        roughness: 0.92,
        metalness: 0,
        flatShading: true,
        transparent: s.opacity !== undefined,
        opacity: s.opacity ?? 1,
        depthWrite: s.opacity === undefined,
      });
      cache.set(name, m);
    }
    return m;
  };

  // Shared vertices get the same offset, so rocky shapes stay watertight.
  const jitter = (g: THREE.BufferGeometry, amt: number): THREE.BufferGeometry => {
    const pos = g.attributes.position as THREE.BufferAttribute;
    const offsets = new Map<string, Vec3>();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const key = x.toFixed(4) + "," + y.toFixed(4) + "," + z.toFixed(4);
      let o = offsets.get(key);
      if (!o) {
        o = [(rng() - 0.5) * 2 * amt, (rng() - 0.5) * 2 * amt, (rng() - 0.5) * 2 * amt];
        offsets.set(key, o);
      }
      pos.setXYZ(i, x + o[0], y + o[1], z + o[2]);
    }
    g.computeVertexNormals();
    return g;
  };

  // A lumpy ellipsoid: stones, moss, sockets, eyes and so on.
  const lump = (
    parent: THREE.Object3D,
    name: string,
    radius: number,
    detail: number,
    scale: Vec3,
    at: Vec3,
    jit = 0.16,
    spin = false
  ): THREE.Mesh => {
    const g = new THREE.IcosahedronGeometry(radius, detail);
    if (jit > 0) jitter(g, radius * jit);
    g.scale(scale[0], scale[1], scale[2]);
    const m = new THREE.Mesh(g, mat(name));
    m.position.set(at[0], at[1], at[2]);
    if (spin) m.rotation.y = rng() * Math.PI * 2;
    parent.add(m);
    return m;
  };

  const plank = (parent: THREE.Object3D, name: string, size: Vec3, at: Vec3, rz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat(name));
    m.position.set(at[0], at[1], at[2]);
    m.rotation.z = rz;
    parent.add(m);
    return m;
  };

  // Tapered cylinder from a (radius rA) to b (radius rB).
  const limb = (
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    rA: number,
    rB: number,
    name: string,
    segs = 6,
    jit = 0
  ) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(rB, rA, len, segs, 1);
    if (jit > 0) jitter(g, jit);
    const m = new THREE.Mesh(g, mat(name));
    m.position.addVectors(a, b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, dir.normalize());
    parent.add(m);
    return m;
  };

  // Flattened moss pad lying on a surface with normal n.
  const mossClump = (parent: THREE.Object3D, rad: number, p: THREE.Vector3, n: THREE.Vector3) => {
    const g = new THREE.DodecahedronGeometry(rad, 1);
    jitter(g, rad * 0.3);
    g.scale(1, 0.55, 1.1);
    const pick = rng();
    const m = new THREE.Mesh(g, mat(pick < 0.45 ? "mossDark" : pick < 0.8 ? "mossMid" : "mossLight"));
    m.position.copy(p);
    m.quaternion.setFromUnitVectors(UP, n);
    m.rotateY(rng() * Math.PI * 2);
    parent.add(m);
    return m;
  };

  const addHoof = (parent: THREE.Object3D, x: number, z: number) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 0.07, 6), mat("hoof"));
    m.position.set(x, 0.035, z);
    parent.add(m);
  };

  const root = new THREE.Group();
  root.name = "ForestSpirit";

  // ---------- Stone torso: four river stones fused into one body ----------
  lump(root, "stoneB", 0.27, 1, [1.05, 0.95, 1.0], [0, 0.96, 0.32]);
  lump(root, "stoneA", 0.3, 1, [1.08, 0.92, 1.1], [0, 0.97, -0.02]);
  lump(root, "stoneC", 0.26, 1, [1.0, 0.9, 0.95], [0, 0.95, -0.36]);
  lump(root, "stoneC", 0.22, 1, [1.0, 0.8, 1.0], [0, 0.8, 0.02], 0.14);

  // Moss pads hugging the torso.
  const TX = 0.31, TY = 0.27, TZ = 0.58, TCY = 0.97;
  for (let placed = 0, tries = 0; placed < 22 && tries < 400; tries++) {
    const v = V(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize();
    if (v.y < -0.15) continue;
    const p = V(v.x * TX, TCY + v.y * TY, v.z * TZ);
    const n = V(v.x / TX, v.y / TY, v.z / TZ).normalize();
    p.addScaledVector(n, 0.02);
    mossClump(root, 0.06 + rng() * 0.07, p, n);
    placed++;
  }

  // ---------- Neck: a tapered stone column with moss ----------
  const neckA = V(0, 1.1, 0.4);
  const neckB = V(0, 1.46, 0.6);
  limb(root, neckA, neckB, 0.17, 0.12, "stoneB", 7, 0.025);
  const nd = neckB.clone().sub(neckA).normalize();
  const nOrtho = V(0, nd.z, -nd.y); // perpendicular to the neck axis
  for (let k = 0; k < 5; k++) {
    const t = 0.1 + k * 0.2 + rng() * 0.08;
    const a = rng() * Math.PI * 2;
    const n = V(Math.cos(a), 0, 0).addScaledVector(nOrtho, Math.sin(a)).normalize();
    const rad = 0.17 - 0.05 * t;
    const p = new THREE.Vector3().lerpVectors(neckA, neckB, t).addScaledVector(n, rad * 0.95);
    mossClump(root, 0.05 + rng() * 0.03, p, n);
  }

  // ---------- Head: pale wooden mask over a wooden skull ----------
  const head = new THREE.Group();
  head.name = "Head";
  head.position.set(0, 1.58, 0.7);
  head.rotation.x = 0.22;
  root.add(head);

  lump(head, "cranium", 0.11, 2, [0.92, 0.98, 1.12], [0, 0, 0], 0.05);
  lump(head, "mask", 0.1, 2, [0.92, 1.05, 0.45], [0, 0.005, 0.1], 0.04);
  lump(head, "mask", 0.07, 2, [0.8, 0.85, 1.7], [0, -0.045, 0.2], 0.04);
  lump(head, "mossMid", 0.05, 1, [1.3, 0.55, 1.05], [0, 0.1, -0.045], 0.2);
  lump(head, "woodDark", 0.028, 1, [1, 0.85, 1], [0, -0.05, 0.31], 0.05);

  for (const sx of [-1, 1]) {
    const ex = sx * 0.052;
    lump(head, "socket", 0.032, 1, [1, 0.75, 0.45], [ex, 0.03, 0.13], 0.05);
    const eye = lump(head, "glow", 0.02, 1, [1.35, 0.6, 0.7], [ex, 0.03, 0.142], 0);
    eye.rotation.z = sx * 0.3; // almond eyes, outer corners lifted
    lump(head, "eyeHalo", 0.036, 1, [1.3, 0.9, 0.7], [ex, 0.03, 0.142], 0);
    // Carved tear marks under each eye.
    plank(head, "line", [0.012, 0.045, 0.012], [sx * 0.07, -0.02, 0.128], sx * 0.5);
  }
  // Carved line down the forehead.
  plank(head, "line", [0.01, 0.06, 0.012], [0, 0.075, 0.134]);

  // Long wooden ears.
  for (const sx of [-1, 1]) {
    const a = V(sx * 0.085, 0.03, -0.03);
    const dir = V(sx * 0.9, 0.45, -0.35).normalize();
    limb(head, a, a.clone().addScaledVector(dir, 0.2), 0.036, 0.006, "ear", 4);
  }

  // ---------- Antlers: recursive branching with flowers and leaves ----------
  const petalGeo = new THREE.IcosahedronGeometry(0.013, 0);
  petalGeo.scale(1, 0.4, 1);
  const coreGeo = new THREE.IcosahedronGeometry(0.005, 0);
  const leafGeo = new THREE.IcosahedronGeometry(0.024, 0);
  leafGeo.scale(0.55, 0.18, 1.5);

  const flowerAt = (p: THREE.Vector3, rr: () => number) => {
    const g = new THREE.Group();
    g.position.copy(p);
    g.rotation.set((rr() - 0.5) * 1.2, rr() * Math.PI * 2, (rr() - 0.5) * 1.2);
    g.add(new THREE.Mesh(petalGeo, mat("petal")));
    const core = new THREE.Mesh(coreGeo, mat("petalCore"));
    core.position.y = 0.004;
    g.add(core);
    head.add(g);
  };

  const leafAt = (p: THREE.Vector3, rr: () => number) => {
    const m = new THREE.Mesh(leafGeo, mat(rr() < 0.5 ? "leafA" : "leafB"));
    m.position.copy(p);
    m.rotation.set((rr() - 0.5) * 1.0, rr() * Math.PI * 2, (rr() - 0.5) * 0.9);
    head.add(m);
  };

  function perpTo(d: THREE.Vector3, rr: () => number): THREE.Vector3 {
    for (let k = 0; k < 4; k++) {
      const v = V(rr() - 0.5, rr() - 0.5, rr() - 0.5);
      const c = new THREE.Vector3().crossVectors(d, v);
      if (c.lengthSq() > 1e-4) return c.normalize();
    }
    return V(1, 0, 0);
  }

  function grow(
    rr: () => number,
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r: number,
    depth: number
  ): void {
    const end = origin.clone().addScaledVector(dir, len);
    limb(head, origin, end, r, r * 0.74, "antler", 5);

    if (depth === 0) {
      const flowers = 2 + (rr() < 0.5 ? 1 : 0);
      for (let k = 0; k < flowers; k++) {
        const off = V((rr() - 0.5) * 0.03, (rr() - 0.5) * 0.03, (rr() - 0.5) * 0.03);
        flowerAt(end.clone().add(off), rr);
      }
      leafAt(end.clone().add(V((rr() - 0.5) * 0.02, 0.012, (rr() - 0.5) * 0.02)), rr);
      return;
    }

    if (depth <= 2 && rr() < 0.7) {
      const mid = origin.clone().lerp(end, 0.4 + rr() * 0.3);
      if (rr() < 0.5) leafAt(mid, rr);
      else flowerAt(mid.add(V(0, 0.008, 0)), rr);
    }

    // Main beam continues, slightly curled.
    const cont = dir.clone().applyAxisAngle(perpTo(dir, rr), 0.14 + rr() * 0.14).normalize();
    grow(rr, end, cont, len * 0.78, r * 0.76, depth - 1);

    // Tine branches off, kept above the skull.
    const tine = dir.clone().applyAxisAngle(perpTo(dir, rr), 0.6 + rr() * 0.45).normalize();
    if (tine.y < 0.15) {
      tine.y = 0.15;
      tine.normalize();
    }
    grow(rr, end, tine, len * 0.6, r * 0.6, depth - 1);
  }

  for (const sx of [-1, 1]) {
    const rr = mulberry32(9001);
    grow(rr, V(sx * 0.065, 0.1, -0.03), V(sx * 0.4, 1, -0.22).normalize(), 0.17, 0.024, 3);
  }

  // ---------- Legs: slender wood with knobs and hooves ----------
  for (const sx of [-1, 1]) {
    // Front leg
    const fx = sx * 0.15;
    const fz = 0.33;
    addHoof(root, fx, fz);
    limb(root, V(fx, 0.06, fz), V(fx, 0.36, fz), 0.02, 0.03, "wood", 5);
    lump(root, "woodDark", 0.03, 0, [1, 1, 1], [fx, 0.36, fz], 0.1);
    limb(root, V(fx, 0.36, fz), V(fx, 0.8, fz), 0.03, 0.045, "wood", 6);

    // Hind leg with a backward-set hock
    const bx = sx * 0.16;
    addHoof(root, bx, -0.36);
    limb(root, V(bx, 0.07, -0.36), V(bx, 0.36, -0.42), 0.02, 0.03, "wood", 5);
    lump(root, "woodDark", 0.032, 0, [1, 1, 1], [bx, 0.36, -0.42], 0.1);
    limb(root, V(bx, 0.36, -0.42), V(bx, 0.8, -0.3), 0.03, 0.05, "wood", 6);
  }

  // Short tail with a white tuft.
  limb(root, V(0, 1.0, -0.6), V(0, 0.95, -0.7), 0.035, 0.02, "wood", 5);
  lump(root, "petal", 0.05, 1, [1, 0.9, 1], [0, 0.94, -0.72], 0.1);

  // ---------- Ground: pebbles and a low moss mound ----------
  lump(root, "stoneC", 0.05, 1, [1.2, 0.7, 1.0], [0.27, 0.0, 0.5], 0.2);
  lump(root, "stoneA", 0.04, 1, [1.0, 0.7, 1.1], [-0.3, 0.0, 0.44], 0.2);
  lump(root, "stoneB", 0.035, 1, [1.0, 0.7, 1.0], [0.24, 0.0, -0.5], 0.2);
  lump(root, "stoneA", 0.03, 1, [1.0, 0.7, 1.0], [-0.22, 0.0, -0.56], 0.2);
  lump(root, "mossDark", 0.5, 1, [1.25, 0.07, 1.0], [0, 0, 0], 0.12);

  // ---------- Fireflies circling the head ----------
  const ffGeo = new THREE.IcosahedronGeometry(0.011, 0);
  const ffHaloGeo = new THREE.IcosahedronGeometry(0.03, 1);
  const fireflyCentre = V(0, 1.72, 0.66);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rng() * 0.5;
    const R = 0.36 + rng() * 0.14;
    const p = V(Math.cos(a) * R, (rng() - 0.5) * 0.32, Math.sin(a) * R * 0.8).add(fireflyCentre);
    const core = new THREE.Mesh(ffGeo, mat("firefly"));
    core.position.copy(p);
    const halo = new THREE.Mesh(ffHaloGeo, mat("fireflyHalo"));
    halo.position.copy(p);
    root.add(core, halo);
  }

  return root;
}
```