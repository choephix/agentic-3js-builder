```ts
import * as THREE from "three";
import type { OutlinePoint } from "agentic-3js-builder";
import { catmull, countershade, createBuilder, paint, polyline, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "pufferfish",
  description: "A puffed pufferfish: olive spotted back, cream belly, a field of backward-raked spines, bulging eyes, a dark beak and rayed fins.",
};

const OLIVE = "#8f9a3f";
const SPOT = "#3d3122";
const BELLY = "#f1e6bf";
const SPINE = "#fbf3d8";
const FIN = "#dcc66f";
const RAY = "#8b7431";
const EYE = "#fdfcf4";
const PUPIL = "#16120b";
const BEAK = "#4b4128";
const JAW = "#efe3b5";
const NOSTRIL = "#2a2418";

// Olive back with dark spots, cream underside.
const coat = countershade(spots(OLIVE, SPOT, { size: 0.05, amount: 0.3, seed: 4 }), BELLY, { level: 0 });

// Fin fabric: pale yellow with darker rays fanning from each fin's base.
const finPaint = paint((_p, _n, s) => (Math.abs(Math.sin(Math.atan2(s[1], s[0] + 0.03) * 9)) > 0.85 ? RAY : FIN));

export default function build() {
  const b = createBuilder({ name: "pufferfish" });

  // Body centre height. The belly sits at Y - 0.1, a few mm into the floor.
  const Y = 0.096;

  // Skeleton: a root at the body centre, a tail chain running back, a head chain running forward.
  const core = b.joint("core", { at: [0, Y, 0], dir: [0, 0, 1], role: "spine" });
  const tail = b.chain("tail", polyline([[0, Y, 0], [0, Y, -0.05], [0, Y, -0.1]]), {
    parent: core,
    names: ["tailA", "tailB", "tailTip"],
    role: "tail",
  });
  const head = b.chain("head", polyline([[0, Y, 0], [0, Y, 0.05], [0, Y, 0.09]]), {
    parent: core,
    names: ["headA", "headB"],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, Y - 0.012, 0.09],
    aim: [0, Y - 0.016, 0.16],
    role: "jaw",
  });

  // The puffed body: one smooth tube over tail, core and head.
  // Radius keys run evenly from the tail peduncle to the blunt front dome.
  const body = b.sweep(
    polyline([
      [0, Y, -0.1],
      [0, Y, 0.09],
    ]),
    [0.03, 0.055, 0.082, 0.096, 0.1, 0.1, 0.098, 0.088, 0.065],
    { bone: [tail, core, head], color: coat, sides: 12, name: "body" },
  );

  // Upper beak, fused to the head. Dark, pinched, like a parrotfish's.
  b.sweep(
    catmull([
      [0, Y + 0.012, 0.1],
      [0, Y + 0.004, 0.14],
      [0, Y - 0.002, 0.17],
    ]),
    [0.02, 0.009],
    { bone: head, color: BEAK, name: "beakUpper" },
  );

  // Lower jaw on its own joint, pale teeth showing under the beak.
  b.sweep(
    catmull([
      [0, Y - 0.012, 0.095],
      [0, Y - 0.018, 0.135],
      [0, Y - 0.02, 0.16],
    ]),
    [0.017, 0.008],
    { bone: jaw, color: JAW, name: "jawLower" },
  );

  // Bulging eyes on the upper sides, looking out and forward.
  const skin = b.surface(body);
  const eyes = [1, -1].map((s) => skin.nearest([s * 0.08, Y + 0.015, 0.07]));
  for (const eye of eyes) {
    b.stick(new THREE.SphereGeometry(0.026, 12, 8), EYE, eye, { embed: 0.3, name: "eyeWhite" });
    b.stick(new THREE.SphereGeometry(0.014, 10, 6), PUPIL, eye.moved([0, 0.022, 0]), {
      embed: 0.2,
      name: "pupil",
    });
  }

  // Nostrils: two small dark dots on the front dome.
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.0055, 6, 4), NOSTRIL, skin.nearest([s * 0.03, Y + 0.05, 0.15]), {
      embed: 0.45,
      name: "nostril",
    });
  }

  // The defining feature: a field of spines on the upper body, raked backward.
  const spines = skin.scatter(240, {
    rng: rng(7),
    minDist: 0.021,
    filter: (h) =>
      h.axis.y > -0.15 &&
      h.at.z > -0.09 &&
      h.at.z < 0.09 &&
      eyes.every((e) => h.at.distanceTo(e.at) > 0.06),
  });
  spines.forEach((h, i) => {
    const dir = h.axis.clone().add(new THREE.Vector3(0, -0.12, -0.7)).normalize();
    const len = 0.024 + 0.008 * (((i * 7) % 4) / 3);
    b.spike(h, dir, len, 0.0055, { color: SPINE });
  });

  // Pectoral fins: small fans flared out from the upper sides.
  const pectoral: OutlinePoint[] = [
    [0.02, 0.012],
    [0, 0.042],
    [-0.04, 0.05],
    [-0.078, 0.018],
    [-0.062, -0.03],
    [-0.02, -0.036],
  ];
  for (const s of [1, -1]) {
    b.extrude(pectoral, {
      at: [s * 0.088, Y - 0.005, 0.035],
      x: [0, 0, 1],
      y: [s * 0.35, 1, 0],
      thickness: [0.006, 0.002],
      bevel: 0.002,
      smoothing: 1,
      color: finPaint,
      bone: core,
      name: s > 0 ? "pectoralL" : "pectoralR",
    });
  }

  // Dorsal fin: a small rounded sail set toward the back of the top.
  const dorsal: OutlinePoint[] = [
    [0.04, -0.04],
    [0.015, 0.04],
    [-0.025, 0.06],
    [-0.06, 0.035],
    [-0.07, -0.04],
  ];
  b.extrude(dorsal, {
    at: [0, Y + 0.1, -0.005],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.002,
    smoothing: 1,
    color: finPaint,
    bone: core,
    name: "dorsal",
  });

  // Caudal fin: a rounded fan on the tail tip, opening backward.
  const caudal: OutlinePoint[] = [
    [0, 0.025],
    [0.022, 0.052],
    [0.055, 0.07],
    [0.082, 0.056],
    [0.09, 0],
    [0.082, -0.056],
    [0.055, -0.07],
    [0.022, -0.052],
    [0, -0.025],
  ];
  b.extrude(caudal, {
    at: [0, Y, -0.1],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.008,
    bevel: 0.003,
    smoothing: 1,
    color: finPaint,
    bone: tail,
    name: "caudal",
  });

  return b.root;
}
```