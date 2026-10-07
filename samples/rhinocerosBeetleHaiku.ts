import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { limb } from "../src/ik";

export const meta = {
  name: "Hercules rhinoceros beetle",
  description:
    "A male Hercules rhinoceros beetle at real size (about 0.2 m with horns): faceted low-poly carapace, a forked thoracic horn, a long cephalic horn with a ventral tooth, lamellate antennae, faceted compound eyes, six jointed legs with claws and spurs, and roofed elytra with striae, puncture pits and a pale shoulder patch.",
  style: "low-poly",
  commit: "b816db2",
};

const HEAD_PLATE = "#3d3024";
const PRONOTUM = "#342d21";
const PIT = "#17110b";
const ELYTRA = "#8a7747";
const ELYTRA_PATCH = "#b3a064";
const STRIA = "#4a3c22";
const SUTURE = "#1f180f";
const ABDOMEN = "#4a3b25";
const STERNITE = "#8c7a4f";
const TAIL_PLATE = "#a08a55";
const HORN = "#2b2018";
const HORN_TIP = "#17110c";
const LEG = "#2c2318";
const KNEE = "#4b3b25";
const CLAW = "#7a6544";
const MANDIBLE = "#3f2c19";
const EYE = "#0f0b08";
const ANT = "#6b4f2c";
const ANT_CLUB = "#5e4a2a";

// Elytron: an outline on the plane spanned by its outward direction X (drooping
// toward the edge, so the wing cases form a roof) and its back direction Y (tilting
// down toward the tip). Outline x runs outward from the midline, outline y runs back.
const ELYTRON: OutlinePoint[] = [
  [0, 0.004],
  [0.011, 0.006],
  [0.021, -0.012],
  [0.023, -0.04],
  [0.019, -0.062],
  [0.009, -0.075],
  [0, -0.078, "sharp"],
];
const ELY_ROOF = -0.4;
const ELY_TILT = 0.12;
const ELY_XN = Math.hypot(1, ELY_ROOF);
const ELY_YN = Math.hypot(ELY_TILT, 1);
const ELY_Y0 = 0.05;
const ELY_Z0 = -0.004;
// Point on side s's elytron, at outline (x, yo), lifted `lift` off its mid-plane.
const elyPoint = (s: number, x: number, yo: number, lift: number): number[] => [
  s * (0.0015 + x / ELY_XN),
  ELY_Y0 + (x * ELY_ROOF) / ELY_XN + (yo * ELY_TILT) / ELY_YN + lift,
  ELY_Z0 + yo / ELY_YN,
];

export default function build() {
  const b = createBuilder({ name: "rhinocerosBeetle" });

  // ---- Skeleton -----------------------------------------------------------
  const thorax = b.joint("thorax", { at: [0, 0.03, -0.012], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.031, 0.056], dir: [0, -0.12, 1], role: "head" });
  const tail = b.chain("tail", catmull([[0, 0.028, -0.012], [0, 0.026, -0.05], [0, 0.021, -0.078]]), {
    parent: thorax,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });
  const elytraL = b.joint("elytraL", { parent: thorax, at: [0.0015, ELY_Y0, ELY_Z0], dir: [0, 0, 1], role: "hinge" });
  const elytraR = b.joint("elytraR", { parent: thorax, at: [-0.0015, ELY_Y0, ELY_Z0], dir: [0, 0, 1], role: "hinge" });
  const jawL = b.joint("jawL", { parent: head, at: [0.004, 0.023, 0.066], dir: [0, 0, 1], role: "jaw" });
  const jawR = b.joint("jawR", { parent: head, at: [-0.004, 0.023, 0.066], dir: [0, 0, 1], role: "jaw" });

  // ---- Body: head and thorax (pronotum) ----------------------------------
  const pronotum = b.loft(
    [
      { at: [0, 0.024, 0.07], w: 0.016, h: 0.018 },
      { at: [0, 0.027, 0.055], w: 0.022, h: 0.024 },
      { at: [0, 0.034, 0.03], w: 0.032, h: 0.034 },
      { at: [0, 0.035, 0.008], w: 0.036, h: 0.036 },
      { at: [0, 0.033, -0.012], w: 0.036, h: 0.034 },
      { at: [0, 0.03, -0.026], w: 0.04, h: 0.034 },
    ],
    { bone: [head, thorax], color: PRONOTUM, sides: 8, smooth: false },
  );

  // Abdomen under the elytra
  b.loft(
    [
      { at: [0, 0.03, -0.026], w: 0.04, h: 0.034 },
      { at: [0, 0.027, -0.05], w: 0.042, h: 0.034 },
      { at: [0, 0.022, -0.074], w: 0.03, h: 0.024 },
      { at: [0, 0.017, -0.086], w: 0.012, h: 0.012 },
    ],
    { bone: tail, color: ABDOMEN, sides: 8, smooth: false },
  );

  // Pale sternite bands across the underside of the abdomen
  for (const z of [-0.03, -0.05, -0.068]) {
    b.sweep(
      catmull([
        [-0.016, 0.0125, z],
        [0, 0.0095, z],
        [0.016, 0.0125, z],
      ]),
      [0.0013, 0.0011],
      { bone: tail, color: STERNITE, sides: 4, smooth: false },
    );
  }

  // Puncture pits scattered over the dorsal pronotum
  for (const hit of b.surface(pronotum).scatter(36, { rng: rng(7), minDist: 0.0045, filter: (h) => h.n.y > 0.2 })) {
    b.stick(new THREE.IcosahedronGeometry(0.0014, 0), PIT, hit, { embed: 0.5, flat: true });
  }

  // Clypeus plate on the head front
  b.extrude(
    [
      [-0.007, -0.006],
      [0.007, -0.006],
      [0.008, 0.006],
      [0, 0.009],
      [-0.008, 0.006],
    ],
    { at: [0, 0.023, 0.07], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.004, bevel: 0.0012, color: HEAD_PLATE, bone: head },
  );

  // Pronotal side tubercles
  for (const s of [1, -1]) {
    b.spike([s * 0.0175, 0.033, 0.018], [s * 0.7, 0.4, 0.2], 0.007, 0.0026, { color: PRONOTUM });
    b.spike([s * 0.0175, 0.031, -0.002], [s * 0.7, 0.3, -0.2], 0.006, 0.0022, { color: PRONOTUM });
  }

  // Pygidium plate at the tip of the abdomen
  b.extrude(
    [
      [-0.006, -0.006],
      [0.006, -0.006],
      [0.007, 0.004],
      [0, 0.008],
      [-0.007, 0.004],
    ],
    { at: [0, 0.02, -0.088], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.002, color: TAIL_PLATE, bone: tail.joints[2] },
  );

  // ---- Horns -------------------------------------------------------------
  // Cephalic horn: long, rising at the tip, with a ventral tooth.
  const hornH = b.chain(
    "hornHead",
    catmull([
      [0, 0.035, 0.062],
      [0, 0.041, 0.082],
      [0, 0.046, 0.097],
      [0, 0.047, 0.107],
    ]),
    { parent: head, names: ["hornH1", "hornH2", "hornH3"], role: "hinge" },
  );
  b.sweep(hornH, [0.0068, 0.0014], { color: HORN, sides: 6, smooth: false, caps: { start: "round", end: "point" } });
  b.spike(hornH.at(0.42).at, [0, -0.6, 0.8], 0.011, 0.0028, { color: HORN_TIP, bone: hornH.joints[1] });

  // Thoracic horn: rises from the pronotum and forks at the tip.
  const hornT = b.chain(
    "hornThorax",
    catmull([
      [0, 0.041, 0.012],
      [0, 0.05, 0.03],
      [0, 0.057, 0.048],
      [0, 0.061, 0.062],
    ]),
    { parent: thorax, names: ["hornT1", "hornT2", "hornT3"], role: "hinge" },
  );
  b.sweep(hornT, [0.0075, 0.0028], { color: HORN, sides: 6, smooth: false, caps: { start: "round", end: "point" } });
  for (const s of [1, -1]) {
    b.spike(hornT.at(1).at, [s * 0.35, 0.5, 0.8], 0.012, 0.0024, { color: HORN_TIP, bone: hornT.joints[2] });
  }

  // ---- Compound eyes, antennae and mandibles ----------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.IcosahedronGeometry(0.006, 0), EYE, {
      bone: head,
      at: [s * 0.0108, 0.034, 0.064],
      flat: true,
      name: `eye${side}`,
    });

    const ant = b.chain(
      `antenna${side}`,
      catmull([
        [s * 0.006, 0.034, 0.07],
        [s * 0.012, 0.038, 0.083],
        [s * 0.018, 0.039, 0.095],
      ]),
      { parent: head, names: [`ant${side}1`, `ant${side}2`, `ant${side}3`], role: "tentacle" },
    );
    b.sweep(ant, [0.0014, 0.0009], { color: ANT, sides: 4, smooth: false });
    const tip = ant.joints[2];
    const lamella: OutlinePoint[] = [
      [0, -0.003],
      [0.0025, -0.001],
      [0.003, 0.003],
      [0, 0.007],
      [-0.003, 0.003],
      [-0.0025, -0.001],
    ];
    for (const x of [
      [s, 0, 0],
      [0, 1, 0],
      [s * 0.7, 0.7, 0],
    ]) {
      b.extrude(lamella, { at: tip, x, y: [0, 0, 1], thickness: 0.0011, color: ANT_CLUB, bone: tip });
    }

    // Mandible on the head front
    b.sweep(
      catmull([
        [s * 0.005, 0.023, 0.066],
        [s * 0.008, 0.022, 0.078],
        [s * 0.007, 0.023, 0.088],
        [s * 0.003, 0.025, 0.094],
      ]),
      [0.0032, 0.0012],
      { bone: s > 0 ? jawL : jawR, color: MANDIBLE, sides: 5, smooth: false, caps: { start: "round", end: "point" } },
    );
  }

  // ---- Elytra ----------------------------------------------------------------
  for (const s of [1, -1]) {
    const j = s > 0 ? elytraL : elytraR;
    const side = s > 0 ? "L" : "R";
    const elytron = b.extrude(ELYTRON, {
      at: j,
      x: [s, ELY_ROOF, 0],
      y: [0, ELY_TILT, 1],
      thickness: [0.003, 0.005],
      bevel: 0.0012,
      color: ELYTRA,
      bone: j,
      name: `elytron${side}`,
    });
    // Pale patch on the shoulder of each wing case
    b.extrude(
      [
        [0.004, -0.01],
        [0.013, -0.013],
        [0.015, -0.034],
        [0.009, -0.05],
        [0.004, -0.036],
      ],
      {
        at: elyPoint(s, 0, 0, 0.0034),
        x: [s, ELY_ROOF, 0],
        y: [0, ELY_TILT, 1],
        thickness: 0.0012,
        color: ELYTRA_PATCH,
        bone: j,
      },
    );
    // Dark rim along the outer edge of the wing case
    b.sweep(
      catmull([
        elyPoint(s, 0.011, 0.006, 0.0005),
        elyPoint(s, 0.021, -0.012, 0.0005),
        elyPoint(s, 0.023, -0.04, 0.0005),
        elyPoint(s, 0.019, -0.062, 0.0005),
        elyPoint(s, 0.009, -0.075, 0.0005),
      ]),
      0.0009,
      { bone: j, color: SUTURE, sides: 4, smooth: false },
    );
    // Longitudinal striae, riding just above the wing case
    const ribs: [number, number][][] = [
      [
        [0.006, -0.005],
        [0.009, -0.04],
        [0.006, -0.07],
      ],
      [
        [0.013, -0.01],
        [0.017, -0.04],
        [0.012, -0.062],
      ],
    ];
    for (const rib of ribs) {
      b.sweep(
        catmull(rib.map(([x, yo]) => elyPoint(s, x, yo, 0.0022))),
        [0.0016, 0.0009],
        { bone: j, color: STRIA, sides: 4, smooth: false, caps: { start: "round", end: "round" } },
      );
    }
    // Puncture pits over the wing case
    for (const hit of b.surface(elytron).scatter(22, { rng: rng(11 + s), minDist: 0.0045 })) {
      b.stick(new THREE.IcosahedronGeometry(0.0012, 0), PIT, hit, { embed: 0.5, flat: true });
    }
  }
  // Dark suture along the midline where the wing cases meet
  b.sweep(
    catmull([elyPoint(1, 0, 0.002, 0.0022), elyPoint(1, 0, -0.04, 0.0022), elyPoint(1, 0, -0.076, 0.0022)]),
    [0.0013, 0.0008],
    { bone: elytraL, color: SUTURE, sides: 4, smooth: false },
  );

  // ---- Legs: three pairs, IK planted on the floor ---------------------------
  const legSpecs = [
    { id: "F", hip: [0.013, 0.02, 0.034], foot: [0.046, 0.0058, 0.058] },
    { id: "M", hip: [0.015, 0.018, 0.0], foot: [0.054, 0.0058, 0.0] },
    { id: "H", hip: [0.015, 0.018, -0.036], foot: [0.05, 0.0058, -0.05] },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const spec of legSpecs) {
      const id = `${spec.id}${side}`;
      const hip = [s * spec.hip[0], spec.hip[1], spec.hip[2]];
      const foot = [s * spec.foot[0], spec.foot[1], spec.foot[2]];
      const pts = limb(hip, foot, [0.02, 0.022, 0.018], [
        [0, 1, 0],
        [0, 1, 0],
      ]);
      const leg = b.chain(`leg${id}`, pts, {
        parent: thorax,
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
        role: "leg",
      });
      b.sweep(leg, [0.0065, 0.005, 0.0032, 0.002], { color: LEG, sides: 6, smooth: false });
      b.part(new THREE.IcosahedronGeometry(0.0048, 0), KNEE, { bone: leg.joints[1], at: leg.joints[1], flat: true });
      // Tibial spur on the ankle, pointing back
      b.spike(leg.joints[2], [0, 0.3, -1], 0.005, 0.0013, { color: CLAW });
      // Two tarsal claws
      const footJoint = leg.joints[3];
      b.spike(footJoint, [0, -1, 0.35], 0.006, 0.0013, { color: CLAW });
      b.spike(footJoint, [0, -1, -0.35], 0.006, 0.0013, { color: CLAW });
    }
  }

  return b.root;
}
