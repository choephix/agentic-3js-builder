import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import type { Part } from "../src/parts";
import type { Hit, Surface } from "../src/surface";
import type { Sweep } from "../src/sweep";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Gray Wolf, Alert",
  description:
    "A heavy-shouldered timber wolf standing alert, head high, ears pricked, hackles raised, hand-painted in a Warcraft-style chunky silhouette with a scarred brow and a notched ear.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (hand-painted: dark steel saddle, warm-grey flanks, cream bib, tan legs)

const DARK: Rgb = [0.21, 0.23, 0.28];
const MID: Rgb = [0.55, 0.56, 0.6];
const HI: Rgb = [0.84, 0.85, 0.86];
const WARM: Rgb = [0.62, 0.52, 0.38];
const CREAM: Rgb = [0.96, 0.91, 0.78];
const TAN: Rgb = [0.74, 0.62, 0.44];

const NOSE = "#17151a";
const CLAW = "#e4dabb";
const TOOTH = "#f3eed9";
const LIP = "#26191d";
const WHISKER = "#ece6d4";
const SHINE = "#c9dcea";

// ---------------------------------------------------------------------------------------------------------------
// Helpers

/** Smooth radius profile through keys `ts` (increasing) with half-widths rx and half-heights ry. */
function prof(ts: number[], rx: number[], ry: number[]) {
  return (t: number): [number, number] => {
    if (t <= ts[0]) return [rx[0], ry[0]];
    for (let i = 1; i < ts.length; i++) {
      if (t <= ts[i]) {
        const k = smoothstep(ts[i - 1], ts[i], t);
        return [rx[i - 1] + (rx[i] - rx[i - 1]) * k, ry[i - 1] + (ry[i] - ry[i - 1]) * k];
      }
    }
    return [rx[rx.length - 1], ry[ry.length - 1]];
  };
}

const scratch = new THREE.Vector3();

// Coat: dark saddle fading to warm grey flanks, tan lower legs, cream belly and bib, hair streaks, painted rim light.
const coat = paint((p, n) => {
  const f1 = noise(p, 0.2, 5);
  const st = noise(scratch.set(p.x * 3.4, p.y * 3.4, p.z * 0.6), 0.05, 4);
  const up = n.y + (f1 - 0.5) * 0.9;
  const saddle = smoothstep(0.25, 0.9, up) * smoothstep(0.5, 0.78, p.y);
  let c = mix(MID, DARK, saddle);
  c = mix(c, HI, smoothstep(0.8, 1.0, n.y) * 0.35 * smoothstep(0.3, 0.9, p.y));
  c = mix(c, WARM, smoothstep(0.6, 0.2, p.y) * 0.8);
  // forelegs carry a dark front line
  if (p.z > 0.05 && p.y < 0.6) c = mix(c, DARK, smoothstep(0.75, 0.95, n.z) * smoothstep(0.58, 0.4, p.y) * 0.6);
  // paws: pale
  c = mix(c, TAN, smoothstep(0.1, 0.03, p.y) * 0.7);
  // belly and bib
  const bib = smoothstep(0.1, 0.5, n.z) * smoothstep(0.2, 0.34, p.z) * smoothstep(1.02, 0.86, p.y) * smoothstep(0.16, 0.08, Math.abs(p.x));
  const belly = Math.max(smoothstep(-0.1, -0.7, n.y) * smoothstep(0.1, 0.55, p.y), bib);
  c = mix(c, CREAM, belly);
  // painted ground shadow
  const shade = 0.78 + 0.22 * smoothstep(0.0, 0.3, p.y);
  const k = (0.86 + st * 0.28) * shade;
  return [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)] as Rgb;
});

// Head: cream cheeks and lips, dark nose bridge and brow, whisker dots.
const HEAD_C = [0, 1.12, 0.72];
const face = paint((p, n) => {
  const u = p.z - HEAD_C[2];
  const v = p.y - HEAD_C[1];
  const w = Math.abs(p.x);
  let c = coat.at(p, n);
  const muzzle = smoothstep(0.02, 0.14, u);
  c = mix(c, [0.66, 0.6, 0.5], muzzle * 0.55);
  const cream = Math.max(
    smoothstep(-0.015, -0.06, v) * smoothstep(0.0, 0.1, u),
    smoothstep(0.1, 0.135, w) * smoothstep(0.06, -0.01, v) * smoothstep(-0.12, 0.0, u),
  );
  c = mix(c, CREAM, cream);
  const bridge = smoothstep(0.045, 0.012, w) * smoothstep(0.1, 0.2, u) * smoothstep(0.2, 0.7, n.y);
  c = mix(c, DARK, bridge * 0.45);
  const brow = smoothstep(0.065, 0.085, v) * smoothstep(0.0, 0.06, u) * smoothstep(0.24, 0.16, u) * smoothstep(0.03, 0.06, w);
  c = mix(c, DARK, brow * 0.55);
  if (u > 0.21 && u < 0.38 && w > 0.025 && w < 0.085 && v > -0.04 && v < 0.035) {
    const cl = cells(p, 0.022, 3);
    if (cl.d1 < 0.0042) c = mix(c, DARK, 0.9);
  }
  return c;
});

const tailPaint = paint((p, n, s) => {
  const c = coat.at(p, n);
  const dark = mix(c, DARK, smoothstep(0.78, 0.95, s[0]));
  return mix(dark, [0.12, 0.12, 0.15], smoothstep(0.55, 0.9, n.y) * 0.55 * smoothstep(0.05, 0.3, s[0]));
});

const maneDark = paint((p, n) => mix(coat.at(p, n), DARK, 0.55));

// Cards tint: the coat, a touch brighter, so the hair reads lighter than the skin under it.
const furCoat = paint((p, n) => {
  const c = coat.at(p, n);
  const lift = 1.2 + 0.4 * smoothstep(0.6, 0.85, (c[0] + c[1] + c[2]) / 3);
  return [Math.min(c[0] * lift, 1), Math.min(c[1] * lift, 1), Math.min(c[2] * lift, 1)] as Rgb;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8e8e8e"/><stop offset="0.5" stop-color="#cfcfcf"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
<path d="M2 64 C4 46 4 28 6 10 C9 26 12 36 13 44 C13 28 14 14 16 0 C18 14 19 28 19 44 C20 36 23 26 26 12 C28 28 28 46 30 64 Z" fill="url(#g)"/>
<path d="M16 62 C16 50 16 38 16 22" stroke="#a4a4a4" stroke-width="2.6" fill="none"/>
<path d="M9 62 C9 52 8 44 8 34" stroke="#b0b0b0" stroke-width="2" fill="none"/>
<path d="M23 62 C23 52 24 44 24 34" stroke="#b0b0b0" stroke-width="2" fill="none"/>
</svg>`,
  { size: 128 },
);

const BLADE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 80">
<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#868686"/><stop offset="0.5" stop-color="#c6c6c6"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
<path d="M1 80 C3 52 8 24 15 0 C19 26 23 54 23 80 Z" fill="url(#g)"/>
<path d="M12 78 C13 58 14 38 15 14" stroke="#a0a0a0" stroke-width="2.4" fill="none"/>
</svg>`,
  { size: 160 },
);

const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
<defs>
<clipPath id="c"><path d="M3 31 C14 12 40 3 61 9 C50 31 24 39 3 31 Z"/></clipPath>
<radialGradient id="i" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#ffe27a"/><stop offset="0.55" stop-color="#f0a21c"/><stop offset="1" stop-color="#a84f0c"/></radialGradient>
</defs>
<path d="M2 32 C13 11 40 2 62 8 C51 32 24 40 2 32 Z" fill="#150c06"/>
<g clip-path="url(#c)">
<rect x="0" y="0" width="64" height="40" fill="#f0a21c"/>
<ellipse cx="33" cy="21" rx="16" ry="14" fill="url(#i)"/>
<path d="M0 0 H64 V12 C48 10 22 12 0 20 Z" fill="#3a1c08" opacity="0.65"/>
<ellipse cx="34" cy="21" rx="5.2" ry="9.5" fill="#0d0705"/>
</g>
<circle cx="27" cy="14.5" r="3.4" fill="#ffffff"/>
<circle cx="40" cy="27" r="1.7" fill="#fff6d6"/>
<path d="M3 31 C14 12 40 3 61 9" stroke="#0c0604" stroke-width="3.2" fill="none"/>
</svg>`,
  { size: 256 },
);

const SCAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<path d="M30 2 C24 24 16 50 8 78" stroke="#e9b8a6" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M30 2 C24 24 16 50 8 78" stroke="#a85a52" stroke-width="2" fill="none"/>
<g stroke="#e9b8a6" stroke-width="3" stroke-linecap="round">
<path d="M22 14 L32 10"/><path d="M20 26 L31 22"/><path d="M18 38 L28 36"/><path d="M15 50 L25 49"/><path d="M12 62 L22 63"/>
</g>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "grayWolf", paintSize: 2048 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: hips (root), spine, neck, head + jaw + ears, tail, four legs

  const hips = b.joint("hips", { at: [0, 0.74, -0.48], role: "spine" });

  const S = [
    [0, 0.74, -0.48],
    [0, 0.75, -0.19],
    [0, 0.76, 0.07],
    [0, 0.78, 0.3],
  ];
  const N = [
    [0, 0.93, 0.47],
    [0, 1.12, 0.62],
  ];
  const body = catmull([...S, ...N]);
  const tChest = body.closestT(S[3]);
  const spine = b.chain("spine", body.slice(0, tChest), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", body.slice(tChest, 1), { parent: spine.tip ?? spine.joints[2], names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, up: -0.06 }),
    aim: head.local({ forward: 0.36, up: -0.09 }),
    role: "jaw",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Torso and neck: one skinned tube

  const tAtZ = (z: number) => {
    let t = 0;
    while (t < 1 && body.at(t).z < z) t += 0.002;
    return t;
  };
  const bz = [-0.48, -0.3, -0.13, 0.06, 0.28, 0.38, 0.47, 0.62].map(tAtZ);
  const torso = b.sweep(
    body,
    prof(bz, [0.2, 0.2, 0.16, 0.195, 0.225, 0.185, 0.16, 0.135], [0.2, 0.2, 0.175, 0.225, 0.255, 0.2, 0.175, 0.14]),
    { bone: [spine, neck], color: coat, shift: [0, -0.025], sides: 10, name: "torso" },
  );

  const bodySkin = b.surface(torso);
  const masses: Part[] = [];
  for (const s of [1, -1]) {
    masses.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
        bone: spine.joints[2],
        at: [s * 0.155, 0.82, 0.22],
        scale: [0.105, 0.17, 0.175],
        name: s > 0 ? "shoulderMassL" : "shoulderMassR",
      }),
    );
  }
  masses.push(
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: spine.joints[2],
      at: [0, 0.6, 0.31],
      scale: [0.19, 0.19, 0.17],
      name: "chestKeel",
    }),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Tail

  const tailPts = [
    [0, 0.76, -0.6],
    [0, 0.72, -0.82],
    [0, 0.6, -1.02],
    [0, 0.44, -1.13],
    [0, 0.29, -1.16],
  ];
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" });
  const tailSweep = b.sweep(tail, prof([0, 0.3, 0.6, 0.85, 1], [0.07, 0.11, 0.115, 0.085, 0.03], [0.07, 0.11, 0.115, 0.085, 0.03]), {
    color: tailPaint,
    caps: "point",
    sides: 8,
    name: "tail",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Legs

  const legSkins: Record<string, Sweep> = {};
  const legChains: Record<string, Chain> = {};
  const buildLeg = (
    base: string,
    pts: number[][],
    names: string[],
    parent: Joint,
    rx: number[],
    ry: number[],
  ) => {
    const path = catmull(pts);
    const chain = b.chain(base, path, { parent, names, role: "leg" });
    const ts = pts.map((q) => path.closestT(q));
    legSkins[base] = b.sweep(chain, prof(ts, rx, ry), { color: coat, sides: 8, name: base });
    legChains[base] = chain;
    // four toes with claws, fanned out from the ball of the foot
    const ball = pts[3];
    const pawJoint = chain.joints[3];
    for (let i = 0; i < 4; i++) {
      const ox = (i - 1.5) * 0.031;
      const a = [ball[0] + ox, 0.034, ball[2]];
      const e = [ball[0] + ox * 1.35, 0.028, ball[2] + 0.1];
      b.capsule(a, e, 0.024, { bone: pawJoint, color: coat, sides: 6, name: `${base}Toe${i}` });
      b.spike([e[0], 0.028, e[2] + 0.012], [ox * 0.8, -0.22, 1], 0.052, 0.011, {
        bone: pawJoint,
        color: CLAW,
        sides: 5,
        name: `${base}Claw${i}`,
      });
    }
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    buildLeg(
      `legF${L}`,
      [
        [s * 0.13, 0.74, 0.26],
        [s * 0.15, 0.47, 0.17],
        [s * 0.14, 0.17, 0.25],
        [s * 0.14, 0.05, 0.31],
        [s * 0.14, 0.042, 0.35],
      ],
      [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `pawF${L}`, `toeF${L}`],
      spine.joints[2],
      [0.12, 0.095, 0.066, 0.07, 0.082],
      [0.125, 0.1, 0.07, 0.062, 0.046],
    );
    buildLeg(
      `legH${L}`,
      [
        [s * 0.14, 0.74, -0.48],
        [s * 0.15, 0.46, -0.34],
        [s * 0.14, 0.27, -0.6],
        [s * 0.14, 0.05, -0.56],
        [s * 0.14, 0.042, -0.5],
      ],
      [`hip${L}`, `knee${L}`, `hock${L}`, `pawH${L}`, `toeH${L}`],
      hips,
      [0.105, 0.085, 0.064, 0.058, 0.078],
      [0.115, 0.1, 0.068, 0.056, 0.046],
    );
    // thigh mass rides the hip
    masses.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
        bone: legChains[`legH${L}`].joints[0],
        at: [s * 0.165, 0.6, -0.41],
        rotation: [-25, 0, 0],
        scale: [0.11, 0.2, 0.18],
        name: `thigh${L}`,
      }),
    );
    // dewclaw
    b.spike([s * 0.115, 0.17, 0.27], [-s * 0.1, -0.5, 0.5], 0.04, 0.01, {
      bone: legChains[`legF${L}`].joints[2],
      color: CLAW,
      sides: 5,
      name: `dewclaw${L}`,
    });
    // hock point
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: legChains[`legH${L}`].joints[2],
      at: [s * 0.13, 0.28, -0.65],
      scale: [0.04, 0.05, 0.045],
      name: `hockPoint${L}`,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head

  const H = 1.28; // oversized head, Warcraft-style
  const hp = (fwd: number, up: number, side = 0) => head.local({ forward: fwd * H, up: up * H, left: side * H });

  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), face, {
    bone: head,
    at: hp(0.1, 0.05),
    scale: [0.17 * H, 0.15 * H, 0.165 * H],
    name: "skull",
  });

  // upper jaw / muzzle
  const muzzle = b.sweep(
    [hp(0.17, 0.01), hp(0.3, -0.005), hp(0.38, -0.03)],
    prof([0, 0.6, 1], [0.1 * H, 0.08 * H, 0.066 * H], [0.082 * H, 0.066 * H, 0.056 * H]),
    { bone: head, color: face, sides: 8, name: "muzzle" },
  );
  // brow-to-bridge bulk
  b.capsule(hp(0.14, 0.045), hp(0.3, 0.02), [0.058 * H, 0.04 * H], { bone: head, color: face, sides: 10, name: "bridge" });

  // lower jaw
  b.sweep(
    [hp(0.04, -0.085), hp(0.2, -0.088), hp(0.36, -0.08)],
    prof([0, 0.5, 1], [0.075 * H, 0.062 * H, 0.04 * H], [0.05 * H, 0.04 * H, 0.032 * H]),
    { bone: jaw, color: face, sides: 8, name: "lowerJaw" },
  );

  // nose leather with a painted shine
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: hp(0.41, -0.016), scale: [0.048 * H, 0.034 * H, 0.037 * H], name: "nose" });
  b.part(new THREE.SphereGeometry(1, 6, 4), SHINE, { bone: head, at: hp(0.415, 0.0), scale: [0.018 * H, 0.008 * H, 0.014 * H], name: "noseShine" });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 6, 4), "#050406", { bone: head, at: hp(0.445, -0.012, s * 0.02), scale: [0.012 * H, 0.014 * H, 0.008 * H], name: "nostril" });

  // mouth line: draped on the muzzle so it sits on the surface
  const muzzleSkin = b.surface([muzzle, skull]);
  for (const s of [1, -1]) {
    const rough = catmull([hp(0.385, -0.04, s * 0.03), hp(0.34, -0.052, s * 0.058), hp(0.22, -0.062, s * 0.085), hp(0.12, -0.05, s * 0.118), hp(0.07, -0.025, s * 0.128)]);
    b.sweep(muzzleSkin.drape(rough, { lift: 0.002 }), 0.0065, { color: LIP, sides: 5, name: s > 0 ? "mouthLineL" : "mouthLineR" });
  }

  // teeth: canines, incisors
  for (const s of [1, -1]) {
    b.spike(hp(0.335, -0.058, s * 0.052), [0, -1, 0.15], 0.085, 0.018, { bone: head, color: TOOTH, sides: 6, name: "upperCanine" });
    b.spike(hp(0.345, -0.065, s * 0.037), [0, 1, 0.2], 0.058, 0.014, { bone: jaw, color: TOOTH, sides: 6, name: "lowerCanine" });
    for (let i = 0; i < 3; i++) {
      b.spike(hp(0.382, -0.05, s * (0.008 + i * 0.011) + (i === 2 ? 0.004 : 0)), [0, -1, 0.1], 0.022, 0.007, { bone: head, color: TOOTH, sides: 4, name: "incisorU" });
    }
  }

  // eyes (painted decals, glowing a little so they read from the high camera)
  for (const s of [1, -1]) {
    glow(
      b.decal(skull, EYE, {
        at: hp(0.2, 0.082, s * 0.098),
        dir: [s * 0.55, 0.12, 0.8],
        size: [0.098 * H, 0.063 * H],
        lift: 0.002,
        mirror: s < 0,
        bone: head,
        name: s > 0 ? "eyeL" : "eyeR",
      }),
      0.45,
    );
    // brow fur: dark tufts over the eye, swept back and up for an intent look
    const brow = [0, 1, 2, 3].map((i) =>
      frame(hp(0.14 + 0.02 * i, 0.128 - 0.003 * i, s * (0.06 + 0.008 * i)), [s * 0.35, 1, -0.1]),
    );
    b.cards(brow, TUFT, { size: [0.022, 0.045], lean: 75, bend: 10, flow: [0, -0.2, -1], color: maneDark, bone: head });
  }

  // scar across the model's right cheek and brow, behind the eye
  b.decal(skull, SCAR, {
    at: hp(0.09, 0.07, -0.13),
    dir: [-0.9, 0.1, 0.35],
    size: [0.06 * H, 0.13 * H],
    lift: 0.004,
    roll: -12,
    bone: head,
    name: "scar",
  });

  // whiskers
  for (const s of [1, -1]) {
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 3; i++) {
        const base = hp(0.31 - i * 0.025, -0.012 - r * 0.014, s * 0.066);
        const tip = hp(0.27 - i * 0.05, -0.06 - r * 0.05 + i * 0.012, s * (0.19 + i * 0.01));
        const mid = hp(0.31 - i * 0.04, -0.012 - r * 0.02 + 0.015, s * 0.13);
        b.sweep(bezier(base, mid, tip), [0.0035, 0.001], { bone: head, color: WHISKER, sides: 4, caps: "none", name: "whisker" });
      }
    }
  }

  // ears: outer coat plate + inner pink plate + tufts; the right ear is notched
  const earShape = (notch: boolean, k: number, s: number): OutlinePoint[] => {
    const raw: OutlinePoint[] = [
      [-0.068, 0],
      [0.068, 0],
      [0.074, 0.065],
    ];
    if (notch) raw.push([0.062, 0.1, "sharp"], [0.034, 0.112, "sharp"], [0.066, 0.128, "sharp"]);
    else raw.push([0.052, 0.12]);
    raw.push([0.032, 0.17], [0.0, 0.235, "sharp"], [-0.045, 0.15], [-0.07, 0.07]);
    const pts = raw.map((q): OutlinePoint => (q.length === 3 ? [s * q[0] * k, q[1] * k, "sharp"] : [s * q[0] * k, q[1] * k]));
    return s < 0 ? pts.reverse() : pts;
  };
  const earPaint = paint((p, n, sc) => mix(coat.at(p, n), DARK, smoothstep(0.1, 0.22, sc[1]) * 0.8));
  const innerPaint = paint((p, _n, sc) => {
    const edge = smoothstep(0.012, 0.04, Math.abs(sc[0]));
    const base = mix([0.79, 0.6, 0.52], [0.96, 0.88, 0.78], edge * 0.85);
    return mix(base, [0.6, 0.4, 0.36], (noise(p, 0.014, 6) - 0.35) * 0.5);
  });
  for (const s of [1, -1]) {
    const dirY: [number, number, number] = [s * 0.3, 1, -0.22];
    const earJ = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: hp(0.03, 0.15, s * 0.082), dir: dirY, role: "hinge" });
    b.extrude(earShape(s < 0, 1.0, s), {
      at: earJ,
      x: [1, 0, 0],
      y: dirY,
      thickness: 0.026,
      bevel: 0.007,
      smoothing: 1,
      color: earPaint,
      bone: earJ,
      name: s > 0 ? "earOuterL" : "earOuterR",
    });
    b.extrude(
      earShape(false, 0.62, s).map((q): OutlinePoint => [q[0], q[1] + 0.012]),
      {
        at: earJ.local({ forward: 0.006 }),
        x: [1, 0, 0],
        y: dirY,
        thickness: 0.03,
        bevel: 0.006,
        smoothing: 1,
        color: innerPaint,
        bone: earJ,
        name: s > 0 ? "earInnerL" : "earInnerR",
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Fur cards

  const cardRng = rng(11);
  const fur = (skin: Surface, count: number, minDist: number, filter: (h: Hit) => boolean, seed: number) =>
    skin.scatter(count, { rng: rng(seed), minDist, filter });

  // body fuzz, so the silhouette is hair rather than a smooth tube
  b.cards(fur(bodySkin, 1100, 0.032, (h) => h.at.z > -0.68 && h.at.z < 0.32 && h.at.y > 0.5, 21), TUFT, {
    size: [0.042, 0.078],
    lean: 84,
    bend: 14,
    flow: [0, -0.4, -1],
    vary: 0.35,
    rng: cardRng,
    color: furCoat,
  });
  // the same fuzz over the shoulder, chest and thigh masses, so they read as part of the body
  b.cards(fur(b.surface(masses), 560, 0.034, (h) => h.at.y > 0.45 && h.n.y > -0.5, 25), TUFT, {
    size: [0.042, 0.078],
    lean: 84,
    bend: 14,
    flow: [0, -0.5, -1],
    vary: 0.35,
    rng: rng(26),
    color: furCoat,
  });

  // neck ruff and bib
  b.cards(fur(bodySkin, 380, 0.034, (h) => h.at.z > 0.27, 22), BLADE, {
    size: [0.06, 0.15],
    lean: 72,
    bend: 20,
    flow: [0, -0.5, -1],
    vary: 0.3,
    rng: rng(12),
    color: furCoat,
  });
  // chest fringe hanging forward-down
  b.cards(fur(bodySkin, 110, 0.036, (h) => h.at.z > 0.2 && h.n.y < -0.2 && h.n.z > -0.2, 23), BLADE, {
    size: [0.05, 0.13],
    lean: 150,
    bend: 12,
    flow: [0, -1, -0.4],
    vary: 0.3,
    rng: rng(13),
    color: furCoat,
  });
  // belly fringe
  b.cards(fur(bodySkin, 130, 0.04, (h) => h.at.z < 0.2 && h.at.z > -0.45 && h.n.y < -0.4, 24), TUFT, {
    size: [0.04, 0.1],
    lean: 150,
    bend: 10,
    flow: [0, -1, -0.2],
    vary: 0.3,
    rng: rng(14),
    color: furCoat,
  });

  // raised dorsal hackles, darker and longer, from the nape over the shoulders and back to the rump
  const crestFrames = b.along(torso, 44, () => undefined, { from: 0.1, to: 0.9 });
  b.cards(crestFrames, BLADE, {
    size: [0.05, 0.12],
    lean: 58,
    bend: 22,
    flow: [0, -0.3, -1],
    vary: 0.25,
    spin: 18,
    rng: rng(15),
    color: maneDark,
  });

  // haunch and thigh hair
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const thigh = b.surface(legSkins[`legH${L}`]);
    b.cards(fur(thigh, 90, 0.034, (h) => h.at.y > 0.3 && h.n.z < 0.4, 30 + (s > 0 ? 0 : 1)), TUFT, {
      size: [0.04, 0.1],
      lean: 70,
      bend: 14,
      flow: [0, -1, -0.5],
      vary: 0.3,
      rng: rng(16),
      color: furCoat,
    });
    // feathering on the back of the forelegs
    const fl = b.surface(legSkins[`legF${L}`]);
    b.cards(fur(fl, 60, 0.03, (h) => h.at.y > 0.14 && h.n.z < -0.2, 40 + (s > 0 ? 0 : 1)), TUFT, {
      size: [0.034, 0.085],
      lean: 100,
      bend: 12,
      flow: [0, -1, -0.2],
      vary: 0.3,
      rng: rng(17),
      color: furCoat,
    });
    // shoulder tuft
    b.cards(fur(b.surface(legSkins[`legF${L}`]), 50, 0.035, (h) => h.at.y > 0.48 && h.n.y > 0.1, 50 + (s > 0 ? 0 : 1)), TUFT, {
      size: [0.04, 0.1],
      lean: 70,
      flow: [0, -0.5, -1],
      vary: 0.3,
      rng: rng(18),
      color: furCoat,
    });
  }

  // tail brush
  b.cards(
    fur(b.surface(tailSweep), 260, 0.03, () => true, 60),
    BLADE,
    {
      size: [0.05, 0.14],
      lean: 72,
      bend: 14,
      flow: (f) => tailPath.tangentAt(tailPath.closestT(f.at)),
      vary: 0.3,
      rng: rng(19),
      color: tailPaint,
    },
  );

  // cheek ruff and chin beard
  const skullSkin = b.surface([skull]);
  b.cards(fur(skullSkin, 150, 0.03, (h) => Math.abs(h.at.x) > 0.08 && h.at.z < head.at.z + 0.14 && h.at.y < head.at.y + 0.06, 70), BLADE, {
    size: [0.06, 0.16],
    lean: 64,
    bend: 14,
    flow: [0, -0.4, -1],
    vary: 0.3,
    rng: rng(20),
    color: face,
  });
  b.cards(fur(b.surface(skull), 50, 0.03, (h) => h.n.y < -0.4, 71), TUFT, {
    size: [0.032, 0.08],
    lean: 140,
    flow: [0, -1, -0.5],
    vary: 0.3,
    rng: rng(21),
    color: "#d9cdb0",
  });

  // forehead and nape fluff blending the skull into the ears and ruff
  b.cards(fur(skullSkin, 70, 0.04, (h) => h.n.y > 0.45 && h.at.z < head.at.z + 0.12, 72), TUFT, {
    size: [0.04, 0.08],
    lean: 72,
    bend: 12,
    flow: [0, -0.3, -1],
    vary: 0.3,
    rng: rng(22),
    color: furCoat,
  });

  return b.root;
}
