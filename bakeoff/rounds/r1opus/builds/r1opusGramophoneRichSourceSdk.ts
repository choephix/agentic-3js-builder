import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, bezier, catmull } from "../../../../src/index";
import type { Contour, Rgb } from "../../../../src/index";

export const meta = {
  name: "Antique Morning-Glory Gramophone",
  description:
    "A carved walnut gramophone cabinet with pale floral marquetry, brass ball-and-claw feet, a black record with a red label, a silver tonearm and soundbox, a side wind-up crank and a huge ten-petal morning-glory brass horn with a green verdigris patina.",
};

const DEG = Math.PI / 180;

// Palette
const WA = "#6e3f22";
const WB = "#4a2715";
const WD = "#2f170b";
const PALE = "#ecdcb0";
const EBONY = "#24140b";
const LEAF = "#8fa35b";
const BERRY = "#a3462f";
const SILVER = "#c9ced6";
const BRASS = "#c4943f";
const BRASS_BRIGHT = "#e0b55a";
const GOLD = "#e6c068";
const LABEL_RED = "#b51f2a";

const tmp = new THREE.Vector3();

/** Walnut grain: horizontal streaks with darker burl clouds. */
function woodRgb(p: THREE.Vector3, n: THREE.Vector3): Rgb {
  if (Math.abs(n.y) > 0.7) tmp.set(p.x * 0.3, p.y, p.z * 3.5);
  else if (Math.abs(n.x) > 0.7) tmp.set(p.x, p.y * 3.5, p.z * 0.3);
  else tmp.set(p.x * 0.3, p.y * 3.5, p.z);
  const w = noise(tmp, 0.05, 3);
  const band = 0.5 + 0.5 * Math.sin(w * 34);
  const c = mix(WA, WB, smoothstep(0.25, 0.95, band));
  const burl = noise(p, 0.09, 11);
  return mix(c, WD, smoothstep(0.62, 0.85, burl) * 0.5);
}

/** Marquetry panel: 0 wood, 1 pale holly, 2 ebony, 3 green leaf, 4 berry. x, y in meters from the panel centre. */
function marquetry(x: number, y: number, W: number, H: number): number {
  const ix = W / 2 - 0.014;
  const iy = H / 2 - 0.014;
  const d = Math.max(Math.abs(x) - ix, Math.abs(y) - iy);
  if (Math.abs(d) < 0.0016) return 1;
  if (Math.abs(d + 0.006) < 0.0007) return 2;
  if (d > 0) return 0;
  // corner fans
  const cx = Math.abs(x) - (ix - 0.017);
  const cy = Math.abs(y) - (iy - 0.017);
  const cr = Math.hypot(cx, cy);
  if (cr < 0.0025) return 2;
  if (cr < 0.0095) {
    const th = Math.atan2(cy, cx);
    if (cr < 0.0095 * Math.pow(Math.abs(Math.cos(2 * th)), 0.7)) return 1;
  }
  // central rosette
  const r = Math.hypot(x, y);
  const th = Math.atan2(y, x);
  if (r < 0.0065) return 2;
  if (r < 0.0085) return 4;
  const lim = 0.036 * (0.3 + 0.7 * Math.pow(Math.abs(Math.cos(4 * th)), 0.6));
  if (r < lim) {
    if (Math.abs(Math.sin(4 * th)) * r < 0.0007 && r < lim * 0.85) return 2;
    return 1;
  }
  const lim2 = 0.023 * Math.pow(Math.abs(Math.sin(4 * th)), 0.8);
  if (r < lim2) return 3;
  // vines with leaves and berries
  const ax = Math.abs(x);
  if (ax > 0.04 && ax < ix - 0.02) {
    const yv = 0.02 * Math.sin((ax - 0.04) * 45);
    if (Math.abs(y - yv) < 0.0013) return 1;
    for (let k = 0; k < 4; k++) {
      const xk = 0.04 + (Math.PI / 2 + k * Math.PI) / 45;
      if (xk > ix - 0.03) break;
      const sgn = k % 2 === 0 ? 1 : -1;
      const lx = xk + 0.004;
      const ly = sgn * 0.027;
      const dx = ax - lx;
      const dy = y - ly;
      const a = 0.5 * sgn;
      const u = dx * Math.cos(a) + dy * Math.sin(a);
      const v = -dx * Math.sin(a) + dy * Math.cos(a);
      if ((u / 0.011) ** 2 + (v / 0.0048) ** 2 < 1) return Math.abs(v) < 0.0006 ? 2 : 3;
      for (const [bx, by] of [
        [xk - 0.006, sgn * 0.011],
        [xk + 0.005, sgn * 0.012],
        [xk, sgn * 0.007],
      ])
        if (Math.hypot(ax - bx, y - by) < 0.0022) return 4;
    }
  }
  return 0;
}

const inlayColor = (k: number, p: THREE.Vector3, n: THREE.Vector3) =>
  k === 1 ? PALE : k === 2 ? EBONY : k === 3 ? LEAF : k === 4 ? BERRY : woodRgb(p, n);

export default function build() {
  const b = createBuilder({ name: "gramophone", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });

  const pm = b.ctx.paintMaterial();
  pm.side = THREE.DoubleSide;
  pm.roughness = 0.52;
  pm.metalness = 0.12;
  const silverMat = b.material(SILVER);
  silverMat.metalness = 0.75;
  silverMat.roughness = 0.28;
  for (const c of [BRASS, BRASS_BRIGHT]) {
    const m = b.material(c);
    m.metalness = 0.65;
    m.roughness = 0.35;
  }

  // ---------------- Paints ----------------
  const woodPaint = paint((p, n) => woodRgb(p, n));

  const panelPaint = (W: number, H: number) =>
    paint((p, n, s) => {
      if (Math.abs(n.y) > 0.7) return woodRgb(p, n);
      return inlayColor(marquetry((s[0] - 0.5) * W, (s[1] - 0.5) * H, W, H), p, n);
    });

  const plinthPaint = paint((p, n, s) => {
    if (Math.abs(n.y) > 0.7) return woodRgb(p, n);
    const x = (s[0] - 0.5) * 0.47;
    const y = (s[1] - 0.5) * 0.03;
    if (Math.abs(y) < 0.0045) {
      const k = Math.floor(x / 0.007) + Math.floor((y + 0.0045) / 0.0045);
      return ((k % 2) + 2) % 2 === 0 ? PALE : EBONY;
    }
    if (Math.abs(Math.abs(y) - 0.0063) < 0.0007) return PALE;
    return woodRgb(p, n);
  });

  const moldingPaint = paint((p, n, s) => {
    if (n.y > 0.7) {
      const x = (s[0] - 0.5) * 0.46;
      const y = (s[1] - 0.5) * 0.46;
      const d = Math.max(Math.abs(x), Math.abs(y)) - 0.215;
      if (Math.abs(d) < 0.0015) return PALE;
      if (Math.abs(d + 0.005) < 0.0007) return EBONY;
      const cr = Math.hypot(Math.abs(x) - 0.195, Math.abs(y) - 0.195);
      if (cr < 0.003) return EBONY;
      if (cr < 0.011) {
        const th = Math.atan2(Math.abs(y) - 0.195, Math.abs(x) - 0.195);
        if (cr < 0.011 * Math.pow(Math.abs(Math.cos(3 * th)), 0.7)) return PALE;
      }
      return woodRgb(p, n);
    }
    if (Math.abs(n.y) < 0.5) {
      const y = (s[1] - 0.5) * 0.025;
      if (Math.abs(y + 0.006) < 0.0008) return PALE;
    }
    return woodRgb(p, n);
  });

  const plaquePaint = paint((p, n, s) => {
    if (n.z < 0.9) return BRASS;
    const u = s[0];
    const v = s[1];
    if (u < 0.05 || u > 0.95 || v < 0.14 || v > 0.86) return "#e8c06a";
    if (u < 0.08 || u > 0.92 || v < 0.22 || v > 0.78) return "#5a3c10";
    if (v > 0.38 && v < 0.62 && u > 0.16 && u < 0.84 && Math.sin(u * 95) > -0.1 && Math.sin(u * 23 + 1) > -0.6)
      return "#3a2608";
    return "#cfa04c";
  });

  const C = [0.03, 0, 0.03];
  const recordPaint = paint((p, n) => {
    if (n.y < 0.5) return "#111114";
    const dx = p.x - C[0];
    const dz = p.z - C[2];
    const r = Math.hypot(dx, dz);
    const th = Math.atan2(dz, dx);
    if (r < 0.044) {
      if (r > 0.04 && r < 0.0425) return GOLD;
      if (r > 0.026 && r < 0.032 && Math.sin(th) > 0.35 && Math.sin(th * 55) > -0.2) return GOLD;
      if (r > 0.026 && r < 0.03 && Math.sin(th) < -0.5 && Math.sin(th * 70) > 0) return GOLD;
      if (r > 0.012 && r < 0.0135) return GOLD;
      return LABEL_RED;
    }
    if (r < 0.048 || r > 0.123) return "#0b0b0c";
    let v = 0.07 + 0.025 * Math.sin(r * 1300);
    if (Math.abs(((r - 0.048) % 0.019) - 0.0095) < 0.0007) v += 0.06;
    v += Math.pow(Math.abs(Math.cos(th - 0.7)), 24) * 0.22;
    return [v, v, v * 1.08] as Rgb;
  });

  // ---------------- Cabinet ----------------
  b.part(new THREE.BoxGeometry(0.47, 0.03, 0.47), plinthPaint, { at: [0, 0.085, 0], name: "plinth" });
  b.frustumBox([0, 0.1, 0], [0, 0.113, 0], [0.455, 0.455], [0.424, 0.424], { color: woodPaint, name: "coveLow" });
  b.part(new THREE.BoxGeometry(0.42, 0.17, 0.42), panelPaint(0.42, 0.17), { at: [0, 0.185, 0], name: "cabinet" });
  b.frustumBox([0, 0.256, 0], [0, 0.271, 0], [0.424, 0.424], [0.455, 0.455], { color: woodPaint, name: "coveHigh" });
  b.part(new THREE.BoxGeometry(0.46, 0.025, 0.46), moldingPaint, { at: [0, 0.2825, 0], name: "topMolding" });
  b.part(new THREE.BoxGeometry(0.09, 0.016, 0.003), plaquePaint, { at: [0, 0.2825, 0.2315], name: "nameplate" });

  // Ebonised corner pilasters with brass capitals
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = sx * 0.209;
      const z = sz * 0.209;
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.143, 8), "#2e1a0e", { at: [x, 0.1835, z] });
      b.part(new THREE.CylinderGeometry(0.018, 0.016, 0.012, 8), BRASS, { at: [x, 0.249, z] });
      b.part(new THREE.CylinderGeometry(0.016, 0.018, 0.012, 8), BRASS, { at: [x, 0.119, z] });
      b.part(new THREE.SphereGeometry(0.006, 6, 4), BRASS_BRIGHT, { at: [x, 0.1835, z + sz * 0.012] });
    }

  // Ball-and-claw feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = sx * 0.195;
      const z = sz * 0.195;
      b.part(new THREE.SphereGeometry(0.028, 10, 7), "#3a1f10", { at: [x, 0.028, z] });
      b.lathe(
        [
          [0, 0.035],
          [0.018, 0.038],
          [0.027, 0.05],
          [0.023, 0.062],
          [0.032, 0.072],
          [0, 0.072],
        ],
        { at: [x, 0, z], color: woodPaint, segments: 8 },
      );
      const out = Math.atan2(sz, sx);
      for (const off of [-60, 0, 60]) {
        const a = out + off * DEG;
        const d = [Math.cos(a), 0, Math.sin(a)];
        const P = (h: number, r: number) => [x + d[0] * r, h, z + d[2] * r];
        b.sweep(catmull([P(0.05, 0.012), P(0.041, 0.027), P(0.024, 0.031), P(0.009, 0.026)]), (t) => 0.0065 - 0.0035 * t, {
          color: BRASS,
          sides: 6,
          caps: { start: "round", end: "point" },
        });
      }
    }

  // ---------------- Turntable ----------------
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.01, 28), SILVER, { at: [C[0], 0.3, C[2]], name: "platter" });
  b.part(new THREE.CylinderGeometry(0.129, 0.129, 0.002, 28), "#2f4a35", { at: [C[0], 0.306, C[2]], name: "felt" });
  b.part(new THREE.CylinderGeometry(0.127, 0.127, 0.003, 36), recordPaint, { at: [C[0], 0.3085, C[2]], name: "record" });
  b.part(new THREE.CylinderGeometry(0.0035, 0.0035, 0.014, 8), SILVER, { at: [C[0], 0.316, C[2]], name: "spindle" });
  b.part(new THREE.SphereGeometry(0.0038, 8, 5), SILVER, { at: [C[0], 0.323, C[2]] });

  // Needle cups, speed regulator, brake
  for (const [z, lid] of [
    [0.175, "#7a7f86"],
    [0.13, BRASS],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.014, 0.012, 0.018, 10), SILVER, { at: [0.18, 0.304, z] });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.003, 10), lid, { at: [0.18, 0.3135, z] });
  }
  b.part(new THREE.BoxGeometry(0.05, 0.004, 0.02), SILVER, { at: [0.175, 0.297, -0.14] });
  b.capsule([0.16, 0.3, -0.14], [0.185, 0.305, -0.14], 0.003, { color: SILVER, sides: 6 });
  b.part(new THREE.SphereGeometry(0.006, 8, 5), "#2b1a10", { at: [0.187, 0.306, -0.14] });
  b.capsule([-0.18, 0.301, 0.16], [-0.125, 0.301, 0.125], 0.0035, { color: SILVER, sides: 6 });
  b.part(new THREE.SphereGeometry(0.007, 8, 5), "#2b1a10", { at: [-0.18, 0.303, 0.16] });

  // ---------------- Tonearm and soundbox ----------------
  const E = [-0.14, 0, -0.15];
  b.part(new THREE.CylinderGeometry(0.032, 0.036, 0.008, 12), SILVER, { at: [E[0], 0.299, E[2]], name: "armBase" });
  b.rod([E[0], 0.3, E[2]], [E[0], 0.36, E[2]], 0.013, { color: SILVER, sides: 10 });
  b.part(new THREE.TorusGeometry(0.0145, 0.003, 5, 12), BRASS, { at: [E[0], 0.318, E[2]], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.SphereGeometry(0.024, 10, 8), SILVER, { at: [E[0], 0.36, E[2]], name: "elbow" });
  b.sweep(
    catmull([
      [-0.14, 0.355, -0.14],
      [-0.128, 0.362, -0.08],
      [-0.105, 0.368, -0.025],
      [-0.074, 0.374, 0.015],
    ]),
    (t) => 0.012 - 0.004 * t,
    { color: SILVER, sides: 10, name: "tonearm" },
  );
  const D = new THREE.Vector3(-0.072, 0.343, 0.016);
  const ax = new THREE.Vector3(1, 0, 0.35).normalize();
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16), SILVER, { at: D, dir: ax, name: "soundbox" });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.002, 16), "#d3c497", {
    at: D.clone().addScaledVector(ax, 0.0065),
    dir: ax,
    name: "mica",
  });
  b.part(new THREE.TorusGeometry(0.0245, 0.0018, 4, 16), BRASS_BRIGHT, {
    at: D.clone().addScaledVector(ax, 0.007),
    dir: ax,
    axis: "z",
  });
  b.part(new THREE.SphereGeometry(0.004, 6, 4), SILVER, { at: D.clone().addScaledVector(ax, 0.008) });
  b.rod([D.x, D.y - 0.024, D.z], [D.x, 0.318, D.z], 0.0025, { color: SILVER, sides: 6 });
  b.spike([D.x, 0.319, D.z], [D.x, 0.3095, D.z], null, 0.0015, { color: "#33363a", sides: 5 });

  // ---------------- Crank ----------------
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 12), SILVER, { at: [-0.212, 0.18, 0.06], dir: [-1, 0, 0] });
  b.part(new THREE.TorusGeometry(0.019, 0.002, 4, 14), BRASS, { at: [-0.2155, 0.18, 0.06], dir: [-1, 0, 0], axis: "z" });
  b.rod([-0.21, 0.18, 0.06], [-0.245, 0.18, 0.06], 0.006, { color: SILVER, sides: 8 });
  b.part(new THREE.SphereGeometry(0.009, 8, 6), SILVER, { at: [-0.246, 0.18, 0.06] });
  b.capsule([-0.246, 0.18, 0.06], [-0.248, 0.115, 0.085], [0.007, 0.005], { color: SILVER, sides: 8, name: "crankArm" });
  b.rod([-0.248, 0.115, 0.085], [-0.256, 0.115, 0.085], 0.006, { color: SILVER, sides: 8 });
  b.capsule([-0.256, 0.115, 0.085], [-0.292, 0.115, 0.085], [0.0085, 0.0095], { color: "#3a2010", sides: 8, name: "crankHandle" });

  // ---------------- Morning-glory horn ----------------
  const hornPath = bezier([-0.14, 0.37, -0.15], [-0.13, 0.44, -0.34], [0, 0.5, -0.37], [0, 0.66, 0.02]);
  const rH = (t: number) => 0.018 + 0.255 * Math.pow(t, 3.4);
  const aH = (t: number) => 0.13 * smoothstep(0.25, 1, t);
  const SIDES = 60;
  const petalR = (t: number, phi: number) => rH(t) * (1 - aH(t) * (1 - Math.abs(Math.sin(5 * phi))));
  const contour: Contour = {
    sides: SIDES,
    smooth: true,
    reach: (t) => {
      const r = rH(t);
      return [r, r, r, r];
    },
    keys: (t) => [rH(t), aH(t) * rH(t)],
    knots: [],
    polygon: (t, sides) =>
      Array.from({ length: sides }, (_, k) => {
        const phi = Math.PI / 2 + (2 * Math.PI * k) / sides;
        const r = petalR(t, phi);
        return [r * Math.cos(phi), r * Math.sin(phi)] as [number, number];
      }),
  };

  // Crease (seam) clock angles along the horn, filled in after the horn is built; read at bake time.
  const seamTs: number[] = [];
  const seamOff: number[] = [];
  const offsetAt = (t: number) => {
    if (!seamTs.length || t <= seamTs[0]) return seamOff[0] ?? 0;
    for (let i = 1; i < seamTs.length; i++)
      if (t <= seamTs[i]) {
        const f = (t - seamTs[i - 1]) / (seamTs[i] - seamTs[i - 1]);
        return seamOff[i - 1] + (seamOff[i] - seamOff[i - 1]) * f;
      }
    return seamOff[seamOff.length - 1];
  };

  const hornPaint = paint((p, n, s) => {
    const t = s[0];
    const deg = s[1];
    let c: Rgb = mix("#8a5f22", "#e0ae52", smoothstep(0.05, 0.95, t));
    c = mix(c, "#f6d68a", smoothstep(0.62, 0.8, noise(p, 0.03, 5)) * 0.45);
    const x = (((deg - offsetAt(t)) % 36) + 36) % 36;
    const dist = Math.min(x, 36 - x) * DEG * rH(t);
    const fade = smoothstep(0.3, 0.5, t);
    const pat = noise(p, 0.06, 21);
    const g = smoothstep(0.55, 0.75, pat) * 0.8 + fade * smoothstep(0.016, 0, dist) * 0.65;
    c = mix(c, "#5e9277", Math.min(g, 0.88));
    if (fade > 0 && dist < 0.0018) c = mix(c, "#4a3010", fade * 0.85);
    if (t < 0.06) c = mix(c, "#6e4a1a", 0.4);
    return c;
  });

  const horn = b.sweep(hornPath, contour, {
    color: hornPaint,
    sides: SIDES,
    caps: "none",
    detail: 1.5,
    name: "horn",
  });

  for (let t = 0.3; t <= 1.0001; t += 0.05) {
    const tt = Math.min(t, 1);
    let best = 0;
    let bestR = Infinity;
    for (let d = 0; d < 36; d += 0.5) {
      const r = horn.at(tt, d).radius;
      if (r < bestR) {
        bestR = r;
        best = d;
      }
    }
    if (seamOff.length) {
      const prev = seamOff[seamOff.length - 1];
      best += 36 * Math.round((prev - best) / 36);
    }
    seamTs.push(tt);
    seamOff.push(best);
  }

  // Rolled bead around the scalloped mouth
  const rimPts = Array.from({ length: 120 }, (_, i) => horn.at(1, i * 3).at);
  b.sweep(catmull(rimPts, { closed: true }), 0.0055, { color: BRASS_BRIGHT, sides: 6, name: "hornRim" });

  // Throat collar and support clamp
  for (const [t, w] of [
    [0.04, 0.004],
    [0.45, 0.0045],
  ] as const)
    b.part(new THREE.TorusGeometry(rH(t) + 0.003, w, 6, 18), BRASS, {
      at: hornPath.at(t),
      dir: hornPath.tangentAt(t),
      axis: "z",
    });

  // Horn crane from the cabinet back
  const q = hornPath.at(0.45);
  const rr = rH(0.45) + 0.006;
  b.part(new THREE.BoxGeometry(0.04, 0.05, 0.007), SILVER, { at: [0, 0.19, -0.2135], name: "craneBracket" });
  b.sweep(
    catmull([
      [0, 0.19, -0.222],
      [0, 0.24, -0.245],
      [q.x * 0.6, 0.33, (q.z - 0.25) / 2 - 0.01],
      [q.x, q.y - rr + 0.002, q.z],
    ]),
    0.006,
    { color: SILVER, sides: 8, name: "hornCrane" },
  );
  b.part(new THREE.SphereGeometry(0.009, 8, 6), SILVER, { at: [q.x, q.y - rr, q.z] });

  return b.root;
}
