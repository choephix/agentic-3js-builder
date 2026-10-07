```ts
import * as THREE from "three";

export const meta = {
  name: "Forest Spirit",
  description:
    "A lean woodland guardian: bark body with a glowing heart, pale wooden mask with mint eyes, antler-twig crown, moss and leaves, a mushroom on the hip, a leaf vine sash, and a firefly orb cradled in one hand.",
};

type V3 = [number, number, number];
const TAU = Math.PI * 2;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Seeded generator so every run builds the same spirit.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Procedural bark streaks drawn to a canvas (falls back to plain colour if no canvas).
function makeBarkTexture(rng: () => number): THREE.Texture | undefined {
  if (typeof document === "undefined") return undefined;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) return undefined;

  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, size, size);

  for (let i = 0; i < 360; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const len = 14 + rng() * 60;
    g.strokeStyle =
      rng() < 0.65
        ? `rgba(35,20,8,${(0.16 + rng() * 0.3).toFixed(3)})`
        : `rgba(255,236,200,${(0.1 + rng() * 0.18).toFixed(3)})`;
    g.lineWidth = 0.8 + rng() * 2.2;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + (rng() - 0.5) * 8, y + len * 0.5, x + (rng() - 0.5) * 5, y + len);
    g.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rx = 4 + rng() * 5;
    const ry = rx * (1.5 + rng() * 0.8);
    g.fillStyle = "rgba(28,16,6,0.38)";
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, TAU);
    g.fill();
    g.strokeStyle = "rgba(28,16,6,0.45)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.ellipse(x, y, rx * 1.5, ry * 1.5, 0, 0, TAU);
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Torso silhouette as [radius, height] pairs, bottom to top.
const BODY: [number, number][] = [
  [0.16, 0.9],
  [0.19, 0.98],
  [0.17, 1.12],
  [0.14, 1.28],
  [0.18, 1.42],
  [0.23, 1.6],
  [0.22, 1.72],
  [0.12, 1.8],
];

function radiusAt(y: number): number {
  for (let i = 0; i < BODY.length - 1; i++) {
    const [r0, y0] = BODY[i];
    const [r1, y1] = BODY[i + 1];
    if (y1 > y0 && y >= y0 && y <= y1) {
      return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0);
    }
  }
  return BODY[BODY.length - 1][0];
}

export default function createForestSpirit(): THREE.Object3D {
  const rng = mulberry32(90210);
  const rand = (a: number, b: number) => a + (b - a) * rng();

  // ---------- materials (one per colour, shared) ----------
  const barkTex = makeBarkTexture(rng);
  const mat = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...o });

  const M = {
    bark: mat(0x8a6544, { map: barkTex, roughness: 0.95 }),
    barkDark: mat(0x3b2a1d, { roughness: 0.95 }),
    pale: mat(0xdcd0b0, { roughness: 0.7 }),
    moss: mat(0x4f8a3a),
    leaf: mat(0x66a343),
    leafLight: mat(0x9fd45e),
    leafDeep: mat(0x2c5e2e),
    soil: mat(0x4a3523, { roughness: 1 }),
    cap: mat(0xe0743a, { roughness: 0.6 }),
    cream: mat(0xf2e9d0, { roughness: 0.6 }),
    vine: mat(0x3f7f3a),
    glow: mat(0x7dffc8, { emissive: 0x3dffb0, emissiveIntensity: 2.2, roughness: 0.4 }),
    orb: mat(0xffd76a, { emissive: 0xffc54a, emissiveIntensity: 2.6, roughness: 0.3 }),
    firefly: mat(0xeaff8a, { emissive: 0xc8ff4a, emissiveIntensity: 3, roughness: 0.4 }),
  };

  const root = new THREE.Group();
  root.name = "forest-spirit";

  // ---------- helpers ----------
  const put = (
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: V3,
    s: V3 = [1, 1, 1],
    r: V3 = [0, 0, 0],
  ) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    mesh.rotation.set(r[0], r[1], r[2]);
    root.add(mesh);
    return mesh;
  };

  // Cylinder from a to b, radius ra at a and rb at b.
  const limb = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    m: THREE.Material,
    seg = 6,
  ) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    root.add(mesh);
    return mesh;
  };

  // Point on the torso surface at angle phi (0 = front) and height y.
  const onTorso = (phi: number, y: number, lift: number): V3 => {
    const R = radiusAt(y) + lift;
    return [Math.sin(phi) * R, y, Math.cos(phi) * R];
  };

  const leafTuft = (p: THREE.Vector3, size: number) => {
    const m = rng() < 0.5 ? M.leaf : rng() < 0.5 ? M.leafLight : M.leafDeep;
    put(new THREE.IcosahedronGeometry(size, 0), m, [p.x, p.y, p.z], [1, 0.7, 1], [
      rand(0, TAU),
      rand(0, TAU),
      rand(0, TAU),
    ]);
  };

  const mushroom = (x: number, y: number, z: number, s: number) => {
    const stemH = 0.08 * s;
    limb(V(x, y, z), V(x, y + stemH, z), 0.016 * s, 0.013 * s, M.cream, 6);
    const cy = y + stemH;
    put(new THREE.SphereGeometry(0.06 * s, 7, 3, 0, TAU, 0, Math.PI / 2), M.cap, [x, cy, z]);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + rand(0, 0.6);
      put(new THREE.IcosahedronGeometry(0.014 * s, 0), M.cream, [
        x + Math.cos(a) * 0.045 * s,
        cy + 0.04 * s,
        z + Math.sin(a) * 0.045 * s,
      ]);
    }
  };

  // Recursive twig/antler branching.
  const grow = (a: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) => {
    const b = a.clone().addScaledVector(dir, len);
    limb(a, b, r, r * 0.7, M.barkDark, 5);
    if (depth <= 1) leafTuft(b, depth === 0 ? 0.05 : 0.04);
    if (depth === 0) return;

    const axis = new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1))
      .cross(dir)
      .normalize();
    const spread = rand(0.5, 0.8);
    for (const sign of [1, -1]) {
      const nd = dir.clone().applyAxisAngle(axis, sign * spread);
      nd.y += 0.12;
      nd.normalize();
      grow(b, nd, len * rand(0.66, 0.76), r * 0.7, depth - 1);
    }
  };

  // Arm: shoulder S, elbow E, wrist W. Returns the orb centre if holding one.
  const arm = (s: number, S: V3, E: V3, W: V3, holdOrb: boolean): THREE.Vector3 => {
    const sv = V(S[0], S[1], S[2]);
    const ev = V(E[0], E[1], E[2]);
    const wv = V(W[0], W[1], W[2]);

    put(
      new THREE.DodecahedronGeometry(0.095, 0),
      M.moss,
      [S[0] + s * 0.01, S[1] + 0.03, S[2]],
      [1, 0.6, 1],
      [0, rand(0, TAU), 0],
    );
    leafTuft(V(S[0] + s * 0.07, S[1] + 0.1, S[2] - 0.02), 0.045);

    limb(sv, ev, 0.068, 0.05, M.bark, 6);
    put(new THREE.IcosahedronGeometry(0.055, 0), M.barkDark, E);
    limb(ev, wv, 0.05, 0.04, M.bark, 6);

    const P = wv.clone().add(V(0, -0.02, 0.05));
    put(new THREE.DodecahedronGeometry(0.05, 0), M.barkDark, [P.x, P.y, P.z], [1, 0.55, 1.2]);

    const orbC = P.clone().add(V(0, 0.07, 0.1));
    for (let k = 0; k < 4; k++) {
      const off = (k - 1.5) * 0.022;
      const B = P.clone().add(V(off, 0, 0.02));
      const T = holdOrb
        ? B.clone().lerp(orbC.clone().add(V(off * 0.8, -0.04, -0.02)), 0.8)
        : B.clone().add(V(off * 0.9, -0.03, 0.09));
      limb(B, T, 0.016, 0.009, M.barkDark, 4);
    }
    const TB = P.clone().add(V(s * 0.04, 0, 0));
    limb(TB, TB.clone().add(V(s * 0.05, -0.02, 0.05)), 0.018, 0.01, M.barkDark, 4);

    return orbC;
  };

  // ---------- mossy mound the spirit rises from ----------
  put(new THREE.CylinderGeometry(0.44, 0.5, 0.1, 9), M.soil, [0, 0.05, 0]);
  for (let i = 0; i < 16; i++) {
    const a = rand(0, TAU);
    const d = Math.sqrt(rng()) * 0.36;
    put(
      new THREE.DodecahedronGeometry(rand(0.05, 0.1), 0),
      rng() < 0.6 ? M.moss : M.leafDeep,
      [Math.cos(a) * d, 0.1, Math.sin(a) * d],
      [1, 0.45, 1],
      [0, rand(0, TAU), 0],
    );
  }
  mushroom(0.34, 0.1, 0.18, 0.9);
  mushroom(0.3, 0.1, 0.3, 0.6);

  // ---------- legs: knobbly roots ----------
  for (const s of [1, -1]) {
    const H = V(0.13 * s, 0.95, 0);
    const K = V(0.17 * s, 0.52, 0.03);
    const A = V(0.2 * s, 0.15, 0.03);
    limb(H, K, 0.1, 0.08, M.bark, 6);
    limb(K, A, 0.08, 0.06, M.bark, 6);
    put(new THREE.DodecahedronGeometry(0.07, 0), M.barkDark, [K.x + 0.01 * s, K.y, K.z + 0.03], [1, 0.8, 0.9]);
    put(
      new THREE.DodecahedronGeometry(0.11, 0),
      M.barkDark,
      [A.x, 0.12, A.z + 0.07],
      [0.95, 0.42, 1.55],
      [0, s * 0.1, 0],
    );
    for (const k of [-1, 0, 1]) {
      limb(
        V(A.x + k * 0.05, 0.1, A.z + 0.12),
        V(A.x + k * 0.1, 0.085, A.z + 0.22),
        0.028,
        0.012,
        M.barkDark,
        4,
      );
    }
  }

  // ---------- pelvis and leaf skirt ----------
  put(new THREE.DodecahedronGeometry(0.19, 0), M.barkDark, [0, 0.97, 0], [1.15, 0.62, 0.95]);

  const skirtLeaf = new THREE.IcosahedronGeometry(1, 0);
  skirtLeaf.scale(0.085, 0.16, 0.02);
  for (let i = 0; i < 8; i++) {
    const hub = new THREE.Object3D();
    hub.position.set(0, 0.95, 0);
    hub.rotation.y = (i / 8) * TAU + 0.2;
    root.add(hub);

    const tilt = new THREE.Object3D();
    tilt.position.set(0, 0, 0.19);
    tilt.rotation.x = -0.3;
    hub.add(tilt);

    const leaf = new THREE.Mesh(skirtLeaf, i % 2 ? M.leaf : M.leafDeep);
    leaf.position.set(0, -0.14, 0);
    tilt.add(leaf);
  }

  // ---------- torso: lathe with few radial segments for a faceted trunk ----------
  const lathePts = [
    new THREE.Vector2(0, 0.9),
    ...BODY.map(([r, y]) => new THREE.Vector2(r, y)),
    new THREE.Vector2(0, 1.8),
  ];
  put(new THREE.LatheGeometry(lathePts, 8), M.bark, [0, 0, 0]);

  // Bark knots on the trunk.
  const knots: [number, number][] = [
    [0.7, 1.36],
    [-0.8, 1.58],
    [-0.25, 1.05],
    [2.2, 1.45],
    [-2.3, 1.2],
  ];
  for (const [phi, y] of knots) {
    put(new THREE.DodecahedronGeometry(0.045, 0), M.barkDark, onTorso(phi, y, 0.01), [1, 0.9, 0.55], [0, phi, 0]);
  }

  // Glowing heart set in a bark cradle.
  const hy = 1.52;
  put(new THREE.DodecahedronGeometry(0.085, 0), M.barkDark, onTorso(0, hy, -0.01), [1.05, 1.05, 0.5]);
  put(new THREE.IcosahedronGeometry(0.05, 0), M.glow, onTorso(0, hy, 0.01));

  // A mushroom sprouting from the hip.
  const [mx, my, mz] = onTorso(1.25, 1.08, 0);
  mushroom(mx, my, mz, 1.1);

  // Leaf vine sash running diagonally across the chest.
  const vinePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = 0.17 - 0.33 * t + Math.sin(t * 8) * 0.02;
    const y = 1.68 - 0.69 * t;
    const R = radiusAt(y) - 0.004;
    vinePts.push(V(x, y, Math.sqrt(Math.max(0, R * R - x * x))));
  }
  const vineCurve = new THREE.CatmullRomCurve3(vinePts);
  put(new THREE.TubeGeometry(vineCurve, 48, 0.011, 5, false), M.vine, [0, 0, 0]);
  for (const t of [0.15, 0.5, 0.84]) {
    const p = vineCurve.getPointAt(t);
    put(
      new THREE.IcosahedronGeometry(0.034, 0),
      rng() < 0.5 ? M.leaf : M.leafLight,
      [p.x, p.y, p.z],
      [1, 0.45, 0.5],
      [rand(0, 1), rand(0, TAU), rand(0, 1)],
    );
  }

  // ---------- neck and head ----------
  limb(V(0, 1.7, 0), V(0, 1.84, 0.02), 0.085, 0.075, M.barkDark, 6);

  // Pale wooden mask.
  put(new THREE.IcosahedronGeometry(0.17, 1), M.pale, [0, 1.93, 0.01], [0.9, 1.05, 0.95]);

  for (const sx of [1, -1]) {
    // Dark sockets with glowing eyes.
    put(new THREE.IcosahedronGeometry(0.046, 0), M.barkDark, [sx * 0.062, 1.95, 0.14], [1, 1, 0.5]);
    put(new THREE.IcosahedronGeometry(0.032, 0), M.glow, [sx * 0.062, 1.95, 0.158]);
    // Stern angled brows.
    put(new THREE.BoxGeometry(0.085, 0.022, 0.035), M.barkDark, [sx * 0.066, 1.995, 0.146], [1, 1, 1], [0, 0, sx * 0.3]);
    // Moss patch on each cheek.
    put(new THREE.IcosahedronGeometry(0.045, 0), M.leafLight, [sx * 0.108, 1.9, 0.13], [1.3, 0.45, 0.9], [0, 0, sx * 0.4]);
    // Bark crack.
    put(new THREE.BoxGeometry(0.05, 0.006, 0.012), M.barkDark, [sx * 0.1, 1.87, 0.152], [1, 1, 1], [0, 0, sx * -0.5]);
  }
  // Carved nose and mouth.
  put(new THREE.ConeGeometry(0.024, 0.085, 4), M.barkDark, [0, 1.915, 0.17], [1, 1, 1], [Math.PI / 2, 0, 0]);
  put(new THREE.BoxGeometry(0.07, 0.013, 0.02), M.barkDark, [0, 1.84, 0.152]);

  // Moss cap over the crown.
  put(new THREE.DodecahedronGeometry(0.135, 0), M.moss, [0, 2.03, -0.005], [1.1, 0.42, 1.05], [0, rand(0, TAU), 0]);

  // Hanging moss strands down the back of the head.
  for (let k = 0; k < 5; k++) {
    const x = -0.1 + k * 0.05;
    const top = V(x, 2.0, -0.13 + Math.abs(x) * 0.1);
    const bottom = top.clone().add(V(rand(-0.02, 0.02), -rand(0.14, 0.24), -0.03));
    limb(top, bottom, 0.012, 0.005, k % 2 ? M.moss : M.leafDeep, 4);
    if (k % 2 === 0) leafTuft(bottom, 0.03);
  }

  // ---------- antler-twig crown ----------
  for (const side of [1, -1]) {
    grow(V(side * 0.05, 2.03, -0.01), V(side * 0.42, 1, -0.12).normalize(), 0.2, 0.03, 3);
  }

  // ---------- arms ----------
  arm(1, [0.25, 1.66, 0], [0.36, 1.36, 0.06], [0.42, 1.1, 0.22], false);
  const orbCentre = arm(-1, [-0.25, 1.66, 0], [-0.37, 1.34, 0.08], [-0.42, 1.12, 0.3], true);

  // Firefly orb cradled in the right hand.
  put(new THREE.IcosahedronGeometry(0.065, 1), M.orb, [orbCentre.x, orbCentre.y, orbCentre.z]);

  // ---------- drifting fireflies ----------
  for (let i = 0; i < 9; i++) {
    const a = rand(0, TAU);
    const d = rand(0.6, 1.0);
    const y = rand(0.35, 2.2);
    put(new THREE.IcosahedronGeometry(0.018, 0), M.firefly, [Math.cos(a) * d, y, Math.sin(a) * d]);
  }

  // ---------- place the model: stand on y = 0, centre on x and z ----------
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root, true);
  const centre = new THREE.Vector3();
  box.getCenter(centre);
  root.position.set(-centre.x, -box.min.y, -centre.z);

  return root;
}
```