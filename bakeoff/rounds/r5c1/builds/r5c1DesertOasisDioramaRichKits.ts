import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, paint, mottle, countershade, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A whimsical low-poly oasis on a layered sandstone plate: a duck pond with lily pads and reeds, leaning palms with banded trunks and fronds, striped Bedouin, round and A-frame tents with bunting, a glowing campfire with a hanging pot, and three rigged camels (one-hump with a tasseled saddle cap, two-hump pack camel, and a baby).",
};

const DEG = Math.PI / 180;
const G = 0.16; // terrain top height

// palette
const SAND = "#ecc983";
const SAND_D = "#dcae62";
const SAND_L = "#f7dea6";
const GRASS = "#74b83c";
const GRASS_D = "#549a34";
const GRASS_L = "#9ad050";
const WET = "#b99a62";
const ROCK1 = "#b89a78";
const ROCK2 = "#9c8064";
const ROCK3 = "#cdb28e";
const WOOD = "#9a6a3c";
const WOOD_D = "#6f4527";
const WOOD_L = "#c08a4e";
const RED = "#c4423a";
const CREAM = "#fff0d0";
const GOLD = "#f2b632";
const TEAL = "#2aa8a0";
const NAVY = "#2f4a8a";
const MUSTARD = "#e8a830";
const DARK = "#3a2418";
const PINK = "#ef7f9b";
const BLACK = "#1a1210";
const WHITE = "#fff6e6";
const ORANGE = "#f08a24";
const IRON = "#4a4a55";
const TERRA = "#c9663c";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function xf(ox: number, oz: number, yawDeg: number, S = 1, oy = G) {
  const yaw = yawDeg * DEG;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  return {
    q,
    p: (x: number, y: number, z: number) => new THREE.Vector3(ox + (x * c + z * s) * S, oy + y * S, oz + (-x * s + z * c) * S),
    d: (x: number, y: number, z: number) => new THREE.Vector3(x * c + z * s, y, -x * s + z * c),
    qq: (rx: number, ry: number, rz: number) =>
      q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * DEG, ry * DEG, rz * DEG))),
  };
}

const key = (arr: number[], t: number) => {
  const x = Math.max(0, Math.min(1, t)) * (arr.length - 1);
  const i = Math.min(arr.length - 2, Math.floor(x));
  return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
};

const radial = (cx: number, cz: number, yawDeg: number, n: number, c1: string, c2: string) =>
  paint((p) => {
    const a = Math.atan2(p.x - cx, p.z - cz) - yawDeg * DEG;
    const k = Math.floor((a / (Math.PI * 2)) * n + 1e-4);
    return ((k % 2) + 2) % 2 ? c1 : c2;
  });

// shared paints
const sandPaint = mottle(SAND, SAND_D, { size: 0.3, seed: 2 });
const dunePaint = mottle(SAND_L, SAND, { size: 0.4, seed: 5 });
const basePaint = paint((p, n) => {
  if (n.y > 0.7) return sandPaint;
  const h = p.y + Math.sin(p.x * 9) * 0.008 + Math.cos(p.z * 7) * 0.008;
  return h < 0.05 ? "#b5683a" : h < 0.1 ? "#d58c4a" : h < 0.14 ? "#e3a95e" : "#efc98a";
});
const waterPaint = mottle("#47cddc", "#2a9fbf", { size: 0.14, seed: 8 });
const trunkPaint = paint((p) => {
  const k = Math.floor(p.y / 0.034);
  return k % 2 ? "#b4824e" : k % 3 === 0 ? "#8a5a34" : "#9c6a3e";
});
const leafA = paint((_p, _n, s) => (Math.floor(s[0] * 16) % 2 ? "#4fb54f" : "#3b9a45"));
const leafB = paint((_p, _n, s) => (Math.floor(s[0] * 16) % 2 ? "#63c455" : "#46a84a"));

const CARPET = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="40" fill="#a8302e"/>
    <rect x="3" y="3" width="58" height="34" fill="#f2c15a"/>
    <rect x="6" y="6" width="52" height="28" fill="#2f4a8a"/>
    <path d="M32 8 L50 20 L32 32 L14 20 Z" fill="#c4423a"/>
    <path d="M32 13 L43 20 L32 27 L21 20 Z" fill="#f2c15a"/>
    <circle cx="32" cy="20" r="3" fill="#2f4a8a"/>
    <path d="M8 8 l5 0 l-5 5 Z M56 8 l-5 0 l5 5 Z M8 32 l5 0 l-5 -5 Z M56 32 l-5 0 l5 -5 Z" fill="#f2c15a"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const rootJ = b.joint("root", { at: [0, G, 0] });
  const R = rng(11);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prt = (geo: THREE.BufferGeometry, color: any, at: any, opts: any = {}) =>
    b.part(geo, color, { bone: rootJ, at, ...opts });
  const ball = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);

  // ---------------------------------------------------------------- terrain
  b.lathe(
    [
      [0, 0],
      [1.5, 0],
      [1.53, 0.05],
      [1.5, 0.11],
      [1.47, G],
      [0, G],
    ] as [number, number][],
    { at: [0, 0, 0], bone: rootJ, segments: 28, color: basePaint },
  );

  const dune = (x: number, z: number, rx: number, h: number, rz: number, rot: number) =>
    prt(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), dunePaint, v(x, G - 0.01, z), {
      scale: [rx, h, rz],
      rotation: [0, rot, 0],
      flat: true,
    });
  dune(0.2, -1.0, 0.6, 0.27, 0.3, 10);
  dune(-0.8, -0.85, 0.35, 0.17, 0.25, 30);
  dune(1.15, -0.45, 0.25, 0.14, 0.35, -10);
  dune(0.7, -1.05, 0.3, 0.2, 0.2, 40);

  // ---------------------------------------------------------------- pond
  const PCX = -0.2;
  const PCZ = 0.0;
  const cyl = (n = 16) => new THREE.CylinderGeometry(1, 1, 1, n);
  prt(cyl(), GRASS, v(PCX, G + 0.008, PCZ), { scale: [0.56, 0.016, 0.43], flat: true });
  prt(cyl(), WET, v(PCX, G + 0.01, PCZ), { scale: [0.47, 0.02, 0.35], flat: true });
  prt(cyl(), waterPaint, v(PCX, G + 0.012, PCZ), { scale: [0.41, 0.03, 0.29] });

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R() * 0.3;
    const k = 0.98 + R() * 0.1;
    prt(ball(1, 7, 4), i % 3 ? GRASS_D : GRASS_L, v(PCX + Math.cos(a) * 0.56 * k, G + 0.012, PCZ + Math.sin(a) * 0.43 * k), {
      scale: [0.05 + R() * 0.04, 0.025, 0.045 + R() * 0.03],
      flat: true,
    });
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + R() * 0.2;
    const s = 0.022 + R() * 0.024;
    const col = [ROCK1, ROCK2, ROCK3][i % 3];
    prt(new THREE.IcosahedronGeometry(1, 0), col, v(PCX + Math.cos(a) * 0.44, G + 0.015, PCZ + Math.sin(a) * 0.325), {
      scale: [s * 1.2, s * 0.8, s],
      rotation: [R() * 60, R() * 360, R() * 40],
      flat: true,
    });
  }
  // ripples
  for (const [rx, rz, sc] of [
    [-0.3, 0.08, 0.1],
    [-0.1, -0.08, 0.07],
  ] as [number, number, number][]) {
    prt(new THREE.TorusGeometry(1, 0.025, 3, 14), "#c8f2f2", v(PCX + rx + 0.2, G + 0.029, PCZ + rz), {
      scale: [sc, sc * 0.75, sc],
      rotation: [90, 0, 0],
    });
  }
  // lily pads + lotus
  for (const [lx, lz, lotus] of [
    [0.1, 0.1, true],
    [0.18, -0.08, false],
    [-0.45, -0.1, true],
    [-0.38, 0.14, false],
  ] as [number, number, boolean][]) {
    prt(new THREE.CircleGeometry(0.04, 7), "#3f9d48", v(PCX + lx, G + 0.03, PCZ + lz), { dir: [0, 1, 0], axis: "z" });
    if (lotus) {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.spike(v(PCX + lx, G + 0.03, PCZ + lz), v(Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5), 0.035, 0.009, {
          color: k % 2 ? PINK : "#f9b3c6",
          bone: rootJ,
        });
      }
      prt(ball(0.008, 5, 4), GOLD, v(PCX + lx, G + 0.045, PCZ + lz));
    }
  }
  // ducks
  const duck = (x: number, z: number, yaw: number, S: number) => {
    const T = xf(x, z, yaw, S, G + 0.02);
    prt(ball(1, 8, 6), WHITE, T.p(0, 0.014, 0), { scale: [0.03 * S, 0.022 * S, 0.045 * S], quat: T.q });
    prt(ball(0.021 * S, 7, 5), WHITE, T.p(0, 0.046, 0.04));
    prt(new THREE.ConeGeometry(0.009 * S, 0.026 * S, 5), ORANGE, T.p(0, 0.042, 0.066), { dir: T.d(0, -0.05, 1) });
    for (const s of [1, -1]) {
      prt(ball(1, 5, 4), "#e6d9bf", T.p(s * 0.026, 0.02, -0.004), { scale: [0.008 * S, 0.016 * S, 0.03 * S], quat: T.q });
      prt(ball(0.004 * S, 4, 3), BLACK, T.p(s * 0.015, 0.052, 0.052));
    }
    prt(new THREE.ConeGeometry(0.012 * S, 0.03 * S, 4), WHITE, T.p(0, 0.032, -0.05), { dir: T.d(0, 0.6, -1) });
  };
  duck(-0.28, 0.05, 30, 1);
  duck(-0.12, 0.13, -60, 0.65);

  // reeds + cattails + flowers around the pond
  for (const [ra, cnt] of [
    [25, 4],
    [60, 3],
    [150, 3],
    [200, 4],
    [320, 3],
  ] as [number, number][]) {
    const a = ra * DEG;
    const cx = PCX + Math.cos(a) * 0.52;
    const cz = PCZ + Math.sin(a) * 0.4;
    for (let k = 0; k < cnt; k++) {
      const ox = (R() - 0.5) * 0.08;
      const oz = (R() - 0.5) * 0.08;
      const h = 0.12 + R() * 0.12;
      b.spike(v(cx + ox, G, cz + oz), v((R() - 0.5) * 0.4, 1, (R() - 0.5) * 0.4), h, 0.007, {
        color: k % 2 ? GRASS_L : GRASS_D,
        bone: rootJ,
      });
      if (k === 0 && ra % 2 === 1) {
        prt(new THREE.CapsuleGeometry(0.008, 0.03, 2, 5), WOOD_D, v(cx + ox, G + h + 0.01, cz + oz));
      }
    }
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.4;
    const fx = PCX + Math.cos(a) * 0.6;
    const fz = PCZ + Math.sin(a) * 0.47;
    b.rod(v(fx, G, fz), v(fx, G + 0.04, fz), 0.002, GRASS_D, { bone: rootJ });
    prt(ball(0.011, 5, 4), i % 2 ? PINK : "#ffe06a", v(fx, G + 0.045, fz));
  }

  // ---------------------------------------------------------------- palms
  const palms: Record<string, THREE.Vector3> = {};
  const palm = (name: string, bx: number, bz: number, ox: number, oz: number, h: number, seed: number, dates: boolean) => {
    const y0 = G - 0.01;
    const pts = [
      v(bx, y0, bz),
      v(bx + ox * 0.12, y0 + h * 0.35, bz + oz * 0.12),
      v(bx + ox * 0.5, y0 + h * 0.7, bz + oz * 0.5),
      v(bx + ox, y0 + h, bz + oz),
    ];
    b.sweep(catmull(pts), (t: number) => 0.03 + 0.03 * Math.pow(1 - t, 1.6), {
      color: trunkPaint,
      sides: 7,
      bone: rootJ,
    });
    palms[name] = pts[2].clone();
    const top = pts[3];
    prt(ball(0.045, 7, 5), "#5a4a2a", top.clone().add(v(0, 0.01, 0)), { scale: [1, 0.8, 1] });
    const L = 0.2 + 0.26 * h;
    const nF = 9;
    for (let i = 0; i < nF; i++) {
      const a = (i / nF) * Math.PI * 2 + seed * 0.9;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const droop = i % 2 === 0 ? 0.16 : 0.05;
      const p0 = top.clone().add(v(dx * 0.02, 0.025, dz * 0.02));
      const p1 = top.clone().add(v(dx * L * 0.35, 0.02 + L * 0.22, dz * L * 0.35));
      const p2 = top.clone().add(v(dx * L * 0.72, 0.02 + L * (0.28 - droop * 0.5), dz * L * 0.72));
      const p3 = top.clone().add(v(dx * L, 0.02 + L * (0.1 - droop * 1.4), dz * L));
      const wmax = 0.075 * (L / 0.5);
      b.sweep(bezier(p0, p1, p2, p3), (t: number): [number, number] => [
        Math.max(0.002, wmax * Math.pow(Math.max(0, Math.sin(Math.PI * (0.08 + 0.92 * t))), 0.8)),
        0.0035,
      ], {
        section: "box",
        caps: { start: "flat", end: "flat" },
        color: i % 2 ? leafA : leafB,
        bone: rootJ,
      });
    }
    b.spike(top, v(0, 1, 0), 0.1, 0.016, { color: "#7ed05c", bone: rootJ });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.5;
      prt(ball(0.02, 6, 4), "#5b3a22", top.clone().add(v(Math.sin(a) * 0.04, -0.035, Math.cos(a) * 0.04)));
    }
    if (dates) {
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        prt(ball(0.013, 5, 4), "#d9822b", top.clone().add(v(Math.sin(a) * 0.065, -0.07 - (k % 2) * 0.02, Math.cos(a) * 0.065)), {
          scale: [1, 1.3, 1],
        });
      }
    }
  };
  palm("p1", -0.72, -0.1, -0.15, -0.05, 0.82, 0, true);
  palm("p2", -0.5, 0.3, -0.05, 0.12, 0.62, 1, false);
  palm("p3", 0.12, -0.3, 0.1, -0.08, 0.76, 2, false);
  palm("p4", 0.18, 0.2, 0.06, 0.1, 0.5, 3, true);
  palm("p5", -0.35, -0.38, -0.1, -0.12, 0.7, 4, false);
  palm("p6", -0.15, -0.72, 0.05, -0.05, 0.58, 5, false);
  palm("p7", -1.1, 0.35, -0.1, 0.05, 0.6, 6, false);

  // ---------------------------------------------------------------- tents
  const arch = (w: number, h: number, shoulder: number): [number, number][] => [
    [-w, 0],
    [w, 0],
    [w, h * shoulder],
    [w * 0.6, h],
    [-w * 0.6, h],
    [-w, h * shoulder],
  ];

  const bedouin = (x: number, z: number, yaw: number) => {
    const T = xf(x, z, yaw);
    const W = 0.34;
    const wallH = 0.11;
    const wallPaint = paint((p) => {
      if (p.y - G < 0.022) return "#7b4a2b";
      const a = Math.atan2(p.x - x, p.z - z) - yaw * DEG;
      const k = Math.floor((a / (Math.PI * 2)) * 16 + 1e-4);
      return ((k % 2) + 2) % 2 ? "#f6e3b8" : "#e9cc92";
    });
    prt(new THREE.BoxGeometry(W, wallH, W), wallPaint, T.p(0, wallH / 2, 0), { quat: T.q });
    prt(new THREE.ConeGeometry(W * 0.5 * Math.SQRT2 * 1.1, 0.27, 4, 1), radial(x, z, yaw, 16, RED, CREAM), T.p(0, wallH + 0.135, 0), {
      quat: T.qq(0, 45, 0),
      flat: true,
    });
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        const c = T.p(sx * 0.187, wallH, sz * 0.187);
        prt(ball(0.014, 6, 4), GOLD, c);
        b.spike(c, v(0, -1, 0), 0.04, 0.008, { color: RED, bone: rootJ });
      }
    b.rod(T.p(0, 0.35, 0), T.p(0, 0.5, 0), 0.006, WOOD_D, { bone: rootJ });
    prt(ball(0.018, 6, 5), GOLD, T.p(0, 0.51, 0));
    b.extrude(
      [
        [0, 0],
        [0.11, 0.022],
        [0, 0.044],
      ],
      { at: T.p(0, 0.455, 0), x: T.d(1, 0, 0), y: [0, 1, 0], thickness: 0.004, color: RED, bone: rootJ },
    );
    // door
    b.extrude(arch(0.05, 0.1, 0.7), {
      at: T.p(0, 0, W / 2 + 0.003),
      x: T.d(1, 0, 0),
      y: [0, 1, 0],
      thickness: 0.006,
      color: DARK,
      bone: rootJ,
    });
    for (const s of [1, -1])
      prt(new THREE.BoxGeometry(0.045, 0.1, 0.006), RED, T.p(s * 0.075, 0.05, W / 2 + 0.008), { quat: T.qq(0, s * 22, 0) });
    // awning
    prt(new THREE.BoxGeometry(0.3, 0.006, 0.13), paint((_p, _n, s) => (Math.floor(s[0] * 8) % 2 ? RED : CREAM)), T.p(0, 0.125, W / 2 + 0.07), {
      quat: T.qq(14, 0, 0),
    });
    for (const s of [1, -1]) b.rod(T.p(s * 0.15, 0, W / 2 + 0.13), T.p(s * 0.15, 0.112, W / 2 + 0.13), 0.005, WOOD_D, { bone: rootJ });
    return T.p(0, 0.5, 0);
  };

  const roundTent = (x: number, z: number, yaw: number) => {
    const T = xf(x, z, yaw);
    const tp = paint((p, n) => {
      if (p.y - G < 0.02) return NAVY;
      const a = Math.atan2(p.x - x, p.z - z);
      const k = Math.floor((a / (Math.PI * 2)) * 12 + 1e-4);
      const odd = ((k % 2) + 2) % 2;
      if (n.y > 0.25) return odd ? TEAL : CREAM;
      return odd ? "#f6e3b8" : "#f0c97a";
    });
    b.lathe(
      [
        [0, 0],
        [0.17, 0],
        [0.17, 0.12],
        [0.225, 0.122],
        [0.012, 0.3],
        [0, 0.3],
      ] as [number, number][],
      { at: T.p(0, 0, 0), bone: rootJ, segments: 12, color: tp },
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      prt(new THREE.ConeGeometry(0.02, 0.04, 4), i % 2 ? GOLD : NAVY, T.p(Math.sin(a) * 0.222, 0.102, Math.cos(a) * 0.222), {
        rotation: [180, 0, 0],
        flat: true,
      });
    }
    b.rod(T.p(0, 0.28, 0), T.p(0, 0.42, 0), 0.005, WOOD_D, { bone: rootJ });
    prt(ball(0.016, 6, 5), GOLD, T.p(0, 0.43, 0));
    b.extrude(
      [
        [0, 0],
        [0.1, 0.02],
        [0, 0.04],
      ],
      { at: T.p(0, 0.385, 0), x: T.d(1, 0, 0), y: [0, 1, 0], thickness: 0.004, color: TEAL, bone: rootJ },
    );
    b.extrude(arch(0.04, 0.095, 0.65), {
      at: T.p(0, 0, 0.176),
      x: T.d(1, 0, 0),
      y: [0, 1, 0],
      thickness: 0.006,
      color: DARK,
      bone: rootJ,
    });
    for (const s of [1, -1]) {
      b.rod(T.p(s * 0.055, 0, 0.182), T.p(s * 0.055, 0.1, 0.182), 0.004, GOLD, { bone: rootJ });
    }
    return T.p(0, 0.43, 0);
  };

  const aframe = (x: number, z: number, yaw: number) => {
    const T = xf(x, z, yaw);
    const mp = paint((_p, _n, s) => (Math.floor((s[0] + 0.14) / 0.035) % 2 ? MUSTARD : "#c97a1e"));
    b.extrude(
      [
        [-0.13, 0],
        [0.13, 0],
        [0, 0.2],
      ],
      { at: T.p(0, 0, 0), x: T.d(1, 0, 0), y: [0, 1, 0], thickness: 0.28, color: mp, bone: rootJ },
    );
    b.extrude(
      [
        [-0.05, 0],
        [0.05, 0],
        [0, 0.11],
      ],
      { at: T.p(0, 0, 0.142), x: T.d(1, 0, 0), y: [0, 1, 0], thickness: 0.006, color: DARK, bone: rootJ },
    );
    b.rod(T.p(0, 0.2, -0.18), T.p(0, 0.2, 0.18), 0.006, WOOD_D, { bone: rootJ });
    prt(ball(0.012, 5, 4), GOLD, T.p(0, 0.2, 0.18));
    prt(ball(0.012, 5, 4), GOLD, T.p(0, 0.2, -0.18));
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        b.rod(T.p(sx * 0.12, 0.02, sz * 0.14), T.p(sx * 0.22, 0.004, sz * 0.23), 0.002, "#d9c9a0", { bone: rootJ });
        b.spike(T.p(sx * 0.22, 0.03, sz * 0.23), T.d(0, -1, 0), 0.04, 0.006, { color: WOOD_D, bone: rootJ });
      }
  };

  const topRed = bedouin(0.55, -0.6, -20);
  roundTent(0.95, 0.3, -70);
  aframe(-1.0, -0.35, 40);

  // carpets
  const carpet = (x: number, z: number, yaw: number, w: number, l: number) => {
    const T = xf(x, z, yaw);
    prt(new THREE.BoxGeometry(w, 0.008, l), "#ffffff", T.p(0, 0.004, 0), { quat: T.q, texture: CARPET });
  };
  carpet(0.46, -0.28, -20, 0.3, 0.2);
  carpet(0.62, 0.3, -70, 0.26, 0.18);
  carpet(-0.78, -0.06, 40, 0.22, 0.15);

  // bunting from red tent pole to palm p3
  {
    const A = topRed.clone().add(v(0, -0.02, 0));
    const B = palms.p3.clone().add(v(0.02, -0.1, 0.02));
    const mid = A.clone().lerp(B, 0.5).add(v(0, -0.09, 0));
    const path = catmull([A, mid, B]);
    b.sweep(path, 0.0025, { color: WOOD_D, sides: 5, bone: rootJ });
    const cols = [RED, GOLD, TEAL, PINK, NAVY];
    let ci = 0;
    b.along(path, 10, (at) => {
      const c = at.at.clone().add(v(0, -0.026, 0));
      prt(new THREE.ConeGeometry(0.022, 0.05, 3), cols[ci++ % cols.length], c, { rotation: [180, 0, 0], flat: true });
    });
  }

  // ---------------------------------------------------------------- campfire
  {
    const FX = 0.35;
    const FZ = 0.3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const s = 0.017 + R() * 0.008;
      prt(new THREE.IcosahedronGeometry(1, 0), i % 2 ? ROCK2 : ROCK1, v(FX + Math.cos(a) * 0.065, G + 0.01, FZ + Math.sin(a) * 0.065), {
        scale: [s, s * 0.8, s],
        rotation: [R() * 50, R() * 360, 0],
        flat: true,
      });
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI + 0.3;
      prt(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 6), i % 2 ? WOOD_D : "#5a3a22", v(FX, G + 0.012 + i * 0.006, FZ), {
        dir: [Math.cos(a), 0.15, Math.sin(a)],
      });
    }
    glow(prt(new THREE.ConeGeometry(0.03, 0.08, 5), "#e8431e", v(FX, G + 0.065, FZ), { flat: true }), 1.4);
    glow(prt(new THREE.ConeGeometry(0.022, 0.07, 5), "#ff8c1a", v(FX + 0.004, G + 0.06, FZ), { flat: true }), 1.5);
    glow(prt(new THREE.ConeGeometry(0.013, 0.05, 5), "#ffd54a", v(FX, G + 0.05, FZ + 0.003), { flat: true }), 1.6);
    for (let i = 0; i < 4; i++) {
      glow(prt(new THREE.BoxGeometry(0.006, 0.006, 0.006), "#ffb347", v(FX + (R() - 0.5) * 0.08, G + 0.13 + R() * 0.07, FZ + (R() - 0.5) * 0.08), {
        rotation: [R() * 90, R() * 90, 0],
      }), 1.6);
    }
    const apex = v(FX, G + 0.22, FZ);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.6;
      b.rod(v(FX + Math.cos(a) * 0.11, G, FZ + Math.sin(a) * 0.11), apex, 0.004, WOOD_D, { bone: rootJ });
    }
    b.rod(apex, v(FX, G + 0.15, FZ), 0.0025, IRON, { bone: rootJ });
    prt(new THREE.SphereGeometry(0.036, 8, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), IRON, v(FX, G + 0.155, FZ), { flat: true });
    prt(new THREE.CylinderGeometry(0.036, 0.036, 0.006, 8), "#2e2e36", v(FX, G + 0.156, FZ));
  }

  // ---------------------------------------------------------------- props
  const barrel = (x: number, z: number) => {
    prt(new THREE.CylinderGeometry(0.035, 0.032, 0.08, 9), WOOD, v(x, G + 0.04, z));
    for (const y of [0.018, 0.062]) prt(new THREE.TorusGeometry(0.036, 0.004, 3, 9), IRON, v(x, G + y, z), { rotation: [90, 0, 0] });
  };
  const crate = (x: number, z: number, yaw: number, s: number) => {
    const T = xf(x, z, yaw, s);
    prt(new THREE.BoxGeometry(0.07, 0.06, 0.07), WOOD_L, T.p(0, 0.03, 0), { quat: T.q });
    prt(new THREE.BoxGeometry(0.074, 0.008, 0.012), WOOD_D, T.p(0, 0.062, 0.02), { quat: T.q });
    prt(new THREE.BoxGeometry(0.074, 0.008, 0.012), WOOD_D, T.p(0, 0.062, -0.02), { quat: T.q });
  };
  const sack = (x: number, z: number, s: number) => {
    prt(ball(1, 8, 6), "#d8c49a", v(x, G + 0.028 * s, z), { scale: [0.035 * s, 0.03 * s, 0.032 * s], flat: true });
    prt(new THREE.ConeGeometry(0.014 * s, 0.025 * s, 5), "#d8c49a", v(x, G + 0.065 * s, z));
    prt(new THREE.TorusGeometry(0.01 * s, 0.003 * s, 3, 6), RED, v(x, G + 0.056 * s, z), { rotation: [90, 0, 0] });
  };
  const jar = (x: number, z: number, s: number) => {
    b.lathe(
      [
        [0, 0],
        [0.02 * s, 0],
        [0.04 * s, 0.04 * s],
        [0.045 * s, 0.07 * s],
        [0.03 * s, 0.1 * s],
        [0.018 * s, 0.12 * s],
        [0.025 * s, 0.135 * s],
        [0, 0.135 * s],
      ] as [number, number][],
      {
        at: v(x, G, z),
        bone: rootJ,
        segments: 9,
        smoothing: 1,
        color: paint((p) => (Math.floor((p.y - G) / (0.013 * s)) % 4 === 0 ? "#7b3b24" : TERRA)),
      },
    );
  };
  barrel(0.78, -0.28);
  barrel(0.86, -0.22);
  crate(0.84, -0.4, 20, 1);
  crate(0.8, -0.38, 50, 0.7);
  sack(0.3, -0.05, 1);
  sack(0.36, -0.02, 0.8);
  jar(1.02, 0.64, 1);
  jar(1.1, 0.58, 0.7);
  jar(-0.9, 0.06, 0.9);
  sack(-1.0, 0.0, 0.9);
  crate(-1.15, -0.52, -10, 1);

  // stepping stones
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = 0.28 - t * 0.35 + (R() - 0.5) * 0.04;
    const z = 0.22 - t * 0.12 + (R() - 0.5) * 0.04;
    prt(new THREE.CylinderGeometry(0.03, 0.034, 0.012, 6), "#dcb98a", v(x, G + 0.006, z), { rotation: [0, R() * 60, 0] });
  }

  // cacti
  const cactus = (x: number, z: number, h: number, flower: boolean) => {
    b.capsule(v(x, G, z), v(x, G + h, z), 0.032, { color: "#4f9a50", bone: rootJ, sides: 8 });
    b.sweep(catmull([v(x + 0.02, G + h * 0.4, z), v(x + 0.085, G + h * 0.42, z), v(x + 0.1, G + h * 0.62, z)]), 0.02, {
      color: "#58a65a",
      bone: rootJ,
      sides: 8,
    });
    b.sweep(catmull([v(x - 0.02, G + h * 0.3, z), v(x - 0.07, G + h * 0.32, z), v(x - 0.08, G + h * 0.46, z)]), 0.018, {
      color: "#58a65a",
      bone: rootJ,
      sides: 8,
    });
    if (flower) prt(ball(0.014, 5, 4), PINK, v(x, G + h + 0.03, z));
  };
  cactus(-1.15, -0.8, 0.2, true);
  cactus(1.1, 0.75, 0.15, false);

  // dry bushes
  for (const [bx, bz] of [
    [1.2, -0.05],
    [-0.45, -0.85],
    [0.2, 0.75],
  ] as [number, number][]) {
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      b.spike(v(bx, G, bz), v(Math.sin(a) * 0.7, 1, Math.cos(a) * 0.7), 0.07 + R() * 0.03, 0.01, { color: k % 2 ? "#8a7a3a" : "#a39447", bone: rootJ });
    }
  }

  // ---------------------------------------------------------------- camels
  type CamelOpts = {
    id: string;
    x: number;
    z: number;
    yaw: number;
    S: number;
    coat: string;
    coatD: string;
    belly: string;
    humps: 1 | 2;
    cap?: [string, string, string];
    pack?: boolean;
    baby?: boolean;
  };

  const camel = (o: CamelOpts) => {
    const { id, S } = o;
    const T = xf(o.x, o.z, o.yaw, S);
    const p = T.p;
    const d = T.d;
    const BY = 0.26;
    const rr = (arr: number[]) => arr.map((a) => a * S);
    const coatPaint = countershade(mottle(o.coat, o.coatD, { size: 0.06 * S + 0.02, seed: 4 }), o.belly, {
      level: -0.4,
      soft: 0.3,
    });

    // skeleton: spine
    const spine = b.chain(
      `spine_${id}`,
      catmull([p(0, BY - 0.005, -0.19), p(0, BY, -0.06), p(0, BY + 0.005, 0.07), p(0, BY + 0.01, 0.19)]),
      { parent: rootJ, names: [`hips_${id}`, `spine2_${id}`, `chest_${id}`], role: "spine" },
    );
    const hipsJ = spine.joints[0];
    const midJ = spine.joints[1];
    const chestJ = spine.joints[2];

    const neck = b.chain(
      `neck_${id}`,
      catmull([p(0, BY + 0.01, 0.19), p(0, BY + 0.07, 0.245), p(0, BY + 0.15, 0.265), p(0, 0.485, 0.3)]),
      { parent: chestJ, names: [`neck1_${id}`, `neck2_${id}`, `neck3_${id}`], role: "neck" },
    );
    const head = b.joint(`head_${id}`, { parent: neck, at: p(0, 0.485, 0.3), dir: d(0, -0.12, 1), role: "head" });
    const jaw = b.joint(`jaw_${id}`, { parent: head, at: p(0, 0.465, 0.335), dir: d(0, -0.15, 1), role: "jaw" });

    // torso
    const RX = [0.06, 0.082, 0.088, 0.082, 0.066];
    const RY = [0.07, 0.09, 0.095, 0.1, 0.088];
    const torso = b.sweep(spine, (t: number): [number, number] => [key(RX, t) * S, key(RY, t) * S], {
      color: coatPaint,
      shift: [0, -0.012 * S],
    });
    const neckS = b.sweep(neck, rr([0.064, 0.052, 0.04, 0.033]), { color: coatPaint });
    b.along(neckS, 4, (at) => b.spike(at, at, 0.02 * S, 0.01 * S, { color: o.coatD }));

    // humps
    const humps =
      o.humps === 1
        ? [[0, BY + 0.07, 0.02, 1]]
        : [
            [0, BY + 0.066, -0.09, 0.95],
            [0, BY + 0.064, 0.09, 0.9],
          ];
    for (const [hx, hy, hz, k] of humps) {
      b.part(ball(1, 8, 6), coatPaint, {
        bone: midJ,
        at: p(hx, hy, hz),
        scale: [0.062 * k * S, 0.08 * k * S, 0.07 * k * S],
        flat: true,
      });
    }
    if (o.cap) {
      const c = o.cap;
      const capPaint = paint((_p, _n, s) => {
        const k = Math.floor(s[1] * 8);
        const m = ((k % 4) + 4) % 4;
        return m === 0 ? c[1] : m === 2 ? c[2] : c[0];
      });
      b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.58), capPaint, {
        bone: midJ,
        at: p(0, BY + 0.073, 0.02),
        scale: [0.07 * S, 0.088 * S, 0.08 * S],
        flat: true,
      });
      b.part(ball(0.014 * S, 6, 5), c[1], { bone: midJ, at: p(0, BY + 0.16, 0.02) });
      for (const a of [0, 35, -35, 145, 180, -145]) {
        const ar = a * DEG;
        const tp = p(Math.sin(ar) * 0.066, BY + 0.055, 0.02 + Math.cos(ar) * 0.078);
        b.spike(tp, v(0, -1, 0), 0.04 * S, 0.007 * S, { color: c[1], bone: midJ });
      }
    }

    // girth strap
    const skin = b.surface(torso);
    const strap = skin.loop(p(0, BY, o.humps === 1 ? 0.09 : 0.0), { dir: d(0, 0, 1), lift: 0.004 * S });
    b.sweep(strap, 0.006 * S, { color: o.cap ? o.cap[0] : RED, sides: 5 });

    // pack gear
    if (o.pack) {
      b.part(new THREE.CylinderGeometry(0.025 * S, 0.025 * S, 0.19 * S, 8), NAVY, { bone: midJ, at: p(0, BY + 0.105, 0.0), quat: T.qq(0, 0, 90) });
      b.part(new THREE.CylinderGeometry(0.027 * S, 0.027 * S, 0.012 * S, 8), GOLD, { bone: midJ, at: p(0.09, BY + 0.105, 0), quat: T.qq(0, 0, 90) });
      b.part(new THREE.CylinderGeometry(0.027 * S, 0.027 * S, 0.012 * S, 8), GOLD, { bone: midJ, at: p(-0.09, BY + 0.105, 0), quat: T.qq(0, 0, 90) });
      for (const s of [1, -1]) {
        b.part(new THREE.CylinderGeometry(0.04 * S, 0.032 * S, 0.07 * S, 8), WOOD_L, { bone: midJ, at: p(s * 0.105, BY - 0.02, 0) , quat: T.q});
        b.part(ball(1, 7, 4), RED, { bone: midJ, at: p(s * 0.105, BY + 0.017, 0), scale: [0.042 * S, 0.016 * S, 0.042 * S] });
        b.rod(p(s * 0.09, BY + 0.095, 0), p(s * 0.105, BY + 0.01, 0), 0.003 * S, WOOD_D, { bone: midJ });
      }
    }

    // tail
    const tail = b.chain(
      `tail_${id}`,
      catmull([p(0, BY + 0.005, -0.2), p(0, BY - 0.02, -0.25), p(0, BY - 0.07, -0.27), p(0, BY - 0.13, -0.275)]),
      { parent: hipsJ, names: [`tail1_${id}`, `tail2_${id}`, `tail3_${id}`], role: "tail" },
    );
    b.sweep(tail, rr([0.016, 0.012, 0.009, 0.007]), { color: o.coat });
    b.spike(p(0, BY - 0.12, -0.275), d(0, -1, -0.1), 0.05 * S, 0.016 * S, { color: o.coatD, bone: tail.joints[2] });

    // legs
    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const fr = limb(p(s * 0.076, 0.245, 0.15), p(s * 0.076, 0.02, 0.165), [0.1 * S, 0.1 * S, 0.06 * S], [d(0, 0, -1), d(0, 0, 1)]);
      const fl = b.chain(`legF${sd}_${id}`, fr, {
        parent: chestJ,
        names: [`shoulder${sd}_${id}`, `elbow${sd}_${id}`, `knee${sd}_${id}`, `hoof${sd}_${id}`],
        role: "leg",
      });
      b.sweep(fl, rr([0.044, 0.034, 0.025, 0.019, 0.018, 0.019]), { color: coatPaint });
      b.part(ball(0.021 * S, 6, 4), o.coatD, { bone: fl.joints[2], at: fr[2] });
      const hr = limb(p(s * 0.074, 0.25, -0.15), p(s * 0.074, 0.02, -0.15), [0.11 * S, 0.11 * S, 0.07 * S], [d(0, 0, 1), d(0, 0, -1)]);
      const hl = b.chain(`legH${sd}_${id}`, hr, {
        parent: hipsJ,
        names: [`hip${sd}_${id}`, `stifle${sd}_${id}`, `hock${sd}_${id}`, `hoofH${sd}_${id}`],
        role: "leg",
      });
      b.sweep(hl, rr([0.052, 0.038, 0.027, 0.019, 0.018, 0.019]), { color: coatPaint });
      b.part(ball(0.02 * S, 6, 4), o.coatD, { bone: hl.joints[2], at: hr[2] });
      for (const [ch, pts, zOff] of [
        [fl, fr, 0.01],
        [hl, hr, 0.01],
      ] as [typeof fl, THREE.Vector3[], number][]) {
        const foot = pts[3];
        b.part(ball(1, 8, 5), "#8a6a4a", {
          bone: ch.joints[3],
          at: foot.clone().add(v(0, -0.004 * S, 0)).add(d(0, 0, zOff * S)),
          scale: [0.03 * S, 0.016 * S, 0.04 * S],
          quat: T.q,
        });
      }
    }

    // head
    b.capsule(p(0, 0.488, 0.31), p(0, 0.472, 0.37), [0.032 * S, 0.026 * S], { bone: head, color: o.coat });
    b.capsule(p(0, 0.468, 0.365), p(0, 0.452, 0.415), [0.026 * S, 0.022 * S], { bone: head, color: o.coat });
    b.part(ball(0.021 * S, 7, 5), o.belly, { bone: head, at: p(0, 0.452, 0.418), scale: [1.1, 0.85, 1.2] });
    b.capsule(p(0, 0.458, 0.335), p(0, 0.443, 0.4), [0.019 * S, 0.014 * S], { bone: jaw, color: o.coat });
    b.spike(p(0, 0.445, 0.35), d(0, -1, 0.2), 0.04 * S, 0.012 * S, { color: o.coatD, bone: jaw });
    b.spike(p(0, 0.505, 0.325), d(0, 1, 0.5), 0.03 * S, 0.012 * S, { color: o.coatD, bone: head });
    b.part(new THREE.TorusGeometry(0.03 * S, 0.004 * S, 4, 8), RED, { bone: head, at: p(0, 0.462, 0.385), dir: d(0, -0.2, 1), axis: "z" });
    for (const s of [1, -1]) {
      b.part(ball(0.005 * S, 4, 3), BLACK, { bone: head, at: p(s * 0.012, 0.458, 0.433) });
      const eye = b.part(ball(0.011 * S, 6, 5), BLACK, { bone: head, at: p(s * 0.031, 0.498, 0.345), dir: d(s, 0.15, 0.35) });
      b.part(ball(0.004 * S, 4, 3), "#ffffff", { bone: head, at: p(s * 0.0395, 0.5, 0.349) });
      b.ring(eye, { count: 5, radius: 0.011 * S, fromDeg: -70, toDeg: 70 }, (lash) =>
        b.spike(lash, lash, 0.016 * S, 0.0022 * S, { color: BLACK }),
      );
      b.spike(p(s * 0.028, 0.515, 0.3), d(s * 0.6, 1, -0.3), 0.04 * S, 0.014 * S, { bone: head, color: o.coat });
      b.spike(p(s * 0.028, 0.517, 0.306), d(s * 0.6, 1, -0.3), 0.03 * S, 0.008 * S, { bone: head, color: "#e9a58c" });
    }

    // baby extras
    if (o.baby) {
      b.part(new THREE.TorusGeometry(0.04 * S, 0.006 * S, 4, 8), PINK, { bone: neck.joints[1], at: p(0, BY + 0.11, 0.255), dir: d(0, 1, 0.5), axis: "z" });
      b.part(ball(0.012 * S, 6, 5), GOLD, { bone: neck.joints[1], at: p(0, BY + 0.095, 0.3) });
    }
  };

  camel({ id: "A", x: -0.6, z: 0.85, yaw: -25, S: 1, coat: "#c99a5b", coatD: "#a97a42", belly: "#e0bf8a", humps: 1, cap: [RED, GOLD, NAVY] });
  camel({ id: "B", x: 0.15, z: 0.98, yaw: 12, S: 1.05, coat: "#e8cfa0", coatD: "#c4a574", belly: "#f6e6c4", humps: 2, pack: true });
  camel({ id: "C", x: 0.65, z: 0.8, yaw: -50, S: 0.6, coat: "#8a5d38", coatD: "#6a4326", belly: "#b58a5c", humps: 1, baby: true });

  return b.root;
}
