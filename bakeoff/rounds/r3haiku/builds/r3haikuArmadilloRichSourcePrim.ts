import * as THREE from "three";
import { createBuilder, frame, rng, stripes, svg } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description: "A trotting nine-banded armadillo: banded pink-tan shell, pointed snout, tall ears, clawed feet and an armoured tapering tail.",
};

export default function build() {
  const b = createBuilder({ name: "nine-banded armadillo" });

  const shell = stripes("#c9a08c", "#9a7262", { size: 0.04, axis: "z", width: 0.42, wobble: 0.3, seed: 3 });
  const leg = "#8e6c60";
  const head = "#b48e7e";
  const snoutColor = "#a88172";
  const ear = "#a27a6b";
  const claw = "#efe6d4";

  // Skeleton: spine, neck and head.
  b.joint("pelvis", { at: [0, 0.2, -0.17], aim: [0, 0.2, -0.05] });
  b.joint("chest", { parent: "pelvis", at: [0, 0.21, 0.05], aim: [0, 0.21, 0.2] });
  b.joint("neck", { parent: "chest", at: [0, 0.22, 0.2], aim: [0, 0.23, 0.28] });
  b.joint("head", { parent: "neck", at: [0, 0.22, 0.28], aim: [0, 0.22, 0.4] });

  // Tail: a chain running back from the pelvis.
  const tail = b.chain(
    "tail",
    [
      [0, 0.2, -0.2],
      [0, 0.19, -0.34],
      [0, 0.17, -0.48],
      [0, 0.15, -0.6],
    ],
    { parent: "pelvis", role: "tail", names: ["tail1", "tail2", "tail3"] },
  );

  // Legs in a trot: front-left with hind-right forward, the others back.
  const legFL = b.chain(
    "legFL",
    [
      [0.08, 0.2, 0.14],
      [0.09, 0.11, 0.17],
      [0.09, 0.05, 0.13],
      [0.09, 0.0, 0.15],
    ],
    { parent: "chest", role: "leg", names: ["shoulderFL", "kneeFL", "ankleFL", "toeFL"] },
  );
  const legFR = b.chain(
    "legFR",
    [
      [-0.08, 0.2, 0.14],
      [-0.09, 0.11, 0.1],
      [-0.09, 0.05, 0.08],
      [-0.09, 0.0, 0.1],
    ],
    { parent: "chest", role: "leg", names: ["shoulderFR", "kneeFR", "ankleFR", "toeFR"] },
  );
  const legHL = b.chain(
    "legHL",
    [
      [0.08, 0.2, -0.14],
      [0.09, 0.12, -0.2],
      [0.09, 0.05, -0.2],
      [0.09, 0.0, -0.22],
    ],
    { parent: "pelvis", role: "leg", names: ["hipHL", "kneeHL", "ankleHL", "toeHL"] },
  );
  const legHR = b.chain(
    "legHR",
    [
      [-0.08, 0.2, -0.14],
      [-0.09, 0.12, -0.1],
      [-0.09, 0.05, -0.11],
      [-0.09, 0.0, -0.13],
    ],
    { parent: "pelvis", role: "leg", names: ["hipHR", "kneeHR", "ankleHR", "toeHR"] },
  );

  // Body: a banded loft skinned over the spine.
  b.loft(
    [
      { at: [0, 0.2, -0.14], w: 0.16, h: 0.13 },
      { at: [0, 0.2, -0.02], w: 0.2, h: 0.15 },
      { at: [0, 0.2, 0.1], w: 0.19, h: 0.14 },
      { at: [0, 0.21, 0.19], w: 0.13, h: 0.11 },
    ],
    { color: shell, bone: ["pelvis", "chest", "neck"], name: "body" },
  );

  // Tapering armoured tail, ending in a point.
  b.sweep(tail, [0.028, 0.004], { color: shell, caps: { start: "round", end: "point" }, name: "tail" });

  // Legs.
  b.sweep(legFL, [0.022, 0.013], { color: leg, name: "legFL" });
  b.sweep(legFR, [0.022, 0.013], { color: leg, name: "legFR" });
  b.sweep(legHL, [0.024, 0.014], { color: leg, name: "legHL" });
  b.sweep(legHR, [0.024, 0.014], { color: leg, name: "legHR" });

  // Clawed feet: three small claws each.
  const clawGeo = new THREE.ConeGeometry(0.005, 0.02, 4);
  const feet: Array<[string, number, number]> = [
    ["toeFL", 0.09, 0.15],
    ["toeFR", -0.09, 0.1],
    ["toeHL", 0.09, -0.22],
    ["toeHR", -0.09, -0.13],
  ];
  for (const [bone, x, z] of feet)
    for (const dx of [-0.007, 0, 0.007])
      b.part(clawGeo, claw, { bone, at: [x + dx, 0.008, z + 0.008], dir: [0, -0.4, 1] });

  // Head: a box skull, a pointed snout, a dark nose.
  b.part(new THREE.BoxGeometry(0.1, 0.085, 0.1), head, { bone: "head", at: [0, 0.225, 0.3] });
  b.part(new THREE.ConeGeometry(0.03, 0.1, 6), snoutColor, {
    bone: "head",
    at: [0, 0.215, 0.37],
    dir: [0, -0.2, 1],
  });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), "#2a201c", { bone: "head", at: [0, 0.205, 0.43] });

  // Tall leathery ears, extruded flat and standing up from the top of the head.
  const earOutline: Array<[number, number]> = [
    [-0.02, 0],
    [0.02, 0],
    [0.028, 0.07],
    [0.01, 0.11],
    [-0.02, 0.08],
  ];
  b.extrude(earOutline, {
    color: ear,
    bone: "head",
    at: [0.035, 0.25, 0.27],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    bevel: 0.002,
    name: "earL",
  });
  b.extrude(earOutline, {
    color: ear,
    bone: "head",
    at: [-0.035, 0.25, 0.27],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    bevel: 0.002,
    name: "earR",
  });

  // Small beady eyes.
  const eyeGeo = new THREE.SphereGeometry(0.008, 6, 4);
  b.part(eyeGeo, "#1c1613", { bone: "head", at: [0.045, 0.24, 0.35] });
  b.part(eyeGeo, "#1c1613", { bone: "head", at: [-0.045, 0.24, 0.35] });

  // Sprinkled coarse pale hairs between the bands, on the back and sides.
  const hairTexture = svg(
    `<svg viewBox="0 0 8 32" xmlns="http://www.w3.org/2000/svg">
       <path d="M4 32 Q3 16 5 1" stroke="#efe4d0" stroke-width="2.4" fill="none" stroke-linecap="round"/>
     </svg>`,
  );
  const random = rng(11);
  const hairFrames = [];
  for (let i = 0; i < 26; i++) {
    const z = -0.13 + 0.3 * random();
    const x = (random() * 2 - 1) * 0.06;
    hairFrames.push(frame([x, 0.265, z], [0, 1, 0]));
  }
  b.cards(hairFrames, hairTexture, {
    size: [0.006, 0.04],
    lean: 25,
    flow: [0, 0.3, -1],
    vary: 0.3,
    spin: 30,
    rng: rng(7),
    sink: 0.2,
    name: "hairs",
  });

  return b.root;
}
