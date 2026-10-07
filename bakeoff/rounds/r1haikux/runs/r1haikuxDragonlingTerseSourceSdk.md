```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  gradient,
  interpolate,
  scales,
} from "agentic-3js-builder";
import type { Sweep } from "agentic-3js-builder";

export const meta = {
  name: "Baby dragon",
  description: "A stubby green baby dragon with a big head, coral wings and a spade-tipped tail, in a rest pose.",
};

const CORAL = "#e8674f";
const CREAM = "#f5e8c2";
const GOLD = "#f5c242";
const INK = "#16110d";
const DARK = "#183424";
const BONE = "#b84b3d";

// Wing membrane outline, metres from the shoulder: u runs out along the wing, v up. Points 1-3 are the elbow, wrist
// and first finger tip on the leading edge; 4-7 scallop between the finger tips; the rest runs back to the hip.
const WING: number[][] = [
  [0, 0],
  [0.1, 0.13],
  [0.25, 0.12],
  [0.44, 0.03],
  [0.38, -0.033],
  [0.38, -0.11],
  [0.3, -0.13],
  [0.24, -0.21],
  [0.12, -0.19],
  [0.03, -0.11],
];

// Tail spade, metres from the tail tip: +x forward, +y up, trailing behind.
const SPADE: number[][] = [
  [0, 0],
  [-0.02, 0.025],
  [-0.05, 0.035],
  [-0.08, 0],
  [-0.05, -0.035],
  [-0.02, -0.025],
];

const BODY_T = [0, 0.2, 0.5, 0.8, 1];
const BODY_RX = [0.07, 0.1, 0.118, 0.115, 0.095];
const BODY_RY = [0.075, 0.105, 0.122, 0.118, 0.1];

// Wings sweep back 20 degrees from the shoulders, so they read from the side as well as the front.
const SWEEP = 0.35;
const COS = Math.cos(SWEEP);
const SIN = Math.sin(SWEEP);

export default function babyDragon() {
  const b = createBuilder({ name: "baby-dragon", detail: 1, paintSize: 1024 });

  // Paint: green scales over the top, a cream belly; countershade picks between them by the way a surface faces.
  const scalePaint = scales(["#55b774", "#3f9e5f", "#68c47f"], "#1f5a37", { size: 0.034, width: 0.16, seed: 4 });
  const hide = countershade(scalePaint, "#f3e4a6", { level: -0.12, soft: 0.3 });

  // Body: a pelvis root and a spine of three spans to the chest, swept into one tube.
  b.joint("pelvis", { at: [0, 0.22, -0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.22, -0.1],
      [0, 0.235, -0.02],
      [0, 0.25, 0.06],
      [0, 0.265, 0.14],
    ]),
    { parent: "pelvis", up: [0, 1, 0], role: "spine", names: ["spine1", "spine2", "spine3", "chest"] },
  );
  const body = b.sweep(
    spine,
    (t): [number, number] => [interpolate(BODY_T, BODY_RX, t), interpolate(BODY_T, BODY_RY, t)],
    { name: "body", sides: 12, color: hide },
  );

  // Neck: three spans up to a head joint at its tip.
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 0.265, 0.14],
      [0, 0.305, 0.205],
      [0, 0.343, 0.267],
      [0, 0.375, 0.32],
    ]),
    { parent: "chest", up: [0, 1, 0], role: "neck", names: ["neck1", "neck2", "neck3", "head"] },
  );
  const neck = b.sweep(neckChain, [0.07, 0.056, 0.05, 0.054], { name: "neck", sides: 10, color: hide });

  // Head space: x across (+x is the creature's right), y forward along the snout, z up the skull.
  const head = neckChain.tip!;
  const hd = (x: number, y: number, z: number) => head.local([x, y, z]);
  const headUp = head.dir([0, 0, 1]);

  // Skull: a rounded loft from the back of the head to a blunt snout.
  const skull = b.loft(
    [
      { at: hd(0, -0.03, 0.02), w: 0.13, h: 0.13 },
      { at: hd(0, 0.03, 0.04), w: 0.17, h: 0.16 },
      { at: hd(0, 0.11, 0.03), w: 0.15, h: 0.13 },
      { at: hd(0, 0.18, 0), w: 0.1, h: 0.09 },
      { at: hd(0, 0.23, -0.005), w: 0.07, h: 0.065 },
    ],
    { name: "skull", bone: head, sides: 12, color: hide },
  );

  // Lower jaw on its own hinge at the back of the head, so the mouth can open.
  const jaw = b.joint("jaw", {
    parent: "head",
    at: hd(0, -0.01, -0.045),
    dir: head.dir([0, 1, 0]),
    up: headUp,
    role: "jaw",
  });
  b.loft(
    [
      { at: hd(0, -0.03, -0.055), w: 0.1, h: 0.06 },
      { at: hd(0, 0.07, -0.07), w: 0.1, h: 0.045 },
      { at: hd(0, 0.16, -0.065), w: 0.08, h: 0.04 },
      { at: hd(0, 0.22, -0.05), w: 0.05, h: 0.035 },
    ],
    { name: "jaw", bone: jaw, sides: 10, color: hide },
  );

  // Horns: curved tubes rising off the back of the skull and sweeping back.
  for (const sx of [-1, 1]) {
    b.sweep(
      bezier(
        hd(sx * 0.06, 0, 0.07),
        hd(sx * 0.075, -0.02, 0.14),
        hd(sx * 0.09, -0.05, 0.16),
        hd(sx * 0.095, -0.075, 0.15),
      ),
      [0.022, 0.015, 0.008, 0.003],
      { name: "horn", sides: 8, color: CREAM, bone: head, caps: { start: "round", end: "point" } },
    );
  }

  // Face: eyes, nostrils and the mouth line, each seated on the built skull.
  const face = b.surface(skull);
  for (const sx of [-1, 1]) {
    const hit = face.nearest(hd(sx * 0.07, 0.11, 0.03));
    const eye = hit.at.addScaledVector(hit.n, 0.008);
    const pupil = eye.clone().addScaledVector(hit.n, 0.024);
    const shine = pupil.clone().addScaledVector(hit.n, 0.008).addScaledVector(headUp, 0.006);
    b.part(new THREE.SphereGeometry(0.027, b.segments(12), b.segments(8)), GOLD, {
      at: eye,
      frame: hit,
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.012, b.segments(8), b.segments(6)), INK, {
      at: pupil,
      frame: hit,
      name: "pupil",
    });
    b.part(new THREE.SphereGeometry(0.0045, b.segments(6), b.segments(4)), "#ffffff", {
      at: shine,
      frame: hit,
      name: "shine",
    });

    const nostril = face.nearest(hd(sx * 0.02, 0.215, 0.035));
    b.part(new THREE.SphereGeometry(0.0065, b.segments(6), b.segments(4)), DARK, {
      at: nostril.at.addScaledVector(nostril.n, 0.001),
      frame: nostril,
      name: "nostril",
    });

    const mouth = face.drape(
      catmull([
        hd(sx * 0.04, 0.215, -0.02),
        hd(sx * 0.06, 0.17, -0.03),
        hd(sx * 0.072, 0.1, -0.03),
        hd(sx * 0.074, 0.03, -0.02),
      ]),
      { lift: 0.002 },
    );
    b.sweep(mouth, 0.0035, { name: "mouth", sides: 6, color: DARK, bone: head });
  }

  // Stuck spikes, pointing up off the built surface.
  const spikeOn = (on: Sweep, t: number, height: number, radius: number) => {
    b.stick(new THREE.ConeGeometry(radius, height, b.segments(6)), CORAL, on.at(t), {
      name: "spike",
      embed: 0.25,
    });
  };
  const dorsal: Array<[number, number]> = [
    [0.18, 0.03],
    [0.32, 0.04],
    [0.46, 0.045],
    [0.6, 0.045],
    [0.74, 0.04],
    [0.87, 0.032],
  ];
  for (const [t, h] of dorsal) spikeOn(body, t, h, 0.016);
  spikeOn(neck, 0.35, 0.026, 0.011);
  spikeOn(neck, 0.65, 0.022, 0.01);

  // Tail: a tapering tube of four spans plus a tip, ending in a spade.
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.22, -0.1],
      [0, 0.205, -0.19],
      [0, 0.19, -0.28],
      [0, 0.185, -0.36],
      [0, 0.2, -0.43],
      [0, 0.23, -0.48],
    ]),
    {
      parent: "pelvis",
      up: [0, 1, 0],
      role: "tail",
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailtip"],
    },
  );
  const tail = b.sweep(tailChain, [0.068, 0.05, 0.033, 0.02, 0.012], { name: "tail", sides: 8, color: hide });
  b.extrude(SPADE, {
    name: "spade",
    color: CORAL,
    at: [0, 0.23, -0.48],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.012,
    bone: "tailtip",
  });
  const tailDorsal: Array<[number, number]> = [
    [0.12, 0.03],
    [0.3, 0.028],
    [0.5, 0.023],
    [0.7, 0.017],
  ];
  for (const [t, h] of tailDorsal) spikeOn(tail, t, h, 0.011);

  // Legs and wings, mirrored for each side.
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    // Hind leg: digitigrade, knee forward, hock back, three claws.
    const hind = b.chain(
      `hind${side}`,
      catmull([
        [s * 0.085, 0.2, -0.04],
        [s * 0.12, 0.1, 0],
        [s * 0.11, 0.035, -0.05],
        [s * 0.1, 0.02, 0.05],
      ]),
      {
        parent: "pelvis",
        up: [0, 1, 0],
        role: "leg",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      },
    );
    b.sweep(hind, [0.058, 0.036, 0.026, 0.022], { name: `hindLeg${side}`, sides: 8, color: hide });
    for (const dx of [-0.011, 0, 0.011]) {
      b.spike([s * (0.1 + dx * 0.4), 0.02, 0.06], [s * (0.1 + dx * 1.6), 0, 0.1], null, 0.008, {
        name: "claw",
        color: CREAM,
        bone: `toe${side}`,
      });
    }

    // Fore leg: shoulder to elbow (pointing back) to wrist, three claws.
    const fore = b.chain(
      `fore${side}`,
      catmull([
        [s * 0.08, 0.24, 0.1],
        [s * 0.1, 0.12, 0.06],
        [s * 0.095, 0.03, 0.12],
        [s * 0.095, 0.015, 0.17],
      ]),
      {
        parent: "spine3",
        up: [0, 1, 0],
        role: "arm",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      },
    );
    b.sweep(fore, [0.04, 0.026, 0.02, 0.019], { name: `foreLeg${side}`, sides: 8, color: hide });
    for (const dx of [-0.01, 0, 0.01]) {
      b.spike([s * (0.095 + dx * 0.4), 0.015, 0.19], [s * (0.095 + dx * 1.6), 0, 0.22], null, 0.007, {
        name: "claw",
        color: CREAM,