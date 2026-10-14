import * as THREE from "three";

export const meta = {
  name: "Delighted Red Panda on a Mossy Log",
  description:
    "A low-poly red panda balancing on a moss-covered fallen branch, one paw raised to nibble a leafy bamboo stalk. Rusty back, black belly and legs, round white face with red tear marks, white-rimmed ears and a fat cream-and-ginger ringed tail, on a little forest-floor diorama with a stump, boulders, mushrooms and flowers.",
};

const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

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

/* ------------------------------------------------------------------ */
/* canvas textures (all guarded so the module also runs without a DOM) */
/* ------------------------------------------------------------------ */
function makeCanvas(w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
function toTexture(c: HTMLCanvasElement | null, rx = 1, ry = 1): THREE.Texture | null {
  if (!c) return null;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  return t;
}
function furTexture(base: string, seed: number, rep = 2): THREE.Texture | null {
  const c = makeCanvas(128, 128);
  if (!c) return null;
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, 128, 128);
  const r = mulberry32(seed * 977 + 13);
  g.lineCap = "round";
  for (let i = 0; i < 380; i++) {
    const x = r() * 128;
    const y = r() * 128;
    const len = 5 + r() * 11;
    const ang = Math.PI / 2 + (r() - 0.5) * 0.7;
    g.strokeStyle =
      r() < 0.5 ? `rgba(20,6,0,${0.05 + r() * 0.12})` : `rgba(255,236,200,${0.05 + r() * 0.12})`;
    g.lineWidth = 1 + r() * 1.6;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    g.stroke();
  }
  return toTexture(c, rep, rep);
}
function barkTexture(): THREE.Texture | null {
  const c = makeCanvas(128, 128);
  if (!c) return null;
  const g = c.getContext("2d")!;
  const r = mulberry32(99);
  g.fillStyle = "#5b4132";
  g.fillRect(0, 0, 128, 128);
  const cols = ["#4a3326", "#6a4c38", "#3e2a1f", "#74553f"];
  for (let i = 0; i < 90; i++) {
    g.fillStyle = cols[Math.floor(r() * cols.length)];
    g.fillRect(r() * 128, r() * 128, 2 + r() * 6, 14 + r() * 60);
  }
  g.strokeStyle = "rgba(25,14,8,0.7)";
  g.lineWidth = 1;
  for (let i = 0; i < 34; i++) {
    let x = r() * 128;
    let y = r() * 128;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (r() - 0.5) * 5;
      y += 6 + r() * 8;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  for (let i = 0; i < 16; i++) {
    g.fillStyle = "rgba(170,190,120,0.45)";
    g.beginPath();
    g.arc(r() * 128, r() * 128, 1.5 + r() * 3.5, 0, Math.PI * 2);
    g.fill();
  }
  return toTexture(c, 3, 3);
}
function ringTexture(): THREE.Texture | null {
  const c = makeCanvas(128, 128);
  if (!c) return null;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5b4132";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#dcb277";
  g.beginPath();
  g.arc(64, 64, 57, 0, Math.PI * 2);
  g.fill();
  for (let k = 1; k <= 9; k++) {
    g.strokeStyle = k % 2 ? "#b5834c" : "#c99a62";
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(64 + ((k % 3) - 1) * 0.8, 64, k * 6, 0, Math.PI * 2);
    g.stroke();
  }
  g.strokeStyle = "rgba(70,40,20,0.55)";
  g.lineWidth = 1.2;
  for (const a of [0.4, 2.3, 4.1]) {
    g.beginPath();
    g.moveTo(64, 64);
    g.lineTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50);
    g.stroke();
  }
  g.fillStyle = "#9a6a38";
  g.beginPath();
  g.arc(64, 64, 3, 0, Math.PI * 2);
  g.fill();
  return toTexture(c, 1, 1);
}
function groundTexture(): THREE.Texture | null {
  const c = makeCanvas(256, 256);
  if (!c) return null;
  const g = c.getContext("2d")!;
  const r = mulberry32(5);
  g.fillStyle = "#4f7f2e";
  g.fillRect(0, 0, 256, 256);
  const cols = ["#5c8f34", "#44722a", "#6aa03c", "#3b6526"];
  for (let i = 0; i < 280; i++) {
    const s = 8 + r() * 18;
    g.fillStyle = cols[Math.floor(r() * cols.length)];
    g.fillRect(r() * 256, r() * 256, s, s);
  }
  for (let i = 0; i < 120; i++) {
    g.fillStyle = r() < 0.7 ? "#8cc255" : "#7b5a38";
    const s = 2 + r() * 4;
    g.fillRect(r() * 256, r() * 256, s, s);
  }
  return toTexture(c, 1, 1);
}

function leafGeo(len: number, hw: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(hw * 2, len * 0.4, 0, len);
  s.quadraticCurveTo(-hw * 2, len * 0.4, 0, 0);
  return new THREE.ShapeGeometry(s, 2);
}

function ribbonGeo(pts: THREE.Vector3[], norms: THREE.Vector3[], widths: number[]) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const tan = b.clone().sub(a).normalize();
    const side = new THREE.Vector3().crossVectors(tan, norms[i]).normalize().multiplyScalar(widths[i] / 2);
    const l = pts[i].clone().sub(side);
    const r = pts[i].clone().add(side);
    pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
    if (i < pts.length - 1) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* head ellipsoid + a surface sampler (theta from +Z toward +X, phi = elevation) */
const HR = { x: 0.092, y: 0.08, z: 0.082 };
function hsurf(th: number, ph: number, off = 0) {
  const cp = Math.cos(ph);
  const sp = Math.sin(ph);
  const st = Math.sin(th);
  const ct = Math.cos(th);
  const n = new THREE.Vector3((cp * st) / HR.x, sp / HR.y, (cp * ct) / HR.z).normalize();
  const p = new THREE.Vector3(HR.x * cp * st, HR.y * sp, HR.z * cp * ct).addScaledVector(n, off);
  return { p, n };
}

export default function build(): THREE.Object3D {
  const rnd = mulberry32(20240611);
  const R = (a: number, b: number) => a + (b - a) * rnd();
  function pick<T>(arr: T[]): T {
    return arr[Math.min(arr.length - 1, Math.floor(rnd() * arr.length))];
  }

  /* ---------------- materials ---------------- */
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  function mat(
    color: string,
    o: { map?: THREE.Texture | null; rough?: number; side?: THREE.Side; emissive?: string } = {}
  ) {
    const key = `${color}|${o.map ? o.map.uuid : ""}|${o.side ?? 0}|${o.emissive ?? ""}|${o.rough ?? ""}`;
    let m = mats.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: o.map ? "#ffffff" : color,
        map: o.map ?? null,
        roughness: o.rough ?? 0.88,
        metalness: 0,
        flatShading: true,
        side: o.side ?? THREE.FrontSide,
        emissive: o.emissive ?? "#000000",
        emissiveIntensity: o.emissive ? 0.5 : 0,
      });
      mats.set(key, m);
    }
    return m;
  }
  const fur = (hex: string, seed: number) => mat(hex, { map: furTexture(hex, seed) });
  const barkTex = barkTexture();
  const ringTex = ringTexture();
  const groundTex = groundTexture();

  const M = {
    rust: fur("#b9441a", 3),
    rustLight: fur("#d25a24", 4),
    black: fur("#241a16", 5),
    white: fur("#f8f1e3", 6),
    cream: fur("#f4e2b4", 7),
    ginger: fur("#d96a23", 8),
    tip: fur("#3b1e15", 9),
    tear: mat("#9b3412", { side: THREE.DoubleSide }),
    nose: mat("#120d0c", { rough: 0.3 }),
    eye: mat("#0b0706", { rough: 0.2 }),
    glint: mat("#ffffff", { rough: 0.3, emissive: "#ffffff" }),
    mouth: mat("#5a1620"),
    tongue: mat("#ec7f8e"),
    blush: mat("#f4a38c"),
    earInner: mat("#3a231b"),
    claw: mat("#efe3c6"),
    tooth: mat("#fffdf5"),
    stalk: mat("#8cc24a"),
    node: mat("#c8dc7a"),
    leafA: mat("#5aa13a", { side: THREE.DoubleSide }),
    leafB: mat("#86bf45", { side: THREE.DoubleSide }),
    cutPale: mat("#e3edaa"),
    cutHole: mat("#6f8f36"),
    bark: mat("#5b4132", { map: barkTex }),
    cutWood: mat("#dcb277", { map: ringTex }),
    groundTop: mat("#4f7f2e", { map: groundTex, rough: 1 }),
    soil: mat("#4a3322", { rough: 1 }),
    moss: [mat("#4f8a2b"), mat("#6fa83a"), mat("#3d6e2b"), mat("#8cbc47")],
    rock: [mat("#8a8681"), mat("#6f6c68"), mat("#9b968d")],
    cap: mat("#d63a2b"),
    stem: mat("#f0e4c8"),
    dot: mat("#fffaf0"),
    shelf: mat("#e68a2e"),
    shelf2: mat("#f2b45a"),
    grass1: mat("#5f9a33"),
    grass2: mat("#7db843"),
    petalPink: mat("#f4a6c0"),
    petalWhite: mat("#fff6e6"),
    petalYellow: mat("#f6d447"),
    flowerC: mat("#f2a81d"),
    twigLeafA: mat("#b5cc3f", { side: THREE.DoubleSide }),
    twigLeafB: mat("#e3a93b", { side: THREE.DoubleSide }),
  };

  /* ---------------- geometry helpers ---------------- */
  const sphCache = new Map<string, THREE.SphereGeometry>();
  const sph = (ws: number, hs: number) => {
    const k = `${ws}x${hs}`;
    let g = sphCache.get(k);
    if (!g) {
      g = new THREE.SphereGeometry(1, ws, hs);
      sphCache.set(k, g);
    }
    return g;
  };
  const ell = (
    parent: THREE.Object3D,
    m: THREE.Material,
    rx: number,
    ry: number,
    rz: number,
    x = 0,
    y = 0,
    z = 0,
    ws = 8,
    hs = 6
  ) => {
    const mesh = new THREE.Mesh(sph(ws, hs), m);
    mesh.scale.set(rx, ry, rz);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const seg = (
    parent: THREE.Object3D,
    m: THREE.Material,
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    sides = 6
  ) => {
    const d = b.clone().sub(a);
    const len = d.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, sides, 1), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(mesh);
    return mesh;
  };
  const cone = (
    parent: THREE.Object3D,
    m: THREE.Material,
    base: THREE.Vector3,
    tip: THREE.Vector3,
    r: number,
    sides = 4
  ) => seg(parent, m, base, tip, r, 0, sides);
  const tuft = (
    parent: THREE.Object3D,
    m: THREE.Material,
    p: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r: number,
    sides = 4
  ) => {
    const d = dir.clone().normalize();
    cone(parent, m, p.clone().addScaledVector(d, -len * 0.25), p.clone().addScaledVector(d, len * 0.75), r, sides);
  };
  const box = (parent: THREE.Object3D, m: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const icoGeo = new THREE.IcosahedronGeometry(1, 1);
  const rockGeo = new THREE.IcosahedronGeometry(1, 0);
  const mossBlob = (
    parent: THREE.Object3D,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    tiltZ = 0,
    spin = 0
  ) => {
    const mesh = new THREE.Mesh(icoGeo, m);
    mesh.scale.set(sx, sy, sz);
    mesh.position.set(x, y, z);
    mesh.rotation.order = "ZYX";
    mesh.rotation.z = tiltZ;
    mesh.rotation.y = spin;
    parent.add(mesh);
    return mesh;
  };
  const addLeaf = (
    parent: THREE.Object3D,
    m: THREE.Material,
    geo: THREE.BufferGeometry,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    roll: number,
    s = 1
  ) => {
    const mesh = new THREE.Mesh(geo, m);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
    const qr = new THREE.Quaternion().setFromAxisAngle(UP, roll);
    mesh.quaternion.copy(q.multiply(qr));
    mesh.position.copy(base);
    mesh.scale.setScalar(s);
    parent.add(mesh);
    return mesh;
  };

  const root = new THREE.Group();
  root.name = "RedPandaOnMossyLog";

  /* =============================================================== */
  /*  DIORAMA: ground, stump, boulders, log                           */
  /* =============================================================== */
  const gj = (a: number) => 1 + 0.06 * Math.sin(3 * a + 0.7) + 0.04 * Math.sin(5 * a + 2.1) + 0.025 * Math.sin(9 * a);
  const GX = 0.72;
  const GZ0 = 0.02;
  const GTOP = 0.07;
  {
    const g = new THREE.CylinderGeometry(0.93, 1.0, GTOP, 20, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const f = gj(Math.atan2(x, z));
      p.setX(i, x * f);
      p.setZ(i, z * f);
    }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, [M.soil, M.groundTop, M.soil]);
    m.position.set(0, GTOP / 2, GZ0);
    m.scale.x = GX;
    root.add(m);
  }

  // log constants
  const LOG_Y = 0.58;
  const LOG_Z0 = -0.84;
  const LOG_Z1 = 0.88;
  const logR = (z: number) => 0.088 - 0.03 * ((z - LOG_Z0) / (LOG_Z1 - LOG_Z0));
  const PANDA_Y = LOG_Y + logR(0);
  const SZ = -0.55; // stump z

  // --- stump
  {
    const g = new THREE.CylinderGeometry(0.15, 0.19, 0.52, 10, 3);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const a = Math.atan2(x, z);
      const f = 1 + 0.05 * Math.sin(3 * a + y * 8) + 0.04 * Math.sin(5 * a + 1.1);
      p.setX(i, x * f);
      p.setZ(i, z * f);
    }
    g.computeVertexNormals();
    const stump = new THREE.Mesh(g, [M.bark, M.cutWood, M.cutWood]);
    stump.position.set(0, 0.26, SZ);
    root.add(stump);

    // roots
    for (let k = 0; k < 6; k++) {
      const a = k * 1.05 + 0.3;
      const base = V(Math.sin(a) * 0.15, 0.2, SZ + Math.cos(a) * 0.15);
      const tip = V(Math.sin(a) * 0.35, 0.0, SZ + Math.cos(a) * 0.35);
      seg(root, M.bark, base, tip, 0.045, 0.012, 5);
    }
    // moss rim on the stump top (skip the part buried under the log)
    for (let k = 0; k < 12; k++) {
      const a = k * 0.53 + 0.2;
      const x = Math.sin(a) * 0.145;
      if (Math.abs(x) < 0.1) continue;
      mossBlob(root, pick(M.moss), x, 0.52, SZ + Math.cos(a) * 0.145, R(0.04, 0.06), R(0.02, 0.03), R(0.04, 0.06), 0, R(0, 3));
    }
    // moss patches on the stump flanks
    for (let k = 0; k < 16; k++) {
      const a = R(0, Math.PI * 2);
      const y = R(0.12, 0.46);
      const rr = (0.19 - 0.04 * (y / 0.52)) * 0.95;
      mossBlob(root, pick(M.moss), Math.sin(a) * rr, y, SZ + Math.cos(a) * rr, R(0.03, 0.06), R(0.025, 0.045), R(0.03, 0.06), 0, a);
    }
    // shelf fungi
    const shelf = (a: number, y: number, s: number, m: THREE.Material) => {
      const r = 0.17 - 0.04 * (y / 0.52);
      const gg = new THREE.CylinderGeometry(0.06 * s, 0.05 * s, 0.016, 8, 1, false, -Math.PI / 2, Math.PI);
      const mesh = new THREE.Mesh(gg, m);
      mesh.position.set(Math.sin(a) * (r - 0.012), y, SZ + Math.cos(a) * (r - 0.012));
      mesh.rotation.y = a;
      root.add(mesh);
    };
    shelf(0.75, 0.3, 1.0, M.shelf);
    shelf(0.85, 0.345, 0.75, M.shelf2);
    shelf(-0.7, 0.2, 0.8, M.shelf);
  }

  // --- boulders supporting the log's front end
  const placeRock = (
    m: THREE.Material,
    sx: number,
    sy: number,
    sz: number,
    x: number,
    z: number,
    rx: number,
    ry: number,
    rz: number
  ) => {
    const mesh = new THREE.Mesh(rockGeo, m);
    mesh.scale.set(sx, sy, sz);
    mesh.rotation.set(rx, ry, rz);
    mesh.position.set(x, 0.2, z);
    root.add(mesh);
    mesh.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(mesh, true);
    mesh.position.y -= b.min.y;
    mesh.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(mesh, true);
  };
  {
    const b1 = placeRock(M.rock[0], 0.27, 0.315, 0.22, 0.0, 0.64, 0, Math.PI / 2, 0);
    // moss cushion where log meets rock
    mossBlob(root, M.moss[0], 0, b1.max.y - 0.012, 0.64, 0.17, 0.04, 0.15, 0, 0.4);
    mossBlob(root, M.moss[1], -0.09, b1.max.y - 0.07, 0.6, 0.07, 0.035, 0.06, 0.4, 1.1);
    mossBlob(root, M.moss[3], 0.08, b1.max.y - 0.09, 0.7, 0.06, 0.03, 0.05, -0.4, 2.0);
    placeRock(M.rock[1], 0.12, 0.09, 0.1, -0.3, 0.55, 0.2, 0.8, 0.1);
    placeRock(M.rock[2], 0.1, 0.08, 0.09, 0.3, 0.76, -0.2, 0.3, 0.15);
    placeRock(M.rock[0], 0.08, 0.06, 0.07, -0.08, 0.88, 0.1, 1.2, 0.0);
    const b4 = placeRock(M.rock[1], 0.09, 0.07, 0.08, 0.32, -0.45, 0.1, 0.5, 0.2);
    mossBlob(root, M.moss[2], 0.32, b4.max.y - 0.01, -0.45, 0.06, 0.02, 0.055, 0, 0.8);
  }

  // --- the log itself
  {
    const g = new THREE.CylinderGeometry(logR(LOG_Z1), logR(LOG_Z0), LOG_Z1 - LOG_Z0, 9, 10);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const a = Math.atan2(x, z);
      const f = 1 + 0.05 * Math.sin(3 * a + y * 6) + 0.04 * Math.sin(2 * a - y * 10 + 1.3);
      p.setX(i, x * f);
      p.setZ(i, z * f);
    }
    g.rotateX(Math.PI / 2);
    g.computeVertexNormals();
    const log = new THREE.Mesh(g, [M.bark, M.cutWood, M.cutWood]);
    log.position.set(0, LOG_Y, (LOG_Z0 + LOG_Z1) / 2);
    root.add(log);

    // moss on top and sides
    for (let i = 0; i < 52; i++) {
      const z = R(LOG_Z0 + 0.05, LOG_Z1 - 0.05);
      const a = (rnd() + rnd() - 1) * 1.7;
      if (z > -0.3 && z < 0.34 && Math.abs(a) < 0.62) continue;
      const r = logR(z) * 0.96;
      mossBlob(
        root,
        pick(M.moss),
        Math.sin(a) * r,
        LOG_Y + Math.cos(a) * r,
        z,
        R(0.02, 0.05),
        R(0.012, 0.022),
        R(0.03, 0.07),
        -a,
        R(-0.4, 0.4)
      );
    }
    // a few small patches near the paws (kept low)
    for (const [z, a] of [[-0.28, 0.9], [0.3, -0.85], [-0.05, 1.0], [0.1, -1.0]] as [number, number][]) {
      const r = logR(z) * 0.96;
      mossBlob(root, pick(M.moss), Math.sin(a) * r, LOG_Y + Math.cos(a) * r, z, 0.022, 0.012, 0.04, -a, 0.3);
    }
    // hanging moss strands
    for (let i = 0; i < 12; i++) {
      const z = R(LOG_Z0 + 0.1, LOG_Z1 - 0.08);
      const a = (rnd() < 0.5 ? -1 : 1) * R(1.8, 2.7);
      const r = logR(z) * 0.95;
      const b = V(Math.sin(a) * r, LOG_Y + Math.cos(a) * r, z);
      cone(root, pick(M.moss), b, b.clone().add(V(R(-0.01, 0.01), -R(0.04, 0.085), R(-0.01, 0.01))), R(0.01, 0.016), 4);
    }
    // stubs of broken twigs (-X side)
    const stub = (z: number, up: number, out: number, len: number) => {
      const r = logR(z);
      const b = V(-r * 0.7, LOG_Y + r * 0.5, z);
      const t = b.clone().add(V(-out, up, 0).normalize().multiplyScalar(len));
      seg(root, M.bark, b, t, 0.022, 0.014, 6);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.014, 6), M.cutWood);
      disc.quaternion.setFromUnitVectors(FWD, t.clone().sub(b).normalize());
      disc.position.copy(t).addScaledVector(t.clone().sub(b).normalize(), 0.001);
      root.add(disc);
    };
    stub(-0.36, 0.7, 1.0, 0.12);
    stub(0.1, 0.5, 1.0, 0.09);

    // leafy twig near the front, off to the -X side so it frames the face
    const twigBase = V(-0.045, LOG_Y + 0.05, 0.56);
    const twigMid = V(-0.12, LOG_Y + 0.15, 0.62);
    const twigTop = V(-0.19, LOG_Y + 0.25, 0.66);
    seg(root, M.bark, twigBase, twigMid, 0.014, 0.009, 5);
    seg(root, M.bark, twigMid, twigTop, 0.009, 0.005, 5);
    const sub = V(-0.22, LOG_Y + 0.17, 0.7);
    seg(root, M.bark, twigMid, sub, 0.007, 0.004, 5);
    const oak = leafGeo(0.07, 0.03);
    const leafSpots: [THREE.Vector3, THREE.Vector3][] = [
      [twigTop, V(-0.3, 0.9, 0.2)],
      [twigTop, V(-0.8, 0.4, 0.3)],
      [twigTop, V(0.2, 0.5, 0.8)],
      [sub, V(-0.8, 0.1, 0.6)],
      [sub, V(-0.2, 0.3, 0.9)],
      [twigMid, V(0.5, 0.5, 0.8)],
      [twigMid, V(-0.9, 0.0, 0.2)],
      [twigBase.clone().lerp(twigMid, 0.5), V(0.8, 0.3, 0.4)],
    ];
    leafSpots.forEach(([b, d], i) => addLeaf(root, i % 3 === 2 ? M.twigLeafB : M.twigLeafA, oak, b, d, R(0, 3), R(0.85, 1.2)));
  }

  /* ---------- ground dressing: grass, flowers, mushrooms ---------- */
  const grassCluster = (x: number, z: number, s: number) => {
    for (let k = 0; k < 3; k++) {
      const a = R(0, Math.PI * 2);
      const lean = R(0.01, 0.04) * s;
      const base = V(x + R(-0.012, 0.012), GTOP - 0.005, z + R(-0.012, 0.012));
      const tip = base.clone().add(V(Math.cos(a) * lean, R(0.06, 0.12) * s, Math.sin(a) * lean));
      cone(root, pick([M.grass1, M.grass2]), base, tip, 0.011 * s, 3);
    }
  };
  for (let k = 0; k < 26; k++) {
    const a = (k / 26) * Math.PI * 2 + R(-0.1, 0.1);
    const rr = R(0.9, 0.99);
    grassCluster(GX * 0.93 * gj(a) * Math.sin(a) * rr, GZ0 + 0.93 * gj(a) * Math.cos(a) * rr, R(0.8, 1.3));
  }
  for (let k = 0, n = 0; k < 120 && n < 22; k++) {
    const x = R(-0.6, 0.6);
    const z = R(-0.85, 0.9);
    if ((x / 0.62) ** 2 + ((z - GZ0) / 0.9) ** 2 > 0.8) continue;
    if (Math.hypot(x, z - 0.65) < 0.38) continue;
    if (Math.hypot(x, z + 0.55) < 0.36) continue;
    grassCluster(x, z, R(0.8, 1.2));
    n++;
  }
  const flower = (x: number, z: number, h: number, petal: THREE.Material) => {
    const base = V(x, GTOP - 0.005, z);
    const top = V(x + R(-0.01, 0.01), GTOP + h, z + R(-0.01, 0.01));
    seg(root, M.grass1, base, top, 0.0028, 0.0022, 3);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ell(root, petal, 0.008, 0.004, 0.008, top.x + Math.cos(a) * 0.01, top.y, top.z + Math.sin(a) * 0.01, 5, 3);
    }
    ell(root, M.flowerC, 0.0065, 0.0065, 0.0065, top.x, top.y + 0.002, top.z, 5, 4);
  };
  flower(0.4, 0.3, 0.09, M.petalPink);
  flower(-0.42, 0.15, 0.11, M.petalWhite);
  flower(0.45, -0.2, 0.08, M.petalYellow);
  flower(-0.36, -0.55, 0.1, M.petalPink);
  flower(0.22, 0.95 - 0.1, 0.08, M.petalYellow);
  flower(-0.5, 0.6, 0.09, M.petalWhite);

  const capGeo = new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const gillGeo = new THREE.CircleGeometry(1, 8);
  gillGeo.rotateX(Math.PI / 2);
  const mushroom = (x: number, z: number, s: number, tilt = 0) => {
    const g = new THREE.Group();
    g.position.set(x, GTOP - 0.005, z);
    g.rotation.z = tilt;
    root.add(g);
    seg(g, M.stem, V(0, 0, 0), V(0, 0.05 * s, 0), 0.012 * s, 0.009 * s, 6);
    const cap = new THREE.Mesh(capGeo, M.cap);
    cap.scale.set(0.042 * s, 0.032 * s, 0.042 * s);
    cap.position.y = 0.048 * s;
    g.add(cap);
    const gill = new THREE.Mesh(gillGeo, M.stem);
    gill.scale.setScalar(0.042 * s);
    gill.position.y = 0.048 * s;
    g.add(gill);
    for (let k = 0; k < 6; k++) {
      const th = R(0.25, 1.0);
      const ph = (k / 6) * Math.PI * 2 + R(-0.3, 0.3);
      ell(
        g,
        M.dot,
        0.007 * s,
        0.005 * s,
        0.007 * s,
        Math.sin(th) * Math.cos(ph) * 0.042 * s,
        0.048 * s + Math.cos(th) * 0.032 * s,
        Math.sin(th) * Math.sin(ph) * 0.042 * s,
        5,
        3
      );
    }
  };
  mushroom(0.26, 0.5, 1.2, 0.08);
  mushroom(0.36, 0.4, 0.8, -0.12);
  mushroom(-0.28, -0.72, 1.0, 0.1);

  /* =============================================================== */
  /*  THE RED PANDA  (local frame: y = 0 is the top of the log)       */
  /* =============================================================== */
  const panda = new THREE.Group();
  panda.position.set(0, PANDA_Y, 0);
  root.add(panda);

  // ---- torso
  const capsule = (r: number, len: number, mt: THREE.Material, sx: number, sy: number, y: number, z: number) => {
    const g = new THREE.CapsuleGeometry(r, len, 3, 10);
    g.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(g, mt);
    m.scale.set(sx, sy, 1);
    m.position.set(0, y, z);
    panda.add(m);
    return m;
  };
  capsule(0.085, 0.27, M.rust, 1.05, 0.95, 0.19, -0.02);
  capsule(0.08, 0.26, M.black, 1.04, 0.85, 0.15, -0.015);
  ell(panda, M.rust, 0.096, 0.086, 0.09, 0, 0.185, -0.15, 10, 8); // rump
  ell(panda, M.rustLight, 0.055, 0.02, 0.16, 0, 0.262, -0.03, 8, 5); // paler saddle stripe
  ell(panda, M.rust, 0.075, 0.07, 0.065, 0, 0.222, 0.235, 8, 6); // neck
  ell(panda, M.black, 0.062, 0.05, 0.05, 0, 0.168, 0.215, 8, 5); // dark chest under the chin

  // body fur tufts
  {
    const C = V(0, 0.19, -0.02);
    const Rr = V(0.089, 0.081, 0.2);
    for (let i = 0; i < 30; i++) {
      const t = R(-0.8, 0.78);
      const a = R(-1.3, 1.3);
      const s = Math.sqrt(1 - t * t);
      const d = V(s * Math.sin(a), s * Math.cos(a), t);
      const p = V(C.x + Rr.x * d.x, C.y + Rr.y * d.y, C.z + Rr.z * d.z);
      const n = V(d.x / Rr.x, d.y / Rr.y, d.z / Rr.z).normalize();
      tuft(panda, rnd() < 0.5 ? M.rust : M.rustLight, p, n.add(V(0, 0.1, -0.8)), R(0.03, 0.045), R(0.011, 0.016));
    }
    const C2 = V(0, 0.15, -0.015);
    const R2 = V(0.083, 0.068, 0.19);
    for (let i = 0; i < 22; i++) {
      const t = R(-0.8, 0.7);
      const a = (rnd() < 0.5 ? -1 : 1) * R(1.55, 2.6);
      const s = Math.sqrt(1 - t * t);
      const d = V(s * Math.sin(a), s * Math.cos(a), t);
      const p = V(C2.x + R2.x * d.x, C2.y + R2.y * d.y, C2.z + R2.z * d.z);
      const n = V(d.x / R2.x, d.y / R2.y, d.z / R2.z).normalize();
      tuft(panda, M.black, p, n.add(V(0, 0, -0.6)), R(0.028, 0.04), R(0.011, 0.015));
    }
  }

  // ---- legs
  const joint = (p: THREE.Vector3, r: number) => ell(panda, M.black, r, r, r, p.x, p.y, p.z, 6, 4);
  const limb = (pts: THREE.Vector3[], radii: number[]) => {
    for (let i = 0; i < pts.length - 1; i++) seg(panda, M.black, pts[i], pts[i + 1], radii[i], radii[i + 1], 6);
    for (let i = 1; i < pts.length - 1; i++) joint(pts[i], radii[i] * 1.05);
  };
  const planted = (x: number, z: number, len: number, w: number) => {
    ell(panda, M.black, w, 0.02, len, x, -0.002, z, 8, 5);
    for (const dx of [-0.0165, 0, 0.0165]) {
      const ty = -0.003 - Math.abs(dx) * 0.15;
      ell(panda, M.black, 0.0105, 0.0095, 0.012, x + dx, ty, z + len * 0.92, 6, 4);
      cone(panda, M.claw, V(x + dx, ty - 0.004, z + len * 0.92 + 0.008), V(x + dx, ty - 0.012, z + len * 0.92 + 0.024), 0.0042, 4);
    }
  };

  // planted front paw (panda's right, -X)
  limb([V(-0.075, 0.155, 0.14), V(-0.07, 0.085, 0.19), V(-0.05, 0.02, 0.235)], [0.034, 0.03, 0.026]);
  planted(-0.05, 0.252, 0.04, 0.031);
  // raised front arm (panda's left, +X), holding the bamboo
  limb([V(0.078, 0.155, 0.14), V(0.115, 0.095, 0.235), V(0.107, 0.172, 0.375)], [0.034, 0.03, 0.027]);
  const FP = V(0.107, 0.19, 0.39);
  ell(panda, M.black, 0.031, 0.033, 0.029, FP.x, FP.y, FP.z - 0.002, 8, 6);
  for (const dy of [-0.02, 0, 0.02]) ell(panda, M.black, 0.0125, 0.011, 0.011, FP.x + 0.002, FP.y + dy, FP.z + 0.025, 6, 4);
  ell(panda, M.black, 0.011, 0.014, 0.012, FP.x - 0.02, FP.y + 0.006, FP.z + 0.012, 6, 4); // thumb
  // hind legs
  for (const s of [-1, 1]) {
    ell(panda, M.rust, 0.045, 0.07, 0.085, s * 0.085, 0.125, -0.135, 8, 6); // thigh
    limb([V(s * 0.082, 0.14, -0.15), V(s * 0.088, 0.09, -0.095), V(s * 0.062, 0.04, -0.18)], [0.036, 0.03, 0.024]);
    planted(s * 0.05, -0.12, 0.06, 0.03);
  }

  // ---- tail
  const tail = new THREE.Group();
  panda.add(tail);
  {
    const curve = new THREE.CatmullRomCurve3(
      [
        V(0, 0.17, -0.2),
        V(0, 0.185, -0.31),
        V(0.03, 0.19, -0.41),
        V(0.08, 0.21, -0.5),
        V(0.14, 0.25, -0.56),
        V(0.18, 0.31, -0.6),
        V(0.19, 0.38, -0.61),
      ],
      false,
      "catmullrom",
      0.5
    );
    const N = 12;
    for (let i = 0; i < N; i++) {
      const u = 0.035 + 0.93 * (i / (N - 1));
      const c = curve.getPointAt(u);
      const T = curve.getTangentAt(u).normalize();
      const last = i === N - 1;
      let r = 0.044 + 0.037 * Math.sin(Math.PI * Math.pow(u, 0.8));
      if (last) r *= 0.82;
      const m = i === 0 ? M.rust : last ? M.tip : i % 2 === 1 ? M.cream : M.ginger;
      const b = ell(tail, m, r, r, 0.035, c.x, c.y, c.z, 8, 6);
      b.quaternion.setFromUnitVectors(FWD, T);

      const b1 = new THREE.Vector3().crossVectors(T, UP);
      if (b1.length() < 0.25) b1.crossVectors(T, FWD);
      b1.normalize();
      const b2 = new THREE.Vector3().crossVectors(T, b1).normalize();
      if (i > 0) {
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2 + i * 0.7;
          const radial = b1.clone().multiplyScalar(Math.cos(a)).addScaledVector(b2, Math.sin(a));
          const p = c.clone().addScaledVector(radial, r * 0.9).addScaledVector(T, R(-0.02, 0.02));
          tuft(tail, m, p, radial.clone().multiplyScalar(0.9).addScaledVector(T, 0.7), 0.034, 0.014);
        }
      }
      if (last) {
        cone(tail, M.tip, c, c.clone().addScaledVector(T, 0.075), r * 0.95, 6);
      }
    }
  }

  // ---- head
  const head = new THREE.Group();
  head.position.set(0, 0.255, 0.3);
  head.rotation.set(-0.12, 0.2, -0.05);
  panda.add(head);
  {
    // skull + rusty crown cap
    ell(head, M.white, HR.x, HR.y, HR.z, 0, 0, 0, 12, 9);
    const capG = new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, 1.18);
    capG.rotateX(-0.22);
    const crown = new THREE.Mesh(capG, M.rust);
    crown.scale.set(HR.x * 1.05, HR.y * 1.05, HR.z * 1.05);
    head.add(crown);
    // fringe tufts around the crown edge
    for (const sgn of [-1, 1]) {
      for (const th of [0.95, 1.35, 1.8, 2.25, 2.7]) {
        const { p, n } = hsurf(sgn * th, 0.3 + 0.06 * Math.sin(th * 2), -0.004);
        tuft(head, M.rust, p, n.clone().add(V(0, -0.35, -0.25)), 0.032, 0.014);
      }
    }
    {
      const { p, n } = hsurf(Math.PI, 0.25, -0.004);
      tuft(head, M.rust, p, n.clone().add(V(0, -0.35, -0.25)), 0.034, 0.015);
    }

    // muzzle, nose, mouth
    ell(head, M.white, 0.034, 0.027, 0.038, 0, -0.022, 0.074, 8, 6);
    const nose = ell(head, M.nose, 0.0175, 0.012, 0.0125, 0, -0.006, 0.108, 6, 4);
    nose.rotation.x = 0.25;
    ell(head, M.glint, 0.0035, 0.0025, 0.0025, 0.005, -0.001, 0.119, 4, 3);
    box(head, M.nose, 0.0025, 0.016, 0.0025, 0, -0.03, 0.108); // philtrum

    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-0.026, 0);
    mouthShape.lineTo(0.026, 0);
    mouthShape.quadraticCurveTo(0.034, -0.036, 0, -0.033);
    mouthShape.quadraticCurveTo(-0.034, -0.036, -0.026, 0);
    const mouth = new THREE.Mesh(
      new THREE.ExtrudeGeometry(mouthShape, { depth: 0.018, bevelEnabled: false, curveSegments: 4 }),
      M.mouth
    );
    mouth.position.set(0, -0.046, 0.068);
    head.add(mouth);
    ell(head, M.tongue, 0.016, 0.008, 0.01, 0, -0.068, 0.083, 6, 4);
    ell(head, M.white, 0.026, 0.013, 0.024, 0, -0.086, 0.066, 8, 5); // chin
    for (const s of [-1, 1]) box(head, M.tooth, 0.009, 0.009, 0.004, s * 0.0065, -0.0505, 0.088);
    // smile creases
    for (const s of [-1, 1]) {
      const arc = Math.PI * 0.8;
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.0017, 4, 6, arc), M.nose);
      t.position.set(s * 0.029, -0.046, 0.08);
      t.rotation.z = s > 0 ? -arc / 2 : Math.PI - arc / 2;
      head.add(t);
    }
    // whiskers
    for (const s of [-1, 1]) {
      const dirs = [V(s, 0.2, 0.25), V(s, -0.02, 0.15), V(s, -0.25, 0.05)];
      for (const d of dirs) {
        const a = V(s * 0.03, -0.03, 0.095);
        seg(head, M.tooth, a, a.clone().add(d.normalize().multiplyScalar(0.065)), 0.0011, 0.0006, 3);
      }
    }

    // eyes (big, shiny, delighted) and red tear marks
    for (const s of [-1, 1]) {
      const { p, n } = hsurf(s * 0.62, 0.28, 0);
      const eye = ell(head, M.eye, 0.0175, 0.021, 0.011, p.x, p.y, p.z, 8, 6);
      eye.quaternion.setFromUnitVectors(FWD, n);
      ell(
        head,
        M.glint,
        0.0058,
        0.0058,
        0.0058,
        p.x - s * 0.005 + n.x * 0.0105,
        p.y + 0.0075 + n.y * 0.0105,
        p.z + n.z * 0.0105,
        6,
        4
      );
      ell(
        head,
        M.glint,
        0.0028,
        0.0028,
        0.0028,
        p.x + s * 0.006 + n.x * 0.0105,
        p.y - 0.008 + n.y * 0.0105,
        p.z + n.z * 0.0105,
        5,
        3
      );

      const path: [number, number, number][] = [
        [0.62, 0.17, 0.014],
        [0.56, -0.05, 0.014],
        [0.52, -0.25, 0.012],
        [0.52, -0.45, 0.009],
        [0.55, -0.6, 0.004],
      ];
      const pts: THREE.Vector3[] = [];
      const ns: THREE.Vector3[] = [];
      const ws: number[] = [];
      for (const [th, ph, w] of path) {
        const q = hsurf(s * th, ph, 0.005);
        pts.push(q.p);
        ns.push(q.n);
        ws.push(w);
      }
      head.add(new THREE.Mesh(ribbonGeo(pts, ns, ws), M.tear));

      // blush
      const bl = hsurf(s * 0.98, -0.12, 0.004);
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.014, 8), M.blush);
      blush.quaternion.setFromUnitVectors(FWD, bl.n);
      blush.position.copy(bl.p);
      head.add(blush);

      // fluffy white cheek ruff
      const tl: [number, number, number][] = [
        [1.2, -0.3, 0.045],
        [1.32, -0.12, 0.05],
        [1.42, 0.05, 0.045],
        [1.1, -0.5, 0.04],
        [0.95, -0.62, 0.035],
        [1.55, -0.25, 0.04],
        [1.62, 0.0, 0.035],
      ];
      for (const [th, ph, len] of tl) {
        const q = hsurf(s * th, ph, -0.008);
        tuft(head, M.white, q.p, q.n.clone().add(V(0, -0.15, -0.5)), len, 0.016);
      }

      // pointed white-rimmed ears
      const earTri = (w: number, h: number, depth: number, m: THREE.Material, yOff: number, z0: number, parent: THREE.Object3D) => {
        const sh = new THREE.Shape();
        sh.moveTo(-w / 2, 0);
        sh.quadraticCurveTo(-w * 0.55, h * 0.62, 0, h);
        sh.quadraticCurveTo(w * 0.55, h * 0.62, w / 2, 0);
        sh.quadraticCurveTo(0, -h * 0.1, -w / 2, 0);
        const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 3 }), m);
        mesh.position.set(0, yOff, z0);
        parent.add(mesh);
      };
      const ear = new THREE.Group();
      const ep = hsurf(s * 1.3, 0.72, -0.012);
      ear.position.copy(ep.p);
      ear.rotation.set(0.1, s * 0.35, -s * 0.5);
      earTri(0.08, 0.085, 0.014, M.white, 0, -0.007, ear);
      earTri(0.056, 0.06, 0.008, M.rust, 0.004, -0.0135, ear);
      earTri(0.05, 0.055, 0.005, M.earInner, 0.004, 0.0065, ear);
      for (const dx of [-0.013, 0, 0.013]) {
        cone(ear, M.white, V(dx, 0.008, 0.008), V(dx * 1.4, 0.034 - Math.abs(dx) * 0.8, 0.02), 0.006, 3);
      }
      head.add(ear);
    }
  }

  // ---- bamboo stalk with leaves
  {
    const bam = new THREE.Group();
    panda.add(bam);
    const B = V(0.142, 0.05, 0.395);
    const T = V(0.072, 0.36, 0.405);
    const ax = T.clone().sub(B);
    const axN = ax.clone().normalize();
    const at = (t: number) => B.clone().addScaledVector(ax, t);
    const rAt = (t: number) => 0.0125 - 0.0035 * t;
    const cuts = [0, 0.34, 0.68, 1.0];
    for (let i = 0; i < 3; i++) seg(bam, M.stalk, at(cuts[i]), at(cuts[i + 1]), rAt(cuts[i]), rAt(cuts[i + 1]), 7);
    for (const t of [0.34, 0.68, 1.0]) {
      seg(bam, M.node, at(t - 0.012), at(Math.min(1, t + 0.008)), rAt(t) + 0.0022, rAt(t) + 0.0022, 7);
    }
    seg(bam, M.node, at(0), at(0.02), rAt(0) + 0.0022, rAt(0) + 0.0022, 7);
    cone(bam, M.stalk, at(1), at(1).addScaledVector(axN, 0.02), 0.0085, 6);
    // freshly cut bottom end
    const pale = new THREE.Mesh(new THREE.CircleGeometry(0.0125, 7), M.cutPale);
    pale.quaternion.setFromUnitVectors(FWD, axN.clone().negate());
    pale.position.copy(B).addScaledVector(axN, -0.0006);
    bam.add(pale);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.0065, 7), M.cutHole);
    hole.quaternion.copy(pale.quaternion);
    hole.position.copy(B).addScaledVector(axN, -0.0012);
    bam.add(hole);

    const lg = leafGeo(0.11, 0.011);
    const leaves: [number, THREE.Vector3, number][] = [
      [0.35, V(0.9, 0.3, 0.4), 0.9],
      [0.55, V(0.8, -0.15, 0.5), 1.0],
      [0.62, V(0.2, 0.2, 0.95), 1.0],
      [0.78, V(0.9, 0.35, 0.2), 1.05],
      [0.78, V(0.35, 0.1, 0.95), 1.0],
      [0.78, V(-0.53, -0.85, 0.0), 0.95], // droops toward the nibbling mouth
      [1.0, V(0.3, 1.0, 0.2), 1.1],
      [1.0, V(0.9, 0.6, 0.3), 1.05],
      [1.0, V(0.2, 0.5, 0.9), 1.0],
      [1.0, V(-0.2, 0.8, 0.6), 0.95],
      [0.9, V(-0.5, 0.7, 0.2), 0.9],
    ];
    leaves.forEach(([t, d, s], i) => {
      const base = at(t);
      const dn = d.clone().normalize();
      cone(bam, M.stalk, base, base.clone().addScaledVector(dn, 0.02), 0.0035, 4);
      addLeaf(bam, i % 2 ? M.leafB : M.leafA, lg, base.clone().addScaledVector(dn, 0.018), dn, R(0, 3), s);
    });
  }

  /* ---------- shadows flag ---------- */
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return root;
}
