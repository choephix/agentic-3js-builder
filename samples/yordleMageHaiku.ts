import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { cells, countershade, mix, mottle, noise, paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Yordle Mage",
  description:
    "A small furry mage about 1.35 m under her hat: apricot fur, a violet robe with gold filigree, a teal hat with a curled tip, and a 1.75 m staff topped with a magenta orb in a gold cage.",
  style: "League of Legends",
  commit: "b816db2",
};

// Palette: warm apricot fur against a violet robe and teal hat, gold trims, and cyan and magenta magic.
const FUR = "#f7a95e";
const FUR_DEEP = "#d7703f";
const CREAM = "#fff1d6";
const BLUSH = "#ff7d9f";
const NOSE = "#ff5f8f";
const INK = "#24122f";
const ROBE = "#7a2fe0";
const ROBE_DEEP = "#3b1690";
const GOLD = "#ffc53d";
const GOLD_DEEP = "#d98f1c";
const TEAL = "#19c7c4";
const TEAL_DEEP = "#0b7c94";
const WOOD = "#4a1f63";
const MAGENTA = "#ff3fd0";
const CYAN = "#62f5ff";
const WHITE = "#fffaf0";

// Paints: fur is a mottled apricot shaded to cream underneath; the robe carries a gold filigree and a hem band.
const furPaint = countershade(mottle(FUR, FUR_DEEP, { size: 0.07, contrast: 0.5, seed: 3 }), CREAM, { level: -0.15 });

const robeCloth = paint((p, n) => {
  if (p.y < 0.23) return GOLD_DEEP;
  if (n.z > 0.6 && Math.abs(p.x) < 0.06 && p.y < 0.72) return CREAM;
  const c = cells(p, 0.08, 5);
  if (c.d2 - c.d1 < 0.012) return GOLD;
  return mix(ROBE_DEEP, ROBE, noise(p, 0.25, 2));
});

const hatCloth = paint((p) => {
  const c = cells(p, 0.07, 9);
  return c.d2 - c.d1 < 0.01 ? GOLD : mix(TEAL_DEEP, TEAL, noise(p, 0.12, 6));
});

const earPaint = paint((_p, _n, s) =>
  (s[0] / 0.022) ** 2 + ((s[1] - 0.1) / 0.09) ** 2 < 1 ? BLUSH : FUR,
);

// Drawings: big bright anime-style eye, fur tuft (greys, tinted by the part colour), star, sparkles, rune circle.
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 96">
<defs><linearGradient id="ir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d6bff"/><stop offset="0.55" stop-color="#2fd6e6"/><stop offset="1" stop-color="#9dfff0"/></linearGradient></defs>
<ellipse cx="35" cy="48" rx="34" ry="47" fill="#24122f"/>
<ellipse cx="35" cy="48" rx="30" ry="43" fill="#ffffff"/>
<ellipse cx="35" cy="54" rx="22" ry="34" fill="url(#ir)"/>
<ellipse cx="35" cy="58" rx="8" ry="22" fill="#14082a"/>
<path d="M0 30 Q35 8 70 30 L70 24 Q35 2 0 24 Z" fill="#24122f"/>
<circle cx="25" cy="38" r="8" fill="#ffffff"/>
<circle cx="44" cy="68" r="4" fill="#ffffff" fill-opacity="0.85"/>
</svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
<path d="M3 64 Q1 34 14 6 Q17 22 16 30 Q24 16 30 2 Q31 36 29 64 Z" fill="url(#g)"/>
<path d="M16 64 Q15 40 16 30" stroke="#777777" stroke-width="2" fill="none"/>
</svg>`,
  { size: 128 },
);

const STAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M32 3 L39 24 L61 24 L43 37 L50 58 L32 45 L14 58 L21 37 L3 24 L25 24 Z" fill="#ffd34a" stroke="#fff3b0" stroke-width="2"/>
<circle cx="32" cy="32" r="6" fill="#5ff3ff"/>
</svg>`,
  { size: 256 },
);

const [SPARK_M, SPARK_C] = [
  ["#ff9cf2", "#ff3fd0"],
  ["#dcffff", "#5ff3ff"],
].map(([core, ray]) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><radialGradient id="g"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="${core}"/><stop offset="1" stop-color="${core}" stop-opacity="0"/></radialGradient></defs>
<path d="M32 0 L37 27 L64 32 L37 37 L32 64 L27 37 L0 32 L27 27 Z" fill="${ray}"/>
<circle cx="32" cy="32" r="13" fill="url(#g)"/>
</svg>`,
    { size: 128 },
  ),
);

const ticks = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const x1 = 64 + Math.cos(a) * 50;
  const y1 = 64 + Math.sin(a) * 50;
  const x2 = 64 + Math.cos(a) * 60;
  const y2 = 64 + Math.sin(a) * 60;
  return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
}).join("");
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
<g fill="none" stroke="#5ff3ff" stroke-width="3">
<circle cx="64" cy="64" r="60"/><circle cx="64" cy="64" r="50" stroke-width="1.5"/>
<polygon points="64,14 105,88 23,88" stroke-width="2"/><circle cx="64" cy="64" r="30" stroke-width="2"/>
${ticks}
</g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "yordleMage" });

  // Skeleton: a hips root joint, then a spine chain up to the neck tip (joints: lower back, waist, chest, neck).
  const hips = b.joint("hips", { at: [0, 0.44, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.44, 0],
      [0, 0.6, 0],
      [0, 0.73, 0.01],
      [0, 0.84, 0.03],
    ],
    { parent: hips, names: ["lowerBack", "waist", "chest", "neck"], role: "spine" },
  );
  const waist = spine.joints[1];
  const chest = spine.joints[2];
  const neck = spine.joints[3];
  const head = b.joint("head", { parent: neck, at: [0, 0.9, 0.02], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.83, 0.1], dir: [0, -0.8, 0.6], role: "jaw" });
  const earL = b.joint("earL", { parent: head, at: [0.13, 0.9, -0.02], dir: [0.87, 0.5, 0], role: "hinge" });
  const earR = b.joint("earR", { parent: head, at: [-0.13, 0.9, -0.02], dir: [-0.87, 0.5, 0], role: "hinge" });

  // ---- Head ----
  const headPart = b.part(new THREE.SphereGeometry(0.16, 14, 10), furPaint, {
    bone: head,
    at: [0, 0.9, 0.02],
    flat: true,
    name: "head",
  });
  for (const sd of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.055, 10, 8), CREAM, {
      bone: head,
      at: [sd * 0.105, 0.855, 0.125],
      scale: [1, 0.85, 0.85],
      flat: true,
      name: sd > 0 ? "cheekL" : "cheekR",
    });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), BLUSH, {
      bone: head,
      at: [sd * 0.13, 0.84, 0.16],
      name: sd > 0 ? "blushL" : "blushR",
    });
  }
  b.part(new THREE.SphereGeometry(0.065, 10, 8), CREAM, {
    bone: head,
    at: [0, 0.85, 0.145],
    scale: [1.2, 0.8, 0.9],
    flat: true,
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), NOSE, { bone: head, at: [0, 0.872, 0.2], name: "nose" });
  b.sweep(
    catmull([
      [-0.03, 0.83, 0.185],
      [0, 0.815, 0.195],
      [0.03, 0.83, 0.185],
    ]),
    0.006,
    { bone: head, color: INK, name: "mouth" },
  );
  for (const sd of [1, -1]) {
    b.sweep(
      catmull([
        [sd * 0.06, 0.845, 0.2],
        [sd * 0.12, 0.85, 0.22],
        [sd * 0.2, 0.84, 0.21],
      ]),
      [0.004, 0.002],
      { bone: head, color: WHITE, name: sd > 0 ? "whiskerL" : "whiskerR" },
    );
  }
  b.part(new THREE.SphereGeometry(0.05, 10, 8), CREAM, {
    bone: jaw,
    at: [0, 0.8, 0.15],
    scale: [1.3, 0.9, 1],
    flat: true,
    name: "chin",
  });

  // Eyes: two big anime-style drawings decaled onto the head's front.
  const headSurface = b.surface(headPart);
  for (const sd of [1, -1]) {
    const hit = headSurface.nearest([sd * 0.075, 0.93, 0.18]);
    b.decal(headPart, EYE, { at: hit, dir: [0, 0, 1], size: [0.08, 0.1], name: sd > 0 ? "eyeL" : "eyeR" });
  }

  // Ears: flat fur plates with a blush inner, sticking out sideways from the head's equator.
  const EAR: OutlinePoint[] = [
    [-0.04, 0],
    [0.04, 0],
    [0.05, 0.08],
    [0.04, 0.17],
    [0, 0.21],
    [-0.04, 0.17],
    [-0.05, 0.08],
  ];
  for (const [sd, ear] of [
    [1, earL],
    [-1, earR],
  ] as const) {
    const earPart = b.extrude(EAR, {
      at: ear,
      x: [0, 0, 1],
      y: [sd * 0.87, 0.5, 0],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 1,
      color: earPaint,
      bone: ear,
      name: sd > 0 ? "earL" : "earR",
    });
    b.cards(b.surface(earPart).scatter(12, { rng: rng(sd > 0 ? 60 : 61), minDist: 0.025 }), TUFT, {
      size: [0.03, 0.05],
      lean: 40,
      rng: rng(sd > 0 ? 62 : 63),
      color: FUR_DEEP,
      bone: ear,
    });
  }

  // Fur tufts on the head's crown and sides.
  const headHits = headSurface.scatter(120, { rng: rng(7), minDist: 0.028, filter: (h) => h.n.z < 0.4 });
  b.cards(headHits, TUFT, { size: [0.035, 0.06], lean: 45, bend: 25, vary: 0.3, rng: rng(8), color: FUR });

  // Hat: a teal lathe crown with a brim, a curled tip with a cream pom-pom, a gold band and a glowing star decal.
  const hat = b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.23, 0.03],
      [0.18, 0.05],
      [0.12, 0.22],
      [0.05, 0.33],
      [0, 0.36],
    ],
    { at: [0, 0.98, 0], bone: head, color: hatCloth, smoothing: 1, name: "hat" },
  );
  b.sweep(
    bezier([0, 1.3, 0], [0.06, 1.46, 0], [0.2, 1.44, -0.02], [0.25, 1.3, -0.06]),
    [0.055, 0.014],
    { bone: head, color: hatCloth, caps: { start: "round", end: "round" }, name: "hatTip" },
  );
  b.part(new THREE.SphereGeometry(0.045, 10, 8), CREAM, { bone: head, at: [0.25, 1.29, -0.06], name: "pompom" });
  const hatBand = b.ring(frame([0, 1.03, 0], [0, 1, 0]), { count: 18, radius: 0.195 }).items;
  b.sweep(catmull(hatBand, { closed: true }), 0.011, { bone: head, color: GOLD, name: "hatBand" });
  glow(b.decal(hat, STAR, { at: [0, 1.1, 0.15], dir: [0, 0, 1], size: [0.085, 0.085], name: "hatStar" }));

  // ---- Robe and body ----
  const robe = b.loft(
    [
      { at: [0, 0.2, 0], w: 0.5, h: 0.42 },
      { at: [0, 0.4, 0], w: 0.4, h: 0.34 },
      { at: [0, 0.6, 0], w: 0.33, h: 0.28 },
      { at: [0, 0.72, 0], w: 0.36, h: 0.27 },
      { at: [0, 0.77, 0], w: 0.22, h: 0.2 },
    ],
    { bone: spine, color: robeCloth, caps: { start: "flat", end: "flat" }, name: "robe" },
  );
  b.sweep(b.surface(robe).loop(waist, { lift: 0.01 }), 0.018, { color: GOLD, name: "belt" });
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.015), GOLD, { bone: waist, at: [0, 0.6, 0.155], name: "buckle" });
  glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), CYAN, { bone: waist, at: [0, 0.6, 0.17], name: "buckleGem" }), 1.4);
  b.extrude(
    [
      [-0.03, 0],
      [0.03, 0],
      [0.035, -0.15],
      [0, -0.12, "sharp"],
      [-0.035, -0.15],
    ],
    { at: [0, 0.58, 0.15], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: TEAL, bone: waist, name: "sash" },
  );
  b.part(new THREE.SphereGeometry(0.035, 10, 8), TEAL_DEEP, {
    bone: waist,
    at: [-0.15, 0.56, 0.06],
    scale: [1, 1.1, 0.8],
    flat: true,
    name: "pouch",
  });
  glow(b.part(new THREE.IcosahedronGeometry(0.018, 0), CYAN, { bone: chest, at: [0, 0.72, 0.148], name: "pendant" }), 1.2);
  const robeSurf = b.surface(robe);
  glow(b.decal(robe, RUNE, { at: robeSurf.nearest([0, 0.68, -0.3]), dir: [0, 0, -1], size: [0.15, 0.15], name: "robeRune" }), 1.2);
  for (const y of [0.46, 0.52, 0.66, 0.72])
    b.stick(new THREE.SphereGeometry(0.012, 8, 6), GOLD, robeSurf.nearest([0, y, 0.3]), { embed: 0.3 });

  // Collar and fur ruff at the neck.
  const collar = b.ring(frame([0, 0.765, 0], [0, 1, 0]), { count: 16, radius: 0.118 }).items;
  b.sweep(catmull(collar, { closed: true }), 0.011, { bone: chest, color: GOLD, name: "collar" });
  const ruff = b.ring(frame([0, 0.77, 0], [0, 1, 0]), { count: 22, radius: 0.125 }).items;
  b.cards(ruff, TUFT, { size: [0.05, 0.08], lean: 30, bend: 15, flow: [0, 1, 0], vary: 0.25, rng: rng(41), color: FUR, bone: chest });

  // Tail: a bushy fur tube behind the hips.
  const tail = b.chain("tail", [[0, 0.46, -0.1], [0, 0.5, -0.22], [0, 0.56, -0.32]], {
    parent: hips,
    names: ["tail1", "tail2", "tailTip"],
    role: "tail",
  });
  const tailTube = b.sweep(tail, [0.07, 0.09, 0.075], { color: furPaint, name: "tail" });
  b.cards(b.surface(tailTube).scatter(70, { rng: rng(21), minDist: 0.03 }), TUFT, {
    size: [0.045, 0.075],
    lean: 55,
    bend: 20,
    vary: 0.3,
    rng: rng(22),
    color: FUR_DEEP,
  });

  // ---- Legs and feet ----
  const makeLeg = (sd: number) => {
    const side = sd > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, limb([sd * 0.1, 0.44, 0], [sd * 0.1, 0.1, 0], [0.2, 0.18], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.056, 0.046, 0.04], { color: furPaint, name: `leg${side}` });
    const ankle = leg.joints[2];
    b.part(new THREE.SphereGeometry(0.075, 12, 8), furPaint, {
      bone: ankle,
      at: [sd * 0.1, 0.075, 0.04],
      scale: [1.15, 1, 1.5],
      flat: true,
      name: `foot${side}`,
    });
    for (const dx of [-0.035, 0, 0.035])
      b.part(new THREE.SphereGeometry(0.028, 8, 6), CREAM, { bone: ankle, at: [sd * 0.1 + dx, 0.03, 0.14] });
  };
  makeLeg(1);
  makeLeg(-1);

  // ---- Arms, sleeves, mitts ----
  const makeArm = (sd: number) => {
    const side = sd > 0 ? "L" : "R";
    const H: [number, number, number] = sd > 0 ? [0.25, 0.64, 0.2] : [-0.268, 0.55, 0.175];
    const arm = b.chain(
      `arm${side}`,
      [
        [sd * 0.13, 0.7, 0],
        [sd * 0.22, 0.5, 0.08],
        H,
      ],
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(arm, [0.062, 0.054, 0.046], { color: robeCloth, name: `sleeve${side}` });
    const cuff = b.ring(arm.at(0.86), { count: 14, radius: 0.052 }).items;
    b.sweep(catmull(cuff, { closed: true }), 0.011, { color: GOLD, name: `cuff${side}` });
    const hand = arm.joints[2];
    b.part(new THREE.SphereGeometry(0.072, 12, 8), furPaint, {
      bone: hand,
      at: H,
      scale: [1, 0.95, 1.1],
      flat: true,
      name: `mitt${side}`,
    });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), furPaint, {
      bone: hand,
      at: [H[0] - sd * 0.062, H[1] - 0.01, H[2] + 0.02],
      name: `thumb${side}`,
    });
    for (const dx of [-0.03, 0, 0.03])
      b.part(new THREE.SphereGeometry(0.018, 6, 4), FUR_DEEP, {
        bone: hand,
        at: [H[0] + dx, H[1] - 0.035, H[2] + 0.066],
      });
    return arm;
  };
  const armL = makeArm(1);
  const armR = makeArm(-1);
  const handL = armL.joints[2];
  const handR = armR.joints[2];

  // ---- Staff: 1.75 m, planted on the floor, gripped in the right hand, topped with a caged orb ----
  const B: [number, number, number] = [-0.3, 0, 0.2];
  const HR: [number, number, number] = [-0.268, 0.55, 0.175];
  const T: [number, number, number] = [-0.2, 1.72, 0.12];
  b.sweep(polyline([B, HR, T]), [0.026, 0.021, 0.019], {
    bone: handR,
    color: (t) => (t < 0.035 || (t > 0.3 && t < 0.34) || (t > 0.55 && t < 0.58) || (t > 0.74 && t < 0.77) || t > 0.92 ? GOLD : WOOD),
    caps: { start: "flat", end: "round" },
    name: "staff",
  });
  const C: [number, number, number] = [-0.2, 1.79, 0.12];
  glow(b.part(new THREE.IcosahedronGeometry(0.068, 1), MAGENTA, { bone: handR, at: C, flat: true, name: "orb" }), 1.6);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const ox = Math.cos(a) * 0.076;
    const oz = Math.sin(a) * 0.076;
    b.sweep(
      catmull([
        [C[0], C[1] - 0.074, C[2]],
        [C[0] + ox, C[1], C[2] + oz],
        [C[0], C[1] + 0.074, C[2]],
      ]),
      0.007,
      { bone: handR, color: GOLD, name: `cage${i}` },
    );
  }
  b.spike([C[0], C[1] + 0.07, C[2]], [0, 1, 0], 0.06, 0.013, { bone: handR, color: GOLD, name: "crown" });
  const orbRand = rng(31);
  const orbSparks = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + orbRand() * 0.5;
    return frame([C[0] + Math.cos(a) * 0.13, C[1] + (orbRand() - 0.5) * 0.14, C[2] + Math.sin(a) * 0.13], [0, 1, 0]);
  });
  glow(b.cards(orbSparks, [SPARK_M, SPARK_C], { size: 0.06, lean: 0, rng: rng(32), bone: handR }));

  // Left hand: a small cyan spell orb hovering over the open palm.
  glow(b.part(new THREE.IcosahedronGeometry(0.04, 1), CYAN, { bone: handL, at: [0.25, 0.75, 0.2], flat: true, name: "handOrb" }), 1.6);
  const leftRand = rng(51);
  const leftSparks = Array.from({ length: 3 }, (_, i) =>
    frame([0.25 + Math.cos(i * 2.1) * 0.07, 0.8 + leftRand() * 0.05, 0.2 + Math.sin(i * 2.1) * 0.07], [0, 1, 0]),
  );
  glow(b.cards(leftSparks, SPARK_C, { size: 0.045, lean: 0, rng: rng(52), bone: handL }));

  // Summoning circle on the floor: a glowing rune ring under the mage.
  glow(
    b.part(new THREE.CircleGeometry(0.42, 40), "#ffffff", {
      bone: hips,
      at: [0, 0.002, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE,
      name: "runeCircle",
    }),
  );

  return b.root;
}
