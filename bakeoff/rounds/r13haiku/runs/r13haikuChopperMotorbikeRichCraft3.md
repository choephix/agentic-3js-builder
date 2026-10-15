```ts
import * as THREE from "three";
import { arc, catmull, createBuilder, paint, svg } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Overwatch Chopper",
  description:
    "A long, raked custom chopper in Overwatch white, orange and navy, with a cyan headlamp, cyan fender trim, orange exhaust ember and red tail light. About 2.9 m long.",
};

// ---------------------------------------------------------------------------------------------
// Palette: bold, clean colour blocks with a few glowing accents.

const WHITE = "#eef2f8";
const ORANGE = "#ff7a1a";
const NAVY = "#1d2847";
const ENGINE = "#2c3346";
const STEEL = "#4b5570";
const LEATHER = "#262b3d";
const TYRE = "#1b1d25";
const CYAN = "#48e6ff";
const RED = "#ff3d4e";
const DEG = Math.PI / 180;
const SQ = Math.SQRT1_2;

type P = [number, number, number];

// Key positions in metres, model space. +Z is forward, +X is the model's left.
const FRAME: P = [0, 0.6, 0];
const HEAD: P = [0, 0.98, 0.7];
const FRONT: P = [0, 0.325, 1.3]; // front axle: 0.325 is the tyre's outer radius, so the tyre touches y = 0
const REAR: P = [0, 0.33, -0.95]; // rear axle

/** A point `t` metres along a direction from a base point. */
const along = (base: P, dir: P, t: number): P => [base[0] + dir[0] * t, base[1] + dir[1] * t, base[2] + dir[2] * t];

/** A point on a wheel's circle, `r` from the axle, `deg` from straight up (positive is forward). */
const onWheel = (axle: P, r: number, deg: number): P => [
  0,
  axle[1] + r * Math.cos(deg * DEG),
  axle[2] + r * Math.sin(deg * DEG),
];

// ---------------------------------------------------------------------------------------------
// Paints. Stylised chrome bands, a tank with a navy spine and an orange side stripe, and an
// emblem drawn as an SVG decal.

const chrome = paint((_p, n) => (n.y > 0.35 ? "#f7faff" : n.y < -0.25 ? "#5a6480" : n.x > 0 ? "#b9c5d8" : "#97a4bc"));

const tankPaint = paint((p, n) => {
  if (n.y > 0.7 && Math.abs(p.x) < 0.045) return NAVY; // navy spine along the top
  if (Math.abs(n.x) > 0.5 && Math.abs(p.y - 0.935) < 0.016) return ORANGE; // orange side stripe
  return WHITE;
});

const seatPaint = paint((p) => (p.z < -0.6 ? ORANGE : LEATHER)); // orange rear edge on the seat

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#141c36"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="#ff7a1a" stroke-width="5"/>
    <path d="M20 38 L50 66 L80 38 L80 54 L50 82 L20 54Z" fill="#ff7a1a"/>
    <path d="M50 18 L58 32 L74 32 L61 42 L66 57 L50 48 L34 57 L39 42 L26 32 L42 32Z" fill="#48e6ff"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "chopper" });

  // Skeleton: a hardtail frame, a raked fork that steers, and the two wheels.
  const frame = b.joint("frame", { at: FRAME, dir: [0, 0, 1], role: "spine" });
  const steer = b.joint("steer", { parent: frame, at: HEAD, aim: FRONT, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: FRONT, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frame, at: REAR, dir: [1, 0, 0], role: "hinge" });

  const cNavy = cel(NAVY);
  const cWhite = cel(WHITE);
  const cOrange = cel(ORANGE);
  const cEngine = cel(ENGINE);
  const cSteel = cel(STEEL);
  const cTyre = cel(TYRE);
  const cGrip = cel(INK);

  // -------------------------------------------------------------------------------------------
  // Frame: backbone, downtube, lower rail, swingarm and seat stays, all navy.

  b.sweep(catmull([[0, 0.92, 0.66], [0, 0.93, 0.2], [0, 0.9, -0.25], [0, 0.84, -0.62]]), 0.034, {
    bone: frame,
    color: cNavy,
  });
  b.sweep(catmull([[0, 0.92, 0.66], [0, 0.7, 0.36], [0, 0.42, 0.02]]), 0.036, { bone: frame, color: cNavy });
  b.rod([0, 0.4, 0.02], [0, 0.44, -0.22], 0.03, cNavy, { bone: frame });
  for (const s of [1, -1]) {
    b.rod([s * 0.12, 0.42, -0.2], [s * 0.12, REAR[1], REAR[2]], 0.026, cNavy, { bone: frame });
    b.rod([s * 0.06, 0.84, -0.62], [s * 0.1, 0.36, -0.9], 0.02, cNavy, { bone: frame });
  }

  // -------------------------------------------------------------------------------------------
  // V-twin engine: a block, two finned cylinders splayed 45 degrees, chrome heads.

  b.part(new THREE.BoxGeometry(0.3, 0.24, 0.34), cEngine, { bone: frame, at: [0, 0.5, 0.02] });
  const pistons: [P, P][] = [
    [[0, 0.554, 0.054], [0, SQ, SQ]],
    [[0, 0.554, -0.054], [0, SQ, -SQ]],
  ];
  for (const [base, dir] of pistons) {
    b.part(new THREE.CylinderGeometry(0.09, 0.095, 0.3, 12), cEngine, { bone: frame, at: along(base, dir, 0.15), dir });
    for (let i = 1; i <= 3; i++)
      b.part(new THREE.CylinderGeometry(0.118, 0.118, 0.014, 14), cSteel, {
        bone: frame,
        at: along(base, dir, 0.05 + i * 0.07),
        dir,
      });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 12), chrome, { bone: frame, at: along(base, dir, 0.335), dir });
  }

  // -------------------------------------------------------------------------------------------
  // Tank: a loft through four stations, white with a navy spine and an orange side stripe.

  const tank = b.loft(
    [
      { at: [0, 0.9, 0.52], w: 0.14, h: 0.11 },
      { at: [0, 0.94, 0.3], w: 0.3, h: 0.18 },
      { at: [0, 0.94, 0.02], w: 0.32, h: 0.18 },
      { at: [0, 0.9, -0.2], w: 0.18, h: 0.14 },
    ],
    { bone: frame, color: cel(tankPaint) },
  );
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.03, 12), chrome, { bone: frame, at: [0, 1.03, 0.2] });

  // Emblem decals on both flanks and chrome bolts on the stripe line.
  const tankSkin = b.surface(tank);
  for (const s of [1, -1]) {
    b.decal(tankSkin, EMBLEM, { at: [s * 0.15, 0.93, 0.1], dir: [s, 0, 0], size: [0.11, 0.11] });
    for (const z of [0.36, -0.14]) {
      const hit = tankSkin.ray([s * 0.6, 0.9, z], [-s, 0, 0]);
      if (hit) b.stick(new THREE.SphereGeometry(0.009, 6, 4), chrome, hit, { embed: 0.4 });
    }
  }

  // -------------------------------------------------------------------------------------------
  // Seat and sissy bar.

  b.loft(
    [
      { at: [0, 0.9, -0.3], w: 0.2, h: 0.07 },
      { at: [0, 0.93, -0.5], w: 0.18, h: 0.06 },
      { at: [0, 0.97, -0.7], w: 0.12, h: 0.05 },
    ],
    { bone: frame, color: cel(seatPaint) },
  );
  b.sweep(catmull([[0, 0.84, -0.62], [0, 1.0, -0.8], [0, 1.2, -0.86]]), 0.018, {
    bone: frame,
    color: chrome,
  });
  b.rod([-0.08, 1.2, -0.86], [0.08, 1.2, -0.86], 0.016, chrome, { bone: frame });

  // -------------------------------------------------------------------------------------------
  // Steering: head tube, triple tree, raked fork, ape-hanger bars and a cyan headlamp.

  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), cSteel, { bone: steer, at: HEAD });
  b.part(new THREE.BoxGeometry(0.34, 0.035, 0.2), cSteel, { bone: steer, at: [0, 0.995, 0.7] });

  // Fork legs: orange shrouds on the top third, chrome below.
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.12, 0.98, 0.7],
        [s * 0.07, FRONT[1], FRONT[2]],
      ],
      0.026,
      { bone: steer, color: chrome, bands: [[0.35, cOrange], [1, chrome]] },
    );
  }

  // Ape hangers: a tall chrome bar with grips, held up by risers.
  const bars = catmull([
    [-0.4, 1.36, 0.42],
    [-0.27, 1.2, 0.6],
    [-0.12, 1.12, 0.68],
    [0, 1.1, 0.7],
    [0.12, 1.12, 0.68],
    [0.27, 1.2, 0.6],
    [0.4, 1.36, 0.42],
  ]);
  b.sweep(bars, 0.02, { bone: steer, color: chrome });
  for (const s of [1, -1]) {
    b.rod([s * 0.12, 0.995, 0.7], [s * 0.12, 1.12, 0.68], 0.02, cSteel, { bone: steer });
    b.rod([s * 0.2, 0.995, 0.7], [s * 0.2, 1.16, 0.64], 0.02, cSteel, { bone: steer });
    b.rod([s * 0.4, 1.36, 0.42], [s * 0.45, 1.39, 0.36], 0.03, cGrip, { bone: steer });
  }

  // Headlamp: a cyan lens on a bracket, ringed with chrome.
  b.rod([0, 0.99, 0.79], [0, 0.99, 0.84], 0.03, cSteel, { bone: steer });
  glow(b.part(new THREE.SphereGeometry(0.07, 12, 8), CYAN, { bone: steer, at: [0, 0.99, 0.9], scale: [1, 1, 0.8] }), 1.4);
  b.part(new THREE.TorusGeometry(0.075, 0.014, 6, 14), chrome, {
    bone: steer,
    at: [0, 0.99, 0.92],
    dir: [0, 0, 1],
    axis: "z",
  });

  // -------------------------------------------------------------------------------------------
  // Front wheel: an orange-rimmed spoked wheel with a chunky low-poly tyre.

  b.part(new THREE.TorusGeometry(0.28, 0.045, 6, 16), cTyre, { bone: wheelF, at: FRONT, dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.TorusGeometry(0.205, 0.012, 6, 16), cOrange, {
    bone: wheelF,
    at: FRONT,
    dir: [1, 0, 0],
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 12), chrome, { bone: wheelF, at: FRONT, dir: [1, 0, 0] });
  const hubRing = b.ring(wheelF, { count: 12, radius: 0.06 }).items;
  const rimRing = b.ring(wheelF, { count: 12, radius: 0.2 }).items;
  hubRing.forEach((h, i) => b.rod(h, rimRing[(i + 1) % rimRing.length], 0.008, chrome, { bone: wheelF }));

  // Front fender: a long white sheet over the tyre, with a cyan trim line on its top edge.
  const frontFender = arc(FRONT, onWheel(FRONT, 0.37, -25), [1, 0, 0], 110);
  b.sweep(frontFender, () => [0.07, 0.012], { bone: steer, color: cWhite });
  const fenderTrim = arc(FRONT, onWheel(FRONT, 0.384, -15), [1, 0, 0], 90);
  glow(b.sweep(fenderTrim, 0.008, { bone: steer, color: CYAN }), 1.5);

  // -------------------------------------------------------------------------------------------
  // Rear wheel: a fat block-tread tyre around an orange disc, with a sprocket on the drive side.

  b.part(new THREE.TorusGeometry(0.25, 0.08, 8, 16), cTyre, { bone: wheelR, at: REAR, dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 18), cOrange, { bone: wheelR, at: REAR, dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 12), chrome, { bone: wheelR, at: REAR, dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 14), chrome, {
    bone: wheelR,
    at: [-0.12, REAR[1], REAR[2]],
    dir: [1, 0, 0],
  });
  // Tread blocks stand off the tyre's outer skin, one per ring step, riding the wheel.
  const tread = b.ring(wheelR, { count: 16, radius: 0.305 }).items;
  for (const t of tread) b.stick(new THREE.BoxGeometry(0.16, 0.05, 0.05), cTyre, t, { embed: 0.2 });

  // Rear fender: orange, hugging the tyre from behind over the top.
  const rearFender = arc(REAR, onWheel(REAR, 0.36, -110), [1, 0, 0], 120);
  b.sweep(rearFender, () => [0.1, 0.012], { bone: frame, color: cOrange });
  glow(b.part(new THREE.BoxGeometry(0.07, 0.03, 0.02), RED, { bone: frame, at: onWheel(REAR, 0.38, -76) }), 1.3);

  // -------------------------------------------------------------------------------------------
  // Drivetrain and controls: swept exhaust with a glowing tip, foot pegs and forward controls.

  const pipe = catmull([
    [-0.2, 0.44, 0.26],
    [-0.2, 0.34, 0.02],
    [-0.2, 0.34, -0.4],
    [-0.2, 0.44, -0.6],
    [-0.2, 0.54, -0.66],
  ]);
  b.sweep(pipe, 0.03, { bone: frame, color: chrome, bands: [[0.9, chrome], [1, cGrip]] });
  glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), ORANGE, { bone: frame, at: [-0.2, 0.55, -0.68] }), 1.6);

  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.05), cSteel, { bone: frame, at: [s * 0.26, 0.36, 0.22] });
    b.rod([s * 0.15, 0.44, 0.1], [s * 0.26, 0.37, 0.22], 0.014, cSteel, { bone: frame });
  }

  return b.root;
}
```