import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { mix, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SKIN_LIGHT = "#a79f92";
const SKIN_MID = "#8a8276";
const SKIN_DARK = "#585149";
const DUST = "#a97b5c";
const MUD = "#66503f";
const PINK = "#b08f86";
const PINK_TIP = "#c3a095";
const IVORY = "#efe5ca";
const IVORY_TIP = "#bda877";
const NAIL = "#ddd1bb";
const HAIR = "#2a211b";
const MOUTH = "#33231f";
const LIP = "#9a7f76";
const EYE_DARK = "#1a120d";

export const meta = {
  name: "African Bush Elephant",
  description:
    "A low-poly adult African bush elephant: dust-caked wrinkled hide, huge fan ears with painted veins, curved ivory tusks, a ringed trunk, sparse bristles and a tufted tail, fully rigged in a neutral standing pose.",
};

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Wrinkled grey hide, dust-red toward the ground, dust on the back; `ring` adds trunk-style rings along s[0]. */
function skinPaint(seed: number, wr: number, dustH: number, ring = 0) {
  return paint((p, n, s) => {
    const big = noise(p, 0.7, seed);
    const fine = noise(p, 0.1, seed + 4);
    let c = mix(SKIN_MID, SKIN_LIGHT, smoothstep(0.3, 0.75, big) * 0.85);
    c = mix(c, SKIN_DARK, smoothstep(0.55, 0.85, fine) * 0.35);
    // criss-cross wrinkles
    const w1 = Math.abs(Math.sin(p.y * wr + noise(p, 0.45, seed + 21) * 5));
    const w2 = Math.abs(Math.sin((p.z * 0.8 + p.x * 0.6) * wr * 0.8 + noise(p, 0.5, seed + 22) * 5 + 1.3));
    let crease = 1 - smoothstep(0.05, 0.16, Math.min(w1, w2));
    if (ring > 0) {
      const rr = Math.abs(Math.sin(s[0] * ring * Math.PI + noise(p, 0.3, seed + 3) * 0.8));
      crease = Math.max(crease * 0.5, 1 - smoothstep(0.06, 0.3, rr));
    }
    c = mix(c, SKIN_DARK, crease * 0.6);
    if (ring > 0) {
      const a = Math.abs((((s[1] % 360) + 360) % 360) - 180);
      c = mix(c, PINK, smoothstep(70, 20, a) * 0.3);
      c = mix(c, PINK_TIP, smoothstep(0.9, 0.98, s[0]) * 0.7);
    }
    // red dust and mud near the ground
    const mud = smoothstep(dustH, dustH * 0.25, p.y) * (0.5 + 0.5 * noise(p, 0.3, seed + 8));
    c = mix(c, DUST, Math.min(1, mud * 0.85));
    c = mix(c, MUD, smoothstep(0.35, 0.05, p.y) * 0.85);
    // dust thrown over the back
    c = mix(c, DUST, smoothstep(0.55, 0.95, n.y) * smoothstep(0.55, 0.8, noise(p, 0.4, seed + 12)) * 0.5);
    const sh = 0.78 + 0.22 * smoothstep(-0.9, 0.2, n.y);
    return [c[0] * sh, c[1] * sh, c[2] * sh];
  });
}

const BODY = skinPaint(3, 11, 1.5);
const LEGS = skinPaint(7, 14, 1.2);
const HEAD = skinPaint(11, 12, 1.0);
const TRUNK = skinPaint(5, 10, 1.0, 17);

/** Ear: pinkish depigmented mottles with radiating veins; s = outline coordinates in meters. */
const EAR_SKIN = paint((p, n, s) => {
  const u = s[0] + 0.05;
  const v = s[1] - 0.15;
  const ang = Math.atan2(v, u);
  const r = Math.hypot(u, v);
  const vein = Math.abs(Math.sin(ang * 15 + noise(p, 0.3, 31) * 2.2));
  const line = (1 - smoothstep(0.05, 0.2, vein)) * smoothstep(0.15, 0.4, r);
  let c = mix(SKIN_MID, SKIN_LIGHT, noise(p, 0.5, 30) * 0.8);
  c = mix(c, PINK, smoothstep(0.55, 0.8, noise(p, 0.28, 33)) * smoothstep(0.3, 0.9, r) * 0.7);
  c = mix(c, SKIN_DARK, line * 0.55);
  c = mix(c, SKIN_DARK, smoothstep(0.35, 0.5, s[1]) * 0.5);
  c = mix(c, DUST, smoothstep(-0.2, -1.2, s[1]) * 0.35 * noise(p, 0.3, 36));
  const sh = 0.82 + 0.18 * smoothstep(-0.9, 0.5, n.y);
  return [c[0] * sh, c[1] * sh, c[2] * sh];
});

const TUSK_PAINT = paint((p, n, s) => {
  let c = mix(IVORY, IVORY_TIP, smoothstep(0.55, 1, s[0]) * 0.85);
  c = mix(c, "#9b8a63", smoothstep(0.5, 0.8, noise(p, 0.12, 41)) * 0.35);
  c = mix(c, "#7c6a49", smoothstep(0.0, 0.15, 0.15 - s[0]) * 0.5);
  const sh = 0.82 + 0.18 * smoothstep(-0.8, 0.5, n.y);
  return [c[0] * sh, c[1] * sh, c[2] * sh];
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE_TEX = svg(
  `<svg viewBox="0 0 100 100">
    <path d="M10 62 Q50 85 90 60" stroke="#5a4636" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M42 66 Q40 82 44 98 Q52 99 54 96 Q54 82 56 68 Z" fill="#6a5442"/>
    <path d="M6 42 Q20 22 50 20 Q80 22 94 44" stroke="#4a3a2d" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M12 54 Q22 36 50 34 Q78 36 88 54 Q70 70 50 70 Q30 70 12 54 Z" fill="#6b5240"/>
    <path d="M18 54 Q28 40 50 38 Q72 40 82 54 Q68 66 50 66 Q32 66 18 54 Z" fill="#2c1d12"/>
    <circle cx="50" cy="53" r="13" fill="#b4792c"/>
    <circle cx="50" cy="53" r="6.5" fill="${EYE_DARK}"/>
    <circle cx="45" cy="48" r="3.4" fill="#fff6e4"/>
    <path d="M8 34 Q26 12 52 10 Q76 12 92 34" stroke="#403227" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M14 70 Q30 80 50 80" stroke="#4a3a2d" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const CREASE_ARC = svg(
  `<svg viewBox="0 0 100 64">
    <path d="M6 14 Q50 0 94 14" stroke="#4d453d" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M10 28 Q50 14 90 28" stroke="#4d453d" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M14 42 Q50 28 86 42" stroke="#4d453d" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M22 56 Q50 44 78 56" stroke="#4d453d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M30 20 L36 34 M62 22 L58 36 M48 36 L52 50" stroke="#4d453d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const CREASE_BROW = svg(
  `<svg viewBox="0 0 100 60">
    <path d="M4 40 Q30 6 50 8 Q70 6 96 40" stroke="#4d453d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M14 46 Q34 18 50 20 Q66 18 86 46" stroke="#4d453d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M26 52 Q40 32 50 33 Q60 32 74 52" stroke="#4d453d" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50 8 L50 30" stroke="#4d453d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const BRISTLE = svg(
  `<svg viewBox="0 0 40 64">
    <path d="M10 64 C9 44 12 22 8 2 C16 20 15 44 16 64 Z" fill="${HAIR}"/>
    <path d="M18 64 C18 46 22 28 24 6 C28 26 25 46 24 64 Z" fill="#3a2d24"/>
    <path d="M26 64 C28 48 31 36 36 18 C35 40 33 52 32 64 Z" fill="${HAIR}"/>
  </svg>`,
  { size: 128 },
);

const TUFT = svg(
  `<svg viewBox="0 0 48 96">
    <path d="M24 96 C14 70 16 40 10 4 C26 32 28 66 30 96 Z" fill="${HAIR}"/>
    <path d="M12 96 C6 78 6 56 2 40 C14 56 20 76 20 96 Z" fill="#33281f"/>
    <path d="M30 96 C34 74 40 56 46 38 C46 62 42 80 38 96 Z" fill="#33281f"/>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
// Build

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });
  const rand = rng(11);

  // ---- Skeleton: spine, neck, head, jaw ------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 2.35, -1.3], dir: [0, 0, 1], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.35, -1.3],
      [0, 2.4, -0.4],
      [0, 2.38, 0.5],
      [0, 2.35, 1.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine", group: "body" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.35, 1.3],
      [0, 2.5, 1.75],
      [0, 2.65, 2.05],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck", group: "head" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.65, 2.05], dir: [0, -0.05, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.22, 2.2], dir: [0, -0.15, 1], role: "jaw", group: "head" });

  // ---- Body ----------------------------------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 2.35, -1.85], w: 0.9, h: 1.1 },
      { at: [0, 2.4, -1.35], w: 1.55, h: 1.75 },
      { at: [0, 2.38, -0.5], w: 1.8, h: 1.95 },
      { at: [0, 2.34, 0.4], w: 1.8, h: 2.0 },
      { at: [0, 2.36, 1.2], w: 1.7, h: 2.0 },
      { at: [0, 2.5, 1.8], w: 1.3, h: 1.7 },
      { at: [0, 2.65, 2.05], w: 1.0, h: 1.3 },
    ],
    { bone: [spine, neck], color: BODY, sides: 10, smooth: false, group: "body", name: "torso" },
  );
  // haunch and shoulder bulges
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
      at: [s * 0.78, 2.15, -1.2],
      scale: [0.42, 0.75, 0.7],
      bone: spine.joints[0],
      flat: true,
      group: "body",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
      at: [s * 0.74, 2.2, 1.2],
      scale: [0.4, 0.78, 0.62],
      bone: spine.joints[2],
      flat: true,
      group: "body",
    });
  }

  // ---- Head ----------------------------------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: [0, 2.72, 1.78], w: 0.9, h: 1.0 },
      { at: [0, 2.8, 2.2], w: 1.0, h: 1.1 },
      { at: [0, 2.65, 2.55], w: 0.95, h: 0.95 },
      { at: [0, 2.4, 2.82], w: 0.62, h: 0.66 },
    ],
    { bone: head, color: HEAD, sides: 10, smooth: false, group: "head", name: "skull" },
  );
  // two forehead domes and cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
      at: [s * 0.22, 3.18, 2.3],
      scale: [0.3, 0.25, 0.32],
      bone: head,
      flat: true,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
      at: [s * 0.4, 2.42, 2.45],
      scale: [0.22, 0.3, 0.3],
      bone: head,
      flat: true,
      group: "head",
    });
  }
  const skullSurface = b.surface(skull);
  const HC = V(0, 2.7, 2.3);
  for (const s of [1, -1]) {
    const hit = skullSurface.around(HC).at(s * 78, 0);
    if (hit) {
      b.decal(skullSurface, EYE_TEX, { at: hit, size: [0.26, 0.26], mirror: s < 0, up: [0, 1, 0] });
      // heavy brow ridge above the eye
      b.part(new THREE.SphereGeometry(1, 6, 4), HEAD, {
        at: offset(hit.at, [s * 0.5, 0.9, 0.15], 0.1),
        scale: [0.09, 0.05, 0.12],
        dir: [s * 0.4, 0.1, 1],
        bone: head,
        flat: true,
        group: "head",
      });
    }
  }
  b.decal(skullSurface, CREASE_BROW, { at: V(0, 3.3, 2.28), dir: [0, 0.75, 0.55], size: [0.7, 0.42], up: [0, 0, 1] });

  // mouth: lower lip / chin on the jaw bone, dark inside
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, {
    at: [0, 2.22, 2.55],
    scale: [0.26, 0.1, 0.28],
    bone: head,
    flat: true,
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), LIP, {
    at: [0, 2.05, 2.52],
    scale: [0.3, 0.17, 0.32],
    bone: jaw,
    flat: true,
    group: "head",
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
    at: [0, 1.95, 2.35],
    scale: [0.26, 0.16, 0.3],
    bone: jaw,
    flat: true,
    group: "head",
  });

  // ---- Ears ----------------------------------------------------------------------------------------------------
  const EAR: OutlinePoint[] = [
    [0, 0.45],
    [0.4, 0.55],
    [0.85, 0.45],
    [1.2, 0.15],
    [1.3, -0.3],
    [1.15, -0.8],
    [0.85, -1.25, "sharp"],
    [0.6, -0.95],
    [0.3, -0.6],
    [0, -0.3],
  ];
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const root = V(s * 0.38, 2.95, 1.95);
    const dir = V(s * 0.8, 0, -0.6).normalize();
    const earJoint = b.joint(`ear${tag}`, { parent: head, at: root, dir: [s * 0.8, 0.1, -0.6], role: "hinge", group: "ears" });
    b.extrude(EAR, {
      at: root,
      x: dir,
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.012,
      smoothing: 1,
      color: EAR_SKIN,
      bone: earJoint,
      group: "ears",
      name: `ear${tag}`,
    });
    // thick cartilage root
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
      at: [s * 0.4, 2.9, 1.98],
      scale: [0.14, 0.3, 0.2],
      bone: head,
      flat: true,
      group: "ears",
    });
  }

  // ---- Trunk ---------------------------------------------------------------------------------------------------
  const trunkPath = catmull([
    [0, 2.5, 2.6],
    [0, 2.0, 3.0],
    [0, 1.4, 3.2],
    [0, 0.85, 3.25],
    [0, 0.5, 3.35],
    [0, 0.4, 3.7],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunkTip"],
    role: "tentacle",
    group: "trunk",
  });
  const TR = [0.4, 0.34, 0.27, 0.21, 0.16, 0.12, 0.085];
  const trunkR = (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (TR.length - 1);
    const i = Math.min(Math.floor(x), TR.length - 2);
    return TR[i] + (TR[i + 1] - TR[i]) * (x - i);
  };
  b.sweep(trunk, TR, { color: TRUNK, sides: 10, smooth: false, group: "trunk", name: "trunk" });
  b.along(trunk, 18, (at) =>
    b.part(new THREE.TorusGeometry(trunkR(at.t) * 0.97, 0.022, 4, 10), TRUNK, {
      at: at.at,
      dir: at.axis,
      axis: "z",
      bone: at.bone,
      flat: true,
      group: "trunk",
    }),
  );
  // finger-like lips and nostrils at the tip
  const tp = trunk.at(1);
  b.spike(offset(tp.at, [0, 1, 0], 0.05), tp.tangent, 0.2, 0.055, { color: PINK_TIP, bone: trunk.tip ?? undefined, sides: 6, group: "trunk" });
  b.spike(offset(tp.at, [0, -1, 0], 0.05), tp.tangent, 0.1, 0.04, { color: PINK, bone: trunk.tip ?? undefined, sides: 6, group: "trunk" });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 6, 4), EYE_DARK, {
      at: offset(offset(tp.at, tp.tangent, 0.07), [s, 0, 0], 0.035),
      scale: [0.022, 0.03, 0.02],
      dir: tp.tangent,
      bone: trunk.tip ?? undefined,
      flat: true,
      group: "trunk",
    });

  // ---- Tusks ---------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const path = bezier(V(s * 0.5, 2.22, 2.45), V(s * 0.7, 1.6, 2.8), V(s * 0.72, 1.35, 3.6), V(s * 0.5, 1.8, 4.2));
    b.sweep(path, [0.095, 0.014], {
      color: TUSK_PAINT,
      bone: head,
      caps: { start: "flat", end: "point" },
      sides: 8,
      group: "head",
      name: `tusk${tag}`,
    });
    // lip collar around the tusk root
    const root = path.at(0.1);
    b.part(new THREE.TorusGeometry(0.11, 0.035, 5, 8), LIP, {
      at: root,
      dir: path.tangentAt(0.1),
      axis: "z",
      bone: head,
      flat: true,
      group: "head",
    });
  }

  // ---- Legs ----------------------------------------------------------------------------------------------------
  const footPad = new THREE.CylinderGeometry(0.31, 0.35, 0.26, 10);
  const legs: { tag: string; s: number; front: boolean }[] = [
    { tag: "FL", s: 1, front: true },
    { tag: "FR", s: -1, front: true },
    { tag: "HL", s: 1, front: false },
    { tag: "HR", s: -1, front: false },
  ];
  for (const { tag, s, front } of legs) {
    const x = s * (front ? 0.62 : 0.66);
    const z = front ? 1.15 : -1.2;
    const pts = limb(V(x, 2.0, z), V(x, 0.3, z), front ? [0.86, 0.85] : [0.88, 0.84], [V(0, 0, 1)]);
    const chain = b.chain(`leg${tag}`, pts, {
      parent: front ? spine.joints[2] : spine.joints[0],
      names: [`hip${tag}`, `knee${tag}`, `foot${tag}`],
      role: "leg",
      contact: [x, 0, z],
      group: "legs",
    });
    const tube = b.sweep(chain, [0.42, 0.35, 0.3, 0.27, 0.28], { color: LEGS, sides: 10, smooth: false, group: "legs", name: `leg${tag}` });
    const foot = chain.tip!;
    b.part(footPad, LEGS, { at: [x, 0.13, z], bone: foot, flat: true, group: "legs", name: `foot${tag}` });
    // loose skin fold at the ankle
    b.part(new THREE.TorusGeometry(0.29, 0.045, 5, 10), LEGS, {
      at: [x, 0.33, z],
      dir: [0, 1, 0],
      axis: "z",
      bone: foot,
      flat: true,
      group: "legs",
    });
    // toenails
    const n = front ? 4 : 3;
    const span = front ? 52 : 36;
    b.ring(frame([x, 0.1, z], [0, 1, 0]), { count: n, radius: 0.33, fromDeg: -span, toDeg: span }, (item) =>
      b.stick(new THREE.SphereGeometry(1, 6, 4), NAIL, item, { scale: [0.07, 0.05, 0.055], embed: 0.3, bone: foot, flat: true, group: "legs" }),
    );
    // knee creases
    const knee = pts[1];
    b.decal(tube, CREASE_ARC, {
      at: V(x, knee.y, knee.z + 0.3),
      dir: [0, 0, 1],
      size: [0.4, 0.26],
      up: [0, 1, 0],
    });
  }

  // ---- Tail ----------------------------------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.5, -1.75],
      [0, 2.3, -2.05],
      [0, 1.7, -2.2],
      [0, 1.15, -2.2],
      [0, 0.75, -2.17],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2", "tail3", "tail4"], role: "tail", group: "tail" },
  );
  b.sweep(tail, [0.1, 0.075, 0.06, 0.05, 0.045], { color: BODY, sides: 8, smooth: false, group: "tail", name: "tail" });
  const tt = tail.at(1);
  b.ring(tt, { count: 10, radius: 0.025, tilt: 70 }, (item) => b.spike(item, item, 0.26, 0.022, { color: HAIR, sides: 5, group: "tail" }));
  b.spike(tt.at, tt.tangent, 0.3, 0.025, { color: HAIR, sides: 5, bone: tail.joints[3], group: "tail" });
  b.cards(
    b.ring(tt, { count: 7, radius: 0.03, tilt: 50 }).items,
    TUFT,
    { size: [0.1, 0.3], lean: 25, bend: 20, vary: 0.25, rng: rng(5), group: "tail" },
  );

  // ---- Bristles ------------------------------------------------------------------------------------------------
  const bodySurface = b.surface(b.root);
  const topHits = bodySurface.scatter(110, { rng: rand, minDist: 0.3, filter: (h) => h.n.y > 0.7 && h.at.z > -1.5 });
  b.cards(topHits, BRISTLE, { size: [0.05, 0.12], lean: 35, bend: 20, vary: 0.3, rng: rng(4), group: "body" });
  const headHits = skullSurface.scatter(40, { rng: rng(8), minDist: 0.14, filter: (h) => h.n.y > 0.2 });
  b.cards(headHits, BRISTLE, { size: [0.045, 0.11], lean: 30, bend: 20, vary: 0.3, rng: rng(9), group: "head" });

  return b.root;
}
