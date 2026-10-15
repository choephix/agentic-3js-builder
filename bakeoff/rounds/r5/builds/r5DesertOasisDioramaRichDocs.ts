import * as THREE from "three";
import { createBuilder, bezier, catmull, limb, paint, mottle, countershade } from "../../../../src/index";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A low-poly whimsical desert oasis on a layered sand plinth: a turquoise pond ringed with grass and reeds, date palms with swaying rigged trunks, a striped pavilion and a ridge tent with bunting, a campfire, jars, carpets, cacti, pyramids and three rigged camels (one a calf) with blankets and cargo.",
};

type Col = string | ReturnType<typeof paint>;

const GY = 0.275; // sand surface height
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// palette
const SAND = "#eac27a";
const SAND2 = "#dfb36a";
const SAND_L = "#f3d291";
const CLAY1 = "#6e4328";
const CLAY2 = "#8d5a34";
const CLAY3 = "#b07a43";
const CLAY4 = "#c99358";
const GRASS = "#79b04a";
const GRASS_D = "#5c9a3d";
const GRASS_L = "#9ccc5b";
const WATER_A = "#39c0c9";
const WATER_B = "#2a9fbd";
const RIPPLE = "#c9f5ee";
const TRUNK1 = "#8a5a35";
const TRUNK2 = "#6f4527";
const FROND1 = "#3f9b43";
const FROND2 = "#2f8240";
const DATE = "#e8902f";
const COCO = "#5a3820";
const FUR_D = "#8a5a30";
const LIPS = "#9a6a48";
const PAD = "#5f4130";
const EYE_D = "#1c1210";
const WHITE = "#fff6e3";
const EAR_IN = "#e8a9a0";
const CREAM = "#fbeccb";
const RED = "#d9453a";
const NAVY = "#2f5b8a";
const GOLD = "#f2b82e";
const WOOD = "#6b4426";
const DOOR = "#4a2b1c";
const ROPE = "#cdb089";
const STONE1 = "#a79a8c";
const STONE2 = "#8f8478";
const STONE3 = "#bdb1a2";
const FIRE1 = "#ff7a1f";
const FIRE2 = "#ffc83a";
const FIRE3 = "#e5381f";
const LOG = "#5b3a22";
const TERRA = "#c4673b";
const TERRA_D = "#7d3a22";
const CACT = "#5aa65c";
const PINK = "#ff7fa8";
const REED = "#7aa63e";
const CATTAIL = "#6b3f26";
const PYR1 = "#d9a85e";
const PYR2 = "#c9984f";
const MINT = "#4aa56b";

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const root = b.joint("base", { at: [0, 0.15, 0] });
  const R = prng(11);

  const SPH = () => new THREE.SphereGeometry(1, 7, 5);
  const P = (
    g: THREE.BufferGeometry,
    c: Col,
    at: THREE.Vector3,
    o: {
      scale?: [number, number, number];
      rotation?: [number, number, number];
      dir?: THREE.Vector3;
      flat?: boolean;
    } = {},
  ) => b.part(g, c, { at, bone: root, ...o });
  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, col: string) =>
    b.rod(a, c, r, { color: col, bone: root, sides: 5 });
  const tri = (w: number, h: number): Array<[number, number]> => [
    [-w, 0],
    [w, 0],
    [0, -h],
  ];
  const arch = (w: number, h: number): Array<[number, number]> => [
    [-w, 0],
    [w, 0],
    [w, h * 0.6],
    [w * 0.55, h * 0.9],
    [0, h],
    [-w * 0.55, h * 0.9],
    [-w, h * 0.6],
  ];

  // ---------------------------------------------------------------- plinth
  b.lathe(
    [
      [0, 0],
      [2.15, 0],
      [2.2, 0.15],
      [0, 0.15],
    ],
    {
      at: [0, 0, 0],
      segments: 14,
      bone: root,
      color: paint((p) => (p.y < 0.04 ? CLAY1 : p.y < 0.08 ? CLAY2 : p.y < 0.115 ? CLAY3 : CLAY4)),
    },
  );
  const sandPaint = mottle(SAND, SAND2, { size: 0.3, seed: 5 });
  b.lathe(
    [
      [0, 0.15],
      [2.2, 0.15],
      [2.2, 0.2],
      [1.95, 0.268],
      [0, 0.28],
    ],
    { at: [0, 0, 0], segments: 14, bone: root, color: sandPaint },
  );

  // dunes
  const duneP = mottle(SAND_L, SAND2, { size: 0.2, seed: 3 });
  const dunes: Array<[number, number, number, number, number, number]> = [
    [1.35, -1.0, 0.3, 0.12, 0.2, 35],
    [-0.75, -1.38, 0.3, 0.1, 0.18, -20],
    [0.2, 1.6, 0.5, 0.1, 0.25, 0],
    [-0.95, 1.55, 0.4, 0.1, 0.22, 10],
  ];
  for (const [x, z, a, h, c, rot] of dunes) {
    P(SPH(), duneP, V(x, GY - 0.01, z), { scale: [a, h, c], rotation: [0, rot, 0] });
  }

  // pyramids
  const pyrP = paint((p) => (Math.floor((p.y + 5) / 0.06) % 2 ? PYR1 : PYR2));
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0, 0.46],
    ],
    { at: V(0.4, GY - 0.02, -1.4), segments: 4, spin: 45, bone: root, color: pyrP },
  );
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0, 0.28],
    ],
    { at: V(0.95, GY - 0.02, -1.2), segments: 4, spin: 45, bone: root, color: pyrP },
  );

  // ---------------------------------------------------------------- pond
  const PCx = 0.1;
  const PCz = 0.1;
  P(new THREE.CylinderGeometry(1, 1, 0.03, 14), mottle(GRASS, GRASS_D, { size: 0.18, seed: 2 }), V(PCx, GY + 0.005, PCz), {
    scale: [0.9, 1, 0.68],
  });
  P(new THREE.CylinderGeometry(1, 1, 0.03, 14), mottle(WATER_A, WATER_B, { size: 0.3, seed: 4 }), V(PCx, GY + 0.012, PCz), {
    scale: [0.7, 1, 0.5],
  });
  for (const [rs, y] of [
    [0.3, 0.031],
    [0.5, 0.031],
  ]) {
    P(new THREE.TorusGeometry(rs, 0.006, 4, 18), RIPPLE, V(PCx - 0.1, GY + y, PCz + 0.05), {
      rotation: [90, 0, 0],
      scale: [1, 0.72, 1],
    });
  }
  // shore stones
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2 + 0.2;
    if (Math.cos(a) > 0.82) continue;
    const rr = 0.88 + R() * 0.06;
    const s = 0.035 + R() * 0.035;
    P(new THREE.IcosahedronGeometry(1, 0), [STONE1, STONE2, STONE3][i % 3], V(PCx + Math.cos(a) * rr, GY + 0.01, PCz + Math.sin(a) * rr * 0.75), {
      scale: [s * 1.3, s, s * 1.1],
      rotation: [R() * 40, R() * 360, 0],
      flat: true,
    });
  }
  // grass tufts
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.1;
    const cx = PCx + Math.cos(a) * 0.95;
    const cz = PCz + Math.sin(a) * 0.72;
    for (let j = 0; j < 3; j++) {
      const h = 0.07 + R() * 0.06;
      P(new THREE.ConeGeometry(0.014, h, 4), [GRASS_L, GRASS_D, GRASS][j], V(cx + (j - 1) * 0.02, GY + h * 0.4, cz + (R() - 0.5) * 0.03), {
        dir: V((j - 1) * 0.35, 1, (R() - 0.5) * 0.3).normalize(),
      });
    }
  }
  // lily pads and flowers
  const pads: Array<[number, number]> = [
    [0.0, 0.2],
    [0.35, 0.0],
    [-0.25, 0.05],
    [0.28, 0.27],
  ];
  pads.forEach(([x, z], i) => {
    P(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 8), i % 2 ? GRASS : GRASS_D, V(x, GY + 0.032, z));
    if (i % 2 === 0) {
      P(new THREE.ConeGeometry(0.03, 0.04, 5), PINK, V(x, GY + 0.055, z));
      P(SPH(), GOLD, V(x, GY + 0.05, z), { scale: [0.012, 0.012, 0.012] });
    }
  });
  // reeds
  const reedClumps: Array<[number, number]> = [
    [-0.5, -0.2],
    [0.55, -0.42],
    [0.72, 0.52],
  ];
  reedClumps.forEach(([cx, cz]) => {
    for (let j = 0; j < 5; j++) {
      const bx = cx + (R() - 0.5) * 0.14;
      const bz = cz + (R() - 0.5) * 0.12;
      const h = 0.28 + R() * 0.18;
      const tip = V(bx + (R() - 0.5) * 0.1, GY + h, bz + (R() - 0.5) * 0.1);
      rod(V(bx, GY - 0.01, bz), tip, 0.006, REED);
      if (j % 2 === 0) b.capsule(tip.clone().add(V(0, -0.07, 0)), tip, 0.013, { color: CATTAIL, bone: root, sides: 5 });
    }
  });

  // ---------------------------------------------------------------- palms
  const trunkP = paint((p) => (Math.floor((p.y + 5) / 0.045) % 2 ? TRUNK1 : TRUNK2));
  const palm = (id: string, x: number, z: number, h: number, lx: number, lz: number, fs: number) => {
    const pts = [
      V(x, GY - 0.04, z),
      V(x + lx * 0.12, GY + h * 0.34, z + lz * 0.12),
      V(x + lx * 0.5, GY + h * 0.7, z + lz * 0.5),
      V(x + lx, GY + h, z + lz),
    ];
    const path = catmull(pts);
    const ch = b.chain(`palm${id}`, path, { parent: root, count: 3, role: "spine" });
    b.sweep(ch, (t: number) => 0.03 + 0.05 * Math.exp(-5 * t), { sides: 7, color: trunkP });
    const top = pts[3];
    const crown = b.joint(`crown${id}`, { parent: ch.joints[2], at: top, dir: V(0, 1, 0) });
    const n = 9;
    const off = R() * 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + off;
      const d = V(Math.sin(a), 0, Math.cos(a));
      const L = (0.4 + 0.1 * R()) * fs;
      const droop = (i % 2 ? 0 : 0.07) * fs + R() * 0.03;
      const p0 = top.clone().addScaledVector(d, 0.02);
      const p1 = top.clone().addScaledVector(d, L * 0.35).add(V(0, 0.16 * fs, 0));
      const p2 = top.clone().addScaledVector(d, L * 0.72).add(V(0, 0.17 * fs - droop, 0));
      const p3 = top.clone().addScaledVector(d, L).add(V(0, -0.1 * fs - droop, 0));
      b.sweep(bezier(p0, p1, p2, p3), (t: number): [number, number] => [0.012 + 0.05 * fs * Math.sin(Math.PI * Math.pow(t, 0.75)), 0.006], {
        bone: crown,
        section: "box",
        color: i % 2 ? FROND1 : FROND2,
        caps: "point",
        up: [0, 1, 0],
      });
    }
    for (let i = 0; i < 3; i++) {
      const a = off + (i / 3) * Math.PI * 2 + 0.5;
      const d = V(Math.sin(a), 0, Math.cos(a));
      b.sweep(
        bezier(
          top.clone(),
          top.clone().addScaledVector(d, 0.04).add(V(0, 0.14 * fs, 0)),
          top.clone().addScaledVector(d, 0.1 * fs).add(V(0, 0.27 * fs, 0)),
          top.clone().addScaledVector(d, 0.2 * fs).add(V(0, 0.38 * fs, 0)),
        ),
        (t: number): [number, number] => [0.01 + 0.03 * fs * Math.sin(Math.PI * Math.pow(t, 0.8)), 0.005],
        { bone: crown, section: "box", color: FROND2, caps: "point", up: [0, 1, 0] },
      );
    }
    const fruit: Array<[number, number, string]> = [
      [0.04, 0.03, DATE],
      [-0.04, 0.03, DATE],
      [0.0, -0.045, DATE],
      [0.035, -0.04, COCO],
      [-0.03, -0.04, COCO],
    ];
    fruit.forEach(([dx, dz, c]) => {
      b.part(SPH(), c, { at: top.clone().add(V(dx, -0.05, dz)), scale: [0.028, 0.034, 0.028], bone: crown });
    });
    return { path, top };
  };
  const p1 = palm("A", -0.55, 0.3, 1.15, 0.25, 0.05, 1.0);
  palm("B", 0.85, -0.3, 1.3, -0.15, 0.2, 1.1);
  palm("C", 0.15, -0.62, 1.05, 0.1, 0.12, 0.95);
  palm("D", 1.2, -0.85, 0.85, -0.1, 0.1, 0.8);

  // ---------------------------------------------------------------- tent 1: striped pavilion
  const T1 = V(-1.2, GY - 0.01, -0.15);
  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.22],
      [0, 0.22],
    ],
    { at: T1, segments: 12, bone: root, color: CREAM },
  );
  b.lathe(
    [
      [0, 0.2],
      [0.62, 0.2, "sharp"],
      [0.03, 0.8],
      [0, 0.8],
    ],
    {
      at: T1,
      segments: 12,
      bone: root,
      color: paint((_p, _n, s) => (Math.floor((((s[1] % 360) + 360) % 360) / 30) % 2 ? RED : CREAM)),
    },
  );
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    P(new THREE.ConeGeometry(0.05, 0.09, 4), i % 2 ? GOLD : NAVY, V(T1.x + Math.sin(a) * 0.6, T1.y + 0.16, T1.z + Math.cos(a) * 0.6), {
      dir: V(0, -1, 0),
    });
  }
  rod(V(T1.x, T1.y + 0.78, T1.z), V(T1.x, T1.y + 0.96, T1.z), 0.012, WOOD);
  P(SPH(), GOLD, V(T1.x, T1.y + 0.98, T1.z), { scale: [0.032, 0.032, 0.032] });
  b.extrude(
    [
      [0, 0],
      [0.16, -0.035],
      [0, -0.07],
    ],
    { at: V(T1.x, T1.y + 0.94, T1.z), x: [1, 0, 0], thickness: 0.006, color: RED, bone: root },
  );
  b.extrude(arch(0.12, 0.2), { at: V(T1.x, T1.y, T1.z + 0.482), thickness: 0.03, color: GOLD, bone: root });
  b.extrude(arch(0.1, 0.18), { at: V(T1.x, T1.y, T1.z + 0.488), thickness: 0.04, color: DOOR, bone: root });
  for (let i = 0; i < 4; i++) {
    const a = rad(45 + i * 90 + 15);
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    if (sz > 0.6) continue;
    const eave = V(T1.x + sx * 0.6, T1.y + 0.2, T1.z + sz * 0.6);
    const peg = V(T1.x + sx * 0.9, T1.y + 0.02, T1.z + sz * 0.9);
    rod(eave, peg, 0.005, ROPE);
    b.spike(peg.clone().add(V(0, 0.05, 0)), V(0, -1, 0), 0.08, 0.012, { color: WOOD, bone: root });
  }

  // ---------------------------------------------------------------- tent 2: ridge tent with awning
  const T2 = V(-0.35, GY - 0.01, -1.05);
  const yaw2 = rad(12);
  const f2 = V(Math.sin(yaw2), 0, Math.cos(yaw2));
  const x2 = V(Math.cos(yaw2), 0, -Math.sin(yaw2));
  const L2 = (x: number, y: number, z: number) =>
    V(T2.x + x * x2.x + z * f2.x, T2.y + y, T2.z + x * x2.z + z * f2.z);
  const tentP = paint((p, n) => {
    const thick = Math.abs(n.x * f2.x + n.z * f2.z);
    if (thick > 0.5) return Math.floor((((p.x - T2.x) * x2.x + (p.z - T2.z) * x2.z) + 5) / 0.1) % 2 ? NAVY : CREAM;
    return Math.floor((((p.x - T2.x) * f2.x + (p.z - T2.z) * f2.z) + 5) / 0.1) % 2 ? NAVY : CREAM;
  });
  b.extrude(
    [
      [-0.32, 0],
      [0.32, 0],
      [0.32, 0.2],
      [0, 0.52, "sharp"],
      [-0.32, 0.2],
    ],
    { at: L2(0, 0, 0), x: [x2.x, 0, x2.z], y: [0, 1, 0], thickness: 0.8, color: tentP, bone: root },
  );
  rod(L2(0, 0.52, -0.46), L2(0, 0.52, 0.5), 0.014, WOOD);
  P(SPH(), GOLD, L2(0, 0.52, 0.52), { scale: [0.03, 0.03, 0.03] });
  P(SPH(), GOLD, L2(0, 0.52, -0.48), { scale: [0.03, 0.03, 0.03] });
  b.extrude(arch(0.11, 0.22), { at: L2(0, 0, 0.4), x: [x2.x, 0, x2.z], thickness: 0.04, color: DOOR, bone: root });
  b.slab([L2(-0.32, 0.2, 0.4), L2(0.32, 0.2, 0.4), L2(0.34, 0.11, 0.7), L2(-0.34, 0.11, 0.7)], {
    color: RED,
    thickness: 0.012,
    bone: root,
  });
  for (const s of [1, -1]) rod(L2(s * 0.34, 0.11, 0.7), L2(s * 0.34, -0.01, 0.7), 0.01, WOOD);
  for (let i = 0; i < 8; i++) {
    const u = -0.31 + (i + 0.5) * (0.62 / 8);
    P(new THREE.ConeGeometry(0.03, 0.05, 4), i % 2 ? GOLD : CREAM, L2(u, 0.085, 0.7), { dir: V(0, -1, 0) });
  }

  // ---------------------------------------------------------------- bunting
  {
    const A = V(T1.x, T1.y + 0.88, T1.z);
    const B = p1.path.at(0.62).clone();
    const M = A.clone().lerp(B, 0.5).add(V(0, -0.1, 0));
    const rope = catmull([A, M, B]);
    b.sweep(rope, 0.005, { color: ROPE, bone: root, sides: 4 });
    const dir = V(B.x - A.x, 0, B.z - A.z).normalize();
    const cols = [RED, GOLD, NAVY, MINT];
    const nf = 8;
    for (let i = 0; i < nf; i++) {
      const pt = rope.at((i + 0.7) / (nf + 0.4));
      b.extrude(tri(0.04, 0.09), { at: pt, x: [dir.x, 0, dir.z], y: [0, 1, 0], thickness: 0.004, color: cols[i % 4], bone: root });
    }
  }

  // ---------------------------------------------------------------- campsite
  const carpetP = paint((p) => {
    const k = Math.floor((p.z + 9) / 0.05) % 4;
    return k === 0 ? RED : k === 2 ? NAVY : CREAM;
  });
  P(new THREE.BoxGeometry(0.55, 0.012, 0.4), carpetP, V(-1.25, GY + 0.004, 0.62), { rotation: [0, 15, 0] });
  P(SPH(), RED, V(-1.35, GY + 0.035, 0.7), { scale: [0.09, 0.04, 0.07], rotation: [0, 30, 0] });
  P(SPH(), NAVY, V(-1.12, GY + 0.035, 0.55), { scale: [0.08, 0.04, 0.08], rotation: [0, -20, 0] });
  // campfire
  const FX = -0.95;
  const FZ = 1.05;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(new THREE.IcosahedronGeometry(1, 0), i % 2 ? STONE1 : STONE2, V(FX + Math.cos(a) * 0.15, GY + 0.015, FZ + Math.sin(a) * 0.15), {
      scale: [0.035, 0.03, 0.035],
      rotation: [0, i * 40, 0],
      flat: true,
    });
  }
  rod(V(FX - 0.1, GY + 0.03, FZ - 0.04), V(FX + 0.1, GY + 0.07, FZ + 0.04), 0.025, LOG);
  rod(V(FX - 0.05, GY + 0.03, FZ + 0.1), V(FX + 0.06, GY + 0.07, FZ - 0.1), 0.025, LOG);
  P(new THREE.ConeGeometry(0.075, 0.2, 6), FIRE3, V(FX, GY + 0.12, FZ));
  P(new THREE.ConeGeometry(0.052, 0.17, 6), FIRE1, V(FX + 0.01, GY + 0.14, FZ), { rotation: [0, 20, 0] });
  P(new THREE.ConeGeometry(0.03, 0.12, 5), FIRE2, V(FX, GY + 0.15, FZ + 0.01));
  P(SPH(), FIRE2, V(FX + 0.07, GY + 0.28, FZ - 0.03), { scale: [0.012, 0.012, 0.012] });
  P(SPH(), FIRE1, V(FX - 0.06, GY + 0.33, FZ + 0.02), { scale: [0.01, 0.01, 0.01] });

  // jars
  const jarOutline: Array<[number, number]> = [
    [0, 0],
    [0.04, 0],
    [0.07, 0.05],
    [0.075, 0.1],
    [0.06, 0.15],
    [0.035, 0.18],
    [0.048, 0.2],
    [0, 0.2],
  ];
  const jarP = paint((_p, _n, s) => (s[0] > 0.085 && s[0] < 0.115 ? TERRA_D : TERRA));
  b.lathe(jarOutline, { at: V(0.38, GY - 0.005, -0.95), segments: 8, bone: root, color: jarP });
  b.lathe(jarOutline, { at: V(0.55, GY - 0.005, -0.85), segments: 8, bone: root, color: jarP });
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), TERRA, V(0.62, GY + 0.04, -0.98), { rotation: [0, 0, 80] });

  // cacti
  const cactus = (x: number, z: number, s: number) => {
    b.capsule(V(x, GY - 0.02, z), V(x, GY + 0.28 * s, z), 0.04 * s, { color: CACT, bone: root, sides: 6 });
    for (const d of [1, -1]) {
      const hgt = d > 0 ? 0.14 : 0.19;
      b.sweep(
        catmull([V(x + d * 0.02, GY + hgt * s, z), V(x + d * 0.1 * s, GY + (hgt + 0.01) * s, z), V(x + d * 0.12 * s, GY + (hgt + 0.1) * s, z)]),
        0.026 * s,
        { color: CACT, sides: 6, bone: root },
      );
    }
    P(SPH(), PINK, V(x, GY + 0.3 * s, z), { scale: [0.022, 0.016, 0.022] });
  };
  cactus(-1.35, -0.95, 1.0);
  cactus(1.55, -0.55, 0.7);

  // rocks
  const rocks: Array<[number, number, number, string]> = [
    [-1.65, 0.1, 0.1, STONE1],
    [-0.4, -0.5, 0.07, STONE2],
    [1.7, 0.95, 0.12, STONE3],
    [-1.1, -0.75, 0.06, STONE2],
    [0.95, 0.95, 0.07, STONE1],
    [-0.1, 1.45, 0.08, STONE3],
  ];
  rocks.forEach(([x, z, s, c], i) => {
    P(new THREE.IcosahedronGeometry(1, 0), c, V(x, GY + s * 0.2, z), {
      scale: [s * 1.2, s * 0.8, s],
      rotation: [10, i * 57, 8],
      flat: true,
    });
  });

  // ---------------------------------------------------------------- camels
  type CamelOpt = {
    tan: string;
    tanD: string;
    belly: string;
    light: string;
    seed: number;
    blanket?: string;
    trim?: string;
    cargo?: boolean;
  };
  const camel = (id: string, ox: number, oz: number, yawDeg: number, sc: number, opt: CamelOpt) => {
    const th = rad(yawDeg);
    const cs = Math.cos(th);
    const sn = Math.sin(th);
    const Q = (x: number, y: number, z: number) => V(ox + (x * cs + z * sn) * sc, GY + y * sc, oz + (-x * sn + z * cs) * sc);
    const Dv = (x: number, y: number, z: number) => V(x * cs + z * sn, y, -x * sn + z * cs).normalize();
    const k = (v: number) => v * sc;
    const coat = countershade(mottle(opt.tan, opt.tanD, { size: 0.14, seed: opt.seed }), opt.belly, { level: -0.3 });

    // skeleton
    const hips = b.joint(`hips_${id}`, { parent: root, at: Q(0, 0.44, -0.2), dir: Dv(0, 0, 1) });
    const spine = b.chain(`spine_${id}`, catmull([Q(0, 0.44, -0.2), Q(0, 0.455, 0.04), Q(0, 0.46, 0.28)]), {
      parent: hips,
      names: [`spine1_${id}`, `spine2_${id}`, `chest_${id}`],
      role: "spine",
    });
    const neck = b.chain(`neck_${id}`, catmull([Q(0, 0.5, 0.27), Q(0, 0.6, 0.39), Q(0, 0.74, 0.46), Q(0, 0.84, 0.53)]), {
      parent: spine.joints[2],
      names: [`neck1_${id}`, `neck2_${id}`, `neck3_${id}`],
      role: "neck",
    });
    const head = b.joint(`head_${id}`, { parent: neck.joints[2], at: Q(0, 0.84, 0.53), aim: Q(0, 0.79, 0.63), role: "head" });
    const jaw = b.joint(`jaw_${id}`, { parent: head, at: Q(0, 0.79, 0.57), aim: Q(0, 0.745, 0.66), role: "jaw" });
    const tail = b.chain(`tail_${id}`, catmull([Q(0, 0.46, -0.37), Q(0, 0.42, -0.43), Q(0, 0.33, -0.45)]), {
      parent: hips,
      names: [`tail1_${id}`, `tail2_${id}`],
      role: "tail",
    });

    // body
    const prof = [0.088, 0.108, 0.112, 0.098];
    const bodyR = (t: number): [number, number] => {
      const kk = Math.min(t, 0.999) * 3;
      const i = Math.floor(kk);
      const f = kk - i;
      const r = (prof[i] * (1 - f) + prof[i + 1] * f) * sc;
      return [r * 0.95, r * 1.12];
    };
    const body = b.sweep(spine, bodyR, { color: coat, extend: [k(0.1), 0], shift: [0, -k(0.012)] });
    b.part(SPH(), coat, { at: Q(0, 0.56, -0.02), scale: [k(0.085), k(0.1), k(0.115)], bone: spine.joints[0] });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(k(0.02), k(0.05), 5), opt.tanD, {
        at: Q((i - 1) * 0.04, 0.655, -0.02 - Math.abs(i - 1) * 0.03),
        dir: Dv((i - 1) * 0.4, 1, 0),
        bone: spine.joints[0],
      });
    }

    // neck
    const neckS = b.sweep(neck, [k(0.075), k(0.058), k(0.047), k(0.042)], { color: coat });
    for (const t of [0.25, 0.45, 0.65, 0.85]) {
      b.stick(new THREE.ConeGeometry(k(0.022), k(0.07), 5), FUR_D, neckS.at(t, 180), { embed: 0.3 });
    }
    for (const t of [0.3, 0.5, 0.7]) {
      b.stick(new THREE.ConeGeometry(k(0.018), k(0.055), 5), opt.tanD, neckS.at(t, 0), { embed: 0.3 });
    }

    // head
    b.capsule(Q(0, 0.84, 0.53), Q(0, 0.805, 0.6), k(0.047), { color: coat, bone: head });
    b.capsule(Q(0, 0.8, 0.6), Q(0, 0.775, 0.69), [k(0.041), k(0.035)], { color: opt.light, bone: head });
    b.part(SPH(), LIPS, { at: Q(0, 0.772, 0.7), scale: [k(0.036), k(0.03), k(0.03)], bone: head });
    b.capsule(Q(0, 0.785, 0.575), Q(0, 0.742, 0.675), [k(0.03), k(0.026)], { color: opt.light, bone: jaw });
    b.part(SPH(), LIPS, { at: Q(0, 0.738, 0.682), scale: [k(0.028), k(0.022), k(0.026)], bone: jaw });
    b.part(new THREE.ConeGeometry(k(0.015), k(0.05), 4), FUR_D, { at: Q(0, 0.715, 0.66), dir: Dv(0, -1, 0.2), bone: jaw });
    b.part(new THREE.ConeGeometry(k(0.014), k(0.05), 4), FUR_D, { at: Q(0, 0.89, 0.54), dir: Dv(0, 1, 0.5), bone: head });
    for (const s of [1, -1]) {
      b.part(SPH(), EYE_D, { at: Q(s * 0.014, 0.783, 0.713), scale: [k(0.008), k(0.006), k(0.008)], bone: head });
      b.part(SPH(), WHITE, { at: Q(s * 0.043, 0.853, 0.565), scale: [k(0.02), k(0.02), k(0.02)], bone: head });
      b.part(SPH(), EYE_D, { at: Q(s * 0.058, 0.853, 0.572), scale: [k(0.011), k(0.012), k(0.011)], bone: head });
      b.part(SPH(), coat, { at: Q(s * 0.043, 0.866, 0.562), scale: [k(0.023), k(0.016), k(0.022)], bone: head });
      for (let j = 0; j < 3; j++) {
        b.spike(Q(s * 0.05, 0.872, 0.548 + j * 0.016), Dv(s * 0.6, 1, 0.5 + j * 0.2), k(0.03), k(0.003), { color: EYE_D, bone: head });
      }
      b.part(new THREE.ConeGeometry(k(0.018), k(0.055), 5), coat, { at: Q(s * 0.035, 0.89, 0.505), dir: Dv(s * 0.6, 1, -0.4), bone: head });
      b.part(new THREE.ConeGeometry(k(0.01), k(0.04), 5), EAR_IN, { at: Q(s * 0.037, 0.89, 0.512), dir: Dv(s * 0.6, 1, -0.4), bone: head });
      b.part(SPH(), coat, { at: Q(s * 0.037, 0.815, 0.575), scale: [k(0.022), k(0.022), k(0.022)], bone: head });
    }

    // legs
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const fr = limb(Q(s * 0.085, 0.38, 0.2), Q(s * 0.085, 0.02, 0.21), [k(0.2), k(0.2)], [Dv(0, 0, 1)]);
      const lf = b.chain(`legF${S}_${id}`, fr, {
        parent: spine.joints[2],
        names: [`shoulder${S}_${id}`, `kneeF${S}_${id}`, `hoofF${S}_${id}`],
        role: "leg",
      });
      b.sweep(lf, (t: number) => k(0.052 - 0.026 * t), { color: coat, sides: 7 });
      b.part(SPH(), FUR_D, { at: fr[1], scale: [k(0.034), k(0.034), k(0.034)], bone: lf.joints[1] });
      b.part(SPH(), PAD, {
        at: Q(s * 0.085, 0.022, 0.225),
        scale: [k(0.042), k(0.026), k(0.055)],
        bone: lf.joints[lf.joints.length - 1],
      });

      const hr = limb(Q(s * 0.09, 0.38, -0.2), Q(s * 0.09, 0.02, -0.215), [k(0.2), k(0.2)], [Dv(0, 0, -1)]);
      const lh = b.chain(`legH${S}_${id}`, hr, {
        parent: hips,
        names: [`hip${S}_${id}`, `hock${S}_${id}`, `hoofH${S}_${id}`],
        role: "leg",
      });
      b.sweep(lh, (t: number) => k(0.058 - 0.032 * t), { color: coat, sides: 7 });
      b.part(SPH(), FUR_D, { at: hr[1], scale: [k(0.03), k(0.034), k(0.034)], bone: lh.joints[1] });
      b.part(SPH(), PAD, {
        at: Q(s * 0.09, 0.022, -0.23),
        scale: [k(0.042), k(0.026), k(0.055)],
        bone: lh.joints[lh.joints.length - 1],
      });
    }

    // tail
    b.sweep(tail, [k(0.02), k(0.012)], { color: coat, sides: 6 });
    b.part(new THREE.ConeGeometry(k(0.028), k(0.09), 5), FUR_D, { at: Q(0, 0.3, -0.45), dir: Dv(0, -1, 0), bone: tail.joints[1] });

    // gear
    if (opt.blanket) {
      const loop = b.surface(body).loop(Q(0, 0.44, 0.12), { dir: Dv(0, 0, 1), lift: k(0.006) });
      b.sweep(loop, (): [number, number] => [k(0.05), k(0.007)], { section: "box", color: opt.blanket });
      for (const sh of [-0.04, 0.04]) {
        b.sweep(loop, (): [number, number] => [k(0.012), k(0.01)], {
          section: "box",
          color: opt.trim ?? GOLD,
          shift: [k(sh), 0],
        });
      }
      for (const s of [1, -1]) {
        b.part(SPH(), opt.trim ?? GOLD, { at: Q(s * 0.1, 0.36, 0.12), scale: [k(0.016), k(0.02), k(0.016)], bone: spine.joints[1] });
        b.part(new THREE.ConeGeometry(k(0.012), k(0.05), 4), opt.blanket, { at: Q(s * 0.105, 0.325, 0.12), dir: Dv(0, -1, 0), bone: spine.joints[1] });
      }
    }
    if (opt.cargo) {
      for (const s of [1, -1]) {
        b.part(SPH(), "#d9a441", { at: Q(s * 0.17, 0.4, 0.1), scale: [k(0.07), k(0.1), k(0.1)], bone: spine.joints[1] });
        b.part(new THREE.ConeGeometry(k(0.03), k(0.05), 5), "#b8832e", { at: Q(s * 0.17, 0.5, 0.1), bone: spine.joints[1] });
        b.part(new THREE.TorusGeometry(k(0.085), k(0.008), 4, 8), ROPE, {
          at: Q(s * 0.17, 0.4, 0.1),
          dir: Dv(0, 0, 1),
          axis: "z",
          bone: spine.joints[1],
        });
      }
      b.sweep(catmull([Q(0.17, 0.5, 0.1), Q(0.1, 0.565, 0.1), Q(-0.1, 0.565, 0.1), Q(-0.17, 0.5, 0.1)]), k(0.007), {
        color: ROPE,
        bone: spine.joints[1],
        sides: 5,
      });
    }
  };

  camel("a", 1.3, 0.35, -90, 1.0, {
    tan: "#c99a5b",
    tanD: "#b0803f",
    belly: "#e9cf9d",
    light: "#dcb67d",
    seed: 21,
    blanket: RED,
    trim: GOLD,
  });
  camel("b", 0.0, 1.0, 65, 0.95, {
    tan: "#d9ad74",
    tanD: "#bf8f55",
    belly: "#f0dbb0",
    light: "#e8c898",
    seed: 31,
    blanket: NAVY,
    trim: CREAM,
    cargo: true,
  });
  camel("c", 0.95, 1.15, 50, 0.5, {
    tan: "#e8c696",
    tanD: "#d3a874",
    belly: "#f6e6c4",
    light: "#f0d6a8",
    seed: 41,
  });

  return b.root;
}
