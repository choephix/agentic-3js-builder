```ts
import * as THREE from "three";

export const meta = {
  name: "Phoenix",
  description:
    "A stylised phoenix perched on a rock, with a flared crest, spread wings with flame-tipped primaries, and a long fan of fire-tipped tail feathers.",
};

const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Palette
const GOLD = 0xf2b233;
const ORANGE = 0xf06a1e;
const RED = 0xc81e2a;
const DEEP = 0x7a1020;
const BEAK = 0xe0a030;
const DARK = 0x3a2418;
const ROCK = 0x5d5148;
const FLAME = 0xffc040;

// Seeded generator so every run builds the same model
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: number, rough = 0.6, metal = 0.05, emis = 0, ei = 0) {
  const key = `${color}|${rough}|${metal}|${emis}|${ei}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: rough,
      metalness: metal,
      emissive: emis,
      emissiveIntensity: ei,
    });
    cache.set(key, m);
  }
  return m;
}

const g = new THREE.Group();

// Places a mesh with its base at `from`, axis pointing along `dir`.
function along(geo: THREE.BufferGeometry, from: THREE.Vector3, dir: THREE.Vector3, m: THREE.Material) {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.copy(from);
  mesh.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  g.add(mesh);
  return mesh;
}

// Cone with base at origin and tip along +Y.
function spikeGeo(r: number, len: number, seg = 5) {
  const geo = new THREE.ConeGeometry(r, len, seg);
  geo.translate(0, len / 2, 0);
  return geo;
}

// Rod between two points.
function rod(from: THREE.Vector3, to: THREE.Vector3, r: number, m: THREE.Material) {
  const d = to.clone().sub(from);
  const len = d.length();
  const geo = new THREE.CylinderGeometry(r * 0.8, r, len, 6);
  geo.translate(0, len / 2, 0);
  return along(geo, from, d, m);
}

function blob(r: number, pos: THREE.Vector3, m: THREE.Material, sx = 1, sy = 1, sz = 1, seg = 10) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2)), m);
  mesh.position.copy(pos);
  mesh.scale.set(sx, sy, sz);
  g.add(mesh);
  return mesh;
}

// Flat blade-like feather: a four-sided cone squashed across z.
function featherGeo(r: number, len: number) {
  const geo = new THREE.ConeGeometry(r, len, 4);
  geo.translate(0, len / 2, 0);
  geo.scale(1, 1, 0.35);
  return geo;
}

// ---------- Rock perch ----------
const rockGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.18, 7);
const rock = new THREE.Mesh(rockGeo, mat(ROCK, 0.95));
rock.position.set(0, 0.09, 0);
rock.rotation.y = 0.3;
g.add(rock);

// ---------- Body ----------
blob(0.42, V(0, 1.3, 0), mat(ORANGE), 0.85, 1, 1.3);      // torso
blob(0.3, V(0, 1.4, 0.3), mat(GOLD), 0.9, 0.95, 0.9, 8);  // breast
blob(0.25, V(0, 1.2, -0.4), mat(ORANGE), 0.9, 0.9, 0.9, 8); // rump

// Neck and head
rod(V(0, 1.6, 0.35), V(0, 1.95, 0.6), 0.16, mat(ORANGE));
blob(0.2, V(0, 2.05, 0.68), mat(GOLD), 1, 0.95, 1.05, 8);

// Beak
along(spikeGeo(0.08, 0.36), V(0, 2.0, 0.85), V(0, -0.25, 1), mat(BEAK, 0.4, 0.3));

// Glowing eyes
const eyeMat = mat(FLAME, 0.3, 0, FLAME, 2.2);
blob(0.035, V(-0.09, 2.1, 0.82), eyeMat, 1, 1, 1, 6);
blob(0.035, V(0.09, 2.1, 0.82), eyeMat, 1, 1, 1, 6);

// Crest: fan of spikes sweeping back from the head
const crestPal = [RED, ORANGE, GOLD];
for (let i = 0; i < 5; i++) {
  const off = i - 2;
  const len = 0.6 - 0.14 * Math.abs(off);
  const base = V(0, 2.16, 0.6);
  const dir = V(off * 0.28, 0.7 - 0.05 * Math.abs(off), -0.85);
  along(spikeGeo(0.06, len, 4), base, dir, mat(crestPal[i % 3], 0.5));
  // Ember tip on each crest plume
  along(
    spikeGeo(0.04, 0.2, 4),
    base.clone().add(dir.clone().normalize().multiplyScalar(len * 0.7)),
    dir,
    mat(FLAME, 0.3, 0, FLAME, 1.8)
  );
}

// ---------- Legs and talons ----------
for (const s of [-1, 1]) {
  const x = s * 0.16;
  rod(V(x, 0.2, 0.05), V(x, 0.95, 0.0), 0.045, mat(DARK, 0.7));
  // Toes: forward and two splayed
  const toeBase = V(x, 0.19, 0.02);
  along(spikeGeo(0.035, 0.2, 4), toeBase, V(0, -0.1, 1), mat(DARK, 0.5));
  along(spikeGeo(0.03, 0.16, 4), toeBase, V(s * 0.45, -0.1, 0.85), mat(DARK, 0.5));
  along(spikeGeo(0.03, 0.16, 4), toeBase, V(-s * 0.2, -0.1, 0.9), mat(DARK, 0.5));
}

// ---------- Wings (raised and spread) ----------
const primaryPal = [RED, ORANGE, RED, DEEP, RED, ORANGE, DEEP];
for (const s of [-1, 1]) {
  const shoulder = V(s * 0.3, 1.55, 0.05);
  const elbow = V(s * 0.85, 2.15, -0.15);
  const wrist = V(s * 1.25, 2.25, -0.5);

  blob(0.1, shoulder, mat(GOLD, 0.4, 0.3), 1, 1, 1, 8);
  blob(0.09, elbow, mat(GOLD, 0.4, 0.3), 1, 1, 1, 8);
  rod(shoulder, elbow, 0.1, mat(ORANGE));
  rod(elbow, wrist, 0.08, mat(ORANGE));

  // Primary feathers fanning out from the wrist
  for (let i = 0; i < 7; i++) {
    const base = wrist.clone().add(V(0, -0.02 * i, -0.07 * i));
    const dir = V(s * (0.9 - 0.06 * i), 0.05 - 0.03 * i, -0.55 - 0.06 * i);
    const len = 1.1 - 0.08 * i;
    along(featherGeo(0.13, len), base, dir, mat(primaryPal[i], 0.55));
    if (i < 3) {
      // Flame-coloured tips on the leading primaries
      const tipPos = base.clone().add(dir.clone().normalize().multiplyScalar(len * 0.7));
      along(spikeGeo(0.07, 0.34, 4), tipPos, dir, mat(FLAME, 0.3, 0, FLAME, 1.6));
    }
  }

  // Secondary coverts along the forearm
  const secPal = [ORANGE, GOLD, ORANGE, GOLD];
  for (let k = 0; k < 4; k++) {
    const t = (k + 0.5) / 4;
    const base = elbow.clone().lerp(wrist, t).add(V(0, -0.05, 0.02));
    const dir = V(s * 0.4, 0.25, -0.9);
    along(featherGeo(0.12, 0.6 - 0.04 * k), base, dir, mat(secPal[k], 0.55));
  }
}

// ---------- Tail: fan of long feathers with fire tips ----------
const tailBase = V(0, 1.15, -0.5);
const tailPal = [RED, ORANGE, GOLD];
for (let i = 0; i < 7; i++) {
  const off = i - 3;
  const dir = V(off * 0.22, 0.35 + Math.abs(off) * 0.05, -1);
  const len = 2.0 - 0.15 * Math.abs(off);
  along(spikeGeo(0.1, len, 5), tailBase, dir, mat(tailPal[i % 3], 0.5));
  const tipPos = tailBase.clone().add(dir.clone().normalize().multiplyScalar(len * 0.65));
  along(spikeGeo(0.09, 0.5, 5), tipPos, dir, mat(FLAME, 0.3, 0, FLAME, 2.0));
}

// ---------- Floating embers around the bird ----------
const rnd = mulberry32(7);
const emberMat = mat(FLAME, 0.3, 0, FLAME, 2.5);
const emberGeo = new THREE.OctahedronGeometry(0.04, 0);
for (let i = 0; i < 14; i++) {
  const a = rnd() * Math.PI * 2;
  const r = 0.9 + rnd() * 0.6;
  const y = 0.8 + rnd() * 2.4;
  const e = new THREE.Mesh(emberGeo, emberMat);
  e.position.set(Math.cos(a) * r, y, Math.sin(a) * r * 0.8);
  e.scale.setScalar(0.6 + rnd() * 0.8);
  g.add(e);
}

export default function createModel(): THREE.Object3D {
  return g;
}
```