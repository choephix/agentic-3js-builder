import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import type { Builder } from "../../../../src/index";
import { catmull } from "../../../../src/index";
import { limb } from "../../../../src/index";

export const meta = {
  name: "Baku",
  description: "The dream-eating tapir spirit in ukiyo-e woodblock style: indigo hide, cream saddle, vermilion mane and swirling gold clouds.",
};

// Palette (ukiyo-e: indigo, vermilion, paper, sumi ink, gold, pale wave blue)
export const INDIGO = "#1f3a68";
export const INDIGO_DEEP = "#16264a";
export const PRUSSIAN = "#2f5f93";
export const WAVE = "#86b5c6";
export const PAPER = "#efe3c4";
export const PAPER_D = "#d8c79b";
export const VERMILION = "#d9442b";
export const VERMILION_D = "#a8301f";
export const GOLD = "#d9a93a";
export const SUMI = "#1b1a24";
export const BLUSH = "#e9a08a";

export const REQUESTS = [
  {
    id: "foreheadSeal",
    kind: "add",
    part: "skull",
    what: "A vermilion hanko seal with a gold border on the forehead: a small square plate with an inset swirl glyph in PAPER, ink-outlined in SUMI.",
    at: [0, 1.3, 1.05],
    normal: [0, 0.6, 0.8],
    bone: "head",
    room: [0.12, 0.12, 0.06],
  },
  {
    id: "dreamSmoke",
    kind: "add",
    part: "trunk",
    what: "Wisps of dream-smoke curling from the trunk tip: three stacked, flat-coloured curling ribbons in WAVE and PAPER with SUMI outline strokes, as printed cloud scrolls.",
    at: [0, 0.74, 1.52],
    normal: [0, -0.3, 1],
    bone: "trunk4",
    room: [0.4, 0.4, 0.4],
  },
  {
    id: "maneFlames",
    kind: "add",
    part: "neck",
    what: "Richer mane along the neck crest: overlapping flame blades fading VERMILION_D to VERMILION to GOLD tips, with PAPER curl accents at the base.",
    at: [0, 1.25, 0.75],
    normal: [0, 1, 0],
    bone: "neck2",
    room: [0.3, 0.4, 0.6],
  },
  {
    id: "shoulderCloudSwirls",
    kind: "add",
    part: "body",
    what: "A large Hokusai-style cloud scroll on each shoulder: concentric curled ribbons in GOLD and PAPER with SUMI outline, plus small trailing curls, seated on the flank.",
    at: [0.3, 1.0, 0.35],
    normal: [1, 0, 0],
    bone: "spine2",
    room: [0.1, 0.4, 0.4],
  },
  {
    id: "waveHem",
    kind: "add",
    part: "body",
    what: "A band of stylised seigaiha wave scallops in WAVE and PRUSSIAN with PAPER crests running along the lower flank on both sides.",
    at: [0.3, 0.7, -0.1],
    normal: [1, 0, 0],
    bone: "spine1",
    room: [0.1, 0.25, 1.0],
  },
  {
    id: "tailTuft",
    kind: "add",
    part: "tail",
    what: "Fuller lion-like tail tuft: more flame blades around the tail tip in VERMILION, GOLD and PAPER, with a gold band at the base of the tuft.",
    at: [0, 1.3, -1.25],
    normal: [0, 0.3, -1],
    bone: "tail4",
    room: [0.5, 0.5, 0.5],
  },
  {
    id: "pawFur",
    kind: "add",
    part: "paws",
    what: "Tiger-like claws and ink-outlined toe pads for each paw, plus a vermilion fur ruff above each paw.",
    at: [0.2, 0.1, 0.62],
    normal: [0, 0, 1],
    bone: "pawL",
    room: [0.2, 0.15, 0.2],
  },
  {
    id: "earOrnament",
    kind: "add",
    part: "ears",
    what: "A gold ring earring with a vermilion tassel on each ear, and inked fur lines inside the ear in SUMI.",
    at: [0.14, 1.28, 0.93],
    normal: [1, 0, 0],
    bone: "head",
    room: [0.1, 0.18, 0.12],
  },
  {
    id: "eyeBrowMarks",
    kind: "add",
    part: "skull",
    what: "Kabuki-style vermilion brow sweeps and ink lash lines around each eye, extending in a flick toward the temple.",
    at: [0.12, 1.25, 1.08],
    normal: [0.6, 0.3, 0.7],
    bone: "head",
    room: [0.14, 0.1, 0.1],
  },
  {
    id: "bodyPrint",
    kind: "texture",
    part: "body",
    what: "Woodblock texture on the body: INDIGO with fine darker INDIGO_DEEP grain lines, soft bokashi gradient to PRUSSIAN toward the belly, cream saddle with a PAPER_D paper-fibre speckle.",
  },
  {
    id: "trunkRings",
    kind: "texture",
    part: "trunk",
    what: "Trunk with fine PAPER ring wrinkles, a pale BLUSH tip and sumi ink hairlines.",
  },
  {
    id: "earInner",
    kind: "texture",
    part: "ears",
    what: "Ears with a PAPER rim, BLUSH inner and bokashi to INDIGO_DEEP at the base.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "baku" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.85, -0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.85, -0.5],
      [0, 0.9, 0.0],
      [0, 0.95, 0.5],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.95, 0.5],
      [0, 1.1, 0.78],
      [0, 1.14, 0.95],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip ?? neck.joints[2], at: [0, 1.14, 0.95], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.04, 1.0], dir: [0, 0, 1], role: "jaw" });
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 1.1, 1.12],
      [0, 1.02, 1.38],
      [0, 0.86, 1.52],
      [0, 0.74, 1.5],
    ]),
    { parent: head, names: ["trunk1", "trunk2", "trunk3", "trunk4"], role: "tentacle" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.75],
      [0, 0.95, -1.0],
      [0, 1.1, -1.2],
      [0, 1.3, -1.25],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body ----------
  const body = b.sweep(spine, [0.3, 0.34, 0.31], {
    name: "body",
    color: INDIGO,
    caps: "round",
    sectors: [
      [-65, 65, PAPER, 0.0, 0.55],
      [130, 230, PAPER_D, 0, 1],
    ],
  });
  b.sweep(neck, [0.27, 0.22, 0.19], { name: "neck", color: INDIGO, caps: "round" });

  // head
  const SC: [number, number, number] = [0, 1.16, 1.03];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), INDIGO, {
    name: "skull",
    bone: head,
    at: SC,
    scale: [0.17, 0.19, 0.24],
  });
  b.sweep(trunk, [0.1, 0.08, 0.065, 0.055], { name: "trunk", color: INDIGO, caps: "round" });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), BLUSH, { bone: trunk.tip ?? trunk.joints[3], at: [0, 0.71, 1.5] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 6, 4), SUMI, { bone: trunk.joints[3], at: [s * 0.022, 0.7, 1.53] });
  // jaw
  b.part(new THREE.BoxGeometry(0.15, 0.06, 0.22), PAPER, { bone: jaw, at: [0, 1.0, 1.08] });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.14), VERMILION_D, { bone: jaw, at: [0, 1.035, 1.1] });
  // tusks
  for (const s of [1, -1]) b.spike([s * 0.07, 1.03, 1.17], [s * 0.1, 0.5, 0.85], 0.1, 0.022, { bone: head, color: PAPER });

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(SC).at(s * 62, 14);
    if (hit) {
      b.stick(new THREE.SphereGeometry(0.04, 8, 6), SUMI, hit, { embed: 0.5 });
      b.stick(new THREE.SphereGeometry(0.034, 8, 6), GOLD, hit.moved([0, 0.01, 0]), { embed: 0.4 });
      b.stick(new THREE.SphereGeometry(0.018, 6, 4), SUMI, hit.moved([0, 0.03, 0]), { embed: 0.3 });
    }
    // brows
    b.rod([s * 0.1, 1.28, 1.12], [s * 0.17, 1.26, 1.0], 0.012, VERMILION, { bone: head });
    // ears
    b.part(new THREE.SphereGeometry(1, 8, 6), INDIGO_DEEP, { name: "ears", bone: head, at: [s * 0.14, 1.32, 0.93], scale: [0.03, 0.08, 0.065] });
    b.part(new THREE.SphereGeometry(1, 8, 6), PAPER, { bone: head, at: [s * 0.16, 1.32, 0.94], scale: [0.012, 0.055, 0.045] });
  }

  // ---------- legs ----------
  for (const [sd, s] of [["L", 1], ["R", -1]] as const) {
    // front
    const fPts = limb([s * 0.2, 0.85, 0.5], [s * 0.2, 0.06, 0.6], [0.45, 0.45], [[0, 0, -1]]);
    const fl = b.chain(`legF${sd}`, catmull(fPts), { parent: spine.joints[1], names: [`shoulder${sd}`, `elbow${sd}`, `paw${sd}`], role: "leg" });
    b.sweep(fl, [0.12, 0.08, 0.065], { name: "legs", color: INDIGO, caps: "round" });
    // hind
    const hPts = limb([s * 0.2, 0.85, -0.5], [s * 0.2, 0.06, -0.58], [0.45, 0.45], [[0, 0, 1]]);
    const hl = b.chain(`legH${sd}`, catmull(hPts), { parent: hips, names: [`hip${sd}`, `knee${sd}`, `foot${sd}`], role: "leg" });
    b.sweep(hl, [0.13, 0.085, 0.065], { name: "legs", color: INDIGO, caps: "round" });
    for (const [lg, z] of [[fl, 0.6], [hl, -0.58]] as const) {
      const tipJ = lg.tip ?? lg.joints[lg.joints.length - 1];
      b.part(new THREE.SphereGeometry(1, 9, 6), PAPER_D, { name: "paws", bone: tipJ, at: [s * 0.2, 0.05, z + 0.03], scale: [0.09, 0.055, 0.13] });
      for (const dx of [-1, 0, 1])
        b.part(new THREE.SphereGeometry(0.026, 6, 4), PAPER, { bone: tipJ, at: [s * 0.2 + dx * 0.045, 0.035, z + 0.14] });
      b.part(new THREE.TorusGeometry(0.075, 0.016, 5, 10), VERMILION, { bone: tipJ, at: [s * 0.2, 0.15, z], rotation: [90, 0, 0] });
    }
  }

  // ---------- tail ----------
  b.sweep(tail, [0.07, 0.055, 0.045, 0.04], { name: "tail", color: INDIGO, caps: "round" });
  const tipP = tail.at(1).at;
  const tipJ = tail.tip ?? tail.joints[3];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.spike(tipP, [Math.cos(a) * 0.5, 0.55 + 0.2 * Math.sin(a), Math.sin(a) * 0.5 - 0.2], 0.28, 0.045, {
      bone: tipJ,
      color: i % 3 === 0 ? GOLD : i % 3 === 1 ? VERMILION : VERMILION_D,
    });
  }

  // ---------- mane crest ----------
  const flame: [number, number, string?][] = [
    [-0.06, 0],
    [0.06, 0],
    [0.05, 0.1],
    [0.0, 0.25, "sharp"],
    [-0.03, 0.12],
  ] as any;
  for (let i = 0; i < 6; i++) {
    const t = 0.05 + i * 0.17;
    const p = neck.at(t).at;
    const j = neck.joints[Math.min(i >> 1, 2)];
    const r = 0.26 - 0.04 * t * 3;
    b.extrude(flame as any, {
      at: [0, p.y + r * 0.85, p.z],
      x: [0, 0, -1],
      y: [0, 1, -0.3],
      thickness: 0.025,
      color: i % 2 ? VERMILION : VERMILION_D,
      bone: j,
    });
  }
  for (let i = 0; i < 4; i++) {
    const z = 0.35 - i * 0.22;
    b.spike([0, 1.18 - i * 0.01, z], [0, 1, -0.4], 0.14, 0.04, { bone: spine.joints[i < 1 ? 1 : 0], color: i % 2 ? GOLD : VERMILION });
  }

  // ---------- cloud swirls on flanks ----------
  const bs = b.surface(body);
  for (const s of [1, -1]) {
    const c = bs.around([0, 0.9, 0.2]).at(s * 90, 18);
    if (c) {
      b.stick(new THREE.TorusGeometry(0.1, 0.014, 5, 14, Math.PI * 1.6).rotateX(Math.PI / 2), GOLD, c, { embed: 0.3 });
      b.stick(new THREE.TorusGeometry(0.06, 0.012, 5, 12, Math.PI * 1.5).rotateX(Math.PI / 2), PAPER, c.moved([0, 0.004, 0]), { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), VERMILION, c.moved([0, 0.01, 0]), { embed: 0.3 });
    }
    const d = bs.around([0, 0.85, -0.2]).at(s * 90, -5);
    if (d) {
      b.stick(new THREE.TorusGeometry(0.07, 0.012, 5, 12, Math.PI * 1.5).rotateX(Math.PI / 2), WAVE, d, { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(0.016, 6, 4), PAPER, d.moved([0, 0.004, 0]), { embed: 0.3 });
    }
  }
  // small vermilion dots along the back
  for (const h of bs.scatter(10, { rng: R, minDist: 0.18, filter: (h) => h.n.y > 0.6 }))
    b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 8), VERMILION, h, { embed: 0.4 });

  for (const add of STAGE2) add(b);
  return b.root;
}
