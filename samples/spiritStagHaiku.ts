import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { offset, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { paint, spots } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Spirit Stag",
  description:
    "A glowing forest spirit stag at real red-deer size: a dappled mint coat, cel-shaded in a Genshin look, with gold filigree, tassels and a glowing crystal antler crown and back spine.",
  style: "Genshin Impact",
  commit: "b816db2",
};

// Palette. Painted surfaces (coat, belly, socks, gold) share one paint sheet; flat colours are for the glowing crystals,
// hooves and nose.
const MINT = "#cdeedd";
const DAPPLE = "#7fcca6";
const BELLY_LIGHT = "#f4fcf4";
const SOCK_LIGHT = "#3b8f7b";
const SOCK_SHADE = "#24635a";
const CRYSTAL = "#2fd3e0";
const ICE = "#e6fdff";
const HOOF = "#2b2846";

const COAT = cel(
  spots(MINT, DAPPLE, { size: 0.2, amount: 0.3, seed: 4 }),
  spots("#a9dcc8", "#5fae95", { size: 0.2, amount: 0.3, seed: 4 }),
  { threshold: -0.15 },
);
const BELLY = cel(BELLY_LIGHT, "#cfe6dc");
const BODY = furEdge(COAT, BELLY, { level: -0.25, teeth: 0.06, period: 0.045, ink: INK, inkWidth: 0.05 });
const SOCK = cel(SOCK_LIGHT, SOCK_SHADE);
const LEG = paint((p) => (p.y < 0.36 ? SOCK : COAT));
const GOLD = cel("#ffd873", "#d6963e");
const EAR = cel("#e4f7ee", "#a6d3c4");

// Surface drawings: gold filigree scrolls (a mirrored pair on one half), tassel cords, mane leaves and cheek marks.
const scroll = (d: string) =>
  `<path d="${d}" stroke="#8a5a1e" stroke-width="7"/><path d="${d}" stroke="#ffe08a" stroke-width="3.5"/>`;
const FILIGREE_HALF = [
  scroll("M60 74 C58 56 40 56 28 44 C16 32 22 14 38 16 C50 18 50 34 40 34 C32 34 32 24 38 24"),
  scroll("M46 52 C40 44 42 34 50 30 C56 36 52 44 46 52"),
  scroll("M30 62 C20 68 10 64 8 56 C6 48 14 46 16 52"),
  scroll("M60 26 C60 16 64 10 70 8"),
  `<circle cx="38" cy="22" r="3" fill="#ffe08a" stroke="#8a5a1e" stroke-width="1.5"/>`,
  `<circle cx="16" cy="50" r="2.4" fill="#ffe08a" stroke="#8a5a1e" stroke-width="1.2"/>`,
].join("");
const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${FILIGREE_HALF}<g transform="translate(120 0) scale(-1 1)">${FILIGREE_HALF}</g></g></svg>`,
  { size: 256 },
);

const TASSEL_GOLD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><rect x="13" y="0" width="14" height="12" rx="3" fill="#ffd873" stroke="#b7802a" stroke-width="2"/><path d="M14 12 L10 92 M18 12 L16 96 M22 12 L24 96 M26 12 L30 92" stroke="#ffe39a" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="58" r="4.5" fill="#ffd873" stroke="#b7802a" stroke-width="1.6"/><circle cx="20" cy="95" r="3" fill="#ffd873" stroke="#b7802a" stroke-width="1.4"/></svg>`,
  { size: 160 },
);
const TASSEL_TEAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><rect x="13" y="0" width="14" height="12" rx="3" fill="#ffd873" stroke="#b7802a" stroke-width="2"/><path d="M14 12 L10 92 M18 12 L16 96 M22 12 L24 96 M26 12 L30 92" stroke="#48d8c8" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="58" r="4.5" fill="#ffd873" stroke="#b7802a" stroke-width="1.6"/><circle cx="20" cy="95" r="3" fill="#ffd873" stroke="#b7802a" stroke-width="1.4"/></svg>`,
  { size: 160 },
);

const LEAF = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64"><path d="M20 2 C38 20 36 46 20 62 C4 46 2 20 20 2Z" fill="#7fe0ad" stroke="#2c8f72" stroke-width="2.5"/><path d="M20 9 L20 55" stroke="#2c8f72" stroke-width="2"/><path d="M20 22 L30 30 M20 36 L11 44" stroke="#3fb88c" stroke-width="1.8"/></svg>`,
  { size: 128 },
);
const LEAF_GLOW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64"><path d="M20 2 C38 20 36 46 20 62 C4 46 2 20 20 2Z" fill="#c8fff4" stroke="#27d6cf" stroke-width="2.5"/><path d="M20 9 L20 55" stroke="#27d6cf" stroke-width="2"/></svg>`,
  { size: 128 },
);
const TEAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30"><path d="M10 0 C16 10 18 16 18 20 A8 8 0 0 1 2 20 C2 16 4 10 10 0Z" fill="#7ff7ff" stroke="#1d7fa3" stroke-width="1.5"/></svg>`,
  { size: 64 },
);

const EYE = animeEye({ iris: "#7ff7ff", irisLight: "#e6ffff", irisDark: "#1d7fa3" });

export default function build() {
  const b = createBuilder({ name: "spiritStag", detail: 1.25 });

  // Skeleton: hips, spine, neck and head, two jaws, four limbs with a tail.
  const hips = b.joint("hips", { at: [0, 1.12, -0.6], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.13, -0.42],
      [0, 1.13, -0.12],
      [0, 1.14, 0.1],
      [0, 1.18, 0.28],
      [0, 1.22, 0.44],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.22, 0.44],
      [0, 1.38, 0.6],
      [0, 1.52, 0.8],
      [0, 1.62, 0.96],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.62, 0.96], dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, 1.0], dir: [0, -0.3, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.13, -0.46],
      [0, 1.2, -0.7],
      [0, 1.27, -0.9],
      [0, 1.2, -1.0],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Legs: front elbow back, carpus forward; hind stifle forward, hock back. Each hoof lands on the floor.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const foreLeg = b.chain(
      `fore${side}`,
      polyline(
        limb([s * 0.17, 1.08, 0.26], [s * 0.2, 0.004, 0.36], [0.5, 0.46, 0.2], [
          [0, 0, -1],
          [0, 0, 1],
        ]),
      ),
      {
        parent: spine.joints[2],
        names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`, `hoofF${side}`],
        role: "leg",
      },
    );
    b.sweep(foreLeg, (t) => 0.095 - 0.05 * t, { to: 0.86, color: LEG });
    b.sweep(foreLeg, 0.032, { from: 0.84, color: HOOF, caps: { end: "flat" } });
    const foreRing = b.ring(foreLeg.joints[2], { count: 14, radius: 0.062 });
    b.sweep(catmull(foreRing.items, { closed: true }), 0.011, { color: GOLD });

    const hindLeg = b.chain(
      `hind${side}`,
      polyline(
        limb([s * 0.17, 1.08, -0.5], [s * 0.2, 0.004, -0.6], [0.5, 0.46, 0.2], [
          [0, 0, 1],
          [0, 0, -1],
        ]),
      ),
      {
        parent: spine.joints[0],
        names: [`hipH${side}`, `stifleH${side}`, `hockH${side}`, `hoofH${side}`],
        role: "leg",
      },
    );
    b.sweep(hindLeg, (t) => 0.1 - 0.05 * t, { to: 0.86, color: LEG });
    b.sweep(hindLeg, 0.032, { from: 0.84, color: HOOF, caps: { end: "flat" } });
    const hindRing = b.ring(hindLeg.joints[2], { count: 14, radius: 0.062 });
    b.sweep(catmull(hindRing.items, { closed: true }), 0.011, { color: GOLD });
  }

  // Body, neck and head.
  const torso = b.loft(
    [
      { at: [0, 1.13, -0.74], w: 0.34, h: 0.4 },
      { at: [0, 1.14, -0.5], w: 0.44, h: 0.47 },
      { at: [0, 1.15, -0.12], w: 0.46, h: 0.5 },
      { at: [0, 1.19, 0.22], w: 0.42, h: 0.46 },
      { at: [0, 1.22, 0.4], w: 0.26, h: 0.28 },
    ],
    { bone: spine, color: BODY },
  );
  const neckTube = b.sweep(neck, (t) => 0.17 - 0.06 * t, { color: BODY });

  const headLoft = b.loft(
    [
      { at: [0, 1.72, 0.9], w: 0.15, h: 0.16 },
      { at: [0, 1.78, 1.0], w: 0.17, h: 0.17 },
      { at: [0, 1.74, 1.12], w: 0.16, h: 0.16 },
      { at: [0, 1.68, 1.24], w: 0.12, h: 0.12 },
      { at: [0, 1.65, 1.34], w: 0.08, h: 0.09 },
    ],
    { bone: head, color: COAT },
  );
  b.loft(
    [
      { at: [0, 1.66, 1.0], w: 0.12, h: 0.1 },
      { at: [0, 1.63, 1.16], w: 0.1, h: 0.07 },
      { at: [0, 1.63, 1.28], w: 0.07, h: 0.05 },
    ],
    { bone: jaw, color: BELLY },
  );
  b.part(new THREE.SphereGeometry(0.055, 8, 6), INK, { bone: head, at: [0, 1.66, 1.35], scale: [1, 0.8, 1] });

  const hs = b.surface(headLoft);
  for (const s of [1, -1]) {
    const eyeHit = hs.around([0, 1.74, 1.1]).at(s * 42, 16);
    if (!eyeHit) throw new Error("eye missed the head");
    glow(b.decal(hs, EYE, { at: eyeHit, size: [0.09, 0.12], mirror: s > 0 }));

    const tearHit = hs.around([0, 1.74, 1.1]).at(s * 40, -14);
    if (!tearHit) throw new Error("cheek missed the head");
    glow(b.decal(hs, TEAR, { at: tearHit, size: [0.02, 0.03], mirror: s > 0 }));

    // Leaf ears: face-on from the front, raised and swept back.
    b.extrude(
      [
        [0, 0],
        [0.14, 0.09],
        [0.32, 0],
        [0.14, -0.08],
      ],
      {
        at: [s * 0.05, 1.8, 0.95],
        x: [s * 0.9, 0.25, -0.25],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.005,
        smoothing: 1,
        color: EAR,
        bone: head,
      },
    );
  }

  const brow = hs.nearest([0, 1.8, 1.16]);
  b.extrude(
    [
      [0, 0.04],
      [0.03, 0],
      [0, -0.04],
      [-0.03, 0],
    ],
    { at: brow.moved([0, 0.004, 0]), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, smoothing: 1, color: GOLD, bone: head },
  );

  // Crystal antlers: faceted hexagonal beams, tines and shards that glow, each on a gold collar.
  for (const s of [1, -1]) {
    const pedicle = hs.nearest([s * 0.07, 1.86, 0.98]);
    const beam = catmull([pedicle, [s * 0.1, 2.0, 0.93], [s * 0.19, 2.12, 0.87], [s * 0.27, 2.2, 0.8]]);
    glow(b.sweep(beam, [0.036, 0.008], { bone: head, section: { ngon: 6 }, smooth: false, bands: [[0.55, CRYSTAL], [1, ICE]] }));

    const tines: [number, [number, number, number]][] = [
      [0.38, [s * 0.55, 0.9, 0.35]],
      [0.66, [s * 0.8, 0.5, 0.2]],
    ];
    for (const [t, dir] of tines) {
      const base = beam.at(t);
      const mid = offset(base, dir, 0.075);
      const tip = offset(mid, [s * 0.2, 1, 0.2], 0.085);
      glow(b.sweep(catmull([base, mid, tip]), [0.02, 0], { bone: head, section: { ngon: 6 }, smooth: false, bands: [[0.6, CRYSTAL], [1, ICE]] }));
    }

    b.along(beam, 3, (at) => {
      glow(b.spike(at, [s * 0.5, 0.7, -0.3], 0.07, 0.014, { section: { ngon: 6 }, color: ICE }));
    });

    const collar = b.ring(pedicle, { count: 14, radius: 0.046 });
    b.sweep(catmull(collar.items, { closed: true }), 0.007, { color: GOLD, bone: head });
  }

  // Back: the torso surface drives the girth band, the crystal spine and the flank filigree.
  const backSurf = b.surface(torso);
  const crystalHeights = [0.1, 0.14, 0.11, 0.13, 0.1];
  [-0.5, -0.3, -0.1, 0.1, 0.3].forEach((z, i) => {
    const hit = backSurf.nearest([0, 1.7, z]);
    glow(b.spike(hit, hit, crystalHeights[i], 0.03, { section: { ngon: 6 }, color: CRYSTAL }));
  });

  const girth = backSurf.loop(spine.joints[2], { lift: 0.012 });
  b.sweep(girth, 0.014, { color: GOLD });
  b.along(girth, 14, (at) => {
    b.part(new THREE.SphereGeometry(0.022, 8, 6), GOLD, { at });
  });

  for (const s of [1, -1]) {
    const hipHit = backSurf.around([0, 1.14, -0.3]).at(s * 90, 0);
    if (!hipHit) throw new Error("hip flank missed");
    b.decal(backSurf, FILIGREE, { at: hipHit, size: [0.24, 0.16], mirror: s < 0 });
    const chestHit = backSurf.around([0, 1.2, 0.22]).at(s * 90, 0);
    if (!chestHit) throw new Error("chest flank missed");
    b.decal(backSurf, FILIGREE, { at: chestHit, size: [0.16, 0.107], mirror: s < 0 });
  }

  // Neck: collar, tassels, flank filigree, mane leaves and a crystal pendant.
  const collarRing = b.ring(neck.at(0.55), { count: 16, radius: 0.15 });
  b.sweep(catmull(collarRing.items, { closed: true }), 0.011, { color: GOLD });
  const tasselFrames = [4, 8, 12].map((i) => frame(collarRing.items[i], [0, 1, 0]));
  b.cards(tasselFrames, [TASSEL_GOLD, TASSEL_TEAL], { size: [0.05, 0.14], lean: 180, rng: rng(3) });

  const neckSurf = b.surface(neckTube);
  for (const s of [1, -1]) {
    const neckHit = neckSurf.around([0, 1.36, 0.6]).at(s * 90, 0);
    if (!neckHit) throw new Error("neck flank missed");
    b.decal(neckSurf, FILIGREE, { at: neckHit, size: [0.14, 0.093], mirror: s < 0 });
  }

  const chest = neckSurf.nearest([0, 1.3, 0.7]);
  b.extrude(
    [
      [0, 0],
      [0.035, -0.02],
      [0.04, -0.06],
      [0, -0.1],
      [-0.04, -0.06],
      [-0.035, -0.02],
    ],
    { at: chest.moved([0, 0.004, 0]), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.005, smoothing: 1, color: GOLD },
  );
  glow(
    b.extrude(
      [
        [0, -0.01],
        [0.02, -0.03],
        [0.022, -0.06],
        [0, -0.078],
        [-0.022, -0.06],
        [-0.02, -0.03],
      ],
      { at: chest.moved([0, 0.012, 0]), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, smoothing: 1, color: CRYSTAL },
    ),
  );

  const maneHits = neckSurf.scatter(70, { rng: rng(11), minDist: 0.06, filter: (h) => h.n.y > 0.3 });
  b.cards(maneHits, LEAF, { size: [0.07, 0.13], lean: 35, bend: 20, vary: 0.25, rng: rng(12) });
  glow(b.cards(maneHits.filter((_, i) => i % 3 === 0), LEAF_GLOW, { size: [0.07, 0.13], lean: 40, bend: 20, rng: rng(13) }));

  // Spirit motes: small glowing orbs drifting round the hips, flanks and withers, each riding the nearest spine joint.
  const motes: [number, number, number][] = [
    [0.28, 1.42, -0.25],
    [-0.28, 1.46, 0.02],
    [0.3, 1.05, -0.62],
    [-0.3, 1.1, 0.42],
    [0.0, 1.66, 0.74],
  ];
  for (const at of motes) {
    glow(b.part(new THREE.SphereGeometry(0.02, 8, 6), CRYSTAL, { bone: spine.joints[1], at }));
  }

  // Tail: a short upturned mint tuft with a glowing crystal tip.
  b.sweep(tail, (t) => 0.07 - 0.03 * t, { to: 0.7, color: BODY });
  glow(b.sweep(tail, (t) => 0.07 - 0.03 * t, { from: 0.7, color: ICE }));

  return b.root;
}
