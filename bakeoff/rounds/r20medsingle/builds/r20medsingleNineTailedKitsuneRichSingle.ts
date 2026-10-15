import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A towering white spirit fox with crimson kumadori markings, gold shrine trim, a shimenawa rope with paper shide, nine plumed tails each tipped with a drifting kitsune-bi flame, and hitodama orbs floating around her.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const WHITE = cel("#fff8f0", "#cfc5ee");
const LAV = cel("#e6defb", "#b2a5dd");
const CRIM = cel("#d8283f", "#a31a45");
const SOCK = cel("#43396f", "#2a2150");
const GOLD = cel("#f6c64a", "#d4922a");
const GOLD_FLAT = "#f6c64a";
const IVORY = "#f5ecd8";
const BELLY = furEdge(WHITE, LAV, { level: -0.4, teeth: 0.22, period: 0.045 });
const BODY = furEdge(CRIM, BELLY, { level: 0.8, teeth: 0.14, period: 0.05, ink: INK, inkWidth: 0.04 });
const LEGC = paint((p) => (p.y < 0.17 + 0.05 * zigzag((p.x + p.z) / 0.05) ? SOCK : WHITE));
const ROPE = cel(stripes("#f3dfa0", "#b98f45", { size: 0.025, axis: [1, 1, 1] }));

// ---------------------------------------------------------------- textures
const flameTex = (c1: string, c2: string, c3: string) =>
  svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 126 C6 106 8 72 28 46 C36 34 28 16 38 2 C48 26 60 54 56 84 C54 108 44 120 32 126Z" fill="${c1}"/>
      <path d="M32 120 C16 104 18 80 32 60 C36 70 34 52 40 40 C50 66 50 100 32 120Z" fill="${c2}"/>
      <path d="M32 114 C24 104 26 90 32 80 C40 90 40 106 32 114Z" fill="${c3}"/>
    </svg>`,
    { size: 128 },
  );
const tuftTex = (fill: string, shade: string, line: string) =>
  svg(
    `<svg viewBox="0 0 32 64">
      <path d="M16 63 C4 48 6 24 16 2 C26 24 28 48 16 63Z" fill="${fill}" stroke="${line}" stroke-width="2"/>
      <path d="M16 62 C6 48 8 26 16 4 C14 26 14 48 16 62Z" fill="${shade}"/>
    </svg>`,
    { size: 128 },
  );
const shideTex = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M16 0 L8 14 L24 28 L8 42 L24 56 L16 64" stroke="#8a7fb5" stroke-width="14" fill="none" stroke-linejoin="miter"/>
    <path d="M16 0 L8 14 L24 28 L8 42 L24 56 L16 64" stroke="#ffffff" stroke-width="9" fill="none" stroke-linejoin="miter"/>
  </svg>`,
  { size: 128 },
);
const swirlTex = svg(
  `<svg viewBox="0 0 64 64">
    <path d="M32 32 c0 -6 8 -6 8 0 c0 10 -16 10 -16 -2 c0 -16 26 -16 26 2 c0 22 -36 22 -36 -4 c0 -6 3 -11 5 -13" stroke="#d8283f" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);
const cheekTex = svg(
  `<svg viewBox="0 0 64 56">
    <path d="M62 18 Q30 6 2 22 Q32 22 62 30Z" fill="#d8283f"/>
    <path d="M60 38 Q34 34 8 48 Q34 48 60 48Z" fill="#d8283f"/>
  </svg>`,
  { size: 192 },
);
const foreheadTex = svg(
  `<svg viewBox="0 0 32 60">
    <path d="M16 0 L27 22 L16 58 L5 22Z" fill="#d8283f"/>
    <path d="M16 12 L21 24 L16 44 L11 24Z" fill="#f6c64a"/>
  </svg>`,
  { size: 192 },
);

const FLAME_BLUE = flameTex("#3fb8ff", "#9be8ff", "#f0fdff");
const FLAME_VIOLET = flameTex("#8e6bff", "#c9b4ff", "#f6f0ff");
const TUFT_W = tuftTex("#fff8f0", "#d8d0f0", "#8a7fb5");
const TUFT_R = tuftTex("#e23a4d", "#b01f46", "#6a1238");

const last = <T>(a: T[]): T => a[a.length - 1];

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.45], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, -0.45],
      [0, 0.66, -0.12],
      [0, 0.7, 0.22],
      [0, 0.74, 0.5],
    ]),
    { parent: hips, role: "spine", count: 4 },
  );
  const chest = last(spine.joints);
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.74, 0.5],
      [0, 0.86, 0.56],
      [0, 0.97, 0.66],
    ]),
    { parent: chest, role: "neck", count: 3 },
  );
  const head = b.joint("head", { parent: last(neck.joints), at: [0, 0.97, 0.66], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.9, 0.745], aim: [0, 0.89, 0.93], role: "jaw" });

  // ---------------------------------------------------------------- body and neck
  const bodyTube = b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * Math.min(t * 1.1, 1));
      return [0.1 + 0.045 * k, 0.12 + 0.075 * k];
    },
    { color: BODY, name: "body" },
  );
  const neckTube = b.sweep(neck, (t) => 0.105 - 0.035 * t, { color: BELLY, name: "neck" });
  const bodySurf = b.surface(bodyTube);
  const neckSurf = b.surface(neckTube);

  // flank swirls
  for (const s of [1, -1]) {
    const hit1 = bodySurf.around([0, 0.66, 0.3]).at(s * 90, 25);
    if (hit1) b.decal(bodySurf, swirlTex, { at: hit1, size: [0.17, 0.17], mirror: s > 0, name: "swirlFront" });
    const hit2 = bodySurf.around([0, 0.64, -0.14]).at(s * 90, 30);
    if (hit2) b.decal(bodySurf, swirlTex, { at: hit2, size: [0.14, 0.14], mirror: s < 0, roll: 25, name: "swirlBack" });
  }

  // chest and neck ruff
  b.cards(
    neckSurf.scatter(70, { rng: rng(2), minDist: 0.03, filter: (h) => h.n.y < 0.55 }),
    TUFT_W,
    { size: [0.05, 0.1], lean: 60, flow: [0, -1, -0.4], vary: 0.25, spin: 15, rng: rng(3) },
  );
  b.cards(
    bodySurf.scatter(60, {
      rng: rng(4),
      minDist: 0.035,
      filter: (h) => h.at.z > 0.3 && h.n.z > 0.2 && h.n.y < 0.3,
    }),
    TUFT_W,
    { size: [0.055, 0.12], lean: 55, flow: [0, -1, -0.3], vary: 0.25, spin: 15, rng: rng(5) },
  );

  // shimenawa rope with paper shide
  const ropeLoop = neckSurf.loop(neck.at(0.1), { lift: 0.014 });
  b.sweep(ropeLoop, 0.022, { color: ROPE, name: "shimenawa", bone: neck.joints[0] });
  const shideFrames = Array.from({ length: 8 }, (_, i) => frame(ropeLoop.at((i + 0.5) / 8), [0, 1, 0]));
  b.cards(shideFrames, shideTex, { size: [0.045, 0.095], lean: 180, flow: [0, 0, 1], bone: neck.joints[0] });

  // gold collar with crimson beads and pendant
  const collar = neckSurf.loop(neck.at(0.55), { lift: 0.012 });
  b.sweep(collar, 0.011, { color: GOLD, name: "collar", bone: neck.joints[1] });
  for (let i = 0; i < 10; i++)
    b.part(new THREE.SphereGeometry(0.017, 6, 4), CRIM, {
      at: collar.at((i + 0.5) / 10),
      bone: neck.joints[1],
      name: "bead",
    });
  const pendantHit = neckSurf.nearest([0, 0.8, 0.66]);
  b.stick(new THREE.CylinderGeometry(0.034, 0.034, 0.01, 10), GOLD, pendantHit, { name: "pendant" });
  glow(b.stick(new THREE.SphereGeometry(0.018, 6, 4), "#ff3355", pendantHit.moved([0, 0.012, 0]), { embed: 0.2 }), 1);

  // ---------------------------------------------------------------- head
  const HEAD_C: [number, number, number] = [0, 0.99, 0.72];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), WHITE, {
    bone: head,
    at: HEAD_C,
    scale: [0.095, 0.085, 0.1],
    name: "skull",
  });
  const skin = b.surface(skull);
  b.sweep(
    [
      [0, 0.965, 0.74],
      [0, 0.935, 0.95],
    ],
    (t) => [0.058 - 0.03 * t, 0.05 - 0.026 * t],
    { color: WHITE, bone: head, name: "muzzle" },
  );
  b.sweep(
    [
      [0, 0.895, 0.75],
      [0, 0.89, 0.925],
    ],
    [0.04, 0.02],
    { color: LAV, bone: jaw, name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
    bone: head,
    at: [0, 0.937, 0.965],
    scale: [0.024, 0.018, 0.02],
    name: "nose",
  });
  for (const s of [1, -1]) {
    b.spike([s * 0.025, 0.918, 0.9], [0, -1, 0], 0.024, 0.007, { color: "#ffffff", bone: head, name: "fangUp" });
    b.spike([s * 0.02, 0.9, 0.9], [0, 1, 0], 0.016, 0.006, { color: "#ffffff", bone: jaw, name: "fangLow" });
    for (let i = 0; i < 3; i++)
      b.rod(
        [s * 0.045, 0.94 + i * 0.006, 0.88],
        [s * 0.2, 0.96 + (i - 1) * 0.045, 0.83 - i * 0.03],
        [0.004, 0.0015],
        { color: "#fdf6ff", bone: head, sides: 4, name: "whisker" },
      );
  }

  const EYE = animeEye({ iris: "#ffc72e" });
  for (const s of [1, -1]) {
    const eyeHit = skin.around(HEAD_C).at(s * 38, 2);
    if (eyeHit) b.decal(skin, EYE, { at: eyeHit, size: [0.056, 0.077], mirror: s > 0, name: "eye" });
    const cheekHit = skin.around(HEAD_C).at(s * 60, -8);
    if (cheekHit) b.decal(skin, cheekTex, { at: cheekHit, size: [0.08, 0.07], mirror: s > 0, name: "cheekMark" });
  }
  const browHit = skin.around(HEAD_C).at(0, 68);
  if (browHit) b.decal(skin, foreheadTex, { at: browHit, size: [0.034, 0.064], name: "foreheadMark" });
  const gemHit = skin.around(HEAD_C).at(0, 46);
  if (gemHit) {
    glow(b.stick(new THREE.SphereGeometry(0.014, 6, 4), "#ff3355", gemHit, { embed: 0.3, name: "gem" }), 1);
    b.stick(new THREE.TorusGeometry(0.022, 0.005, 5, 10).rotateX(Math.PI / 2), GOLD, gemHit, {
      embed: 0.4,
      name: "gemRing",
    });
  }
  b.cards(
    skin.scatter(70, { rng: rng(6), minDist: 0.03, filter: (h) => Math.abs(h.n.x) > 0.45 && h.at.z < 0.74 }),
    TUFT_W,
    { size: [0.04, 0.08], lean: 65, vary: 0.2, spin: 12, rng: rng(7) },
  );

  // ears
  const EAR: OutlinePoint[] = [
    [-0.055, 0],
    [0.055, 0],
    [0.045, 0.1],
    [0, 0.23, "sharp"],
    [-0.045, 0.1],
  ];
  const EAR_IN: OutlinePoint[] = [
    [-0.034, 0.015],
    [0.034, 0.015],
    [0.026, 0.1],
    [0, 0.19, "sharp"],
    [-0.026, 0.1],
  ];
  const earPaint = paint((_p, _n, s) => (s[1] > 0.17 ? SOCK : WHITE));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const earBase: [number, number, number] = [s * 0.065, 1.05, 0.68];
    const earJ = b.joint(`ear${S}`, { parent: head, at: earBase, dir: [s * 0.25, 1, -0.15], role: "hinge" });
    b.extrude(EAR, {
      at: earBase,
      x: [s, 0, 0],
      y: [s * 0.25, 1, -0.2],
      thickness: 0.02,
      bevel: 0.004,
      color: earPaint,
      bone: earJ,
      name: "ear",
    });
    b.extrude(EAR_IN, {
      at: [earBase[0], earBase[1], earBase[2] + 0.0115],
      x: [s, 0, 0],
      y: [s * 0.25, 1, -0.2],
      thickness: 0.012,
      color: CRIM,
      bone: earJ,
      name: "earInner",
    });
    // ear tassel
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { bone: head, at: [s * 0.1, 1.0, 0.68], name: "earBall" });
    b.rod([s * 0.1, 1.0, 0.68], [s * 0.11, 0.91, 0.67], 0.004, { color: GOLD_FLAT, bone: head, sides: 4 });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), CRIM, { bone: head, at: [s * 0.11, 0.9, 0.67], name: "earTassel" });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fPts = limb([s * 0.1, 0.62, 0.38], [s * 0.1, 0.04, 0.4], [0.31, 0.31], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${S}`, fPts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `paw${S}`],
      role: "leg",
    });
    const fTube = b.sweep(fLeg, [0.06, 0.04, 0.028, 0.026], { color: LEGC, name: "foreleg" });
    // hind
    const hPts = limb(
      [s * 0.11, 0.62, -0.4],
      [s * 0.1, 0.04, -0.38],
      [0.28, 0.28, 0.18],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${S}`, hPts, {
      parent: hips,
      names: [`hipH${S}`, `kneeH${S}`, `hockH${S}`, `pawH${S}`],
      role: "leg",
    });
    const hTube = b.sweep(hLeg, [0.09, 0.055, 0.028, 0.024, 0.026], { color: LEGC, name: "hindleg" });
    // anklets
    for (const [tube, leg, t] of [
      [fTube, fLeg, 0.82],
      [hTube, hLeg, 0.8],
    ] as const) {
      const ring = b.surface(tube).loop(leg.at(t), { lift: 0.008 });
      b.sweep(ring, 0.007, { color: GOLD, name: "anklet" });
    }
    // paws
    for (const [leg, x, z] of [
      [fLeg, s * 0.1, 0.4],
      [hLeg, s * 0.1, -0.38],
    ] as const) {
      const paw = leg.tip ?? last(leg.joints);
      b.part(new THREE.SphereGeometry(1, 8, 6), SOCK, {
        bone: paw,
        at: [x, 0.036, z + 0.025],
        scale: [0.05, 0.036, 0.07],
        name: "paw",
      });
      for (let i = -1; i <= 1; i++)
        b.spike([x + i * 0.02, 0.03, z + 0.085], [i * 0.15, -0.2, 1], 0.03, 0.007, {
          color: IVORY,
          bone: paw,
          name: "claw",
        });
    }
  }

  // ---------------------------------------------------------------- tails
  const B = new THREE.Vector3(0, 0.7, -0.52);
  b.part(new THREE.SphereGeometry(1, 8, 6), WHITE, { bone: hips, at: [0, 0.68, -0.55], scale: [0.11, 0.11, 0.12], name: "rump" });
  for (let k = 0; k < 9; k++) {
    const u = (k - 4) / 4;
    const phi = u * 80 * DEG;
    const elev = (30 - 14 * Math.abs(u) + (k % 2) * 5) * DEG;
    const len = 0.95 + 0.12 * (1 - Math.abs(u));
    const d = new THREE.Vector3(Math.sin(phi) * Math.cos(elev), Math.sin(elev), -Math.cos(phi) * Math.cos(elev));
    const pt = (dist: number, lift: number) => B.clone().addScaledVector(d, dist).add(new THREE.Vector3(0, lift, 0));
    const tail = b.chain(`tail${k}_`, catmull([B.clone(), pt(0.3, 0.04), pt(0.62, 0.14), pt(len, 0.3)]), {
      parent: hips,
      role: "tail",
      count: 4,
    });
    const tube = b.sweep(tail, (t) => 0.03 + 0.085 * Math.sin(Math.PI * Math.pow(Math.min(t, 1), 0.65)), {
      color: WHITE,
      bands: [
        [0.15, LAV],
        [0.72, WHITE],
        [1, CRIM],
      ],
      caps: { start: "round", end: "point" },
      name: "tail",
    });
    const tSurf = b.surface(tube);
    const ring = tSurf.loop(tail.at(0.7), { lift: 0.01 });
    b.sweep(ring, 0.009, { color: GOLD, name: "tailRing" });
    const tipV = tail.at(1).at.clone();
    const flow = [d.x, d.y + 0.2, d.z];
    b.cards(
      tSurf.scatter(18, { rng: rng(20 + k), minDist: 0.06, filter: (h) => h.at.distanceTo(tipV) > 0.3 }),
      TUFT_W,
      { size: [0.05, 0.11], lean: 70, flow, vary: 0.25, spin: 15, rng: rng(40 + k) },
    );
    b.cards(
      tSurf.scatter(7, { rng: rng(60 + k), minDist: 0.05, filter: (h) => h.at.distanceTo(tipV) < 0.28 }),
      TUFT_R,
      { size: [0.045, 0.1], lean: 70, flow, vary: 0.25, spin: 15, rng: rng(80 + k) },
    );
    // kitsune-bi flame
    const tex = k % 2 === 0 ? FLAME_BLUE : FLAME_VIOLET;
    glow(
      b.cards([frame(tipV, [0, 1, 0])], tex, {
        size: [0.17, 0.32],
        cross: true,
        bend: 12,
        flow: [0.2 * Math.sin(phi), 0, -0.3],
        bone: last(tail.joints),
        name: "flame",
      }),
      1.2,
    );
  }

  // ---------------------------------------------------------------- hitodama orbs
  const heights = [0.4, 1.0, 0.65, 1.3, 0.5, 1.1, 0.8];
  for (let i = 0; i < 7; i++) {
    const a = (-150 + i * 50) * DEG;
    const pos: [number, number, number] = [Math.sin(a) * 1.0, heights[i], Math.cos(a) * 0.9 + 0.1];
    glow(
      b.part(new THREE.SphereGeometry(0.035, 6, 4), i % 2 ? "#e9dcff" : "#d9f6ff", {
        bone: hips,
        at: pos,
        name: "orb",
      }),
      1.3,
    );
    glow(
      b.cards([frame([pos[0], pos[1] + 0.02, pos[2]], [0, 1, 0])], i % 2 ? FLAME_VIOLET : FLAME_BLUE, {
        size: [0.13, 0.22],
        cross: true,
        bone: hips,
        name: "orbFlame",
      }),
      1.1,
    );
  }

  return b.root;
}
