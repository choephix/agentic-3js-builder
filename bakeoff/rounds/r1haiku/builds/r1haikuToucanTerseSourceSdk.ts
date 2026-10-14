import * as THREE from "three";
import { createBuilder, mottle, paint } from "../../../../src/index";

export const meta = {
  name: "Toco toucan",
  description: "A toco toucan perched in rest pose: black plumage with a white bib, a large orange bill with a black tip, blue eye rings and grey zygodactyl feet.",
};

const FEATHER = mottle("#15161b", "#2b2e37", { size: 0.05, seed: 4 });
const WHITE = "#f3efe6";
const RED = "#d93a1c";
const BLUE = "#2f7fd8";
const LEG = "#5b636d";
const EYE = "#0b0b0d";

// Bill: orange base, yellow middle, black tip (in model space, the bill runs out along +Z).
const bill = paint((p) => (p.z > 0.33 ? "#121316" : p.z > 0.24 ? "#f7c02a" : "#ef8d17"));

export default function toucan() {
  const b = createBuilder({ name: "toucan", detail: 1, paintSize: 1024 });

  // Skeleton: spine, head, bill, legs and tail, in rest pose.
  const hips = b.joint("hips", { at: [0, 0.24, -0.02], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.31, 0.05] });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.37, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.43, 0.13], role: "head" });
  const upperBill = b.joint("upperBill", { parent: head, at: [0, 0.45, 0.17] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.42, 0.17], role: "jaw" });
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 0.2, -0.14] });
  const tail2 = b.joint("tail2", { parent: tail1, at: [0, 0.15, -0.28] });

  // Body and head: one continuous blend-skinned body from the rump to the bill base.
  const body = b.loft(
    [
      { at: [0, 0.23, -0.1], w: 0.1, h: 0.11 },
      { at: [0, 0.25, 0.0], w: 0.14, h: 0.16 },
      { at: [0, 0.3, 0.06], w: 0.13, h: 0.15 },
      { at: [0, 0.37, 0.1], w: 0.08, h: 0.09 },
      { at: [0, 0.41, 0.12], w: 0.11, h: 0.11 },
      { at: [0, 0.44, 0.14], w: 0.13, h: 0.125 },
      { at: [0, 0.45, 0.19], w: 0.1, h: 0.1 },
      { at: [0, 0.44, 0.23], w: 0.05, h: 0.06 },
    ],
    {
      name: "body",
      color: FEATHER,
      bone: [hips, chest, neck, head],
      sides: 12,
      // White bib across the throat and breast.
      sectors: [[120, 240, WHITE, 0.4, 0.8]],
    },
  );

  // Bill: a deep upper mandible and a lower mandible, each on its own joint.
  b.sweep(
    [
      [0, 0.455, 0.16],
      [0, 0.462, 0.27],
      [0, 0.446, 0.38],
    ],
    (t) => [0.035 - 0.024 * t, 0.045 - 0.034 * t],
    { name: "upperBill", color: bill, bone: upperBill, sides: 10 },
  );
  b.sweep(
    [
      [0, 0.418, 0.16],
      [0, 0.418, 0.27],
      [0, 0.41, 0.36],
    ],
    (t) => [0.03 - 0.02 * t, 0.03 - 0.022 * t],
    { name: "lowerBill", color: bill, bone: jaw, sides: 10 },
  );

  // Eyes: a blue skin ring and a dark pupil seated on the head's real surface.
  const skin = b.surface(body);
  for (const s of [1, -1]) {
    const hit = skin.nearest([s * 0.062, 0.455, 0.15]);
    const ring = new THREE.TorusGeometry(0.0125, 0.0045, 8, 14);
    ring.rotateX(Math.PI / 2);
    b.stick(ring, BLUE, hit, { embed: 0.35, name: s > 0 ? "eyeRingL" : "eyeRingR" });
    b.stick(new THREE.SphereGeometry(0.0085, 8, 6), EYE, hit, {
      embed: 0.5,
      name: s > 0 ? "pupilL" : "pupilR",
    });
  }

  // Wings: flat folded feathered shapes lying along each flank, on the chest.
  const wing: [number, number][] = [
    [0.1, 0.06],
    [-0.02, 0.075],
    [-0.14, 0.03],
    [-0.21, -0.02],
    [-0.17, -0.05],
    [-0.1, -0.075],
    [-0.02, -0.065],
    [0.06, -0.05],
    [0.1, -0.02],
  ];
  for (const s of [1, -1]) {
    b.extrude(wing, {
      name: s > 0 ? "wingL" : "wingR",
      color: FEATHER,
      at: [s * 0.075, 0.3, -0.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      bone: chest,
    });
  }

  // Tail: a flat box-section tube with a red undertail.
  b.sweep([hips, tail1, tail2, [0, 0.11, -0.36]], (t) => [0.028 + 0.022 * t, 0.011], {
    name: "tail",
    section: "box",
    color: FEATHER,
    bone: [hips, tail1, tail2],
    sectors: [[125, 235, RED]],
  });

  // Legs: a jointed leg per side, with three toes on the ground.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      [
        [s * 0.05, 0.22, 0],
        [s * 0.055, 0.13, 0.035],
        [s * 0.055, 0.045, 0],
      ],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, 0.011, { name: `leg${S}`, color: LEG });
    const ankle = leg.tip!;
    b.capsule(ankle, [s * 0.052, 0.009, 0.075], 0.0085, { name: `toeFront${S}`, color: LEG });
    b.capsule(ankle, [s * 0.068, 0.009, 0.065], 0.0085, { name: `toeOuter${S}`, color: LEG });
    b.capsule(ankle, [s * 0.055, 0.009, -0.05], 0.0085, { name: `toeBack${S}`, color: LEG });
  }

  return b.root;
}
