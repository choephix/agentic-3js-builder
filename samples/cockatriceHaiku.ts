import * as THREE from "three";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { countershade, mottle, paint, scales, spots } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Cockatrice",
  description:
    "A rooster-dragon: a plump saffron-feathered body, folded bat wings, a green serpent tail with a stone-grey tip, a red comb and glowing petrifying eyes. Pebbles and a petrified mouse lie at its feet.",
  style: "whimsical low-poly mix",
  commit: "b816db2",
};

const SAFFRON = "#ffc23d";
const CREAM = "#fff4c9";
const PALE = "#fffbe9";
const ORANGE = "#f08a3c";
const RED = "#e63946";
const AMBER = "#ffa41b";
const MINT = "#a6e6d0";
const WING_BONE = "#2f7f6e";
const GREEN = "#5aa86b";
const GREEN_DARK = "#2f6f4a";
const EYE = "#fff176";
const PUPIL = "#2b1b2e";
const TALON = "#3e2f2a";
const STONE = "#b5b0a8";
const STONE_DARK = "#7d776f";
const PLUMES = ["#f06292", "#4fc3f7", "#ffd54f", "#b388eb", "#ff8a65"];

// A grey-and-white feather drawing: the part's colour tints it.
const feather = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">` +
    `<path d="M16 63 C4 46 2 22 16 1 C30 22 28 46 16 63Z" fill="#ffffff"/>` +
    `<path d="M16 60 L16 6" stroke="#9a9a9a" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);

const bodyPaint = countershade(SAFFRON, CREAM, { level: -0.1 });
const neckPaint = countershade(ORANGE, "#ffc46b", { level: 0 });
const scaleSkin = scales(GREEN, GREEN_DARK, { size: 0.035, width: 0.14, seed: 3 });
const stone = mottle(STONE, STONE_DARK, { size: 0.05, seed: 2 });
// The serpent tail is scaled green, and its tip has turned to stone.
const tailPaint = paint((_p, _n, s) => (s[0] > 0.8 ? stone : scaleSkin));
const legPaint = scales(AMBER, "#c76d12", { size: 0.02, width: 0.16, seed: 5 });
const headPaint = spots(CREAM, SAFFRON, { size: 0.05, amount: 0.25, seed: 4 });

// A small faceted pebble on the floor, `k` times the size of the base one.
const pebble = (k: number): OutlinePoint[] => [
  [0, 0],
  [0.07 * k, 0],
  [0.075 * k, 0.03 * k],
  [0.05 * k, 0.06 * k],
  [0.02 * k, 0.07 * k],
  [0, 0.07 * k],
];

export default function build() {
  const b = createBuilder({ name: "cockatrice" });

  // ---- skeleton -------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.44, -0.02], aim: [0, 0.46, 0.14], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.44, -0.02], [0, 0.48, 0.14], [0, 0.54, 0.23]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.44, -0.02],
      [0, 0.42, -0.22],
      [0, 0.45, -0.38],
      [0, 0.55, -0.45],
      [0, 0.66, -0.42],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );
  const neck = b.chain("neck", catmull([[0, 0.54, 0.23], [0, 0.64, 0.3], [0, 0.74, 0.33]]), {
    parent: spine.joints[1],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.76, 0.36], aim: [0, 0.8, 0.44], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.75, 0.41], aim: [0, 0.735, 0.5], role: "jaw" });

  // ---- body -----------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.44, -0.24], w: 0.08, h: 0.11 },
      { at: [0, 0.44, -0.02], w: 0.26, h: 0.27 },
      { at: [0, 0.48, 0.14], w: 0.25, h: 0.26 },
      { at: [0, 0.54, 0.23], w: 0.15, h: 0.15 },
    ],
    { bone: [tail, hips, spine], color: bodyPaint, smooth: false },
  );
  const neckTube = b.sweep(neck, [0.075, 0.058], { color: neckPaint, smooth: false });
  b.sweep(tail, [0.075, 0.016], { color: tailPaint, smooth: false, caps: { end: "point" } });

  // Feather cards carry the fine detail of the body and the hackles.
  const bodyHits = b.surface(body).scatter(120, { rng: rng(11), minDist: 0.04, filter: (h) => h.n.y > -0.6 });
  b.cards(bodyHits, feather, { size: [0.035, 0.085], lean: 50, bend: 20, vary: 0.25, rng: rng(12), color: bodyPaint });
  // A few feathers have turned to stone along the back.
  b.cards(
    bodyHits.filter((_h, i) => i % 10 === 3),
    feather,
    { size: [0.035, 0.085], lean: 50, bend: 20, vary: 0.25, rng: rng(13), color: stone },
  );
  const neckHits = b.surface(neckTube).scatter(60, { rng: rng(21), minDist: 0.03 });
  b.cards(neckHits, feather, { size: [0.03, 0.075], lean: 55, vary: 0.25, rng: rng(22), color: neckPaint });

  // Rump plumes: a fan of five coloured feathers, each in a plane of its own.
  [-0.7, -0.35, 0, 0.35, 0.7].forEach((phi, i) => {
    const sn = Math.sin(phi);
    const cs = Math.cos(phi);
    const up = new THREE.Vector3(sn, cs, -0.5).normalize();
    const plume: OutlinePoint[] = [
      [0, 0],
      [0.02, 0.07],
      [0.03, 0.2],
      [0, 0.32, "sharp"],
      [-0.03, 0.2],
      [-0.02, 0.07],
    ];
    b.extrude(plume, {
      at: [0, 0.49, -0.13],
      x: [cs, -sn, 0],
      y: [up.x, up.y, up.z],
      thickness: 0.008,
      smoothing: 1,
      bevel: 0.002,
      color: PLUMES[i],
      bone: hips,
    });
  });

  // ---- head -----------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.085, 8, 6), headPaint, { bone: head, at: [0, 0.76, 0.36], flat: true });
  // Comb: a zigzag ridge on top of the skull.
  const comb: OutlinePoint[] = [
    [-0.07, 0],
    [-0.06, 0.05],
    [-0.045, 0.035],
    [-0.03, 0.085, "sharp"],
    [-0.012, 0.045],
    [0.005, 0.1, "sharp"],
    [0.022, 0.05],
    [0.04, 0.085, "sharp"],
    [0.055, 0.035],
    [0.065, 0],
  ];
  b.extrude(comb, { x: [0, 0, 1], at: [0, 0.8, 0.34], thickness: 0.04, bevel: 0.008, color: RED, bone: head });
  // Beak: upper half on the skull, lower half on the jaw so it opens.
  b.sweep(bezier([0, 0.78, 0.4], [0, 0.79, 0.47], [0, 0.765, 0.53]), [0.03, 0.006], {
    bone: head,
    color: AMBER,
    caps: { start: "round", end: "point" },
  });
  b.sweep(bezier([0, 0.75, 0.4], [0, 0.74, 0.46], [0, 0.735, 0.505]), [0.024, 0.005], {
    bone: jaw,
    color: AMBER,
    caps: { end: "point" },
  });
  // Wattle hanging under the beak, riding the jaw.
  b.sweep(catmull([[0, 0.745, 0.42], [0, 0.7, 0.43], [0, 0.66, 0.41]]), [0.02, 0.01], { bone: jaw, color: RED });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.024, 8, 6), EYE, { bone: head, at: [s * 0.062, 0.79, 0.415] }), 1.2);
    b.part(new THREE.SphereGeometry(0.011, 6, 4), PUPIL, { bone: head, at: [s * 0.07, 0.79, 0.44] });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), PALE, {
      bone: head,
      at: [s * 0.07, 0.72, 0.39],
      scale: [0.6, 1.3, 0.6],
    });
  }

  // ---- wings: folded bat wings hanging off the flanks ----------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(
      `wing${L}`,
      polyline([
        [s * 0.13, 0.54, 0.14],
        [s * 0.18, 0.48, 0.0],
        [s * 0.2, 0.42, -0.14],
        [s * 0.16, 0.34, -0.34],
      ]),
      { parent: spine.joints[1], names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `finger${L}`], role: "wing" },
    );
    const armTube = b.sweep(arm, [0.012, 0.007], { color: WING_BONE, caps: { end: "point" } });
    const wrist = arm.joints[2];
    // Membrane between the arm and a scalloped trailing edge that runs back to the flank.
    b.membrane(
      arm,
      catmull([
        [s * 0.12, 0.42, -0.02],
        [s * 0.19, 0.37, -0.1],
        [s * 0.2, 0.36, -0.22],
        [s * 0.16, 0.34, -0.34],
      ]),
      { thickness: 0.008, color: MINT, scallop: 0.18 },
    );
    // Finger ribs fanning from the wrist across the membrane.
    b.rod(wrist, [s * 0.19, 0.37, -0.1], 0.005, { color: WING_BONE });
    b.rod(wrist, [s * 0.2, 0.36, -0.22], 0.005, { color: WING_BONE });
    // Primary-feather cards along the leading arm.
    const armHits = b.surface(armTube).scatter(10, { rng: rng(31 + s), minDist: 0.03 });
    b.cards(armHits, feather, { size: [0.035, 0.06], lean: 70, vary: 0.2, rng: rng(41), color: SAFFRON });
  }

  // ---- legs and talons ------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = s * 0.075;
    const leg = b.chain(
      `leg${L}`,
      polyline([
        [x, 0.37, -0.02],
        [x, 0.27, 0.06],
        [x, 0.13, -0.07],
        [x, 0.03, 0.02],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `hock${L}`, `ankle${L}`], role: "leg" },
    );
    b.sweep(leg, [0.04, 0.016], { color: legPaint, smooth: false });
    const ankle = leg.tip;
    if (!ankle) throw new Error("cockatrice: leg chain has no ankle tip");
    // Three toes forward, one back; each ends in a talon.
    const toes: Array<{ name: string; mid: [number, number, number]; end: [number, number, number]; claw: [number, number, number] }> = [
      { name: "front", mid: [x, 0.016, 0.075], end: [x, 0.013, 0.14], claw: [0, -0.2, 1] },
      { name: "out", mid: [x + s * 0.03, 0.016, 0.07], end: [x + s * 0.07, 0.013, 0.125], claw: [s * 0.3, -0.2, 1] },
      { name: "in", mid: [x - s * 0.01, 0.016, 0.07], end: [x - s * 0.04, 0.013, 0.12], claw: [-s * 0.3, -0.2, 1] },
      { name: "back", mid: [x, 0.016, -0.02], end: [x + s * 0.005, 0.013, -0.06], claw: [0, -0.1, -1] },
    ];
    for (const t of toes) {
      const toe = b.chain(`toe${L}${t.name}`, polyline([[x, 0.03, 0.02], t.mid, t.end]), {
        parent: ankle,
        names: [`toe${L}${t.name}1`, `toe${L}${t.name}2`],
        role: "digit",
      });
      b.sweep(toe, [0.014, 0.008], { color: AMBER, smooth: false, caps: { end: "point" } });
      b.spike(t.end, t.claw, 0.035, 0.007, { color: TALON });
    }
  }

  // ---- story: pebbles and a petrified mouse at the feet --------------------
  b.lathe(pebble(1), { at: [-0.24, 0, 0.14], segments: 7, color: stone });
  b.lathe(pebble(0.6), { at: [0.25, 0, -0.1], segments: 6, color: stone });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), stone, { at: [0.17, 0.03, 0.2], scale: [1, 0.8, 1.6] });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), stone, { at: [0.17, 0.03, 0.24] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 5, 4), stone, { at: [0.17 + s * 0.012, 0.05, 0.24] });
  }
  b.sweep(bezier([0.17, 0.02, 0.16], [0.2, 0.005, 0.12], [0.23, 0.01, 0.06]), [0.004, 0.002], { color: stone });

  return b.root;
}
