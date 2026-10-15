import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { lerp } from "../../../../src/math";
import { catmull, polyline, spiral } from "../../../../src/path";
import { countershade, grain, mottle } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A knee-high gnome inventor in a floppy red hat and goggles, snowy beard to the belt, hauling a backpack of meshing gears, a telescope, a spinning propeller, a lantern, a dish antenna and a rack of tools.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SKIN = "#f4b79c";
const NOSE = "#ee8774";
const BLUSH = "#f27f7a";
const BEARD = "#f6f1e4";
const BEARD2 = "#d6cfba";
const HAT = "#d8402f";
const HAT2 = "#f0634a";
const HAT_D = "#9c2a2a";
const TEAL = "#2fa096";
const TEAL2 = "#58c2b0";
const TEAL_D = "#1d6f72";
const PANTS = "#e2a73c";
const PANTS_D = "#b97b25";
const BOOT = "#7a4528";
const BOOT2 = "#52301d";
const CUFF = "#f3e3b8";
const LEATHER = "#a96b3b";
const LEATHER2 = "#7e4b2a";
const LEATHER_D = "#5e371f";
const BRASS = "#e0aa3e";
const BRASS_D = "#a8741f";
const COPPER = "#cf7a47";
const STEEL = "#9aa7b3";
const STEEL_D = "#5f6b78";
const CANVAS = "#d8c08a";
const DARK = "#2b2230";
const CYAN = "#6be3ff";
const AMBER = "#ffc04d";
const RED_L = "#ff5a4a";
const BLUEPRINT = "#3f78c4";
const GLOVE = "#c98a4b";
const GLOVE_D = "#8a5a30";
const WHITE = "#ffffff";
const GREEN = "#79b94a";
const ORANGE = "#ee7b30";
const YELLOW = "#f2cf3f";

// ---------------------------------------------------------------------------------------------------------------
// Helpers
function gearOutline(R: number, teeth: number): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  const d = (2 * Math.PI) / teeth;
  const root = R * 0.78;
  for (let i = 0; i < teeth; i++) {
    const a = i * d;
    for (const [r, k] of [
      [root, 0],
      [R, 0.12],
      [R, 0.38],
      [root, 0.5],
    ]) {
      out.push([Math.cos(a + k * d) * r, Math.sin(a + k * d) * r]);
    }
  }
  return out;
}

function starPoints(cx: number, cy: number, ro: number, ri: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(" ");
}

const ringPts = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 10) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy, cz + Math.sin(a) * rz];
  });

const lerpArr = (arr: number[], t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (arr.length - 1);
  const i = Math.min(Math.floor(x), arr.length - 2);
  return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
};

// Textures ------------------------------------------------------------------------------------------------------
function dialTexture() {
  const ticks: string[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI * 1.25 - (i * Math.PI * 1.5) / 8;
    const x1 = 32 + Math.cos(a) * 22;
    const y1 = 32 - Math.sin(a) * 22;
    const x2 = 32 + Math.cos(a) * 28;
    const y2 = 32 - Math.sin(a) * 28;
    ticks.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2b2230" stroke-width="2.2"/>`);
  }
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#f3e8c8" stroke="#2b2230" stroke-width="2"/>
      <path d="M32 32 L52 46 A25 25 0 0 0 57 32 Z" fill="#e8553f" opacity="0.9"/>
      ${ticks.join("")}
      <line x1="32" y1="32" x2="20" y2="17" stroke="#2b2230" stroke-width="2.6"/>
      <circle cx="32" cy="32" r="4" fill="#a8741f" stroke="#2b2230" stroke-width="1.5"/>
    </svg>`,
    { size: 128 },
  );
}

function starPatchTexture() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#c44b3a" stroke="#f3e3b8" stroke-width="3"/>
      <circle cx="32" cy="32" r="25" fill="none" stroke="#f3e3b8" stroke-width="1.6" stroke-dasharray="4 3"/>
      <polygon points="${starPoints(32, 34, 17, 7.5)}" fill="#f3e3b8" stroke="#8a2f25" stroke-width="1.4"/>
    </svg>`,
    { size: 128 },
  );
}

function squarePatchTexture() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="60" rx="5" fill="#c9a15b" stroke="#6b3f2a" stroke-width="2.4"/>
      <rect x="8" y="8" width="48" height="48" fill="none" stroke="#6b3f2a" stroke-width="1.8" stroke-dasharray="5 3"/>
      <line x1="18" y1="18" x2="46" y2="46" stroke="#6b3f2a" stroke-width="2.4"/>
      <line x1="46" y1="18" x2="18" y2="46" stroke="#6b3f2a" stroke-width="2.4"/>
    </svg>`,
    { size: 128 },
  );
}

function hatBadgeTexture() {
  const pts = gearOutline(27, 8)
    .map((p) => `${(32 + p[0]).toFixed(2)},${(32 - p[1]).toFixed(2)}`)
    .join(" ");
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <polygon points="${pts}" fill="#f3e3b8" stroke="#6b2a1f" stroke-width="2.4"/>
      <circle cx="32" cy="32" r="13" fill="#2b2230"/>
      <circle cx="32" cy="32" r="6" fill="#e0aa3e"/>
    </svg>`,
    { size: 128 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });

  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (r0: number, r1: number, h: number, s = 8) => new THREE.CylinderGeometry(r0, r1, h, s);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (geo: THREE.BufferGeometry, color: string | Paint, at: number[], bone: Joint, o: PartOptions = {}) =>
    b.part(geo, color, { flat: true, at, bone, ...o });
  const studs = (pts: number[][], r: number, color: string, bone: Joint) => {
    const g = mergeGeometries(pts.map((p) => new THREE.SphereGeometry(r, 6, 4).translate(p[0], p[1], p[2])));
    if (g) b.part(g, color, { bone, at: [0, 0, 0] });
  };

  // Paints ------------------------------------------------------------------------------------------------------
  const TUNIC = countershade(mottle(TEAL, TEAL2, { size: 0.07, contrast: 0.8 }), TEAL_D, { level: -0.35 });
  const PANTS_P = countershade(mottle(PANTS, PANTS_D, { size: 0.05, contrast: 0.7 }), PANTS_D, { level: -0.6 });
  const BOOT_P = mottle(BOOT, BOOT2, { size: 0.05 });
  const LEATHER_P = mottle(LEATHER, LEATHER2, { size: 0.06 });
  const LEATHER2_P = mottle(LEATHER2, LEATHER_D, { size: 0.05 });
  const HAT_P = countershade(mottle(HAT, HAT2, { size: 0.1, contrast: 0.7 }), HAT_D, { level: -0.3 });
  const BEARD_P = grain(BEARD, BEARD2, { size: 0.02, axis: "y" });
  const CANVAS_P = grain(CANVAS, "#b89f68", { size: 0.015, axis: "x" });

  const DIAL = dialTexture();
  const STAR = starPatchTexture();
  const SQUARE = squarePatchTexture();
  const BADGE = hatBadgeTexture();

  // Skeleton ----------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.38, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.38, 0],
      [0, 0.5, 0.01],
      [0, 0.62, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.72, 0.03], dir: [0, 1, 0.15], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.78, 0.045], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.87, 0.04], dir: [0, -0.3, 1], role: "jaw" });

  // Torso ---------------------------------------------------------------------------------------------------
  const torso = b.sweep(
    spine,
    (t) => [0.14 + 0.03 * Math.sin(Math.PI * t), 0.115 + 0.025 * Math.sin(Math.PI * t)],
    { color: TUNIC, sides: 10, name: "torso" },
  );
  void torso;
  // Skirt flare, hem trim
  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.2, 0.02],
      [0.15, 0.14],
      [0, 0.14],
    ],
    { at: [0, 0.25, 0], bone: hips, color: TUNIC, segments: 10, name: "skirt" },
  );
  b.sweep(catmull(ringPts(0, 0.264, 0, 0.202, 0.202, 10), { closed: true }), 0.014, {
    color: CUFF,
    bone: hips,
    sides: 6,
    name: "hemTrim",
  });
  b.sweep(catmull(ringPts(0, 0.31, 0, 0.18, 0.18, 10), { closed: true }), 0.008, {
    color: TEAL_D,
    bone: hips,
    sides: 5,
    name: "hemStitch",
  });
  // Collar
  b.sweep(catmull(ringPts(0, 0.715, 0.03, 0.105, 0.095, 8), { closed: true }), 0.022, {
    color: CUFF,
    bone: chest,
    sides: 6,
    name: "collar",
  });
  // Belt, buckle, apron
  b.sweep(catmull(ringPts(0, 0.43, 0.01, 0.172, 0.142, 10), { closed: true }), 0.022, {
    color: LEATHER_D,
    bone: spine1,
    sides: 6,
    name: "belt",
  });
  put(box(0.07, 0.055, 0.02), BRASS, [0, 0.43, 0.158], spine1);
  put(box(0.04, 0.026, 0.024), DARK, [0, 0.43, 0.16], spine1);
  b.frustumBox([0, 0.42, 0.17], [0, 0.23, 0.218], [0.25, 0.02], [0.31, 0.02], {
    color: LEATHER_P,
    bone: spine1,
    name: "apron",
    up: [0, 0, 1],
  });
  studs(
    [
      [-0.11, 0.405, 0.185],
      [0.11, 0.405, 0.185],
      [-0.135, 0.27, 0.215],
      [0.135, 0.27, 0.215],
    ],
    0.009,
    BRASS,
    spine1,
  );
  // Apron pocket
  put(box(0.1, 0.07, 0.014), LEATHER2_P, [0, 0.31, 0.213], spine1, { rotation: [18, 0, 0] });
  put(box(0.1, 0.018, 0.018), LEATHER_D, [0, 0.343, 0.213], spine1, { rotation: [18, 0, 0] });
  // Tools in apron pocket
  b.rod([-0.025, 0.33, 0.215], [-0.03, 0.4, 0.2], 0.008, { color: RED_L, bone: spine1 });
  b.rod([0.02, 0.33, 0.215], [0.03, 0.4, 0.2], 0.008, { color: BLUEPRINT, bone: spine1 });

  // Pack straps over the shoulders
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.1, 0.78, -0.14],
        [s * 0.1, 0.76, -0.08],
        [s * 0.1, 0.735, -0.01],
        [s * 0.1, 0.7, 0.075],
        [s * 0.1, 0.62, 0.125],
        [s * 0.1, 0.5, 0.145],
        [s * 0.1, 0.44, 0.155],
      ]),
      () => [0.026, 0.01],
      { color: LEATHER2_P, section: "box", caps: "flat", bone: chest, name: s > 0 ? "strapL" : "strapR" },
    );
    studs(
      [
        [s * 0.1, 0.6, 0.13],
        [s * 0.1, 0.52, 0.152],
      ],
      0.01,
      BRASS,
      chest,
    );
  }
  // Chest strap
  b.rod([0.1, 0.6, 0.135], [-0.1, 0.6, 0.135], 0.008, { color: LEATHER_D, bone: chest });

  // Legs --------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.09, 0.37, 0],
        [s * 0.09, 0.2, 0.03],
        [s * 0.09, 0.07, 0],
        [s * 0.09, 0.065, 0.09],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`], role: "leg" },
    );
    const knee = leg.joints[1];
    const foot = leg.joints[3];
    b.sweep(
      leg,
      (t) => (t < 0.56 ? 0.068 - 0.012 * (t / 0.56) : t < 0.62 ? 0.056 + 0.016 * ((t - 0.56) / 0.06) : 0.072 - 0.008 * ((t - 0.62) / 0.38)),
      {
        sides: 8,
        bands: [
          [0.58, PANTS_P],
          [0.66, CUFF],
          [1, BOOT_P],
        ],
        name: `legTube${S}`,
      },
    );
    // sole and toe cap
    put(box(0.15, 0.026, 0.26), BOOT2, [s * 0.09, 0.013, 0.045], foot);
    put(sph(0.046, 8, 5), BOOT2, [s * 0.09, 0.052, 0.13], foot, { scale: [1.15, 0.8, 1] });
    put(box(0.06, 0.03, 0.01), LEATHER2, [s * 0.09, 0.105, 0.065], foot, { rotation: [-30, 0, 0] });
    for (const z of [0.045, 0.075, 0.105]) put(box(0.07, 0.008, 0.01), CUFF, [s * 0.09, 0.09, z], foot, { rotation: [-35, 0, 0] });
    // knee patch
    b.part(new THREE.PlaneGeometry(0.065, 0.065), WHITE, {
      at: [s * 0.09, 0.2, 0.096],
      dir: [0, 0.1, 1],
      axis: "z",
      bone: knee,
      texture: SQUARE,
    });
  }

  // Arms --------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.17, 0.63, 0.02],
        [s * 0.26, 0.5, 0.06],
        [s * 0.3, 0.4, 0.12],
        [s * 0.31, 0.35, 0.17],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
    );
    const wrist = arm.joints[2];
    const hand = arm.joints[3];
    b.sweep(arm, [0.062, 0.055, 0.046, 0.044, 0.044], {
      sides: 8,
      bands: [
        [0.66, TUNIC],
        [0.73, CUFF],
        [0.82, SKIN],
        [1, GLOVE],
      ],
      name: `armTube${S}`,
    });
    put(sph(0.066, 8, 6), TUNIC, [s * 0.17, 0.63, 0.02], arm.joints[0]);
    put(sph(0.06, 8, 6), GLOVE, [s * 0.31, 0.345, 0.18], hand, { scale: [1, 1.05, 1.1] });
    for (const i of [-1, 0, 1])
      b.capsule([s * (0.31 + i * 0.022), 0.335, 0.2], [s * (0.31 + i * 0.022), 0.305, 0.245], 0.018, {
        color: GLOVE,
        bone: hand,
        sides: 6,
      });
    b.capsule([s * 0.285, 0.365, 0.19], [s * 0.255, 0.345, 0.228], 0.021, { color: GLOVE, bone: hand, sides: 6 });
    // glove cuff
    put(cyl(0.056, 0.06, 0.05, 8), GLOVE_D, [s * 0.302, 0.4, 0.12], wrist, { dir: [s * 0.04, -0.1, 0.06] });
    studs([[s * 0.302 + s * 0.058, 0.4, 0.12]], 0.01, BRASS, wrist);
  }
  const wristL = b.joint("wristGizmoAnchor", { parent: "wristL", at: [0.302, 0.44, 0.115] });
  put(cyl(0.036, 0.036, 0.018, 8), BRASS, [0.302, 0.445, 0.115], wristL, { dir: [0.1, 1, 0.15] });
  glow(put(cyl(0.027, 0.027, 0.01, 8), CYAN, [0.303, 0.455, 0.117], wristL, { dir: [0.1, 1, 0.15] }), 1.2);
  // Left hand holds a glowing bulb
  const handL = "handL";
  put(cyl(0.02, 0.023, 0.04, 8), BRASS, [0.315, 0.385, 0.19], handL);
  glow(put(sph(0.037, 8, 6), AMBER, [0.315, 0.43, 0.19], handL), 1.6);
  // Right hand holds a sparking screwdriver
  const handR = "handR";
  b.capsule([-0.31, 0.33, 0.145], [-0.31, 0.355, 0.215], 0.021, { color: ORANGE, bone: handR, sides: 6 });
  b.rod([-0.31, 0.355, 0.215], [-0.31, 0.405, 0.335], 0.006, { color: STEEL, bone: handR, sides: 5 });
  glow(put(sph(0.014, 6, 4), YELLOW, [-0.31, 0.41, 0.345], handR), 2);
  for (const [dx, dy, dz] of [
    [0.03, 0.02, 0.01],
    [-0.03, 0.025, 0.012],
    [0, 0.045, 0],
  ])
    b.spike([-0.31, 0.41, 0.345], [-0.31 + dx, 0.41 + dy, 0.345 + dz], null, 0.004, { color: YELLOW, bone: handR, sides: 4 });

  // Head ----------------------------------------------------------------------------------------------------
  put(sph(0.15, 12, 9), SKIN, [0, 0.925, 0.04], head, { scale: [1, 1, 1.03], flat: false });
  put(sph(0.1, 9, 6), SKIN, [0, 0.835, 0.05], jaw, { scale: [1.2, 0.9, 1.1] });
  // nose
  put(sph(0.055, 8, 6), NOSE, [0, 0.9, 0.205], head, { scale: [1, 0.92, 1.05], flat: false });
  // eyes and cheeks
  for (const s of [1, -1]) {
    put(sph(0.03, 8, 6), WHITE, [s * 0.062, 0.935, 0.17], head, { flat: false });
    put(sph(0.018, 6, 5), DARK, [s * 0.062, 0.935, 0.195], head, { flat: false });
    put(sph(0.007, 5, 4), WHITE, [s * 0.057, 0.944, 0.209], head, { flat: false });
    put(sph(0.036, 7, 5), BLUSH, [s * 0.105, 0.885, 0.13], head, { scale: [0.55, 0.9, 0.9] });
    // brows
    b.sweep(
      catmull([
        [s * 0.025, 0.973, 0.165],
        [s * 0.062, 0.984, 0.165],
        [s * 0.098, 0.97, 0.14],
      ]),
      [0.015, 0.008],
      { color: BEARD, bone: head, sides: 5 },
    );
    // ears
    b.spike([s * 0.135, 0.93, 0.02], [s * 0.3, 1.0, -0.03], null, 0.045, { color: SKIN, bone: head, sides: 6 });
    b.spike([s * 0.15, 0.925, 0.035], [s * 0.275, 0.99, -0.005], null, 0.028, { color: BLUSH, bone: head, sides: 5 });
    // mustache
    b.sweep(
      catmull([
        [s * 0.012, 0.866, 0.195],
        [s * 0.06, 0.852, 0.178],
        [s * 0.105, 0.872, 0.125],
        [s * 0.118, 0.905, 0.085],
      ]),
      [0.036, 0.012],
      { color: BEARD_P, bone: head, sides: 6 },
    );
  }

  // Beard (on the lower jaw) --------------------------------------------------------------------------------
  const bw = [0.115, 0.155, 0.135, 0.085, 0.012];
  b.sweep(
    catmull([
      [0, 0.84, 0.1],
      [0, 0.76, 0.17],
      [0, 0.62, 0.188],
      [0, 0.46, 0.18],
    ]),
    (t) => [lerpArr(bw, t), 0.065 * (1 - 0.45 * t) + 0.006],
    { color: BEARD_P, bone: jaw, sides: 7, caps: { start: "flat", end: "point" }, name: "beard" },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.1, 0.9, 0.08],
        [s * 0.15, 0.82, 0.12],
        [s * 0.135, 0.7, 0.17],
        [s * 0.075, 0.56, 0.2],
      ]),
      [0.05, 0.004],
      { color: BEARD_P, bone: jaw, sides: 6, caps: { start: "flat", end: "point" } },
    );
    b.spike([s * 0.035, 0.52, 0.2], [s * 0.06, 0.4, 0.21], null, 0.04, { color: BEARD_P, bone: jaw, sides: 5 });
  }
  b.spike([0, 0.5, 0.205], [0, 0.38, 0.215], null, 0.045, { color: BEARD_P, bone: jaw, sides: 5 });

  // Hat -----------------------------------------------------------------------------------------------------
  const hatPath = catmull([
    [0, 1.0, 0],
    [0, 1.1, -0.01],
    [0.01, 1.19, -0.05],
    [0.04, 1.25, -0.14],
    [0.07, 1.24, -0.26],
  ]);
  const hat = b.sweep(hatPath, [0.17, 0.145, 0.11, 0.07, 0.035, 0.006], {
    color: HAT_P,
    bone: head,
    sides: 8,
    caps: { start: "flat", end: "point" },
    name: "hat",
  });
  b.lathe(
    [
      [0, -0.012],
      [0.2, -0.016],
      [0.255, 0.008],
      [0.2, 0.026],
      [0, 0.032],
    ],
    { at: [0, 1.0, 0.0], bone: head, color: HAT_P, segments: 10, name: "brim" },
  );
  put(sph(0.032, 7, 5), YELLOW, hatPath.at(1).toArray(), head);
  b.sweep(catmull(ringPts(0, 1.014, 0, 0.165, 0.165, 10), { closed: true }), 0.014, {
    color: LEATHER_D,
    bone: head,
    sides: 6,
    name: "hatBand",
  });
  put(box(0.04, 0.034, 0.012), BRASS, [0, 1.016, 0.17], head);
  b.decal(hat, BADGE, { at: [0, 1.1, 0.12], dir: [0, 0.35, 1], size: [0.08, 0.08], bone: head });
  // goggles pushed up on the hat
  for (const s of [1, -1]) {
    put(cyl(0.047, 0.047, 0.032, 8), BRASS, [s * 0.062, 1.052, 0.15], head, { dir: [0, 0.3, 1] });
    glow(put(cyl(0.036, 0.036, 0.034, 8), CYAN, [s * 0.062, 1.054, 0.155], head, { dir: [0, 0.3, 1] }), 1.1);
    put(cyl(0.052, 0.052, 0.01, 8), BRASS_D, [s * 0.062, 1.05, 0.14], head, { dir: [0, 0.3, 1] });
  }
  put(box(0.04, 0.014, 0.014), BRASS_D, [0, 1.052, 0.15], head);

  // Backpack ------------------------------------------------------------------------------------------------
  put(box(0.38, 0.44, 0.2), LEATHER_P, [0, 0.6, -0.19], chest);
  put(box(0.39, 0.04, 0.21), LEATHER_D, [0, 0.38, -0.19], chest);
  put(box(0.4, 0.05, 0.22), LEATHER2_P, [0, 0.835, -0.19], chest);
  put(box(0.39, 0.12, 0.022), LEATHER2_P, [0, 0.775, -0.3], chest);
  for (const s of [1, -1]) {
    put(box(0.03, 0.34, 0.014), LEATHER_D, [s * 0.17, 0.62, -0.3], chest);
    put(box(0.04, 0.034, 0.02), BRASS, [s * 0.17, 0.455, -0.305], chest);
    // frame bars
    b.rod([s * 0.2, 0.34, -0.07], [s * 0.2, 0.93, -0.07], 0.012, { color: STEEL, bone: chest, sides: 6 });
    // side pockets
    put(box(0.08, 0.2, 0.14), LEATHER2_P, [s * 0.23, 0.5, -0.17], chest);
    put(box(0.086, 0.03, 0.15), LEATHER_D, [s * 0.23, 0.605, -0.17], chest);
    put(sph(0.012, 5, 4), BRASS, [s * 0.275, 0.605, -0.17], chest);
    b.part(new THREE.PlaneGeometry(0.07, 0.07), WHITE, {
      at: [s * 0.2715, 0.5, -0.17],
      dir: [s, 0, 0],
      axis: "z",
      bone: chest,
      texture: STAR,
    });
    // bedroll ends and straps
    put(cyl(0.056, 0.056, 0.006, 8), LEATHER_D, [s * 0.212, 0.885, -0.2], chest, { rotation: [0, 0, 90] });
    b.part(new THREE.TorusGeometry(0.074, 0.011, 5, 10), LEATHER_D, {
      at: [s * 0.12, 0.885, -0.2],
      dir: [1, 0, 0],
      axis: "z",
      bone: chest,
      flat: true,
    });
    // blueprint straps
    b.part(new THREE.TorusGeometry(0.033, 0.008, 5, 8), LEATHER_D, {
      at: [s * 0.13, 0.345, -0.22],
      dir: [1, 0, 0],
      axis: "z",
      bone: chest,
      flat: true,
    });
  }
  put(cyl(0.07, 0.07, 0.42, 8), CANVAS_P, [0, 0.885, -0.2], chest, { rotation: [0, 0, 90] });
  studs(
    [
      [-0.15, 0.82, -0.3],
      [0, 0.82, -0.3],
      [0.15, 0.82, -0.3],
      [-0.15, 0.73, -0.31],
      [0.15, 0.73, -0.31],
    ],
    0.011,
    BRASS,
    chest,
  );
  // Blueprint tube under the pack
  b.rod([-0.2, 0.345, -0.22], [0.2, 0.345, -0.22], 0.032, { color: BLUEPRINT, bone: chest, sides: 8, caps: "flat" });
  put(cyl(0.034, 0.034, 0.012, 8), CUFF, [0.205, 0.345, -0.22], chest, { rotation: [0, 0, 90] });
  put(cyl(0.034, 0.034, 0.012, 8), CUFF, [-0.205, 0.345, -0.22], chest, { rotation: [0, 0, 90] });

  // Gears (hinges)
  const gear1 = b.joint("gearA", { parent: chest, at: [-0.06, 0.67, -0.3], dir: [0, 0, -1], role: "hinge" });
  const gear2 = b.joint("gearB", { parent: chest, at: [0.07, 0.56, -0.3], dir: [0, 0, -1], role: "hinge" });
  b.extrude(gearOutline(0.1, 12), {
    at: [-0.06, 0.67, -0.298],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.004,
    color: COPPER,
    bone: gear1,
    name: "gearA",
  });
  put(cyl(0.032, 0.032, 0.014, 8), BRASS, [-0.06, 0.67, -0.32], gear1, { dir: [0, 0, -1] });
  put(cyl(0.012, 0.012, 0.018, 6), DARK, [-0.06, 0.67, -0.327], gear1, { dir: [0, 0, -1] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    put(cyl(0.011, 0.011, 0.012, 6), DARK, [-0.06 + Math.cos(a) * 0.062, 0.67 + Math.sin(a) * 0.062, -0.314], gear1, {
      dir: [0, 0, -1],
    });
  }
  b.extrude(gearOutline(0.075, 9), {
    at: [0.07, 0.56, -0.303],
    x: [Math.cos(0.17), Math.sin(0.17), 0],
    y: [-Math.sin(0.17), Math.cos(0.17), 0],
    thickness: 0.026,
    bevel: 0.003,
    color: BRASS,
    bone: gear2,
    name: "gearB",
  });
  put(cyl(0.024, 0.024, 0.014, 8), COPPER, [0.07, 0.56, -0.322], gear2, { dir: [0, 0, -1] });
  put(cyl(0.009, 0.009, 0.016, 6), DARK, [0.07, 0.56, -0.329], gear2, { dir: [0, 0, -1] });

  // Pressure gauge and pipe
  put(cyl(0.054, 0.054, 0.026, 10), BRASS, [0.12, 0.76, -0.3], chest, { dir: [0, 0, -1] });
  b.part(new THREE.PlaneGeometry(0.088, 0.088), WHITE, {
    at: [0.12, 0.76, -0.3145],
    dir: [0, 0, -1],
    axis: "z",
    bone: chest,
    texture: DIAL,
  });
  b.sweep(
    catmull([
      [0.1, 0.71, -0.3],
      [0.17, 0.64, -0.322],
      [0.175, 0.47, -0.322],
      [0.13, 0.4, -0.31],
    ]),
    0.014,
    { color: BRASS_D, bone: chest, sides: 6, caps: "round", name: "pipe" },
  );
  studs(
    [
      [0.17, 0.64, -0.322],
      [0.175, 0.47, -0.322],
    ],
    0.02,
    BRASS,
    chest,
  );

  // Propeller (hinge)
  const prop = b.joint("propeller", { parent: chest, at: [-0.09, 0.44, -0.34], dir: [0, 0, -1], role: "hinge" });
  b.rod([-0.09, 0.44, -0.29], [-0.09, 0.44, -0.345], 0.012, { color: STEEL, bone: chest, sides: 6 });
  put(box(0.05, 0.05, 0.02), STEEL_D, [-0.09, 0.44, -0.3], chest);
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + 0.3;
    b.extrude(
      [
        [0.01, -0.015],
        [0.06, -0.03],
        [0.105, -0.015],
        [0.105, 0.015],
        [0.06, 0.03],
        [0.01, 0.015],
      ],
      {
        at: [-0.09, 0.44, -0.34],
        x: [Math.cos(a), Math.sin(a), 0],
        y: [-Math.sin(a), Math.cos(a), 0],
        thickness: 0.008,
        color: k === 0 ? RED_L : k === 1 ? YELLOW : GREEN,
        bone: prop,
        name: `blade${k}`,
      },
    );
  }
  put(sph(0.022, 7, 5), BRASS, [-0.09, 0.44, -0.352], prop);

  // Telescope on the left side
  const tA: [number, number, number] = [0.3, 0.4, -0.2];
  const tB: [number, number, number] = [0.37, 1.0, -0.28];
  b.rod(tA, lerp(tA, tB, 0.5), 0.036, { color: COPPER, bone: chest, sides: 8, caps: "flat" });
  b.rod(lerp(tA, tB, 0.5), lerp(tA, tB, 0.8), 0.029, { color: BRASS, bone: chest, sides: 8, caps: "flat" });
  b.rod(lerp(tA, tB, 0.8), tB, 0.023, { color: STEEL, bone: chest, sides: 8, caps: "flat" });
  for (const [t, r] of [
    [0.5, 0.039],
    [0.8, 0.032],
  ]) b.rod(lerp(tA, tB, t - 0.02), lerp(tA, tB, t + 0.02), r, { color: BRASS_D, bone: chest, sides: 8, caps: "flat" });
  glow(b.rod(tB, lerp(tA, tB, 1.012), 0.018, { color: CYAN, bone: chest, sides: 8, caps: "flat" }), 1.1);
  for (const t of [0.2, 0.4]) {
    b.part(new THREE.TorusGeometry(0.038, 0.009, 5, 8), LEATHER_D, {
      at: lerp(tA, tB, t),
      dir: [0.07, 0.6, -0.08],
      axis: "z",
      bone: chest,
      flat: true,
    });
  }

  // Dish antenna on the right
  b.rod([-0.17, 0.78, -0.2], [-0.22, 1.1, -0.26], 0.008, { color: STEEL, bone: chest, sides: 5 });
  b.sweep(spiral([-0.17, 0.8, -0.2], [-0.14, 0.8, -0.2], [0, 1, 0], { turns: 6, r1: 0.03, pitch: 0.018 }), 0.004, {
    color: BRASS,
    bone: chest,
    sides: 4,
    name: "coil",
  });
  b.lathe(
    [
      [0, 0],
      [0.075, 0.04],
      [0.075, 0.052],
      [0, 0.015],
    ],
    { at: [-0.22, 1.1, -0.26], axis: [0.2, 0.5, -1], bone: chest, color: STEEL, segments: 9, name: "dish" },
  );
  glow(put(sph(0.013, 5, 4), RED_L, [-0.2, 1.135, -0.31], chest), 2);

  // Lantern on a hook, right side
  b.rod([-0.2, 0.72, -0.15], [-0.33, 0.72, -0.15], 0.007, { color: STEEL_D, bone: chest, sides: 5 });
  b.rod([-0.33, 0.72, -0.15], [-0.33, 0.675, -0.15], 0.004, { color: STEEL_D, bone: chest, sides: 4 });
  put(cyl(0.012, 0.05, 0.03, 6), BRASS_D, [-0.33, 0.66, -0.15], chest);
  glow(put(cyl(0.04, 0.04, 0.08, 6), AMBER, [-0.33, 0.605, -0.15], chest), 1.6);
  put(cyl(0.048, 0.048, 0.016, 6), BRASS_D, [-0.33, 0.557, -0.15], chest);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    b.rod([-0.33 + Math.cos(a) * 0.04, 0.565, -0.15 + Math.sin(a) * 0.04], [-0.33 + Math.cos(a) * 0.04, 0.65, -0.15 + Math.sin(a) * 0.04], 0.004, {
      color: BRASS_D,
      bone: chest,
      sides: 4,
    });
  }

  // Screwdrivers in left pocket
  [
    [ORANGE, 0.205, 0.62, 0.7],
    [GREEN, 0.23, 0.63, 0.72],
    [BLUEPRINT, 0.255, 0.62, 0.69],
  ].forEach(([c, x, y0, y1], i) => {
    b.rod([x as number, y0 as number, -0.16 - i * 0.02], [(x as number) + 0.005, y1 as number, -0.16 - i * 0.02], 0.014, {
      color: c as string,
      bone: chest,
      sides: 6,
    });
  });

  // Tin cup hanging from the pack
  b.rod([0.14, 0.37, -0.25], [0.14, 0.325, -0.25], 0.004, { color: STEEL_D, bone: chest, sides: 4 });
  b.lathe(
    [
      [0, 0.003],
      [0.034, 0.003],
      [0.046, 0.07],
      [0.04, 0.07],
      [0.03, 0.012],
      [0, 0.012],
    ],
    { at: [0.14, 0.255, -0.25], bone: chest, color: STEEL, segments: 8, name: "cup" },
  );
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8, Math.PI), STEEL, {
    at: [0.188, 0.29, -0.25],
    dir: [1, 0, 0],
    axis: "z",
    bone: chest,
    flat: true,
  });

  // Belt tools: wrench on the left hip, hammer on the right, rope coil, pouch ------------------------------
  const wrench: OutlinePoint[] = [
    [-0.012, 0],
    [0.012, 0],
    [0.012, 0.16],
    [0.03, 0.18],
    [0.03, 0.25],
    [0.012, 0.25],
    [0.012, 0.21],
    [-0.012, 0.21],
    [-0.012, 0.25],
    [-0.03, 0.25],
    [-0.03, 0.18],
    [-0.012, 0.16],
  ];
  b.extrude(wrench, { at: [0.2, 0.4, -0.03], x: [0, 0, 1], y: [0, -1, 0], thickness: 0.01, bevel: 0.002, color: STEEL, bone: spine1, name: "wrench" });
  b.extrude(
    [
      [-0.012, 0],
      [0.012, 0],
      [0.012, 0.2],
      [0.045, 0.2],
      [0.045, 0.255],
      [-0.045, 0.255],
      [-0.045, 0.2],
      [-0.012, 0.2],
    ],
    { at: [-0.2, 0.4, -0.03], x: [0, 0, 1], y: [0, -1, 0], thickness: 0.026, bevel: 0.003, color: LEATHER2, bone: spine1, name: "hammer" },
  );
  put(box(0.032, 0.058, 0.096), STEEL_D, [-0.2, 0.4 - 0.23, -0.03], spine1);
  b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 10), CANVAS, {
    at: [0.19, 0.385, 0.07],
    dir: [1, 0, 0],
    axis: "z",
    bone: spine1,
    flat: true,
  });
  put(box(0.065, 0.1, 0.09), LEATHER2_P, [-0.19, 0.375, 0.075], spine1);
  put(box(0.07, 0.03, 0.095), LEATHER_D, [-0.19, 0.43, 0.075], spine1);
  put(sph(0.011, 5, 4), BRASS, [-0.225, 0.415, 0.075], spine1);

  return b.root;
}
