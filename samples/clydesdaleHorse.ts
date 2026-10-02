import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame, line } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { gradient } from "../src/paint";
import { animeEye, cel, furEdge, INK, inkLines } from "../kits/toon";
import { svg } from "../src/texture";

const COAT_LIT = "#8c3a2b";
const COAT_SHADOW = "#5b1d2a";
const COAT = cel(
  furEdge(COAT_LIT, COAT_SHADOW, {
    level: -0.2,
    teeth: 0.1,
    period: 0.055,
    along: [0, 0, 1],
    ink: INK,
    inkWidth: 0.028,
  }),
);
const COAT_CLEAN = cel(COAT_LIT, COAT_SHADOW);
const SOCK = cel("#e8ddd1", "#b8a4ab");
const CREAM = cel("#f2e4d0", "#c5a4a2");
const HOOF = cel("#362532", "#1e1422");
const MANE = cel("#271827", "#170f1a");
const LEATHER = cel("#4b1d22", "#261325");
const LEATHER_LIT = cel("#7e3d2b", "#42202c");
const BRASS = cel("#e1a43b", "#9d4b30");
const INK_PAINT = inkLines(COAT_CLEAN, { levels: [0.16], axis: [0, 0, 1], width: 0.07 });

const FEATHER = svg(
  `<svg viewBox="0 0 32 96">
    <path d="M16 96 C13 82 8 76 6 64 C5 52 10 40 13 30 C14 22 14 10 16 0 C18 10 18 22 19 30 C22 40 27 52 26 64 C24 76 19 82 16 96Z" fill="#f5e9dc"/>
    <path d="M16 90 C13 72 10 54 16 12 C22 54 19 72 16 90Z" fill="#d8bfc0"/>
    <path d="M16 87 L8 72 M16 78 L7 60 M16 68 L8 49 M16 57 L10 38 M16 46 L12 27 M16 36 L14 16" stroke="#fffaf0" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 192 },
);
const MANE_CARD = svg(
  `<svg viewBox="0 0 48 128">
    <path d="M24 128 C10 111 9 96 16 82 C4 67 10 53 20 42 C11 28 18 12 27 0 C26 25 38 38 31 55 C43 70 35 88 31 101 C36 111 31 121 24 128Z" fill="#251827"/>
    <path d="M25 117 C18 95 19 76 25 58 C22 43 25 25 29 12" stroke="#6b3943" stroke-width="3" fill="none"/>
  </svg>`,
  { size: 192 },
);
const BLAZE = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M23 0 L42 0 L39 32 L45 61 L35 96 L28 128 L17 128 L26 92 L18 63 L25 31Z" fill="#f7eee3"/>
  </svg>`,
  { size: 128 },
);
const EYE = animeEye({ iris: "#e7a52b", irisLight: "#ffe18a", irisDark: "#73302d", size: 256, blush: false });

export const meta = {
  name: "Clydesdale Horse",
  description: "A feather-footed Clydesdale draft horse with Genshin-inspired cel shading, ornate tack, mane, and bridle.",
  style: "Genshin Impact",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "clydesdaleHorse", detail: 1.15, paintSize: 2048 });
  const hips = b.joint("hips", { at: [0, 1.16, -0.38], role: "spine" });

  const spinePath = catmull([
    hips.at,
    [0, 1.28, -0.12],
    [0, 1.42, 0.18],
    [0, 1.5, 0.52],
    [0, 1.5, 0.68],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["pelvis", "back", "withers", "chest", "shoulder"],
    role: "spine",
  });
  const body = b.sweep(spine, (t) => 0.25 - 0.035 * Math.abs(t - 0.48), {
    color: (t) => (t > 0.7 ? COAT_CLEAN : INK_PAINT),
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "barrel",
  });
  b.sweep(spine, (t) => 0.22 - 0.02 * t, {
    color: COAT,
    shift: [0, -0.055],
    section: { ngon: 8 },
    caps: "none",
    group: "body",
    name: "belly",
  });

  const neckPath = catmull([
    spine.at(1),
    [0, 1.58, 0.7],
    [0, 1.7, 0.8],
    [0, 1.84, 0.9],
    [0, 1.91, 0.98],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip!,
    names: ["neckBase", "neckLow", "neckMid", "neckTop", "neckTip"],
    role: "neck",
  });
  b.sweep(neck, (t) => 0.19 - 0.075 * t, {
    color: COAT,
    section: { ngon: 8 },
    group: "neck",
    name: "neck",
  });

  const head = b.joint("head", { parent: neck.tip!, at: neck.tip!.at, dir: [0, -0.03, 1], role: "head", group: "head" });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT_CLEAN, {
    bone: head,
    at: head.at,
    scale: [0.225, 0.235, 0.3],
    group: "head",
    name: "skull",
  });
  const muzzlePaint = cel(gradient(CREAM, COAT_CLEAN, [0, 1.78, 1.12], [0, 1.85, 1.3]));
  b.sweep(
    catmull([
      [0, 1.84, 1.08],
      [0, 1.81, 1.23],
      [0, 1.8, 1.39],
    ]),
    [0.125, 0.095],
    { bone: head, color: muzzlePaint, section: { ngon: 8 }, caps: "round", group: "head", name: "muzzle" },
  );
  b.part(new THREE.SphereGeometry(1, 10, 6), HOOF, {
    bone: head,
    at: [0, 1.8, 1.405],
    scale: [0.105, 0.075, 0.055],
    group: "head",
    name: "velvetNose",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.77, 1.18], dir: [0, 0.1, 1], role: "jaw", group: "head" });
  b.sweep(polyline([[0, 1.77, 1.15], [0, 1.76, 1.34]]), [0.085, 0.06], {
    bone: jaw,
    color: CREAM,
    section: { ngon: 8 },
    group: "head",
    name: "lowerJaw",
  });
  b.rod([0, 1.78, 1.33], [0, 1.78, 1.43], 0.018, { bone: jaw, color: INK, name: "mouthLine" });
  b.rod([-0.06, 1.79, 1.42], [0.06, 1.79, 1.42], 0.012, { bone: jaw, color: INK, name: "bit" });

  for (const s of [1, -1]) {
    const eyeHit = head.local({ left: s * 0.165, up: 0.055, forward: 0.205 });
    b.decal(skull, EYE, {
      at: eyeHit,
      dir: [0, 0, 1],
      size: [0.095, 0.08],
      mirror: s > 0,
      name: `eye${s > 0 ? "L" : "R"}`,
      group: "head",
    });
    const earAt = head.local({ left: s * 0.125, up: 0.18, back: 0.02 });
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0.06, 0.16],
        [0.015, 0.27, "sharp"],
        [-0.045, 0.15],
      ],
      {
        at: earAt,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.012,
        smoothing: 1,
        color: COAT_CLEAN,
        group: "head",
        name: `ear${s > 0 ? "L" : "R"}`,
      },
    );
  }
  b.decal(skull, BLAZE, { at: [0, 1.9, 1.18], dir: [0, 0.2, 1], size: [0.065, 0.19], lift: 0.003, name: "whiteBlaze", group: "head" });

  // Four complete, slightly spread draft-horse legs with heavy fetlocks.
  const legSpecs = [
    { side: 1, front: false, z: -0.45, root: [0.18, 1.18, -0.45] as [number, number, number], foot: [0.2, 0.05, -0.52] as [number, number, number] },
    { side: -1, front: false, z: -0.45, root: [-0.18, 1.18, -0.45] as [number, number, number], foot: [-0.2, 0.05, -0.52] as [number, number, number] },
    { side: 1, front: true, z: 0.55, root: [0.19, 1.4, 0.55] as [number, number, number], foot: [0.22, 0.05, 0.62] as [number, number, number] },
    { side: -1, front: true, z: 0.55, root: [-0.19, 1.4, 0.55] as [number, number, number], foot: [-0.22, 0.05, 0.62] as [number, number, number] },
  ];
  for (const spec of legSpecs) {
    const bendA = spec.front ? [0, 0, 1] : [0, 0, 1];
    const bendB = spec.front ? [0, 0, -1] : [0, 0, -1];
    const points = limb(spec.root, spec.foot, [0.38, 0.4, 0.38], [bendA, bendB]);
    const suffix = `${spec.front ? "Front" : "Hind"}${spec.side > 0 ? "L" : "R"}`;
    const chain = b.chain(`leg${suffix}`, points, {
      parent: hips,
      names: [`hip${suffix}`, `knee${suffix}`, `hock${suffix}`, `fetlock${suffix}`],
      role: "leg",
      contact: spec.foot,
    });
    b.sweep(chain, (t) => (t < 0.7 ? 0.09 - t * 0.018 : 0.071), {
      color: (t) => (t > 0.67 ? SOCK : COAT_CLEAN),
      section: { ngon: 7 },
      caps: "round",
      group: "legs",
      name: `legTube${suffix}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), HOOF, {
      bone: chain.tip!,
      at: chain.tip!.at,
      scale: [0.095, 0.06, 0.12],
      group: "legs",
      name: `hoof${suffix}`,
    });
    const featherRing = b.ring(line(chain.joints[2], chain.tip!), { count: 9, radius: 0.075, fromDeg: 0, toDeg: 360 });
    for (const item of featherRing.items) {
      b.cards([item], FEATHER, {
        size: [0.035, 0.17],
        lean: 25,
        bend: 18,
        vary: 0.16,
        spin: 8,
        rng: rng(100 + (spec.front ? 1 : 2) * (spec.side > 0 ? 1 : 7)),
        color: SOCK,
        group: "feathers",
      });
    }
    // A crisp fetlock cuff above the cards.
    b.sweep(catmull([chain.at(0.67).at, chain.at(0.74).at]), [0.093, 0.083], {
      color: CREAM,
      bone: chain.joints[2],
      section: { ngon: 8 },
      caps: "round",
      group: "feathers",
      name: `fetlock${suffix}`,
    });
  }

  // A flowing tail with a dark root and individually readable strand cards.
  const tail = b.chain(
    "tail",
    catmull([
      hips.at,
      [0, 1.08, -0.66],
      [0, 0.92, -0.86],
      [0, 0.69, -0.97],
      [0, 0.49, -0.91],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailLow", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.115 - 0.085 * t, {
    color: MANE,
    section: { ngon: 7 },
    caps: "point",
    group: "tail",
    name: "tailCore",
  });
  const tailFrames = b.along(tail, 18, (at) => {
    const drift = 0.08 * Math.sin(at.t * Math.PI);
    return frame(at.at, [drift, -0.2, -1]);
  });
  b.cards(tailFrames, MANE_CARD, {
    size: [0.07, 0.23],
    lean: 20,
    bend: 25,
    vary: 0.3,
    rng: rng(81),
    color: MANE,
    group: "tail",
  });

  // Thick mane strips run down the back of the neck, with two rows for a hero silhouette.
  const maneFrames = b.along(neck, 15, (at) => {
    const p = at.at;
    return frame([p.x + 0.14, p.y + 0.012, p.z - 0.025], [1, 0, 0]);
  });
  b.cards(maneFrames, MANE_CARD, {
    size: [0.09, 0.24],
    lean: 58,
    bend: 24,
    vary: 0.22,
    rng: rng(82),
    color: MANE,
    group: "mane",
  });

  // Saddle pad, padded saddle and gold hardware.
  b.extrude(
    [
      [-0.3, -0.18],
      [0.3, -0.18],
      [0.32, -0.03],
      [0.25, 0.16],
      [-0.25, 0.16],
      [-0.32, -0.03],
    ],
    {
      at: [0, 1.49, 0.02],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.035,
      bevel: 0.018,
      smoothing: 1,
      bone: spine.joints[2],
      color: CREAM,
      group: "tack",
      name: "saddlePad",
    },
  );
  b.part(new THREE.SphereGeometry(1, 12, 6), LEATHER_LIT, {
    bone: spine.joints[2],
    at: [0, 1.63, 0.03],
    scale: [0.25, 0.13, 0.19],
    group: "tack",
    name: "saddle",
  });
  b.part(new THREE.BoxGeometry(0.07, 0.16, 0.28), LEATHER, {
    bone: spine.joints[2],
    at: [0, 1.72, -0.03],
    group: "tack",
    name: "saddleHorn",
  });
  const girth = b.surface(body).loop(spine.at(0.57), { lift: 0.018 });
  b.sweep(girth, 0.018, { color: LEATHER, group: "tack", name: "girth" });
  const chestLoop = b.surface(body).loop(spine.at(0.88), { lift: 0.02 });
  b.sweep(chestLoop, 0.016, { color: LEATHER_LIT, group: "tack", name: "breastCollar" });
  for (const s of [1, -1]) {
    const stirrupTop: [number, number, number] = [s * 0.235, 1.61, 0.03];
    const stirrupLow: [number, number, number] = [s * 0.29, 0.78, 0.06];
    b.rod(stirrupTop, stirrupLow, 0.014, { bone: spine.joints[2], color: LEATHER, name: `stirrupStrap${s > 0 ? "L" : "R"}`, group: "tack" });
    b.sweep(polyline([stirrupLow, [s * 0.29, 0.72, 0.1], [s * 0.29, 0.72, -0.02], stirrupLow]), 0.014, {
      bone: spine.joints[2],
      color: BRASS,
      caps: "round",
      group: "tack",
      name: `stirrup${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.025, 8, 5), BRASS, { bone: spine.joints[2], at: [s * 0.23, 1.65, 0.03], group: "tack", name: `saddleRivet${s > 0 ? "L" : "R"}` });
  }

  // Bridle: browband, cheek straps, bit rings and reins.
  b.sweep(polyline([[-0.19, 1.99, 1.05], [0, 2.04, 1.1], [0.19, 1.99, 1.05]]), 0.014, {
    bone: head,
    color: BRASS,
    caps: "round",
    group: "bridle",
    name: "browband",
  });
  for (const s of [1, -1]) {
    const cheekPath = polyline([
      [s * 0.18, 2.0, 1.06],
      [s * 0.185, 1.85, 1.18],
      [s * 0.06, 1.78, 1.4],
    ]);
    b.sweep(cheekPath, 0.012, { bone: head, color: LEATHER, caps: "round", group: "bridle", name: `cheekStrap${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(0.025, 8, 5), BRASS, { bone: head, at: [s * 0.06, 1.78, 1.4], group: "bridle", name: `bitRing${s > 0 ? "L" : "R"}` });
    b.sweep(
      bezier(
        [s * 0.06, 1.78, 1.4],
        [s * 0.16, 1.6, 1.0],
        [s * 0.23, 1.6, 0.45],
        [s * 0.22, 1.61, 0.08],
      ),
      0.009,
      { bone: head, color: LEATHER_LIT, caps: "round", group: "bridle", name: `rein${s > 0 ? "L" : "R"}` },
    );
  }
  b.part(new THREE.SphereGeometry(0.018, 6, 4), BRASS, { bone: head, at: [0, 2.04, 1.1], group: "bridle", name: "browGem" });

  return b.root;
}
