import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Jade-scaled qilin: dragon head, branching ivory antlers with glowing tips, cloud mane and tail, flame fetlocks, cloven golden hooves, gold collar and flank swirls.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: cel-shaded paints (lit + hue-shifted shadow) and one glow colour.
const GLOWC = "#7ff5e0";
const GOLDC = cel("#f4b93c", "#c9772a");
const IVORYC = cel("#fff0c4", "#e4c58e");
const CREAMC = cel("#fff3d6", "#f3cf9c");
const HOOFC = cel("#7a4d34", "#3f2a2e");
const NOSEC = cel("#f28a62");
const EARD = cel("#1c8f94");
const EARI = cel("#ff8a6a");
const JADEC = cel("#35c9ae");

const scalesBack = scales(["#2fb7a0", "#38c8ad", "#26a08f"], "#126f7a", { size: 0.06, width: 0.14, seed: 3 });
const scalesBelly = scales(["#fff1d0", "#ffe6b4"], "#e0b57a", { size: 0.06, width: 0.12, seed: 3 });
const COAT = cel(furEdge(scalesBack, scalesBelly, { level: -0.2, teeth: 0.22, period: 0.05, ink: "#16626b" }));
// Body, neck and tail: a dashed gold stripe along the dorsal line.
const BODY = paint((_p, _n, s) => {
  const d = Math.min(s[1], 360 - s[1]);
  return d < 8 && Math.floor(s[0] * 36) % 2 === 0 ? GOLDC : COAT;
});
// Legs: scaled, gold anklet, cream sock.
const LEG = paint((p) => (p.y < 0.2 ? CREAMC : p.y < 0.245 ? GOLDC : COAT));

// ---------------------------------------------------------------------------------------------------------------
// Textures
type Circle = [number, number, number];
const plumeCircles: Circle[] = [
  [32, 104, 22],
  [22, 80, 16],
  [38, 60, 14],
  [28, 40, 11],
  [40, 22, 8],
];
const PLUME = svg(
  `<svg viewBox="0 0 64 128">
  ${plumeCircles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f2b33a" stroke="#f2b33a" stroke-width="5"/>`).join("")}
  ${plumeCircles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#a9d9ee"/>`).join("")}
  ${plumeCircles.map(([x, y, r]) => `<circle cx="${x - 2}" cy="${y - 3}" r="${r - 3.5}" fill="#f6fcff"/>`).join("")}
  <path d="M40 22 q12 -10 6 -18 q-6 -5 -11 1" stroke="#f2b33a" stroke-width="3.4" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 256 },
);

const puffCircles: Circle[] = [
  [20, 40, 14],
  [38, 38, 16],
  [30, 24, 13],
  [46, 48, 11],
  [14, 50, 9],
];
const PUFF = svg(
  `<svg viewBox="0 0 64 64">
  ${puffCircles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f2b33a" stroke="#f2b33a" stroke-width="4.5"/>`).join("")}
  ${puffCircles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#a9d9ee"/>`).join("")}
  ${puffCircles.map(([x, y, r]) => `<circle cx="${x - 1.5}" cy="${y - 2.5}" r="${r - 3}" fill="#f6fcff"/>`).join("")}
  <path d="M30 28 a5 5 0 1 1 6 4" stroke="#f2b33a" stroke-width="2.8" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 192 },
);

const FLAME = svg(
  `<svg viewBox="0 0 48 96">
  <path d="M24 94 C4 84 6 60 18 46 C20 56 26 58 28 50 C28 30 20 20 26 4 C38 22 46 50 44 70 C44 84 36 94 24 94Z" fill="#ff6a2a"/>
  <path d="M24 92 C12 84 14 68 22 58 C26 66 30 66 32 60 C38 72 36 88 24 92Z" fill="#ffb82e"/>
  <path d="M24 90 C18 84 20 76 24 72 C30 78 30 86 24 90Z" fill="#fff2b8"/>
</svg>`,
  { size: 192 },
);

const SWIRL = svg(
  `<svg viewBox="0 0 100 100">
  <path d="M52 52 a4 4 0 0 1 8 0 a11 11 0 0 1 -22 0 a19 19 0 0 1 38 0 a27 27 0 0 1 -54 0" stroke="#f4b93c" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  <path d="M22 52 q-10 -4 -14 6 M76 52 q8 -14 18 -8" stroke="#f4b93c" stroke-width="4" stroke-linecap="round" fill="none"/>
  <circle cx="52" cy="52" r="3.4" fill="#fff3d6"/>
  <circle cx="8" cy="58" r="3" fill="#f4b93c"/><circle cx="94" cy="44" r="3" fill="#f4b93c"/>
</svg>`,
  { size: 256 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64">
  <path d="M12 50 L6 2 M12 50 L12 0 M12 50 L18 2" stroke="#e8453c" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  <rect x="6" y="46" width="12" height="6" rx="2" fill="#f4b93c" stroke="#c9772a" stroke-width="1.2"/>
  <circle cx="12" cy="58" r="5.5" fill="#f4b93c" stroke="#c9772a" stroke-width="1.6"/>
</svg>`,
  { size: 192 },
);

const EAR_OUT: OutlinePoint[] = [
  [0, -0.015],
  [0.05, 0.05],
  [0.14, 0.06],
  [0.24, 0.0, "sharp"],
  [0.14, -0.05],
  [0.05, -0.04],
];
const EAR_IN: OutlinePoint[] = [
  [0.03, -0.01],
  [0.07, 0.03],
  [0.13, 0.035],
  [0.19, 0.0, "sharp"],
  [0.13, -0.03],
  [0.07, -0.028],
];

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const R = rng(11);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.14, -0.72], dir: [0, 0.03, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.14, -0.72],
      [0, 1.16, -0.3],
      [0, 1.2, 0.15],
      [0, 1.24, 0.55],
    ]),
    { parent: hips, role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.14, -0.72],
      [0, 1.1, -1.05],
      [0, 1.0, -1.38],
      [0, 1.02, -1.7],
      [0, 1.2, -1.95],
    ]),
    { parent: hips, role: "tail" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.24, 0.55],
      [0, 1.46, 0.72],
      [0, 1.69, 0.93],
      [0, 1.8, 1.12],
    ]),
    { parent: spine, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.8, 1.12], dir: [0, -0.28, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.72, 1.26], aim: [0, 1.58, 1.56], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Body, neck, tail
  const bodyS = b.sweep(
    spine,
    (t): [number, number] => {
      const k = Math.sin(Math.PI * Math.min(t * 1.12, 1));
      return [0.2 + 0.08 * k, 0.26 + 0.09 * k];
    },
    { color: BODY, name: "body" },
  );
  const neckS = b.sweep(neck, [0.2, 0.16, 0.125, 0.105], { color: BODY, name: "neck" });
  const tailS = b.sweep(tail, [0.1, 0.07, 0.05, 0.035, 0.022], { color: BODY, name: "tail" });

  // Dorsal gold spikes
  for (let i = 0; i < 12; i++) {
    const at = bodyS.at(0.1 + i * 0.075, 0, -0.01);
    b.spike(at, at, 0.07 - i * 0.002, 0.028, { color: GOLDC, sides: 5 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  const muscles: Array<{ part: ReturnType<typeof b.part>; s: number; front: boolean }> = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const root: number[] = front ? [s * 0.2, 1.05, 0.38] : [s * 0.2, 1.0, -0.62];
      const foot: number[] = [s * 0.2, 0.1, front ? 0.42 : -0.55];
      const pts = limb(
        root,
        foot,
        front ? [0.36, 0.38, 0.3] : [0.42, 0.4, 0.3],
        front
          ? [
              [0, 0, -1],
              [0, 0, 1],
            ]
          : [
              [0, 0, 1],
              [0, 0, -1],
            ],
      );
      const names = front
        ? [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hoofF${L}`]
        : [`hip${L}`, `knee${L}`, `hock${L}`, `hoofH${L}`];
      const leg = b.chain(`leg${front ? "F" : "H"}${L}`, pts, { parent: front ? spine : hips, names, role: "leg" });
      const legS = b.sweep(
        leg,
        front ? [0.125, 0.09, 0.062, 0.044, 0.046, 0.052] : [0.16, 0.115, 0.07, 0.05, 0.043, 0.05],
        { color: LEG },
      );

      const muscle = b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
        bone: leg.joints[0],
        at: front ? [s * 0.2, 1.08, 0.4] : [s * 0.2, 0.98, -0.55],
        scale: front ? [0.14, 0.22, 0.2] : [0.17, 0.25, 0.22],
      });
      muscles.push({ part: muscle, s, front });

      // Cloven hoof with a gold cuff.
      const tip = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.CylinderGeometry(0.065, 0.088, 0.1, 6), HOOFC, {
        bone: tip,
        at: [foot[0], 0.05, foot[2] + 0.012],
        scale: [1, 1, 1.12],
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.022, 8), GOLDC, {
        bone: tip,
        at: [foot[0], 0.108, foot[2] + 0.008],
      });
      b.part(new THREE.BoxGeometry(0.012, 0.07, 0.024), INK, {
        bone: tip,
        at: [foot[0], 0.05, foot[2] + 0.098],
      });

      // Flame fetlock tuft
      const fetlock = b.ring(leg.at(0.88), { count: 6, radius: 0.05 }).items;
      glow(
        b.cards(fetlock, FLAME, { size: [0.1, 0.17], lean: 65, flow: [0, -1, 0], bend: 20, vary: 0.25, rng: R }),
        0.9,
      );

      // Cloud wisps behind the elbow / hock
      const hits = b.surface(legS).scatter(12, {
        rng: R,
        minDist: 0.05,
        filter: (h) => h.n.z < -0.3 && h.at.y > 0.35 && h.at.y < 0.95,
      });
      b.cards(hits, [PLUME, PUFF], { size: [0.1, 0.18], lean: 70, flow: [0, -1, 0], bend: 25, vary: 0.3, rng: R, cross: true });
    }
  }

  // Flank swirls on the muscles and body
  for (const m of muscles) {
    b.decal(b.surface(m.part), SWIRL, {
      at: m.front ? [m.s * 0.33, 1.08, 0.4] : [m.s * 0.36, 0.98, -0.55],
      dir: [m.s, 0, 0],
      size: m.front ? [0.18, 0.18] : [0.22, 0.22],
      mirror: m.s < 0,
      lift: 0.004,
    });
  }
  const bodySurf = b.surface(bodyS);
  for (const s of [1, -1])
    b.decal(bodySurf, SWIRL, { at: [s * 0.3, 1.27, -0.08], dir: [s, 0, 0], size: [0.42, 0.42], mirror: s < 0, lift: 0.004 });

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const SKULL_C: number[] = [0, 1.8, 1.2];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: SKULL_C,
    scale: [0.125, 0.12, 0.15],
    name: "skull",
  });
  b.loft(
    [
      { at: [0, 1.76, 1.33], w: 0.13, h: 0.14 },
      { at: [0, 1.69, 1.47], w: 0.14, h: 0.12 },
      { at: [0, 1.635, 1.585], w: 0.17, h: 0.11 },
    ],
    { color: COAT, bone: head, name: "muzzle" },
  );
  b.loft(
    [
      { at: [0, 1.69, 1.3], w: 0.12, h: 0.07 },
      { at: [0, 1.6, 1.46], w: 0.12, h: 0.06 },
      { at: [0, 1.572, 1.565], w: 0.13, h: 0.055 },
    ],
    { color: COAT, bone: jaw, name: "lowerJaw" },
  );
  // Nose pad, nostrils, nose-bridge ridge
  b.part(new THREE.SphereGeometry(1, 10, 8), NOSEC, { bone: head, at: [0, 1.64, 1.6], scale: [0.085, 0.055, 0.05] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 6, 4), INK, { bone: head, at: [s * 0.04, 1.655, 1.645] });
    b.part(new THREE.SphereGeometry(1, 8, 6), COAT, { bone: head, at: [s * 0.062, 1.66, 1.5], scale: [0.04, 0.04, 0.05] });
    // fangs
    b.spike([s * 0.07, 1.628, 1.52], [0, -1, 0], 0.05, 0.012, { color: IVORYC, bone: head, sides: 5 });
    b.spike([s * 0.055, 1.6, 1.55], [0, 1, 0], 0.04, 0.01, { color: IVORYC, bone: jaw, sides: 5 });
    // brow ridge
    b.sweep(
      catmull([
        [s * 0.04, 1.895, 1.32],
        [s * 0.085, 1.87, 1.27],
        [s * 0.115, 1.83, 1.22],
      ]),
      [0.016, 0.008],
      { color: GOLDC, bone: head, sides: 5 },
    );
  }
  b.sweep(
    catmull([
      [0, 1.895, 1.26],
      [0, 1.83, 1.36],
      [0, 1.775, 1.44],
      [0, 1.72, 1.55],
    ]),
    0.01,
    { color: GOLDC, bone: head, sides: 5 },
  );
  // Goatee
  b.sweep(
    catmull([
      [0, 1.575, 1.5],
      [0, 1.5, 1.47],
      [0, 1.42, 1.4],
      [0, 1.37, 1.3],
    ]),
    [0.026, 0.018, 0.008, 0],
    { color: GOLDC, bone: jaw, caps: { start: "round", end: "point" }, sides: 6 },
  );

  // Anime eyes
  const EYE = animeEye({ iris: "#ffae2c" });
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.around(SKULL_C).at(s * 58, 4);
    if (hit) b.decal(skullSurf, EYE, { at: hit, size: [0.058, 0.08], mirror: s > 0 });
  }

  // Ears
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ex = new THREE.Vector3(s * 0.55, 0.35, -0.75).normalize();
    const ey = new THREE.Vector3(0, 1, 0).addScaledVector(ex, -ex.y).normalize();
    const base: number[] = [s * 0.1, 1.87, 1.12];
    const ear = b.joint(`ear${L}`, { parent: head, at: base, dir: ex, role: "hinge" });
    b.extrude(EAR_OUT, { at: base, x: ex, y: ey, thickness: 0.012, bevel: 0.003, smoothing: 0, color: EARD, bone: ear });
    b.extrude(EAR_IN, { at: base, x: ex, y: ey, thickness: 0.018, bevel: 0.003, smoothing: 0, color: EARI, bone: ear });
  }

  // Antlers: gold-banded ivory beams, tines tipped with glowing jade orbs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const beam = catmull([
      [s * 0.075, 1.89, 1.13],
      [s * 0.1, 2.05, 1.07],
      [s * 0.15, 2.2, 0.98],
      [s * 0.21, 2.33, 0.84],
    ]);
    const aj = b.joint(`antler${L}`, { parent: head, at: beam.at(0), dir: [s * 0.3, 1, -0.35] });
    b.sweep(beam, [0.034, 0.026, 0.017, 0.007], {
      bone: aj,
      color: IVORYC,
      bands: [
        [0.1, GOLDC],
        [0.9, IVORYC],
        [1, GLOWC],
      ],
      caps: { start: "round", end: "point" },
    });
    b.part(new THREE.TorusGeometry(0.036, 0.011, 6, 12), GOLDC, {
      bone: aj,
      at: beam.at(0.06),
      dir: beam.tangentAt(0.06),
      axis: "z",
    });
    glow(b.part(new THREE.IcosahedronGeometry(0.022, 0), GLOWC, { bone: aj, at: beam.at(1) }), 1.2);
    const tines: Array<[number, number]> = [
      [0.2, 1],
      [0.4, -1],
      [0.6, 1],
      [0.8, -1],
    ];
    for (const [t, fwd] of tines) {
      const p0 = beam.at(t);
      const tip = p0.clone().add(new THREE.Vector3(s * 0.07, 0.13, fwd * 0.11));
      const ctrl = p0.clone().add(new THREE.Vector3(s * 0.02, 0.07, fwd * 0.01));
      b.sweep(bezier(p0, ctrl, tip), [0.017, 0.003], {
        bone: aj,
        color: IVORYC,
        caps: { start: "round", end: "point" },
        sides: 6,
      });
      glow(b.part(new THREE.IcosahedronGeometry(0.014, 0), GLOWC, { bone: aj, at: tip }), 1.2);
    }
  }

  // Forehead gem in a gold setting
  b.part(new THREE.OctahedronGeometry(0.042), GOLDC, { bone: head, at: [0, 1.918, 1.268], scale: [0.9, 1.5, 0.5] });
  glow(b.part(new THREE.OctahedronGeometry(0.03), GLOWC, { bone: head, at: [0, 1.925, 1.28], scale: [0.8, 1.4, 0.6] }), 1.3);

  // Whiskers: long flowing gold, ending in cloud puffs
  const whiskerEnds = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const wh = b.chain(
      `whisker${L}`,
      catmull([
        [s * 0.07, 1.655, 1.5],
        [s * 0.2, 1.6, 1.43],
        [s * 0.38, 1.55, 1.28],
        [s * 0.55, 1.62, 1.06],
        [s * 0.66, 1.78, 0.9],
      ]),
      { parent: head, role: "tentacle" },
    );
    b.sweep(wh, [0.014, 0.004], { color: GOLDC, sides: 5 });
    whiskerEnds.push(wh.at(1));
  }
  b.cards(whiskerEnds, PUFF, { size: 0.14, lean: 20, flow: [0, -0.3, -1], vary: 0.2, rng: R, cross: true });

  // Forelock crest and cheek tufts
  const pick = (surf: ReturnType<typeof b.surface>, list: Array<[number, number]>) =>
    list.flatMap(([az, el]) => {
      const h = surf.around(SKULL_C).at(az, el);
      return h ? [h] : [];
    });
  b.cards(
    pick(skullSurf, [
      [0, 62],
      [0, 74],
      [0, 84],
      [24, 72],
      [-24, 72],
    ]),
    PLUME,
    { size: [0.1, 0.2], lean: 40, bend: 25, vary: 0.2, rng: R, cross: true },
  );
  b.cards(
    pick(skullSurf, [
      [100, -20],
      [-100, -20],
      [115, -5],
      [-115, -5],
    ]),
    PUFF,
    { size: [0.12, 0.14], lean: 60, vary: 0.2, rng: R, cross: true },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Collar and pendant
  const neckSurf = b.surface(neckS);
  const collar = neckSurf.loop(neck.at(0.3), { lift: 0.018 });
  b.sweep(collar, 0.024, { color: GOLDC, sides: 6 });
  b.sweep(neckSurf.loop(neck.at(0.38), { lift: 0.02 }), 0.013, { color: GOLDC, sides: 6 });
  const pend = offset(collar.at(0.5), [0, -0.4, 0.9], 0.03);
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.014, 10), JADEC, { at: pend, dir: [0, -0.4, 0.9] });
  b.part(new THREE.TorusGeometry(0.043, 0.008, 6, 12), GOLDC, { at: pend, dir: [0, -0.4, 0.9], axis: "z" });
  glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), GLOWC, { at: offset(pend, [0, -0.4, 0.9], 0.012) }), 1.2);
  const tp = offset(pend, [0, -1, 0.1], 0.045);
  b.cards([frame(tp, [0, 1, 0])], TASSEL, { size: [0.05, 0.16], lean: 180, flow: [0, 0, 1] });

  // -------------------------------------------------------------------------------------------------------------
  // Cloud mane along the neck, withers, chest
  const mane: Array<ReturnType<typeof neckS.at>> = [];
  for (let i = 0; i < 14; i++)
    for (const a of [-50, -25, 0, 25, 50]) mane.push(neckS.at(0.04 + i * (0.92 / 13), a, 0));
  b.cards(mane, [PLUME, PLUME, PUFF], { size: [0.16, 0.26], lean: 55, bend: 35, vary: 0.3, spin: 12, rng: R, cross: true });
  const withers: Array<ReturnType<typeof bodyS.at>> = [];
  for (const t of [0.78, 0.9, 1.0]) for (const a of [-60, -30, 0, 30, 60]) withers.push(bodyS.at(t, a, 0));
  b.cards(withers, [PLUME, PUFF], { size: [0.14, 0.24], lean: 45, bend: 30, vary: 0.3, rng: R, cross: true });
  const chest: Array<ReturnType<typeof bodyS.at>> = [];
  for (const a of [150, 170, 190, 210]) chest.push(bodyS.at(0.97, a, 0));
  b.cards(chest, PUFF, { size: 0.16, lean: 40, vary: 0.25, rng: R, cross: true });

  // Tail: cloud streamers with a flame tip
  const tailFrames: Array<ReturnType<typeof tailS.at>> = [];
  for (let i = 0; i < 8; i++) for (const a of [-120, -60, 0, 60, 120, 180]) tailFrames.push(tailS.at(0.25 + i * 0.07, a, 0));
  b.cards(tailFrames, [PLUME, PLUME, PUFF], { size: [0.2, 0.38], lean: 50, bend: 30, vary: 0.3, spin: 10, rng: R, cross: true });
  const tailTip: Array<ReturnType<typeof tailS.at>> = [];
  for (const t of [0.8, 0.9, 0.97]) for (const a of [0, 120, 240]) tailTip.push(tailS.at(t, a, 0));
  glow(b.cards(tailTip, FLAME, { size: [0.14, 0.34], lean: 40, bend: 30, vary: 0.25, rng: R, cross: true }), 0.9);

  return b.root;
}
