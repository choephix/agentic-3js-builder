import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, gradient, grain, mottle, noise, paint, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A round sand-slab diorama: a turquoise pond ringed with stones and reeds, three leaning palms, two striped tents with awnings, a campfire with a cooking pot, and two camels (one loaded, one drinking).",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

type Col = string | Paint;
type PO = {
  pitch?: number;
  yaw?: number;
  roll?: number;
  scale?: number | number[];
  flat?: boolean;
  texture?: THREE.Texture;
};
type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "desertOasis" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const D = Math.PI / 180;
  const GY = 0.14;
  const UP = new THREE.Vector3(0, 1, 0);

  const qt = (pitch: number, yaw: number, roll: number) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * D, yaw * D, roll * D, "YXZ"));
  const put = (geo: THREE.BufferGeometry, color: Col, at: number[], o: PO = {}) =>
    b.part(geo, color, {
      bone: base,
      at,
      quat: qt(o.pitch ?? 0, o.yaw ?? 0, o.roll ?? 0),
      scale: o.scale,
      flat: o.flat ?? true,
      texture: o.texture,
    });
  const rod = (pts: number[][], r: number | number[], color: Col, sides = 6) =>
    b.sweep(pts, r, { color, bone: base, sides });
  const sph = (rx = 1) => new THREE.SphereGeometry(rx, 10, 7);

  // local frame helper (yaw about Y, ground offset applied)
  const mk = (cx: number, cz: number, yawDeg: number) => {
    const c = Math.cos(yawDeg * D);
    const s = Math.sin(yawDeg * D);
    const pt = (x: number, y: number, z: number): number[] => [cx + x * c + z * s, GY + y, cz - x * s + z * c];
    const lp = (geo: THREE.BufferGeometry, color: Col, p: V, o: PO = {}) =>
      put(geo, color, pt(p[0], p[1], p[2]), { ...o, yaw: yawDeg + (o.yaw ?? 0) });
    return { pt, lp, c, s, yawDeg };
  };

  // ---------------------------------------------------------------- palette
  const SAND = "#ecc681";
  const SAND_D = "#dcaa5e";
  const SAND_L = "#f6dca0";
  const WOOD = "#8a5a32";
  const WOOD_D = "#5e3b1e";
  const GOLD = "#e8b630";
  const CREAM = "#f4e3b8";
  const RED = "#c8453a";
  const TEAL = "#2a9d9a";
  const DARK = "#2b2118";

  const sandBase = mottle(SAND, SAND_D, { size: 0.3, seed: 3 });
  const sandPaint = paint((p) => {
    const r = Math.sin(p.x * 22 + p.z * 9 + noise(p, 0.35, 5) * 7);
    return r > 0.75 ? SAND_L : sandBase;
  });

  // ---------------------------------------------------------------- base slab
  const baseOutline: OutlinePoint[] = [
    [0, 0],
    [1.27, 0],
    [1.3, 0.05],
    [1.3, 0.1],
    [1.25, 0.14],
    [0, 0.14],
  ];
  const basePaint = paint((_p, n, s) => {
    if (n.y > 0.5) return sandPaint;
    return s[0] < 0.05 ? "#9a6b3a" : s[0] < 0.1 ? "#c48a4e" : "#b57b44";
  });
  b.lathe(baseOutline, { at: [0, 0, 0], segments: 20, color: basePaint, bone: base });

  // dunes
  const dunes: Array<[number, number, number, number, number]> = [
    [0.0, -1.0, 0.5, 0.13, 0.28],
    [-1.0, -0.25, 0.26, 0.1, 0.42],
    [1.05, 0.2, 0.22, 0.09, 0.38],
    [-0.4, 1.0, 0.4, 0.07, 0.2],
    [0.8, -0.75, 0.3, 0.11, 0.22],
  ];
  for (const [x, z, a, h, c] of dunes) put(sph(), sandPaint, [x, GY, z], { scale: [a, h, c] });

  // ---------------------------------------------------------------- pond
  const PX = 0.1;
  const PZ = -0.05;
  const water = paint((p) => {
    const d = Math.hypot((p.x - PX) / 1.1, (p.z - PZ) / 0.8);
    return Math.sin(d * 28) > 0.8 ? "#8fe3e6" : d > 0.34 ? "#2e9fb8" : "#3fb8c9";
  });
  put(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 14), "#c79a5a", [PX, GY, PZ], { scale: [1.3, 1, 0.98] });
  put(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 14), water, [PX, GY, PZ], { scale: [1.1, 1, 0.8] });

  const stoneCols = ["#b09070", "#9c7d5f", "#c3a283", "#a58566"];
  const rs = rng(21);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    if (a > 0.95 && a < 2.25) continue;
    const r = 0.04 + 0.03 * rs();
    put(new THREE.IcosahedronGeometry(r, 0), stoneCols[i % 4], [PX + 0.57 * Math.cos(a), GY + 0.01, PZ + 0.43 * Math.sin(a)], {
      scale: [1.2, 0.7, 1],
      yaw: i * 37,
    });
  }
  // lily pads and flowers
  const lilies: Array<[number, number, number]> = [
    [-0.05, -0.12, 0.05],
    [0.22, 0.02, 0.04],
    [0.15, -0.2, 0.035],
  ];
  lilies.forEach(([x, z, r], i) => {
    put(new THREE.CylinderGeometry(r, r, 0.006, 7), "#4aa545", [x, GY + 0.017, z], { yaw: i * 40 });
    if (i !== 1) put(new THREE.ConeGeometry(0.018, 0.03, 6), "#f48fb1", [x, GY + 0.035, z]);
  });

  // ---------------------------------------------------------------- reeds and grass
  const tuft = svg(
    `<svg viewBox="0 0 40 64"><path d="M20 64 C17 40 11 20 6 2 C17 18 24 38 24 64Z" fill="#3b9c47"/><path d="M16 64 C16 44 20 24 22 0 C28 22 26 44 26 64Z" fill="#59b653"/><path d="M22 64 C26 44 32 28 38 12 C34 32 30 48 28 64Z" fill="#2f8a3c"/></svg>`,
    { size: 128 },
  );
  const reedFrames = [] as ReturnType<typeof frame>[];
  const rr = rng(8);
  const clusters: Array<[number, number]> = [
    [3.3, 0.66],
    [3.9, 0.64],
    [4.5, 0.66],
    [5.2, 0.66],
    [5.9, 0.68],
    [0.4, 0.68],
    [2.7, 0.7],
  ];
  for (const [a, rad] of clusters)
    for (let k = 0; k < 4; k++) {
      const aa = a + (rr() - 0.5) * 0.18;
      const rad2 = rad + (rr() - 0.5) * 0.08;
      reedFrames.push(frame([PX + rad2 * 1.02 * Math.cos(aa), GY, PZ + rad2 * 0.78 * Math.sin(aa)], [0, 1, 0]));
    }
  // dune grass
  for (const [x, z] of [
    [-0.95, 0.15],
    [0.95, -0.05],
    [-0.2, 0.95],
    [0.9, 0.7],
  ] as Array<[number, number]>)
    for (let k = 0; k < 3; k++) reedFrames.push(frame([x + (rr() - 0.5) * 0.1, GY, z + (rr() - 0.5) * 0.1], [0, 1, 0]));
  b.cards(reedFrames, tuft, { size: [0.07, 0.2], cross: true, vary: 0.35, spin: 180, rng: rng(5), sink: 0.1 });
  // cattails
  for (const [a, h] of [
    [3.6, 0.3],
    [4.3, 0.34],
    [5.5, 0.28],
  ] as Array<[number, number]>) {
    const x = PX + 0.6 * 1.02 * Math.cos(a);
    const z = PZ + 0.6 * 0.78 * Math.sin(a);
    rod([[x, GY, z], [x + 0.01, GY + h * 0.5, z], [x + 0.02, GY + h, z]], 0.004, "#5b8f3c", 5);
    b.capsule([x + 0.02, GY + h - 0.02, z], [x + 0.02, GY + h + 0.04, z], 0.011, { color: "#6b3d1e", bone: base, sides: 6 });
  }

  // ---------------------------------------------------------------- palms
  const trunkPaint = stripes("#9a6a3a", "#6b4426", { size: 0.07, axis: "y", width: 0.35, wobble: 0.2, seed: 2 });
  const greens = ["#4aa545", "#2f8a3c", "#5fb64a"];
  const palm = (x: number, z: number, h: number, lx: number, lz: number, n: number, seed: number, sc: number) => {
    const r = rng(seed);
    const pts = [0, 1, 2, 3, 4].map((i) => {
      const t = i / 4;
      return [x + lx * t * t, GY - 0.02 + (h + 0.02) * t, z + lz * t * t];
    });
    b.sweep(catmull(pts), [0.055 * sc, 0.03 * sc], { color: trunkPaint, bone: base, sides: 6 });
    put(new THREE.CylinderGeometry(0.065 * sc, 0.09 * sc, 0.06, 6), "#7d5230", [x, GY + 0.02, z]);
    const top = pts[4];
    put(sph(0.065 * sc), "#6e8b3a", [top[0], top[1] - 0.01, top[2]]);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + 0.4;
      put(sph(0.032 * sc), "#5a3a1c", [top[0] + 0.05 * sc * Math.sin(a), top[1] - 0.07 * sc, top[2] + 0.05 * sc * Math.cos(a)]);
    }
    const L = 0.5 * sc;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.3;
      const d = [Math.sin(a), 0, Math.cos(a)];
      const high = i % 3 === 0;
      const P = (f: number, u: number) => new THREE.Vector3(top[0] + d[0] * f, top[1] + u, top[2] + d[2] * f);
      const len = L * (0.9 + 0.25 * r());
      const path = bezier(
        P(0, 0),
        P(0.3 * len, (high ? 0.42 : 0.28) * len),
        P(0.65 * len, (high ? 0.45 : 0.3) * len),
        P(len, (high ? 0.1 : -0.06 - 0.18 * r()) * len),
      );
      const col = greens[i % 3];
      b.sweep(path, [0.012 * sc, 0.004], { color: "#7a9a3a", bone: base, sides: 4 });
      const K = 5;
      for (let k = 0; k < K; k++) {
        const t = 0.2 + (0.7 * k) / (K - 1);
        const pp = path.at(t);
        const tan = path.tangentAt(t);
        const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
        const lf = len * 0.27 * (1 - 0.55 * t);
        for (const sg of [1, -1]) {
          const tip = pp
            .clone()
            .addScaledVector(side, sg * lf)
            .addScaledVector(tan, lf * 0.55)
            .addScaledVector(UP, -lf * 0.6);
          b.sweep([pp, tip], (u: number): [number, number] => [0.02 * sc * (1 - 0.8 * u) + 0.002, 0.003], {
            section: "box",
            caps: "flat",
            color: col,
            bone: base,
          });
        }
      }
    }
  };
  palm(-0.5, 0.0, 1.0, 0.3, 0.02, 8, 3, 1);
  palm(0.68, 0.15, 0.85, -0.28, -0.05, 8, 7, 0.9);
  palm(0.92, -0.25, 0.55, -0.08, 0.1, 6, 11, 0.65);

  // ---------------------------------------------------------------- rugs and tents
  const rugSvg = svg(
    `<svg viewBox="0 0 64 44"><rect width="64" height="44" fill="#b83a3a"/><rect x="4" y="4" width="56" height="36" fill="none" stroke="#e8b630" stroke-width="3"/><polygon points="32,9 46,22 32,35 18,22" fill="#f4e3b8"/><polygon points="32,15 40,22 32,29 24,22" fill="#2a9d9a"/><polygon points="32,19 35,22 32,25 29,22" fill="#e8b630"/><rect x="0" y="0" width="3" height="44" fill="#f4e3b8"/><rect x="61" y="0" width="3" height="44" fill="#f4e3b8"/></svg>`,
    { size: 128 },
  );
  const rug = (m: ReturnType<typeof mk>, x: number, z: number, w: number, d: number) =>
    m.lp(new THREE.PlaneGeometry(w, d), "#ffffff", [x, 0.004, z], { pitch: -90, texture: rugSvg, flat: false });

  const tent = (cx: number, cz: number, yaw: number, k: number, c1: string, c2: string, trim: string) => {
    const m = mk(cx, cz, yaw);
    const outline: OutlinePoint[] = [
      [0, 0],
      [0.3 * k, 0],
      [0.3 * k, 0.13 * k],
      [0.06 * k, 0.38 * k],
      [0, 0.4 * k],
    ];
    const col = paint((_p, _n, s) => {
      if (s[0] < 0.03 * k) return trim;
      const deg = ((s[1] % 360) + 360) % 360;
      return Math.floor(deg / 45) % 2 ? c1 : c2;
    });
    b.lathe(outline, { at: m.pt(0, 0, 0), segments: 8, spin: 22.5, color: col, bone: base });
    // door
    m.lp(new THREE.BoxGeometry(0.15 * k, 0.19 * k, 0.02 * k), CREAM, [0, 0.095 * k, 0.272 * k]);
    m.lp(new THREE.BoxGeometry(0.11 * k, 0.15 * k, 0.03 * k), "#2a1c14", [0, 0.075 * k, 0.28 * k]);
    for (const sg of [1, -1]) {
      m.lp(new THREE.BoxGeometry(0.03 * k, 0.17 * k, 0.03 * k), c1, [sg * 0.075 * k, 0.09 * k, 0.285 * k], { roll: sg * -8 });
      m.lp(sph(0.012 * k), GOLD, [sg * 0.09 * k, 0.07 * k, 0.3 * k]);
    }
    // awning
    const awn = stripes(c1, CREAM, { size: 0.04 * k, axis: "x", width: 0.5, wobble: 0 });
    m.lp(new THREE.BoxGeometry(0.3 * k, 0.01, 0.16 * k), awn, [0, 0.2 * k, 0.36 * k], { pitch: 12, flat: false });
    for (const sg of [1, -1]) {
      rod([m.pt(sg * 0.14 * k, 0, 0.43 * k), m.pt(sg * 0.14 * k, 0.17 * k, 0.43 * k)], 0.006, WOOD_D, 5);
      m.lp(new THREE.ConeGeometry(0.02 * k, 0.03 * k, 4), c2, [sg * 0.14 * k, 0.045 * k, 0.43 * k], { pitch: 180 });
    }
    // finial and pennant
    rod([m.pt(0, 0.39 * k, 0), m.pt(0, 0.55 * k, 0)], 0.005, WOOD_D, 5);
    m.lp(sph(0.016 * k), GOLD, [0, 0.4 * k, 0]);
    const flag: OutlinePoint[] = [
      [0, 0],
      [0.16 * k, -0.03 * k],
      [0, -0.06 * k],
    ];
    b.extrude(flag, { at: m.pt(0, 0.55 * k, 0), x: [m.c, 0, -m.s], thickness: 0.006, color: c1, bone: base });
    // guy ropes and stakes
    for (let i = 0; i < 4; i++) {
      const a = (45 + i * 90) * D;
      const sa = Math.sin(a);
      const ca = Math.cos(a);
      rod(
        [m.pt(0.12 * k * sa, 0.32 * k, 0.12 * k * ca), m.pt(0.55 * k * sa, 0.012, 0.55 * k * ca)],
        0.004,
        "#efe0b4",
        4,
      );
      m.lp(new THREE.ConeGeometry(0.01, 0.045, 5), WOOD_D, [0.55 * k * sa, 0.015, 0.55 * k * ca], { pitch: 160 });
    }
    // trim studs around base
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 22.5 * D;
      m.lp(sph(0.012 * k), GOLD, [0.29 * k * Math.sin(a), 0.04 * k, 0.29 * k * Math.cos(a)]);
    }
    rug(m, 0, 0.52 * k, 0.26 * k, 0.18 * k);
    return m;
  };
  const t1 = tent(-0.65, -0.7, 20, 1.1, RED, CREAM, "#7a2a22");
  const t2 = tent(0.45, -0.7, -15, 0.9, TEAL, CREAM, "#1c5f63");

  // jars, crates, sacks
  const jarOutline: OutlinePoint[] = [
    [0, 0],
    [0.035, 0],
    [0.05, 0.035],
    [0.052, 0.07],
    [0.03, 0.1],
    [0.034, 0.115],
    [0, 0.115],
  ];
  const jarPaint = stripes("#c9693a", "#8f3f22", { size: 0.03, axis: "y", width: 0.3, wobble: 0.1, seed: 4 });
  [
    [-0.4, 0.28, 1.0],
    [-0.5, 0.18, 0.75],
    [-0.36, 0.14, 0.85],
  ].forEach(([x, z, sc], i) => {
    const p = t1.pt(x, 0, z);
    b.lathe(jarOutline, { at: p, segments: 8, color: i === 1 ? "#d8a24a" : jarPaint, bone: base, spin: i * 10 });
    void sc;
  });
  const woodPaint = grain(WOOD, WOOD_D, { size: 0.02, axis: "x", seed: 6 });
  const crate = (x: number, y: number, z: number, yaw: number) => {
    put(new THREE.BoxGeometry(0.12, 0.1, 0.12), woodPaint, [x, y + 0.05, z], { yaw, flat: false });
    for (const dy of [-0.04, 0.04])
      put(new THREE.BoxGeometry(0.126, 0.014, 0.126), "#5e3b1e", [x, y + 0.05 + dy, z], { yaw });
    put(new THREE.BoxGeometry(0.006, 0.1, 0.126), "#5e3b1e", [x, y + 0.05, z], { yaw: yaw + 45 });
  };
  {
    const p = t2.pt(0.4, 0, 0.1);
    crate(p[0], GY, p[2], 20);
    const q = t2.pt(0.4, 0, -0.04);
    crate(q[0], GY, q[2], -10);
    crate(p[0], GY + 0.1, p[2] + 0.005, 40);
    const sk = t2.pt(0.5, 0, 0.22);
    put(sph(), "#d9c28c", [sk[0], GY + 0.05, sk[2]], { scale: [0.06, 0.07, 0.05] });
    put(new THREE.ConeGeometry(0.015, 0.04, 5), "#d9c28c", [sk[0], GY + 0.12, sk[2]]);
    put(new THREE.TorusGeometry(0.052, 0.005, 4, 8), "#8a5a32", [sk[0], GY + 0.075, sk[2]], { pitch: 90 });
  }
  // lantern at tent two
  {
    const p = t2.pt(-0.26, 0, 0.36);
    rod([[p[0], GY, p[2]], [p[0], GY + 0.26, p[2]]], 0.007, WOOD_D, 5);
    rod([[p[0], GY + 0.25, p[2]], [p[0] + 0.05, GY + 0.25, p[2]]], 0.005, WOOD_D, 5);
    glow(put(new THREE.BoxGeometry(0.035, 0.05, 0.035), "#ffc65a", [p[0] + 0.05, GY + 0.215, p[2]]), 1.5);
    put(new THREE.ConeGeometry(0.03, 0.03, 4), DARK, [p[0] + 0.05, GY + 0.255, p[2]], { yaw: 45 });
  }

  // ---------------------------------------------------------------- campfire
  const fx = -0.12;
  const fz = -0.55;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(new THREE.IcosahedronGeometry(0.03, 0), i % 2 ? "#8c7a68" : "#a89580", [fx + 0.1 * Math.cos(a), GY + 0.01, fz + 0.1 * Math.sin(a)], {
      scale: [1.1, 0.8, 1],
      yaw: i * 50,
    });
  }
  for (let i = 0; i < 3; i++)
    put(new THREE.CylinderGeometry(0.014, 0.016, 0.16, 6), "#6b4226", [fx, GY + 0.025 + (i % 2) * 0.02, fz], {
      roll: 90,
      yaw: i * 60 + 10,
    });
  glow(put(new THREE.ConeGeometry(0.05, 0.11, 6), "#ff8a1f", [fx, GY + 0.07, fz]), 1.3);
  glow(put(new THREE.ConeGeometry(0.03, 0.08, 5), "#ffd34a", [fx + 0.01, GY + 0.065, fz], { yaw: 20 }), 1.5);
  for (const [dx, dz, dy] of [
    [0.04, 0.03, 0.15],
    [-0.05, 0.02, 0.18],
    [0.0, -0.05, 0.13],
  ] as Array<[number, number, number]>)
    glow(put(new THREE.IcosahedronGeometry(0.006, 0), "#ffb347", [fx + dx, GY + dy, fz + dz]), 1.5);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    rod([[fx + 0.13 * Math.cos(a), GY, fz + 0.13 * Math.sin(a)], [fx, GY + 0.25, fz]], 0.006, WOOD_D, 5);
  }
  rod([[fx, GY + 0.25, fz], [fx, GY + 0.19, fz]], 0.003, "#3a3a3a", 4);
  put(sph(0.045), "#3b3b44", [fx, GY + 0.16, fz], { scale: [1, 0.85, 1] });
  put(new THREE.CylinderGeometry(0.048, 0.048, 0.012, 8), "#2b2b33", [fx, GY + 0.19, fz]);
  put(new THREE.TorusGeometry(0.04, 0.004, 4, 8), "#2b2b33", [fx, GY + 0.205, fz]);
  put(sph(0.008), GOLD, [fx, GY + 0.2, fz]);
  // log seats
  for (const [dx, dz, yw] of [
    [0.0, 0.2, 90],
    [-0.2, 0.05, 20],
  ] as Array<[number, number, number]>) {
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 7), "#7a5232", [fx + dx, GY + 0.03, fz + dz], { roll: 90, yaw: yw });
    put(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 7), "#d9b27a", [fx + dx + 0.07 * Math.cos(yw * D), GY + 0.03, fz + dz - 0.07 * Math.sin(yw * D)], {
      roll: 90,
      yaw: yw,
    });
  }

  // ---------------------------------------------------------------- cactus and signpost
  {
    const cx = 0.98;
    const cz = 0.45;
    const rib = paint((_p, _n, s) => (Math.floor((((s[1] % 360) + 360) % 360) / 45) % 2 ? "#3f9a52" : "#2f7f43"));
    rod([[cx, GY - 0.01, cz], [cx, GY + 0.12, cz], [cx, GY + 0.24, cz]], [0.034, 0.03, 0.024], rib, 8);
    rod([[cx + 0.02, GY + 0.09, cz], [cx + 0.08, GY + 0.1, cz], [cx + 0.1, GY + 0.17, cz]], 0.02, rib, 8);
    rod([[cx - 0.02, GY + 0.12, cz], [cx - 0.07, GY + 0.13, cz], [cx - 0.08, GY + 0.19, cz]], 0.017, rib, 8);
    put(sph(0.018), "#f06292", [cx, GY + 0.27, cz]);
    put(sph(0.008), "#ffd54f", [cx, GY + 0.285, cz]);
    put(sph(0.012), "#f06292", [cx + 0.1, GY + 0.2, cz]);
  }
  {
    const sx = 0.95;
    const sz = 0.82;
    rod([[sx, GY - 0.01, sz], [sx, GY + 0.32, sz]], 0.014, WOOD, 6);
    const signSvg = svg(
      `<svg viewBox="0 0 100 40"><rect width="100" height="40" rx="4" fill="#c58a4a"/><rect x="3" y="3" width="94" height="34" rx="3" fill="none" stroke="#5e3b1e" stroke-width="3"/><text x="50" y="27" font-size="22" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#3a2410">OASIS</text></svg>`,
      { size: 256 },
    );
    put(new THREE.BoxGeometry(0.2, 0.08, 0.015), "#c58a4a", [sx, GY + 0.27, sz + 0.012], { yaw: -30 });
    put(new THREE.PlaneGeometry(0.2, 0.08), "#ffffff", [sx - 0.0045, GY + 0.27, sz + 0.0205], {
      yaw: -30,
      texture: signSvg,
      flat: false,
    });
    put(new THREE.BoxGeometry(0.14, 0.05, 0.012), "#a8723a", [sx, GY + 0.19, sz + 0.012], { yaw: -50 });
    put(sph(0.016), GOLD, [sx, GY + 0.335, sz]);
  }

  // ---------------------------------------------------------------- camels
  const camel = (cx: number, cz: number, yaw: number, drink: boolean, variant: number) => {
    const m = mk(cx, cz, yaw);
    const coatBase = variant === 0 ? mottle("#c78d4b", "#b87b3c", { size: 0.14, seed: 2 }) : mottle("#d8a665", "#c68f4f", { size: 0.14, seed: 4 });
    const COAT = countershade(coatBase, "#e9cf9f", { level: -0.45, soft: 0.25 });
    const DK = variant === 0 ? "#7d4f27" : "#8c5c2f";
    const SOCK = "#5e3b1e";
    const CRM = "#ead2a0";
    m.lp(sph(), COAT, [0, 0.3, 0], { scale: [0.11, 0.115, 0.24] });
    m.lp(sph(), COAT, [0, 0.31, 0.18], { scale: [0.1, 0.12, 0.11] });
    m.lp(sph(), COAT, [0, 0.3, -0.17], { scale: [0.1, 0.115, 0.1] });
    m.lp(sph(), COAT, [0, 0.44, -0.02], { scale: [0.07, 0.1, 0.09] });
    // legs
    const legPaint = gradient(COAT, SOCK, [0, GY + 0.13, 0], [0, GY + 0.05, 0]);
    for (const sg of [1, -1]) {
      const x = sg * 0.078;
      rod([m.pt(x, 0.3, 0.15), m.pt(x, 0.16, 0.165), m.pt(x, 0.034, 0.15)], [0.04, 0.026, 0.02], legPaint, 6);
      rod([m.pt(x, 0.3, -0.16), m.pt(x, 0.17, -0.2), m.pt(x, 0.034, -0.17)], [0.04, 0.026, 0.02], legPaint, 6);
      m.lp(new THREE.CylinderGeometry(0.03, 0.034, 0.03, 6), "#3c2a1c", [x, 0.015, 0.15]);
      m.lp(new THREE.CylinderGeometry(0.03, 0.034, 0.03, 6), "#3c2a1c", [x, 0.015, -0.17]);
      m.lp(sph(0.026), SOCK, [x, 0.16, 0.19], { scale: [0.9, 1, 0.7] });
    }
    // tail
    rod([m.pt(0, 0.36, -0.25), m.pt(0, 0.3, -0.33), m.pt(0, 0.19, -0.34)], [0.015, 0.01], COAT, 5);
    m.lp(sph(0.028), DK, [0, 0.17, -0.34], { scale: [1, 1.5, 1] });
    // neck
    const neck = drink
      ? [m.pt(0, 0.32, 0.2), m.pt(0, 0.36, 0.33), m.pt(0, 0.26, 0.44), m.pt(0, 0.1, 0.5)]
      : [m.pt(0, 0.32, 0.2), m.pt(0, 0.42, 0.3), m.pt(0, 0.52, 0.31), m.pt(0, 0.58, 0.36)];
    b.sweep(catmull(neck), [0.065, 0.045, 0.032], { color: COAT, bone: base, sides: 7 });
    // head
    const hy = drink ? 0.1 : 0.58;
    const hz = drink ? 0.5 : 0.36;
    const pp = drink ? 62 : 28;
    const sp = Math.sin(pp * D);
    const cp = Math.cos(pp * D);
    const hp = (a: number, f: number, u: number): V => [a, hy - sp * f + cp * u, hz + cp * f + sp * u];
    m.lp(sph(), COAT, hp(0, 0.02, 0.01), { scale: [0.048, 0.052, 0.07], pitch: pp });
    m.lp(sph(), CRM, hp(0, 0.085, -0.01), { scale: [0.04, 0.038, 0.06], pitch: pp });
    m.lp(sph(), CRM, hp(0, 0.08, -0.04), { scale: [0.032, 0.025, 0.05], pitch: pp });
    m.lp(sph(0.014), "#4a3022", hp(0, 0.14, -0.005), { pitch: pp });
    for (const sg of [1, -1]) {
      m.lp(sph(0.014), "#1c1410", hp(sg * 0.04, 0.03, 0.025), { pitch: pp });
      m.lp(sph(0.005), "#ffffff", hp(sg * 0.049, 0.036, 0.032), { pitch: pp });
      m.lp(sph(), COAT, hp(sg * 0.036, 0.025, 0.045), { scale: [0.02, 0.01, 0.03], pitch: pp });
      m.lp(new THREE.ConeGeometry(0.014, 0.045, 5), DK, hp(sg * 0.035, -0.035, 0.05), { pitch: pp - 20, roll: sg * -25 });
      m.lp(sph(0.004), "#2a1a10", hp(sg * 0.012, 0.15, 0.0), { pitch: pp });
    }
    m.lp(new THREE.ConeGeometry(0.014, 0.04, 5), DK, hp(0, -0.03, 0.04), { pitch: pp });
    // blanket
    const blanket =
      variant === 0
        ? stripes(RED, CREAM, { size: 0.035, axis: "z", width: 0.5, wobble: 0, seed: 1 })
        : stripes(TEAL, GOLD, { size: 0.035, axis: "z", width: 0.45, wobble: 0, seed: 1 });
    m.lp(sph(), blanket, [0, 0.3, 0.03], { scale: [0.122, 0.122, 0.095], flat: false });
    for (const sg of [1, -1])
      for (const z of [-0.03, 0.03, 0.09]) m.lp(sph(0.012), GOLD, [sg * 0.105, 0.235, z]);
    if (variant === 0) {
      m.lp(sph(), blanket, [0, 0.45, -0.02], { scale: [0.078, 0.105, 0.095], flat: false });
      for (const sg of [1, -1]) {
        m.lp(sph(), "#d9c28c", [sg * 0.15, 0.31, 0.0], { scale: [0.065, 0.075, 0.07] });
        m.lp(new THREE.TorusGeometry(0.066, 0.006, 4, 8), WOOD, [sg * 0.15, 0.31, 0.0], { pitch: 90 });
        m.lp(new THREE.ConeGeometry(0.016, 0.04, 5), "#d9c28c", [sg * 0.15, 0.39, 0.0]);
        rod([m.pt(sg * 0.12, 0.34, 0.0), m.pt(sg * 0.05, 0.5, -0.02)], 0.004, "#efe0b4", 4);
      }
      m.lp(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), "#b83a3a", [0, 0.58, -0.02], { roll: 90 });
      for (const x of [-0.08, 0.08]) m.lp(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 8), "#1c5f63", [x, 0.58, -0.02], { roll: 90 });
      for (const x of [-0.15, 0.15]) m.lp(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 8), CREAM, [x, 0.58, -0.02], { roll: 90 });
    } else {
      m.lp(sph(), "#c8453a", [0, 0.54, -0.02], { scale: [0.075, 0.03, 0.075] });
      m.lp(sph(0.012), GOLD, [0, 0.57, -0.02]);
      for (const a of [0, 90, 180, 270])
        m.lp(sph(0.01), GOLD, [0.07 * Math.sin(a * D), 0.53, -0.02 + 0.07 * Math.cos(a * D)]);
    }
    // bell on chest
    m.lp(sph(0.016), GOLD, [0, 0.2, 0.285]);
    m.lp(new THREE.TorusGeometry(0.1, 0.006, 4, 10), "#8a3a2a", [0, 0.31, 0.19], { pitch: 8 });
  };
  camel(-0.85, 0.5, 70, false, 0);
  camel(0.35, 0.62, 180, true, 1);

  // ---------------------------------------------------------------- pebbles
  const rp = rng(11);
  let placed = 0;
  for (let tries = 0; tries < 200 && placed < 22; tries++) {
    const a = rp() * Math.PI * 2;
    const rad = 0.3 + rp() * 0.9;
    const x = rad * Math.cos(a);
    const z = rad * Math.sin(a);
    if (Math.hypot((x - PX) / 0.62, (z - PZ) / 0.5) < 1.1) continue;
    if (Math.hypot(x + 0.65, z + 0.7) < 0.45 || Math.hypot(x - 0.45, z + 0.7) < 0.4) continue;
    if (Math.hypot(x - fx, z - fz) < 0.25) continue;
    if (rad > 1.15) continue;
    put(new THREE.IcosahedronGeometry(0.012 + 0.014 * rp(), 0), stoneCols[placed % 4], [x, GY + 0.004, z], {
      scale: [1.2, 0.7, 1],
      yaw: placed * 31,
    });
    placed++;
  }

  return b.root;
}
