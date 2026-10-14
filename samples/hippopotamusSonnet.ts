import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Gentle Giant Hippo",
  description:
    "A standing, mouth-closed hippopotamus in a polished Overwatch-style look: periwinkle hide with a crisp pink underside, wide bevelled muzzle, sleepy glossy eyes and a clean white-navy support pack with one strong orange accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: periwinkle hide, pink underside, white/navy tech, ONE accent (orange).
const SKIN_HI = "#b6c2f0";
const SKIN = "#8c9acf";
const SKIN_LO = "#6574b0";
const DEEP = "#4a5588";
const BELLY = "#ffcbd0";
const PINK = "#ef93a6";
const PINK_DK = "#d4647f";
const FOOT = "#5a6396";
const HOOF = "#2b2e4d";
const IVORY = "#f8f0da";
const NAVY = "#222744";
const NAVY_LT = "#3a4170";
const WHITE = "#eef2fb";
const STEEL = "#b3bdd4";
const ORANGE = "#ff7a1a";
const ORANGE_DK = "#d4570a";
const GLOWC = "#ffc766";
const NOSTRIL = "#3a2748";

const ease = (a: number, b: number, u: number) => a + ((b - a) * (1 - Math.cos(Math.PI * u))) / 2;
/** Smooth [rx, ry] profile through keys [t, rx, ry]. */
function profile(keys: Array<[number, number, number]>) {
  return (t: number): [number, number] => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return [ease(keys[i - 1][1], keys[i][1], u), ease(keys[i - 1][2], keys[i][2], u)];
      }
    }
    const k = keys[keys.length - 1];
    return [k[1], k[2]];
  };
}

/** Rounded/chamfered rectangle outline, half extents hx × hy, chamfer c. */
function chamfered(hx: number, hy: number, c: number): Array<[number, number]> {
  return [
    [-hx + c, -hy],
    [hx - c, -hy],
    [hx, -hy + c],
    [hx, hy - c],
    [hx - c, hy],
    [-hx + c, hy],
    [-hx, hy - c],
    [-hx, -hy + c],
  ];
}

// ---------------------------------------------------------------------------------------------------------------
// Paints
const blushPoints: Array<[THREE.Vector3, number, number]> = [];
for (const s of [1, -1]) {
  blushPoints.push([new THREE.Vector3(s * 0.49, 1.0, 1.42), 0.2, 0.7]); // cheek
  blushPoints.push([new THREE.Vector3(s * 0.31, 1.46, 1.22), 0.16, 0.6]); // around the eye
  blushPoints.push([new THREE.Vector3(s * 0.5, 0.98, 1.92), 0.17, 0.55]); // lip corner
  blushPoints.push([new THREE.Vector3(s * 0.2, 1.38, 1.6), 0.12, 0.6]); // nostril
  blushPoints.push([new THREE.Vector3(s * 0.47, 0.52, 0.42), 0.14, 0.5]); // elbow
  blushPoints.push([new THREE.Vector3(s * 0.45, 0.5, -0.86), 0.14, 0.5]); // knee
}

const skin = paint((p, n) => {
  const j = noise(p, 0.4, 11);
  let c: Rgb = mix(SKIN_LO, SKIN, smoothstep(-0.55, 0.2, n.y));
  c = mix(c, SKIN_HI, smoothstep(0.55, 0.95, n.y) * 0.9);
  // crisp, hand-painted pink underside with a wobbly edge
  const edge = n.y + (j - 0.5) * 0.34;
  c = mix(c, BELLY, 1 - smoothstep(-0.46, -0.38, edge));
  // cloudy blotches
  c = mix(c, SKIN_LO, smoothstep(0.58, 0.82, noise(p, 0.2, 3)) * 0.22);
  // neck folds
  const fz = smoothstep(0.52, 0.72, p.z) * (1 - smoothstep(1.0, 1.18, p.z)) * smoothstep(0.55, 0.8, p.y);
  const f = Math.abs(Math.sin(p.z * 30 + noise(p, 0.5, 4) * 4));
  c = mix(c, DEEP, (1 - smoothstep(0.05, 0.13, f)) * fz * 0.6);
  // leg wrinkles
  const lw = 1 - smoothstep(0.28, 0.46, p.y);
  const f2 = Math.abs(Math.sin(p.y * 42 + noise(p, 0.3, 6) * 3));
  c = mix(c, DEEP, (1 - smoothstep(0.06, 0.14, f2)) * lw * 0.45);
  // blush: hippo pink around eyes, cheeks, joints
  let b = 0;
  for (const [pt, r, k] of blushPoints) b = Math.max(b, (1 - smoothstep(r * 0.25, r, p.distanceTo(pt))) * k);
  c = mix(c, PINK, b);
  // lower-jaw lips are a warmer pink
  if (p.z > 1.1 && p.y < 0.9) c = mix(c, BELLY, smoothstep(0.9, 0.82, p.y) * 0.65);
  // whisker follicles in staggered rows on the muzzle
  if (p.z > 1.45 && p.y > 1.1 && n.y > 0.4) {
    const row = Math.round(p.z / 0.07);
    const col = Math.round((p.x + (row % 2) * 0.035) / 0.07);
    const dx = p.x + (row % 2) * 0.035 - col * 0.07;
    const dz = p.z - row * 0.07;
    c = mix(c, DEEP, 0.7 * (1 - smoothstep(0.005, 0.012, Math.hypot(dx, dz))));
  }
  return c;
});

const packTop = paint((_p, n, s) => {
  if (Math.abs(n.y) < 0.5) return NAVY;
  const [x, y] = s;
  const ax = Math.abs(x);
  if (ax < 0.022) return ORANGE;
  if (ax < 0.03) return NAVY;
  if (Math.abs(y - 0.14) < 0.005 || Math.abs(y + 0.2) < 0.005) return NAVY_LT;
  if (ax > 0.085 && ax < 0.13 && y > -0.28 && y < -0.22 && Math.sin(x * 220) > 0) return NAVY;
  if (ax > 0.085 && ax < 0.13 && y > 0.17 && y < 0.26 && Math.sin(y * 260) > 0) return NAVY_LT;
  return mix(WHITE, STEEL, 0.25 * noise(new THREE.Vector3(x, y, 0), 0.12, 2));
});
const canisterPaint = paint((_p, n, s) => {
  const t = s[0];
  if (Math.abs(t - 0.18) < 0.02 || Math.abs(t - 0.82) < 0.02) return NAVY;
  if (Math.abs(t - 0.5) < 0.012) return NAVY_LT;
  if (n.y < -0.35) return STEEL;
  return mix(WHITE, SKIN_HI, 0.12 * (1 - n.y));
});
const packBase = paint((_p, n, s) => {
  if (Math.abs(n.y) < 0.5) return NAVY_LT;
  const ax = Math.abs(s[0]);
  const ay = Math.abs(s[1]);
  if (ax > 0.3 || ay > 0.4) return ORANGE_DK;
  return NAVY;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ir" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffd25a"/><stop offset="0.65" stop-color="#ff9a1e"/><stop offset="1" stop-color="#b8480a"/>
    </radialGradient>
  </defs>
  <rect width="256" height="128" fill="#2a1b30"/>
  <ellipse cx="128" cy="64" rx="44" ry="40" fill="#f6eee8"/>
  <circle cx="128" cy="64" r="29" fill="#3a2040"/>
  <circle cx="128" cy="64" r="26" fill="url(#ir)"/>
  <circle cx="128" cy="64" r="12" fill="#1c1024"/>
  <circle cx="117" cy="51" r="8" fill="#ffffff"/>
  <circle cx="139" cy="77" r="3.5" fill="#ffffff" fill-opacity="0.9"/>
</svg>`,
  { size: 256 },
);
const BRISTLE = svg(
  `<svg viewBox="0 0 16 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 48 L6.5 20 Q6 8 3 2 Q8 6 9.5 20 L9.5 48Z" fill="#4a3c5c"/>
  <path d="M9 48 L10 24 Q11 12 14 5 Q11.5 14 11.5 26 L12 48Z" fill="#3a2f4d"/>
  <path d="M4.5 48 L5 28 Q4 20 1 15 Q6 20 6.5 30Z" fill="#3a2f4d"/>
</svg>`,
  { size: 96 },
);
const FRINGE = svg(
  `<svg viewBox="0 0 16 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 32 Q4 16 8 2 Q11 16 11 32Z" fill="#4a3c5c"/>
</svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "hippopotamus", paintSize: 2048 });

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.02, -0.78], dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, -0.78],
      [0, 1.03, -0.15],
      [0, 1.05, 0.4],
      [0, 1.07, 0.8],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.07, 0.8],
      [0, 1.09, 0.95],
      [0, 1.1, 1.05],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.1, 1.05], dir: [0, -0.02, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.95, 1.15], aim: [0, 0.82, 1.55], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.1, -1.4],
      [0, 1.07, -1.62],
      [0, 0.97, -1.78],
      [0, 0.83, -1.85],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Body barrel + neck (one skinned loft)
  const bodyPath = catmull([
    [0, 1.04, -1.12],
    [0, 1.02, -0.78],
    [0, 1.03, -0.15],
    [0, 1.05, 0.4],
    [0, 1.07, 0.8],
    [0, 1.09, 1.0],
  ]);
  const bodyR = profile([
    [0, 0.42, 0.43],
    [0.09, 0.57, 0.52],
    [0.24, 0.66, 0.55],
    [0.5, 0.69, 0.57],
    [0.75, 0.66, 0.56],
    [0.9, 0.55, 0.5],
    [1, 0.44, 0.44],
  ]);
  const body = b.sweep(bodyPath, bodyR, {
    bone: [hips, spine, neck],
    color: skin,
    shift: (): [number, number] => [0, -0.04],
    sides: 14,
    caps: "round",
    name: "body",
  });
  const bodyS = b.surface(body);

  // ------------------------------------------------------------------------------------------------------------
  // Head: upper skull + muzzle, lower jaw
  const skullR = profile([
    [0, 0.46, 0.44],
    [0.35, 0.5, 0.4],
    [0.75, 0.53, 0.34],
    [1, 0.52, 0.31],
  ]);
  const skull = b.sweep(
    catmull([
      [0, 1.15, 0.98],
      [0, 1.14, 1.32],
      [0, 1.08, 1.5],
      [0, 1.04, 1.6],
    ]),
    skullR,
    { bone: head, color: skin, sides: 14, caps: "round", name: "skull" },
  );
  const jawR = profile([
    [0, 0.38, 0.24],
    [0.4, 0.42, 0.22],
    [0.8, 0.47, 0.2],
    [1, 0.46, 0.19],
  ]);
  const lower = b.sweep(
    catmull([
      [0, 0.9, 1.1],
      [0, 0.86, 1.34],
      [0, 0.83, 1.5],
      [0, 0.82, 1.55],
    ]),
    jawR,
    { bone: jaw, color: skin, sides: 14, caps: "round", name: "lowerJaw" },
  );
  const headS = b.surface([skull, lower]);

  // closed-mouth seam, with a small friendly lift at the corners
  const seamPts = [
    [0.42, 1.0, 1.28],
    [0.47, 0.94, 1.42],
    [0.5, 0.92, 1.62],
    [0.44, 0.9, 1.82],
    [0.22, 0.89, 1.95],
    [0, 0.89, 1.98],
    [-0.22, 0.89, 1.95],
    [-0.44, 0.9, 1.82],
    [-0.5, 0.92, 1.62],
    [-0.47, 0.94, 1.42],
    [-0.42, 1.0, 1.28],
  ];
  b.sweep(headS.drape(catmull(seamPts), { lift: 0.006 }), 0.011, { bone: head, color: NAVY, sides: 4, caps: "round", name: "mouthLine" });

  // lip pads, nostril bumps, brow/eye turrets, cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.2, 12, 8), skin, { bone: head, at: [s * 0.28, 1.0, 1.84], scale: [1, 0.92, 1.05], name: "lipPad" });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), skin, { bone: head, at: [s * 0.2, 1.36, 1.6], scale: [1, 0.7, 1.15], name: "nostrilBump" });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), NOSTRIL, {
      bone: head,
      at: [s * 0.2, 1.395, 1.64],
      scale: [0.42, 0.22, 1.05],
      rotation: [0, s * 18, 0],
      name: "nostril",
    });
    b.part(new THREE.SphereGeometry(0.28, 10, 8), skin, { bone: head, at: [s * 0.32, 0.98, 1.4], scale: [0.95, 0.8, 1.3], name: "cheek" });
    // eye turret
    const turret = new THREE.Vector3(s * 0.31, 1.46, 1.2);
    b.part(new THREE.SphereGeometry(0.13, 10, 8), skin, { bone: head, at: turret.toArray(), name: "eyeTurret" });
    const face = new THREE.Vector3(s * 0.5, 0.3, 0.8).normalize();
    const eyeAt = turret.clone().addScaledVector(face, 0.085);
    b.part(new THREE.SphereGeometry(0.07, 12, 8), "#ffffff", {
      bone: head,
      at: eyeAt.toArray(),
      rotation: [0, Math.atan2(face.x, face.z) * (180 / Math.PI) - 90, 0],
      texture: EYE,
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.079, 10, 5, 0, Math.PI * 2, 0, 1.0), skin, {
      bone: head,
      at: eyeAt.toArray(),
      dir: [s * 0.1, 1, -0.25],
      name: "eyelid",
    });
    // brow ridge over the lid
    b.rod([s * 0.2, 1.54, 1.18], [s * 0.4, 1.48, 1.26], [0.03, 0.025], { bone: head, color: SKIN_LO, sides: 6, name: "brow" });
  }

  // tusks: the lower canines peek out beside the closed lips
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(s * 0.5, 0.93, 1.6);
    const dir = new THREE.Vector3(s * 0.2, 1, 0.3).normalize();
    b.spike(base, dir, 0.21, 0.04, { bone: jaw, color: IVORY, sides: 7, name: "tusk" });
    const band0 = base.clone().addScaledVector(dir, 0.05);
    const band1 = base.clone().addScaledVector(dir, 0.08);
    b.rod(band0, band1, 0.036, { bone: jaw, color: ORANGE, sides: 8, name: "tuskBand" });
  }

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: [s * 0.2, 1.47, 1.0], dir: [s * 0.45, 1, 0.1], role: "hinge" });
    const outline: Array<[number, number]> = [
      [-0.085, 0],
      [-0.105, 0.07],
      [-0.065, 0.15],
      [0, 0.195],
      [0.065, 0.15],
      [0.105, 0.07],
      [0.085, 0],
    ];
    const e = b.extrude(outline, {
      at: [s * 0.2, 1.47, 1.0],
      x: [1, 0, 0],
      y: [s * 0.45, 1, 0.1],
      thickness: 0.05,
      bevel: 0.012,
      smoothing: 1,
      color: skin,
      bone: ear,
      name: "ear",
      detail: 0.5,
    });
    b.extrude(
      outline.map(([x, y]) => [x * 0.62, y * 0.74 + 0.012] as [number, number]),
      {
        at: [s * 0.2, 1.47, 1.0 + 0.021],
        x: [1, 0, 0],
        y: [s * 0.45, 1, 0.1],
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 1,
        color: PINK,
        bone: ear,
        name: "earInner",
        detail: 0.4,
      },
    );
    // orange ear tag
    b.extrude(chamfered(0.026, 0.02, 0.008), {
      at: e.local([s * 0.07, 0.1, 0.0]),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: ORANGE,
      bone: ear,
      name: "earTag",
      detail: 0.4,
    });
    glow(b.part(new THREE.SphereGeometry(0.011, 6, 4), GLOWC, { bone: ear, at: e.local([s * 0.087, 0.1, 0.0]), name: "earTagLight" }));
    // ear fringe
    const earS = b.surface(e);
    b.cards(earS.scatter(8, { rng: rng(30 + s), minDist: 0.03, filter: (h) => h.at.y > 1.56 }), FRINGE, {
      size: [0.025, 0.05],
      lean: 25,
      vary: 0.25,
      rng: rng(31),
      flow: [0, 0.4, 0.4],
    });
  }

  // bristles on the muzzle and chin
  b.cards(
    headS.scatter(34, {
      rng: rng(5),
      minDist: 0.07,
      filter: (h) => h.at.z > 1.5 && h.n.y > 0.3 && h.at.y > 1.15 && Math.abs(h.at.x) < 0.4,
    }),
    BRISTLE,
    { size: [0.03, 0.08], lean: 45, flow: [0, 0.3, 1], vary: 0.3, rng: rng(6), bend: 15 },
  );
  b.cards(
    headS.scatter(24, {
      rng: rng(7),
      minDist: 0.07,
      filter: (h) => h.at.z > 1.55 && h.n.y < -0.25 && h.at.y < 0.85,
    }),
    BRISTLE,
    { size: [0.03, 0.07], lean: 40, flow: [0, -0.3, 1], vary: 0.3, rng: rng(8) },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Tail
  const tailTube = b.sweep(tail, (t) => [0.115 - 0.05 * t, 0.075 - 0.025 * t], {
    color: skin,
    sides: 10,
    caps: "round",
    name: "tail",
  });
  const tailS = b.surface(tailTube);
  b.sweep(tailS.loop(tail.joints[2], { lift: 0.01 }), 0.016, { color: WHITE, sides: 6, name: "tailBand" });
  b.sweep(tailS.loop(tail.at(0.97), { lift: 0.004 }), 0.011, { color: ORANGE, sides: 6, name: "tailBandAccent" });
  b.cards(
    tailS.scatter(30, { rng: rng(11), minDist: 0.025, filter: (h) => h.at.z < -1.74 }),
    BRISTLE,
    { size: [0.025, 0.07], lean: 50, flow: [0, -1, -0.4], vary: 0.3, rng: rng(12) },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Legs: sweeps + feet + toes
  const makeLeg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const x = s * (front ? 0.47 : 0.42);
    const z = front ? 0.5 : -0.95;
    const root: [number, number, number] = [x, 0.92, z];
    const target: [number, number, number] = [x, 0.17, z + 0.02];
    const pts = limb(root, target, front ? [0.4, 0.38] : [0.4, 0.38], [0, 0, front ? -1 : 1]);
    const names = front ? [`shoulder${side}`, `elbow${side}`, `hand${side}`] : [`hip${side}`, `knee${side}`, `foot${side}`];
    const chain = b.chain(`leg${front ? "F" : "H"}${side}`, pts, {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
      contact: [x, 0, z + 0.04],
    });
    const radii = front ? [0.31, 0.28, 0.235, 0.21, 0.2] : [0.3, 0.27, 0.23, 0.21, 0.2];
    const tube = b.sweep(chain, radii, { color: skin, sides: 10, caps: "round", name: `leg${front ? "F" : "H"}${side}` });
    const tip = chain.tip!;
    // foot pad
    const fz = z + 0.05;
    b.part(new THREE.SphereGeometry(1, 12, 8), FOOT, { bone: tip, at: [x, 0.115, fz], scale: [0.225, 0.115, 0.29], name: "foot" });
    // toes
    const dx = [-0.135, -0.047, 0.047, 0.135];
    dx.forEach((ox, i) => {
      const k = i + 1;
      const tz = fz + 0.235 - Math.abs(ox) * 0.7;
      const toeAt: [number, number, number] = [x + ox * s, 0.065, tz];
      const toe = b.joint(`toe${front ? "F" : "H"}${side}${k}`, {
        parent: tip,
        at: toeAt,
        aim: [toeAt[0], toeAt[1] - 0.01, toeAt[2] + 0.1],
        role: "digit",
      });
      b.part(new THREE.SphereGeometry(0.068, 8, 6), FOOT, { bone: toe, at: toeAt, scale: [0.95, 0.85, 1.2], name: "toe" });
      b.part(new THREE.SphereGeometry(0.05, 6, 5), HOOF, {
        bone: toe,
        at: [toeAt[0], 0.045, toeAt[2] + 0.07],
        scale: [1.05, 0.62, 0.85],
        name: "nail",
      });
      b.part(new THREE.SphereGeometry(0.02, 5, 4), PINK_DK, {
        bone: toe,
        at: [toeAt[0], 0.075, toeAt[2] + 0.025],
        scale: [1.2, 0.5, 0.8],
        name: "toeTip",
      });
    });
    // anklet: white cuff with an orange stripe and a light
    const legS = b.surface(tube);
    const cuffY = 0.33;
    b.sweep(legS.loop([x, cuffY, z], { lift: 0.012 }), [0.02, 0.014], { section: "box", color: NAVY, name: "cuffBase" });
    b.sweep(legS.loop([x, cuffY + 0.035, z], { lift: 0.018 }), 0.019, { color: WHITE, sides: 8, name: "cuff" });
    b.sweep(legS.loop([x, cuffY - 0.028, z], { lift: 0.014 }), 0.009, { color: ORANGE, sides: 6, name: "cuffStripe" });
    glow(
      b.part(new THREE.BoxGeometry(0.03, 0.014, 0.016), GLOWC, {
        bone: chain.joints[1],
        at: [x + s * 0.0, cuffY + 0.035, z + 0.225],
        name: "cuffLight",
      }),
    );
  };
  for (const s of [1, -1]) {
    makeLeg(s, true);
    makeLeg(s, false);
  }

  // ------------------------------------------------------------------------------------------------------------
  // Support pack on the back
  const backY = (z: number) => bodyS.ray([0, 3, z], [0, -1, 0])!.at.y;
  const packZ = -0.12;
  const yTop = backY(packZ);
  const packBone = spine.joints[1];
  b.extrude(chamfered(0.34, 0.46, 0.12), {
    at: [0, yTop + 0.015, packZ],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.14,
    bevel: 0.025,
    color: packBase,
    bone: packBone,
    name: "packBase",
  });
  b.extrude(chamfered(0.15, 0.32, 0.07), {
    at: [0, yTop + 0.1, packZ - 0.02],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.09,
    bevel: 0.02,
    color: packTop,
    bone: packBone,
    name: "packTop",
  });
  // canisters
  for (const s of [1, -1]) {
    const cx = s * 0.255;
    const cy = yTop + 0.115;
    const za = packZ - 0.34;
    const zb = packZ + 0.34;
    b.rod([cx, cy, za], [cx, cy, zb], 0.082, { bone: packBone, color: canisterPaint, sides: 10, name: "canister" });
    for (const [z, w] of [
      [za + 0.03, 0.05],
      [zb - 0.03, 0.05],
    ] as const) {
      b.rod([cx, cy, z - w / 2], [cx, cy, z + w / 2], 0.09, { bone: packBone, color: ORANGE, sides: 10, name: "canisterRing" });
    }
    b.rod([cx, cy, packZ - 0.03], [cx, cy, packZ + 0.03], 0.087, { bone: packBone, color: NAVY, sides: 10, name: "canisterBand" });
    b.part(new THREE.SphereGeometry(0.082, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), NAVY, {
      bone: packBone,
      at: [cx, cy, zb],
      dir: [0, 0, 1],
      name: "canisterCap",
    });
    b.part(new THREE.SphereGeometry(0.082, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), NAVY, {
      bone: packBone,
      at: [cx, cy, za],
      dir: [0, 0, -1],
      name: "canisterCap",
    });
    // glow strip along the canister
    glow(
      b.rod([cx, cy + 0.083, packZ - 0.2], [cx, cy + 0.083, packZ + 0.2], [0.012, 0.012], {
        bone: packBone,
        color: GLOWC,
        sides: 4,
        name: "canisterGlow",
      }),
    );
  }
  // status lights on the module
  [-0.06, 0, 0.06].forEach((ox, i) =>
    glow(
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), i === 1 ? GLOWC : ORANGE, {
        bone: packBone,
        at: [ox, yTop + 0.148, packZ + 0.1],
        name: "statusLight",
      }),
    ),
  );
  // antenna
  const antBase: [number, number, number] = [0.07, yTop + 0.145, packZ - 0.28];
  b.rod(antBase, [0.09, yTop + 0.38, packZ - 0.34], [0.009, 0.005], { bone: packBone, color: STEEL, sides: 5, name: "antenna" });
  glow(b.part(new THREE.SphereGeometry(0.02, 8, 6), GLOWC, { bone: packBone, at: [0.09, yTop + 0.395, packZ - 0.345], name: "antennaTip" }), 1.5);
  b.rod(antBase, [0.07, yTop + 0.17, packZ - 0.28], [0.022, 0.022], { bone: packBone, color: NAVY, sides: 6, name: "antennaMount" });

  // bolts on the pack
  const bolts: THREE.BufferGeometry[] = [];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      bolts.push(new THREE.SphereGeometry(0.014, 5, 3).translate(sx * 0.26, yTop + 0.082, packZ + sz * 0.39));
      bolts.push(new THREE.SphereGeometry(0.014, 5, 3).translate(sx * 0.115, yTop + 0.146, packZ - 0.02 + sz * 0.27));
    }
  b.part(mergeGeometries(bolts)!, STEEL, { bone: packBone, at: [0, 0, 0], name: "packBolts" });

  // straps round the barrel, with buckles on the flanks
  const strapAt = (z: number, label: string) => {
    const loop = bodyS.loop([0, 1.0, z], { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(loop, () => [0.04, 0.012], { section: "box", color: NAVY, name: `strap${label}` });
    b.sweep(bodyS.loop([0, 1.0, z], { dir: [0, 0, 1], lift: 0.024 }), () => [0.015, 0.007], {
      section: "box",
      color: ORANGE,
      name: `strapStripe${label}`,
    });
    const studs: THREE.BufferGeometry[] = [];
    const lp = bodyS.loop([0, 1.0, z], { dir: [0, 0, 1], lift: 0.03 });
    for (let i = 0; i < 10; i++) {
      const q = lp.at((i + 0.5) / 10);
      studs.push(new THREE.SphereGeometry(0.014, 5, 3).translate(q.x, q.y, q.z));
    }
    b.part(mergeGeometries(studs)!, STEEL, { bone: packBone, at: [0, 0, 0], name: `strapStuds${label}` });
    for (const s of [1, -1]) {
      const hit = bodyS.around([0, 1.0, z]).at(s * 90, -12);
      if (!hit) continue;
      b.stick(new THREE.BoxGeometry(0.13, 0.045, 0.1), NAVY, hit, { embed: 0.15, bone: packBone, name: "buckle" });
      b.stick(new THREE.BoxGeometry(0.085, 0.032, 0.06), STEEL, hit.moved([0, 0.012, 0]), { embed: 0.15, bone: packBone, name: "buckleFace" });
      b.stick(new THREE.BoxGeometry(0.02, 0.026, 0.05), ORANGE, hit.moved([0, 0.026, 0]), { embed: 0.1, bone: packBone, name: "buckleTab" });
    }
  };
  strapAt(-0.45, "Rear");
  strapAt(0.22, "Front");

  // collar with a glowing medallion on each side
  const collarZ = 0.93;
  b.sweep(bodyS.loop([0, 1.08, collarZ], { dir: [0, 0, 1], lift: 0.016 }), () => [0.05, 0.016], {
    section: "box",
    color: NAVY,
    name: "collar",
  });
  b.sweep(bodyS.loop([0, 1.08, collarZ], { dir: [0, 0, 1], lift: 0.03 }), () => [0.014, 0.007], {
    section: "box",
    color: ORANGE,
    name: "collarStripe",
  });
  for (const s of [1, -1]) {
    const hit = bodyS.around([0, 1.08, collarZ]).at(s * 90, 0);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 6), NAVY, hit.moved([0, 0.02, 0]), { embed: 0.2, bone: neck.joints[1], name: "medallion" });
    b.stick(new THREE.CylinderGeometry(0.062, 0.062, 0.02, 6), WHITE, hit.moved([0, 0.035, 0]), { embed: 0.2, bone: neck.joints[1], name: "medallionFace" });
    glow(b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 10), ORANGE, hit.moved([0, 0.05, 0]), { embed: 0.2, bone: neck.joints[1], name: "medallionCore" }), 1.3);
  }

  // side flank plates: slim white armour tiles with navy trim, an orange stripe and vents
  const flankPaint = paint((_p, n, st) => {
    if (Math.abs(n.x) < 0.5) return NAVY;
    const [u, v] = st;
    const au = Math.abs(u);
    const av = Math.abs(v);
    if (au > 0.205 || av > 0.108) return NAVY_LT;
    if (av < 0.014) return ORANGE;
    if (av < 0.02) return NAVY;
    if (v > 0.03 && v < 0.09 && u > -0.12 && u < 0.12 && Math.sin(u * 150) > 0.2) return STEEL;
    if (v < -0.03 && v > -0.09 && au < 0.13 && Math.abs(Math.abs(u) - 0.065) < 0.004) return NAVY_LT;
    return mix(WHITE, STEEL, 0.2);
  });
  for (const s of [1, -1]) {
    const hit = bodyS.around([0, 1.05, -0.12]).at(s * 90, 8);
    if (!hit) continue;
    b.extrude(chamfered(0.23, 0.12, 0.05), {
      at: hit.moved([0, 0.018, 0]).at,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.012,
      color: flankPaint,
      bone: spine.joints[1],
      name: "flankPlate",
    });
    glow(b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), ORANGE, hit.moved([0, 0.04, 0.0]), { embed: 0.3, bone: spine.joints[1], name: "flankLight" }));
  }

  // utility pouches hanging off the rear strap
  for (const s of [1, -1]) {
    const hit = bodyS.around([0, 1.0, -0.66]).at(s * 90, -4);
    if (!hit) continue;
    b.stick(new THREE.BoxGeometry(0.15, 0.09, 0.15), NAVY_LT, hit, { embed: 0.2, bone: hips, name: "pouch" });
    b.stick(new THREE.BoxGeometry(0.14, 0.02, 0.18), NAVY, hit.moved([0, 0.058, 0]), { embed: 0.2, bone: hips, name: "pouchFlap" });
    b.stick(new THREE.BoxGeometry(0.04, 0.012, 0.05), ORANGE, hit.moved([0, 0.07, 0.0]), { embed: 0.2, bone: hips, name: "pouchTab" });
  }

  return b.root;
}
