import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull, spiral } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A stout, bearded gnome inventor in a drooping red hat and brass goggles, hauling a steampunk backpack of boiler, gears, clock, lantern, flask, coil and bedroll. Faceted low-poly masses with storybook proportions.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

const SKIN = "#f0b494";
const PINK = "#e8908a";
const CHEEK = "#f09a8c";
const CREAM = "#efe6cf";
const BEARD_SH = "#c4b99c";
const HAT = "#b8483c";
const HAT_D = "#8e3330";
const LEATHER = "#7a4a2a";
const LEATHER_D = "#553220";
const VEST = "#8a5a30";
const OLIVE = "#6b6e35";
const BRASS = "#c8962e";
const BRASS_D = "#8f6a1e";
const COPPER = "#b8642e";
const GLASS = "#4fd0d4";
const AMBER = "#ffb040";
const STEEL = "#a9b0b5";
const DARK = "#2b1c12";
const WHITE = "#fbf8ee";
const TEAL = "#2fc9b0";
const SOLE = "#3a2418";

const gearOutline = (teeth: number, ro: number, ri: number) => {
  const pts: Array<[number, number]> = [];
  const step = (Math.PI * 2) / teeth;
  for (let k = 0; k < teeth; k++)
    for (const [f, r] of [
      [0.0, ri],
      [0.2, ro],
      [0.5, ro],
      [0.7, ri],
    ] as const)
      pts.push([Math.cos((k + f) * step) * r, Math.sin((k + f) * step) * r]);
  return pts as OutlinePoint[];
};

const clockTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#f6efd8" stroke="#6b4a1a" stroke-width="6"/>${Array.from(
    { length: 12 },
    (_, i) => {
      const a = (i * Math.PI) / 6;
      return `<line x1="${50 + Math.sin(a) * 36}" y1="${50 - Math.cos(a) * 36}" x2="${50 + Math.sin(a) * 42}" y2="${50 - Math.cos(a) * 42}" stroke="#3a2418" stroke-width="4"/>`;
    },
  ).join("")}<line x1="50" y1="50" x2="50" y2="22" stroke="#2b1c12" stroke-width="5"/><line x1="50" y1="50" x2="68" y2="58" stroke="#2b1c12" stroke-width="5"/><circle cx="50" cy="50" r="5" fill="#b8483c"/></svg>`,
  { size: 128 },
);
const gaugeTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#f6efd8" stroke="#5a3a10" stroke-width="7"/><path d="M18 66 A36 36 0 0 1 50 14" stroke="#3aa860" stroke-width="9" fill="none"/><path d="M50 14 A36 36 0 0 1 82 66" stroke="#d04a30" stroke-width="9" fill="none"/><line x1="50" y1="56" x2="66" y2="30" stroke="#2b1c12" stroke-width="5"/><circle cx="50" cy="56" r="6" fill="#2b1c12"/></svg>`,
  { size: 128 },
);
const patchTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#6a4020" stroke="#c8962e" stroke-width="7"/><circle cx="50" cy="50" r="14" fill="none" stroke="#e8c060" stroke-width="7"/>${Array.from(
    { length: 8 },
    (_, i) => {
      const a = (i * Math.PI) / 4;
      return `<line x1="${50 + Math.sin(a) * 18}" y1="${50 - Math.cos(a) * 18}" x2="${50 + Math.sin(a) * 33}" y2="${50 - Math.cos(a) * 33}" stroke="#e8c060" stroke-width="9"/>`;
    },
  ).join("")}</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });
  const R = rng(7);
  const P = (g: THREE.BufferGeometry, c: string | ReturnType<typeof grain>, at: number[], bone: Joint, o: PartOptions = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.44, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.46, 0],
      [0, 0.6, 0.01],
      [0, 0.74, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.74, 0], aim: [0, 0.84, 0.03], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.82, 0.03], aim: [0, 0.98, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.86, 0.06], aim: [0, 0.85, 0.2], role: "jaw" });
  const pack = b.joint("pack", { parent: chest, at: [0, 0.62, -0.17], dir: [0, 1, 0], role: "hinge" });

  // ---------- torso ----------
  const VESTP = grain(VEST, LEATHER, { size: 0.02, axis: "y" });
  const torso = b.sweep(spine, (t) => [0.15 - 0.025 * t, 0.135 - 0.02 * t] as const, {
    color: VESTP,
    sectors: [[150, 210, CREAM]],
    sides: 8,
    smooth: false,
  });
  // tunic skirt
  b.lathe(
    [
      [0.15, 0.0],
      [0.225, -0.16],
      [0.235, -0.16],
      [0.16, 0.0],
    ],
    {
      at: [0, 0.5, 0],
      bone: hips,
      segments: 10,
      color: paint((p) => (p.y < 0.35 ? BRASS_D : p.y < 0.37 ? LEATHER_D : VEST)),
    },
  );
  // belt and buckle
  b.lathe(
    [
      [0.152, -0.025],
      [0.168, -0.025],
      [0.168, 0.025],
      [0.152, 0.025],
    ],
    { at: [0, 0.5, 0], bone: spine.joints[0], segments: 10, color: LEATHER_D },
  );
  P(box(0.06, 0.05, 0.016), BRASS, [0, 0.5, 0.17], spine.joints[0]);
  P(box(0.035, 0.028, 0.02), LEATHER_D, [0, 0.5, 0.175], spine.joints[0]);
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    bone: chest,
    at: [0.07, 0.62, 0.12],
    dir: [0, 0.1, 1],
    axis: "z",
    texture: patchTex,
  });
  for (const s of [1, -1]) {
    // straps over shoulders
    const rough = catmull([
      [s * 0.1, 0.56, -0.14],
      [s * 0.1, 0.78, -0.08],
      [s * 0.09, 0.76, 0.12],
      [s * 0.07, 0.52, 0.14],
    ]);
    b.sweep(b.surface(torso).drape(rough, { lift: 0.008 }), 0.016, LEATHER_D, { sides: 5, smooth: false });
    // pouches
    P(box(0.06, 0.09, 0.11), LEATHER_D, [s * 0.215, 0.43, 0.04], hips);
    P(box(0.064, 0.03, 0.115), LEATHER, [s * 0.215, 0.465, 0.04], hips);
    P(sph(0.011, 5, 4), BRASS, [s * 0.248, 0.45, 0.04], hips);
  }
  // tool pouch with tools
  P(box(0.11, 0.09, 0.05), LEATHER_D, [0.1, 0.43, 0.185], hips, { rotation: [0, 12, 0] });
  P(box(0.114, 0.03, 0.054), LEATHER, [0.1, 0.465, 0.185], hips, { rotation: [0, 12, 0] });
  P(sph(0.011, 5, 4), BRASS, [0.1, 0.44, 0.215], hips);
  b.rod([0.08, 0.46, 0.185], [0.075, 0.585, 0.19], 0.009, STEEL, { bone: hips, sides: 5 });
  P(new THREE.TorusGeometry(0.02, 0.008, 4, 6), STEEL, [0.075, 0.6, 0.19], hips, { rotation: [90, 0, 0] });
  b.rod([0.115, 0.46, 0.185], [0.13, 0.57, 0.185], 0.008, STEEL, { bone: hips, sides: 5 });
  b.rod([0.13, 0.57, 0.185], [0.135, 0.6, 0.185], 0.015, COPPER, { bone: hips, sides: 5 });
  b.rod([0.145, 0.46, 0.185], [0.16, 0.55, 0.18], 0.007, BRASS, { bone: hips, sides: 5 });

  // ---------- neck ----------
  b.rod([0, 0.74, 0.0], [0, 0.83, 0.03], 0.055, SKIN, { bone: neck, sides: 6, smooth: false });

  // ---------- head ----------
  P(sph(0.14, 10, 8), SKIN, [0, 0.93, 0.04], head);
  P(sph(0.042, 7, 5), PINK, [0, 0.912, 0.195], head);
  for (const s of [1, -1]) {
    P(sph(0.03, 6, 4), CHEEK, [s * 0.088, 0.9, 0.145], head);
    P(sph(0.027, 7, 5), WHITE, [s * 0.058, 0.95, 0.158], head, { scale: [1, 1.1, 0.7] });
    P(sph(0.015, 6, 4), DARK, [s * 0.058, 0.948, 0.173], head);
    P(sph(0.005, 4, 3), WHITE, [s * 0.053, 0.955, 0.186], head);
    b.rod([s * 0.09, 0.985, 0.16], [s * 0.03, 0.992, 0.172], 0.014, CREAM, { bone: head, sides: 5, caps: "round" });
    // mustache
    b.capsule([s * 0.012, 0.888, 0.195], [s * 0.1, 0.868, 0.165], 0.022, CREAM, { bone: head, sides: 6 });
    b.capsule([s * 0.1, 0.868, 0.165], [s * 0.125, 0.89, 0.15], 0.015, CREAM, { bone: head, sides: 5 });
    // ears
    b.spike([s * 0.125, 0.94, 0.03], [s * 1, 0.4, -0.5], 0.17, 0.05, SKIN, { bone: head, sides: 6 });
    b.spike([s * 0.13, 0.94, 0.045], [s * 1, 0.4, -0.5], 0.12, 0.028, PINK, { bone: head, sides: 5 });
    // hair tufts
    b.spike([s * 0.13, 0.99, 0.0], [s * 1, -0.2, -0.3], 0.1, 0.025, CREAM, { bone: head, sides: 5 });
    b.spike([s * 0.12, 0.96, -0.05], [s * 0.8, -0.5, -0.5], 0.09, 0.025, BEARD_SH, { bone: head, sides: 5 });
    // goggles
    const g = [s * 0.07, 1.05, 0.168];
    P(cyl(0.044, 0.044, 0.03, 8), BRASS, g, head, { dir: [0, 0.15, 1] });
    glow(P(cyl(0.032, 0.032, 0.03, 8), GLASS, [s * 0.07, 1.052, 0.18], head, { dir: [0, 0.15, 1] }), 1.1);
  }
  P(sph(0.02, 6, 4), PINK, [0, 0.935, 0.2], head, { scale: [1.2, 0.5, 0.8] });
  // hat
  const hatPaint = mottle(HAT, HAT_D, { size: 0.08, contrast: 1.2 });
  b.sweep(
    catmull([
      [0, 1.01, 0.02],
      [0, 1.1, 0.0],
      [0, 1.18, -0.06],
      [0, 1.23, -0.17],
      [0, 1.22, -0.27],
    ]),
    [0.17, 0.145, 0.1, 0.06, 0.022],
    { bone: head, color: hatPaint, section: { ngon: 7 }, caps: { start: "flat", end: "point" } },
  );
  P(new THREE.TorusGeometry(0.162, 0.013, 4, 14), LEATHER_D, [0, 1.03, 0.02], head, { rotation: [90, 0, 0] });
  P(box(0.04, 0.04, 0.02), BRASS, [0, 1.035, 0.185], head);
  P(box(0.022, 0.024, 0.024), LEATHER_D, [0, 1.035, 0.19], head);
  b.rod([-0.07, 1.05, 0.168], [0.07, 1.05, 0.168], 0.01, LEATHER_D, { bone: head, sides: 5 });

  // ---------- jaw and beard ----------
  P(sph(0.075, 8, 6), SKIN, [0, 0.855, 0.1], jaw, { scale: [1.1, 0.8, 1] });
  P(box(0.07, 0.014, 0.05), "#6b2a2a", [0, 0.862, 0.165], jaw);
  const BEARD = grain(CREAM, BEARD_SH, { size: 0.02, axis: [0, 1, 0] });
  for (let row = 0; row < 3; row++) {
    const n = 8 - row;
    for (let i = 0; i < n; i++) {
      const th = ((i / (n - 1)) * 2 - 1) * (1.2 - 0.1 * row);
      const c = Math.cos(th);
      const len = (0.13 + 0.15 * c + 0.05 * row) * (0.9 + 0.2 * R());
      b.spike(
        [Math.sin(th) * (0.1 - 0.01 * row), 0.88 - 0.03 * row, 0.07 + c * (0.09 - 0.015 * row)],
        [Math.sin(th) * 0.5, -1, 0.12],
        len,
        0.05 - 0.006 * row,
        BEARD,
        { bone: jaw, sides: 6 },
      );
    }
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${L}`,
      catmull([
        [s * 0.19, 0.7, 0.0],
        [s * 0.27, 0.56, 0.0],
        [s * 0.3, 0.43, 0.06],
      ]),
      { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" },
    );
    b.sweep(arm, (t) => 0.06 - 0.012 * t, { color: CREAM, sides: 7, smooth: false });
    b.rod(arm.at(0.8), arm.at(1), 0.066, LEATHER, { sides: 7, smooth: false });
    const wrist = arm.joints[arm.joints.length - 1];
    P(sph(0.034, 5, 4), BRASS, [s * 0.296, 0.45, 0.09], wrist);
    P(sph(0.066, 7, 5), LEATHER, [s * 0.3, 0.395, 0.07], wrist);
    const fingers = b.chain(
      `fingers${L}`,
      catmull([
        [s * 0.3, 0.37, 0.075],
        [s * 0.305, 0.31, 0.095],
        [s * 0.305, 0.26, 0.105],
      ]),
      { parent: wrist, names: [`finger${L}1`, `finger${L}2`, `finger${L}3`], role: "digit" },
    );
    b.sweep(fingers, (t) => [0.05 - 0.012 * t, 0.024] as const, { color: LEATHER, section: "box", caps: "flat" });
    const thumb = b.chain(
      `thumb${L}`,
      catmull([
        [s * 0.27, 0.4, 0.09],
        [s * 0.255, 0.35, 0.13],
      ]),
      { parent: wrist, names: [`thumb${L}`, `thumbTip${L}`], role: "digit" },
    );
    b.sweep(thumb, [0.025, 0.018], { color: LEATHER, sides: 5, smooth: false });
  }

  // ---------- legs ----------
  const BOOTP = mottle(LEATHER, LEATHER_D, { size: 0.05 });
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      catmull([
        [s * 0.09, 0.44, 0],
        [s * 0.1, 0.26, 0.03],
        [s * 0.1, 0.1, 0.0],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" },
    );
    b.sweep(leg, (t) => 0.08 - 0.018 * t, { color: OLIVE, sides: 7, smooth: false });
    b.rod(leg.at(0.62), leg.at(1), 0.07, BOOTP, { sides: 7, smooth: false });
    b.rod(leg.at(0.58), leg.at(0.68), 0.082, LEATHER_D, { sides: 7, smooth: false });
    const ankle = leg.joints[leg.joints.length - 1];
    P(box(0.15, 0.1, 0.27), BOOTP, [s * 0.1, 0.05 + 0.025, 0.06], ankle);
    P(sph(0.075, 7, 5), BOOTP, [s * 0.1, 0.06, 0.18], ankle, { scale: [1, 0.85, 1] });
    P(box(0.16, 0.025, 0.31), SOLE, [s * 0.1, 0.0125, 0.075], ankle);
    P(box(0.15, 0.03, 0.03), SOLE, [s * 0.1, 0.04, 0.0], ankle);
    P(box(0.055, 0.04, 0.014), BRASS, [s * 0.1, 0.19, 0.07], ankle);
    b.rod([s * 0.1 - 0.05, 0.16, 0.05], [s * 0.1 + 0.05, 0.16, 0.05], 0.011, LEATHER_D, { bone: ankle, sides: 5 });
    P(box(0.04, 0.035, 0.014), BRASS, [s * 0.1, 0.16, 0.12], ankle);
    P(sph(0.012, 5, 4), BRASS, [s * 0.1 + s * 0.05, 0.16, 0.1], ankle);
  }

  // ---------- backpack ----------
  const PACKP = grain(LEATHER, LEATHER_D, { size: 0.02, axis: "y" });
  P(box(0.3, 0.38, 0.2), PACKP, [0, 0.66, -0.22], pack);
  P(box(0.31, 0.05, 0.21), LEATHER, [0, 0.865, -0.22], pack);
  for (const y of [0.57, 0.77]) {
    P(box(0.315, 0.03, 0.205), LEATHER_D, [0, y, -0.22], pack);
    P(box(0.04, 0.04, 0.012), BRASS, [0, y, -0.327], pack);
  }
  for (const sx of [1, -1])
    for (const y of [0.49, 0.83]) {
      P(box(0.025, 0.07, 0.025), BRASS_D, [sx * 0.15, y, -0.12], pack);
      P(sph(0.012, 5, 4), BRASS, [sx * 0.15, y + 0.04, -0.12], pack);
      P(sph(0.012, 5, 4), BRASS, [sx * 0.15, y - 0.04, -0.32], pack);
    }
  // boiler
  P(sph(0.115, 10, 7), BRASS, [-0.04, 0.99, -0.22], pack);
  P(new THREE.TorusGeometry(0.113, 0.009, 4, 12), BRASS_D, [-0.04, 0.99, -0.22], pack, { rotation: [90, 0, 0] });
  P(new THREE.TorusGeometry(0.095, 0.008, 4, 12), BRASS_D, [-0.04, 1.04, -0.22], pack, { rotation: [90, 0, 0], scale: [1, 1, 1] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    P(sph(0.01, 4, 3), BRASS_D, [-0.04 + Math.cos(a) * 0.113, 0.99, -0.22 + Math.sin(a) * 0.113], pack);
  }
  P(cyl(0.048, 0.048, 0.02, 10), BRASS_D, [-0.04, 0.99, -0.335], pack, { dir: [0, 0, -1] });
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    bone: pack,
    at: [-0.04, 0.99, -0.347],
    dir: [0, 0, -1],
    axis: "z",
    texture: gaugeTex,
  });
  // chimney
  P(cyl(0.028, 0.04, 0.22, 8), BRASS, [0.09, 1.02, -0.25], pack);
  P(cyl(0.045, 0.045, 0.025, 8), BRASS_D, [0.09, 0.96, -0.25], pack);
  P(cyl(0.045, 0.034, 0.04, 8), BRASS_D, [0.09, 1.145, -0.25], pack);
  P(new THREE.ConeGeometry(0.04, 0.05, 8), BRASS, [0.09, 1.19, -0.25], pack);
  glow(P(sph(0.014, 5, 4), AMBER, [0.09, 1.225, -0.25], pack), 1.4);
  // gears
  const gear1 = b.extrude(gearOutline(10, 0.095, 0.075), {
    at: [0.07, 0.8, -0.33],
    x: [1, 0, 0],
    thickness: 0.022,
    bone: pack,
    color: BRASS,
  });
  P(cyl(0.02, 0.02, 0.05, 6), BRASS_D, [0.07, 0.8, -0.34], pack, { dir: [0, 0, 1], axis: "y", rotation: [90, 0, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI;
    b.rod([0.07 + Math.cos(a) * 0.07, 0.8 + Math.sin(a) * 0.07, -0.345], [0.07 - Math.cos(a) * 0.07, 0.8 - Math.sin(a) * 0.07, -0.345], 0.008, BRASS_D, {
      bone: pack,
      sides: 4,
    });
  }
  b.extrude(gearOutline(7, 0.055, 0.042), {
    at: [0.17, 0.74, -0.33],
    x: [1, 0, 0],
    thickness: 0.02,
    bone: pack,
    color: COPPER,
  });
  P(cyl(0.012, 0.012, 0.04, 6), BRASS_D, [0.17, 0.74, -0.34], pack, { rotation: [90, 0, 0] });
  void gear1;
  // clock
  P(cyl(0.068, 0.068, 0.025, 10), BRASS, [-0.08, 0.7, -0.322], pack, { dir: [0, 0, -1] });
  b.part(new THREE.PlaneGeometry(0.108, 0.108), "#ffffff", {
    bone: pack,
    at: [-0.08, 0.7, -0.337],
    dir: [0, 0, -1],
    axis: "z",
    texture: clockTex,
  });
  // lantern (left side)
  const lx = 0.215;
  P(cyl(0.05, 0.06, 0.03, 8), BRASS, [lx, 0.545, -0.22], pack);
  glow(P(box(0.07, 0.1, 0.07), AMBER, [lx, 0.61, -0.22], pack), 1.3);
  for (const [dx, dz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ])
    b.rod([lx + dx * 0.037, 0.56, -0.22 + dz * 0.037], [lx + dx * 0.037, 0.665, -0.22 + dz * 0.037], 0.007, BRASS_D, { bone: pack, sides: 4 });
  P(new THREE.ConeGeometry(0.06, 0.05, 6), BRASS, [lx, 0.69, -0.22], pack);
  P(new THREE.TorusGeometry(0.02, 0.005, 4, 8), BRASS_D, [lx, 0.725, -0.22], pack);
  // flask (right side)
  const fx = -0.205;
  P(cyl(0.048, 0.048, 0.12, 8), BRASS_D, [fx, 0.545, -0.22], pack, { scale: [1, 0.25, 1] });
  glow(P(cyl(0.045, 0.045, 0.11, 8), TEAL, [fx, 0.61, -0.22], pack), 1.2);
  P(cyl(0.02, 0.02, 0.05, 6), "#cfe8e4", [fx, 0.69, -0.22], pack);
  P(cyl(0.022, 0.02, 0.025, 6), LEATHER, [fx, 0.73, -0.22], pack);
  P(cyl(0.05, 0.05, 0.014, 8), BRASS, [fx, 0.66, -0.22], pack);
  // bedroll
  P(cyl(0.05, 0.05, 0.36, 8), CREAM, [0, 0.44, -0.27], pack, { rotation: [0, 0, 90] });
  for (const x of [-0.11, 0.11]) P(cyl(0.056, 0.056, 0.03, 8), LEATHER_D, [x, 0.44, -0.27], pack, { rotation: [0, 0, 90] });
  P(sph(0.012, 5, 4), BRASS, [0.11, 0.44, -0.325], pack);
  P(sph(0.012, 5, 4), BRASS, [-0.11, 0.44, -0.325], pack);
  // copper coil, pipes, antenna
  b.sweep(spiral([-0.12, 1.1, -0.22], [-0.09, 1.1, -0.22], [0, 1, 0], { turns: 3.5, r1: 0.03, pitch: 0.035 }), 0.007, COPPER, {
    bone: pack,
    sides: 5,
  });
  b.sweep(
    catmull([
      [-0.04, 1.1, -0.22],
      [-0.12, 1.12, -0.2],
      [-0.2, 0.96, -0.2],
      [-0.215, 0.78, -0.22],
    ]),
    0.009,
    COPPER,
    { bone: pack, sides: 5 },
  );
  b.sweep(
    catmull([
      [0.2, 0.55, -0.3],
      [0.26, 0.6, -0.3],
      [0.25, 0.75, -0.28],
      [0.14, 0.9, -0.24],
    ]),
    0.01,
    BRASS_D,
    { bone: pack, sides: 5 },
  );
  b.rod([-0.12, 0.88, -0.3], [-0.14, 1.15, -0.31], 0.006, STEEL, { bone: pack, sides: 4 });
  glow(P(sph(0.017, 5, 4), TEAL, [-0.14, 1.17, -0.31], pack), 1.4);
  // small horn / funnel and tool rack
  P(new THREE.ConeGeometry(0.045, 0.1, 7), BRASS, [0.2, 0.94, -0.28], pack, { rotation: [0, 0, -60] });
  b.rod([0.15, 0.5, -0.33], [0.1, 0.78, -0.335], 0.008, STEEL, { bone: pack, sides: 5 });
  P(new THREE.TorusGeometry(0.02, 0.007, 4, 6), STEEL, [0.095, 0.805, -0.335], pack);

  return b.root;
}
