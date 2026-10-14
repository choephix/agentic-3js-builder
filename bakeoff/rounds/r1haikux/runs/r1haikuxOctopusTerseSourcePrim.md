```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, paint, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "Octopus",
  description:
    "A coral octopus resting on the floor: a bulbous mantle with gold eyes and a siphon, and eight curled arms with maroon sucker rings along the belly.",
};

const CORAL = "#d9573a";
const CREAM = "#f7dfb8";
const MAROON = "#8a2c1c";
const SPOT = "#a23a22";
const GOLD = "#f2b43a";
const INK = "#140b09";
const RIM = "#3b1410";

/** Mantle half-profile: [distance from the axis, height above the base] in metres, base to crown. */
const MANTLE: Array<[number, number]> = [
  [0, 0],
  [0.07, 0.01],
  [0.125, 0.05],
  [0.14, 0.12],
  [0.13, 0.2],
  [0.105, 0.26],
  [0.06, 0.3],
  [0, 0.315],
];

/** Arm centreline in canonical form: [out along the arm, height above the floor, sideways], metres. */
const ARM: Array<[number, number, number]> = [
  [0.03, 0.085, 0.0],
  [0.12, 0.042, 0.01],
  [0.22, 0.029, 0.025],
  [0.33, 0.028, 0.035],
  [0.44, 0.029, 0.025],
  [0.52, 0.034, 0.005],
  [0.58, 0.075, -0.01],
  [0.61, 0.135, -0.035],
  [0.59, 0.195, -0.07],
  [0.53, 0.225, -0.1],
  [0.46, 0.205, -0.11],
  [0.43, 0.165, -0.095],
  [0.46, 0.13, -0.06],
];

/** The eight arms: name and bearing in degrees from the front (+Z), positive toward the model's left (+X). */
const ARMS: Array<[string, number]> = [
  ["armFL", 26],
  ["armFR", -26],
  ["armSL", 66],
  ["armSR", -66],
  ["armBL", 110],
  ["armBR", -110],
  ["armRL", 152],
  ["armRR", -152],
];

/** Arm radius at source t: thick where it leaves the mantle, 3 cm lying on the floor, a fine curled tip. */
function girth(t: number) {
  const root = 0.03 * Math.max(0, 1 - t / 0.1);
  const taper = 1 - 0.75 * Math.min(Math.max((t - 0.5) / 0.5, 0), 1);
  return (0.03 + root) * taper;
}

/** Metres between suckers along an arm. */
const SPACING = 0.024;

/**
 * Sucker rings on the belly of a curled arm, 0..1, at surface coords (t, clock degrees; 180 = belly). Two staggered
 * rows, each ring a pale-edged disc on the arm's surface.
 */
function sucker(t: number, deg: number, length: number) {
  if (t < 0.56 || t > 0.86) return 0;
  const r = girth(t);
  const across = (((deg - 180) * Math.PI) / 180) * r;
  const along = t * length;
  const row = ((22 * Math.PI) / 180) * r;
  const soft = (d: number, edge: number) => Math.min(Math.max((edge - d) / (0.15 * r) + 0.5, 0), 1);
  let best = 0;
  for (const [side, shift] of [
    [-1, 0],
    [1, 0.5],
  ] as const) {
    const cell = along / SPACING - shift;
    const dx = (cell - Math.round(cell)) * SPACING;
    const dy = across - side * row;
    const d = Math.hypot(dx, dy);
    best = Math.max(best, soft(d, 0.24 * r) * (1 - soft(d, 0.14 * r)));
  }
  return best;
}

export default function octopus() {
  const b = createBuilder({ name: "octopus", paintSize: 2048 });

  // Paints: coral above, cream below (countershading), maroon rosettes on the mantle, speckle on the arms.
  const skin = countershade(CORAL, CREAM, { level: -0.15, soft: 0.5 });
  const mantleSkin = spots(skin, MAROON, { size: 0.075, amount: 0.3, rosette: true, seed: 4 });
  const armSkin = spots(skin, SPOT, { size: 0.055, amount: 0.3, seed: 11 });

  // Skeleton: the mantle is the root; eight arms and two eyes hang from it.
  b.joint("mantle", { at: [0, 0.2, 0], role: "head" });

  // Mantle and siphon.
  b.lathe(MANTLE, { name: "mantle", color: mantleSkin, at: [0, 0.06, 0], bone: "mantle", segments: 16 });
  b.capsule([0, 0.12, 0.09], [0, 0.075, 0.2], [0.036, 0.026], {
    name: "siphon",
    color: mantleSkin,
    bone: "mantle",
    sides: 10,
  });

  // Arms: each a six-joint tentacle lying on the floor, its tip curled up and back over itself.
  const rand = rng(21);
  for (const [name, bearing] of ARMS) {
    const a = ((bearing + (rand() * 2 - 1) * 4) * Math.PI) / 180;
    const out = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const reach = 0.92 + 0.16 * rand();
    const sway = rand() < 0.5 ? 1 : -1;
    const points = ARM.map(([u, y, w], i) =>
      out
        .clone()
        .multiplyScalar(i === 0 ? u : 0.03 + (u - 0.03) * reach)
        .addScaledVector(side, w * sway)
        .setY(y),
    );
    const path = catmull(points);
    const arm = b.chain(name, path, { parent: "mantle", count: 6, role: "tentacle" });
    const length = path.length;
    b.sweep(arm, girth, {
      name,
      sides: 8,
      color: paint((_p, _n, s) => (sucker(s[0], s[1], length) > 0.5 ? MAROON : armSkin)),
    });
  }

  // Eyes: gold globes on the sides of the head, each with a dark rim and a horizontal slot pupil.
  for (const sign of [1, -1]) {
    const eye = b.joint(sign > 0 ? "eyeL" : "eyeR", {
      parent: "mantle",
      at: [sign * 0.102, 0.2, 0.072],
      dir: [sign * 0.82, 0.05, 0.57],
    });
    b.part(new THREE.SphereGeometry(0.042, 16, 12), GOLD, { frame: eye });
    const rim = new THREE.TorusGeometry(0.04, 0.006, 8, 20).rotateX(Math.PI / 2);
    b.part(rim, RIM, { frame: eye, at: eye.local([0, 0.014, 0]) });
    b.part(new THREE.SphereGeometry(1, 12, 8), INK, {
      frame: eye,
      at: eye.local([0, 0.034, 0]),
      scale: [0.018, 0.009, 0.011],
    });
  }

  return b.root;
}
```