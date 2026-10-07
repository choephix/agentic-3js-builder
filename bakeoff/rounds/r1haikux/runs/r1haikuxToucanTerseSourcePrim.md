```ts
import * as THREE from "three";
import { catmull, createBuilder, interpolate, mix, noise, paint, polyline, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Toco toucan",
  description:
    "A stylised toco toucan standing on the ground: a big orange bill with a black tip, black plumage with a white throat and chest, blue eye rings, a red vent and zygodactyl feet.",
};

const BLACK = "#15130f";
const SHEEN = "#2a3644";
const WHITE = "#f7f4ea";
const VENT = "#ec4a26";
const LEG = "#4b5159";
const CLAW = "#2a2420";
const EYE = "#0c0b0a";
const RING = "#22a2e6";
const BILL: Array<[number, string]> = [
  [0.55, "#ffb42e"],
  [0.78, "#f26d1d"],
  [1, "#161310"],
];

// Zygodactyl feet: two toes forward, two back. [name, outward, forward], metres from the foot (left foot).
const TOES: Array<[string, number, number]> = [
  ["toe1", -0.016, -0.04],
  ["toe2", -0.012, 0.056],
  ["toe3", 0.022, 0.05],
  ["toe4", 0.02, -0.03],
];

// Folded wing, drawn in the side plane: u = forward (z), v = up (y), from the shoulder.
const WING = [
  [0.03, 0.03],
  [-0.04, 0.02],
  [-0.1, -0.02],
  [-0.16, -0.045],
  [-0.215, -0.07],
  [-0.26, -0.085, "sharp"],
  [-0.215, -0.11],
  [-0.19, -0.105],
  [-0.16, -0.12],
  [-0.13, -0.115],
  [-0.095, -0.125],
  [-0.06, -0.12],
  [-0.02, -0.1],
  [0.02, -0.065],
  [0.03, -0.02],
];

/**
 * Black plumage with a faint blue sheen, a white throat and chest, and a red vent under the rump. One paint covers
 * every feathered part, so the colours run across head, body, tail and wings without seams.
 */
const plumage = paint((p, n) => {
  const black = mix(BLACK, SHEEN, 0.5 * smoothstep(0.5, 0.75, noise(p, 0.05, 3)));
  const bib = smoothstep(0.3, 0.6, n.z) * smoothstep(0.23, 0.3, p.y) * (1 - smoothstep(0.4, 0.46, p.y));
  const vent =
    smoothstep(0.06, 0, p.z) *
    smoothstep(-0.2, -0.5, n.y) *
    smoothstep(0.2, 0.13, p.y) *
    smoothstep(0.08, 0.05, Math.abs(p.x));
  return mix(mix(black, WHITE, bib), VENT, vent);
});

export default function toucan() {
  const b = createBuilder({ name: "toucan", detail: 1, paintSize: 1024 });
  const side = (s: "L" | "R") => (s === "L" ? 1 : -1);

  // ---- Skeleton -------------------------------------------------------------------------------
  b.joint("hips", { at: [0, 0.15, -0.015] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.18, 0],
      [0, 0.235, 0.07],
      [0, 0.29, 0.14],
      [0, 0.345, 0.2],
    ]),
    { parent: "hips", names: ["spine1", "spine2", "spine3", "neck"], role: "spine" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.16, -0.03],
      [0, 0.135, -0.1],
      [0, 0.105, -0.17],
      [0, 0.08, -0.235],
    ]),
    { parent: "hips", names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  const head = b.joint("head", { parent: "neck", at: [0, 0.43, 0.23], dir: [0, 0.6, 0.8], role: "head" });
  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.37, 0.25], dir: [0, 0.05, 1], role: "jaw" });

  const limbs = (["L", "R"] as const).map((s) => {
    const k = side(s);
    const foot = [0.05 * k, 0.009, 0.005];
    const leg = b.chain(
      `leg${s}`,
      catmull([
        [0.04 * k, 0.15, -0.01],
        [0.05 * k, 0.095, 0.03],
        [0.05 * k, 0.05, 0],
        foot,
      ]),
      { parent: "hips", names: [`hip${s}`, `knee${s}`, `ankle${s}`, `foot${s}`], role: "leg" },
    );
    const toes = TOES.map(([name, out, forward]) => {
      const id = `${name}${s}`;
      const end = [foot[0] + out * k, foot[1], foot[2] + forward];
      const chain = b.chain(id, polyline([foot, end]), { parent: `foot${s}`, names: [id], role: "digit" });
      return { id, chain, end, dir: [out * k, 0, forward] };
    });
    return { s, leg, toes };
  });

  for (const s of ["L", "R"] as const) {
    const x = 0.088 * side(s);
    b.chain(
      `wing${s}`,
      polyline([
        [x, 0.29, 0.07],
        [x, 0.25, -0.03],
        [x, 0.225, -0.1],
        [x, 0.205, -0.19],
      ]),
      { parent: "spine2", names: [`shoulder${s}`, `elbow${s}`, `wrist${s}`, `finger${s}`], role: "wing" },
    );
  }

  // ---- Body -----------------------------------------------------------------------------------
  // One smooth tube along the spine: deep and round through the chest, narrow at the rump and neck.
  b.sweep(
    spine,
    (t) => [
      interpolate([0, 0.35, 0.7, 1], [0.05, 0.072, 0.078, 0.05], t),
      interpolate([0, 0.35, 0.7, 1], [0.06, 0.068, 0.076, 0.05], t),
    ],
    { color: plumage, sides: 12, name: "body" },
  );

  // Broad, flat tail that fans out behind.
  b.sweep(tail, (t) => [0.042 - 0.014 * t, 0.017 - 0.006 * t], { color: plumage, sides: 8, name: "tail" });

  // Wings folded along the flanks, one scalloped feather plate each.
  for (const s of ["L", "R"] as const) {
    b.extrude(WING, {
      color: plumage,
      at: [0.088 * side(s), 0.29, 0.07],
      thickness: [0.005, 0.014],
      bevel: 0.003,
      bone: `elbow${s}`,
      name: `wing${s}`,
    });
  }

  // Head: a big round sphere, slightly flattened.
  b.part(new THREE.SphereGeometry(0.1, b.segments(16), b.segments(12)), plumage, {
    bone: head,
    at: [0, 0.43, 0.23],
    scale: [0.95, 1, 1.05],
    name: "head",
  });

  // ---- Legs and feet --------------------------------------------------------------------------
  for (const { s, leg, toes } of limbs) {
    b.sweep(leg, (t) => 0.0155 - 0.0045 * t, { color: LEG, sides: 8, name: `leg${s}` });
    for (const toe of toes) {
      b.sweep(toe.chain, [0.0085, 0.0062], { color: LEG, sides: 6, name: toe.id });
      b.spike(toe.end, toe.dir, 0.012, 0.0042, { color: CLAW, bone: toe.id, name: `claw${toe.id}` });
    }
  }

  // ---- Eyes: blue bare-skin rings, black eyes with a glint ------------------------------------
  for (const s of ["L", "R"] as const) {
    const k = side(s);
    const eye = [0.085 * k, 0.442, 0.275];
    b.part(new THREE.TorusGeometry(0.024, 0.008, b.segments(8), b.segments(20)).rotateY(Math.PI / 2), RING, {
      bone: head,
      at: eye,
      name: `eyeRing${s}`,
    });
    b.part(new THREE.SphereGeometry(0.015, b.segments(10), b.segments(8)), EYE, {
      bone: head,
      at: eye,
      name: `eye${s}`,
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 5), "#ffffff", {
      bone: head,
      at: [0.093 * k, 0.448, 0.283],
      name: `glint${s}`,
    });
    b.part(new THREE.SphereGeometry(0.0065, 8, 6), EYE, {
      bone: head,
      at: [0.02 * k, 0.486, 0.3],
      scale: [1, 0.6, 1.6],
      name: `nostril${s}`,
    });
  }

  // ---- Bill: upper on the head, lower on the hinged jaw. Orange base, black tip. --------------
  b.sweep(
    catmull([
      [0, 0.45, 0.25],
      [0, 0.445, 0.33],
      [0, 0.42, 0.4],
      [0, 0.4, 0.44],
    ]),
    (t) => [
      interpolate([0, 0.5, 1], [0.04, 0.03, 0.006], t),
      interpolate([0, 0.5, 1], [0.055, 0.04, 0.008], t),
    ],
    { bone: head, bands: BILL, sides: 10, name: "billUpper" },
  );

  b.sweep(
    catmull([
      [0, 0.37, 0.25],
      [0, 0.37, 0.33],
      [0, 0.37, 0.385],
      [0, 0.385, 0.42],
    ]),
    (t) => [
      interpolate([0, 0.5, 1], [0.034, 0.024, 0.005], t),
      interpolate([0, 0.5, 1], [0.034, 0.024, 0.007], t),
    ],
    { bone: jaw, bands: BILL, sides: 10, name: "billLower" },
  );

  return b.root;
}
```