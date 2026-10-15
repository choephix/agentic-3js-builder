import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, polyline } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { frame } from "../../../../src/frame";
import { countershade, gradient, grain, mottle, paint, mix, noise, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf",
  description:
    "A chunky, heroic gray wolf standing alert, in a hand-painted Warcraft style: heavy shoulder ruff, oversized paws and head, painted fur gradients, a worn leather collar with rivets and a bone charm, tribal war-paint and glowing amber eyes.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const GRAY_DARK = "#3b4250";
const GRAY_MID = "#6c7686";
const GRAY_LIGHT = "#a3adb9";
const SILVER = "#cfd6dc";
const CREAM = "#e8e0cc";
const CREAM_SH = "#b9ad92";
const BROWN = "#6b5238";
const BROWN_DARK = "#3d2c1e";
const BLACK = "#16181d";
const NOSE = "#1b1a1f";
const AMBER = "#ffb21e";
const BONE = "#efe6cf";
const BONE_SH = "#bfb08c";
const LEATHER = "#7a4a26";
const LEATHER_DK = "#4a2c16";
const LEATHER_LT = "#a8703c";
const IRON = "#7c828c";
const IRON_DK = "#454a53";
const GOLD = "#d9a43a";
const PAW_PAD = "#2a2226";
const RED = "#b3342a";
const TEAL = "#3fb6c9";
const TONGUE = "#c0556a";
const MOUTH = "#4a2230";

// ---------------------------------------------------------------- textures
const tuftSvg = (fill: string, hi: string) =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0 C 24 14 30 38 28 64 L 4 64 C 2 38 8 14 16 0 Z" fill="${fill}"/>
      <path d="M16 6 C 20 20 22 40 21 64 L 15 64 C 15 40 14 20 16 6 Z" fill="${hi}" opacity="0.75"/>
    </svg>`,
    { size: 128 },
  );
const TUFT_DARK = tuftSvg("#ffffff", "#c9c9c9");
const TUFT_LIGHT = tuftSvg("#ffffff", "#e6e6e6");

const warPaint = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 10 L 30 22 L 24 30 L 2 20 Z" fill="#3fb6c9"/>
    <path d="M10 34 L 36 40 L 30 50 L 6 44 Z" fill="#2a8ea0"/>
    <path d="M22 4 L 28 12 L 18 14 Z" fill="#bfeef5"/>
    <circle cx="44" cy="30" r="5" fill="#bfeef5"/>
  </svg>`,
  { size: 128 },
);

const runeSvg = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" fill="#c79a4a" stroke="#6a4416" stroke-width="5"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#6a4416" stroke-width="3"/>
    <path d="M32 12 L 32 52 M 20 22 L 32 32 L 44 22 M 22 44 L 32 34 L 42 44" stroke="#3a2208" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

const eyeSvg = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 28 C 12 6 40 2 62 12 C 50 36 22 40 2 28 Z" fill="#16181d"/>
    <path d="M8 27 C 16 11 38 8 56 14 C 46 32 24 35 8 27 Z" fill="#ffb21e"/>
    <path d="M12 26 C 20 16 40 14 52 17 C 44 29 26 31 12 26 Z" fill="#ffd45a"/>
    <path d="M8 27 C 16 11 38 8 56 14 C 40 12 20 14 8 27 Z" fill="#c9780e"/>
    <ellipse cx="34" cy="21" rx="4" ry="9" fill="#16181d"/>
    <circle cx="29" cy="15" r="3" fill="#ffffff"/>
    <circle cx="40" cy="26" r="1.6" fill="#ffffff" opacity="0.8"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- paints
// painterly fur: back dark gray, flank mid, belly cream, with soft mottled streaks
const furStreak = (a: string, b: string, seed: number) =>
  paint((p, n) => {
    const streak = noise(new THREE.Vector3(p.x * 2.2, p.y * 7, p.z * 1.2), 0.18, seed);
    const fine = noise(new THREE.Vector3(p.x * 6, p.y * 14, p.z * 3), 0.1, seed + 3);
    const t = smoothstep(0.35, 0.7, streak * 0.7 + fine * 0.35 + n.y * 0.1);
    return mix(a, b, t);
  });

const COAT_BACK = furStreak(GRAY_DARK, GRAY_MID, 3);
const COAT_SIDE = furStreak(GRAY_MID, GRAY_LIGHT, 7);

const bodyPaint = paint((p, n) => {
  const up = n.y;
  const streak = noise(new THREE.Vector3(p.x * 2.5, p.y * 6, p.z * 1.4), 0.2, 11);
  const fine = noise(new THREE.Vector3(p.x * 8, p.y * 16, p.z * 4), 0.08, 19);
  const grad = smoothstep(-0.15, 0.55, up);
  // dark saddle on top, silver-gray sides, cream belly
  let base = mix(GRAY_LIGHT, GRAY_DARK, grad * (0.55 + streak * 0.6));
  if (up < -0.15) base = mix(base, CREAM, smoothstep(-0.15, -0.65, up));
  // painted light streaks
  if (fine > 0.68 && up > -0.1) base = mix(base, SILVER, 0.5);
  if (fine < 0.22 && up > 0.2) base = mix(base, BLACK, 0.35);
  // a warm brown wash on the back
  const wash = smoothstep(0.55, 0.95, up) * smoothstep(0.35, 0.6, streak);
  return mix(base, BROWN, wash * 0.35);
});

const legPaint = paint((p, n) => {
  const h = p.y;
  const streak = noise(new THREE.Vector3(p.x * 6, p.y * 5, p.z * 6), 0.14, 5);
  let base = mix(GRAY_MID, GRAY_LIGHT, smoothstep(0.1, 0.7, streak));
  // dark stripe down the front of each leg (classic wolf marking)
  if (n.z > 0.3 && h < 0.7) base = mix(base, GRAY_DARK, 0.6);
  // pale lower leg and paw
  if (h < 0.22) base = mix(base, CREAM, smoothstep(0.22, 0.08, h) * 0.8);
  if (n.y < -0.4) base = mix(base, CREAM_SH, 0.5);
  return base;
});

const headPaint = paint((p, n) => {
  const streak = noise(new THREE.Vector3(p.x * 5, p.y * 8, p.z * 4), 0.12, 23);
  let base = mix(GRAY_MID, GRAY_LIGHT, smoothstep(0.3, 0.7, streak));
  // dark brow / forehead stripe
  if (n.y > 0.35) base = mix(base, GRAY_DARK, smoothstep(0.35, 0.8, n.y) * 0.75);
  // cream muzzle and chin
  if (n.y < -0.05) base = mix(base, CREAM, smoothstep(-0.05, -0.5, n.y));
  // dark nose bridge
  if (Math.abs(p.x) < 0.02 && n.y > 0.4 && p.z > 0.1) base = mix(base, BROWN_DARK, 0.5);
  return base;
});

const snoutPaint = paint((p, n) => {
  let base = mix(GRAY_LIGHT, SILVER, noise(p, 0.05, 8));
  if (n.y < 0.05) base = mix(base, CREAM, smoothstep(0.05, -0.4, n.y));
  if (n.y > 0.5) base = mix(base, BROWN, smoothstep(0.5, 0.95, n.y) * 0.45);
  return base;
});

const earOuter = paint((_p, n) => (n.z < -0.2 ? BLACK : mix(GRAY_DARK, BROWN_DARK, 0.4)));
const earInner = paint((_p, n, s) => (n.z > 0.2 ? mix(CREAM, "#d4a7a0", smoothstep(0.1, 0.0, s[1] * 0 + 0.0)) : GRAY_MID));

const tailPaint = (a: THREE.Vector3, b: THREE.Vector3) =>
  paint((p, n) => {
    const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(b.clone().sub(a)) / b.clone().sub(a).lengthSq()));
    const streak = noise(new THREE.Vector3(p.x * 6, p.y * 6, p.z * 3), 0.14, 31);
    let base = mix(GRAY_MID, GRAY_DARK, smoothstep(0.0, 0.8, t) * (0.5 + streak * 0.7));
    if (n.y < -0.3) base = mix(base, CREAM_SH, 0.5);
    // black tip
    if (t > 0.86) base = mix(base, BLACK, smoothstep(0.86, 0.96, t));
    return base;
  });

const ruffPaint = gradient(SILVER, GRAY_MID, [0, 1.0, 0.45], [0, 0.55, 0.3]);
const grainBody = grain(GRAY_MID, GRAY_DARK, { size: 0.02, axis: [0, 0, 1], seed: 5 });
const mottleBody = mottle(GRAY_MID, GRAY_LIGHT, { size: 0.12, seed: 4, contrast: 0.6 });
void ruffPaint;
void grainBody;
void mottleBody;
void countershade;
void COAT_BACK;
void COAT_SIDE;
void earInner;

// ---------------------------------------------------------------- build
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "grayWolf", detail: 1, paintSize: 2048 });
  const r = rng(2024);

  // ------------------------------------------------ key anchors (meters)
  // standing alert: head high, neck arched forward, legs straight
  const shoulderY = 0.88;
  const hipY = 0.82;
  const chest = [0, 0.8, 0.4] as const;
  const rump = [0, 0.82, -0.42] as const;
  const neckBase = [0, 0.97, 0.52] as const;
  const headC = [0, 1.07, 0.9] as const;

  // ------------------------------------------------ torso: loft of stations
  const torso = b.loft(
    [
      { at: [0, hipY - 0.02, -0.62], w: 0.24, h: 0.26 },
      { at: [0, hipY, -0.42], w: 0.34, h: 0.36 },
      { at: [0, 0.83, -0.12], w: 0.36, h: 0.36 },
      { at: [0, 0.85, 0.14], w: 0.4, h: 0.4 },
      { at: [0, 0.88, 0.4], w: 0.46, h: 0.5 },
      { at: [0, 0.93, 0.56], w: 0.4, h: 0.44 },
    ],
    { color: bodyPaint, caps: "round", sides: 10 },
  );

  // heavy shoulder muscle masses (Warcraft chunk)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), legPaint, {
      at: [s * 0.2, 0.74, 0.4],
      scale: [0.14, 0.26, 0.2],
      rotation: [0, 0, s * 8],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), legPaint, {
      at: [s * 0.2, 0.7, -0.4],
      scale: [0.14, 0.26, 0.24],
      rotation: [0, 0, s * 6],
    });
  }

  // chest tuft / cream bib
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { at: [0, 0.74, 0.58], scale: [0.2, 0.26, 0.16] });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM_SH, { at: [0, 0.6, 0.5], scale: [0.14, 0.12, 0.14] });

  // belly tuck
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { at: [0, 0.62, -0.05], scale: [0.2, 0.1, 0.34] });

  // spine ridge of dark guard hair
  b.sweep(
    catmull([
      [0, 1.0, 0.45],
      [0, 1.06, 0.3],
      [0, 1.04, 0.0],
      [0, 1.0, -0.3],
      [0, 0.96, -0.55],
    ]),
    [0.04, 0.025],
    { color: GRAY_DARK, caps: "round", sides: 6 },
  );

  // ------------------------------------------------ neck + ruff
  const neck = b.sweep(
    catmull([
      [0, 0.92, 0.4],
      [0, 1.0, 0.58],
      [0, 1.1, 0.74],
      [0, 1.12, 0.86],
    ]),
    [0.2, 0.17, 0.15],
    { color: headPaint, caps: "round", sides: 10 },
  );
  void neck;

  // big painted ruff mass around the neck, silvery
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), SILVER, {
      at: [s * 0.15, 0.98, 0.62],
      scale: [0.13, 0.17, 0.2],
      rotation: [0, s * 15, s * 12],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), GRAY_LIGHT, {
      at: [s * 0.1, 0.84, 0.62],
      scale: [0.11, 0.13, 0.17],
    });
  }
  b.part(new THREE.SphereGeometry(1, 10, 8), GRAY_LIGHT, { at: [0, 1.08, 0.62], scale: [0.2, 0.15, 0.2] });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { at: [0, 0.9, 0.72], scale: [0.16, 0.18, 0.14] });

  // ------------------------------------------------ head
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, {
    at: headC,
    scale: [0.17, 0.155, 0.2],
  });

  // brow ridges (heroic heavy brow)
  for (const s of [1, -1]) {
    b.capsule([s * 0.05, headC[1] + 0.1, headC[2] + 0.07], [s * 0.15, headC[1] + 0.07, headC[2] + 0.1], [0.032, 0.026], GRAY_DARK, { sides: 6 });
    // cheek ruff tufts swept back
    b.spike([s * 0.14, headC[1] - 0.04, headC[2] + 0.05], [s * 0.7, -0.25, -0.65], 0.2, 0.06, SILVER, { sides: 6 });
    b.spike([s * 0.15, headC[1] - 0.09, headC[2] + 0.06], [s * 0.6, -0.55, -0.55], 0.17, 0.05, GRAY_LIGHT, { sides: 6 });
    b.spike([s * 0.13, headC[1] + 0.0, headC[2] + 0.0], [s * 0.7, -0.05, -0.7], 0.17, 0.055, GRAY_LIGHT, { sides: 6 });
  }

  // snout: chunky wedge, lofted forward from skull
  const snout = b.loft(
    [
      { at: [0, headC[1] - 0.03, headC[2] + 0.12], w: 0.19, h: 0.16 },
      { at: [0, headC[1] - 0.05, headC[2] + 0.26], w: 0.15, h: 0.12 },
      { at: [0, headC[1] - 0.06, headC[2] + 0.38], w: 0.12, h: 0.1 },
    ],
    { color: snoutPaint, caps: "round", sides: 8 },
  );

  // nose pad
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    at: [0, headC[1] - 0.025, headC[2] + 0.45],
    scale: [0.05, 0.036, 0.04],
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#5a5560", {
    at: [0, headC[1] - 0.012, headC[2] + 0.47],
    scale: [0.02, 0.01, 0.014],
  });
  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), BLACK, {
      at: [s * 0.025, headC[1] - 0.035, headC[2] + 0.485],
      scale: [0.012, 0.01, 0.008],
    });
  }

  // lower jaw (cream, slightly open for an alert, panting look)
  const jaw = b.loft(
    [
      { at: [0, headC[1] - 0.12, headC[2] + 0.08], w: 0.15, h: 0.07 },
      { at: [0, headC[1] - 0.13, headC[2] + 0.24], w: 0.11, h: 0.055 },
      { at: [0, headC[1] - 0.12, headC[2] + 0.38], w: 0.08, h: 0.045 },
    ],
    { color: CREAM, caps: "round", sides: 8 },
  );
  void jaw;

  // mouth line along lips
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.06, headC[1] - 0.085, headC[2] + 0.4],
        [s * 0.07, headC[1] - 0.08, headC[2] + 0.28],
        [s * 0.1, headC[1] - 0.075, headC[2] + 0.16],
        [s * 0.13, headC[1] - 0.065, headC[2] + 0.1],
      ]),
      0.006,
      { color: MOUTH, sides: 5, caps: "round" },
    );
  }

  // teeth: upper fangs and a row of small ones
  for (const s of [1, -1]) {
    b.spike([s * 0.06, headC[1] - 0.085, headC[2] + 0.37], [0, -1, 0.1], 0.055, 0.014, BONE, { sides: 6 });
    b.spike([s * 0.085, headC[1] - 0.08, headC[2] + 0.2], [0, -1, 0.05], 0.03, 0.01, BONE, { sides: 5 });
    b.spike([s * 0.1, headC[1] - 0.075, headC[2] + 0.13], [0, -1, 0], 0.025, 0.009, BONE, { sides: 5 });
    // lower canines
    b.spike([s * 0.045, headC[1] - 0.115, headC[2] + 0.37], [0, 1, 0.1], 0.04, 0.011, BONE_SH, { sides: 5 });
  }
  for (let i = 0; i < 4; i++) {
    b.spike([(i - 1.5) * 0.02, headC[1] - 0.085, headC[2] + 0.42], [0, -1, 0.1], 0.016, 0.006, BONE, { sides: 4 });
  }

  // eyes: glowing amber almond decals set under the brow
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(headC).at(s * 52, 8);
    if (hit) {
      glow(
        b.decal(skin, eyeSvg, {
          at: hit,
          size: [0.085, 0.053],
          up: [0, 1, 0],
          roll: s * -12,
          mirror: s > 0,
        }),
        0.9,
      );
    }
    // war paint decal on cheek
    const paintHit = skin.around(headC).at(s * 75, -12);
    if (paintHit) {
      b.decal(skin, warPaint, { at: paintHit, size: [0.12, 0.12], up: [0, 1, 0], roll: s * 15, mirror: s > 0 });
    }
  }

  // ears: tall upright extruded triangles with inner cream
  for (const s of [1, -1]) {
    const earBase = [s * 0.1, headC[1] + 0.12, headC[2] - 0.05] as const;
    const earShape: [number, number, "sharp"?][] = [
      [-0.07, 0],
      [0.07, 0],
      [0.045, 0.14],
      [0.0, 0.23, "sharp"],
      [-0.035, 0.13],
    ].map((q) => [q[0] as number, q[1] as number] as [number, number]);
    const ear = b.extrude(earShape, {
      at: earBase,
      x: [s, 0, 0],
      y: [s * 0.15, 1, -0.12],
      thickness: [0.04, 0.012],
      bevel: 0.008,
      smoothing: 1,
      color: earOuter,
    });
    void ear;
    // inner ear (cream-pink) as a slightly smaller extrude on the front face
    b.extrude(
      [
        [-0.04, 0.02],
        [0.04, 0.02],
        [0.022, 0.12],
        [0.0, 0.17, "sharp"],
        [-0.02, 0.11],
      ],
      {
        at: [earBase[0], earBase[1], earBase[2] + 0.018],
        x: [s, 0, 0],
        y: [s * 0.15, 1, -0.12],
        thickness: 0.01,
        color: "#d9b2a4",
      },
    );
    // ear tufts
    for (let i = 0; i < 3; i++) {
      b.spike(
        [earBase[0] + s * (-0.01 + i * 0.012), earBase[1] + 0.03, earBase[2] + 0.03],
        [0, 0.3, 1],
        0.05 + i * 0.01,
        0.012,
        i === 1 ? SILVER : CREAM,
        { sides: 4 },
      );
    }
  }

  // forehead brow tuft
  b.spike([0, headC[1] + 0.13, headC[2] + 0.04], [0, 0.5, 0.7], 0.08, 0.04, GRAY_DARK, { sides: 6 });

  void snout;

  // ------------------------------------------------ legs
  const FOREARM = legPaint;
  type LegSpec = { s: number; front: boolean };
  const legs: LegSpec[] = [
    { s: 1, front: true },
    { s: -1, front: true },
    { s: 1, front: false },
    { s: -1, front: false },
  ];

  for (const { s, front } of legs) {
    const top = front ? ([s * 0.2, 0.76, 0.4] as const) : ([s * 0.2, 0.74, -0.4] as const);
    const x = s * (front ? 0.19 : 0.2);
    const z = front ? 0.42 : -0.42;

    if (front) {
      // straight, thick forelimb; slight elbow back
      const limb = b.sweep(
        polyline([
          [top[0], top[1], top[2] - 0.02],
          [x, 0.46, z - 0.02],
          [x, 0.2, z + 0.01],
          [x, 0.075, z + 0.02],
        ]),
        [0.11, 0.085, 0.065, 0.06],
        { color: FOREARM, caps: "round", sides: 8 },
      );
      void limb;
      // elbow point
      b.part(new THREE.SphereGeometry(1, 8, 6), GRAY_MID, { at: [x, 0.5, z - 0.1], scale: [0.065, 0.07, 0.07] });
    } else {
      // hind: thigh mass, hock angle, straight metatarsus
      b.part(new THREE.SphereGeometry(1, 10, 8), legPaint, {
        at: [s * 0.2, 0.68, -0.43],
        scale: [0.15, 0.24, 0.22],
        rotation: [-15, 0, 0],
      });
      const limb = b.sweep(
        polyline([
          [top[0], top[1] - 0.1, top[2] + 0.02],
          [x, 0.46, z + 0.09],
          [x, 0.27, z - 0.08],
          [x, 0.075, z - 0.04],
        ]),
        [0.1, 0.07, 0.055, 0.052],
        { color: FOREARM, caps: "round", sides: 8 },
      );
      void limb;
      // hock knob
      b.part(new THREE.SphereGeometry(1, 8, 6), GRAY_DARK, { at: [x, 0.29, z - 0.13], scale: [0.05, 0.06, 0.06] });
    }

    // big paw (oversized, Warcraft style)
    const pz = front ? z + 0.07 : z + 0.01;
    b.part(new THREE.SphereGeometry(1, 10, 6), CREAM, {
      at: [x, 0.05, pz],
      scale: [0.075, 0.055, 0.12],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), GRAY_LIGHT, {
      at: [x, 0.08, pz - 0.04],
      scale: [0.07, 0.045, 0.08],
    });
    // toes + claws
    for (let i = -1; i <= 1; i++) {
      const tx = x + i * 0.035;
      b.part(new THREE.SphereGeometry(1, 6, 4), CREAM_SH, {
        at: [tx, 0.03, pz + 0.085 - Math.abs(i) * 0.012],
        scale: [0.026, 0.026, 0.036],
      });
      b.spike([tx, 0.022, pz + 0.115 - Math.abs(i) * 0.012], [0, -0.35, 1], 0.04, 0.009, BLACK, { sides: 4 });
    }
    // underside pad hint
    b.part(new THREE.SphereGeometry(1, 6, 4), PAW_PAD, {
      at: [x, 0.0, pz - 0.01],
      scale: [0.05, 0.012, 0.07],
    });
    // dewclaw
    b.spike([x, 0.17, z + (front ? -0.05 : -0.06)], [0, -0.6, -0.6], 0.035, 0.01, BONE_SH, { sides: 4 });
  }

  // ------------------------------------------------ tail: bushy, hanging low then curving
  const tailPath = catmull([
    [0, 0.84, -0.6],
    [0, 0.82, -0.78],
    [0, 0.68, -0.95],
    [0, 0.5, -1.04],
    [0, 0.34, -1.06],
  ]);
  const tail = b.sweep(tailPath, [0.07, 0.115, 0.12, 0.07], {
    color: tailPaint(new THREE.Vector3(0, 0.84, -0.6), new THREE.Vector3(0, 0.34, -1.06)),
    caps: "round",
    sides: 8,
  });
  void tail;
  // tail fur cards (dark guard hairs) along the tail
  const tailFrames: ReturnType<typeof frame>[] = [];
  b.along(tailPath, 14, (at) => {
    tailFrames.push(frame(at.point ?? at, [0, 1, 0]));
  });

  // ------------------------------------------------ fur cards
  const bodySurf = b.surface(torso);
  const hitsBack = bodySurf.scatter(260, {
    rng: rng(77),
    minDist: 0.045,
    filter: (h) => h.n.y > 0.1,
  });
  b.cards(hitsBack, TUFT_DARK, {
    size: [0.045, 0.1],
    lean: 62,
    bend: 25,
    vary: 0.3,
    rng: rng(78),
    color: GRAY_DARK,
    flow: [0, -0.2, -1],
  });
  const hitsSide = bodySurf.scatter(220, {
    rng: rng(81),
    minDist: 0.05,
    filter: (h) => Math.abs(h.n.x) > 0.5,
  });
  b.cards(hitsSide, TUFT_LIGHT, {
    size: [0.045, 0.1],
    lean: 70,
    bend: 25,
    vary: 0.3,
    rng: rng(82),
    color: GRAY_LIGHT,
    flow: [0, -0.4, -1],
  });
  const hitsBelly = bodySurf.scatter(120, {
    rng: rng(83),
    minDist: 0.05,
    filter: (h) => h.n.y < -0.3,
  });
  b.cards(hitsBelly, TUFT_LIGHT, {
    size: [0.04, 0.09],
    lean: 75,
    bend: 20,
    vary: 0.3,
    rng: rng(84),
    color: CREAM,
    flow: [0, -0.1, -1],
  });

  // tail cards
  const tailSurf = b.surface(tail);
  const tailHits = tailSurf.scatter(120, { rng: rng(91), minDist: 0.04 });
  b.cards(tailHits, TUFT_DARK, {
    size: [0.05, 0.11],
    lean: 58,
    bend: 25,
    vary: 0.3,
    rng: rng(92),
    color: GRAY_MID,
    flow: [0, -1, -0.3],
  });
  const tipHits = tailSurf.scatter(60, {
    rng: rng(93),
    minDist: 0.035,
    filter: (h) => h.point.y < 0.45,
  });
  b.cards(tipHits, TUFT_DARK, {
    size: [0.05, 0.11],
    lean: 58,
    bend: 25,
    vary: 0.3,
    rng: rng(94),
    color: BLACK,
    flow: [0, -1, -0.3],
  });

  // ruff cards: long silvery hairs fanning down over the shoulders
  const ruffFrames: ReturnType<typeof frame>[] = [];
  const ruffRng = rng(55);
  for (let i = 0; i < 70; i++) {
    const a = ruffRng() * Math.PI * 2;
    const rr = 0.13 + ruffRng() * 0.07;
    const y = 0.88 + ruffRng() * 0.26;
    const z = 0.52 + ruffRng() * 0.2;
    ruffFrames.push(frame([Math.sin(a) * rr, y + Math.cos(a) * 0.05, z], [Math.sin(a), Math.cos(a) * 0.4, 0.2]));
  }
  b.cards(ruffFrames, TUFT_LIGHT, {
    size: [0.06, 0.16],
    lean: 55,
    bend: 30,
    vary: 0.25,
    rng: rng(56),
    color: SILVER,
    flow: [0, -0.6, -1],
  });
  // chest fur hanging
  const chestFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 21 - 0.5) * 1.6;
    chestFrames.push(frame([Math.sin(a) * 0.17, 0.78 - Math.abs(a) * 0.1, 0.65], [Math.sin(a) * 0.6, 0.1, 1]));
  }
  b.cards(chestFrames, TUFT_LIGHT, {
    size: [0.05, 0.14],
    lean: 150,
    bend: -10,
    vary: 0.2,
    rng: rng(57),
    color: CREAM,
    flow: [0, 1, 0],
  });

  // leg feathering on back of limbs
  for (const { s, front } of legs) {
    const x = s * (front ? 0.19 : 0.2);
    const z = front ? 0.42 : -0.42;
    const fr: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 5; i++) {
      fr.push(frame([x, 0.64 - i * 0.09, z + (front ? -0.095 : -0.09)], [0, 0.2, -1]));
    }
    b.cards(fr, TUFT_LIGHT, {
      size: [0.04, 0.09],
      lean: 150,
      vary: 0.2,
      rng: rng(60 + (front ? 1 : 0) + (s > 0 ? 2 : 0)),
      color: GRAY_LIGHT,
      flow: [0, 1, 0],
    });
  }

  // ------------------------------------------------ worn leather collar with rivets and bone charm
  const collarLoop = b.surface(neck).loop(frame([0, 0.99, 0.6], [0.0, 0.5, 0.75]), { lift: 0.012 });
  const collarSweep = b.sweep(collarLoop, [0.022, 0.022], { color: LEATHER, section: "box", sides: 8 });
  void collarSweep;
  // stitched edging bands
  b.sweep(collarLoop, 0.008, { color: LEATHER_DK, sides: 5 });
  b.along(collarLoop, 22, (at) => {
    b.stick(new THREE.SphereGeometry(0.01, 6, 4), IRON, at.point ? frame(at.point, at.tangent ?? [0, 1, 0]) : (at as never));
  });

  // pendant ring + bone charm hanging at throat
  const throat = collarLoop.at(0.0);
  void throat;
  const pendantAt: [number, number, number] = [0, 0.86, 0.79];
  b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 12), IRON, { at: [0, 0.9, 0.745], rotation: [0, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.014, 14), LEATHER_DK, {
    at: pendantAt,
    dir: [0, 0.2, 1],
    axis: "y",
  });
  b.part(new THREE.CircleGeometry(0.048, 14), "#ffffff", {
    at: [0, 0.86, 0.801],
    dir: [0, 0.2, 1],
    axis: "z",
    texture: runeSvg,
  });
  // fang charms either side
  for (const s of [1, -1]) {
    b.spike([s * 0.07, 0.88, 0.76], [s * 0.2, -1, 0.3], 0.07, 0.016, BONE, { sides: 6 });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), RED, { at: [s * 0.07, 0.885, 0.765] });
  }
  // teal feather charm hanging from the collar
  b.spike([0.12, 0.93, 0.7], [0.6, -1, 0.2], 0.1, 0.016, TEAL, { sides: 4 });

  // ------------------------------------------------ painted shoulder war-marks and scars (decals on body)
  for (const s of [1, -1]) {
    const hit = bodySurf.around([0, 0.85, 0.4]).at(s * 90, 15);
    if (hit) {
      b.decal(bodySurf, warPaint, { at: hit, size: [0.17, 0.17], up: [0, 1, 0], roll: s * 20, mirror: s > 0 });
    }
    // scar on flank
    const scarHit = bodySurf.around([0, 0.8, -0.15]).at(s * 90, 5);
    if (scarHit) {
      b.stick(new THREE.BoxGeometry(0.008, 0.1, 0.012), CREAM, scarHit, { sink: 0.003 } as never);
    }
  }

  // iron shoulder studs on a worn strap across the chest
  const strap = b.surface(torso).loop(frame([0, 0.86, 0.36], [0, 0.0, 1]), { lift: 0.01 });
  b.sweep(strap, [0.016, 0.016], { color: LEATHER_LT, section: "box" });
  b.along(strap, 14, (at) => {
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), GOLD, at.point ? frame(at.point, at.tangent ?? [0, 1, 0]) : (at as never));
  });

  // ------------------------------------------------ small glowing eye gleam backing + whisker dots
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.006, 4, 3), BLACK, {
        at: [s * (0.045 + i * 0.012), headC[1] - 0.045 + i * 0.008, headC[2] + 0.4 - i * 0.02],
      });
    }
  }

  void r;
  void shoulderY;
  void chest;
  void rump;
  void neckBase;
  void IRON_DK;
  void TONGUE;

  return b.root;
}
