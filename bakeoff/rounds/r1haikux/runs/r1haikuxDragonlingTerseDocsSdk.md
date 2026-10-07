```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  limb,
  offset,
  paint,
  polyline,
  spots,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Baby dragon",
  description: "A chubby green baby dragon: spotted coat, cream belly, pink wings, gold horns, a spade tail and a tiny flame.",
};

// Palette
const GREEN = "#6fc46a";
const MOSS = "#2e8056";
const BELLY = "#fbe9b2";
const HORN = "#f5c451";
const IVORY = "#fff8e6";
const WING = "#f48ba0";
const STRUT = "#6e2f56";
const INK = "#22162b";

// Painted eye and cheek blush, drawn as decals on the head.
const EYE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#fffdf4"/>
  <circle cx="32" cy="33" r="22" fill="#ffb13b"/>
  <circle cx="32" cy="33" r="22" fill="none" stroke="#5a2a10" stroke-width="2.5"/>
  <ellipse cx="32" cy="33" rx="5.5" ry="16" fill="#150b10"/>
  <circle cx="24" cy="22" r="6" fill="#ffffff"/>
  <circle cx="39" cy="42" r="2.6" fill="#ffffff"/>
  <circle cx="32" cy="32" r="30" fill="none" stroke="#22162b" stroke-width="2.5"/>
</svg>`;

const BLUSH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <ellipse cx="16" cy="16" rx="14" ry="10" fill="#ff6f91" fill-opacity="0.85"/>
</svg>`;

// Spade tail tip, drawn in the tail's sagittal plane (u along the tail, v across it).
const SPADE: OutlinePoint[] = [
  [-0.02, -0.02],
  [0.05, -0.07],
  [0.13, 0, "sharp"],
  [0.05, 0.07],
  [-0.02, 0.02],
];

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });

  // Paints
  const coat = countershade(spots(GREEN, MOSS, { size: 0.09, amount: 0.4, rosette: true, seed: 7 }), BELLY, {
    level: -0.2,
  });
  const tailCoat = paint((_p, _n, s) => (s[0] > 0.8 ? BELLY : coat));
  const fire = paint((_p, _n, s) => (s[0] > 0.075 ? "#ffe066" : "#ff7a2b"));

  // ---- Spine: hips (root) -> chest -----------------------------------------
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, -0.14],
      [0, 0.38, 0.0],
      [0, 0.4, 0.14],
      [0, 0.42, 0.24],
    ]),
    { names: ["hips", "spine1", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];

  const body = b.sweep(
    spine,
    (t): [number, number] => [0.1 + 0.04 * Math.sin(Math.PI * t), 0.12 + 0.03 * Math.sin(Math.PI * t)],
    { color: coat },
  );
  const bodySurf = b.surface(body);

  // ---- Neck ---------------------------------------------------------------
  const neck = b.chain("neck", catmull([[0, 0.42, 0.2], [0, 0.52, 0.28], [0, 0.6, 0.36]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.sweep(neck, (t): [number, number] => [0.074 - 0.012 * t, 0.08 - 0.012 * t], { color: coat });

  // ---- Head and jaws ------------------------------------------------------
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.66, 0.4],
    aim: [0, 0.62, 0.62],
    role: "head",
  });
  const headSweep = b.sweep(
    catmull([
      [0, 0.7, 0.36],
      [0, 0.72, 0.44],
      [0, 0.7, 0.52],
      [0, 0.66, 0.6],
    ]),
    (t): [number, number] => [0.1 - 0.035 * t, 0.095 - 0.035 * t],
    { bone: head, color: coat },
  );
  const headSurf = b.surface(headSweep);

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.615, 0.4],
    aim: [0, 0.575, 0.6],
    role: "jaw",
  });
  b.sweep(
    catmull([
      [0, 0.615, 0.4],
      [0, 0.585, 0.5],
      [0, 0.565, 0.6],
    ]),
    (t): [number, number] => [0.045 - 0.015 * t, 0.026 - 0.006 * t],
    { bone: jaw, color: BELLY },
  );
  for (const s of [1, -1]) {
    b.spike([s * 0.035, 0.575, 0.5], [s * 0.035, 0.612, 0.5], null, 0.008, { color: IVORY, bone: jaw });
  }

  // Swept-back horns
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [s * 0.05, 0.79, 0.42],
        [s * 0.075, 0.87, 0.4],
        [s * 0.095, 0.9, 0.36],
        [s * 0.11, 0.93, 0.31],
      ),
      [0.024, 0.005],
      { bone: head, color: HORN, caps: { start: "round", end: "point" } },
    );
  }

  // Eyes and cheek blush, drawn on the skull
  const eyeTex = svg(EYE, { size: 128 });
  const blushTex = svg(BLUSH, { size: 64 });
  for (const s of [1, -1]) {
    b.decal(headSweep, eyeTex, {
      at: headSurf.nearest([s * 0.07, 0.74, 0.47]),
      dir: [s * 0.25, 0.1, 1],
      size: [0.075, 0.075],
      mirror: s < 0,
    });
    b.decal(headSweep, blushTex, {
      at: headSurf.nearest([s * 0.075, 0.67, 0.52]),
      dir: [s * 0.5, 0, 1],
      size: [0.045, 0.03],
      mirror: s < 0,
    });
  }

  // Nostrils
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.009, 8, 6), INK, headSurf.nearest([s * 0.03, 0.66, 0.64]), {
      embed: 0.3,
      flat: true,
    });
  }

  // A little flame puffing from the open mouth
  b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.046, 0.04],
      [0.032, 0.09],
      [0, 0.15],
    ],
    { at: [0, 0.575, 0.6], axis: [0, 0, 1], segments: 7, smoothing: 1, color: fire, bone: head },
  );

  // ---- Dorsal spines along the back ----------------------------------------
  b.along(
    spine,
    5,
    (at) => {
      const hit = bodySurf.nearest(offset(at.at, [0, 1, 0], 0.2));
      b.spike(hit, hit, 0.045, 0.014, { color: HORN });
    },
    { from: 0.2, to: 0.8 },
  );

  // ---- Feet: paw plus three toes with little claws ------------------------
  const foot = (ankle: typeof hips, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(0.05, 10, 6).scale(1.1, 0.5, 1.35), BELLY, {
      bone: ankle,
      at: [x, 0.025, z],
      flat: true,
    });
    for (const k of [-1, 0, 1]) {
      b.capsule([x + k * 0.022, 0.013, z + 0.045], [x + k * 0.03, 0.013, z + 0.085], 0.013, {
        color: BELLY,
        bone: ankle,
      });
      b.spike([x + k * 0.03, 0.013, z + 0.085], [x + k * 0.034, 0.005, z + 0.1], null, 0.008, {
        color: HORN,
        bone: ankle,
      });
    }
  };

  // ---- Legs ---------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front legs: elbows back, feet planted under the chest
    const fore = b.chain(
      `legF${side}`,
      limb([s * 0.09, 0.34, 0.14], [s * 0.11, 0.025, 0.2], [0.18, 0.17], [0, 0, -1]),
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(fore, (t) => 0.058 - 0.026 * t, { color: coat });
    foot(fore.joints[2], s * 0.11, 0.2);

    // Hind legs: knees forward, feet under the hips
    const hind = b.chain(
      `legH${side}`,
      limb([s * 0.09, 0.34, -0.14], [s * 0.11, 0.025, -0.06], [0.2, 0.17], [0, 0, 1]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(hind, (t) => 0.07 - 0.04 * t, { color: coat });
    foot(hind.joints[2], s * 0.11, -0.06);
  }

  // ---- Wings: arm, finger struts and pink membranes -----------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPt: [number, number, number] = [s * 0.08, 0.5, 0.06];
    const elbowPt: [number, number, number] = [s * 0.24, 0.58, 0.05];
    const wristPt: [number, number, number] = [s * 0.46, 0.7, 0.05];

    const arm = b.chain(`wingArm${side}`, polyline([shoulderPt, elbowPt, wristPt]), {
      parent: chest,
      names: [`wingBase${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
    });
    const wrist = arm.joints[2];
    b.sweep(arm, [0.022, 0.012], { color: STRUT });

    const tips: [number, number, number][] = [
      [s * 0.62, 0.82, 0.05],
      [s * 0.68, 0.5, 0.05],
      [s * 0.54, 0.26, 0.05],
    ];
    const fingers = tips.map((tip, i) =>
      b.chain(`finger${i + 1}${side}`, polyline([wristPt, tip]), {
        parent: wrist,
        names: [`finger${i + 1}${side}`, `finger${i + 1}${side}Tip`],
        role: "digit",
      }),
    );
    for (const f of fingers) b.sweep(f, [0.012, 0.006], { color: STRUT });

    b.membrane([wristPt, elbowPt, shoulderPt], fingers[0], { thickness: 0.012, color: WING });
    b.membrane(fingers[0], fingers[1], { thickness: 0.012, color: WING, scallop: 0.14 });
    b.membrane(fingers[1], fingers[2], { thickness: 0.012, color: WING, scallop: 0.14 });
    b.membrane(fingers[2], [wristPt, [s * 0.11, 0.42, -0.04], [s * 0.1, 0.34, -0.12]], {
      thickness: 0.012,
      color: WING,
      scallop: 0.1,
    });
  }

  // ---- Tail: curled up behind, ending in a spade --------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.36, -0.14],
      [0, 0.33, -0.3],
      [0, 0.34, -0.44],
      [0, 0.42, -0.54],
      [0, 0.54, -0.56],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );
  const tailSweep = b.sweep(tail, (t) => 0.08 - 0.055 * t, { color: tailCoat });

  b.extrude(SPADE, {
    at: [0, 0.5, -0.56],
    x: [0, 1, 0],
    y: [0, 0, 1],
    thickness: 0.026,
    bevel: 0.006,
    color: WING,
    bone: tail.joints[4],
  });

  const tailSurf = b.surface(tailSweep);
  b.along(
    tail,
    4,
    (at) => {
      const hit = tailSurf.nearest(offset(at.at, [0, 1, 0], 0.1));
      b.spike(hit, hit, 0.03, 0.009, { color: HORN });
    },
    { from: 0.1, to: 0.7 },
  );

  // Rest pose: the jaw hangs slightly open so the flame has somewhere to come out.
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
```