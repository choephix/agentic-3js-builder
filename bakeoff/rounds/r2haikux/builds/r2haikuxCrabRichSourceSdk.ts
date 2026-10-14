import * as THREE from "three";
import { catmull, createBuilder, gradient, mottle, rng, spots } from "../../../../src/index";

type Vec = [number, number, number];

const BRICK = "#a2401f";
const DEEP = "#6b2213";
const ORANGE = "#e47b2c";
const CREAM = "#f1e4c6";
const TIP = "#1f1512";
const STALK = "#8e3320";
const KNOB = "#b64a2b";
const KNOB_LIGHT = "#cc6230";
const WEED = "#4d6b2a";
const WEED_LIGHT = "#8aa64e";
const BARNACLE = "#d9cdb1";
const EYE = "#120c0a";

/** A point given on the creature's left (+X) side. `s` = -1 mirrors it to the right. */
const mirror = (s: number, p: Vec): Vec => [s * p[0], p[1], p[2]];

export const meta = {
  name: "Red rock crab",
  description:
    "A feisty red rock crab: a wide knobbly brick-red shell speckled orange and cream, stalked eyes, eight jointed walking legs with pointed tips, and one oversized raised claw with dark, toothed pincers. A barnacle and a strand of seaweed cling to the back of the shell.",
};

export default function redRockCrab() {
  const b = createBuilder({ name: "red rock crab" });

  // Paints: a cloudy brick base speckled with orange and cream, and a speckled version for the limbs.
  const shell = spots(mottle(BRICK, DEEP, { size: 0.08, seed: 3, contrast: 1.2 }), [ORANGE, CREAM], {
    size: 0.02,
    amount: 0.1,
    seed: 7,
  });
  const limb = spots(mottle(BRICK, DEEP, { size: 0.05, seed: 4 }), [ORANGE, CREAM], {
    size: 0.014,
    amount: 0.1,
    seed: 12,
  });

  // Body: a wide, flattened carapace lofted along z. Its joint "body" is the root.
  b.joint("body", { at: [0, 0.1, 0] });
  const carapace = b.loft(
    [
      { at: [0, 0.095, -0.1], w: 0.15, h: 0.06 },
      { at: [0, 0.1, -0.04], w: 0.26, h: 0.085 },
      { at: [0, 0.1, 0.02], w: 0.31, h: 0.1 },
      { at: [0, 0.1, 0.07], w: 0.28, h: 0.09 },
      { at: [0, 0.095, 0.1], w: 0.15, h: 0.06 },
    ],
    { color: shell, bone: "body", name: "carapace", sides: 14 },
  );

  // Knobbles scattered over the top and upper sides of the shell.
  const shellTop = b.surface(carapace);
  const knobs = shellTop.scatter(90, {
    rng: rng(21),
    minDist: 0.028,
    filter: (h) => h.n.y > -0.1 && Math.abs(h.at.x) < 0.15,
  });
  const knobColours = [KNOB, KNOB_LIGHT, KNOB, DEEP];
  knobs.forEach((h, i) => {
    const r = 0.007 + 0.0035 * ((i * 5) % 3);
    b.stick(new THREE.SphereGeometry(r, b.segments(6), b.segments(4)), knobColours[i % 4], h, { embed: 0.4 });
  });

  // Spiny lateral margins.
  for (const s of [1, -1])
    for (const z of [0.03, -0.02, -0.07]) {
      const edge = shellTop.nearest([s * 0.15, 0.1, z]);
      b.spike(edge, edge, 0.03, 0.007, { color: DEEP });
    }

  // Eight walking legs, four a side: hip on the shell, knee held high, ankle down, pointed tip on the floor.
  const legs: Array<Record<"hip" | "knee" | "ankle" | "tip", Vec>> = [
    { hip: [0.12, 0.085, 0.07], knee: [0.2, 0.1, 0.1], ankle: [0.25, 0.03, 0.13], tip: [0.285, 0, 0.18] },
    { hip: [0.125, 0.085, 0.02], knee: [0.21, 0.1, 0.03], ankle: [0.27, 0.03, 0.03], tip: [0.3, 0, 0.04] },
    { hip: [0.125, 0.085, -0.03], knee: [0.21, 0.1, -0.06], ankle: [0.265, 0.03, -0.085], tip: [0.295, 0, -0.12] },
    { hip: [0.12, 0.085, -0.08], knee: [0.19, 0.1, -0.13], ankle: [0.23, 0.03, -0.16], tip: [0.265, 0, -0.21] },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legs.forEach((leg, i) => {
      const id = i + 1;
      const pts = [leg.hip, leg.knee, leg.ankle, leg.tip].map((p) => mirror(s, p));
      const chain = b.chain(`leg${side}${id}`, pts, {
        parent: "body",
        names: [`hip${side}${id}`, `knee${side}${id}`, `ankle${side}${id}`, `tip${side}${id}`],
        role: "leg",
      });
      b.sweep(chain, [0.013, 0.011, 0.008, 0.0035], {
        color: gradient(limb, TIP, pts[2], pts[3]),
        name: `leg${side}${id}`,
        caps: { start: "round", end: "point" },
      });
    });
  }

  // Stalked eyes: a short stalk from the front of the shell, a dark eye with a cream glint.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stalk = b.chain(
      `stalk${side}`,
      [mirror(s, [0.04, 0.12, 0.12]), mirror(s, [0.05, 0.155, 0.14]), mirror(s, [0.055, 0.18, 0.16])],
      { parent: "body", names: [`stalkBase${side}`, `stalkTop${side}`, `eye${side}`] },
    );
    b.sweep(stalk, [0.0095, 0.0085, 0.0075], { color: STALK, name: `stalk${side}`, caps: "round" });
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(7)), EYE, {
      bone: `eye${side}`,
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0065, b.segments(6), b.segments(4)), CREAM, {
      at: stalk.tip!.local({ forward: 0.015, up: 0.007 }),
      bone: `eye${side}`,
      name: `glint${side}`,
    });
  }

  // Claws. Each is an arm chain, a palm lofted at the wrist, two fingers with dark tips, and little teeth.
  // Palm and finger offsets are in the wrist's frame and scale with `k`, so the small claw is the big one, smaller.
  const claw = (s: number, k: number, shoulder: Vec, elbow: Vec, wrist: Vec) => {
    const side = s > 0 ? "L" : "R";
    const [A, B, C] = [shoulder, elbow, wrist].map((p) => mirror(s, p));
    const arm = b.chain(`arm${side}`, [A, B, C], {
      parent: "body",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.022 * k, 0.019 * k, 0.016 * k], { color: shell, name: `arm${side}`, caps: "round" });

    const at = (d: Vec): Vec => [C[0] + s * k * d[0], C[1] + k * d[1], C[2] + k * d[2]];
    b.loft(
      [
        { at: at([0, 0.01, 0.01]), w: 0.06 * k, h: 0.05 * k },
        { at: at([0.005, 0.05, 0.055]), w: 0.11 * k, h: 0.085 * k },
        { at: at([0, 0.085, 0.095]), w: 0.075 * k, h: 0.065 * k },
      ],
      { color: shell, bone: `wrist${side}`, name: `palm${side}`, sides: 10 },
    );

    const fixed = b.chain(
      `dactyl${side}`,
      [at([0, 0.065, 0.075]), at([0.006, 0.1, 0.135]), at([0, 0.125, 0.185])],
      { parent: `wrist${side}`, names: [`dactylBase${side}`, `dactylMid${side}`, `dactylTip${side}`], role: "digit" },
    );
    const movable = b.chain(
      `pollex${side}`,
      [at([0, 0.03, 0.075]), at([0.006, 0.055, 0.135]), at([0, 0.085, 0.18])],
      { parent: `wrist${side}`, names: [`pollexBase${side}`, `pollexMid${side}`, `pollexTip${side}`], role: "digit" },
    );
    for (const finger of [fixed, movable]) {
      b.sweep(finger, [0.014 * k, 0.011 * k, 0.004 * k], {
        bands: [
          [0.7, shell],
          [1, TIP],
        ],
        name: finger.name,
        caps: { start: "round", end: "point" },
      });
    }

    // Teeth: the fixed finger's point down into the gap, the movable finger's point up.
    for (const t of [0.3, 0.55, 0.8]) {
      b.spike(fixed.at(t).local({ down: 0.004 * k }), [0, -1, 0.15], 0.012 * k, 0.0035 * k, { color: TIP });
      b.spike(movable.at(t).local({ up: 0.004 * k }), [0, 1, 0.15], 0.012 * k, 0.0035 * k, { color: TIP });
    }
  };
  // The oversized left claw, raised in challenge; the smaller right claw held forward and low.
  claw(1, 1, [0.1, 0.105, 0.11], [0.18, 0.16, 0.15], [0.2, 0.25, 0.18]);
  claw(-1, 0.6, [0.1, 0.095, 0.1], [0.15, 0.1, 0.16], [0.16, 0.11, 0.2]);

  // A tiny barnacle on the back of the shell, with a dark opening on top.
  const plate = shellTop.nearest([-0.07, 0.14, -0.1]);
  const seat = plate.moved([0, -0.001, 0]);
  b.lathe(
    [
      [0, 0],
      [0.012, 0],
      [0.013, 0.004],
      [0.009, 0.0092],
      [0.004, 0.0115],
      [0, 0.0115],
    ],
    { color: BARNACLE, at: seat, axis: plate, segments: 8, name: "barnacle" },
  );
  b.lathe(
    [
      [0, 0.0108],
      [0.0034, 0.0108],
      [0.0022, 0.0126],
      [0, 0.0126],
    ],
    { color: TIP, at: seat, axis: plate, segments: 8, name: "barnacleMouth" },
  );

  // A strand of seaweed rising from the back of the shell, with two fronds.
  const holdfast = shellTop.nearest([0.05, 0.14, -0.05]);
  const weed = catmull([
    holdfast,
    holdfast.local({ up: 0.02, back: 0.008 }),
    holdfast.local({ up: 0.045, left: 0.01, back: 0.02 }),
    holdfast.local({ up: 0.07, left: 0.004, back: 0.038 }),
    holdfast.local({ up: 0.082, right: 0.012, back: 0.06 }),
  ]);
  b.sweep(weed, [0.0045, 0.004, 0.0028], {
    color: WEED,
    bone: "body",
    name: "seaweed",
    caps: { start: "round", end: "point" },
  });
  const frond = [
    [0, 0, 0],
    [0.012, 0.004, 0],
    [0.03, 0.014, 0],
    [0.028, 0.03, 0],
    [0.012, 0.022, 0],
  ];
  for (const [t, side] of [
    [0.45, 1],
    [0.7, -1],
  ] as const) {
    const m = weed.at(t);
    b.slab(
      frond.map(([x, y, z]) => [m.x + side * x, m.y + y, m.z + z]),
      { color: WEED_LIGHT, thickness: 0.0015, bone: "body", name: "frond" },
    );
  }

  return b.root;
}
