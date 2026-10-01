// Broom Witchling: a 0.7 m chibi witch with a floppy star-and-moon hat, round glasses, a cape, striped stockings and
// chunky boots, gripping a broom taller than herself while a black kitten rides her hat brim.
// Cute flat low-poly: every part faceted, flat colours plus SVG drawings (faces, stars, tufts, stickers).
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import type { Chain } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Broom Witchling",
  description:
    "A tiny chibi witch with an oversized floppy star-and-moon hat, big round glasses, a cape, striped stockings and chunky boots, holding a broom taller than herself with a black kitten riding on her hat brim. Cute flat low-poly with SVG faces and stickers.",
};

// Palette: candy on violet.
const SKIN = "#ffe4d4";
const SKIN_DEEP = "#f7b79f";
const HAIR = "#6fe3c6";
const HAT = "#9577ff";
const HAT_BRIM = "#8465f2";
const CAPE = "#6b53e0";
const BAND = "#ff6fae";
const GOLD = "#ffc93c";
const DRESS = "#ffab5c";
const CREAM = "#fff3dc";
const PINK = "#ff7eb6";
const BOOT = "#5b3fa6";
const SOLE = "#2f2160";
const MOUTH_IN = "#8a2e52";
const CAT = "#2c2542";
const CAT_INNER = "#ff9ec2";
const STRAW_A = "#ffd45c";
const STRAW_B = "#f5b842";
const WOOD = "#dba062";
const WOOD_DEEP = "#b97a45";
const LILAC = "#e9e2ff";
const INK = "#2a1848";

const DEG = Math.PI / 180;

// SVG helpers: n-point stars as polygons.
const starPoints = (cx: number, cy: number, R: number, r: number, n = 5, rot = -90) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = (rot + (i * 180) / n) * DEG;
    const k = i % 2 ? r : R;
    return `${(cx + k * Math.cos(a)).toFixed(1)},${(cy + k * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
const star = (cx: number, cy: number, R: number, fill: string, rot = -90) =>
  `<polygon points="${starPoints(cx, cy, R, R * 0.46, 5, rot)}" fill="${fill}"/>`;
const spark = (cx: number, cy: number, R: number, fill: string) =>
  `<polygon points="${starPoints(cx, cy, R, R * 0.26, 4)}" fill="${fill}"/>`;
const OPEN = `xmlns="http://www.w3.org/2000/svg"`;

function starOutline(R: number, r: number): OutlinePoint[] {
  return Array.from({ length: 10 }, (_, i): OutlinePoint => {
    const a = (90 + i * 36) * DEG;
    const k = i % 2 ? r : R;
    return [k * Math.cos(a), k * Math.sin(a), "sharp"];
  });
}

export default function build() {
  const b = createBuilder({ name: "broomWitchling" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ball = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

  // ------------------------------------------------------------------ drawings
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64" ${OPEN}>
      <circle cx="32" cy="32" r="30" fill="${INK}"/>
      <circle cx="32" cy="36" r="24" fill="#7c5cf0"/>
      <path d="M12 40 A22 20 0 0 0 52 40 A22 26 0 0 1 12 40Z" fill="#b59cff"/>
      <circle cx="32" cy="32" r="12" fill="#1b0f33"/>
      <circle cx="21" cy="20" r="9" fill="#ffffff"/>
      <circle cx="43" cy="44" r="4.5" fill="#ffffff"/>
      <path d="M4 18 L-2 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const blushTex = svg(
    `<svg viewBox="0 0 48 26" ${OPEN}>
      <ellipse cx="24" cy="13" rx="22" ry="11" fill="#ff8fa9"/>
      <path d="M13 6 L17 20 M24 5 L28 21 M35 6 L39 20" stroke="#ff5f86" stroke-width="3.4" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const mouthTex = svg(
    `<svg viewBox="0 0 48 30" ${OPEN}>
      <path d="M8 8 Q13 22 24 14 Q35 22 40 8" stroke="${MOUTH_IN}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 17 Q24 27 27 17Z" fill="#ff7a9a"/>
    </svg>`,
    { size: 192 },
  );
  const fringeTex = svg(
    `<svg viewBox="0 0 200 90" ${OPEN}>
      <path d="M0 0 H200 V52 L182 84 L166 50 L148 88 L132 48 L116 84 L100 46 L84 84 L68 48 L52 88 L34 50 L18 84 L0 52 Z" fill="${HAIR}"/>
    </svg>`,
    { size: 256 },
  );
  const glintTex = svg(
    `<svg viewBox="0 0 64 64" ${OPEN}>
      <path d="M14 30 L30 14" stroke="#eafcff" stroke-width="6" stroke-linecap="round"/>
      <path d="M12 42 L42 12" stroke="#eafcff" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const moonTex = svg(
    `<svg viewBox="0 0 120 120" ${OPEN}>
      <path d="M78 8 A52 52 0 1 0 110 86 A42 42 0 1 1 78 8Z" fill="#fff0a0"/>
      ${star(92, 26, 14, GOLD)}
      ${star(104, 62, 8, PINK)}
      ${star(40, 104, 10, GOLD)}
      ${spark(112, 94, 9, CREAM)}
      <circle cx="62" cy="112" r="4" fill="${CREAM}"/>
    </svg>`,
    { size: 256 },
  );
  const crownStarsTex = svg(
    `<svg viewBox="0 0 100 100" ${OPEN}>
      ${star(30, 30, 18, GOLD)}
      ${star(72, 62, 13, PINK, -80)}
      ${spark(74, 18, 11, CREAM)}
      ${star(28, 78, 8, CREAM)}
      <circle cx="54" cy="44" r="3.5" fill="${CREAM}"/>
    </svg>`,
    { size: 192 },
  );
  const brimTex = svg(
    `<svg viewBox="0 0 120 120" ${OPEN}>
      ${star(34, 38, 22, GOLD)}
      ${star(86, 30, 12, PINK, -70)}
      ${spark(84, 84, 16, CREAM)}
      ${star(26, 92, 9, CREAM)}
      <circle cx="60" cy="62" r="4" fill="${PINK}"/>
      <circle cx="106" cy="64" r="3.5" fill="${GOLD}"/>
    </svg>`,
    { size: 256 },
  );
  const skirtTex = svg(
    `<svg viewBox="0 0 100 80" ${OPEN}>
      ${star(24, 22, 11, CREAM)}
      <circle cx="62" cy="14" r="6" fill="${PINK}"/>
      ${star(76, 52, 9, CREAM, -70)}
      <circle cx="30" cy="62" r="6" fill="${PINK}"/>
      <circle cx="52" cy="40" r="3.5" fill="${CREAM}"/>
    </svg>`,
    { size: 192 },
  );
  const capeTex = svg(
    `<svg viewBox="0 0 100 100" ${OPEN}>
      ${star(28, 24, 14, GOLD)}
      ${spark(74, 40, 14, CREAM)}
      ${star(40, 76, 9, PINK)}
      ${star(84, 84, 7, GOLD)}
      <circle cx="56" cy="14" r="3.5" fill="${CREAM}"/>
    </svg>`,
    { size: 192 },
  );
  const buckleTex = svg(
    `<svg viewBox="0 0 40 40" ${OPEN}>
      <rect x="0" y="12" width="40" height="16" fill="${PINK}"/>
      <rect x="11" y="6" width="18" height="28" rx="3" fill="${GOLD}"/>
      <rect x="16" y="12" width="8" height="16" fill="${PINK}"/>
    </svg>`,
    { size: 128 },
  );
  const stickerStarTex = svg(
    `<svg viewBox="0 0 60 60" ${OPEN}>
      <circle cx="30" cy="30" r="27" fill="${CREAM}"/>
      ${star(30, 31, 21, PINK)}
    </svg>`,
    { size: 128 },
  );
  const stickerMoonTex = svg(
    `<svg viewBox="0 0 60 60" ${OPEN}>
      <circle cx="30" cy="30" r="27" fill="${CAPE}"/>
      <path d="M36 10 A21 21 0 1 0 50 38 A17 17 0 1 1 36 10Z" fill="#fff0a0"/>
      ${star(44, 18, 6, GOLD)}
    </svg>`,
    { size: 128 },
  );
  const sparkleTex = svg(
    `<svg viewBox="0 0 48 48" ${OPEN}>
      ${spark(24, 24, 23, GOLD)}
      ${spark(24, 24, 10, CREAM)}
    </svg>`,
    { size: 128 },
  );
  const strawTex = svg(
    `<svg viewBox="0 0 32 64" ${OPEN}>
      <polygon points="2,64 7,20 11,64" fill="${STRAW_A}"/>
      <polygon points="9,64 17,0 23,64" fill="${STRAW_B}"/>
      <polygon points="20,64 27,26 31,64" fill="${STRAW_A}"/>
    </svg>`,
    { size: 128 },
  );
  const furTex = svg(
    `<svg viewBox="0 0 32 48" ${OPEN}>
      <polygon points="0,48 6,8 14,48" fill="${CAT}"/>
      <polygon points="9,48 18,0 28,48" fill="${CAT}"/>
      <polygon points="20,48 30,14 32,48" fill="${CAT}"/>
    </svg>`,
    { size: 96 },
  );
  const catEyeTex = svg(
    `<svg viewBox="0 0 64 64" ${OPEN}>
      <circle cx="32" cy="32" r="30" fill="#c6f24a"/>
      <circle cx="32" cy="36" r="30" fill="#c6f24a"/>
      <ellipse cx="33" cy="33" rx="8" ry="22" fill="#1b1530"/>
      <circle cx="22" cy="20" r="8" fill="#ffffff"/>
      <circle cx="42" cy="46" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 160 },
  );
  const catMouthTex = svg(
    `<svg viewBox="0 0 40 26" ${OPEN}>
      <path d="M6 6 Q11 20 20 11 Q29 20 34 6" stroke="#ff9ec2" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { size: 160 },
  );

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.205, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.235, 0],
      [0, 0.29, 0],
      [0, 0.345, 0],
    ]),
    { parent: hips, names: ["spine", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.335, 0], dir: [0, 1, 0], role: "neck" });
  const HEAD_AT = V(0, 0.37, 0);
  const head = b.joint("head", { parent: neck, at: HEAD_AT, dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.4, -0.03],
    aim: [0, 0.385, 0.09],
    role: "jaw",
    group: "head",
  });

  // ------------------------------------------------------------------ head (cranium + separate jaw)
  const HC = V(0, 0.442, 0);
  const HR: [number, number, number] = [0.128, 0.112, 0.12];
  const SEAM = 112;
  const seam = SEAM * DEG;
  const cranium = b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, seam), SKIN, {
    bone: head,
    at: HC,
    scale: HR,
    flat: true,
    name: "cranium",
  });
  const jawPart = b.part(new THREE.SphereGeometry(1, 10, 3, 0, Math.PI * 2, seam, Math.PI - seam), SKIN, {
    bone: jaw,
    at: HC,
    scale: HR,
    flat: true,
    name: "chin",
  });
  const seamY = Math.cos(seam);
  const seamR = Math.sin(seam);
  b.part(new THREE.CircleGeometry(seamR, 10).rotateX(Math.PI / 2).translate(0, seamY, 0), MOUTH_IN, {
    bone: head,
    at: HC,
    scale: HR,
    flat: true,
    name: "palate",
  });
  b.part(new THREE.CircleGeometry(seamR, 10).rotateX(-Math.PI / 2).translate(0, seamY, 0), MOUTH_IN, {
    bone: jaw,
    at: HC,
    scale: HR,
    flat: true,
    name: "tongueBed",
  });

  // Face drawings.
  for (const s of [1, -1]) {
    b.decal(cranium, eyeTex, {
      at: [s * 0.058, 0.44, 0.1],
      dir: [-(-s * 0.12), 0, 1],
      size: [0.056, 0.056],
      mirror: s > 0,
      lift: 0.002,
    });
    b.decal([cranium, jawPart], blushTex, {
      at: [s * 0.088, 0.405, 0.075],
      dir: [-(-s * 0.55), 0, 1],
      size: [0.042, 0.023],
      lift: 0.002,
      segments: [8, 4],
    });
  }
  b.decal(jawPart, mouthTex, { at: [0, 0.382, 0.09], dir: [0, -0.1, 1], size: [0.046, 0.029], lift: 0.002 });
  b.part(ball(6, 4), SKIN_DEEP, {
    bone: head,
    at: [0, 0.421, 0.119],
    scale: [0.0085, 0.007, 0.007],
    flat: true,
    name: "nose",
  });

  // Fringe of hair on the forehead, and the bob: back and sides only.
  b.decal(cranium, fringeTex, {
    at: [0, 0.522, 0.1],
    dir: [0, 0.15, 1],
    size: [0.2, 0.09],
    lift: 0.0035,
    segments: [14, 5],
  });
  b.part(new THREE.SphereGeometry(1, 10, 5, 0.72 * Math.PI, 1.56 * Math.PI, 0, 122 * DEG), HAIR, {
    bone: head,
    at: HC.clone().add(V(0, 0.002, -0.004)),
    scale: [0.138, 0.12, 0.13],
    flat: true,
    name: "hairBob",
  });

  // Glasses.
  for (const s of [1, -1]) {
    const eyeC: [number, number, number] = [s * 0.06, 0.44, 0.111];
    b.part(new THREE.TorusGeometry(0.04, 0.0058, 5, 12), GOLD, {
      bone: head,
      at: eyeC,
      rotation: [0, s * 30, 0],
      flat: true,
      name: `glasses${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CircleGeometry(0.037, 12), "#ffffff", {
      bone: head,
      at: [eyeC[0] + s * 0.001, eyeC[1], eyeC[2] + 0.001],
      rotation: [0, s * 30, 0],
      texture: glintTex,
      name: "glint",
    });
    b.rod([s * 0.094, 0.446, 0.092], [s * 0.126, 0.446, 0.034], 0.0036, {
      bone: head,
      color: GOLD,
      sides: 4,
      smooth: false,
    });
  }
  b.rod([0.026, 0.446, 0.132], [-0.026, 0.446, 0.132], 0.0042, { bone: head, color: GOLD, sides: 4, smooth: false });

  // ------------------------------------------------------------------ pigtails
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tail = b.chain(
      `pigtail${side}`,
      catmull([
        [s * 0.118, 0.425, -0.05],
        [s * 0.165, 0.395, -0.06],
        [s * 0.195, 0.355, -0.05],
        [s * 0.205, 0.31, -0.03],
      ]),
      { parent: head, names: [`pigtail${side}1`, `pigtail${side}2`, `pigtail${side}3`], group: "head" },
    );
    b.sweep(tail, (t) => 0.016 + 0.024 * Math.sin(Math.PI * Math.min(1, t * 1.15)), {
      color: HAIR,
      sides: 6,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "pigtail",
    });
    const tie = V(s * 0.136, 0.414, -0.052);
    b.part(ball(6, 4), PINK, { bone: tail.joints[0], at: tie, scale: 0.016, flat: true, name: "pigtailTie" });
    for (const k of [1, -1]) {
      b.part(new THREE.ConeGeometry(0.018, 0.044, 3), PINK, {
        bone: tail.joints[0],
        at: tie.clone().add(V(s * 0.012, k * 0.014, 0)),
        dir: [s * 0.5, k * 1, 0.1],
        flat: true,
        name: "pigtailBow",
      });
    }
  }

  // ------------------------------------------------------------------ hat (brim, floppy crown, band)
  const TILT = 28 * DEG;
  const H = V(0, 0.497, -0.012);
  const U = V(0, Math.cos(TILT), -Math.sin(TILT));
  const F = V(0, Math.sin(TILT), Math.cos(TILT));
  const hp = (up: number, fwd: number) => H.clone().addScaledVector(U, up).addScaledVector(F, fwd);
  const brim = b.lathe(
    [
      [0, 0.012],
      [0.13, 0.012],
      [0.17, 0.002],
      [0.205, -0.024],
      [0.2, -0.034],
      [0.165, -0.02],
      [0.13, -0.004],
      [0, -0.004],
    ],
    { at: H, axis: U, segments: 10, color: HAT_BRIM, bone: head, name: "brim" },
  );
  const bandAt = hp(0.03, 0);
  b.lathe(
    [
      [0.112, 0],
      [0.14, 0],
      [0.134, 0.03],
      [0.108, 0.03],
    ],
    { at: bandAt, axis: U, segments: 8, color: BAND, bone: head, name: "hatBand" },
  );
  b.part(new THREE.BoxGeometry(0.038, 0.034, 0.008), GOLD, {
    bone: head,
    at: hp(0.045, 0.142),
    dir: F,
    axis: "z",
    flat: true,
    name: "buckle",
  });
  b.part(new THREE.BoxGeometry(0.022, 0.018, 0.01), BAND, {
    bone: head,
    at: hp(0.045, 0.145),
    dir: F,
    axis: "z",
    flat: true,
    name: "buckleHole",
  });

  const c2 = hp(0.17, -0.012);
  const c3 = c2.clone().add(V(-0.012, 0.03, -0.04));
  const c4 = c3.clone().add(V(-0.055, 0.0, -0.035));
  const c5 = c4.clone().add(V(-0.05, -0.05, -0.005));
  const hatChain = b.chain("hat", catmull([hp(-0.012, 0), hp(0.07, -0.004), c2, c3, c4, c5]), {
    parent: head,
    group: "hat",
  });
  const crown = b.sweep(hatChain, [0.134, 0.112, 0.088, 0.064, 0.04, 0.012], {
    color: HAT,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
    name: "crown",
  });
  const pom = hatChain.joints[hatChain.joints.length - 1];
  b.extrude(starOutline(0.032, 0.014), {
    at: c5.clone().add(V(0, -0.012, 0)),
    thickness: 0.012,
    x: [1, 0, 0],
    y: [0, 1, 0],
    bone: pom,
    color: GOLD,
    name: "hatStar",
  });

  // Moon and stars on the hat.
  b.decal(crown, moonTex, { at: [0.0, 0.6, 0.06], dir: [0, 0.1, 1], size: [0.15, 0.15], lift: 0.002, segments: 14 });
  b.decal(crown, crownStarsTex, {
    at: [0.11, 0.6, -0.04],
    dir: [1, 0.05, 0],
    size: [0.12, 0.12],
    lift: 0.002,
    segments: 12,
    up: [0, 1, 0],
  });
  b.decal(crown, crownStarsTex, {
    at: [-0.11, 0.6, -0.04],
    dir: [-1, 0.05, 0],
    size: [0.12, 0.12],
    lift: 0.002,
    segments: 12,
    mirror: true,
  });
  for (const [bx, bz, roll] of [
    [-0.13, 0.1, 20],
    [0.0, -0.165, 140],
    [-0.15, -0.09, 250],
  ] as const)
    b.decal(brim, brimTex, {
      at: [bx, 0.5, bz],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.12, 0.12],
      lift: 0.002,
      roll,
      segments: 12,
    });

  // ------------------------------------------------------------------ torso, dress, cape
  b.sweep(
    catmull([
      [0, 0.195, 0],
      [0, 0.265, 0],
      [0, 0.338, 0],
    ]),
    [0.07, 0.056, 0.056],
    {
      bone: [hips, spine],
      color: DRESS,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "torso",
    },
  );
  const skirt = b.lathe(
    [
      [0, 0.28],
      [0.062, 0.275],
      [0.084, 0.245],
      [0.112, 0.195],
      [0.122, 0.18],
      [0.128, 0.165],
      [0, 0.165],
    ],
    { at: [0, 0, 0], segments: 8, color: DRESS, bone: hips, name: "skirt" },
  );
  b.lathe(
    [
      [0.114, 0.18],
      [0.1265, 0.18],
      [0.1325, 0.165],
      [0.12, 0.165],
    ],
    { at: [0, 0, 0], segments: 8, color: CREAM, bone: hips, name: "hem" },
  );
  for (const a of [0, 55, -55, 110, -110]) {
    const r = 0.11;
    b.decal(skirt, skirtTex, {
      at: [Math.sin(a * DEG) * r, 0.212, Math.cos(a * DEG) * r],
      dir: [-(-Math.sin(a * DEG)), 0, -(-Math.cos(a * DEG))],
      size: [0.11, 0.088],
      lift: 0.002,
      segments: [10, 8],
    });
  }

  // Cape: three hanging chains skinned between two membranes.
  const capeEdge = (name: string, pts: number[][]) =>
    b.chain(name, polyline(pts), { parent: chest, names: [`${name}1`, `${name}2`], group: "cape" });
  const capeL = capeEdge("capeL", [
    [0.072, 0.322, -0.03],
    [0.118, 0.23, -0.105],
    [0.16, 0.14, -0.13],
  ]);
  const capeM = capeEdge("capeM", [
    [0, 0.33, -0.063],
    [0, 0.23, -0.14],
    [0, 0.118, -0.178],
  ]);
  const capeR = capeEdge("capeR", [
    [-0.072, 0.322, -0.03],
    [-0.118, 0.23, -0.105],
    [-0.16, 0.14, -0.13],
  ]);
  const capeParts = [
    ...b.membrane(capeL, capeM, { color: CAPE, thickness: 0.01, rows: 3, cols: 6, scallop: 0.1, name: "capeLeft" }),
    ...b.membrane(capeM, capeR, { color: CAPE, thickness: 0.01, rows: 3, cols: 6, scallop: 0.1, name: "capeRight" }),
  ];
  for (const [ax, az, dy] of [
    [0.05, -0.15, 0.225],
    [-0.055, -0.135, 0.17],
  ] as const) {
    b.decal(capeParts, capeTex, {
      at: [ax, dy, az],
      dir: [0, -0.05, -1],
      size: [0.1, 0.1],
      lift: 0.002,
      segments: 10,
    });
  }

  // Collar, bow tie and star brooch.
  const collar = b.ring(frame([0, 0.33, 0.0], [0, 1, 0]), { count: 10, radius: 0.058 });
  b.sweep(catmull(collar.items, { closed: true }), 0.012, {
    bone: chest,
    color: CAPE,
    sides: 5,
    smooth: false,
    name: "collar",
  });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [s * 0.04, 0.022],
        [s * 0.042, -0.022],
      ],
      { at: [0, 0.3, 0.056], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bone: chest, color: BAND, name: "bow" },
    );
  }
  b.part(ball(6, 4), BAND, { bone: chest, at: [0, 0.3, 0.06], scale: 0.013, flat: true, name: "bowKnot" });
  const belt = b.ring(frame([0, 0.262, 0], [0, 1, 0]), { count: 12, radius: 0.0745 });
  b.sweep(catmull(belt.items, { closed: true }), 0.0075, {
    bone: hips,
    color: PINK,
    sides: 5,
    smooth: false,
    name: "belt",
  });
  b.extrude(starOutline(0.02, 0.009), {
    at: [0, 0.262, 0.081],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    bone: hips,
    color: GOLD,
    name: "brooch",
  });

  // ------------------------------------------------------------------ legs, stockings, boots
  const armSide = (s: number) => (s > 0 ? "L" : "R");
  for (const s of [1, -1]) {
    const k = armSide(s);
    const x = s * 0.048;
    const leg = b.chain(
      `leg${k}`,
      polyline([
        [x, 0.195, 0],
        [x, 0.13, 0.004],
        [x, 0.075, 0],
        [x, 0.04, 0.05],
      ]),
      { parent: hips, names: [`hip${k}`, `knee${k}`, `ankle${k}`, `ball${k}`], role: "leg", contact: [x, 0, 0.03] },
    );
    const STOCK_LEN = 0.12;
    b.sweep(
      polyline([
        [x, 0.195, 0],
        [x, 0.13, 0.004],
        [x, 0.075, 0],
      ]),
      0.031,
      {
        bone: leg,
        color: (t) => (Math.floor((t * STOCK_LEN) / 0.0115) % 2 ? CREAM : PINK),
        sides: 8,
        smooth: false,
        caps: "flat",
        name: "stocking",
      },
    );
    const ankle = leg.joints[2];
    const toe = leg.joints[3];
    const shaft = b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.062, 8), BOOT, {
      bone: ankle,
      at: [x, 0.07, 0],
      flat: true,
      name: `bootShaft${k}`,
    });
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.014, 8), CREAM, {
      bone: ankle,
      at: [x, 0.104, 0],
      flat: true,
      name: "bootCuff",
    });
    b.part(ball(), BOOT, { bone: ankle, at: [x, 0.04, -0.004], scale: [0.046, 0.04, 0.05], flat: true, name: "heel" });
    b.part(ball(), BOOT, { bone: toe, at: [x, 0.036, 0.046], scale: [0.045, 0.036, 0.048], flat: true, name: "toe" });
    b.part(ball(), SOLE, {
      bone: ankle,
      at: [x, 0.012, -0.004],
      scale: [0.048, 0.016, 0.052],
      flat: true,
      name: "soleHeel",
    });
    b.part(ball(), SOLE, {
      bone: toe,
      at: [x, 0.012, 0.046],
      scale: [0.047, 0.016, 0.05],
      flat: true,
      name: "soleToe",
    });
    b.decal(shaft, buckleTex, {
      at: [x, 0.072, 0.06],
      dir: [0, 0, 1],
      size: [0.034, 0.034],
      lift: 0.002,
      segments: 4,
    });
  }

  // ------------------------------------------------------------------ arms and hands
  const BX = 0.285;
  const BZ = 0.012;
  const armChains: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const k = armSide(s);
    const arm = b.chain(
      `arm${k}`,
      polyline([
        [s * 0.068, 0.305, 0],
        [s * 0.145, 0.302, 0.006],
        [s * 0.222, 0.295, BZ],
      ]),
      { parent: chest, names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`], role: "arm" },
    );
    armChains[k] = arm;
    b.sweep(
      arm,
      (t) => {
        const puff = 0.029 + 0.011 * Math.sin(Math.PI * Math.min(t / 0.6, 1));
        const f = Math.min(1, Math.max(0, (t - 0.5) / 0.12));
        return puff * (1 - f) + 0.02 * f;
      },
      {
        color: (t) => (t < 0.56 ? DRESS : SKIN),
        sides: 7,
        smooth: false,
        caps: "round",
        name: "arm",
      },
    );
    const cuff = b.ring(arm.at(0.56), { count: 7, radius: 0.026 });
    b.sweep(catmull(cuff.items, { closed: true }), 0.0065, {
      color: CREAM,
      sides: 4,
      smooth: false,
      name: "sleeveCuff",
    });
  }

  const wristR = armChains.R.joints[2];
  const wristL = armChains.L.joints[2];

  // Right hand: open, fingers fanned, waving.
  {
    const s = -1;
    const W = V(s * 0.222, 0.295, BZ);
    b.part(ball(7, 5), SKIN, {
      bone: wristR,
      at: W.clone().add(V(s * 0.02, 0, 0)),
      scale: [0.024, 0.029, 0.019],
      flat: true,
      name: "palmR",
    });
    const fingerNames = ["index", "middle", "ring", "pinky"];
    fingerNames.forEach((nm, i) => {
      const a = (1.5 - i) * 11 * DEG;
      const d = V(s * Math.cos(a), Math.sin(a), 0.06).normalize();
      const y0 = W.y + (1.5 - i) * 0.0135;
      const p0 = V(W.x + s * 0.036, y0, BZ);
      const lens =
        nm === "middle" ? [0.022, 0.02, 0.016] : nm === "pinky" ? [0.017, 0.015, 0.012] : [0.02, 0.018, 0.014];
      const pts = [p0];
      lens.forEach((l) => pts.push(pts[pts.length - 1].clone().addScaledVector(d, l)));
      const fc = b.chain(`${nm}R`, polyline(pts), {
        parent: wristR,
        names: [`${nm}R1`, `${nm}R2`, `${nm}R3`, `${nm}RTip`],
        role: "digit",
      });
      b.sweep(fc, 0.0075, { color: SKIN, sides: 5, smooth: false, caps: "round", name: "finger" });
    });
    const td = V(s * 0.5, -0.3, 0.8).normalize();
    const t0 = V(W.x + s * 0.012, W.y - 0.022, 0.012);
    const tc = b.chain(
      "thumbR",
      polyline([t0, t0.clone().addScaledVector(td, 0.018), t0.clone().addScaledVector(td, 0.034)]),
      {
        parent: wristR,
        names: ["thumbR1", "thumbR2", "thumbRTip"],
        role: "digit",
      },
    );
    b.sweep(tc, 0.0088, { color: SKIN, sides: 5, smooth: false, caps: "round", name: "thumb" });
  }

  // Left hand: fingers curled around the broom handle.
  const broomJoint = b.joint("broom", { parent: wristL, at: [BX, 0.23, BZ], dir: [0, 1, 0], group: "broom" });
  {
    const W = V(0.222, 0.295, BZ);
    b.part(ball(7, 5), SKIN, {
      bone: wristL,
      at: W.clone().add(V(0.02, 0, 0)),
      scale: [0.022, 0.03, 0.02],
      flat: true,
      name: "palmL",
    });
    const rc = 0.0105 + 0.0075;
    const around = (y: number, phi: number) => V(BX - rc * Math.cos(phi * DEG), y, BZ + rc * Math.sin(phi * DEG));
    ["index", "middle", "ring", "pinky"].forEach((nm, i) => {
      const y = W.y + (1.5 - i) * 0.0135;
      const fc = b.chain(`${nm}L`, polyline([V(W.x + 0.036, y, BZ), around(y, 40), around(y, 100), around(y, 160)]), {
        parent: wristL,
        names: [`${nm}L1`, `${nm}L2`, `${nm}L3`, `${nm}LTip`],
        role: "digit",
      });
      b.sweep(fc, 0.0075, { color: SKIN, sides: 5, smooth: false, caps: "round", name: "finger" });
    });
    const t0 = V(W.x + 0.026, W.y + 0.022, 0.018);
    const tc = b.chain("thumbL", polyline([t0, V(0.258, W.y + 0.034, 0.032), V(0.272, W.y + 0.04, 0.034)]), {
      parent: wristL,
      names: ["thumbL1", "thumbL2", "thumbLTip"],
      role: "digit",
    });
    b.sweep(tc, 0.0088, { color: SKIN, sides: 5, smooth: false, caps: "round", name: "thumb" });
  }

  // ------------------------------------------------------------------ broom
  const handle = b.sweep(
    polyline([
      [BX, 0.23, BZ],
      [BX, 0.86, BZ],
    ]),
    0.0105,
    {
      bone: broomJoint,
      color: (t) => (t > 0.86 && t < 0.91 ? BAND : t > 0.93 && t < 0.96 ? BAND : WOOD),
      sides: 6,
      smooth: false,
      caps: "flat",
      name: "handle",
    },
  );
  b.part(ball(7, 5), WOOD_DEEP, {
    bone: broomJoint,
    at: [BX, 0.872, BZ],
    scale: [0.017, 0.017, 0.017],
    flat: true,
    name: "knob",
  });
  const strands: Sweep[] = [];
  for (let i = 0; i < 9; i++) {
    const a = i * 40 * DEG;
    const center = i === 8;
    const top = V(BX + (center ? 0 : 0.011 * Math.cos(a)), 0.245, BZ + (center ? 0 : 0.011 * Math.sin(a)));
    const bot = V(BX + (center ? 0.004 : 0.052 * Math.cos(a)), 0.02, BZ + (center ? 0 : 0.052 * Math.sin(a)));
    const mid = V(
      (top.x + bot.x) / 2 + (center ? 0 : 0.008 * Math.cos(a)),
      0.14,
      (top.z + bot.z) / 2 + (center ? 0 : 0.008 * Math.sin(a)),
    );
    strands.push(
      b.sweep(catmull([top, mid, bot]), center ? [0.016, 0.02, 0.022] : [0.011, 0.016, 0.02], {
        bone: broomJoint,
        color: i % 2 ? STRAW_B : STRAW_A,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "round" },
        name: "strand",
      }),
    );
  }
  b.lathe(
    [
      [0.016, 0.215],
      [0.031, 0.218],
      [0.031, 0.25],
      [0.016, 0.252],
    ],
    { at: [BX, 0, BZ], segments: 8, color: BAND, bone: broomJoint, name: "binding" },
  );
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [s * 0.038, 0.02],
        [s * 0.044, -0.014],
      ],
      {
        at: [BX, 0.232, BZ + 0.031],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.01,
        bone: broomJoint,
        color: GOLD,
        name: "broomBow",
      },
    );
  b.part(ball(6, 4), GOLD, {
    bone: broomJoint,
    at: [BX, 0.232, BZ + 0.034],
    scale: 0.012,
    flat: true,
    name: "broomKnot",
  });
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [s * 0.012, -0.05],
        [s * 0.026, -0.042],
        [s * 0.006, 0],
      ],
      {
        at: [BX, 0.226, BZ + 0.034],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        bone: broomJoint,
        color: GOLD,
        name: "broomRibbon",
      },
    );
  b.decal(handle, stickerStarTex, {
    at: [BX, 0.5, BZ + 0.01],
    dir: [0, 0, 1],
    size: [0.028, 0.028],
    lift: 0.0015,
    segments: 6,
  });
  b.decal(handle, stickerMoonTex, {
    at: [BX, 0.68, BZ + 0.01],
    dir: [0, 0, 1],
    size: [0.028, 0.028],
    lift: 0.0015,
    segments: 6,
  });
  // Straw tufts bristling out of the bundle.
  const tufts = b
    .surface(strands)
    .scatter(26, { rng: rng(11), minDist: 0.03, filter: (h) => h.at.y < 0.17 && h.at.y > 0.07 && h.n.y < 0.5 });
  b.cards(tufts, strawTex, {
    size: [0.03, 0.045],
    lean: 55,
    flow: [0, -1, 0],
    vary: 0.3,
    rng: rng(12),
    cross: true,
    bone: broomJoint,
  });

  // Sparkles drifting off her right hand and up the broom.
  b.cards(
    [
      frame([-0.285, 0.345, 0.04], [0, 1, 0]),
      frame([-0.318, 0.315, 0.02], [0, 1, 0]),
      frame([-0.262, 0.385, 0.03], [0, 1, 0]),
    ],
    sparkleTex,
    { size: [0.04, 0.04], lean: 0, flow: [0, 0, 1], cross: true, bone: wristR },
  );
  b.cards(
    [frame([BX + 0.03, 0.72, BZ + 0.012], [0, 1, 0]), frame([BX - 0.03, 0.6, BZ + 0.015], [0, 1, 0])],
    sparkleTex,
    {
      size: [0.035, 0.035],
      lean: 0,
      flow: [0, 0, 1],
      cross: true,
      bone: broomJoint,
    },
  );

  // ------------------------------------------------------------------ kitten on the brim
  const brimSkin = b.surface(brim);
  const ground = (x: number, z: number) => brimSkin.ray([x, 1, z], [0, -1, 0])?.at.y ?? 0.5;
  const KA = 60 * DEG;
  const kx = 0.175 * Math.sin(KA);
  const kz = 0.175 * Math.cos(KA) - 0.01;
  const ky = ground(kx, kz);
  const K = (dx: number, dy: number, dz: number): [number, number, number] => [kx + dx, ky + dy, kz + dz];
  const Kv = (dx: number, dy: number, dz: number) => V(...K(dx, dy, dz));

  const kRoot = b.joint("kittenRoot", { parent: head, at: K(0, 0.02, -0.01), dir: [0, 1, 0], group: "kitten" });
  const kSpine = b.chain("kSpine", polyline([K(0, 0.03, -0.01), K(0, 0.065, 0), K(0, 0.095, 0.008)]), {
    parent: kRoot,
    names: ["kHips", "kChest"],
    role: "spine",
    group: "kitten",
  });
  const kHips = kSpine.joints[0];
  const kChest = kSpine.joints[1];
  const kHead = b.joint("kHead", {
    parent: kChest,
    at: K(0, 0.095, 0.008),
    dir: [0, 1, 0],
    role: "head",
    group: "kitten",
  });
  const kJaw = b.joint("kJaw", {
    parent: kHead,
    at: K(0, 0.108, -0.025),
    aim: K(0, 0.098, 0.04),
    role: "jaw",
    group: "kitten",
  });

  b.part(ball(), CAT, { bone: kHips, at: K(0, 0.042, -0.005), scale: [0.04, 0.042, 0.038], flat: true, name: "kBody" });
  b.part(ball(), CAT, {
    bone: kChest,
    at: K(0, 0.078, 0.008),
    scale: [0.031, 0.032, 0.029],
    flat: true,
    name: "kChestPart",
  });
  // head: cranium + jaw
  const KH = Kv(0, 0.127, 0.012);
  const KR: [number, number, number] = [0.053, 0.046, 0.048];
  const kSeam = 112 * DEG;
  const kCran = b.part(new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, kSeam), CAT, {
    bone: kHead,
    at: KH,
    scale: KR,
    flat: true,
    name: "kCranium",
  });
  const kChin = b.part(new THREE.SphereGeometry(1, 9, 3, 0, Math.PI * 2, kSeam, Math.PI - kSeam), CAT, {
    bone: kJaw,
    at: KH,
    scale: KR,
    flat: true,
    name: "kChin",
  });
  b.part(
    new THREE.CircleGeometry(Math.sin(kSeam), 9).rotateX(-Math.PI / 2).translate(0, Math.cos(kSeam), 0),
    MOUTH_IN,
    {
      bone: kJaw,
      at: KH,
      scale: KR,
      flat: true,
      name: "kMouthBed",
    },
  );
  b.part(new THREE.CircleGeometry(Math.sin(kSeam), 9).rotateX(Math.PI / 2).translate(0, Math.cos(kSeam), 0), MOUTH_IN, {
    bone: kHead,
    at: KH,
    scale: KR,
    flat: true,
    name: "kPalate",
  });
  for (const s of [1, -1]) {
    b.decal(kCran, catEyeTex, {
      at: K(s * 0.022, 0.133, 0.05),
      dir: [-(-s * 0.15), 0, 1],
      size: [0.028, 0.028],
      mirror: s > 0,
      lift: 0.0015,
      segments: 6,
    });
    const ear = Kv(s * 0.034, 0.165, 0.004);
    b.part(new THREE.ConeGeometry(0.022, 0.05, 4), CAT, {
      bone: kHead,
      at: ear,
      dir: [s * 0.4, 1, 0.05],
      flat: true,
      name: "kEar",
    });
    b.part(new THREE.ConeGeometry(0.014, 0.034, 4), CAT_INNER, {
      bone: kHead,
      at: ear.clone().add(V(-s * 0.001, -0.004, 0.008)),
      dir: [s * 0.4, 1, 0.05],
      flat: true,
      name: "kEarInner",
    });
    // whiskers
    for (const w of [1, -1])
      b.rod(Kv(s * 0.034, 0.117 + w * 0.004, 0.04), Kv(s * 0.072, 0.117 + w * 0.02, 0.06), 0.0012, {
        bone: kHead,
        color: LILAC,
        sides: 3,
        smooth: false,
        caps: "flat",
        name: "whisker",
      });
    // cheek fur
    const hit = b
      .surface(kCran)
      .around(KH)
      .at(s * 82, -8);
    if (hit) b.cards([hit], furTex, { size: [0.022, 0.03], lean: 75, flow: [0, -1, 0.3], cross: true, bone: kHead });
    // front legs and paws
    const pawY = ground(kx + s * 0.022, kz + 0.034) - ky;
    const front = b.chain(
      `kFront${armSide(s)}`,
      polyline([K(s * 0.022, 0.07, 0.02), K(s * 0.022, pawY + 0.012, 0.03)]),
      {
        parent: kChest,
        names: [`kFront${armSide(s)}1`, `kPaw${armSide(s)}`],
        role: "leg",
        group: "kitten",
      },
    );
    b.sweep(front, 0.011, {
      color: CAT,
      sides: 5,
      smooth: false,
      caps: { start: "round", end: "none" },
      name: "kForeleg",
    });
    b.part(ball(6, 4), CAT, {
      bone: front.joints[1],
      at: K(s * 0.022, pawY + 0.008, 0.036),
      scale: [0.014, 0.009, 0.018],
      flat: true,
      name: "kPaw",
    });
    // haunches and hind feet
    const hindY = ground(kx + s * 0.03, kz + 0.018) - ky;
    const hind = b.chain(
      `kHind${armSide(s)}`,
      polyline([K(s * 0.03, 0.04, -0.012), K(s * 0.03, hindY + 0.012, 0.014)]),
      {
        parent: kHips,
        names: [`kHip${armSide(s)}`, `kFoot${armSide(s)}`],
        role: "leg",
        group: "kitten",
      },
    );
    b.part(ball(), CAT, {
      bone: hind.joints[0],
      at: K(s * 0.032, 0.03, -0.012),
      scale: [0.022, 0.028, 0.032],
      flat: true,
      name: "kHaunch",
    });
    b.part(ball(6, 4), CAT, {
      bone: hind.joints[1],
      at: K(s * 0.03, hindY + 0.008, 0.024),
      scale: [0.013, 0.009, 0.02],
      flat: true,
      name: "kFoot",
    });
  }
  b.part(ball(6, 4), CAT_INNER, {
    bone: kHead,
    at: K(0, 0.12, 0.0615),
    scale: [0.008, 0.006, 0.006],
    flat: true,
    name: "kNose",
  });
  b.decal(kChin, catMouthTex, {
    at: K(0, 0.105, 0.055),
    dir: [0, 0, 1],
    size: [0.028, 0.018],
    lift: 0.001,
    segments: 4,
  });
  // collar and bell
  const kCollar = b.ring(frame(K(0, 0.078, 0.008), [0, 1, 0]), { count: 8, radius: 0.034 });
  b.sweep(catmull(kCollar.items, { closed: true }), 0.0055, {
    bone: kChest,
    color: BAND,
    sides: 4,
    smooth: false,
    name: "kCollar",
  });
  b.part(ball(6, 4), GOLD, { bone: kChest, at: K(0, 0.074, 0.042), scale: 0.0095, flat: true, name: "kBell" });
  // tail
  const kTail = b.chain(
    "kTail",
    catmull([
      Kv(0, 0.03, -0.035),
      Kv(0, 0.018, -0.082),
      Kv(0, 0.042, -0.115),
      Kv(0.012, 0.09, -0.11),
      Kv(0.03, 0.122, -0.092),
    ]),
    { parent: kHips, role: "tail", group: "kitten", names: ["kTail1", "kTail2", "kTail3", "kTail4"] },
  );
  b.sweep(kTail, [0.014, 0.012, 0.0105, 0.009, 0.007], {
    color: CAT,
    sides: 5,
    smooth: false,
    caps: "round",
    name: "kTailTube",
  });

  return b.root;
}
