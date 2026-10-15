import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { lerp } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { mix, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import type { Surface } from "../../../../src/surface";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg field medic with a healing staff: white armor, graphite undersuit, one mint-teal accent, a cybernetic left arm and half-face, medical backpack and a glowing crystal staff.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type Col = string | Paint;

// ---- palette -------------------------------------------------------------------------------------------------
const WHITE = "#f2f6f9";
const WHITE_LO = "#9db0c4";
const TEAL = "#17e0c0";
const TEAL_DK = "#0b8f8a";
const TEAL_PALE = "#d9fff8";
const GRAPH = "#2d3644";
const INK = "#1c2430";
const SILVER = "#c9d3dd";
const METAL_HI = "#d5dde6";
const METAL_LO = "#6c7a8b";
const SKIN_HI = "#e2a47c";
const SKIN_LO = "#b4735b";
const HAIR_HI = "#cf8140";
const HAIR_LO = "#5b2f1f";

const lightK = (n: THREE.Vector3, bias = 0) => smoothstep(-0.65, 0.75, n.y * 0.7 + n.z * 0.4 + bias);
const shade = (hi: string, lo: string, bias = 0): Paint => paint((_p, n) => mix(lo, hi, lightK(n, bias)));

const WHITE_P = shade(WHITE, WHITE_LO);
const UNDER_P = shade("#4a566a", "#1b212c");
const GRAPH_P = shade("#3b4658", "#161b24");
const GLOVE_P = shade("#465266", "#181d27");
const METAL_P = shade(METAL_HI, METAL_LO);
const SKIN_P = shade(SKIN_HI, SKIN_LO);
const HAIR_P = shade(HAIR_HI, HAIR_LO);
const FACE_P = paint((p, n) => {
  const d = p.x - (0.014 + (p.y - 1.71) * 0.45);
  const k = lightK(n);
  if (Math.abs(d) < 0.0022) return INK;
  if (d > 0) return mix(METAL_LO, METAL_HI, k);
  return mix(SKIN_LO, SKIN_HI, k);
});

// ---- small helpers -------------------------------------------------------------------------------------------
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const FRONT = V(0, 0, 1);
const BACK = V(0, 0, -1);

/** Chamfered rectangle outline, centred. */
function rr(w: number, h: number, c: number): OutlinePoint[] {
  return [
    [-w / 2 + c, -h / 2],
    [w / 2 - c, -h / 2],
    [w / 2, -h / 2 + c],
    [w / 2, h / 2 - c],
    [w / 2 - c, h / 2],
    [-w / 2 + c, h / 2],
    [-w / 2, h / 2 - c],
    [-w / 2, -h / 2 + c],
  ];
}

/** Outline drawn "front positive" turned into the drawing direction of a plate facing sideways (s = +1 left). */
const fl = (o: OutlinePoint[], s: number): OutlinePoint[] => o.map(([u, v]) => [-s * u, v] as OutlinePoint);

const ringPts = (cy: number, rx: number, rz: number, cz = 0, n = 14) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return V(Math.sin(a) * rx, cy, cz + Math.cos(a) * rz);
  });

// ---- torso profile -------------------------------------------------------------------------------------------
const TX = [0, 0.25, 0.55, 0.8, 1];
const TRX = [0.165, 0.145, 0.175, 0.2, 0.16];
const TRY = [0.115, 0.1, 0.115, 0.135, 0.11];
const torsoR = (t: number, m = 0): [number, number] => [
  interpolate(TX, TRX, t) + m,
  interpolate(TX, TRY, t) + m,
];

// ---- outlines ------------------------------------------------------------------------------------------------
const SHIN: OutlinePoint[] = [
  [-0.045, -0.13],
  [0.045, -0.13],
  [0.056, 0.09],
  [0.032, 0.13],
  [-0.032, 0.13],
  [-0.056, 0.09],
];
const BOOT: OutlinePoint[] = [
  [-0.1, 0.03],
  [-0.085, 0.016],
  [0.19, 0.016],
  [0.235, 0.03],
  [0.235, 0.055],
  [0.17, 0.085],
  [0.09, 0.11],
  [0.075, 0.215],
  [-0.065, 0.215],
  [-0.1, 0.12],
  [-0.113, 0.06],
];
const SOLE: OutlinePoint[] = [
  [-0.115, 0.0],
  [0.22, 0.0],
  [0.245, 0.02],
  [0.245, 0.032],
  [-0.118, 0.032],
  [-0.125, 0.015],
];
const TOECAP: OutlinePoint[] = [
  [0.14, 0.016],
  [0.19, 0.016],
  [0.235, 0.03],
  [0.235, 0.055],
  [0.17, 0.085],
  [0.14, 0.092],
];
const FOREARM_PLATE: OutlinePoint[] = [
  [-0.036, -0.09],
  [0.036, -0.09],
  [0.044, 0.05],
  [0.026, 0.09],
  [-0.026, 0.09],
  [-0.044, 0.05],
];
const TRAPEZOID: OutlinePoint[] = [
  [-0.062, -0.1],
  [0.062, -0.1],
  [0.078, 0.1],
  [-0.078, 0.1],
];

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });

  // ---- placement helpers -------------------------------------------------------------------------------------
  /** An extruded, bevelled plate lying on a surface point `at`, facing `facing`, drawn with `up` as its top. */
  const panel = (
    bone: Joint,
    at: THREE.Vector3,
    facing: THREE.Vector3,
    up: THREE.Vector3,
    outline: OutlinePoint[],
    thick: number,
    color: Col,
    bevel = thick * 0.3,
  ) => {
    const f = facing.clone().normalize();
    const y = up.clone().addScaledVector(f, -up.dot(f)).normalize();
    const x = y.clone().cross(f).normalize();
    return b.extrude(outline, {
      at: at.clone().addScaledVector(f, thick / 2),
      x,
      y,
      thickness: thick,
      bevel,
      color,
      bone,
    });
  };

  const onLimb = (a: THREE.Vector3, c: THREE.Vector3, t: number, ref: THREE.Vector3, off: number) => {
    const up = a.clone().sub(c).normalize();
    const n = ref.clone().addScaledVector(up, -ref.dot(up)).normalize();
    return lerp(a, c, t).addScaledVector(n, off);
  };

  const limbPanel = (
    bone: Joint,
    a: THREE.Vector3,
    c: THREE.Vector3,
    t: number,
    ref: THREE.Vector3,
    off: number,
    outline: OutlinePoint[],
    thick: number,
    color: Col,
  ) => {
    const up = a.clone().sub(c).normalize();
    const n = ref.clone().addScaledVector(up, -ref.dot(up)).normalize();
    return panel(bone, onLimb(a, c, t, ref, off), n, up, outline, thick, color);
  };

  const block = (
    bone: Joint,
    at: number[],
    size: [number, number, number],
    color: Col,
    rotation?: number[],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at,
      ...(rotation ? { rotation } : {}),
    });

  const blob = (
    bone: Joint,
    at: THREE.Vector3 | number[],
    r: [number, number, number],
    color: Col,
    rotation?: number[],
    seg: [number, number] = [10, 7],
  ) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, {
      bone,
      at,
      scale: r,
      ...(rotation ? { rotation } : {}),
    });

  const cyl = (
    bone: Joint,
    at: THREE.Vector3 | number[],
    dir: THREE.Vector3 | number[],
    r0: number,
    r1: number,
    h: number,
    color: Col,
    sides = 10,
  ) => b.part(new THREE.CylinderGeometry(r0, r1, h, sides), color, { bone, at, dir });

  const hitAt = (surf: Surface, c: THREE.Vector3, az: number, el: number) => {
    const h = surf.around(c).at(az, el);
    if (!h) throw new Error(`cyborgMedic: no surface hit at azimuth ${az}, elevation ${el}`);
    return h;
  };

  // ---- textures ----------------------------------------------------------------------------------------------
  const EYE_HUMAN = svg(
    `<svg viewBox="0 0 64 40">
<defs><clipPath id="e"><path d="M3 24 Q32 -2 61 24 Q32 38 3 24 Z"/></clipPath></defs>
<path d="M3 24 Q32 -2 61 24 Q32 38 3 24 Z" fill="#fbf7f2"/>
<g clip-path="url(#e)">
<circle cx="32" cy="21" r="13" fill="#9a6230"/>
<circle cx="32" cy="25" r="10" fill="#d49a4c"/>
<circle cx="32" cy="21" r="13" fill="none" stroke="#4a2a14" stroke-width="2.4"/>
<circle cx="32" cy="21" r="6" fill="#140c08"/>
<rect x="0" y="0" width="64" height="15" fill="#2a1410" fill-opacity="0.22"/>
</g>
<circle cx="38" cy="16" r="3.4" fill="#ffffff"/>
<circle cx="27" cy="26" r="1.7" fill="#ffffff"/>
<path d="M2 24 Q32 -4 62 24" fill="none" stroke="#1b0f0c" stroke-width="4.2" stroke-linecap="round"/>
<path d="M12 29 Q32 36 52 29" fill="none" stroke="#6b4636" stroke-width="2" stroke-linecap="round"/>
</svg>`,
    { size: 256 },
  );

  const EYE_CYBER = svg(
    `<svg viewBox="0 0 64 40">
<ellipse cx="32" cy="20" rx="29" ry="17" fill="#0b1118" stroke="#dfe7ee" stroke-width="3"/>
<circle cx="32" cy="20" r="13" fill="#0a8d82"/>
<circle cx="32" cy="20" r="11" fill="#17e0c0"/>
<circle cx="32" cy="20" r="11" fill="none" stroke="#e8fffb" stroke-width="2"/>
<circle cx="32" cy="20" r="4.6" fill="#eafffb"/>
<path d="M5 20 H16 M48 20 H59" stroke="#17e0c0" stroke-width="3" stroke-linecap="round"/>
<circle cx="37" cy="14" r="2.4" fill="#ffffff"/>
</svg>`,
    { size: 256 },
  );

  const MOUTH = svg(
    `<svg viewBox="0 0 40 20">
<path d="M3 7 Q20 17 37 7" fill="none" stroke="#6e2a2c" stroke-width="3.4" stroke-linecap="round"/>
<path d="M9 11 Q20 18 31 11" fill="none" stroke="#c9707a" stroke-width="2.8" stroke-linecap="round"/>
</svg>`,
    { size: 192 },
  );

  const CIRCUIT = svg(
    `<svg viewBox="0 0 80 64">
<g stroke="#18f0cf" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M6 50 L22 50 L30 40 L52 40 L60 30 L74 30"/>
<path d="M10 24 L26 24 L34 14 L58 14"/>
<path d="M22 50 L22 60"/>
<path d="M52 40 L52 56 L66 56"/>
</g>
<g fill="#18f0cf"><circle cx="6" cy="50" r="3.4"/><circle cx="74" cy="30" r="3.4"/><circle cx="58" cy="14" r="3.4"/><circle cx="66" cy="56" r="3"/></g>
</svg>`,
    { size: 256 },
  );

  const CHEST_TEX = svg(
    `<svg viewBox="0 0 100 64">
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M50 4 L50 62" stroke="#1d2733" stroke-width="1.6"/>
<path d="M50 20 C40 25 26 25 8 16" stroke="#1d2733" stroke-width="1.6"/>
<path d="M50 38 C40 43 26 43 10 34" stroke="#1d2733" stroke-width="1.6"/>
<path d="M50 20 C60 25 74 25 92 16" stroke="#1d2733" stroke-width="1.6"/>
<path d="M50 38 C60 43 74 43 90 34" stroke="#1d2733" stroke-width="1.6"/>
<path d="M14 52 L50 60 L86 52" stroke="#1d2733" stroke-width="5.4"/>
<path d="M14 52 L50 60 L86 52" stroke="#17e0c0" stroke-width="2.6"/>
</g>
<g fill="#1d2733"><circle cx="9" cy="17" r="1.7"/><circle cx="91" cy="17" r="1.7"/><circle cx="11" cy="35" r="1.7"/><circle cx="89" cy="35" r="1.7"/></g>
</svg>`,
    { size: 384 },
  );

  const ABS_TEX = svg(
    `<svg viewBox="0 0 64 40">
<g stroke="#5a6a80" stroke-width="1.8" fill="none" stroke-linecap="round">
<path d="M32 2 L32 38"/><path d="M6 14 H58"/><path d="M8 26 H56"/>
<path d="M16 4 L16 12"/><path d="M48 4 L48 12"/><path d="M18 28 L18 36"/><path d="M46 28 L46 36"/>
</g>
<g fill="#17e0c0"><rect x="30" y="8" width="4" height="3"/><rect x="30" y="20" width="4" height="3"/><rect x="30" y="32" width="4" height="3"/></g>
</svg>`,
    { size: 256 },
  );

  const HOLO = svg(
    `<svg viewBox="0 0 64 40">
<rect x="1" y="1" width="62" height="38" rx="4" fill="#06302f" stroke="#17e0c0" stroke-width="2"/>
<path d="M6 26 L18 26 L22 12 L28 34 L33 20 L38 26 L58 26" fill="none" stroke="#7bffe8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#17e0c0"><rect x="8" y="6" width="3" height="6"/><rect x="13" y="8" width="3" height="4"/><rect x="18" y="5" width="3" height="7"/></g>
<rect x="44" y="5" width="12" height="3" fill="#17e0c0"/><rect x="50" y="2" width="3" height="9" fill="#17e0c0" fill-opacity="0.0"/>
</svg>`,
    { size: 192 },
  );

  const BADGE = svg(
    `<svg viewBox="0 0 64 64">
<polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="#f2f6f9" stroke="#1d2733" stroke-width="4" stroke-linejoin="round"/>
<rect x="26" y="14" width="12" height="36" rx="2" fill="#17e0c0"/>
<rect x="14" y="26" width="36" height="12" rx="2" fill="#17e0c0"/>
</svg>`,
    { size: 128 },
  );

  const PACK_TEX = svg(
    `<svg viewBox="0 0 64 64">
<defs><clipPath id="hz"><rect x="6" y="50" width="52" height="9"/></clipPath></defs>
<rect x="4" y="4" width="56" height="56" rx="4" fill="none" stroke="#1d2733" stroke-width="2.4"/>
<path d="M4 20 H60 M4 46 H60" stroke="#1d2733" stroke-width="2" fill="none"/>
<g clip-path="url(#hz)"><rect x="6" y="50" width="52" height="9" fill="#17e0c0"/>
<path d="M2 62 L14 48 M14 62 L26 48 M26 62 L38 48 M38 62 L50 48 M50 62 L62 48" stroke="#1d2733" stroke-width="4"/></g>
<g stroke="#1d2733" stroke-width="2.2" stroke-linecap="round"><path d="M10 11 H26 M10 15 H22 M38 11 H54 M42 15 H54"/></g>
</svg>`,
    { size: 256 },
  );

  // ---- skeleton: spine, neck, head, jaw ----------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.15, 0.004],
      [0, 1.31, 0.012],
      [0, 1.5, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.5, 0], aim: [0, 1.62, 0.015], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.62, 0.015], aim: [0, 1.75, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.695, 0], aim: [0, 1.695, 0.1], role: "jaw" });

  // ---- torso -------------------------------------------------------------------------------------------------
  b.sweep(
    catmull([
      [0, 0.86, 0],
      [0, 1.03, 0],
    ]),
    () => [0.185, 0.125],
    { bone: hips, color: UNDER_P, caps: "flat" },
  );

  const torso = b.sweep(spine, (t) => torsoR(t), {
    color: UNDER_P,
    caps: { start: "round", end: "flat" },
  });
  const shell = b.sweep(spine, (t) => torsoR(t, 0.022), {
    from: 0.38,
    to: 1,
    color: WHITE_P,
    caps: "flat",
  });
  const shellS = b.surface(shell);
  const torsoS = b.surface(torso);

  // teal belt line at the lower edge of the cuirass
  glow(
    b.sweep(catmull(ringPts(1.2, torsoR(0.4, 0.027)[0], torsoR(0.4, 0.027)[1], 0.008), { closed: true }), () => [0.005, 0.007], {
      section: "box",
      up: [0, 1, 0],
      color: TEAL,
      bone: chest,
    }),
  );

  b.decal(shellS, CHEST_TEX, { at: hitAt(shellS, V(0, 1.38, 0), 0, 0), size: [0.3, 0.192] });
  b.decal(torsoS, ABS_TEX, { at: hitAt(torsoS, V(0, 1.11, 0), 0, 0), size: [0.18, 0.113] });

  const core = hitAt(shellS, V(0, 1.4, 0), 0, 0);
  b.stick(new THREE.CylinderGeometry(0.048, 0.048, 0.014, 6), GRAPH_P, core, { bone: chest, embed: 0.3 });
  glow(b.stick(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 6), TEAL, core, { bone: chest, embed: 0.3 }), 1.4);

  // belt, buckle, pouches, hip plates and tabards
  b.sweep(catmull(ringPts(1.04, 0.19, 0.14, 0), { closed: true }), () => [0.014, 0.032], {
    section: "box",
    up: [0, 1, 0],
    color: GRAPH_P,
    bone: hips,
  });
  panel(hips, V(0, 1.04, 0.138), FRONT, UP, rr(0.09, 0.07, 0.016), 0.02, WHITE_P);
  glow(panel(hips, V(0, 1.04, 0.158), FRONT, UP, rr(0.04, 0.036, 0.01), 0.008, TEAL));
  for (const s of [1, -1]) {
    panel(hips, V(s * 0.19, 0.975, 0.01), V(s, 0, 0), UP, rr(0.15, 0.13, 0.03), 0.028, WHITE_P);
    glow(panel(hips, V(s * 0.218, 0.975, 0.01), V(s, 0, 0), UP, rr(0.1, 0.012, 0.004), 0.006, TEAL));
    // belt pouch
    panel(hips, V(s * 0.192, 1.04, 0.1), V(s, 0, 0), UP, rr(0.07, 0.08, 0.014), 0.026, GRAPH_P);
    // front tabard flaps hang from the belt
    panel(hips, V(s * 0.07, 0.9, 0.132), FRONT, UP, TRAPEZOID, 0.016, WHITE_P);
    glow(panel(hips, V(s * 0.07, 0.9, 0.148), FRONT, UP, rr(0.012, 0.15, 0.004), 0.005, TEAL));
  }
  panel(hips, V(0, 0.92, -0.135), BACK, UP, TRAPEZOID, 0.016, WHITE_P);
  glow(panel(hips, V(0, 0.92, -0.151), BACK, UP, rr(0.012, 0.14, 0.004), 0.005, TEAL));

  // medkit on the right hip
  panel(hips, V(-0.225, 1.0, 0.07), V(-1, 0, 0), UP, rr(0.11, 0.1, 0.02), 0.03, WHITE_P);
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    bone: hips,
    at: [-0.257, 1.0, 0.07],
    dir: [-1, 0, 0],
    axis: "z",
    texture: BADGE,
  });

  // collar
  b.lathe(
    [
      [0.07, 0],
      [0.108, 0],
      [0.122, 0.035],
      [0.106, 0.082],
      [0.08, 0.082],
    ],
    { at: [0, 1.488, 0.0], axis: [0, 1, 0], segments: 10, color: WHITE_P, bone: chest },
  );
  glow(
    b.part(new THREE.TorusGeometry(0.093, 0.005, 5, 14), TEAL, {
      bone: chest,
      at: [0, 1.572, 0],
      dir: [0, 1, 0],
      axis: "z",
    }),
  );

  // ---- backpack ----------------------------------------------------------------------------------------------
  panel(chest, V(0, 1.34, -0.15), BACK, UP, rr(0.24, 0.26, 0.04), 0.03, GRAPH_P);
  const pack = panel(chest, V(0, 1.34, -0.18), BACK, UP, rr(0.3, 0.32, 0.06), 0.15, WHITE_P, 0.03);
  panel(chest, V(0, 1.5, -0.255), UP, V(0, 0, 1), rr(0.26, 0.12, 0.03), 0.02, GRAPH_P);
  for (let i = 0; i < 4; i++) block(chest, [0, 1.524, -0.215 - i * 0.03], [0.2, 0.008, 0.016], GRAPH_P);
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: chest,
    at: [0, 1.33, -0.3315],
    dir: [0, 0, -1],
    axis: "z",
    texture: PACK_TEX,
  });
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
    bone: chest,
    at: [0, 1.405, -0.3325],
    dir: [0, 0, -1],
    axis: "z",
    texture: BADGE,
  });
  for (const s of [1, -1]) {
    // canisters on the back flanks
    cyl(chest, [s * 0.175, 1.33, -0.35], [0, 1, 0], 0.042, 0.042, 0.3, METAL_P);
    cyl(chest, [s * 0.175, 1.33, -0.35], [0, 1, 0], 0.046, 0.046, 0.06, GRAPH_P);
    glow(cyl(chest, [s * 0.175, 1.33, -0.35], [0, 1, 0], 0.0475, 0.0475, 0.035, TEAL), 1.1);
    glow(cyl(chest, [s * 0.175, 1.42, -0.35], [0, 1, 0], 0.0455, 0.0455, 0.012, TEAL), 1.1);
    blob(chest, [s * 0.175, 1.48, -0.35], [0.042, 0.03, 0.042], GRAPH_P);
    blob(chest, [s * 0.175, 1.18, -0.35], [0.042, 0.03, 0.042], GRAPH_P);
    // side light strips on the case
    glow(panel(chest, V(s * 0.15, 1.4, -0.255), V(s, 0, 0), UP, fl(rr(0.12, 0.014, 0.004), s), 0.006, TEAL));
    glow(panel(chest, V(s * 0.15, 1.28, -0.255), V(s, 0, 0), UP, fl(rr(0.12, 0.014, 0.004), s), 0.006, TEAL));
  }
  // antenna
  b.rod([0.12, 1.5, -0.3], [0.14, 1.8, -0.32], 0.005, { bone: chest, color: GRAPH_P });
  glow(blob(chest, [0.14, 1.81, -0.32], [0.012, 0.012, 0.012], TEAL, undefined, [6, 4]), 1.6);
  // hose from the pack to the right hip
  b.sweep(
    catmull([
      [-0.175, 1.2, -0.35],
      [-0.27, 1.14, -0.3],
      [-0.31, 1.08, -0.18],
      [-0.235, 1.03, -0.09],
    ]),
    0.012,
    { bone: chest, color: GRAPH_P },
  );
  for (const t of [0.3, 0.7]) {
    void t;
  }
  blob(chest, [-0.235, 1.03, -0.09], [0.022, 0.022, 0.022], WHITE_P, undefined, [8, 5]);
  // second hose to the left shoulder frame
  b.sweep(
    catmull([
      [0.175, 1.48, -0.35],
      [0.19, 1.56, -0.28],
      [0.14, 1.58, -0.12],
      [0.1, 1.55, -0.02],
    ]),
    0.011,
    { bone: chest, color: GRAPH_P },
  );
  void pack;

  // ---- neck --------------------------------------------------------------------------------------------------
  b.rod([0, 1.49, 0], [0, 1.65, 0.02], 0.05, { bone: neck, color: SKIN_P, caps: "flat" });
  b.sweep(
    catmull([
      [0.06, 1.69, -0.03],
      [0.068, 1.62, 0.0],
      [0.075, 1.56, 0.0],
    ]),
    0.008,
    { bone: neck, color: INK },
  );
  glow(
    b.part(new THREE.TorusGeometry(0.05, 0.004, 5, 12), TEAL, {
      bone: neck,
      at: [0, 1.59, 0.012],
      dir: [0, 1, 0],
      axis: "z",
    }),
  );

  // ---- head --------------------------------------------------------------------------------------------------
  const FACE_C = V(0, 1.715, 0.045);
  const JAW_C = V(0, 1.668, 0.045);
  const HAIR_C = V(0, 1.76, -0.004);
  blob(head, [0, 1.755, 0], [0.085, 0.092, 0.095], FACE_P, undefined, [16, 11]);
  const face = blob(head, FACE_C, [0.076, 0.082, 0.075], FACE_P, undefined, [16, 11]);
  const jawP = blob(jaw, JAW_C, [0.062, 0.036, 0.066], FACE_P, undefined, [14, 8]);
  const faceS = b.surface(face);
  const jawS = b.surface(jawP);

  // eyes: human on the model's right (-x), cyber lens on the left (+x)
  for (const s of [1, -1]) {
    const eh = hitAt(faceS, FACE_C, s * 29, 7);
    const eye = b.decal(faceS, s > 0 ? EYE_CYBER : EYE_HUMAN, { at: eh, size: [0.05, 0.031] });
    if (s > 0) {
      glow(eye, 1.3);
      b.part(new THREE.TorusGeometry(0.029, 0.0045, 5, 14), WHITE_P, {
        bone: head,
        at: eh,
        dir: eh,
        axis: "z",
        scale: [0.9, 0.62, 1],
      });
    }
    // brows
    const brow = catmull([hitAt(faceS, FACE_C, s * 8, 25), hitAt(faceS, FACE_C, s * 28, 27), hitAt(faceS, FACE_C, s * 50, 22)]);
    b.sweep(brow, s > 0 ? [0.005, 0.009, 0.006] : [0.004, 0.0075, 0.005], {
      bone: head,
      color: s > 0 ? "#2a3340" : HAIR_P,
    });
  }
  // nose and mouth
  blob(head, [0, 1.703, 0.122], [0.011, 0.016, 0.015], FACE_P);
  b.decal(jawS, MOUTH, { at: hitAt(jawS, JAW_C, 0, 16), size: [0.04, 0.02] });
  // cyber half-face: circuit decal, cheek plate, temple plate
  const circuit = b.decal(faceS, CIRCUIT, { at: hitAt(faceS, FACE_C, 62, -6), size: [0.062, 0.05] });
  glow(circuit, 1.2);
  b.stick(new THREE.BoxGeometry(0.05, 0.012, 0.036), WHITE_P, hitAt(faceS, FACE_C, 42, -24), { bone: head, embed: 0.3 });
  glow(b.stick(new THREE.BoxGeometry(0.03, 0.006, 0.006), TEAL, hitAt(faceS, FACE_C, 42, -24), { bone: head, embed: -0.2 }));
  b.stick(new THREE.BoxGeometry(0.044, 0.012, 0.032), WHITE_P, hitAt(faceS, FACE_C, 78, 22), { bone: head, embed: 0.3 });
  // chin plate on the cyber side
  b.stick(new THREE.BoxGeometry(0.036, 0.01, 0.026), METAL_P, hitAt(jawS, JAW_C, 28, -34), { bone: jaw, embed: 0.3 });

  // ears and earpiece
  blob(head, [-0.081, 1.716, -0.005], [0.012, 0.026, 0.02], SKIN_P);
  cyl(head, [0.088, 1.718, -0.01], [1, 0, 0], 0.042, 0.042, 0.03, WHITE_P);
  glow(cyl(head, [0.104, 1.718, -0.01], [1, 0, 0], 0.026, 0.026, 0.008, TEAL), 1.2);
  b.rod([0.09, 1.74, -0.02], [0.1, 1.84, -0.05], 0.004, { bone: head, color: GRAPH_P });
  glow(blob(head, [0.1, 1.848, -0.052], [0.01, 0.01, 0.01], TEAL, undefined, [6, 4]), 1.6);
  // boom mic
  b.sweep(
    catmull([
      [0.1, 1.712, 0.0],
      [0.1, 1.688, 0.07],
      [0.074, 1.656, 0.122],
      [0.036, 1.646, 0.134],
    ]),
    0.0045,
    { bone: head, color: GRAPH_P },
  );
  glow(blob(head, [0.034, 1.645, 0.136], [0.0085, 0.0085, 0.0085], TEAL, undefined, [6, 4]), 1.4);

  // hair
  const hairCap = b.part(new THREE.SphereGeometry(1, 14, 9, 0, Math.PI * 2, 0, 1.52), HAIR_P, {
    bone: head,
    at: HAIR_C,
    scale: [0.093, 0.1, 0.104],
    rotation: [-25, 0, 0],
  });
  const hairS = b.surface(hairCap);
  const rows: Array<[number, number[]]> = [
    [30, [-75, -50, 50, 75]],
    [48, [-60, -30, 0, 30, 60]],
    [66, [-45, -15, 15, 45]],
  ];
  let strand = 0;
  for (const [el, azs] of rows)
    for (const az of azs) {
      const h = hairS.around(HAIR_C).at(az, el);
      if (!h) continue;
      const d = h.n
        .clone()
        .multiplyScalar(0.45)
        .add(V(Math.sign(az) * 0.18, 0.15, -0.85));
      b.spike(h, d, 0.09 + 0.012 * (strand % 3), 0.021, { color: strand % 2 ? HAIR_P : shade(HAIR_HI, "#8a4a26"), bone: head });
      strand++;
    }
  // ponytail with a teal tie
  const hairBack = hairS.around(HAIR_C).at(180, 20);
  if (!hairBack) throw new Error("cyborgMedic: hair back hit missing");
  const tail = catmull([hairBack, V(0, 1.765, -0.17), V(0, 1.705, -0.215), V(0, 1.625, -0.205), V(0, 1.555, -0.175)]);
  b.sweep(tail, [0.032, 0.042, 0.035, 0.022, 0.008], { bone: head, color: HAIR_P, caps: { start: "round", end: "point" } });
  glow(
    b.part(new THREE.TorusGeometry(0.039, 0.007, 5, 10), TEAL, {
      bone: head,
      at: tail.at(0.14),
      dir: tail.tangentAt(0.14),
      axis: "z",
    }),
  );
  // side lock framing the human cheek
  const lock = hairS.around(HAIR_C).at(-82, 18);
  if (lock) b.spike(lock, V(-0.2, -1, 0.15), 0.1, 0.02, { color: HAIR_P, bone: head });

  // ---- legs --------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.1, 0.94, 0], [s * 0.105, 0.105, -0.01], [0.46, 0.4], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.105, 0, 0.05],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    const toe = b.joint(`toe${S}`, {
      parent: ankleJ,
      at: [s * 0.105, 0.06, 0.115],
      aim: [s * 0.105, 0.035, 0.215],
      role: "digit",
    });
    const hp = pts[0];
    const kp = pts[1];
    const ap = pts[2];

    b.sweep(leg, (t) => interpolate([0, 0.25, 0.5, 0.75, 1], [0.094, 0.09, 0.066, 0.07, 0.05], t), { color: UNDER_P });

    // thigh armor
    limbPanel(hipJ, hp, kp, 0.45, FRONT, 0.088, rr(0.1, 0.24, 0.025), 0.026, WHITE_P);
    limbPanel(hipJ, hp, kp, 0.4, V(s, 0, 0), 0.09, rr(0.12, 0.26, 0.03), 0.022, WHITE_P);
    glow(limbPanel(hipJ, hp, kp, 0.4, V(s, 0, 0), 0.112, rr(0.016, 0.2, 0.005), 0.006, TEAL));
    limbPanel(hipJ, hp, kp, 0.12, FRONT, 0.095, rr(0.12, 0.05, 0.012), 0.02, GRAPH_P);
    // knee
    blob(kneeJ, [kp.x, kp.y, kp.z + 0.045], [0.068, 0.078, 0.058], WHITE_P);
    glow(
      b.part(new THREE.TorusGeometry(0.05, 0.006, 5, 12), TEAL, {
        bone: kneeJ,
        at: [kp.x, kp.y, kp.z + 0.092],
        dir: [0, 0, 1],
        axis: "z",
      }),
    );
    blob(kneeJ, [kp.x, kp.y, kp.z - 0.035], [0.06, 0.07, 0.04], GRAPH_P);
    // shin and calf
    limbPanel(kneeJ, kp, ap, 0.45, FRONT, 0.068, SHIN, 0.024, WHITE_P);
    glow(limbPanel(kneeJ, kp, ap, 0.45, FRONT, 0.092, rr(0.016, 0.22, 0.005), 0.006, TEAL));
    limbPanel(kneeJ, kp, ap, 0.4, BACK, 0.066, rr(0.08, 0.22, 0.025), 0.02, GRAPH_P);
    limbPanel(kneeJ, kp, ap, 0.5, V(s, 0, 0), 0.068, rr(0.08, 0.2, 0.02), 0.016, WHITE_P);
    if (s > 0) {
      // exposed piston behind the left shin
      b.rod(onLimb(kp, ap, 0.12, BACK, 0.085), onLimb(kp, ap, 0.78, BACK, 0.075), 0.009, { bone: kneeJ, color: SILVER });
      b.rod(onLimb(kp, ap, 0.12, BACK, 0.085), onLimb(kp, ap, 0.42, BACK, 0.08), 0.014, { bone: kneeJ, color: GRAPH_P });
      glow(b.rod(onLimb(kp, ap, 0.2, BACK, 0.098), onLimb(kp, ap, 0.7, BACK, 0.09), 0.004, { bone: kneeJ, color: TEAL }));
    }
    // ankle cuff, boot, sole, toe cap, straps
    cyl(ankleJ, [ap.x, ap.y + 0.015, ap.z], [0, 1, 0], 0.07, 0.074, 0.06, GRAPH_P);
    b.extrude(BOOT, { at: [s * 0.105, 0, 0], x: [0, 0, 1], thickness: 0.116, bevel: 0.016, color: WHITE_P, bone: ankleJ });
    b.extrude(SOLE, { at: [s * 0.105, 0, 0], x: [0, 0, 1], thickness: 0.124, bevel: 0.008, color: GRAPH_P, bone: ankleJ });
    b.extrude(TOECAP, { at: [s * 0.105, 0, 0], x: [0, 0, 1], thickness: 0.124, bevel: 0.01, color: GRAPH_P, bone: toe });
    block(ankleJ, [s * 0.105, 0.172, 0.0], [0.126, 0.026, 0.152], GRAPH_P);
    glow(panel(ankleJ, V(s * 0.105, 0.172, 0.076), FRONT, UP, rr(0.04, 0.03, 0.008), 0.01, TEAL));
    glow(
      panel(
        ankleJ,
        V(s * 0.163, 0.082, 0.03),
        V(s, 0, 0),
        UP,
        fl(
          [
            [-0.09, -0.012],
            [0.15, -0.012],
            [0.17, 0.012],
            [-0.09, 0.012],
          ],
          s,
        ),
        0.006,
        TEAL,
      ),
    );
    for (let i = 0; i < 3; i++) block(ankleJ, [s * 0.1635, 0.125, -0.06 + i * 0.045], [0.004, 0.012, 0.012], SILVER);
  }

  // ---- arms --------------------------------------------------------------------------------------------------
  const SX = -0.47;
  const SZ = 0.27;
  const staffJoint: { j: Joint | null } = { j: null };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = s > 0 ? V(0.27, 1.42, 0) : V(-0.27, 1.42, 0);
    const el = s > 0 ? V(0.4, 1.15, -0.02) : V(-0.4, 1.15, -0.03);
    const wr = s > 0 ? V(0.47, 0.89, 0.05) : V(-0.45, 1.05, 0.22);
    const arm = b.chain(`arm${S}`, [sh, el, wr], {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const wrJ = arm.joints[2];
    const lower: Col = s > 0 ? METAL_P : UNDER_P;
    b.sweep(arm, (t) => interpolate([0, 0.5, 1], [0.066, 0.054, 0.043], t), {
      color: (t: number) => (t < 0.5 ? UNDER_P : lower),
    });

    // pauldron, big and layered
    const PU = V(s * 0.342, 0.94, 0);
    blob(shJ, [s * 0.31, 1.465, 0], [0.098, 0.072, 0.108], WHITE_P, [0, 0, -s * 20], [12, 8]);
    cyl(shJ, [s * 0.318, 1.405, 0], PU, 0.088, 0.096, 0.034, GRAPH_P, 12);
    glow(
      b.part(new THREE.TorusGeometry(0.1, 0.0055, 5, 18), TEAL, {
        bone: shJ,
        at: [s * 0.316, 1.425, 0],
        dir: PU,
        axis: "z",
      }),
    );
    blob(shJ, [s * 0.3, 1.5, 0.0], [0.05, 0.03, 0.07], WHITE_P, [0, 0, -s * 20]);
    glow(panel(shJ, V(s * 0.305, 1.512, 0.09), FRONT, UP, rr(0.05, 0.012, 0.004), 0.004, TEAL));

    // upper arm: plates and elbow
    limbPanel(shJ, sh, el, 0.55, V(s, 0, 0), 0.06, rr(0.085, 0.14, 0.025), 0.02, WHITE_P);
    glow(limbPanel(shJ, sh, el, 0.55, V(s, 0, 0), 0.078, rr(0.014, 0.1, 0.004), 0.005, TEAL));
    limbPanel(shJ, sh, el, 0.2, FRONT, 0.06, rr(0.08, 0.04, 0.01), 0.016, GRAPH_P);
    blob(elJ, el, [0.054, 0.054, 0.054], s > 0 ? METAL_P : GRAPH_P, undefined, [10, 7]);
    blob(elJ, [el.x, el.y + 0.008, el.z - 0.045], [0.05, 0.06, 0.035], WHITE_P);

    const fd = wr.clone().sub(el).normalize();
    if (s > 0) {
      // cybernetic left arm
      glow(
        b.part(new THREE.TorusGeometry(0.058, 0.0055, 5, 14), TEAL, {
          bone: elJ,
          at: el,
          dir: [s, 0, 0],
          axis: "z",
        }),
      );
      limbPanel(elJ, el, wr, 0.42, FRONT, 0.05, FOREARM_PLATE, 0.016, WHITE_P);
      limbPanel(elJ, el, wr, 0.3, V(s, 0, 0), 0.05, FOREARM_PLATE, 0.016, WHITE_P);
      b.rod(onLimb(el, wr, 0.12, V(-s, 0, 0.3), 0.056), onLimb(el, wr, 0.72, V(-s, 0, 0.3), 0.046), 0.008, { bone: elJ, color: SILVER });
      b.rod(onLimb(el, wr, 0.12, V(-s, 0, 0.3), 0.056), onLimb(el, wr, 0.4, V(-s, 0, 0.3), 0.052), 0.013, { bone: elJ, color: GRAPH_P });
      glow(b.rod(onLimb(el, wr, 0.1, BACK, 0.058), onLimb(el, wr, 0.88, BACK, 0.046), 0.0045, { bone: elJ, color: TEAL }));
      // wrist gauntlet with holo display
      const sc = onLimb(el, wr, 0.62, V(s, 0, 0), 0.05);
      const up = el.clone().sub(wr).normalize();
      const nrm = V(s, 0, 0).addScaledVector(up, -up.x * s).normalize();
      panel(wrJ, sc, nrm, up, rr(0.08, 0.1, 0.02), 0.016, GRAPH_P);
      glow(
        b.part(new THREE.PlaneGeometry(0.064, 0.04), "#ffffff", {
          bone: wrJ,
          at: sc.clone().addScaledVector(nrm, 0.0185),
          dir: nrm,
          axis: "z",
          up,
          texture: HOLO,
        }),
        1.1,
      );
      cyl(wrJ, wr, fd, 0.052, 0.056, 0.045, WHITE_P);
      // metal hand
      const inw0 = V(-s, 0, 0);
      const inw = inw0.addScaledVector(fd, -inw0.dot(fd)).normalize();
      const W = fd.clone().cross(inw).normalize();
      if (W.z < 0) W.negate();
      b.sweep([wr.clone().addScaledVector(fd, 0.0), wr.clone().addScaledVector(fd, 0.1)], () => [0.027, 0.046], {
        bone: wrJ,
        color: METAL_P,
        up: [0, 0, 1],
        caps: "round",
      });
      panel(wrJ, wr.clone().addScaledVector(fd, 0.06).addScaledVector(V(s, 0, 0), 0.03), V(s, 0, 0), up, rr(0.07, 0.07, 0.016), 0.012, WHITE_P);
      const K = wr.clone().addScaledVector(fd, 0.105);
      const lens = [1, 1.1, 1.0, 0.8];
      for (let i = 0; i < 4; i++) {
        const L = lens[i];
        const p0 = K.clone().addScaledVector(W, 0.03 - i * 0.02);
        const p1 = p0.clone().addScaledVector(fd, 0.042 * L).addScaledVector(inw, 0.004);
        const p2 = p1.clone().addScaledVector(fd, 0.03 * L).addScaledVector(inw, 0.012);
        const p3 = p2.clone().addScaledVector(fd, 0.022 * L).addScaledVector(inw, 0.018);
        const f = b.chain(`fingerL${i + 1}`, [p0, p1, p2, p3], {
          parent: wrJ,
          names: [`fingerL${i + 1}a`, `fingerL${i + 1}b`, `fingerL${i + 1}c`],
          role: "digit",
        });
        b.sweep(f, [0.0105, 0.0075], { color: METAL_P });
        glow(blob(f.joints[2], p3, [0.0075, 0.0075, 0.0075], TEAL, undefined, [6, 4]), 1.3);
      }
      const t0 = wr.clone().addScaledVector(fd, 0.04).addScaledVector(W, 0.045).addScaledVector(inw, 0.01);
      const t1 = t0.clone().addScaledVector(fd, 0.03).addScaledVector(W, 0.02).addScaledVector(inw, 0.012);
      const t2 = t1.clone().addScaledVector(fd, 0.03).addScaledVector(W, 0.01).addScaledVector(inw, 0.018);
      const th = b.chain("thumbL", [t0, t1, t2], { parent: wrJ, names: ["thumbL1", "thumbL2"], role: "digit" });
      b.sweep(th, [0.0125, 0.009], { color: METAL_P });
      glow(blob(th.joints[1], t2, [0.008, 0.008, 0.008], TEAL, undefined, [6, 4]), 1.3);
    } else {
      // organic right arm: sleeve, bracers and a gloved fist on the staff
      limbPanel(elJ, el, wr, 0.42, FRONT, 0.05, FOREARM_PLATE, 0.016, WHITE_P);
      limbPanel(elJ, el, wr, 0.4, V(s, 0, 0), 0.05, FOREARM_PLATE, 0.016, WHITE_P);
      glow(limbPanel(elJ, el, wr, 0.4, V(s, 0, 0), 0.068, rr(0.012, 0.1, 0.004), 0.005, TEAL));
      limbPanel(elJ, el, wr, 0.82, FRONT, 0.046, rr(0.1, 0.03, 0.008), 0.014, GRAPH_P);
      cyl(wrJ, wr, fd, 0.05, 0.054, 0.045, WHITE_P);
      glow(
        b.part(new THREE.TorusGeometry(0.0525, 0.004, 5, 12), TEAL, {
          bone: wrJ,
          at: wr.clone().addScaledVector(fd, 0.024),
          dir: fd,
          axis: "z",
        }),
      );
      blob(wrJ, [-0.465, 1.04, 0.238], [0.05, 0.052, 0.034], GLOVE_P, undefined, [10, 7]);
      panel(wrJ, V(-0.512, 1.04, 0.235), V(-1, 0, 0), UP, rr(0.05, 0.07, 0.015), 0.014, WHITE_P);
      for (let i = 0; i < 4; i++) {
        const y = 1.0 + i * 0.027;
        const R = 0.034;
        const fp = [165, 85, 5, -75].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return V(SX - R * Math.sin(r), y, SZ + R * Math.cos(r));
        });
        const f = b.chain(`fingerR${i + 1}`, fp, {
          parent: wrJ,
          names: [`fingerR${i + 1}a`, `fingerR${i + 1}b`, `fingerR${i + 1}c`],
          role: "digit",
        });
        b.sweep(f, [0.0115, 0.0088], { color: GLOVE_P });
        block(f.joints[1], [SX - R * Math.sin(0.1) - 0.0, y, SZ + R + 0.009], [0.012, 0.016, 0.006], WHITE_P);
      }
      const th = b.chain("thumbR", [V(-0.425, 1.07, 0.235), V(-0.44, 1.09, 0.288), V(-0.47, 1.085, 0.312)], {
        parent: wrJ,
        names: ["thumbR1", "thumbR2"],
        role: "digit",
      });
      b.sweep(th, [0.0135, 0.0105], { color: GLOVE_P });
      staffJoint.j = b.joint("staff", { parent: wrJ, at: [SX, 1.03, SZ], aim: [SX, 1.5, SZ] });
    }
  }

  // ---- staff -------------------------------------------------------------------------------------------------
  const staff = staffJoint.j;
  if (!staff) throw new Error("cyborgMedic: staff joint missing");
  const at3 = (y: number, dx = 0, dz = 0) => [SX + dx, y, SZ + dz];
  b.rod(at3(0), at3(0.075), [0.011, 0.02], { bone: staff, color: GRAPH_P, caps: "flat" });
  b.rod(at3(0.07), at3(1.53), 0.017, { bone: staff, color: WHITE_P, caps: "flat" });
  b.rod(at3(0.88), at3(1.2), 0.021, { bone: staff, color: GRAPH_P, caps: "flat" });
  for (const y of [0.3, 1.3]) cyl(staff, at3(y), [0, 1, 0], 0.027, 0.027, 0.05, GRAPH_P);
  for (const y of [0.16, 0.36, 0.68, 0.84, 1.24, 1.4])
    glow(cyl(staff, at3(y), [0, 1, 0], 0.0235, 0.0235, 0.012, TEAL, 12), 1.1);
  for (const y of [0.55, 1.02]) cyl(staff, at3(y), [0, 1, 0], 0.021, 0.021, 0.012, SILVER, 12);
  glow(panel(staff, V(SX, 0.5, SZ + 0.016), FRONT, UP, rr(0.008, 0.2, 0.003), 0.004, TEAL), 1.2);
  // head: collar, cage, crystal
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.046, 0.03],
      [0.052, 0.08],
      [0.034, 0.112],
      [0, 0.112],
    ],
    { at: at3(1.5), axis: [0, 1, 0], segments: 10, color: WHITE_P, bone: staff },
  );
  glow(cyl(staff, at3(1.55), [0, 1, 0], 0.053, 0.053, 0.01, TEAL, 10), 1.2);
  b.spike(at3(1.605), [0, 1, 0], 0.06, 0.02, { color: GRAPH_P, bone: staff });
  for (let k = 0; k < 4; k++) {
    const phi = ((45 + 90 * k) * Math.PI) / 180;
    const pp = [
      [0.04, 1.6],
      [0.095, 1.69],
      [0.088, 1.78],
      [0.03, 1.855],
    ].map(([r, y]) => V(SX + r * Math.cos(phi), y, SZ + r * Math.sin(phi)));
    b.sweep(catmull(pp), [0.012, 0.009, 0.005], { bone: staff, color: WHITE_P, caps: { start: "flat", end: "round" } });
  }
  glow(
    b.part(new THREE.IcosahedronGeometry(0.058, 0), TEAL, {
      bone: staff,
      at: at3(1.725),
      scale: [0.9, 1.35, 0.9],
      flat: true,
    }),
    1.7,
  );
  glow(
    b.part(new THREE.TorusGeometry(0.122, 0.0045, 5, 22), TEAL_PALE, { bone: staff, at: at3(1.725), dir: [0, 1, 0], axis: "z" }),
    1.4,
  );
  glow(
    b.part(new THREE.TorusGeometry(0.105, 0.0035, 5, 20), TEAL, {
      bone: staff,
      at: at3(1.725),
      dir: [0.5, 0.86, 0.1],
      axis: "z",
    }),
    1.2,
  );
  // wings
  for (const s of [1, -1]) {
    const wing: OutlinePoint[] = [
      [s * 0.035, 0.0],
      [s * 0.14, 0.045],
      [s * 0.172, 0.155],
      [s * 0.115, 0.108],
      [s * 0.045, 0.078],
    ];
    b.extrude(wing, { at: [SX, 1.52, SZ], x: [1, 0, 0], thickness: 0.014, bevel: 0.004, color: WHITE_P, bone: staff });
    glow(
      b.extrude(
        [
          [s * 0.05, 0.026],
          [s * 0.12, 0.052],
          [s * 0.14, 0.09],
          [s * 0.09, 0.066],
        ] as OutlinePoint[],
        { at: [SX, 1.52, SZ + 0.006], x: [1, 0, 0], thickness: 0.006, bevel: 0.0015, color: TEAL, bone: staff },
      ),
    );
    glow(blob(staff, [SX + s * 0.17, 1.675, SZ], [0.01, 0.01, 0.01], TEAL, undefined, [6, 4]), 1.5);
  }
  // pennant ribbon
  panel(
    staff,
    V(SX, 1.5, SZ + 0.046),
    FRONT,
    UP,
    [
      [-0.02, 0],
      [0.02, 0],
      [0.026, -0.12],
      [0, -0.16],
      [-0.026, -0.12],
    ],
    0.006,
    TEAL_DK,
  );

  return b.root;
}
