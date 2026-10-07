import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { paint } from "../src/paint";
import { catmull } from "../src/path";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A fox spirit on four legs with nine fanned tails, each tip wrapped in blue spirit fire, a gold circlet and collar, and gold-tipped ears.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

// Palette: one cel paint per surface colour.
const ORANGE = cel("#ff8d3b");
const BODY = cel(furEdge("#ff8d3b", "#fff0d6", { level: -0.25, teeth: 0.26, period: 0.04, ink: INK, inkWidth: 0.03 }));
const CREAM = cel("#fff3dc", "#f1c99a");
const SOCK = cel("#3d2a5c", INK);
const GOLD = cel("#ffd86b", "#c7862a");
const NOSE = cel("#2b1a3e", INK);
const TOE = cel("#ff9fc0", "#d4607f");

// Spirit fire: self-lit flat colours (kits/glow).
const FIRE = "#6fe9ff";
const FIRE_CORE = "#f4feff";
const GEM = "#8ff3ff";

// Legs: dark socks from the carpus and hock down.
const legPaint = paint((_p, _n, s) => (s[0] > 0.7 ? SOCK : ORANGE));

// Tails: cream tips, two gold rings.
const tailPaint = paint((_p, _n, s) => {
  const t = s[0];
  if (t > 0.82) return CREAM;
  if (Math.abs(t - 0.42) < 0.016 || Math.abs(t - 0.62) < 0.01) return GOLD;
  return ORANGE;
});

// Ears: cream inner ear, gold tip, orange outer.
const earPaint = paint((_p, n, s) => {
  const inside = s[1] > 0.04 && s[1] < 0.2 && Math.abs(s[0]) < 0.06 * (1 - s[1] / 0.27) && Math.abs(n.z) > 0.4;
  if (inside) return CREAM;
  return s[1] > 0.23 ? GOLD : ORANGE;
});

// Drawings.
const EYE = animeEye({ iris: "#ffb42e", irisLight: "#ffe27a" });

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
  <path d="M20 64 C8 52 3 32 10 12 C14 26 16 38 20 42 C24 30 28 18 32 8 C36 28 34 48 20 64Z" fill="#ffffff"/>
  <path d="M20 64 C14 50 16 36 20 30 C24 40 30 50 20 64Z" fill="#d8d8d8"/>
</svg>`,
  { size: 128 },
);

const FLAME = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
  <path d="M32 2 C42 24 60 40 58 64 C56 84 45 94 32 94 C19 94 6 84 6 64 C4 42 22 26 32 2Z" fill="#5fdcff"/>
  <path d="M32 26 C38 44 48 54 46 70 C44 82 38 88 32 88 C26 88 19 82 18 70 C17 56 27 46 32 26Z" fill="#c9f6ff"/>
</svg>`,
  { size: 256 },
);

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
  <rect x="11" y="0" width="10" height="18" rx="4" fill="#ffd86b"/>
  <path d="M16 18 L6 92 M16 18 L11 92 M16 18 L16 94 M16 18 L21 92 M16 18 L26 92" stroke="#ffd86b" stroke-width="2.4" fill="none"/>
</svg>`,
  { size: 192 },
);

const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#ffd86b" stroke-width="3.2" stroke-linecap="round">
  <path d="M4 60 C4 28 28 4 60 4"/>
  <path d="M14 60 C14 36 34 14 60 14"/>
  <circle cx="30" cy="32" r="7"/>
  <path d="M30 25 C36 18 46 22 42 32"/>
  <path d="M23 32 C18 40 24 50 34 46"/>
  <circle cx="54" cy="52" r="4" fill="#ffd86b"/>
</svg>`,
  { size: 256 },
);

// Flame outlines for the tail tips, lathed along the tail.
const FLAME_OUTLINE: OutlinePoint[] = [
  [0, -0.04],
  [0.07, -0.04],
  [0.08, 0.03],
  [0.05, 0.1],
  [0.072, 0.17],
  [0.03, 0.24],
  [0, 0.33, "sharp"],
];
const CORE_OUTLINE: OutlinePoint[] = [
  [0, -0.03],
  [0.03, -0.03],
  [0.036, 0.04],
  [0.02, 0.13],
  [0, 0.2, "sharp"],
];
// Small standing flames on the ground beside the paws.
const GROUND_FLAME: OutlinePoint[] = [
  [0, 0],
  [0.05, 0],
  [0.055, 0.04],
  [0.035, 0.09],
  [0.045, 0.125],
  [0.012, 0.18],
  [0, 0.2, "sharp"],
];
const EAR_OUTLINE: OutlinePoint[] = [
  [-0.098, 0],
  [0.098, 0],
  [0.072, 0.156],
  [0, 0.27, "sharp"],
  [-0.072, 0.156],
];

export default function build() {
  const b = createBuilder({ name: "nine-tailed-kitsune" });

  // Skeleton: hips root, spine, neck, head with jaw; ears and tails hang off it.
  const hips = b.joint("hips", { at: [0, 0.86, -0.42], aim: [0, 0.87, -0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.42],
      [0, 0.88, -0.2],
      [0, 0.9, 0.02],
      [0, 0.93, 0.24],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.93, 0.24],
      [0, 1.0, 0.36],
      [0, 1.05, 0.48],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.05, 0.48],
    aim: [0, 0.97, 0.82],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, up: -0.1 }),
    aim: head.local({ forward: 0.34, up: -0.13 }),
    role: "jaw",
  });

  // Body: one loft along the spine, haunch, waist, deep chest.
  const body = b.loft(
    [
      { at: spine.at(0), w: 0.26, h: 0.3 },
      { at: spine.at(0.15), w: 0.4, h: 0.4 },
      { at: spine.at(0.5), w: 0.36, h: 0.36 },
      { at: spine.at(0.8), w: 0.42, h: 0.42 },
      { at: spine.at(1), w: 0.26, h: 0.28 },
    ],
    { bone: spine, color: BODY },
  );
  b.loft(
    [
      { at: neck.at(0), w: 0.3, h: 0.3 },
      { at: neck.at(0.5), w: 0.24, h: 0.24 },
      { at: neck.at(1), w: 0.2, h: 0.2 },
    ],
    { bone: neck, color: BODY },
  );

  // Gold filigree on both flanks.
  const bodySkin = b.surface(body);
  for (const s of [1, -1]) {
    const hit = bodySkin.around(spine.at(0.3)).at(s * 80, 8);
    if (hit) b.decal(bodySkin, FILIGREE, { at: hit, size: [0.17, 0.17], mirror: s > 0 });
  }

  // Head: skull, cream muzzle underside, jaw.
  const skull = b.loft(
    [
      { at: head.local({ forward: -0.16, up: 0.02 }), w: 0.2, h: 0.23 },
      { at: head.local({ forward: -0.02, up: 0.03 }), w: 0.26, h: 0.25 },
      { at: head.local({ forward: 0.11, up: 0.0 }), w: 0.23, h: 0.2 },
      { at: head.local({ forward: 0.23, up: -0.02 }), w: 0.15, h: 0.135 },
      { at: head.local({ forward: 0.32, up: -0.03 }), w: 0.09, h: 0.09 },
      { at: head.local({ forward: 0.38, up: -0.035 }), w: 0.035, h: 0.035 },
    ],
    { bone: head, color: BODY },
  );
  b.loft(
    [
      { at: head.local({ forward: 0.02, up: -0.06 }), w: 0.23, h: 0.14 },
      { at: head.local({ forward: 0.16, up: -0.07 }), w: 0.17, h: 0.115 },
      { at: head.local({ forward: 0.28, up: -0.06 }), w: 0.11, h: 0.09 },
      { at: head.local({ forward: 0.38, up: -0.045 }), w: 0.045, h: 0.045 },
    ],
    { bone: head, color: CREAM },
  );
  b.loft(
    [
      { at: jaw.local({ forward: 0.0, up: 0.0 }), w: 0.14, h: 0.055 },
      { at: jaw.local({ forward: 0.12, up: -0.01 }), w: 0.09, h: 0.04 },
      { at: jaw.local({ forward: 0.24, up: 0.0 }), w: 0.04, h: 0.03 },
    ],
    { bone: jaw, color: CREAM },
  );
  b.part(new THREE.SphereGeometry(0.036, 10, 8), NOSE, {
    bone: head,
    at: head.local({ forward: 0.39, up: -0.02 }),
  });
  b.sweep(
    catmull([
      head.local({ forward: 0.06, up: -0.08 }),
      head.local({ forward: 0.2, up: -0.1 }),
      head.local({ forward: 0.33, up: -0.07 }),
    ]),
    0.007,
    { bone: jaw, color: INK },
  );
  for (const s of [1, -1]) {
    b.spike(head.local({ left: s * 0.04, forward: 0.22, up: -0.085 }), [0, -1, 0], 0.04, 0.011, {
      bone: head,
      color: CREAM,
    });
  }

  // Eyes: anime decals conformed to the skull.
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(head.local({ forward: 0.07, up: 0.02 })).at(s * 28, 8);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.072, 0.098], mirror: s > 0 });
  }

  // Gold circlet and a spirit gem on the brow.
  const crown: THREE.Vector3[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    crown.push(head.local({ left: Math.cos(a) * 0.146, up: Math.sin(a) * 0.14, forward: 0.0 }));
  }
  b.sweep(catmull(crown, { closed: true }), 0.008, { bone: head, color: GOLD });
  glow(
    b.part(new THREE.OctahedronGeometry(0.024, 0), GEM, {
      bone: head,
      at: head.local({ forward: 0.14, up: 0.1 }),
    }),
    1.4,
  );

  // Ears: hinge joints with gold-tipped fins.
  for (const s of [1, -1]) {
    const ear = b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: head.local({ left: s * 0.085, up: 0.12, forward: -0.07 }),
      dir: [s * 0.12, 1, -0.22],
      role: "hinge",
    });
    b.extrude(EAR_OUTLINE, {
      at: ear.at,
      x: [s, 0, 0],
      y: [s * 0.25, 1, -0.2],
      thickness: 0.024,
      bevel: 0.007,
      smoothing: 1,
      color: earPaint,
      bone: ear,
    });
  }

  // Legs: front and hind, three segments each, paws on the floor, gold anklets.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const fore = limb(
      [s * 0.12, 0.8, 0.2],
      [s * 0.13, 0.035, 0.25],
      [0.3, 0.3, 0.2],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const foreLeg = b.chain(`foreLeg${side}`, fore, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `forePaw${side}`],
      role: "leg",
    });
    const foreTube = b.sweep(foreLeg, (t) => 0.034 + 0.05 * (1 - t), { color: legPaint });
    b.sweep(b.surface(foreTube).loop(foreLeg.joints[2], { lift: 0.008 }), 0.007, { color: GOLD });
    const fTip = fore[3];
    b.capsule(fore[2], [fTip.x, 0.034, fTip.z + 0.07], [0.036, 0.03], {
      bone: foreLeg.tip!,
      color: SOCK,
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), TOE, {
        bone: foreLeg.tip!,
        at: [fTip.x + k * 0.022, 0.034, fTip.z + 0.09],
      });
    }

    const hind = limb(
      [s * 0.12, 0.86, -0.42],
      [s * 0.13, 0.035, -0.4],
      [0.34, 0.32, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hindLeg = b.chain(`hindLeg${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
      role: "leg",
    });
    const hindTube = b.sweep(hindLeg, (t) => 0.04 + 0.08 * Math.exp(-3.5 * t), { color: legPaint });
    b.sweep(b.surface(hindTube).loop(hindLeg.joints[2], { lift: 0.008 }), 0.007, { color: GOLD });
    const hTip = hind[3];
    b.capsule(hind[2], [hTip.x, 0.034, hTip.z + 0.08], [0.04, 0.034], {
      bone: hindLeg.tip!,
      color: SOCK,
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), TOE, {
        bone: hindLeg.tip!,
        at: [hTip.x + k * 0.024, 0.034, hTip.z + 0.1],
      });
    }

    // A small spirit flame on the floor beside each paw.
    glow(b.lathe(GROUND_FLAME, { at: [s * 0.25, 0, 0.22], axis: [0, 1, 0], smoothing: 1, color: FIRE }), 1.2);
    glow(b.lathe(CORE_OUTLINE, { at: [s * 0.25, 0, 0.22], axis: [0, 1, 0], smoothing: 1, color: FIRE_CORE }), 2);
    glow(b.lathe(GROUND_FLAME, { at: [s * 0.26, 0, -0.36], axis: [0, 1, 0], smoothing: 1, color: FIRE }), 1.2);
    glow(b.lathe(CORE_OUTLINE, { at: [s * 0.26, 0, -0.36], axis: [0, 1, 0], smoothing: 1, color: FIRE_CORE }), 2);
  }

  // Gold waist band, gold collar with studs and two hanging tassels.
  const waist = b.surface(body).loop(spine.at(0.45), { lift: 0.012 });
  b.sweep(waist, 0.011, { color: GOLD });
  const collarRing = b.ring(neck.at(0.12), { count: 20, radius: 0.175 });
  const collar = catmull(collarRing.items, { closed: true });
  b.sweep(collar, 0.011, { color: GOLD, bone: neck });
  b.along(collar, 20, (at) => {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at });
  });
  for (const s of [1, -1]) {
    const p = neck.at(0.12).local({ forward: 0.18, left: s * 0.05, up: -0.02 });
    b.cards([frame(p, [0, 1, 0])], TASSEL, { size: [0.035, 0.12], lean: 180 });
  }

  // Fur: tufts over the body, a cream bib on the chest.
  const bodyHits = b.surface(body).scatter(110, { rng: rng(11), minDist: 0.075, filter: (h) => h.n.y > 0.35 });
  b.cards(bodyHits, TUFT, { size: [0.06, 0.09], lean: 30, bend: 25, vary: 0.25, rng: rng(12), color: ORANGE });
  const bibHits = b.surface(body).scatter(40, { rng: rng(13), minDist: 0.05, filter: (h) => h.n.z > 0.6 && h.n.y < 0.3 });
  b.cards(bibHits, TUFT, { size: [0.05, 0.08], lean: 25, bend: 20, vary: 0.2, rng: rng(14), color: CREAM });

  // Nine tails fanned from the rump, each with a flame at its tip.
  const tailSweeps = [];
  for (let i = 0; i < 9; i++) {
    const deg = -80 + 20 * i;
    const th = (deg * Math.PI) / 180;
    const phi = ((40 - 0.25 * Math.abs(deg)) * Math.PI) / 180;
    const L = 1.05 - 0.15 * (Math.abs(deg) / 80);
    const base = [0.05 * Math.sin(th), 0.98, -0.52];
    const dir = [Math.sin(th) * Math.cos(phi), Math.sin(phi), -Math.cos(th) * Math.cos(phi)];
    // Points along the tail: f along its length, lx sideways bow, ly lift.
    const at = (f: number, lx: number, ly: number) => [
      base[0] + L * f * dir[0] + Math.sin(th) * lx,
      base[1] + L * f * dir[1] + ly,
      base[2] + L * f * dir[2],
    ];
    const tail = b.chain(
      `tail${i + 1}`,
      catmull([base, at(0.33, 0.03, 0.05), at(0.68, 0.05, 0.02), at(1, 0.08, 0.07)]),
      { parent: hips, names: [`tail${i + 1}_1`, `tail${i + 1}_2`, `tail${i + 1}_3`], role: "tail" },
    );
    tailSweeps.push(
      b.sweep(tail, (t) => 0.03 + 0.07 * Math.sin(Math.PI * Math.min(t * 0.95 + 0.05, 1)), { color: tailPaint }),
    );

    const tip = tail.at(1);
    glow(b.lathe(FLAME_OUTLINE, { at: tip, axis: tip, smoothing: 1, color: FIRE }), 1.5);
    glow(b.lathe(CORE_OUTLINE, { at: tip, axis: tip, smoothing: 1, color: FIRE_CORE }), 2);
    glow(b.cards([tip], FLAME, { size: [0.16, 0.26], cross: true }), 1.2);
    // Two embers drifting off each flame.
    glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), GEM, { at: tip.moved([0.05, 0.22, 0.03]) }), 1.5);
    glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), FIRE_CORE, { at: tip.moved([-0.06, 0.3, -0.02]) }), 1.8);
  }

  // Fur tufts along the tails.
  const tailHits = b.surface(tailSweeps).scatter(120, { rng: rng(21), minDist: 0.06 });
  b.cards(tailHits, TUFT, { size: [0.07, 0.12], lean: 25, bend: 20, vary: 0.2, rng: rng(22), color: ORANGE });

  return b.root;
}
