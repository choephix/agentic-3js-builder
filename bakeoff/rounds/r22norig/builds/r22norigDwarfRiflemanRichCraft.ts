import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { DEG } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import type { ColorInput, Rgb } from "../../../../src/paint";
import type { Fill } from "../../../../src/context";
import type { PartOptions } from "../../../../src/parts";
import { catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout, heroic dwarf rifleman with a braided ginger beard, horned steel helm and goggles, domed pauldrons, a tartan kilt, bandolier and a brass-bound flared blunderbuss held at the ready.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------- palette ----------
const GOLD = "#e3a72b";
const BRASS = "#c58a2e";
const COPPER = "#b5602a";
const STEELD = "#59647a";
const INKD = "#17141a";
const SKIN = "#e2a07c";
const EYEW = "#f4efe4";
const IRIS = "#2a78c2";
const BLUE = "#2d5db0";
const LEATHER = "#6b4226";
const CANVAS = "#cdb98a";
const CREAM = "#efe6cf";
const GLASS = "#8fe8ff";

// ---------- paint helpers ----------
const relight = (c0: string | Rgb, p: THREE.Vector3, n: THREE.Vector3, hi: string, lo: string): Rgb => {
  const c = mix(c0, lo, 0.22 * noise(p, 0.05, 5));
  if (n.y > 0.2) return mix(c, hi, Math.min(1, (n.y - 0.2) * 1.2));
  if (n.y < -0.1) return mix(c, lo, Math.min(1, (-n.y - 0.1) * 1.1));
  return c;
};
const lit = (base: ColorInput, hi: string, lo: string) =>
  paint((p, n) => relight(resolve(base, p, n), p, n, hi, lo));

const vv = (a: V3): THREE.Vector3 => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));
const add = (a: V3, d: readonly number[]): THREE.Vector3 => vv(a).add(vv(d));

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarfRifleman" });

  // ---------- paints ----------
  const STEEL = paint((p, n) => relight("#8c9ab0", p, n, "#dce8f8", "#3b4560"));
  const STEELDARK = paint((p, n) => relight(STEELD, p, n, "#a5b2c8", "#262d3e"));
  const LEATH = lit(LEATHER, "#a06c3c", "#3a2112");
  const BOOT = lit("#5a3820", "#8a5a32", "#2d1a0e");
  const TROUSER = lit("#4a3a2a", "#7a6448", "#241a10");
  const FUR = lit(mottle(CREAM, "#c9b891", { size: 0.03 }), "#ffffff", "#8c7a5a");
  const BEARD = lit(grain("#b5531a", "#e48d2e", { size: 0.01 }), "#ffc25e", "#6a2c0c");
  const BEARD2 = lit(grain("#cf6a1f", "#f2a644", { size: 0.01, seed: 4 }), "#ffd27c", "#7a3410");
  const BONE = lit(grain("#efe3c4", "#cdb88a", { size: 0.02 }), "#fffbe8", "#7d6c48");
  const CANV = lit(mottle(CANVAS, "#a89466", { size: 0.04 }), "#efe0b0", "#6a5a38");
  const COAT = paint((p, n) => {
    let c = BLUE;
    if (n.z > 0.35 && Math.abs(p.x) < 0.1) {
      for (const yi of [0.5, 0.58, 0.66, 0.74]) {
        if (Math.hypot(Math.abs(p.x) - 0.04, p.y - yi) < 0.013) c = GOLD;
      }
      if (Math.abs(p.x) < 0.004) c = "#14285a";
      if (Math.abs(Math.abs(p.x) - 0.08) < 0.005 && p.y > 0.55) c = GOLD;
    }
    return relight(c, p, n, c === BLUE ? "#6a9aea" : "#ffd870", "#14285a");
  });
  const SKINP = paint((p, n) => {
    const dc = Math.hypot(Math.abs(p.x) - 0.092, p.y - 0.945, p.z - 0.15);
    const dn = Math.hypot(p.x, p.y - 0.965, p.z - 0.2);
    let c: Rgb = mix(SKIN, "#d8604a", (1 - smoothstep(0.02, 0.075, dc)) * 0.65);
    c = mix(c, "#d24a44", (1 - smoothstep(0.02, 0.055, dn)) * 0.7);
    return relight(c, p, n, "#f8c09a", "#8a4a3a");
  });
  const KILT = paint((p, n, s) => {
    const a = ((s[1] % 360) + 360) % 360;
    const i = Math.floor(a / 12);
    const j = Math.floor(s[0] / 0.03);
    let c: string = "#a82a24";
    if (i % 3 === 0) c = "#6e1a1a";
    if (j % 3 === 0) c = c === "#6e1a1a" ? "#3e0e12" : "#7a1c1c";
    if (a % 12 < 1.6 && i % 2 === 0) c = "#e9c24a";
    if (s[0] < 0.035) c = s[0] < 0.01 ? "#7a4a10" : GOLD;
    return relight(c, p, n, "#e06a50", "#3a0a10");
  });
  const sleeveP = (E: number[]) => {
    const ev = new THREE.Vector3(E[0], E[1], E[2]);
    return paint((p, n) => {
      const patch = p.distanceTo(ev) < 0.06;
      return relight(patch ? LEATHER : BLUE, p, n, patch ? "#9a6a3c" : "#6a9aea", "#14285a");
    });
  };

  // ---------- textures ----------
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 3 L60 11 V38 C60 56 46 66 32 70 C18 66 4 56 4 38 V11 Z" fill="#e0a82a" stroke="#3b2208" stroke-width="4"/>
      <path d="M32 11 L52 17 V38 C52 51 42 59 32 62 C22 59 12 51 12 38 V17 Z" fill="#234a8f"/>
      <path d="M32 16 C39 24 43 28 41 34 C39 38 35 36 35 40 C30 36 23 31 28 23 C30 27 32 25 32 16 Z" fill="#ff8a1f" stroke="#7a2a08" stroke-width="2"/>
      <path d="M15 44 H49 L45 50 H38 V55 H44 V59 H20 V55 H26 V50 H19 Z" fill="#f1c24a" stroke="#3b2208" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  const SCROLL = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#f1c24a" stroke-width="5" stroke-linecap="round">
        <path d="M6 20 C20 4 36 4 40 20 C44 34 28 34 28 22 C28 16 36 14 40 18"/>
        <path d="M40 20 H80"/>
        <path d="M114 20 C100 4 84 4 80 20 C76 34 92 34 92 22 C92 16 84 14 80 18"/>
        <circle cx="60" cy="20" r="5" fill="#f1c24a"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // ---------- part helpers ----------
  const ell = (at: V3, r: V3, color: Fill, opts: PartOptions = {}, seg: [number, number] = [10, 7]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, scale: r, ...opts });
  const box = (at: V3, size: [number, number, number], color: Fill, opts: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...opts });
  const cyl = (at: V3, rt: number, rb: number, h: number, color: Fill, opts: PartOptions = {}, segs = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, segs), color, { at, ...opts });
  const ring = (at: V3, R: number, tube: number, color: Fill, opts: PartOptions = {}, seg: [number, number] = [5, 12]) =>
    b.part(new THREE.TorusGeometry(R, tube, seg[0], seg[1]), color, { at, ...opts });
  const stud = (at: V3, r = 0.011, color: Fill = GOLD) => ell(at, [r, r, r], color, {}, [6, 4]);

  // =====================================================================
  // BOOTS AND LEGS
  // =====================================================================
  for (const s of [1, -1]) {
    const x = s * 0.12;
    b.rod([s * 0.11, 0.47, 0.03], [x, 0.14, 0.03], 0.092, TROUSER, { sides: 8 });
    b.rod([x, 0.1, 0.03], [x, 0.3, 0.03], 0.1, BOOT, { sides: 8 });
    ell([x, 0.06, 0.1], [0.1, 0.065, 0.155], BOOT);
    ell([x, 0.02, 0.1], [0.108, 0.027, 0.16], "#2a1a10");
    ell([x, 0.07, 0.22], [0.085, 0.055, 0.075], STEEL);
    ring([x, 0.075, 0.285], 0.04, 0.01, GOLD, { rotation: [0, 0, 0] });
    ring([x, 0.29, 0.03], 0.108, 0.03, FUR, { rotation: [90, 0, 0] }, [5, 10]);
    ring([x, 0.2, 0.03], 0.104, 0.013, LEATH, { rotation: [90, 0, 0] }, [4, 10]);
    box([x, 0.2, 0.135], [0.045, 0.04, 0.012], GOLD);
    box([x, 0.2, 0.142], [0.022, 0.018, 0.006], "#8a5a10");
    // ankle rivets
    for (const a of [-50, -20, 20, 50]) {
      stud([x + 0.1 * Math.sin(a * DEG) * 0.9, 0.13, 0.03 + 0.1 * Math.cos(a * DEG)], 0.009, BRASS);
    }
  }

  // =====================================================================
  // KILT, BELT, TORSO
  // =====================================================================
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.22, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0.34, 0.03], segments: 10, color: KILT },
  );
  // kilt hem tassels
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ell([0.272 * Math.sin(a), 0.335, 0.03 + 0.272 * Math.cos(a)], [0.012, 0.025, 0.012], GOLD, {}, [5, 4]);
  }

  const BC = [0, 0.62, 0.03];
  const BR = [0.28, 0.27, 0.23];
  ell(BC, BR, COAT, {}, [14, 10]);
  ell([0, 0.45, 0.03], [0.24, 0.1, 0.2], COAT);

  // belt
  ring([0, 0.47, 0.03], 1, 0.032, LEATH, { rotation: [90, 0, 0], scale: [0.245, 0.215, 1] }, [5, 20]);
  box([0, 0.47, 0.262], [0.1, 0.075, 0.025], GOLD);
  box([0, 0.47, 0.276], [0.06, 0.045, 0.012], "#8a5a10");
  glow(ell([0, 0.47, 0.284], [0.016, 0.016, 0.01], "#ff4a2a", {}, [6, 4]), 0.8);
  for (const a of [40, 60, 80, 100, -40, -60, -80, -100, 125, 150, 180, -125, -150]) {
    stud([0.245 * Math.sin(a * DEG), 0.47, 0.03 + 0.215 * Math.cos(a * DEG)], 0.009, BRASS);
  }

  // kilt emblem and pouches
  b.part(new THREE.PlaneGeometry(0.1, 0.112), "#ffffff", { at: [0, 0.4, 0.292], dir: [0, 0, 1], axis: "z", texture: EMBLEM });
  for (const s of [1, -1]) {
    box([s * 0.15, 0.415, 0.24], [0.075, 0.08, 0.04], LEATH, { rotation: [0, s * 35, 0] });
    box([s * 0.15, 0.435, 0.262], [0.075, 0.04, 0.012], LEATH, { rotation: [0, s * 35, 0] });
    stud([s * 0.158, 0.425, 0.272], 0.01);
  }

  // fur collar
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ell([0.17 * Math.sin(a), 0.855, 0.03 + 0.15 * Math.cos(a)], [0.05, 0.04, 0.05], FUR, {}, [6, 5]);
  }

  // straps over shoulders
  const ep = (az: number, el: number, k = 1.05): number[] => {
    const a = az * DEG;
    const e = el * DEG;
    return [
      BC[0] + BR[0] * Math.sin(a) * Math.cos(e) * k,
      BC[1] + BR[1] * Math.sin(e) * k,
      BC[2] + BR[2] * Math.cos(a) * Math.cos(e) * k,
    ];
  };
  const outN = (p: THREE.Vector3) =>
    new THREE.Vector3(
      (p.x - BC[0]) / (BR[0] * BR[0]),
      (p.y - BC[1]) / (BR[1] * BR[1]),
      (p.z - BC[2]) / (BR[2] * BR[2]),
    ).normalize();
  for (const s of [1, -1]) {
    b.sweep(
      catmull([ep(s * 150, 5), ep(s * 150, 35), ep(s * 85, 62), ep(s * 40, 45), ep(s * 28, 15), ep(s * 25, -20)]),
      0.02,
      LEATH,
      { section: "box" },
    );
    stud(ep(s * 28, 15, 1.09), 0.012);
  }
  // bandolier
  const band = catmull([ep(70, 58, 1.08), ep(45, 35, 1.08), ep(10, 5, 1.08), ep(-25, -22, 1.08), ep(-55, -38, 1.08)]);
  b.sweep(band, 0.024, lit("#5a3820", "#8a5a32", "#2a160a"), { section: "box" });
  for (let i = 0; i < 6; i++) {
    const p = band.at(0.18 + 0.13 * i);
    const n = outN(p);
    const base = p.clone().add(n.clone().multiplyScalar(0.03));
    box(base.clone().add(new THREE.Vector3(0, -0.01, 0)), [0.04, 0.05, 0.022], LEATH, { dir: n, axis: "z" });
    b.rod(base.clone().add(new THREE.Vector3(0, -0.02, 0.0)).add(n.clone().multiplyScalar(0.012)), base.clone().add(new THREE.Vector3(0, 0.035, 0)).add(n.clone().multiplyScalar(0.012)), 0.014, BRASS, { sides: 6, caps: "flat" });
    ell(base.clone().add(new THREE.Vector3(0, 0.04, 0)).add(n.clone().multiplyScalar(0.012)), [0.012, 0.012, 0.012], COPPER, {}, [6, 4]);
  }

  // powder horn on the left hip
  b.sweep(catmull([[0.24, 0.5, 0.1], [0.3, 0.42, 0.16], [0.27, 0.32, 0.25], [0.2, 0.27, 0.3]]), [0.04, 0.01], BONE);
  ell([0.24, 0.5, 0.1], [0.05, 0.03, 0.05], BRASS);
  ring([0.27, 0.46, 0.13], 0.045, 0.008, GOLD, { rotation: [60, 40, 0] });
  b.sweep(polyline([[0.2, 0.5, 0.14], [0.27, 0.56, 0.1], [0.24, 0.5, 0.1]]), 0.007, LEATH);

  // =====================================================================
  // BACK GEAR
  // =====================================================================
  box([0, 0.54, -0.27], [0.3, 0.28, 0.13], LEATH);
  box([0, 0.67, -0.27], [0.32, 0.055, 0.15], LEATH);
  for (const s of [1, -1]) {
    box([s * 0.09, 0.56, -0.337], [0.03, 0.2, 0.01], "#3a2112");
    box([s * 0.09, 0.64, -0.343], [0.034, 0.03, 0.012], GOLD);
  }
  b.part(new THREE.PlaneGeometry(0.11, 0.124), "#ffffff", { at: [0, 0.52, -0.342], dir: [0, 0, -1], axis: "z", texture: EMBLEM });
  cyl([0, 0.77, -0.25], 0.075, 0.075, 0.46, CANV, { rotation: [0, 0, 90] });
  for (const s of [1, -1]) {
    ring([s * 0.12, 0.77, -0.25], 0.08, 0.012, LEATH, { rotation: [0, 90, 0] }, [4, 10]);
    ring([s * 0.231, 0.77, -0.25], 0.045, 0.01, "#a89466", { rotation: [0, 90, 0] }, [4, 10]);
    stud([s * 0.12, 0.85, -0.25], 0.012, BRASS);
  }
  // cup and rope
  cyl([-0.17, 0.5, -0.34], 0.032, 0.026, 0.06, STEEL, {}, 8);
  ring([-0.2, 0.5, -0.34], 0.022, 0.006, STEEL, { rotation: [0, 90, 0] });
  ring([0.1, 0.52, -0.348], 0.06, 0.014, "#b59a5a", {}, [4, 12]);
  ring([0.1, 0.52, -0.356], 0.045, 0.012, "#a08850", {}, [4, 12]);

  // =====================================================================
  // HEAD
  // =====================================================================
  ell([0, 0.99, 0.03], [0.15, 0.15, 0.15], SKINP, {}, [12, 9]);
  ell([0, 0.965, 0.2], [0.045, 0.04, 0.045], SKINP, {}, [8, 6]); // bulbous nose
  for (const s of [1, -1]) {
    ell([s * 0.095, 0.95, 0.13], [0.06, 0.05, 0.05], SKINP, {}, [8, 6]); // cheeks
    ell([s * 0.153, 0.99, 0.02], [0.028, 0.05, 0.04], SKINP, {}, [6, 5]); // ears
    ring([s * 0.158, 0.945, 0.02], 0.018, 0.005, GOLD, { rotation: [0, 90, 0] }, [4, 8]);
    // eyes
    ell([s * 0.055, 1.0, 0.168], [0.022, 0.016, 0.012], EYEW, {}, [8, 6]);
    ell([s * 0.055, 1.0, 0.178], [0.012, 0.012, 0.006], IRIS, {}, [8, 5]);
    ell([s * 0.055, 1.0, 0.1845], [0.006, 0.006, 0.003], INKD, {}, [6, 4]);
    ell([s * 0.05, 1.006, 0.186], [0.003, 0.003, 0.002], EYEW, {}, [4, 3]);
    // brows
    b.rod([s * 0.02, 1.045, 0.16], [s * 0.1, 1.055, 0.115], [0.026, 0.018], BEARD2, { sides: 6 });
    // side whiskers
    ell([s * 0.13, 0.93, 0.08], [0.05, 0.08, 0.07], BEARD, {}, [8, 6]);
  }
  ell([0, 0.98, -0.08], [0.15, 0.16, 0.11], BEARD, {}, [8, 6]); // back hair

  // ---------- beard ----------
  ell([0, 0.85, 0.14], [0.14, 0.12, 0.12], BEARD, {}, [10, 7]);
  const blade = (at: V3, w: number, h: number, sway: number, color: Fill) =>
    b.extrude(
      [
        [-w / 2, 0],
        [w / 2, 0],
        [w * 0.42, -h * 0.55],
        [0, -h, "sharp"],
        [-w * 0.42, -h * 0.55],
      ],
      { at, x: [1, 0, 0], y: [sway, 1, -0.18], thickness: 0.03, bevel: 0.008, smoothing: 1, color },
    );
  [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12].forEach((x, i) => blade([x, 0.9, 0.245], 0.075, 0.13, -x * 2, i % 2 ? BEARD2 : BEARD));
  [-0.09, -0.045, 0, 0.045, 0.09].forEach((x, i) => blade([x, 0.83, 0.25], 0.085, 0.15, -x * 2, i % 2 ? BEARD : BEARD2));
  [-0.05, 0, 0.05].forEach((x, i) => blade([x, 0.76, 0.23], 0.08, 0.12, -x * 2, i % 2 ? BEARD2 : BEARD));
  // moustache
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.012, 0.935, 0.235], [s * 0.07, 0.915, 0.21], [s * 0.125, 0.925, 0.15], [s * 0.14, 0.96, 0.11]]),
      [0.032, 0.012],
      BEARD2,
    );
  }
  // braids
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const y = 0.8 - i * 0.024;
      const x = s * 0.065 + (i % 2 ? 0.01 : -0.01);
      ell([x, y, 0.25], [0.034, 0.022, 0.03], i % 2 ? BEARD : BEARD2, { rotation: [0, 0, i % 2 ? 35 : -35] }, [7, 5]);
    }
    ring([s * 0.065, 0.66, 0.25], 0.026, 0.008, GOLD, { rotation: [90, 0, 0] });
    ring([s * 0.065, 0.76, 0.25], 0.028, 0.006, GOLD, { rotation: [90, 0, 0] }, [4, 10]);
    blade([s * 0.065, 0.65, 0.25], 0.05, 0.06, 0, BEARD2);
    stud([s * 0.065, 0.714, 0.28], 0.012, "#4aa0ff");
  }

  // ---------- helm ----------
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.18, 0.025],
      [0.175, 0.07],
      [0.155, 0.12],
      [0.11, 0.17],
      [0.05, 0.2],
      [0, 0.21],
    ],
    {
      at: [0, 1.07, 0.03],
      segments: 12,
      color: paint((p, n, s) => {
        const trim = s[0] < 0.02;
        return relight(trim ? GOLD : "#8c9ab0", p, n, trim ? "#ffe08a" : "#dce8f8", trim ? "#7a4a10" : "#3b4560");
      }),
    },
  );
  ring([0, 1.082, 0.03], 0.178, 0.016, GOLD, { rotation: [90, 0, 0] }, [5, 16]);
  for (let i = 0; i < 9; i++) {
    const a = (-120 + i * 30) * DEG;
    stud([0.182 * Math.sin(a), 1.082, 0.03 + 0.182 * Math.cos(a)], 0.011);
  }
  b.extrude(
    [
      [-0.13, 0],
      [0.13, 0],
      [0.1, 0.05],
      [0.04, 0.085],
      [-0.06, 0.07],
      [-0.12, 0.04],
    ],
    {
      at: [0, 1.2, 0.03],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: paint((p, n, s) => relight(s[1] > 0.06 ? GOLD : "#8c9ab0", p, n, "#e8f0ff", "#3b4560")),
    },
  );
  b.spike([0, 1.265, 0.03], [0, 1, 0], 0.07, 0.022, GOLD, { sides: 6 });
  // nose guard and neck flap
  b.frustumBox([0, 1.08, 0.208], [0, 1.0, 0.222], [0.02, 0.01], [0.026, 0.01], { color: STEEL });
  ell([0, 1.03, -0.14], [0.13, 0.06, 0.04], LEATH);
  for (const x of [-0.07, 0, 0.07]) stud([x, 1.03, -0.178], 0.01, BRASS);
  // horns
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.17, 1.12, 0.03], [s * 0.25, 1.15, 0.03], [s * 0.3, 1.25, 0.04], [s * 0.28, 1.34, 0.05]]),
      [0.035, 0.008],
      BONE,
      { bands: [[0.14, GOLD]] },
    );
    ring([s * 0.2, 1.135, 0.03], 0.04, 0.008, GOLD, { rotation: [0, 90, -20] }, [4, 10]);
  }
  // goggles
  ring([0, 1.125, 0.03], 0.178, 0.012, LEATH, { rotation: [90, 0, 0] }, [4, 16]);
  for (const s of [1, -1]) {
    ring([s * 0.06, 1.13, 0.212], 0.034, 0.01, BRASS, {}, [5, 10]);
    glow(b.part(new THREE.CircleGeometry(0.028, 8), GLASS, { at: [s * 0.06, 1.13, 0.216], dir: [0, 0, 1], axis: "z" }), 1);
    stud([s * 0.06, 1.168, 0.212], 0.008, STEEL);
  }
  box([0, 1.13, 0.212], [0.03, 0.014, 0.012], BRASS);

  // =====================================================================
  // PAULDRONS
  // =====================================================================
  for (const s of [1, -1]) {
    const cx = s * 0.33;
    b.lathe(
      [
        [0, 0],
        [0.17, 0],
        [0.175, 0.02],
        [0.15, 0.07],
        [0.08, 0.115],
        [0, 0.125],
      ],
      {
        at: [cx, 0.79, 0.0],
        segments: 10,
        color: paint((p, n, sc) => {
          const trim = sc[0] < 0.018;
          return relight(trim ? GOLD : "#8c9ab0", p, n, trim ? "#ffe08a" : "#dce8f8", trim ? "#7a4a10" : "#3b4560");
        }),
      },
    );
    ring([cx, 0.795, 0], 0.175, 0.014, GOLD, { rotation: [90, 0, 0] }, [5, 14]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      stud([cx + 0.14 * Math.cos(a), 0.865, 0.14 * Math.sin(a)], 0.011);
    }
    b.spike([cx, 0.9, 0], [0, 1, 0], 0.1, 0.028, STEEL, { sides: 6 });
    ring([cx, 0.915, 0], 0.03, 0.007, GOLD, { rotation: [90, 0, 0] }, [4, 8]);
    ell([s * 0.31, 0.76, 0.02], [0.1, 0.1, 0.1], COAT);
  }

  // =====================================================================
  // BLUNDERBUSS
  // =====================================================================
  const G0 = new THREE.Vector3(-0.29, 0.6, -0.06);
  const G1 = new THREE.Vector3(0.06, 0.7, 0.8);
  const gp = (t: number) => G0.clone().lerp(G1, t);
  const GD = G1.clone().sub(G0).normalize();
  const WOOD = lit(grain("#8a5530", "#5e3519", { size: 0.012, axis: [GD.x, GD.y, GD.z] }), "#b57a45", "#3a2010");

  b.frustumBox(gp(0), gp(0.27), [0.075, 0.14], [0.05, 0.06], { color: WOOD });
  ell(add(G0, [0, 0, -0.005]), [0.045, 0.078, 0.012], BRASS, { dir: GD, axis: "z" });
  b.part(new THREE.PlaneGeometry(0.12, 0.04), "#ffffff", { at: add(gp(0.1), [0.045, 0.0, 0]), dir: [1, 0, 0], axis: "z", texture: SCROLL });
  // barrel
  b.rod(gp(0.28), gp(0.78), [0.04, 0.033], STEELDARK, { sides: 8 });
  b.rod(gp(0.78), gp(1.0), [0.033, 0.092], paint((p, n, s) => relight(s[0] > 0.86 ? GOLD : STEELD, p, n, s[0] > 0.86 ? "#ffe08a" : "#a5b2c8", "#262d3e")), { sides: 10, caps: "flat" });
  ring(gp(1.0), 0.092, 0.012, BRASS, { dir: GD, axis: "z" }, [5, 12]);
  b.part(new THREE.CircleGeometry(0.082, 10), INKD, { at: add(gp(1.0), [GD.x * 0.004, GD.y * 0.004, GD.z * 0.004]), dir: GD, axis: "z" });
  for (const t of [0.38, 0.5, 0.62, 0.74]) b.rod(gp(t), gp(t + 0.03), 0.048, GOLD, { sides: 8, caps: "flat" });
  b.rod(gp(0.26), gp(0.34), 0.052, BRASS, { sides: 8, caps: "flat" });
  b.spike(add(gp(0.76), [0, 0.035, 0]), [0, 1, 0], 0.03, 0.008, BRASS, { sides: 5 });
  // fore-end, ramrod
  b.rod(add(gp(0.3), [0, -0.035, 0]), add(gp(0.62), [0, -0.035, 0]), [0.04, 0.035], WOOD, { sides: 8 });
  b.rod(add(gp(0.3), [0, -0.075, 0]), add(gp(0.8), [0, -0.068, 0]), 0.007, STEEL, { sides: 5 });
  b.rod(add(gp(0.62), [0, -0.035, 0]), add(gp(0.65), [0, -0.035, 0]), 0.045, BRASS, { sides: 8, caps: "flat" });
  b.rod(add(gp(0.45), [0, -0.07, 0]), add(gp(0.47), [0, -0.07, 0]), 0.014, BRASS, { sides: 6, caps: "flat" });
  // lock, hammer, pan
  for (const s of [1, -1]) {
    ell(add(gp(0.3), [s * 0.035, 0, 0]), [0.012, 0.04, 0.075], BRASS, { dir: GD, axis: "z" });
    stud(add(gp(0.3), [s * 0.045, 0.015, 0.02]), 0.008, STEEL);
  }
  b.rod(add(gp(0.3), [0, 0.04, 0.0]), add(gp(0.27), [0, 0.1, -0.01]), 0.01, STEELDARK, { sides: 5 });
  ell(add(gp(0.27), [0, 0.105, -0.005]), [0.014, 0.02, 0.014], STEELDARK, {}, [6, 4]);
  ell(add(gp(0.33), [0, 0.04, 0]), [0.018, 0.012, 0.03], BRASS, {}, [6, 4]);
  // trigger guard
  b.sweep(
    polyline([add(gp(0.17), [0, -0.04, 0]), add(gp(0.2), [0, -0.085, 0]), add(gp(0.27), [0, -0.085, 0]), add(gp(0.3), [0, -0.04, 0])]),
    0.008,
    BRASS,
    { sides: 5 },
  );
  b.rod(add(gp(0.24), [0, -0.04, 0]), add(gp(0.245), [0, -0.07, 0]), 0.006, STEELDARK, { sides: 4 });
  // sling studs
  stud(add(gp(0.04), [0, -0.07, 0]), 0.012, BRASS);
  stud(add(gp(0.6), [0, -0.075, 0]), 0.012, BRASS);

  // =====================================================================
  // ARMS AND HANDS
  // =====================================================================
  const armL = [[0.31, 0.76, 0.02], [0.38, 0.6, 0.15], [-0.04, 0.6, 0.4]];
  const armR = [[-0.31, 0.76, 0.02], [-0.4, 0.62, -0.06], [-0.3, 0.6, 0.02]];
  for (const arm of [armL, armR]) {
    b.sweep(catmull(arm), [0.085, 0.07, 0.062], sleeveP(arm[1]));
    const E = vv(arm[1]);
    const W = vv(arm[2]);
    const m1 = E.clone().lerp(W, 0.5);
    const m2 = E.clone().lerp(W, 0.85);
    b.rod(m1, m2, 0.074, STEEL, { sides: 8 });
    for (const t of [0.5, 0.83]) b.rod(E.clone().lerp(W, t), E.clone().lerp(W, t + 0.035), 0.078, GOLD, { sides: 8, caps: "flat" });
    stud(E.clone().lerp(W, 0.67).add(new THREE.Vector3(0, 0.07, 0)), 0.01, BRASS);
  }
  const hand = (c: V3, out: number) => {
    ell(c, [0.072, 0.064, 0.078], lit("#7a4a28", "#b07a48", "#3a2010"), {}, [9, 7]);
    for (let i = 0; i < 4; i++) {
      ell(add(c, [out * 0.05, 0.01 - i * 0.004, (i - 1.5) * 0.03]), [0.022, 0.026, 0.019], LEATH, {}, [6, 5]);
    }
    ell(add(c, [-out * 0.02, 0.06, 0.0]), [0.025, 0.02, 0.04], LEATH, {}, [6, 5]);
    ring(add(c, [0, 0, -0.065]), 0.06, 0.012, "#3a2112", { rotation: [0, 0, 0] }, [4, 8]);
  };
  hand([-0.102, 0.6, 0.4175], 1);
  hand([-0.24, 0.6, 0.07], -1);

  return b.root;
}
