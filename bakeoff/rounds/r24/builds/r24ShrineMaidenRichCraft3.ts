import * as THREE from "three";
import {
  createBuilder,
  polyline,
  catmull,
  bezier,
  paint,
  mix,
  smoothstep,
  noise,
  resolve,
  svg,
} from "../../../../src/index";
import type { Joint, ColorInput } from "../../../../src/index";
import { animeEye, cel, shadowOf } from "../../../../kits/toon";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kitsune Miko",
  description:
    "High-fantasy anime shrine maiden with a fox mask pushed up on the side of her head: cel-shaded white kosode, red pleated hakama, long indigo hair with violet tips, gold bells and sakura kanzashi, fox-fire wisps and a rigged skeleton.",
};

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

type Pt = [number, number] | [number, number, "sharp"];
type PFn = (p: THREE.Vector3, n: THREE.Vector3, s: readonly [number, number]) => ColorInput;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const KL = V(0.35, 0.8, 0.5).normalize();
const DEG = Math.PI / 180;

/** Two-tone cel shading with a hue-shifted shadow, around any colour function. */
const shaded = (fn: PFn) =>
  paint((p, n, s) => {
    const c = resolve(fn(p, n, s), p, n);
    return n.dot(KL) > 0.1 ? c : shadowOf(c);
  });

/** Piecewise-linear curve through [t, value] keys. */
const pw = (keys: [number, number][]) => (t: number) => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      const k = Math.min(Math.max((t - t0) / (t1 - t0), 0), 1);
      return v0 + (v1 - v0) * k;
    }
  }
  return keys[keys.length - 1][1];
};

const scalePts = (pts: Pt[], k: number, ky = k): Pt[] =>
  pts.map((p): Pt => (p.length === 3 ? [p[0] * k, p[1] * ky, "sharp"] : [p[0] * k, p[1] * ky]));

// ---------------------------------------------------------------------------------------------------------------
// Palette

const INK_DARK = "#1c1220";
const RED_CORD = "#d3243a";
const LACQUER = "#c4162a";
const PINK = "#ffbfd6";
const WHITE = "#fdf9f1";
const NAIL = "#ffc7c7";
const SOLE = "#2b1822";
const HEM_GOLD = "#ffd66b";

const SKIN = cel("#ffe3d4", "#f1a9a2");
const CLOTH = cel("#fcf8f0", "#c6c9e8");
const MASK_WHITE = cel("#fffaf0", "#cbc8ec");
const GOLD = metal("gilt");

const HAIR_ROOT = "#14123a";
const HAIR_MID = "#26286e";
const HAIR_TIP = "#7b5fd6";
const HAIR_HI = "#5d6fe0";

const RED_A = "#e2312f";
const RED_B = "#c9222f";
const RED_DEEP = "#7e1330";
const RED_TRIM = "#d2202e";

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = animeEye({ iris: "#f2a12b", irisDark: "#a2431f", irisLight: "#ffe27a" });

const MOUTH = svg(
  `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8 Q30 27 52 8" stroke="#9b3b45" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M22 14 Q30 23 38 14 Q30 17 22 14Z" fill="#ff8d8d"/>
  </svg>`,
  { size: 128 },
);

const NOSE = svg(
  `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 11 Q10 17 16 11" stroke="#d9857a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 64 },
);

const sideMarks = `
  <path d="M92 124 Q110 108 134 96 Q120 120 94 130Z" fill="#1b1422"/>
  <path d="M90 108 Q112 88 138 80" stroke="#d3172b" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M150 118 Q136 120 118 150 Q134 146 144 146Z" fill="#d3172b"/>
  <path d="M134 166 Q124 170 112 186 Q124 182 128 178Z" fill="#d3172b"/>
  <path d="M128 18 L134 64 L106 58Z" fill="#d3172b"/>
  <path d="M96 140 Q112 140 120 134" stroke="#d3172b" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
const MASK_ART = svg(
  `<svg viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 74 Q89 93 80 114 Q71 93 80 74Z" fill="#d3172b"/>
    <circle cx="80" cy="82" r="3" fill="#f2c14e"/>
    ${sideMarks}
    <g transform="translate(160 0) scale(-1 1)">${sideMarks}</g>
  </svg>`,
  { size: 320 },
);

const CREST = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="none" stroke="#e3b341" stroke-width="5"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#c4162a" stroke-width="2.5"/>
    ${[0, 120, 240]
      .map(
        (a) =>
          `<g transform="rotate(${a} 50 50)"><circle cx="50" cy="29" r="9" fill="#c4162a"/><path d="M42 31 Q30 50 50 54 Q38 46 45 36Z" fill="#c4162a"/></g>`,
      )
      .join("")}
    <circle cx="50" cy="50" r="5" fill="#e3b341"/>
  </svg>`,
  { size: 192 },
);

const sakura = (x: number, y: number, r: number, rot: number) => {
  let s = `<g transform="translate(${x} ${y}) rotate(${rot})">`;
  for (let i = 0; i < 5; i++)
    s += `<path transform="rotate(${i * 72})" d="M0 0 C${-r * 0.55} ${-r * 0.5} ${-r * 0.45} ${-r * 1.05} 0 ${-r * 0.88} C${r * 0.45} ${-r * 1.05} ${r * 0.55} ${-r * 0.5} 0 0Z" fill="#ffb7d0" stroke="#e0658f" stroke-width="1.2"/>`;
  return s + `<circle r="${r * 0.2}" fill="#ffd36a"/></g>`;
};
const SLEEVE_ART = svg(
  `<svg viewBox="0 0 130 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 70 Q40 40 70 56 T126 28" stroke="#e3b341" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M10 88 Q44 62 74 76 T124 52" stroke="#e3b341" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.8"/>
    ${sakura(30, 58, 16, 10)}${sakura(72, 34, 13, 40)}${sakura(100, 66, 15, 70)}${sakura(54, 78, 8, 20)}${sakura(116, 30, 8, 55)}
    <path d="M18 24 q4 -4 8 0 q-4 6 -8 0Z M88 12 q4 -4 8 0 q-4 6 -8 0Z M44 14 q4 -4 8 0 q-4 6 -8 0Z" fill="#ffb7d0"/>
  </svg>`,
  { size: 256 },
);

const OFUDA = svg(
  `<svg viewBox="0 0 50 150" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="47" height="147" rx="2" fill="#f7f0d8" stroke="#c4162a" stroke-width="3"/>
    <g stroke="#c4162a" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M25 14 V74"/><path d="M13 28 H37"/><path d="M14 44 H36"/><path d="M15 60 L25 50 L35 60"/>
      <path d="M14 82 Q25 90 36 82"/><path d="M25 88 V106"/><path d="M16 96 H34"/>
    </g>
    <circle cx="25" cy="126" r="11" fill="none" stroke="#c4162a" stroke-width="3"/>
    <path d="M25 118 Q31 126 25 134 Q19 126 25 118Z" fill="#c4162a"/>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
// Outlines

const lockShape = (w: number, len: number): Pt[] => [
  [-w / 2, 0],
  [w / 2, 0],
  [w * 0.46, -len * 0.45],
  [w * 0.2, -len * 0.8],
  [0, -len, "sharp"],
  [-w * 0.3, -len * 0.7],
  [-w * 0.5, -len * 0.35],
];

const FLAME: Pt[] = [
  [0, 0],
  [0.02, 0.008],
  [0.024, 0.03],
  [0.012, 0.055],
  [0.006, 0.075],
  [0, 0.1, "sharp"],
  [-0.004, 0.07],
  [-0.018, 0.045],
  [-0.022, 0.02],
  [-0.014, 0.006],
];

const SLEEVE_OUTLINE: Pt[] = [
  [-0.01, 0.055],
  [0.2, 0.058],
  [0.405, 0.058, "sharp"],
  [0.41, -0.2],
  [0.385, -0.28, "sharp"],
  [0.3, -0.27],
  [0.18, -0.2],
  [0.07, -0.11],
  [-0.02, -0.04],
];
const SLEEVE_BOTTOM = pw([
  [-0.02, -0.04],
  [0.07, -0.11],
  [0.18, -0.2],
  [0.3, -0.27],
  [0.385, -0.28],
  [0.5, -0.28],
]);

const SOLE_OUTLINE: Pt[] = [
  [0, -0.125],
  [0.04, -0.105],
  [0.05, -0.02],
  [0.048, 0.07],
  [0.03, 0.125],
  [0, 0.135],
  [-0.03, 0.125],
  [-0.048, 0.07],
  [-0.05, -0.02],
  [-0.04, -0.105],
];

const BOW_LOOP: Pt[] = [
  [0.004, 0],
  [0.03, 0.026],
  [0.06, 0.03],
  [0.072, 0],
  [0.06, -0.028],
  [0.03, -0.026],
];
const TAIL: Pt[] = [
  [-0.01, 0],
  [0.01, 0],
  [0.017, -0.12],
  [0.0, -0.104],
  [-0.017, -0.13],
];

// ---------------------------------------------------------------------------------------------------------------
// Paints

const lockPaint = (len: number) =>
  shaded((p, _n, s) => {
    const t = Math.min(Math.max(-s[1] / len, 0), 1);
    let c: ColorInput = mix(HAIR_ROOT, HAIR_MID, smoothstep(0, 0.6, t));
    c = mix(c, HAIR_TIP, smoothstep(0.55, 1, t) * 0.8);
    return mix(c, HAIR_HI, 0.3 * smoothstep(0.62, 0.8, noise(p, 0.03, 5)));
  });

const HAIR_SHELL = shaded((p) => {
  let c: ColorInput = mix(HAIR_ROOT, HAIR_MID, noise(p, 0.05, 7) * 0.9);
  const halo = Math.abs(p.y - 1.545) < 0.009 && p.z < 0.06 ? 0.55 : 0;
  if (halo) c = mix(c, HAIR_HI, halo);
  return c;
});

const HAIR_BACK = shaded((p, _n, s) => {
  let c: ColorInput = mix(HAIR_ROOT, HAIR_MID, smoothstep(0, 0.5, s[0]));
  c = mix(c, HAIR_TIP, smoothstep(0.68, 1, s[0]));
  return mix(c, HAIR_HI, 0.35 * smoothstep(0.62, 0.8, noise(p, 0.04, 3)));
});

const hakama = (trimFrom: number) =>
  shaded((p, _n, s) => {
    const crease = ((s[1] % 30) + 30) % 30;
    let c: ColorInput = mix(RED_A, RED_B, noise(p, 0.12, 4));
    if (crease < 1.8 || crease > 28.2) c = mix(c, RED_DEEP, 0.55);
    if (s[0] > trimFrom) c = s[0] < trimFrom + 0.012 ? "#e3b341" : "#f8f3e8";
    return c;
  });

const sleevePaint = (thick: THREE.Vector3) =>
  shaded((p, n, s) => {
    const vb = SLEEVE_BOTTOM(s[0]);
    if (Math.abs(n.dot(thick)) < 0.5 || s[0] > 0.385 || s[1] < vb + 0.016) return RED_TRIM;
    if (s[1] < vb + 0.026) return "#e3b341";
    return mix("#fcf8f0", "#e5e8fb", 0.4 * noise(p, 0.08, 2));
  });

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "kitsune_miko" });

  // ---- shared accessories ----------------------------------------------------------------------------------
  const bellAt = (pos: THREE.Vector3, bone: Joint, r = 0.014) => {
    b.part(new THREE.SphereGeometry(r, 8, 6), GOLD, { bone, at: pos });
    b.part(new THREE.CylinderGeometry(r * 1.01, r * 1.01, r * 0.16, 8), INK_DARK, {
      bone,
      at: pos.clone().add(V(0, -r * 0.35, 0)),
    });
    b.part(new THREE.TorusGeometry(r * 0.38, r * 0.12, 4, 8), GOLD, { bone, at: pos.clone().add(V(0, r * 1.05, 0)) });
  };
  const dangle = (top: THREE.Vector3, len: number, bone: Joint, cord = RED_CORD, tassel = WHITE) => {
    const end = top.clone().add(V(0, -len, 0));
    b.rod(top, end, 0.0032, cord, { bone });
    bellAt(end.clone().add(V(0, -0.014, 0)), bone);
    b.spike(end.clone().add(V(0, -0.03, 0)), [0, -1, 0], 0.045, 0.011, { color: tassel, bone });
  };
  const bow = (c: THREE.Vector3, k: number, bone: Joint, loop: ColorInput, knot: ColorInput, tails: ColorInput) => {
    for (const sx of [1, -1]) {
      const pts = BOW_LOOP.map((p): Pt => [p[0] * sx * k, p[1] * k]);
      b.extrude(pts, { at: c, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012 * k, bevel: 0.003 * k, smoothing: 2, color: loop, bone });
      const a = sx * 14 * DEG;
      b.extrude(scalePts(TAIL, k), {
        at: c.clone().add(V(sx * 0.008 * k, -0.008 * k, 0)),
        x: [Math.cos(a), Math.sin(a), 0],
        y: [-Math.sin(a), Math.cos(a), 0],
        thickness: 0.008 * k,
        bevel: 0.002,
        color: tails,
        bone,
      });
    }
    b.part(new THREE.SphereGeometry(0.016 * k, 8, 6), knot, { bone, at: c.clone().add(V(0, 0, 0.004)) });
  };
  const foxFire = (c: THREE.Vector3, bone: Joint, k = 1) => {
    glow(b.part(new THREE.SphereGeometry(0.02 * k, 8, 6), "#c9f6ff", { bone, at: c }), 2);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3;
      const xd = V(Math.cos(a), 0, Math.sin(a));
      glow(
        b.extrude(scalePts(FLAME, k), { at: c.clone().add(V(0, 0.012 * k, 0)), x: xd, y: [0, 1, 0], thickness: 0.006 * k, bevel: 0.002, smoothing: 1, color: "#58c8ff", bone }),
        1.4,
      );
      glow(
        b.extrude(scalePts(FLAME, k * 0.55), { at: c.clone().add(V(0, 0.01 * k, 0)), x: xd, y: [0, 1, 0], thickness: 0.009 * k, bevel: 0.002, smoothing: 1, color: "#effcff", bone }),
        2.2,
      );
    }
  };

  // ---- skeleton -----------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.88, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.9, 0],
      [0, 1.02, 0],
      [0, 1.14, 0.01],
      [0, 1.27, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.27, 0],
      [0, 1.31, 0.008],
      [0, 1.365, 0.02],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.365, 0.02], dir: [0, 1, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.43, 0], aim: [0, 1.352, 0.07], role: "jaw" });

  // ---- torso ---------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.27, h: 0.18 },
      { at: [0, 1.0, 0.004], w: 0.235, h: 0.17 },
      { at: [0, 1.1, 0.014], w: 0.25, h: 0.185 },
      { at: [0, 1.19, 0.006], w: 0.3, h: 0.17 },
      { at: [0, 1.25, 0], w: 0.26, h: 0.14 },
      { at: [0, 1.278, 0], w: 0.085, h: 0.085 },
    ],
    { bone: [hips, spine], color: CLOTH, sides: 14, caps: { start: "flat", end: "flat" } },
  );
  const tsk = b.surface(torso);

  b.sweep(neck, [0.043, 0.04], { color: SKIN });

  // layered kimono collars: white over red, left over right
  const redCollar = tsk.drape(
    polyline([V(-0.05, 1.285, 0.03), V(-0.03, 1.235, 0.085), V(0.0, 1.19, 0.1), V(0.03, 1.15, 0.1)]),
    { lift: 0.006 },
  );
  b.sweep(redCollar, 0.0145, { color: LACQUER });
  const whiteCollar = tsk.drape(
    polyline([V(0.05, 1.285, 0.03), V(0.03, 1.23, 0.085), V(0.0, 1.16, 0.1), V(-0.04, 1.08, 0.1), V(-0.06, 1.035, 0.098)]),
    { lift: 0.011 },
  );
  b.sweep(whiteCollar, 0.0115, { color: WHITE });
  b.part(new THREE.TorusGeometry(0.048, 0.012, 5, 14), LACQUER, { bone: chest, at: [0, 1.282, 0.0], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.052, 0.008, 4, 14), WHITE, { bone: chest, at: [0, 1.294, 0.0], rotation: [90, 0, 0] });

  // ---- head ----------------------------------------------------------------------------------------------
  const lowerJaw = b.loft(
    [
      { at: [0, 1.35, 0.058], w: 0.04, h: 0.05 },
      { at: [0, 1.38, 0.04], w: 0.128, h: 0.12 },
      { at: [0, 1.41, 0.026], w: 0.178, h: 0.165 },
      { at: [0, 1.432, 0.018], w: 0.196, h: 0.188 },
    ],
    { bone: jaw, color: SKIN, sides: 14, caps: { start: "round", end: "flat" } },
  );
  const upperHead = b.loft(
    [
      { at: [0, 1.426, 0.018], w: 0.194, h: 0.186 },
      { at: [0, 1.455, 0.013], w: 0.21, h: 0.202 },
      { at: [0, 1.492, 0.012], w: 0.208, h: 0.2 },
    ],
    { bone: head, color: SKIN, sides: 14, caps: { start: "none", end: "none" } },
  );
  b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, { bone: head, at: [0, 1.488, 0.012], scale: [0.103, 0.097, 0.1] });

  for (const s of [1, -1]) {
    b.decal(upperHead, EYE, { at: [s * 0.056, 1.45, 0.12], dir: [0, 0, 1], size: [0.056, 0.077], mirror: s > 0 });
  }
  b.decal(lowerJaw, MOUTH, { at: [0, 1.386, 0.12], dir: [0, 0, 1], size: [0.034, 0.017] });
  b.decal(lowerJaw, NOSE, { at: [0, 1.418, 0.12], dir: [0, 0, 1], size: [0.013, 0.013] });

  // ---- hair ----------------------------------------------------------------------------------------------
  const HC = V(0, 1.49, 0);
  const HS: [number, number, number] = [0.118, 0.111, 0.122];
  b.part(new THREE.SphereGeometry(1, 16, 10, 2.618, 4.189, 0, 2.2), HAIR_SHELL, { bone: head, at: HC, scale: HS });
  b.part(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, 0.95), HAIR_SHELL, {
    bone: head,
    at: HC,
    scale: [HS[0] * 1.004, HS[1] * 1.004, HS[2] * 1.004],
  });

  // mask placement frame (right side of the head, tilted up)
  const MS = 0.92;
  const MC = V(-0.098, 1.548, 0.012);
  const mn = V(-0.72, 0.28, 0.63).normalize();
  const mu = V(-0.15, 1, 0);
  mu.addScaledVector(mn, -mu.dot(mn)).normalize();
  const mw = mu.clone().cross(mn).normalize();
  const P = (x: number, y: number, z = 0) =>
    MC.clone().addScaledVector(mw, x * MS).addScaledVector(mu, y * MS).addScaledVector(mn, z);

  // bangs
  const BANG = 11;
  for (let i = 0; i < BANG; i++) {
    const a = (-72 + (144 * i) / (BANG - 1)) * DEG;
    const th = 0.83;
    const root = V(
      HC.x + HS[0] * 1.012 * Math.sin(th) * Math.sin(a),
      HC.y + HS[1] * 1.012 * Math.cos(th),
      HC.z + HS[2] * 1.012 * Math.sin(th) * Math.cos(a),
    );
    if (root.distanceTo(MC) < 0.085) continue;
    const H = V(Math.sin(a) * 0.9, 0, Math.cos(a));
    const xdir = UP.clone().cross(H).normalize();
    const tipDir = V(0, -1, 0).addScaledVector(H, 0.55).addScaledVector(xdir, 0.22 * Math.sign(a) * (Math.abs(a) < 0.1 ? 1.5 : 0.6));
    tipDir.normalize();
    const len = 0.056 + 0.02 * Math.abs(Math.sin(a * 1.6)) + (i % 2) * 0.006;
    b.extrude(lockShape(0.036, len), {
      at: root,
      x: xdir,
      y: tipDir.clone().negate(),
      thickness: 0.008,
      bevel: 0.0025,
      smoothing: 1,
      color: lockPaint(len),
      bone: head,
    });
  }

  // ahoge
  b.sweep(bezier(V(0.004, 1.585, 0.02), V(0.0, 1.66, 0.03), V(0.07, 1.685, 0.07), V(0.09, 1.64, 0.1)), [0.008, 0.001], {
    color: HAIR_SHELL,
    bone: head,
    caps: { start: "flat", end: "point" },
    sides: 6,
  });

  // long sidelocks
  for (const s of [1, -1]) {
    const path = catmull([
      V(s * 0.108, 1.5, 0.06),
      V(s * 0.112, 1.41, 0.08),
      V(s * 0.1, 1.3, 0.1),
      V(s * 0.092, 1.19, 0.118),
      V(s * 0.09, 1.1, 0.125),
    ]);
    b.sweep(path, (t) => [0.026 * (1 - 0.75 * t * t) + 0.004, 0.013 * (1 - 0.4 * t)] as [number, number], {
      color: HAIR_BACK,
      bone: head,
      caps: { start: "flat", end: "point" },
      sides: 8,
    });
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), GOLD, { bone: head, at: path.at(0.52) });
    b.part(new THREE.TorusGeometry(0.0185, 0.004, 4, 10), RED_CORD, { bone: head, at: path.at(0.52), rotation: [90, 0, 0] });
  }

  // back hair on its own little chain
  const hairPath = catmull([
    V(0, 1.56, -0.07),
    V(0, 1.47, -0.125),
    V(0, 1.33, -0.12),
    V(0, 1.18, -0.115),
    V(0, 1.02, -0.14),
    V(0, 0.85, -0.15),
    V(0, 0.7, -0.155),
  ]);
  const hair = b.chain("hairBack", hairPath, { parent: head, count: 6 });
  const hairRx = pw([
    [0, 0.08],
    [0.18, 0.105],
    [0.42, 0.075],
    [0.5, 0.09],
    [0.8, 0.09],
    [1, 0.07],
  ]);
  const hairR = (t: number): [number, number] => [hairRx(t), 0.03 + 0.012 * Math.sin(Math.min(t * 3, 1) * 1.5)];
  b.sweep(hair, hairR, { color: HAIR_BACK, caps: { start: "flat", end: "point" }, sides: 10 });

  const tieT = hairPath.closestT(V(0, 1.18, -0.115));
  const tieBone = hair.jointAt(tieT);
  b.sweep(hairPath, (t) => [hairR(t)[0] + 0.007, hairR(t)[1] + 0.007] as [number, number], {
    from: tieT - 0.02,
    to: tieT + 0.02,
    color: WHITE,
    caps: "flat",
    bone: tieBone,
    sides: 10,
  });
  b.sweep(hairPath, (t) => [hairR(t)[0] + 0.011, hairR(t)[1] + 0.011] as [number, number], {
    from: tieT + 0.02,
    to: tieT + 0.034,
    color: RED_CORD,
    caps: "flat",
    bone: tieBone,
    sides: 10,
  });
  // tail-end blades
  for (let i = 0; i < 6; i++) {
    const x = -0.075 + i * 0.03;
    const len = 0.1 + 0.035 * (1 - Math.abs(x) / 0.075) + (i % 2) * 0.01;
    b.extrude(lockShape(0.05, len), {
      at: V(x, 0.77 - Math.abs(x) * 0.12, -0.157),
      x: [1, 0, 0],
      y: [0, 1, 0.06],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: lockPaint(len),
      bone: hair.joints[5],
    });
  }
  // nape bow and tails
  bow(V(0, 1.18, -0.168), 1.1, hair.joints[3], WHITE, LACQUER, RED_CORD);
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 10), GOLD, { bone: tieBone, at: [0, 1.18, -0.178] });

  // ---- fox mask on the right side of the head ---------------------------------------------------------------
  const maskRight: Pt[] = [
    [0.03, -0.065],
    [0.062, -0.03],
    [0.078, 0.01, "sharp"],
    [0.07, 0.04],
    [0.062, 0.058],
    [0.05, 0.135, "sharp"],
    [0.014, 0.075, "sharp"],
  ];
  const maskOutline: Pt[] = [
    [0, -0.085 * MS, "sharp"],
    ...scalePts(maskRight, MS),
    [0, 0.068 * MS],
    ...scalePts(maskRight, MS)
      .map((p): Pt => (p.length === 3 ? [-p[0], p[1], "sharp"] : [-p[0], p[1]]))
      .reverse(),
  ];
  const maskPlate = shaded((p, n) =>
    Math.abs(n.dot(mn)) < 0.5 ? LACQUER : mix("#fffbf3", "#f3e8d6", 0.5 * noise(p, 0.05, 11)),
  );
  b.extrude(maskOutline, {
    at: P(0, 0, 0.012 / MS),
    x: mw,
    y: mu,
    thickness: 0.014,
    bevel: 0.004,
    smoothing: 1,
    color: maskPlate,
    bone: head,
  });
  b.part(new THREE.PlaneGeometry(0.16 * MS, 0.22 * MS), "#ffffff", {
    bone: head,
    at: P(0, 0.025, 0.02 / MS),
    dir: mn,
    up: mu,
    axis: "z",
    texture: MASK_ART,
  });
  // snout and nose
  b.part(new THREE.CylinderGeometry(0.009, 0.03 * MS, 0.05, 6), MASK_WHITE, {
    bone: head,
    at: P(0, -0.035, 0.0195 / MS + 0.025 / MS),
    dir: mn,
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.0105, 7, 5), INK_DARK, { bone: head, at: P(0, -0.035, 0.0195 / MS + 0.05 / MS) });
  // strap cord, tails and charms
  const strapStart = P(-0.074, 0.0, 0.012 / MS);
  const strap = catmull([
    strapStart,
    V(-0.125, 1.505, -0.035),
    V(-0.14, 1.44, -0.05),
    V(-0.145, 1.38, -0.05),
    V(-0.14, 1.33, -0.05),
  ]);
  b.sweep(strap, 0.0045, { color: RED_CORD, bone: head, caps: { start: "flat", end: "round" }, sides: 6 });
  b.sweep(
    catmull([strapStart, V(-0.12, 1.5, -0.01), V(-0.125, 1.43, -0.02), V(-0.12, 1.37, -0.01)]),
    0.0035,
    { color: WHITE, bone: head, sides: 6 },
  );
  bellAt(V(-0.14, 1.318, -0.05), head);
  b.spike(V(-0.14, 1.3, -0.05), [0, -1, 0], 0.05, 0.011, { color: LACQUER, bone: head });
  dangle(P(0, -0.082, 0.012 / MS), 0.04, head, RED_CORD, LACQUER);

  // ---- kanzashi: sakura flower with gold dangles on the left side -----------------------------------------
  const FL = V(0.095, 1.545, -0.03);
  const fn = V(0.8, 0.45, -0.25).normalize();
  const e1 = fn.clone().cross(UP).normalize();
  const e2 = fn.clone().cross(e1).normalize();
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const r = e1.clone().multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a));
    const tdir = fn.clone().cross(r).normalize();
    b.extrude(
      [[0, 0], [0.013, 0.01], [0.012, 0.03], [0.004, 0.042], [0, 0.036, "sharp"], [-0.004, 0.042], [-0.012, 0.03], [-0.013, 0.01]] as Pt[],
      { at: FL.clone().addScaledVector(fn, 0.002), x: tdir, y: r, thickness: 0.006, bevel: 0.002, smoothing: 1, color: PINK, bone: head },
    );
  }
  b.part(new THREE.SphereGeometry(0.011, 8, 6), GOLD, { bone: head, at: FL.clone().addScaledVector(fn, 0.007) });
  for (let k = 0; k < 3; k++) {
    const dx = 0.03 + 0.02 * k;
    const len = 0.12 + 0.04 * k;
    const start = FL.clone().addScaledVector(fn, 0.01);
    const sp = catmull([
      start,
      start.clone().add(V(dx * 0.6, -0.03, -0.01 * k)),
      start.clone().add(V(dx, -len * 0.6, -0.005 * k)),
      start.clone().add(V(dx * 1.05, -len, 0)),
    ]);
    b.sweep(sp, 0.0028, { color: HEM_GOLD, bone: head, sides: 5, caps: "round" });
    b.along(sp, 4, (at) => b.part(new THREE.SphereGeometry(0.0065, 6, 4), GOLD, { at, bone: head }), { from: 0.15, to: 0.85 });
    const end = sp.at(1);
    bellAt(end.clone().add(V(0, -0.012, 0)), head, 0.012);
    b.spike(end.clone().add(V(0, -0.026, 0)), [0, -1, 0], 0.04, 0.009, { color: k === 1 ? LACQUER : WHITE, bone: head });
  }

  // ---- hakama top and waist ---------------------------------------------------------------------------------
  const hakTop = b.loft(
    [
      { at: [0, 1.075, 0], w: 0.25, h: 0.19 },
      { at: [0, 1.0, 0], w: 0.265, h: 0.2 },
      { at: [0, 0.9, 0], w: 0.32, h: 0.23 },
      { at: [0, 0.8, 0], w: 0.37, h: 0.23 },
      { at: [0, 0.7, 0], w: 0.37, h: 0.2 },
    ],
    { bone: hips, color: hakama(2), sides: 12, smooth: false, caps: { start: "flat", end: "flat" } },
  );
  const hsk = b.surface(hakTop);
  b.sweep(hsk.loop([0, 1.04, 0], { lift: 0.004 }), 0.013, { color: WHITE });
  b.sweep(hsk.loop([0, 1.077, 0], { lift: 0.003 }), 0.008, { color: LACQUER });
  b.sweep(hsk.loop([0, 1.062, 0], { lift: 0.003 }), 0.0045, { color: HEM_GOLD });

  // front knot, himo tails, charms
  bow(V(0, 1.045, 0.113), 1, hips, WHITE, LACQUER, WHITE);
  const left = hsk.nearest(V(0.085, 1.04, 0.1));
  const ofudaTop = left.at.clone().addScaledVector(left.n, 0.012);
  b.rod(ofudaTop, ofudaTop.clone().add(V(0, -0.045, 0.004)), 0.003, HEM_GOLD, { bone: hips });
  b.part(new THREE.BoxGeometry(0.052, 0.15, 0.004), "#ffffff", {
    bone: hips,
    at: [0.085, 0.935, 0.108],
    rotation: [-8, 0, 0],
    texture: OFUDA,
  });
  dangle(V(-0.085, 1.04, 0.1), 0.06, hips, RED_CORD, LACQUER);
  bellAt(V(-0.085, 0.95, 0.103), hips, 0.016);

  // koshi-ita (back plate) with crest
  b.extrude(
    [[-0.07, -0.02], [0.07, -0.02], [0.075, 0.03], [0.04, 0.07], [0, 0.085, "sharp"], [-0.04, 0.07], [-0.075, 0.03]] as Pt[],
    { at: V(0, 1.03, -0.105), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, smoothing: 1, color: CLOTH, bone: hips },
  );
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    bone: hips,
    at: [0, 1.05, -0.1125],
    dir: [0, 0, -1],
    axis: "z",
    texture: CREST,
  });
  b.sweep(hsk.loop([0, 1.0, 0], { lift: 0.002 }), 0.004, { color: HEM_GOLD });

  // ---- arms, sleeves and hands -----------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const armDir = V(s * 0.82, -0.56, 0.06).normalize();
    const S = V(s * 0.165, 1.225, 0);
    const E = S.clone().addScaledVector(armDir, 0.27);
    const fd = V(s * 0.8, -0.55, 0.15).normalize();
    const W = E.clone().addScaledVector(fd, 0.25);
    const arm = b.chain(`arm${sd}`, polyline([S, E, W]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    const wrist = arm.tip as Joint;
    b.sweep(arm, (t) => 0.036 - 0.011 * t, { color: SKIN });
    const inner = b.sweep(arm, 0.05, { from: 0, to: 0.55, color: CLOTH, caps: { start: "round", end: "flat" }, sides: 10 });
    b.part(new THREE.SphereGeometry(0.056, 8, 6), CLOTH, { bone: arm.joints[0], at: S });
    // red cord tied around the upper arm
    const cordPath = b.surface(inner).loop(S.clone().addScaledVector(armDir, 0.1), { dir: armDir, lift: 0.003 });
    b.sweep(cordPath, 0.006, { color: RED_CORD });
    b.sweep(b.surface(inner).loop(S.clone().addScaledVector(armDir, 0.114), { dir: armDir, lift: 0.002 }), 0.0035, {
      color: HEM_GOLD,
    });

    // wide hanging sleeve
    const thick = armDir.clone().cross(UP).normalize();
    const sleeve = b.extrude(SLEEVE_OUTLINE, {
      at: S.clone().add(V(0, -0.002, 0)),
      x: armDir,
      y: [0, 1, 0],
      thickness: [0.04, 0.1],
      bevel: 0.012,
      smoothing: 1,
      color: sleevePaint(thick),
      bone: arm.joints[0],
    });
    const decalC = S.clone().addScaledVector(armDir, 0.23).add(V(0, -0.13, 0));
    for (const f of [1, -1])
      b.decal(sleeve, SLEEVE_ART, {
        at: decalC.clone().addScaledVector(thick, f * 0.04),
        dir: thick.clone().multiplyScalar(f),
        size: [0.2, 0.154],
        mirror: f < 0,
        bone: arm.joints[0],
      });
    const hemCorner = S.clone().addScaledVector(armDir, 0.385).add(V(0, -0.282, 0));
    dangle(hemCorner, 0.03, arm.joints[0], RED_CORD, PINK);

    // hand
    const front = fd.clone().cross(UP).normalize().multiplyScalar(s);
    const K = W.clone().addScaledVector(fd, 0.078);
    b.sweep(polyline([W, K]), (t) => [0.03 - 0.004 * t, 0.012] as [number, number], { up: [0, 1, 0], color: SKIN, bone: wrist });
    const tb = W.clone().addScaledVector(fd, 0.02).addScaledVector(front, 0.025).addScaledVector(UP, -0.004);
    const td1 = fd.clone().multiplyScalar(0.55).addScaledVector(front, 0.8).addScaledVector(UP, -0.15).normalize();
    const td2 = fd.clone().multiplyScalar(0.6).addScaledVector(front, 0.7).addScaledVector(UP, -0.2).normalize();
    const t1 = tb.clone().addScaledVector(td1, 0.032);
    const t2 = t1.clone().addScaledVector(td2, 0.028);
    const thumb = b.chain(`thumb${sd}`, polyline([tb, t1, t2]), { parent: wrist, names: [`thumb${sd}1`, `thumb${sd}2`], role: "digit" });
    b.sweep(thumb, [0.011, 0.007], { color: SKIN });
    b.part(new THREE.SphereGeometry(0.0055, 5, 4), NAIL, { bone: thumb.joints[1], at: t2.clone().addScaledVector(UP, 0.003) });
    const names = ["index", "middle", "ring", "pinky"];
    const lens = [0.034, 0.037, 0.034, 0.027];
    names.forEach((nm, i) => {
      const k0 = K.clone().addScaledVector(front, 0.021 - i * 0.0135);
      const d1 = fd.clone().addScaledVector(front, 0.12 - i * 0.08).addScaledVector(UP, -0.1).normalize();
      const d2 = d1.clone().addScaledVector(UP, -0.15).normalize();
      const k1 = k0.clone().addScaledVector(d1, lens[i]);
      const k2 = k1.clone().addScaledVector(d2, lens[i] * 0.85);
      const fc = b.chain(`${nm}${sd}`, polyline([k0, k1, k2]), { parent: wrist, names: [`${nm}${sd}1`, `${nm}${sd}2`], role: "digit" });
      b.sweep(fc, [0.0085, 0.006], { color: SKIN });
      b.part(new THREE.SphereGeometry(0.005, 5, 4), NAIL, { bone: fc.joints[1], at: k2.clone().addScaledVector(UP, 0.003) });
    });
    foxFire(W.clone().addScaledVector(fd, 0.05).add(V(0, 0.12, 0)), wrist, 1);
  }

  // ---- legs and feet -----------------------------------------------------------------------------------------
  const hakRx = pw([
    [0, 0.125],
    [0.5, 0.118],
    [0.9, 0.132],
  ]);
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hipP = V(s * 0.075, 0.84, 0);
    const knee = V(s * 0.08, 0.46, 0.01);
    const ankle = V(s * 0.085, 0.078, 0);
    const leg = b.chain(`leg${sd}`, polyline([hipP, knee, ankle]), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [s * 0.085, 0, 0.03],
    });
    b.sweep(leg, [0.05, 0.032], { color: CLOTH, sides: 8 });
    const hk = b.sweep(leg, (t) => [hakRx(t), hakRx(t) * 0.9] as [number, number], {
      from: 0,
      to: 0.9,
      color: hakama(0.8),
      caps: { start: "none", end: "flat" },
      sides: 12,
      smooth: false,
    });
    const hsurf = b.surface(hk);
    const ringA = hsurf.loop(leg.at(0.8).at, { dir: [0, 1, 0], lift: 0.003 });
    glow(b.sweep(ringA, 0.0045, { color: HEM_GOLD }), 0.8);
    b.sweep(hsurf.loop(leg.at(0.87).at, { dir: [0, 1, 0], lift: 0.003 }), 0.0035, { color: LACQUER });

    // tabi foot
    const ankleJ = leg.tip as Joint;
    const fx = s * 0.085;
    b.capsule(V(fx, 0.058, -0.035), V(fx, 0.045, 0.07), [0.036, 0.033], CLOTH, { bone: ankleJ, sides: 8 });
    const toe = b.joint(`toe${sd}`, { parent: ankleJ, at: [fx, 0.045, 0.07], aim: [fx, 0.04, 0.15], role: "digit" });
    b.capsule(V(fx - s * 0.016, 0.044, 0.07), V(fx - s * 0.016, 0.038, 0.145), 0.0165, CLOTH, { bone: toe, sides: 6 });
    b.capsule(V(fx + s * 0.012, 0.044, 0.07), V(fx + s * 0.012, 0.037, 0.128), 0.0225, CLOTH, { bone: toe, sides: 6 });
    // zori sandal
    b.extrude(SOLE_OUTLINE, {
      at: V(fx, 0.011, 0.03),
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      color: SOLE,
      bone: ankleJ,
    });
    b.extrude(SOLE_OUTLINE, {
      at: V(fx, 0.0235, 0.03),
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.004,
      color: LACQUER,
      bone: ankleJ,
    });
    const post = V(fx, 0.028, 0.095);
    b.sphereStrapPlaceholder?.();
    b.part(new THREE.SphereGeometry(0.008, 6, 4), RED_CORD, { bone: ankleJ, at: post });
    b.rod(post, V(fx + 0.04, 0.05, 0.0), 0.006, RED_CORD, { bone: ankleJ, sides: 5 });
    b.rod(post, V(fx - 0.04, 0.05, 0.0), 0.006, RED_CORD, { bone: ankleJ, sides: 5 });
  }

  // ---- pose-neutral finishing touches --------------------------------------------------------------------
  // small gold pins on the collar edge
  b.along(redCollar, 3, (at) => b.part(new THREE.SphereGeometry(0.005, 5, 4), GOLD, { at, bone: chest }), { from: 0.3, to: 0.9 });

  return b.root;
}
