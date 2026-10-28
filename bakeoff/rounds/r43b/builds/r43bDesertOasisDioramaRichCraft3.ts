import * as THREE from "three";
import { createBuilder, frame, rng, catmull, polyline, svg, paint, mottle, stripes, countershade } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A low-poly whimsical oasis: a round sand plinth with a pond, leaning palms, striped tents, a campfire and three camels in blankets.",
};

const G = 0.3; // ground top height
const Y = new THREE.Vector3(0, 1, 0);
const X = new THREE.Vector3(1, 0, 0);

// ---------- textures ----------
const TUFT = svg(
  `<svg viewBox="0 0 32 48"><path d="M4 48 Q6 24 2 6 Q12 22 14 48Z" fill="#4faa4a"/><path d="M12 48 Q14 20 16 2 Q22 22 22 48Z" fill="#7bd05a"/><path d="M20 48 Q26 28 30 10 Q32 30 28 48Z" fill="#3c8f45"/></svg>`,
  { size: 96 },
);
const RUG = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#b8323a"/><rect x="3" y="3" width="58" height="34" fill="none" stroke="#f3d27a" stroke-width="2"/><path d="M32 6 L50 20 L32 34 L14 20Z" fill="#2a4f9c" stroke="#f3d27a" stroke-width="2"/><path d="M32 12 L42 20 L32 28 L22 20Z" fill="#f3d27a"/><g fill="#f3d27a"><rect x="0" y="0" width="64" height="2"/><rect x="0" y="38" width="64" height="2"/></g></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="12" fill="#ffd24a" stroke="#7a3b10" stroke-width="3"/><g stroke="#ffd24a" stroke-width="4" stroke-linecap="round"><path d="M32 4V14M32 50V60M4 32H14M50 32H60M12 12L19 19M45 45L52 52M52 12L45 19M19 45L12 52"/></g></svg>`,
  { size: 128 },
);
const DOOR = svg(
  `<svg viewBox="0 0 40 56"><path d="M2 56 L8 8 Q20 -2 32 8 L38 56Z" fill="#3a1e14" stroke="#f3d27a" stroke-width="3"/><path d="M20 6 L20 56" stroke="#6b3a20" stroke-width="2"/><path d="M8 20 L14 22 M32 20 L26 22 M7 34 L13 35 M33 34 L27 35" stroke="#f3d27a" stroke-width="2.5"/></svg>`,
  { size: 128 },
);
const BLANKET = svg(
  `<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#c23b4a"/><path d="M0 12 L12 0 L24 12 L36 0 L48 12 M0 30 L12 18 L24 30 L36 18 L48 30 M0 48 L12 36 L24 48 L36 36 L48 48" fill="none" stroke="#f6d06a" stroke-width="4"/><rect y="42" width="48" height="6" fill="#2a5a9c"/></svg>`,
  { size: 96 },
);
const PAD = svg(
  `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#3fa05a" stroke="#2a7a44" stroke-width="2"/><path d="M24 24 L40 12" stroke="#1d5c34" stroke-width="4"/><circle cx="24" cy="24" r="4" fill="#f7a6c8"/></svg>`,
  { size: 64 },
);

// ---------- paints ----------
const SAND = mottle("#f2d08c", "#e6bb6c", { size: 0.4, seed: 3 });
const STRATA = stripes("#dcae62", "#b9823f", { size: 0.07, axis: "y", width: 0.4, wobble: 0.3 });
const GROUND = paint((_p, n) => (n.y > 0.6 ? SAND : STRATA));
const WATER = mottle("#43d4d8", "#1f93bd", { size: 0.22, seed: 2 });
const WETSAND = mottle("#c9a063", "#b48a4e", { size: 0.2 });
const COAT = countershade(mottle("#cf9c5c", "#bb8648", { size: 0.3, seed: 8 }), "#ecd09a", { level: -0.25 });
const STONE = mottle("#9a8f86", "#74695f", { size: 0.08, seed: 4 });
const TRUNK = stripes("#8a5a32", "#5e3a1e", { size: 0.1, axis: "y", width: 0.35, wobble: 0.1 });

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const R = rng(11);

  const SP = new THREE.SphereGeometry(1, 10, 8);
  const BX = new THREE.BoxGeometry(1, 1, 1);
  const CYL = new THREE.CylinderGeometry(1, 1, 1, 20);
  const ball = (geo: THREE.BufferGeometry, color: any, at: number[], scale: number[], extra: any = {}) =>
    b.part(geo, color, { at, scale, ...extra });

  // ---------- plinth & dunes ----------
  b.lathe(
    [[0, 0], [3.1, 0], [3.12, 0.12], [3.02, G], [0, G]],
    { at: [0, 0, 0], segments: 28, color: GROUND },
  );
  const dunes: [number, number, number[]][] = [
    [0.5, -2.45, [1.1, 0.34, 0.6]],
    [-2.3, 0.3, [0.6, 0.3, 0.9]],
    [2.4, 0.9, [0.55, 0.28, 0.8]],
    [-0.8, 2.3, [1.0, 0.3, 0.5]],
    [2.0, -2.0, [0.7, 0.26, 0.5]],
  ];
  for (const [x, z, sc] of dunes) ball(new THREE.SphereGeometry(1, 12, 6), SAND, [x, G - 0.02, z], sc);

  // ---------- pond ----------
  const PC = [-0.2, 0.5];
  ball(CYL, WETSAND, [PC[0], G + 0.004, PC[1]], [1.1, 0.01, 0.82]);
  ball(CYL, WATER, [PC[0], G + 0.012, PC[1]], [0.93, 0.02, 0.67]);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const k = 0.9 + R() * 0.25;
    const sz = 0.07 + R() * 0.07;
    ball(new THREE.DodecahedronGeometry(1, 0), STONE, [PC[0] + 1.02 * Math.cos(a), G + sz * 0.3, PC[1] + 0.76 * Math.sin(a)], [sz * k, sz * 0.7, sz], {
      rotation: [0, R() * 180, 0],
      flat: true,
    });
  }
  const pads: [number, number, number][] = [[-0.4, 0.4, 0.12], [0.1, 0.7, 0.1], [-0.1, 0.2, 0.08]];
  for (const [x, z, r] of pads)
    b.part(new THREE.CircleGeometry(r, 10), "#ffffff", { at: [x, G + 0.03, z], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: PAD });
  // grass tufts around the pond
  const frames: any[] = [];
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const k = 1.15 + R() * 0.25;
    frames.push(frame([PC[0] + 0.9 * k * Math.cos(a), G, PC[1] + 0.67 * k * Math.sin(a)], [0, 1, 0]));
  }
  b.cards(frames, TUFT, { size: [0.14, 0.2], cross: true, vary: 0.35, rng: rng(9), spin: 180 });

  // ---------- palms ----------
  const FR1 = ["#3fa34d", "#369a48"];
  const FR2 = ["#2f8a47", "#2a7e42"];
  function palm(x: number, z: number, h: number, lean: number[]) {
    const top = [x + lean[0], G + h, z + lean[1]];
    const mid = [x + lean[0] * 0.3, G + h * 0.55, z + lean[1] * 0.3];
    b.sweep(catmull([[x, G - 0.02, z], mid, top]), [0.12, 0.065], { color: TRUNK, sides: 7 });
    ball(SP, "#6b4426", [x, G + 0.03, z], [0.15, 0.07, 0.15]);
    ball(SP, "#7fbf4a", top, [0.13, 0.1, 0.13]);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.5;
      ball(SP, "#6a3f1e", [top[0] + 0.09 * Math.cos(a), top[1] - 0.1, top[2] + 0.09 * Math.sin(a)], [0.06, 0.07, 0.06]);
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + R() * 0.3;
      const d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      const t = [-Math.sin(a), 0, Math.cos(a)];
      const L = 0.55 + R() * 0.15;
      const up1 = 0.4 + R() * 0.15;
      const x1 = d.clone().multiplyScalar(Math.cos(up1)).addScaledVector(Y, Math.sin(up1));
      const e = new THREE.Vector3(...top).addScaledVector(x1, L);
      const w = 0.15;
      const col1 = FR1[i % 2];
      const col2 = FR2[i % 2];
      b.extrude(
        [[0, -w * 0.3], [L * 0.4, -w], [L, -w * 0.75], [L, w * 0.75], [L * 0.4, w], [0, w * 0.3]] as any,
        { at: top, x: x1.toArray(), y: t, thickness: 0.018, color: col1 },
      );
      const dn = -0.5 - R() * 0.2;
      const x2 = d.clone().multiplyScalar(Math.cos(dn)).addScaledVector(Y, Math.sin(dn));
      b.extrude(
        [[0, -w * 0.75], [L * 0.2, -w * 0.9], [L * 0.35, -w * 0.55], [L * 0.55, -w * 0.7], [L * 0.75, -w * 0.3], [L, 0, "sharp"], [L * 0.75, w * 0.3], [L * 0.55, w * 0.7], [L * 0.35, w * 0.55], [L * 0.2, w * 0.9], [0, w * 0.75]] as any,
        { at: e.toArray(), x: x2.toArray(), y: t, thickness: 0.018, color: col2 },
      );
    }
  }
  palm(-1.3, 0.3, 1.9, [0.3, 0.15]);
  palm(-1.0, 1.35, 1.5, [0.25, -0.2]);
  palm(0.5, 1.45, 1.7, [-0.25, -0.2]);
  palm(0.7, -0.1, 1.2, [-0.15, 0.2]);

  // ---------- tents ----------
  function tentPaint(cx: number, cz: number, c1: string, c2: string, n: number) {
    return paint((p) => {
      const a = Math.atan2(p.x - cx, p.z - cz);
      return Math.floor(((a + Math.PI) / (Math.PI * 2)) * n) % 2 ? c1 : c2;
    });
  }
  // A: big pyramid tent
  {
    const [x, z, r, h] = [1.9, -0.6, 0.8, 1.0];
    const tent = b.part(new THREE.ConeGeometry(r, h, 4, 1), tentPaint(x, z, "#e8584a", "#f7ead0", 8), {
      at: [x, G + h / 2, z],
      rotation: [0, 45, 0],
      flat: true,
    });
    const faceZ = (y: number) => z + 0.707 * r * (1 - (y - G) / h);
    b.decal(tent, DOOR, { at: [x, G + 0.28, faceZ(G + 0.28)], dir: [0, 0.45, 1], size: [0.34, 0.46] });
    b.decal(tent, EMBLEM, { at: [x, G + 0.68, faceZ(G + 0.68)], dir: [0, 0.45, 1], size: [0.18, 0.18] });
    b.rod([x, G + h, z], [x, G + h + 0.28, z], 0.015, "#6b4426");
    ball(SP, "#f2c14e", [x, G + h + 0.3, z], [0.04, 0.04, 0.04]);
    b.extrude([[0, 0], [0.26, 0.06], [0, 0.12]], { at: [x, G + h + 0.14, z], x: [1, 0, 0], thickness: 0.01, color: "#d93a4a" });
    b.part(new THREE.PlaneGeometry(0.7, 0.44), "#ffffff", { at: [x + 0.1, G + 0.012, z + 0.95], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: RUG });
    for (const s of [1, -1]) {
      ball(BX, "#6b4426", [x + s * 0.8, G + 0.05, z + 0.62], [0.04, 0.12, 0.04]);
      b.rod([x + s * 0.8, G + 0.1, z + 0.62], [x + s * 0.35, G + 0.5, z + 0.35], 0.006, "#e9d9b0");
    }
  }
  // B: round tent
  {
    const [x, z] = [1.45, 1.35];
    ball(new THREE.CylinderGeometry(1, 1, 1, 12), tentPaint(x, z, "#3b79c4", "#f7ead0", 12), [x, G + 0.22, z], [0.55, 0.44, 0.55], { flat: true });
    const roof = b.part(new THREE.ConeGeometry(0.68, 0.5, 12), tentPaint(x, z, "#3b79c4", "#f7ead0", 12), { at: [x, G + 0.69, z], flat: true });
    b.decal(roof, EMBLEM, { at: [x - 0.1, G + 0.62, z + 0.3], dir: [-0.2, 0.55, 1], size: [0.2, 0.2] });
    b.decal(b.surface(roof), DOOR, { at: [x - 0.1, G + 0.22, z + 0.56], dir: [-0.15, 0, 1], size: [0.26, 0.36] });
    ball(SP, "#f2c14e", [x, G + 0.96, z], [0.05, 0.05, 0.05]);
    b.rod([x, G + 0.9, z], [x, G + 1.12, z], 0.012, "#6b4426");
    b.extrude([[0, 0], [0.2, 0.05], [0, 0.1]], { at: [x, G + 1.0, z], x: [-1, 0, 0], thickness: 0.01, color: "#f2c14e" });
  }

  // ---------- campfire ----------
  {
    const [x, z] = [0.95, -1.15];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ball(new THREE.DodecahedronGeometry(1, 0), STONE, [x + 0.2 * Math.cos(a), G + 0.03, z + 0.2 * Math.sin(a)], [0.06, 0.05, 0.06], { flat: true });
    }
    b.rod([x - 0.14, G + 0.04, z - 0.1], [x + 0.14, G + 0.1, z + 0.1], 0.025, "#5a3418");
    b.rod([x - 0.14, G + 0.1, z + 0.1], [x + 0.14, G + 0.04, z - 0.1], 0.025, "#4a2a14");
    glow(b.part(new THREE.ConeGeometry(0.1, 0.28, 6), "#ff8a2a", { at: [x, G + 0.2, z] }), 1.6);
    glow(b.part(new THREE.ConeGeometry(0.06, 0.2, 6), "#ffd84a", { at: [x, G + 0.17, z] }), 2);
  }

  // ---------- cactus ----------
  {
    const [x, z] = [-2.0, 1.5];
    const CAC = stripes("#4f9d4a", "#3b7d3c", { size: 0.04, axis: "y", width: 0.3 });
    b.sweep(polyline([[x, G - 0.02, z], [x, G + 0.38, z]]), 0.06, { color: CAC, sides: 8 });
    b.sweep(polyline([[x + 0.05, G + 0.2, z], [x + 0.17, G + 0.2, z], [x + 0.17, G + 0.34, z]]), 0.03, { color: CAC, sides: 6 });
    ball(SP, "#f7a6c8", [x, G + 0.45, z], [0.03, 0.03, 0.03]);
  }

  // ---------- camels ----------
  function camel(ox: number, oz: number, rot: number, s: number) {
    const q = new THREE.Quaternion().setFromAxisAngle(Y, rot);
    const T = (x: number, y: number, z: number) =>
      new THREE.Vector3(x, y, z).multiplyScalar(s).applyQuaternion(q).add(new THREE.Vector3(ox, G, oz));
    const part = (geo: THREE.BufferGeometry, col: any, p: number[], sc: number[], tilt = 0, tex?: any) =>
      b.part(geo, col, {
        at: T(p[0], p[1], p[2]),
        quat: q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X, tilt)),
        scale: [sc[0] * s, sc[1] * s, sc[2] * s],
        texture: tex,
      });
    const tube = (pts: number[][], radii: number[], col: any) =>
      b.sweep(polyline(pts.map((p) => T(p[0], p[1], p[2]))), radii.map((r) => r * s), { color: col, sides: 7 });
    // torso
    part(SP, COAT, [0, 1.15, 0], [0.4, 0.42, 0.88]);
    part(SP, COAT, [0, 1.65, 0.15], [0.25, 0.3, 0.27]);
    part(SP, COAT, [0, 1.12, 0.6], [0.32, 0.36, 0.3]);
    // legs
    for (const sx of [1, -1]) {
      tube([[sx * 0.22, 1.0, 0.5], [sx * 0.22, 0.55, 0.53], [sx * 0.22, 0.1, 0.5]], [0.13, 0.08, 0.06], COAT);
      part(SP, "#4a3624", [sx * 0.22, 0.05, 0.53], [0.1, 0.05, 0.13]);
      tube([[sx * 0.22, 1.0, -0.5], [sx * 0.22, 0.6, -0.62], [sx * 0.22, 0.1, -0.56]], [0.14, 0.08, 0.06], COAT);
      part(SP, "#4a3624", [sx * 0.22, 0.05, -0.53], [0.1, 0.05, 0.13]);
    }
    // neck & head
    tube([[0, 1.3, 0.55], [0, 1.7, 0.85], [0, 2.05, 1.05], [0, 2.25, 1.2]], [0.19, 0.13, 0.1, 0.11], COAT);
    part(SP, COAT, [0, 2.3, 1.3], [0.12, 0.13, 0.2], 0.3);
    part(SP, "#e9cf9c", [0, 2.2, 1.5], [0.095, 0.085, 0.14], 0.3);
    part(BX, "#d9b783", [0, 2.12, 1.48], [0.14, 0.04, 0.24], 0.2); // lower jaw
    part(SP, "#3a2a1c", [0, 2.25, 1.62], [0.05, 0.035, 0.03]);
    for (const sx of [1, -1]) {
      part(SP, "#ffffff", [sx * 0.105, 2.35, 1.38], [0.035, 0.04, 0.035]);
      part(SP, "#1a1410", [sx * 0.12, 2.35, 1.405], [0.02, 0.028, 0.02]);
      part(SP, "#a8763d", [sx * 0.1, 2.46, 1.2], [0.03, 0.07, 0.025], sx * 0.3);
      part(SP, "#f7a6c8", [sx * 0.1, 2.455, 1.215], [0.015, 0.045, 0.012], sx * 0.3);
    }
    // tail
    tube([[0, 1.4, -0.82], [0, 1.1, -1.0], [0, 0.8, -0.98]], [0.05, 0.035, 0.025], COAT);
    part(SP, "#7a5230", [0, 0.72, -0.98], [0.05, 0.1, 0.05]);
    // blanket & saddle bags
    part(BX, "#ffffff", [0, 1.53, -0.32], [0.82, 0.06, 0.55], 0, BLANKET);
    for (const sx of [1, -1]) {
      part(BX, "#ffffff", [sx * 0.4, 1.28, -0.32], [0.05, 0.42, 0.52], 0, BLANKET);
      part(BX, "#7a4a28", [sx * 0.46, 1.0, -0.32], [0.1, 0.24, 0.3]);
    }
    // bridle
    part(BX, "#c23b4a", [0, 2.21, 1.47], [0.2, 0.03, 0.03], 0.3);
  }
  camel(-1.9, -0.7, 0.96, 0.55);
  camel(-0.3, -1.85, -0.5, 0.55);
  camel(-1.35, -1.55, 0.3, 0.3);

  return b.root;
}
