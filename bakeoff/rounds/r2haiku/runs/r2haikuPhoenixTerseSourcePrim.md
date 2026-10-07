```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, frame, gradient, svg } from "agentic-3js-builder";

export const meta = {
  name: "Phoenix",
  description: "A stylised phoenix: upright, half-open wings of feather cards, a crest of flames and a long trailing tail.",
};

// Feather textures: drawn as SVG, so the colour and the shape come from the drawing.
const FEATHER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120">
<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffd34a"/><stop offset="0.45" stop-color="#ff7a1a"/><stop offset="1" stop-color="#b3140f"/>
</linearGradient></defs>
<path d="M20 2 C36 30 37 82 20 118 C3 82 4 30 20 2 Z" fill="url(#f)"/>
<path d="M20 10 L20 108" stroke="#fff0a8" stroke-width="2" fill="none" stroke-opacity="0.7"/>
</svg>`,
  { size: 256 },
);

const TAIL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 120">
<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffe27a"/><stop offset="0.6" stop-color="#ff5a14"/><stop offset="1" stop-color="#8f0c12"/>
</linearGradient></defs>
<path d="M15 0 C27 24 28 84 15 120 C2 84 3 24 15 0 Z" fill="url(#t)"/>
<ellipse cx="15" cy="26" rx="7" ry="9" fill="#1f5fd1"/>
<ellipse cx="15" cy="26" rx="3" ry="4" fill="#0a1a40"/>
</svg>`,
  { size: 256 },
);

const lerp3 = (a: number[], b: number[], u: number) => a.map((x, i) => x + (b[i] - x) * u);

export default function phoenix() {
  const b = createBuilder({ name: "phoenix", detail: 1, paintSize: 2048 });

  // Paints
  const body = countershade("#c8200f", "#ffb62e", { level: -0.1, soft: 0.6 });
  const headPaint = gradient("#ffd24a", "#ff8a1c", [0, 1.9, 0.42], [0, 1.7, 0.5]);
  const wingPaint = gradient("#b3140f", "#ffb020", [0.3, 1.42, -0.05], [1.4, 1.25, -0.35]);
  const tailPaint = gradient("#ff5a10", "#ffd34a", [0, 0.95, -0.1], [0, 0.42, -1.2]);
  const BEAK = "#ffb52e";
  const LEG = "#f2a92a";
  const TALON = "#3a2a1e";
  const EYE = "#fff3a0";
  const PUPIL = "#2a0a05";

  // Spine and head
  const hips = b.joint("hips", { at: [0, 0.95, -0.02], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.22, 0.1], dir: [0, 1, 0.25], role: "spine" });

  const neck = b.chain("neck", catmull([[0, 1.26, 0.14], [0, 1.5, 0.25], [0, 1.72, 0.36]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.sweep(neck, { radius: (t) => 0.06 - 0.018 * t, color: headPaint, name: "neck" });

  const head = b.joint("head", { parent: "neck2", at: [0, 1.78, 0.42], dir: [0, 0.45, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.745, 0.47], dir: [0, -0.1, 1], role: "jaw" });

  b.part(new THREE.SphereGeometry(0.11, 24, 16), headPaint, {
    bone: head,
    at: [0, 1.8, 0.42],
    scale: [0.95, 1, 1.12],
    name: "skull",
  });
  b.part(new THREE.ConeGeometry(0.05, 0.17, 10), BEAK, { bone: head, at: [0, 1.8, 0.6], aim: [0, 1.78, 0.82], name: "beakUpper" });
  b.part(new THREE.ConeGeometry(0.038, 0.13, 10), BEAK, { bone: jaw, at: [0, 1.745, 0.58], aim: [0, 1.735, 0.7], name: "beakLower" });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 10, 8), EYE, { bone: head, at: [s * 0.075, 1.83, 0.5], name: "eye" });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), PUPIL, { bone: head, at: [s * 0.078, 1.83, 0.526], name: "pupil" });
  }

  // Crest: three flame plumes standing up and back from the crown, seen edge-on.
  b.cards(
    [
      frame([-0.035, 1.87, 0.36], [0, 1, -0.7]),
      frame([0, 1.9, 0.34], [0, 1, -0.45]),
      frame([0.035, 1.87, 0.36], [0, 1, -0.7]),
    ],
    FEATHER,
    { size: [0.07, 0.24], lean: 0, flow: [1, 0, 0], cross: true, vary: 0.2, bone: head, name: "crest" },
  );

  // Body: a tapered torso from hips to chest, red back and gold belly.
  b.sweep(catmull([[0, 0.92, -0.06], [0, 1.06, 0.02], [0, 1.22, 0.1]]), {
    radius: (t) => [0.12 + 0.05 * Math.sin(Math.PI * t), 0.11 + 0.035 * Math.sin(Math.PI * t)],
    color: body,
    bone: [hips, chest],
    name: "torso",
  });

  // Tail: a chain trailing down and back, with a flame of long feathers.
  const tail = b.chain("tail", catmull([[0, 0.98, -0.12], [0, 0.82, -0.42], [0, 0.6, -0.82], [0, 0.42, -1.22]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });
  b.sweep(tail, { radius: (t) => 0.035 - 0.02 * t, color: tailPaint, name: "tailShaft" });
  b.cards([0.25, 0.5, 0.75].map((u) => tail.at(u)), TAIL, {
    size: [0.12, 0.6],
    lean: 0,
    flow: [0, 1, 0],
    cross: true,
    vary: 0.2,
    name: "tailFeather",
  });

  // Wings: a shoulder-elbow-wrist arm, capsule bones, and layered feather cards.
  const wing = (s: 1 | -1) => {
    const S = s > 0 ? "L" : "R";
    const shoulderAt = [s * 0.13, 1.36, 0.02];
    const elbowAt = [s * 0.52, 1.5, -0.08];
    const wristAt = [s * 1.02, 1.38, -0.22];
    const tipAt = [s * 1.45, 1.16, -0.44];

    const shoulder = b.joint(`shoulder${S}`, { parent: chest, at: shoulderAt, dir: [s * 0.8, 0.25, -0.1], role: "wing" });
    const elbow = b.joint(`elbow${S}`, { parent: shoulder, at: elbowAt, dir: [s * 0.9, 0.05, -0.2], role: "wing" });
    const wrist = b.joint(`wrist${S}`, { parent: elbow, at: wristAt, dir: [s * 0.8, -0.2, -0.3], role: "wing" });

    b.capsule(shoulder, elbow, [0.045, 0.03], { color: wingPaint, name: `humerus${S}` });
    b.capsule(elbow, wrist, [0.03, 0.022], { color: wingPaint, name: `ulna${S}` });
    b.capsule(wrist, tipAt, [0.022, 0.004], { color: wingPaint, name: `hand${S}` });

    // Primary feathers: flat cards lying along the hand, sweeping out and back.
    const primaries = [0, 1, 2, 3, 4, 5].map((k) => {
      const u = 0.15 + 0.17 * k;
      return frame(lerp3(wristAt, tipAt, u).map((x, i) => (i === 1 ? x + 0.01 : x)), [0, 1, 0]);
    });
    b.cards(primaries, FEATHER, {
      size: [0.1, 0.4],
      lean: 90,
      flow: (_f, i) => [s * 0.9, 0, -0.35 - 0.05 * i],
      bone: wrist,
      vary: 0.15,
      name: `primary${S}`,
    });

    // Coverts: a shorter layer over the arm.
    const coverts = [0.15, 0.4, 0.65, 0.9].map((u) =>
      frame(lerp3(shoulderAt, wristAt, u).map((x, i) => (i === 1 ? x + 0.03 : x)), [0, 1, 0]),
    );
    b.cards(coverts, FEATHER, {
      size: [0.13, 0.28],
      lean: 90,
      flow: [s * 0.7, 0, -0.2],
      bone: elbow,
      vary: 0.2,
      name: `covert${S}`,
    });
  };
  wing(1);
  wing(-1);

  // Legs: digitigrade chains with a tip at the ankle, three forward toes and talons.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipX = s * 0.1;
    const leg = b.chain(
      `leg${S}`,
      [
        [hipX, 0.92, 0.02],
        [s * 0.11, 0.46, 0.1],
        [hipX, 0.12, -0.04],
      ],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, { radius: [0.036, 0.022], color: LEG, name: `leg${S}` });

    const ankle = leg.joints[2];
    for (const [k, dx] of [-0.035, 0, 0.035].entries()) {
      const toe: number[] = [hipX + dx, 0.015, 0.16];
      b.capsule(ankle, toe, 0.014, { color: LEG, name: `toe${S}${k}` });
      b.part(new THREE.ConeGeometry(0.011, 0.055, 6), TALON, {
        at: [toe[0], 0.035, toe[2] + 0.015],
        aim: [toe[0], 0.0, toe[2] + 0.08],
        name: "talon",
      });
    }
  }

  // A few embers drifting off the tail flame.
  const embers: Array<[number, number, number]> = [
    [0.05, 0.62, -0.7],
    [-0.06, 0.5, -0.95],
    [0.08, 0.36, -1.1],
    [-0.04, 0.7, -0.5],
  ];
  embers.forEach(([x, y, z], i) =>
    b.part(new THREE.SphereGeometry(0.016 + 0.004 * (i % 2), 8, 6), "#ffb020", {
      bone: hips,
      at: [x, y, z],
      name: "ember",
    }),
  );

  return b.root;
}
```