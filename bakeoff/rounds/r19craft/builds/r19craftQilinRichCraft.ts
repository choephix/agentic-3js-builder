// Qilin: a scaled, hooved chimera with branching antlers and a mane of swirling clouds.
// High-fantasy anime: cel-shaded jade scales, cream belly and socks, ornate gold filigree and tassels,
// glowing jade gems, big anime eyes, pastel cloud-wisp mane drawn as cards.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { bezier, catmull, spiral } from "../../../../src/path";
import { gradient, paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Scaled hooved chimera with branching gold antlers, a dragon-lion face with long whiskers and a cloud-wisp mane, cel-shaded in jade, cream and gold.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const pair = (a: number, b: number): [number, number] => [a, b];

// The head joint sits at the neck tip; H(right-left, up, forward) places points in the head's own pitched frame.
const HEAD0 = V(0, 1.82, 1.14);
const HF = V(0, -0.3, 0.95).normalize();
const HU = V(0, 0.95, 0.3).normalize();
const H = (x: number, u: number, f: number): [number, number, number] => [
  HEAD0.x + x,
  HEAD0.y + HU.y * u + HF.y * f,
  HEAD0.z + HU.z * u + HF.z * f,
];

// Flat colours (small details and glowing gems).
const GEM = "#6ff7e0";
const FANG = "#fff3d6";
const MOUTH = "#8a2f4a";
const TONGUE = "#ff8fb0";
const NOSTRIL = "#1b2740";
const PINK = "#ffb1cf";

// Cel paints.
const CREAM = "#fff1d4";
const INKC = "#1b4a58";
const SCALE = scales(["#35c9b4", "#2cb5a9", "#41d8be", "#28a6a6"], "#17737c", { size: 0.05, width: 0.16, seed: 4 });
const COAT = cel(furEdge(SCALE, CREAM, { level: -0.2, teeth: 0.2, period: 0.05, ink: INKC }));
const LEG = cel(furEdge(SCALE, CREAM, { by: "position", level: 0.27, teeth: 0.05, period: 0.04, ink: INKC }));
const HEADC = cel(furEdge(SCALE, CREAM, { level: -0.4, teeth: 0.18, period: 0.035, ink: INKC }));
const MUZZLE = cel(furEdge(SCALE, CREAM, { level: -0.15, teeth: 0.2, period: 0.03, ink: INKC }));
const JAWC = cel(CREAM, "#e8bf94");
const GOLD = cel("#f7c04a", "#b8691d");
const BROW = cel("#1f8f95");
const HOOF = cel("#3b2a5e", "#241a3c");
const CLOUD = cel("#f6fbff", "#b3bdf0");
const AQUA = cel("#7ee8d8");
const MOUTHC = cel(MOUTH);
const TONGUEC = cel(TONGUE);

const EAR_IN = V(0, 0.4, 1).normalize();
const EARC = cel(
  paint((_p, n, s) =>
    n.dot(EAR_IN) > 0.5 && Math.abs(s[0]) < 0.026 && s[1] > 0.04 && s[1] < 0.2 - 2.4 * Math.abs(s[0]) ? PINK : "#2cb5a9",
  ),
);

const EAR: OutlinePoint[] = [
  [-0.035, 0],
  [0.035, 0],
  [0.052, 0.07],
  [0.032, 0.15],
  [0, 0.25, "sharp"],
  [-0.03, 0.15],
  [-0.052, 0.07],
];
const PLATE: OutlinePoint[] = [
  [0, -0.035, "sharp"],
  [0.032, 0, "sharp"],
  [0, 0.085, "sharp"],
  [-0.032, 0, "sharp"],
];

export default function build() {
  const b = createBuilder({ name: "qilin" });

  // ---------------------------------------------------------------- textures
  const wisp = (id: string, d: string, c0: string, c1: string, c2: string, line: string) =>
    svg(
      `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c0}"/><stop offset="0.55" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><path d="${d}" fill="url(#${id})" stroke="${line}" stroke-width="2.6" stroke-linejoin="round"/><path d="M20 90 C 14 70 17 52 25 38 C 31 28 33 19 36 10" fill="none" stroke="#ffffff" stroke-opacity="0.75" stroke-width="2.4" stroke-linecap="round"/></svg>`,
      { size: 192 },
    );
  const SHAPE_A = "M14 95 C 5 72 9 49 21 33 C 29 21 29 10 39 2 C 43 21 45 37 38 53 C 32 71 36 85 31 95 Z";
  const SHAPE_B = "M16 95 C 4 76 14 60 24 46 C 34 32 22 22 28 10 C 31 5 36 3 40 1 C 46 18 40 30 35 42 C 28 56 38 70 32 95 Z";
  const WISP_T = wisp("wt", SHAPE_A, "#1fa6ad", "#8cecdc", "#ffffff", "#157583");
  const WISP_L = wisp("wl", SHAPE_B, "#7f6ad8", "#c9b2f6", "#fff0fa", "#4f3fa5");
  const WISP_P = wisp("wp", SHAPE_A, "#ec7fb0", "#ffc4dc", "#ffffff", "#a8457f");
  const WISP_Q = wisp("wq", SHAPE_B, "#2bb8b0", "#a8f1e6", "#ffffff", "#157583");
  const WISP_G = wisp("wg", SHAPE_A, "#e8a22d", "#ffe08a", "#fffbe8", "#9b5a14");
  const CLOUD_T = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cdd6ff"/></linearGradient></defs><g fill="#5f78c4" stroke="#5f78c4" stroke-width="5"><circle cx="18" cy="33" r="12"/><circle cx="34" cy="27" r="16"/><circle cx="50" cy="34" r="11"/><rect x="18" y="34" width="32" height="12"/></g><g fill="url(#cg)"><circle cx="18" cy="33" r="12"/><circle cx="34" cy="27" r="16"/><circle cx="50" cy="34" r="11"/><rect x="18" y="34" width="32" height="12"/></g></svg>`,
    { size: 192 },
  );
  const swirlPaths = [
    "M60 70 C30 72 12 55 22 36 C30 22 52 24 52 38 C52 48 40 50 37 43",
    "M60 70 C90 72 108 55 98 36 C90 22 68 24 68 38 C68 48 80 50 83 43",
    "M60 70 C56 55 62 45 60 28 C59 20 62 12 60 6",
    "M60 70 C50 80 30 84 8 80",
    "M60 70 C70 80 90 84 112 80",
  ];
  const strokes = (color: string, w: number) =>
    swirlPaths.map((d) => `<path d="${d}" stroke="${color}" stroke-width="${w}"/>`).join("");
  const SWIRL = svg(
    `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${strokes("#7a4310", 10)}${strokes("#f6bd45", 6)}${strokes("#fff0b8", 1.8)}</g><circle cx="60" cy="70" r="7.5" fill="#7a4310"/><circle cx="60" cy="70" r="5.2" fill="#6ff7e0"/><circle cx="58" cy="68" r="1.8" fill="#ffffff"/></svg>`,
    { size: 512 },
  );
  const EYE = animeEye({ iris: "#ffae2b", blush: "#ff8fb0", brow: false, size: 256 });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.12, -0.55], dir: [0, 0.07, 1], group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, -0.55],
      [0, 1.16, -0.15],
      [0, 1.2, 0.25],
      [0, 1.24, 0.62],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine", group: "body" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.24, 0.62],
      [0, 1.42, 0.8],
      [0, 1.64, 0.98],
      [0, 1.82, 1.14],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck", group: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.3, 0.95], group: "head", role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H(0, -0.06, 0.08),
    aim: H(0, -0.11, 0.46),
    group: "head",
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.14, -0.82],
      [0, 1.22, -1.08],
      [0, 1.18, -1.38],
      [0, 1.0, -1.62],
      [0, 0.78, -1.72],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail", group: "tail" },
  );

  // ---------------------------------------------------------------- body, neck, tail
  const body = b.sweep(spine, (t) => pair(0.2 - 0.015 * t, 0.215 + 0.05 * t), {
    color: COAT,
    extend: [0.12, 0],
    shift: [0, -0.03],
    sides: 10,
  });
  const neckTube = b.sweep(neck, (t) => pair(0.17 - 0.075 * t, 0.185 - 0.09 * t), {
    color: COAT,
    extend: [0.1, 0],
    sides: 10,
  });
  const tailTube = b.sweep(tail, [0.055, 0.05, 0.042, 0.034, 0.026], {
    color: cel(gradient("#35c9b4", "#e8fbff", [0, 1.15, -1.0], [0, 0.78, -1.72])),
  });
  const bodySurf = b.surface(body);
  const neckSurf = b.surface(neckTube);

  // ---------------------------------------------------------------- legs
  const hoofJoints: Array<ReturnType<typeof b.joint>> = [];
  const legSweeps: Array<ReturnType<typeof b.sweep>> = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front leg: elbow back, knee (carpus) forward
    const fp = limb([s * 0.18, 1.08, 0.5], [s * 0.18, 0.075, 0.56], [0.4, 0.4, 0.3], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const front = b.chain(`legF${S}`, fp, {
      parent: spine,
      names: [`shoulder${S}`, `elbow${S}`, `knee${S}`, `hoofF${S}`],
      role: "leg",
      contact: [s * 0.18, 0, 0.56],
      group: "legs",
    });
    // hind leg: stifle forward, hock back
    const hp = limb([s * 0.19, 1.04, -0.6], [s * 0.19, 0.075, -0.8], [0.5, 0.5, 0.4], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `stifle${S}`, `hock${S}`, `hoofH${S}`],
      role: "leg",
      contact: [s * 0.19, 0, -0.8],
      group: "legs",
    });
    const fs = b.sweep(front, [0.1, 0.085, 0.058, 0.043, 0.037, 0.032], { color: LEG });
    const hs = b.sweep(hind, [0.125, 0.105, 0.075, 0.052, 0.04, 0.033], { color: LEG });
    legSweeps.push(fs, hs);

    for (const [leg, sw, fx, fz, rr] of [
      [front, fs, s * 0.18, 0.56, 0.032],
      [hind, hs, s * 0.19, -0.8, 0.034],
    ] as const) {
      const hoofJ = leg.joints[leg.joints.length - 1];
      hoofJoints.push(hoofJ);
      const kneeJ = leg.joints[2];
      // cloven hooves with a gold coronet band
      for (const k of [1, -1])
        b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.1, 7), HOOF, {
          bone: hoofJ,
          at: [fx + k * 0.03, 0.05, fz + 0.01],
          scale: [1, 1, 1.35],
        });
      b.part(new THREE.TorusGeometry(0.058, 0.01, 5, 12), GOLD, {
        bone: hoofJ,
        at: [fx, 0.105, fz + 0.01],
        dir: [0, 1, 0],
        axis: "z",
      });
      // gold cuff with a jade gem
      const cp = leg.at(0.8);
      b.part(new THREE.TorusGeometry(rr + 0.016, 0.011, 6, 12), GOLD, { bone: kneeJ, at: cp.at, dir: cp.tangent, axis: "z" });
      b.part(new THREE.OctahedronGeometry(0.02), GEM, {
        bone: kneeJ,
        at: [cp.at.x, cp.at.y, cp.at.z + rr + 0.022],
        scale: [0.8, 1.2, 0.8],
      });
      // pastel flame fetlock fluff
      const fluff = [0, 60, 120, 180, 240, 300].map((a) => sw.at(0.93, a));
      b.cards(fluff, [WISP_T, WISP_L, WISP_P, WISP_Q], {
        size: [0.075, 0.16],
        lean: 55,
        bend: 30,
        flow: [0, -1, 0],
        vary: 0.25,
        spin: 15,
        rng: rng(30 + (s > 0 ? 1 : 2)),
        sink: 0.15,
      });
      // knee / hock tuft
      const tuft = [20, 110, 200, 290].map((a) => sw.at(0.72, a));
      b.cards(tuft, [CLOUD_T, WISP_G], {
        size: [0.09, 0.13],
        lean: 70,
        bend: 20,
        flow: [0, -0.4, -1],
        vary: 0.2,
        rng: rng(40 + (s > 0 ? 1 : 2)),
      });
    }
  }

  // ---------------------------------------------------------------- head
  const SK = H(0, 0.02, 0.14);
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADC, {
    bone: head,
    at: SK,
    dir: HF,
    axis: "z",
    scale: [0.115, 0.11, 0.17],
  });
  const muzzlePath = [H(0, 0.0, 0.2), H(0, -0.03, 0.5)];
  b.sweep(muzzlePath, (t) => pair(0.1 - 0.035 * t, 0.085 - 0.03 * t), {
    bone: head,
    color: MUZZLE,
    caps: { start: "none", end: "round" },
    sides: 10,
  });
  // nose pad and nostrils
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { bone: head, at: H(0, 0.03, 0.54), scale: [1.5, 0.8, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), NOSTRIL, { bone: head, at: H(s * 0.034, 0.0, 0.548) });
    // fangs
    b.spike(H(s * 0.055, -0.06, 0.4), [0, -1, 0], 0.055, 0.012, FANG, { bone: head, sides: 5 });
    // lower tusks
    b.spike(H(s * 0.045, -0.1, 0.44), [0, 1, 0.15], 0.04, 0.009, FANG, { bone: jaw, sides: 5 });
  }
  // mouth interior
  b.sweep([H(0, -0.06, 0.15), H(0, -0.072, 0.42)], (t) => pair(0.07 - 0.02 * t, 0.025), {
    bone: head,
    color: MOUTHC,
    sides: 6,
  });
  // lower jaw
  b.sweep([H(0, -0.11, 0.12), H(0, -0.13, 0.46)], (t) => pair(0.065 - 0.027 * t, 0.042 - 0.012 * t), {
    bone: jaw,
    color: JAWC,
    caps: { start: "round", end: "round" },
    sides: 8,
  });
  b.sweep([H(0, -0.088, 0.12), H(0, -0.092, 0.4)], (t) => pair(0.04 - 0.014 * t, 0.016), {
    bone: jaw,
    color: TONGUEC,
    sides: 6,
  });
  // chin beard
  b.cards(
    [-1, 0, 1].map((i) => frame(H(i * 0.025, -0.14, 0.32 - Math.abs(i) * 0.04), [0, -1, -0.15])),
    [WISP_L, WISP_T, WISP_P],
    { size: [0.06, 0.2], lean: 40, flow: [0, -0.5, -1], bend: 25, vary: 0.2, rng: rng(51), bone: jaw },
  );

  // eyes: big anime decals on the skull
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.around(SK).at(s * 50, 6);
    if (hit) b.decal(skullSurf, EYE, { at: hit, size: [0.078, 0.104], mirror: s > 0 });
  }

  for (const s of [1, -1]) {
    // swept brow ridge
    b.sweep(bezier(H(s * 0.05, 0.1, 0.27), H(s * 0.1, 0.145, 0.2), H(s * 0.145, 0.12, 0.05)), [0.022, 0.004], {
      bone: head,
      color: BROW,
      caps: { start: "round", end: "point" },
      sides: 6,
    });
    // brow flame tufts
    b.cards(
      [0, 1, 2].map((i) => frame(H(s * (0.09 + i * 0.02), 0.115 + i * 0.01, 0.15 - i * 0.07), [s * 0.6, 1, -0.1])),
      [WISP_G, WISP_Q],
      { size: [0.045, 0.13], lean: 60, bend: 25, flow: [0, -0.2, -1], vary: 0.2, rng: rng(60 + (s > 0 ? 1 : 2)), bone: head },
    );
    // cheek frills
    b.cards(
      [0, 1, 2, 3, 4].map((i) => frame(H(s * (0.105 + 0.008 * i), -0.01 - 0.032 * i, 0.04 - 0.045 * i), [s, -0.15, -0.5])),
      [WISP_T, WISP_L, WISP_Q, WISP_P],
      { size: [0.09, 0.26], lean: 55, bend: 35, flow: [0, -0.3, -1], vary: 0.25, rng: rng(70 + (s > 0 ? 1 : 2)), bone: head },
    );

    // ears
    b.extrude(EAR, {
      at: H(s * 0.11, 0.06, -0.04),
      x: [s, 0, 0],
      y: [s * 0.7, 1, -0.4],
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 1,
      color: EARC,
      bone: head,
    });

    // whiskers: long flowing gold ribbons ending in a tuft
    const wp = catmull([
      H(s * 0.07, -0.03, 0.44),
      H(s * 0.2, 0.0, 0.36),
      H(s * 0.4, -0.1, 0.2),
      H(s * 0.55, -0.3, 0.0),
      H(s * 0.55, -0.55, -0.2),
      H(s * 0.4, -0.72, -0.25),
    ]);
    b.sweep(wp, [0.012, 0.004], { bone: head, color: GOLD, caps: { start: "round", end: "point" }, sides: 5 });
    b.cards(
      [0.55, 0.75, 0.95].map((t) => frame(wp.at(t), [s, 0.3, 0.2])),
      [WISP_G, WISP_P],
      { size: [0.05, 0.14], lean: 60, bend: 25, flow: [0, -1, 0], vary: 0.2, rng: rng(80 + (s > 0 ? 1 : 2)), bone: head },
    );

    // antlers: gold beam, forward tines, glowing jade tips
    const beamPts = (
      [
        [0.07, 0.1, 0.02],
        [0.09, 0.25, -0.04],
        [0.14, 0.41, -0.14],
        [0.19, 0.55, -0.28],
        [0.2, 0.68, -0.44],
      ] as Array<[number, number, number]>
    ).map(([x, y, z]): [number, number, number] => [HEAD0.x + s * x, HEAD0.y + y, HEAD0.z + z]);
    const beam = catmull(beamPts);
    const ANTLER = cel(gradient("#c98a2c", "#ffe9a8", beam.at(0), beam.at(1)));
    b.sweep(beam, [0.03, 0.012], { bone: head, color: ANTLER, caps: { start: "flat", end: "point" }, sides: 6 });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), GOLD, { bone: head, at: beam.at(0), scale: [1, 0.6, 1] });
    for (const t of [0.12, 0.45, 0.78])
      b.part(new THREE.TorusGeometry(0.033 - 0.018 * t, 0.007, 5, 10), GOLD, {
        bone: head,
        at: beam.at(t),
        dir: beam.tangentAt(t),
        axis: "z",
      });
    for (const [t, len] of [
      [0.3, 0.2],
      [0.52, 0.17],
      [0.74, 0.13],
    ]) {
      const p = beam.at(t);
      const tip: [number, number, number] = [p.x + s * 0.07, p.y + len * 0.8, p.z + len * 0.5];
      b.sweep(bezier(p, [p.x + s * 0.03, p.y + len * 0.3, p.z + len * 0.1], tip), [0.017, 0], {
        bone: head,
        color: ANTLER,
        caps: { start: "flat", end: "point" },
        sides: 6,
      });
      glow(b.part(new THREE.OctahedronGeometry(0.016), GEM, { bone: head, at: tip, scale: [0.8, 1.4, 0.8] }));
    }
    const top = beam.at(1);
    glow(b.part(new THREE.OctahedronGeometry(0.026), GEM, { bone: head, at: [top.x, top.y + 0.02, top.z], scale: [0.8, 1.6, 0.8] }), 1.2);
  }

  // forehead ornament and crest wisps
  b.extrude(PLATE, {
    at: H(0, 0.12, 0.2),
    x: [1, 0, 0],
    y: [0, 0.6, -0.8],
    thickness: 0.012,
    bevel: 0.003,
    color: GOLD,
    bone: head,
  });
  glow(b.part(new THREE.OctahedronGeometry(0.022), GEM, { bone: head, at: H(0, 0.14, 0.215), scale: [0.9, 1.3, 0.9] }), 1.2);
  b.cards(
    [-1, 0, 1].map((i) => frame(H(i * 0.04, 0.12, 0.08), HU)),
    [WISP_T, WISP_L, WISP_Q],
    { size: [0.05, 0.16], lean: 55, bend: 25, flow: [0, -0.2, -1], vary: 0.2, rng: rng(90), bone: head },
  );

  // ---------------------------------------------------------------- mane, crest, chest ruff
  const maneRows = [0, 22, -22, 45, -45, 70, -70];
  const manePts = maneRows.flatMap((a) => Array.from({ length: 15 }, (_, i) => neckTube.at(0.04 + i * 0.065, a)));
  b.cards(manePts, [WISP_T, WISP_L, WISP_Q, WISP_P, WISP_T, WISP_L], {
    size: [0.14, 0.36],
    lean: 62,
    bend: 40,
    flow: [0, -0.25, -1],
    vary: 0.3,
    spin: 12,
    rng: rng(11),
    sink: 0.15,
  });
  b.cards(
    Array.from({ length: 9 }, (_, i) => body.at(0.12 + i * 0.1, 0)),
    [WISP_T, WISP_Q, WISP_L],
    { size: [0.1, 0.22], lean: 70, bend: 30, flow: [0, -0.15, -1], vary: 0.25, rng: rng(12) },
  );
  b.cards(
    [120, 150, 180, 210, 240].map((a) => body.at(0.9, a)),
    [WISP_P, WISP_L, WISP_T],
    { size: [0.12, 0.28], lean: 50, bend: 30, flow: [0, -1, -0.2], vary: 0.25, rng: rng(13) },
  );
  b.cards(
    [145, 215].flatMap((a) => Array.from({ length: 7 }, (_, i) => body.at(0.12 + i * 0.12, a))),
    [WISP_Q, WISP_T, WISP_L],
    { size: [0.07, 0.17], lean: 55, bend: 25, flow: [0, -1, -0.3], vary: 0.25, rng: rng(14) },
  );

  // swirling cloud curls on the neck
  for (const s of [1, -1]) {
    const from = neckTube.at(0.5, s * 75).at;
    const center = from.clone().add(V(0, 0.1, -0.07));
    b.sweep(spiral(center, from, [1, 0, 0], { turns: 1.15, r1: 0.025 }), [0.022, 0.006], {
      bone: neck.joints[1],
      color: AQUA,
      caps: { start: "round", end: "point" },
      sides: 5,
    });
  }

  // gold collar with a jade pendant
  const collar = neckSurf.loop(neck.at(0.18), { lift: 0.012 });
  b.sweep(collar, 0.02, { color: GOLD });
  const pend = collar.at(0.5);
  b.part(new THREE.OctahedronGeometry(0.04), GEM, {
    bone: neck.joints[0],
    at: [pend.x, pend.y - 0.04, pend.z + 0.03],
    scale: [0.8, 1.3, 0.5],
  });

  // girth band with studs and gems, and a golden swirl on each flank
  const girth = bodySurf.loop(spine.joints[1], { lift: 0.012 });
  b.sweep(girth, 0.018, { color: GOLD });
  let stud = 0;
  b.along(bodySurf.loop(spine.joints[1], { lift: 0.022 }), 14, (at) => {
    stud++;
    return stud % 3 === 0
      ? b.part(new THREE.OctahedronGeometry(0.022), GEM, { at })
      : b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { at });
  });
  for (const s of [1, -1])
    b.decal(bodySurf, SWIRL, { at: [s * 0.2, 1.2, 0.2], dir: [s, 0, 0], size: [0.36, 0.27], segments: 14 });

  // shoulder and haunch cloud clusters
  const cloud = (bone: typeof hips, s: number, x: number, y: number, z: number, r: number) => {
    const offs: Array<[number, number, number, number]> = [
      [0, 0, 0, 1],
      [0.25, -0.55, 0.75, 0.7],
      [0.25, 0.6, -0.7, 0.75],
      [0.15, -0.4, -0.8, 0.6],
      [0.15, 0.45, 0.85, 0.55],
    ];
    for (const [dx, dy, dz, k] of offs)
      b.part(new THREE.IcosahedronGeometry(r * k, 1), CLOUD, {
        bone,
        at: [x + s * dx * r, y + dy * r, z + dz * r],
        flat: true,
      });
  };
  for (const s of [1, -1]) {
    cloud(spine.joints[2], s, s * 0.22, 1.2, 0.45, 0.1);
    cloud(hips, s, s * 0.24, 1.18, -0.55, 0.1);
  }

  // ---------------------------------------------------------------- tail
  const tailBand = tail.at(0.15);
  b.part(new THREE.TorusGeometry(0.066, 0.014, 6, 12), GOLD, { bone: tail.joints[0], at: tailBand.at, dir: tailBand.tangent, axis: "z" });
  glow(b.part(new THREE.OctahedronGeometry(0.024), GEM, { bone: tail.joints[0], at: [tailBand.at.x, tailBand.at.y + 0.075, tailBand.at.z], scale: [0.8, 1.2, 0.8] }));
  const plumeA = Array.from({ length: 6 }, (_, i) => [0, 120, 240].map((a) => tailTube.at(0.18 + i * 0.05, a + i * 40))).flat();
  b.cards(plumeA, [WISP_T, WISP_L, WISP_Q], {
    size: [0.13, 0.3],
    lean: 62,
    bend: 35,
    flow: (_f, i) => plumeA[i].tangent,
    vary: 0.25,
    spin: 10,
    rng: rng(21),
    sink: 0.15,
  });
  const plumeB = Array.from({ length: 10 }, (_, i) => [0, 120, 240].map((a) => tailTube.at(0.42 + i * 0.058, a + i * 40))).flat();
  b.cards(plumeB, [WISP_T, WISP_L, WISP_P, WISP_Q, WISP_G], {
    size: [0.2, 0.5],
    lean: 60,
    bend: 45,
    flow: (_f, i) => plumeB[i].tangent,
    vary: 0.3,
    spin: 12,
    rng: rng(22),
    sink: 0.15,
  });
  const tailEnd = V(0, 0.78, -1.72);
  for (const [dy, dz, turns] of [
    [0.15, 0.06, 1.2],
    [0.0, -0.18, -1.2],
  ] as const) {
    const center = tailEnd.clone().add(V(0, dy + 0.0, dz < 0 ? dz : -dz));
    b.sweep(spiral(center, tailEnd, [1, 0, 0], { turns, r1: 0.03 }), [0.024, 0.006], {
      bone: tail.joints[3],
      color: AQUA,
      caps: { start: "round", end: "point" },
      sides: 5,
    });
  }

  // jaw rests slightly open
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  return b.root;
}
