import * as THREE from "three";

export const meta = {
  name: "Japanese Garden",
  description:
    "A stylised karesansui and pond garden: raked gravel, a vermilion arched bridge over a rock-rimmed pond, a three-tier pagoda, a stone lantern, a sculpted pine, a flowering cherry, bamboo, and a white plaster wall.",
};

// ---------- seeded randomness ----------
let seed = 7741;
function rnd(): number {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
const rr = (a: number, b: number) => a + (b - a) * rnd();
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

// ---------- materials & helpers ----------
type V3 = [number, number, number];

const matCache = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: string, roughness = 0.85, metalness = 0): THREE.MeshStandardMaterial {
  const key = `${color}|${roughness}|${metalness}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: true });
    matCache.set(key, m);
  }
  return m;
}

function place(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  m: THREE.Material,
  p: V3 = [0, 0, 0],
  r: V3 = [0, 0, 0],
  s: V3 = [1, 1, 1]
): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(...p);
  mesh.rotation.set(...r);
  mesh.scale.set(...s);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function group(parent: THREE.Object3D, x: number, y: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

// shared geometries
const ico1 = new THREE.IcosahedronGeometry(1, 1);
const dodec = new THREE.DodecahedronGeometry(1, 0);
const unitCyl6 = new THREE.CylinderGeometry(1, 1, 1, 6);
const unitCyl8 = new THREE.CylinderGeometry(1, 1, 1, 8);

const rockCols = ["#7d7f80", "#8a8a86", "#6c6f72", "#979488"];
const mossCols = ["#6f9a3c", "#5f8a35", "#7ea84a"];
const blossomCols = ["#f4b6c8", "#f09ab4", "#fbd5df"];
const pineCols = ["#2f5b3a", "#3c6e45", "#2a4f34"];

// ---------- root ----------
const root = new THREE.Group();

// lighting so the materials read even if the host adds none
root.add(new THREE.HemisphereLight(0xffffff, 0x8a7a60, 1.6));
const sun = new THREE.DirectionalLight(0xfff4e0, 1.4);
sun.position.set(6, 10, 6);
root.add(sun);

// ---------- ground ----------
const POND = { x: -2.0, z: -1.0 };

// grass margin
place(root, new THREE.CylinderGeometry(9.5, 9.7, 0.08, 40), mat("#6f8a4e", 0.95), [0, -0.04, 0]);
// raked gravel
place(root, new THREE.CylinderGeometry(7.6, 7.6, 0.03, 40), mat("#e3dac4", 1), [0, 0.005, 0]);

// concentric rake lines around the pond
const rakeMat = mat("#c2b595", 1);
for (const r of [3.2, 3.7, 4.2, 4.7, 5.2]) {
  place(
    root,
    new THREE.TorusGeometry(r, 0.03, 4, 56),
    rakeMat,
    [POND.x, 0.03, POND.z],
    [-Math.PI / 2, 0, 0]
  );
}

// ---------- pond ----------
place(root, new THREE.CylinderGeometry(2.3, 2.3, 0.04, 32), mat("#3b7f8c", 0.12, 0.2), [POND.x, 0.02, POND.z]);

const rockBase = (parent: THREE.Object3D, x: number, z: number, s: number, col?: string) => {
  place(
    parent,
    dodec,
    mat(col ?? pick(rockCols), 0.95),
    [x, s * 0.3, z],
    [rr(0, 3), rr(0, 3), rr(0, 3)],
    [s * rr(0.9, 1.3), s * rr(0.6, 0.8), s * rr(0.9, 1.2)]
  );
};

// rim stones, leaving gaps where the bridge lands
for (let i = 0; i < 22; i++) {
  const a = (i / 22) * Math.PI * 2 + rr(-0.1, 0.1);
  if (Math.abs(Math.sin(a)) < 0.3) continue;
  const rad = 2.55 + rr(-0.1, 0.2);
  rockBase(root, POND.x + Math.cos(a) * rad, POND.z + Math.sin(a) * rad, rr(0.35, 0.6));
}
// two islet stones in the water
rockBase(root, POND.x + 0.6, POND.z - 0.4, 0.5, "#8c8c86");
rockBase(root, POND.x - 0.5, POND.z + 0.7, 0.35, "#7d7f80");

// ---------- vermilion arched bridge ----------
{
  const BR = 2.9; // half span
  const BH = 1.3; // arch height
  const base = 0.08;
  const N = 22;
  const deckMat = mat("#b5432d", 0.55);
  const railMat = mat("#8f3322", 0.6);
  const bridge = group(root, POND.x, 0, POND.z);

  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * Math.PI;
    const t1 = ((i + 1) / N) * Math.PI;
    const x0 = -BR * Math.cos(t0), y0 = base + BH * Math.sin(t0);
    const x1 = -BR * Math.cos(t1), y1 = base + BH * Math.sin(t1);
    const len = Math.hypot(x1 - x0, y1 - y0);
    const ang = Math.atan2(y1 - y0, x1 - x0);
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;

    // deck plank
    place(bridge, new THREE.BoxGeometry(len * 1.08, 0.08, 1.3), deckMat, [mx, my, 0], [0, 0, ang]);
    // handrails on both sides
    for (const zs of [-0.6, 0.6]) {
      place(bridge, new THREE.BoxGeometry(len * 1.02, 0.06, 0.06), railMat, [mx, my + 0.9, zs], [0, 0, ang]);
    }
    // posts
    if (i % 3 === 0) {
      for (const zs of [-0.6, 0.6]) {
        place(bridge, new THREE.BoxGeometry(0.07, 0.9, 0.07), railMat, [x0, y0 + 0.45, zs]);
      }
    }
  }
  // end posts
  for (const zs of [-0.6, 0.6]) {
    place(bridge, new THREE.BoxGeometry(0.07, 0.9, 0.07), railMat, [BR * 1, base + 0.45, zs].map((v, k) => (k === 0 ? -BR : v)) as V3);
  }
}

// ---------- stepping stones ----------
for (let i = 0; i < 9; i++) {
  const t = i / 8;
  const x = THREE.MathUtils.lerp(2.8, 1.1, t) + rr(-0.15, 0.15);
  const z = THREE.MathUtils.lerp(6.3, -0.6, t) + rr(-0.1, 0.1);
  place(
    root,
    new THREE.CylinderGeometry(0.42, 0.46, 0.1, 7),
    mat("#9b948a", 0.9),
    [x, 0.05, z],
    [0, rr(0, 1), 0],
    [1, 1, rr(0.8, 1.1)]
  );
}

// ---------- moss mounds ----------
function moss(parent: THREE.Object3D, x: number, z: number, s: number) {
  place(parent, ico1, mat(pick(mossCols), 0.95), [x, s * 0.12, z], [0, rr(0, 6.28), 0], [s * 1.4, s * 0.42, s * 1.1]);
}
moss(root, POND.x - 3.4, POND.z + 1.9, 0.9);
moss(root, POND.x + 2.9, POND.z - 1.6, 0.7);
moss(root, -4.4, 3.6, 1.1);
moss(root, 1.2, 3.3, 0.6);
moss(root, -0.5, -5.1, 0.8);

// ---------- stone lantern (tōrō) ----------
function lantern(x: number, z: number) {
  const g = group(root, x, 0, z);
  const stone = mat("#8c8a84", 0.95);
  const stoneDark = mat("#6e6c67", 0.95);
  const roofM = mat("#4f5256", 0.9);
  const glow = new THREE.MeshStandardMaterial({
    color: "#ffd27a",
    emissive: new THREE.Color("#ffb347"),
    emissiveIntensity: 1.2,
    roughness: 0.4,
    flatShading: true,
  });

  place(g, new THREE.CylinderGeometry(0.3, 0.34, 0.14, 8), stone, [0, 0.07, 0]);
  place(g, new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8), stone, [0, 0.39, 0]);
  place(g, new THREE.CylinderGeometry(0.26, 0.26, 0.1, 8), stoneDark, [0, 0.69, 0]);
  // lantern chamber: four corner posts around a glowing lamp
  for (const sx of [-0.19, 0.19]) {
    for (const sz of [-0.19, 0.19]) {
      place(g, new THREE.BoxGeometry(0.08, 0.34, 0.08), stone, [sx, 0.91, sz]);
    }
  }
  place(g, new THREE.BoxGeometry(0.3, 0.26, 0.3), glow, [0, 0.91, 0]);
  place(g, new THREE.BoxGeometry(0.46, 0.06, 0.46), stoneDark, [0, 0.76, 0]);
  place(g, new THREE.BoxGeometry(0.46, 0.06, 0.46), stoneDark, [0, 1.07, 0]);
  // flared six-sided roof
  place(g, new THREE.CylinderGeometry(0.22, 0.5, 0.2, 6), roofM, [0, 1.18, 0]);
  place(g, new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), stone, [0, 1.33, 0]);
  place(g, ico1, glow, [0, 1.42, 0], [0, 0, 0], [0.08, 0.08, 0.08]);
}
lantern(POND.x + 0.8, -4.2);

// ---------- three-tier pagoda ----------
function pagoda(x: number, z: number) {
  const g = group(root, x, 0, z);
  const wall = mat("#efe7d6", 0.9);
  const roofM = mat("#3b4150", 0.6);
  const wood = mat("#6b4a32", 0.8);
  const plinth = mat("#8e8a82", 0.95);

  place(g, new THREE.BoxGeometry(3.0, 0.35, 3.0), plinth, [0, 0.175, 0]);
  let y = 0.35;
  const scales = [1, 0.72, 0.5];
  for (const s of scales) {
    const bodyH = 0.9;
    place(g, new THREE.BoxGeometry(2.04 * s, 0.1, 2.04 * s), wood, [0, y + 0.05, 0]);
    place(g, new THREE.BoxGeometry(2.0 * s, bodyH, 2.0 * s), wall, [0, y + bodyH / 2, 0]);
    y += bodyH;
    const rh = 0.5;
    place(g, new THREE.CylinderGeometry(1.1 * s, 1.9 * s, rh, 4), roofM, [0, y + rh / 2, 0], [0, Math.PI / 4, 0]);
    y += rh;
  }
  place(g, new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), wood, [0, y + 0.35, 0]);
  place(g, ico1, roofM, [0, y + 0.8, 0], [0, 0, 0], [0.14, 0.14, 0.14]);
}
pagoda(4.0, -4.5);

// ---------- pine tree ----------
function pine(x: number, z: number, h: number, lean: number) {
  const g = group(root, x, 0, z);
  g.rotation.z = lean;
  const trunkM = mat("#5b4330", 0.9);
  place(g, new THREE.CylinderGeometry(0.09, 0.2, h * 0.75, 6), trunkM, [0, h * 0.375, 0]);
  const clumps: [number, number, number, number][] = [
    [0, h * 0.72, 0, 1.2],
    [0.9, h * 0.85, 0.3, 0.85],
    [-0.8, h * 0.82, -0.2, 0.9],
    [0.2, h * 0.98, -0.5, 0.7],
    [-0.4, h * 0.6, 0.7, 0.8],
    [0.6, h * 0.62, -0.6, 0.7],
  ];
  for (const [cx, cy, cz, r] of clumps) {
    place(
      g,
      ico1,
      mat(pick(pineCols), 0.9),
      [cx, cy, cz],
      [0, rr(0, 3), 0],
      [r * 1.3, r * 0.45, r * 1.1]
    );
  }
}
pine(-5.2, -3.0, 4.6, 0.06);
pine(-6.0, 1.8, 3.2, -0.08);
pine(-0.5, 4.2, 2.6, 0.04);

// ---------- flowering cherry ----------
function cherry(x: number, z: number) {
  const g = group(root, x, 0, z);
  const trunkM = mat("#4b3a33", 0.9);
  place(g, new THREE.CylinderGeometry(0.1, 0.18, 1.8, 6), trunkM, [0, 0.9, 0]);
  const branchGeo = new THREE.CylinderGeometry(0.035, 0.06, 1.2, 5);
  const up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    const dir = new THREE.Vector3(Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5).normalize();
    const br = place(g, branchGeo, trunkM, [
      Math.cos(a) * 0.25 + dir.x * 0.6,
      1.6 + dir.y * 0.6,
      Math.sin(a) * 0.25 + dir.z * 0.6,
    ]);
    br.quaternion.setFromUnitVectors(up, dir);
  }
  for (let k = 0; k < 10; k++) {
    const a = rr(0, Math.PI * 2);
    const d = rr(0, 1.1);
    const r = rr(0.55, 0.85);
    place(
      g,
      ico1,
      mat(pick(blossomCols), 0.8),
      [Math.cos(a) * d, 3.1 + rr(-0.3, 0.8), Math.sin(a) * d],
      [0, rr(0, 3), 0],
      [r, r * 0.85, r]
    );
  }
}
cherry(5.2, 1.5);

// ---------- bamboo grove ----------
function bamboo(cx: number, cz: number, count: number) {
  const stalkM = mat("#7fa552", 0.6);
  const nodeM = mat("#5e7f3a", 0.6);
  const leafM = mat("#5f8f3f", 0.8);
  for (let i = 0; i < count; i++) {
    const x = cx + rr(-1.2, 1.2);
    const z = cz + rr(-0.8, 0.8);
    const h = rr(4, 6.2);
    const g = group(root, x, 0, z);
    g.rotation.z = rr(-0.05, 0.05);
    place(g, unitCyl6, stalkM, [0, h / 2, 0], [0, 0, 0], [0.07, h, 0.07]);
    for (let y = 0.6; y < h - 0.3; y += 0.6) {
      place(g, unitCyl6, nodeM, [0, y, 0], [0, 0, 0], [0.09, 0.05, 0.09]);
    }
    place(g, ico1, leafM, [rr(-0.1, 0.1), h - 0.2, rr(-0.1, 0.1)], [rr(0, 3), rr(0, 3), 0], [0.55, 0.2, 0.25]);
  }
}
bamboo(-5.0, -5.8, 12);

// ---------- clipped shrubs (karikomi) and azaleas ----------
function shrub(x: number, z: number, r: number, flowers: boolean) {
  const g = group(root, x, 0, z);
  place(g, ico1, mat("#3f7a45", 0.9), [0, r * 0.6, 0], [0, 0, 0], [r, r * 0.8, r]);
  if (flowers) {
    for (let k = 0; k < 5; k++) {
      const a = rr(0, Math.PI * 2);
      place(g, ico1, mat(pick(blossomCols), 0.8), [Math.cos(a) * r * 0.7, r * 1.0, Math.sin(a) * r * 0.7], [0, 0, 0], [0.12, 0.12, 0.12]);
    }
  }
}
shrub(-6.4, -0.2, 0.75, false);
shrub(-0.8, 3.2, 0.6, false);
for (const x of [-4.8, -3.2, -1.6, 0, 1.6]) {
  shrub(x, -6.4, rr(0.4, 0.55), true);
}

// ---------- tsukubai (water basin) ----------
{
  const g = group(root, 2.6, 0, -0.2);
  const stone = mat("#8c8a84", 0.95);
  place(g, new THREE.CylinderGeometry(0.22, 0.28, 0.5, 8), stone, [0, 0.25, 0]);
  place(g, new THREE.CylinderGeometry(0.42, 0.34, 0.25, 8), stone, [0, 0.62, 0]);
  place(g, new THREE.CylinderGeometry(0.34, 0.34, 0.03, 8), mat("#3b7f8c", 0.1, 0.2), [0, 0.74, 0]);
}

// ---------- back wall with tiled coping ----------
place(root, new THREE.BoxGeometry(11, 2.2, 0.4), mat("#eee6d3", 0.9), [0, 1.1, -7]);
place(root, new THREE.BoxGeometry(11.4, 0.14, 0.7), mat("#353a44", 0.6), [0, 2.27, -7]);

// ---------- done ----------
export default function createJapaneseGarden(): THREE.Object3D {
  return root;
}
