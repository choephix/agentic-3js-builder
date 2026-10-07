```ts
import * as THREE from "three";
import { bezier, catmull, createBuilder, noise, paint, rng } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Emperor penguin and chick",
  description: "A proud emperor penguin standing over a fluffy grey chick tucked between its feet.",
};

// Palette
const BLUE = "#111d36"; // glossy blue-black back, head and flippers
const WHITE = "#f6f5f0"; // crisp belly
const GOLD = "#f2b02e"; // ear and neck patch
const STRIPE = "#f2805f"; // orange-pink beak stripe
const BILL = "#1c1b21";
const FOOT = "#0e0d11";
const CREAM = "#efe9dc";
const EYE = "#0b0a0c";
const CHICK = "#b4bbc3";
const FLUFF_A = "#c9cfd6";
const FLUFF_B = "#9ba3ad";
const FLUFF_C = "#7e8792";
const CHICK_BEAK = "#2d2d33";

// Body: white front, blue-black back, gold collar at the neck.
const coat = paint((p, n) => {
  const wob = noise(p, 0.06, 3) - 0.5;
  if (n.y < -0.6) return WHITE;
  if (p.y + 0.06 * wob > 0.9 && n.z > -0.35) return GOLD;
  if (n.z + 0.3 * wob > 0.02) return WHITE;
  return BLUE;
});

// Head: blue-black, with a gold ear patch on each side and a gold throat.
const headCoat = paint((_p, n) => {
  const ear = Math.abs(n.x) > 0.5 && n.z > -0.6 && n.z < 0.12 && n.y > -0.5 && n.y < 0.25;
  const throat = n.y < -0.45 && n.z > -0.3 && n.z < 0.5;
  return ear || throat ? GOLD : BLUE;
});

// Bill: black with an orange-pink stripe down each side.
const billCoat = paint((_p, n) => (Math.abs(n.x) > 0.45 ? STRIPE : BILL));

// Webbed foot outline, metres from the ankle: x across, y forward.
const toes: OutlinePoint[] = [
  [-0.055, -0.06],
  [0.055, -0.06],
  [0.066, 0.02],
  [0.07, 0.11],
  [0.06, 0.2],
  [0.05, 0.225, "sharp"],
  [0.02, 0.16],
  [0.0, 0.245, "sharp"],
  [-0.02, 0.16],
  [-0.05, 0.225, "sharp"],
  [-0.06, 0.2],
  [-0.07, 0.11],
  [-0.066, 0.02],
];

// Flipper outline, metres from the shoulder: x forward, y along the flipper (down is negative).
const flipper: OutlinePoint[] = [
  [-0.035, 0.02],
  [0.045, 0.02],
  [0.05, -0.08],
  [0.035, -0.18],
  [-0.02, -0.28, "sharp"],
  [-0.03, -0.2],
  [-0.04, -0.08],
];

export default function build() {
  const b = createBuilder({ name: "emperor-penguin", detail: 1.5 });

  // Spine: station centres give the body centreline; w is width (x), h is depth (z).
  const stations = [
    { at: [0, 0.2, 0], w: 0.12, h: 0.12 }, // vent, rounded under the belly
    { at: [0, 0.42, 0], w: 0.32, h: 0.28 },
    { at: [0, 0.66, 0.02], w: 0.38, h: 0.32 }, // broad chest
    { at: [0, 0.86, 0.05], w: 0.34, h: 0.28 },
    { at: [0, 0.96, 0.08], w: 0.22, h: 0.2 }, // neck
    { at: [0, 1.02, 0.1], w: 0.18, h: 0.16 }, // top of the neck, under the head
  ];
  const spine = b.chain("spine", catmull(stations.map((s) => s.at)), {
    names: ["hips", "belly", "chest", "shoulder", "neck", "head"],
    role: "spine",
  });
  const hips = spine.joints[0];
  const shoulder = spine.joints[3];
  const head = spine.joints[5];

  b.loft(stations, { bone: spine, color: coat, name: "body" });

  // Head: a slightly squashed ball on the crown joint.
  const HEAD = [0, 1.085, 0.115];
  const skull = b.part(new THREE.SphereGeometry(1, 20, 14).scale(0.095, 0.105, 0.105), headCoat, {
    bone: head,
    at: HEAD,
    name: "head",
  });

  // Eyes: a cream ring with a dark pupil, seated on the head front.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = b.surface(skull).nearest([s * 0.075, 1.11, 0.185]);
    b.stick(new THREE.SphereGeometry(0.02, 10, 8), CREAM, hit, { embed: 0.5, name: `eyeRing${side}` });
    b.stick(new THREE.SphereGeometry(0.011, 8, 6), EYE, hit.moved([0, 0.014, 0]), {
      embed: 0.5,
      name: `eye${side}`,
    });
  }

  // Bill: the upper mandible rides the head, the lower one hinges at the jaw joint.
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.07, 0.17],
    aim: [0, 1.04, 0.36],
    role: "jaw",
  });
  b.sweep(
    bezier([0, 1.087, 0.165], [0, 1.083, 0.26], [0, 1.06, 0.335], [0, 1.04, 0.37]),
    (t) => [0.018 - 0.011 * t, 0.017 - 0.009 * t],
    { bone: head, color: billCoat, caps: { start: "round", end: "point" }, name: "billUpper" },
  );
  b.sweep(
    bezier([0, 1.07, 0.165], [0, 1.06, 0.26], [0, 1.04, 0.335], [0, 1.03, 0.355]),
    (t) => [0.016 - 0.01 * t, 0.012 - 0.006 * t],
    { bone: jaw, color: billCoat, caps: { start: "round", end: "point" }, name: "billLower" },
  );

  // Legs and webbed feet, with small claws on the toe tips.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      catmull([
        [s * 0.1, 0.26, 0],
        [s * 0.135, 0.13, 0.04],
        [s * 0.17, 0.02, 0.03],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `foot${L}`], role: "leg" },
    );
    const ankle = leg.joints[2];
    b.sweep(leg, [0.03, 0.016], { color: FOOT, name: `leg${L}` });
    b.extrude(toes, {
      at: [s * 0.17, 0.015, 0.03],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.03,
      bevel: 0.006,
      color: FOOT,
      bone: ankle,
      name: `foot${L}`,
    });
    for (const [u, v] of [
      [0, 0.245],
      [0.05, 0.225],
      [-0.05, 0.225],
    ]) {
      b.spike([s * (0.17 + u), 0.015, 0.03 + v], [0, -0.15, 1], 0.025, 0.007, {
        color: FOOT,
        bone: ankle,
      });
    }
  }

  // Stubby flippers, splayed slightly out from the shoulders.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${L}`,
      catmull([
        [s * 0.14, 0.92, 0.02],
        [s * 0.176, 0.77, 0],
        [s * 0.205, 0.645, -0.01],
      ]),
      { parent: shoulder, names: [`shoulder${L}`, `wrist${L}`, `tip${L}`], role: "wing" },
    );
    b.extrude(flipper, {
      at: [s * 0.14, 0.92, 0.02],
      x: [0, 0, 1],
      y: [s * 0.24, 0.97, 0],
      thickness: [0.012, 0.045],
      bevel: 0.006,
      color: BLUE,
      bone: wing.joints[0],
      name: `flipper${L}`,
    });
  }

  // Chick: a fluffy grey ball tucked between the feet, its head peeking out front.
  const chick = b.joint("chick", { parent: hips, at: [0, 0.12, 0.17] });
  const chickBody = b.part(new THREE.SphereGeometry(1, 16, 12).scale(0.08, 0.12, 0.105), CHICK, {
    bone: chick,
    at: [0, 0.12, 0.17],
    name: "chickBody",
  });
  const chickHead = b.part(new THREE.SphereGeometry(1, 16, 12).scale(0.075, 0.085, 0.08), CHICK, {
    bone: chick,
    at: [0, 0.27, 0.2],
    name: "chickHead",
  });

  // Down: small grey puffs stuck over the chick, kept off the face and the floor.
  const fluff = b.surface([chickBody, chickHead]).scatter(96, {
    rng: rng(5),
    minDist: 0.026,
    filter: (h) => h.n.y > -0.2 && !(h.at.z > 0.22 && h.at.y > 0.22),
  });
  const pick = rng(21);
  for (const h of fluff) {
    const r = 0.018 + 0.012 * pick();
    const col = [FLUFF_A, FLUFF_B, FLUFF_C][Math.floor(pick() * 3)];
    b.stick(new THREE.SphereGeometry(r, 6, 4), col, h, { embed: 0.35 });
  }

  // Chick eyes and a small beak.
  for (const s of [1, -1]) {
    const hit = b.surface(chickHead).nearest([s * 0.06, 0.29, 0.26]);
    b.stick(new THREE.SphereGeometry(0.014, 8, 6), EYE, hit, { embed: 0.4 });
  }
  b.spike([0, 0.265, 0.275], [0, -0.12, 1], 0.03, 0.011, { color: CHICK_BEAK, bone: chick });

  return b.root;
}
```