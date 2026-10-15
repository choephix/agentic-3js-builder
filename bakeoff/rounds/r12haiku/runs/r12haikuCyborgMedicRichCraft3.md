```ts
import * as THREE from "three";
import { countershade, createBuilder, frame, mix, paint, polyline, bezier, rng, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Mend, support cyborg medic",
  description:
    "Overwatch-style support hero: white and gold armour, a cyan visor, a cybernetic left arm and a healing staff whose crystal orb throws motes of light.",
};

const TAU = Math.PI * 2;
const lerpN = (a: number, b: number, t: number) => a + (b - a) * Math.min(Math.max(t, 0), 1);
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const pair = (a: number, b: number): [number, number] => [a, b];

// Palette: clean cream-white armour, navy undersuit, gold trim, gunmetal cybernetics, cyan light.
const C = {
  white: "#f4f7fb",
  whiteShade: "#9aa9bf",
  navy: "#34456a",
  navyShade: "#18223a",
  gold: "#ffc53d",
  goldShade: "#b06f14",
  gun: "#5b6679",
  gunShade: "#232a3a",
  skin: "#efbf9b",
  skinShade: "#b98067",
  cyan: "#4ff3e4",
};

const WHITE = countershade(C.white, C.whiteShade, { level: 0.05, soft: 0.6 });
const NAVY = countershade(C.navy, C.navyShade, { level: 0, soft: 0.5 });
const GUN = countershade(C.gun, C.gunShade, { level: 0, soft: 0.5 });
const GOLD = countershade(C.gold, C.goldShade, { level: 0.1, soft: 0.5 });
const SKIN = countershade(C.skin, C.skinShade, { level: 0, soft: 0.6 });
// Boots: navy, lighter on top, with trail dust gathering at the soles.
const BOOT_PAINT = paint((p, n) => {
  const base = mix(C.navyShade, C.navy, smoothstep(-0.6, 0.2, n.y));
  return mix(base, "#4a4840", smoothstep(0.07, 0.0, p.y));
});

// Outlines (extrude and lathe) -------------------------------------------------------------------------
// Chest plate, in its own (x right-to-left, y up) plane, relative to its origin.
const PLATE: [number, number][] = [
  [-0.15, 0.13],
  [0.15, 0.13],
  [0.13, -0.02],
  [0, -0.12],
  [-0.13, -0.02],
];
// Shoulder dome: a solid of revolution about the bone, six sides for the angular silhouette.
const DOME: [number, number][] = [
  [0, 0],
  [0.13, 0],
  [0.142, 0.035],
  [0.12, 0.1],
  [0.065, 0.142],
  [0, 0.152],
];
const RIM: [number, number][] = [
  [0.128, 0],
  [0.15, 0],
  [0.15, 0.024],
  [0.128, 0.024],
];
// Helmet crest fin: x runs backward, y up.
const FIN: [number, number][] = [
  [0, -0.03],
  [0.14, -0.03],
  [0.19, 0.07],
  [0.1, 0.14],
  [0, 0.05],
];
// Boot profile: x runs forward (z), y up.
const BOOT_SHAPE: [number, number][] = [
  [-0.09, 0.02],
  [-0.08, 0.2],
  [0.02, 0.21],
  [0.05, 0.13],
  [0.16, 0.12],
  [0.23, 0.07],
  [0.23, 0.0],
  [-0.05, 0.0],
];

// Drawings ----------------------------------------------------------------------------------------------
const VISOR_SVG = `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 36 Q100 4 194 36 Q198 44 188 72 Q100 98 12 72 Q2 44 6 36 Z" fill="#0c1424"/>
  <path d="M28 44 L92 38 L90 56 L26 60 Z" fill="#4ff3e4"/>
  <path d="M172 44 L108 38 L110 56 L174 60 Z" fill="#4ff3e4"/>
  <path d="M36 48 L60 46" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <path d="M116 46 L140 48" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const CROSS_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#ffc53d" stroke-width="7"/>
  <rect x="40" y="19" width="20" height="62" rx="4" fill="#4ff3e4"/>
  <rect x="19" y="40" width="62" height="20" rx="4" fill="#4ff3e4"/>
</svg>`;

const SCREEN_SVG = `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="120" height="60" rx="8" fill="#07131d"/>
  <rect x="4" y="4" width="112" height="52" rx="5" fill="none" stroke="#2fd6c8" stroke-width="2.5"/>
  <rect x="11" y="10" width="26" height="7" rx="2" fill="#2fd6c8"/>
  <rect x="11" y="44" width="48" height="4" rx="2" fill="#ffc53d"/>
  <polyline points="10,32 34,32 40,32 45,18 52,46 58,24 64,32 110,32" fill="none" stroke="#7dffb0" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;

const RUNES_SVG = `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="40" fill="#1d2a42"/>
  <g fill="none" stroke="#7ff7ea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 31 L10 9 L20 20 L30 9 L30 31"/>
    <path d="M50 9 L62 31 L74 9 M56 22 L68 22"/>
    <circle cx="100" cy="20" r="7"/>
    <path d="M124 31 L134 9 L144 31 M128 23 L140 23"/>
    <path d="M170 9 L170 31 M170 20 L184 12"/>
  </g>
</svg>`;

const MOTE_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 2 L37 27 L62 32 L37 37 L32 62 L27 37 L2 32 L27 27 Z" fill="#8ffff6"/>
  <circle cx="32" cy="32" r="8" fill="#ffffff"/>
</svg>`;

const CHEVRON_SVG = `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 28 L30 12 L56 28 L56 36 L30 20 L4 36 Z" fill="#ffc53d"/>
  <path d="M64 28 L90 12 L116 28 L116 36 L90 20 L64 36 Z" fill="#ffc53d"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "mend" });
  const rand = rng(21);

  const tex = {
    visor: svg(VISOR_SVG, { size: 512 }),
    cross: svg(CROSS_SVG, { size: 256 }),
    screen: svg(SCREEN_SVG, { size: 256 }),
    runes: svg(RUNES_SVG, { size: 512 }),
    mote: svg(MOTE_SVG, { size: 128 }),
    chevron: svg(CHEVRON_SVG, { size: 256 }),
  };

  // Skeleton -------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 1.02, 0], [0, 1.22, 0.01], [0, 1.4, 0.02]]), {
    parent: hips,
    names: ["waist", "chest"],
    role: "spine",
  });
  const waist = spine.joints[0];
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.4, 0.02], dir: [0, 1, 0.12], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.5, 0.03], dir: [0, 1, 0.1], role: "head" });

  // Right arm: holds the staff. Left arm: cybernetic.
  const armR = b.chain(
    "armR",
    polyline([
      [-0.24, 1.36, 0],
      [-0.36, 1.14, 0.1],
      [-0.44, 1.04, 0.14],
      [-0.49, 0.99, 0.155],
    ]),
    { parent: chest, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );
  const armL = b.chain(
    "armL",
    polyline([
      [0.24, 1.36, 0],
      [0.36, 1.12, 0.06],
      [0.42, 0.94, 0.14],
      [0.44, 0.84, 0.22],
    ]),
    { parent: chest, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const shoulderR = armR.joints[0];
  const shoulderL = armL.joints[0];
  const elbowL = armL.joints[1];
  const handR = armR.joints[3];
  const handL = armL.joints[3];

  const legR = b.chain("legR", polyline([[-0.11, 0.96, 0], [-0.12, 0.52, 0.05], [-0.11, 0.1, 0]]), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
  });
  const legL = b.chain("legL", polyline([[0.11, 0.96, 0], [0.12, 0.52, 0.05], [0.11, 0.1, 0]]), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
  });

  // Head -----------------------------------------------------------------------------------------------
  // Cream helmet (a partial sphere, open at the chin), a skin jaw below it, and a crest fin behind.
  const helmet = b.part(new THREE.SphereGeometry(0.125, 20, 14, 0, TAU, 0, 1.8), WHITE, {
    bone: head,
    at: [0, 1.62, 0.03],
    scale: [0.9, 1, 1],
  });
  b.part(new THREE.SphereGeometry(0.11, 16, 10, 0, TAU, 1.62, Math.PI - 1.62), SKIN, {
    bone: head,
    at: [0, 1.615, 0.035],
    scale: [0.86, 1, 0.98],
  });
  const visor = b.decal(helmet, tex.visor, { at: [0, 1.64, 0.15], dir: [0, 0, 1], size: [0.2, 0.1] });
  glow(visor, 1.3);

  // Cyborg cheek: a gunmetal panel with a cyan light strip on the model's left.
  b.part(new THREE.BoxGeometry(0.024, 0.07, 0.07), GUN, { bone: head, at: [0.112, 1.6, 0.02] });
  glow(b.part(new THREE.BoxGeometry(0.008, 0.012, 0.05), C.cyan, { bone: head, at: [0.126, 1.6, 0.02] }), 1.2);

  b.extrude(FIN, {
    at: [0, 1.69, -0.02],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.003,
    color: GOLD,
    bone: head,
  });

  b.sweep(polyline([[0, 1.3, 0.02], [0, 1.42, 0.03], [0, 1.52, 0.035]]), 0.046, {
    bone: [chest, neck, head],
    color: GUN,
  });

  // Torso ---------------------------------------------------------------------------------------------
  const undersuit = b.loft(
    [
      { at: [0, 0.93, 0], w: 0.25, h: 0.16 },
      { at: [0, 1.0, 0], w: 0.27, h: 0.17 },
      { at: [0, 1.08, 0.005], w: 0.29, h: 0.18 },
    ],
    { bone: [hips, waist], color: NAVY },
  );
  const torso = b.loft(
    [
      { at: [0, 1.06, 0], w: 0.3, h: 0.18 },
      { at: [0, 1.18, 0.01], w: 0.36, h: 0.22 },
      { at: [0, 1.3, 0.015], w: 0.38, h: 0.22 },
      { at: [0, 1.4, 0.02], w: 0.27, h: 0.17 },
    ],
    { bone: [waist, chest, neck], color: WHITE },
  );

  // Gold belt, cut round the undersuit at the waist, and a buckle on its front.
  const belt = b.surface(undersuit).loop(waist, { lift: 0.012 });
  b.sweep(belt, 0.011, { color: GOLD });
  const beltFront = b.surface(undersuit).around([0, 1.02, 0]).at(0, 0);
  const beltZ = beltFront ? beltFront.at.z : 0.1;
  b.part(new THREE.BoxGeometry(0.05, 0.045, 0.02), GOLD, { bone: waist, at: [0, 1.02, beltZ + 0.012] });

  // Navy tabard hanging from the back of the belt.
  b.sweep(polyline([[0, 1.0, -0.1], [0, 0.85, -0.13], [0, 0.66, -0.12]]), (t: number) => pair(0.09 - 0.02 * t, 0.007), {
    section: "box",
    bone: hips,
    color: NAVY,
  });

  // Chest plate: white over a gold rim, with a studded row and a glowing cross.
  const torsoFront = b.surface(torso).around([0, 1.26, 0]).at(0, 0);
  const plateZ = (torsoFront ? torsoFront.at.z : 0.12) + 0.012;
  b.extrude(
    PLATE.map(([x, y]): [number, number] => [x * 1.12, y * 1.12]),
    { at: [0, 1.26, plateZ - 0.004], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, color: GOLD, bone: chest },
  );
  const plate = b.extrude(PLATE, {
    at: [0, 1.26, plateZ + 0.006],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.024,
    bevel: 0.006,
    color: WHITE,
    bone: chest,
  });
  glow(b.decal(plate, tex.cross, { at: [0, 1.26, plateZ + 0.02], dir: [0, 0, 1], size: [0.11, 0.11] }), 1.1);
  const studPath = polyline(
    PLATE.map(([x, y]): [number, number, number] => [x * 0.84, 1.26 + y * 0.84, plateZ + 0.017]),
    { closed: true },
  );
  b.along(studPath, 12, (at) => {
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), GOLD, { at });
  });

  // Cyber backpack: gunmetal case with two glowing coolant canisters.
  b.part(new THREE.BoxGeometry(0.2, 0.26, 0.09), GUN, { bone: chest, at: [0, 1.24, -0.17] });
  for (const s of [-1, 1]) {
    glow(
      b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.2, 10), C.cyan, {
        bone: chest,
        at: [s * 0.055, 1.26, -0.225],
      }),
      1.1,
    );
  }
  // Coolant line from the backpack to the cybernetic shoulder.
  b.sweep(polyline([[0.09, 1.34, -0.14], [0.2, 1.42, -0.06], [0.24, 1.38, 0]]), 0.01, {
    bone: chest,
    color: GUN,
  });

  // Medkit pouch on the model's right hip, with its own small cross.
  const pouch = b.part(new THREE.BoxGeometry(0.09, 0.09, 0.05), WHITE, { bone: waist, at: [-0.155, 1.0, 0.07] });
  b.decal(pouch, tex.cross, { at: [-0.155, 1.0, 0.1], dir: [0, 0, 1], size: [0.05, 0.05] });

  // Shoulders -------------------------------------------------------------------------------------------
  // Right: white dome with a gold rim. Left: gunmetal dome with a cyan ring.
  b.lathe(DOME, { at: [-0.25, 1.33, 0], segments: 6, color: WHITE, bone: shoulderR });
  b.lathe(RIM, { at: [-0.25, 1.33, 0], segments: 6, color: GOLD, bone: shoulderR });
  b.lathe(DOME, { at: [0.25, 1.33, 0], segments: 6, color: GUN, bone: shoulderL });
  glow(b.lathe(RIM, { at: [0.25, 1.33, 0], segments: 6, color: C.cyan, bone: shoulderL }), 1.2);

  // Arms ------------------------------------------------------------------------------------------------
  // Right arm: white armour sleeve with a gold band; navy glove around the staff.
  b.sweep(armR, (t: number) => pair(0.06 - 0.012 * t, 0.052 - 0.01 * t), { section: "box", color: WHITE });
  b.sweep(armR, pair(0.061, 0.053), { section: "box", color: GOLD, from: 0.2, to: 0.25 });
  b.part(new THREE.SphereGeometry(0.044, 10, 8), NAVY, {
    bone: handR,
    at: [-0.492, 0.99, 0.158],
    scale: [1, 1.1, 1.05],
  });
  b.capsule([-0.47, 1.0, 0.18], [-0.5, 1.01, 0.19], 0.012, NAVY, { bone: handR });

  // Left arm: white sleeve up top, gunmetal cybernetic forearm and hand, a glowing elbow core.
  b.sweep(armL, (t: number) => pair(0.058 - 0.01 * t, 0.05 - 0.008 * t), {
    section: "box",
    color: WHITE,
    from: 0,
    to: 0.45,
  });
  const forearmL = b.sweep(armL, pair(0.05, 0.046), { section: "box", color: GUN, from: 0.45, to: 1 });
  glow(b.part(new THREE.IcosahedronGeometry(0.035, 0), C.cyan, { bone: elbowL, at: [0.365, 1.12, 0.07] }), 1.3);
  glow(
    b.decal(forearmL, tex.screen, { at: [0.445, 1.03, 0.1], dir: [1, 0, 0], size: [0.07, 0.035], up: [0, 1, 0] }),
    1.2,
  );
  b.part(new THREE.BoxGeometry(0.075, 0.07, 0.07), GUN, { bone: handL, at: [0.44, 0.84, 0.225] });
  for (let i = 0; i < 4; i++) {
    const x = 0.44 + (i - 1.5) * 0.018;
    b.capsule([x, 0.835, 0.245], [x, 0.815, 0.3], 0.0095, GUN, { bone: handL });
  }
  b.capsule([0.46, 0.85, 0.2], [0.478, 0.84, 0.25], 0.011, GUN, { bone: handL });

  // Legs and boots ----------------------------------------------------------------------------------------
  const legSides = [
    { leg: legR, s: -1 },
    { leg: legL, s: 1 },
  ];
  for (const { leg, s } of legSides) {
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const kx = 0.12 * s;

    // Navy thigh, a chevron band on its front, a white shin armour, a knee guard and a boot.
    const thigh = b.sweep(leg, (t: number) => lerpN(0.085, 0.07, t / 0.52), { from: 0, to: 0.52, color: NAVY });
    b.decal(thigh, tex.chevron, { at: [0.115 * s, 0.76, 0.1], dir: [0, 0, 1], size: [0.09, 0.03], up: [0, 1, 0] });
    b.sweep(
      leg,
      (t: number) => {
        const u = clamp01((t - 0.48) / 0.52);
        return pair(lerpN(0.058, 0.045, u), lerpN(0.05, 0.04, u));
      },
      { from: 0.48, to: 1, section: "box", color: WHITE },
    );
    b.part(new THREE.SphereGeometry(0.066, 10, 8), WHITE, {
      bone: knee,
      at: [kx, 0.52, 0.085],
      scale: [1, 1, 0.6],
    });
    b.extrude(BOOT_SHAPE, {
      at: [0.11 * s, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.1,
      bevel: 0.012,
      smoothing: 1,
      color: BOOT_PAINT,
      bone: ankle,
    });
  }

  // Staff -----------------------------------------------------------------------------------------------
  const ORB: [number, number, number] = [-0.47, 1.8, 0.12];
  const TOP: [number, number, number] = [-0.47, 1.72, 0.12];
  const STAFF_DIR: [number, number, number] = [0.024, 1, -0.047];

  // Ferrule on the floor, white shaft rigid on the hand, gold collar and a rune band.
  b.part(new THREE.CylinderGeometry(0.024, 0.02, 0.05, 10), GOLD, { bone: handR, at: [-0.5, 0.025, 0.2] });
  const shaft = polyline([
    [-0.5, 0, 0.2],
    [-0.488, 0.99, 0.155],
    TOP,
  ]);
  b.sweep(shaft, 0.018, { bone: handR, color: WHITE, caps: { start: "flat", end: "flat" } });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.13, 16, 1, true), "#ffffff", {
    bone: handR,
    at: [-0.4816, 1.25, 0.1425],
    dir: STAFF_DIR,
    texture: tex.runes,
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), GOLD, {
    bone: handR,
    at: [-0.4754, 1.5, 0.1305],
    dir: STAFF_DIR,
  });

  // Three gold prongs cradle the orb.
  for (let i = 0; i < 3; i++) {
    const a = (i * TAU) / 3 + 0.3;
    const tip: [number, number, number] = [ORB[0] + 0.075 * Math.cos(a), ORB[1] - 0.01, ORB[2] + 0.075 * Math.sin(a)];
    const lift: [number, number, number] = [ORB[0] + 0.11 * Math.cos(a), ORB[1] + 0.09, ORB[2] + 0.11 * Math.sin(a)];
    b.sweep(bezier(TOP, lift, tip), 0.008, { bone: handR, color: GOLD });
  }

  // The orb: a faceted cyan crystal, and motes of light drifting above it.
  glow(b.part(new THREE.IcosahedronGeometry(0.05, 0), C.cyan, { bone: handR, at: ORB }), 1.6);
  const motes = Array.from({ length: 14 }, () =>
    frame(
      [ORB[0] + (rand() - 0.5) * 0.26, ORB[1] + (rand() - 0.1) * 0.22, ORB[2] + (rand() - 0.5) * 0.2],
      [0, 1, 0],
    ),
  );
  glow(b.cards(motes, tex.mote, { size: [0.035, 0.05], lean: 0, bone: handR }), 1.4);

  return b.root;
}
```