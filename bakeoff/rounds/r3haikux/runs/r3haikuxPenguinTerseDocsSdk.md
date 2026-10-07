```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  grain,
  mix,
  paint,
  polyline,
  smoothstep,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

// King-penguin markings: black coat, white belly, gold breast and ear patch, orange bill and feet.
const INK = "#1b1e25";
const SHEEN = "#343b48";
const BELLY = "#f4f2ec";
const GOLD = "#f2a33a";
const BILL = "#f08f2a";
const BILL_TIP = "#3b2a22";
const FOOT = "#e8762a";
const EYE_WHITE = "#fbfbf7";
const PUPIL = "#101216";
const ICE_SIDE = "#8cc6e0";
const SNOW = "#eef8fc";
const ICE_CHUNK = "#c4e8f6";

// Feathery grain over the black back and head, streaks running up the body.
const back = grain(INK, SHEEN, { size: 0.02, axis: "y", seed: 5 });

// Front white belly, gold breast bib, black back.
const coat = paint((p, n) => {
  const belly = mix(back, BELLY, smoothstep(0.1, 0.4, n.z));
  const bibD = Math.hypot(p.x / 0.1, (p.y - 0.565) / 0.065);
  const bib = (1 - smoothstep(0.8, 1.0, bibD)) * smoothstep(0.25, 0.5, n.z);
  return mix(belly, GOLD, bib);
});

// Black head with a gold ear patch on each side, behind the eye.
const headCoat = paint((_p, n) => {
  const side = smoothstep(0.45, 0.7, Math.abs(n.x));
  const d = Math.hypot((n.z + 0.12) / 0.3, (n.y - 0.02) / 0.22);
  return mix(back, GOLD, side * (1 - smoothstep(0.8, 1.0, d)));
});

// Bill: orange, dark at the tip.
const billCoat = paint((_p, _n, s) => (s[0] > 0.8 ? BILL_TIP : BILL));

// Ice floe: snow on top, blue ice at the sides.
const floeCoat = paint((_p, n) => mix(ICE_SIDE, SNOW, smoothstep(0.4, 0.8, n.y)));

// Half-width (sideways) and half-depth (front to back) of the body at spine t.
function bodyRadius(t: number): [number, number] {
  const keys: [number, number, number][] = [
    [0, 0.1, 0.1],
    [0.12, 0.135, 0.115],
    [0.36, 0.17, 0.135],
    [0.77, 0.155, 0.12],
    [1, 0.1, 0.09],
  ];
  for (let i = 1; i < keys.length; i++) {
    const [t0, w0, d0] = keys[i - 1];
    const [t1, w1, d1] = keys[i];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      const e = k * k * (3 - 2 * k);
      return [w0 + (w1 - w0) * e, d0 + (d1 - d0) * e];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
}

// Webbed foot, drawn with x = forward and y = sideways, extruded flat.
const FOOT_SHAPE: OutlinePoint[] = [
  [-0.035, -0.03],
  [0.01, -0.05],
  [0.07, -0.064, "sharp"],
  [0.06, -0.02],
  [0.112, 0, "sharp"],
  [0.06, 0.02],
  [0.07, 0.064, "sharp"],
  [0.01, 0.05],
  [-0.035, 0.03],
];

export const meta = {
  name: "Penguin",
  description: "A King-style penguin, about 0.9 m tall, standing on a small ice floe.",
};

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Skeleton: pelvis root, spine chain (waist, chest, neck, nape), head, jaw, wings and legs.
  const hips = b.joint("hips", { at: [0, 0.2, 0], aim: [0, 0.4, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.26, 0],
      [0, 0.42, 0],
      [0, 0.6, 0.012],
      [0, 0.7, 0.03],
    ]),
    { parent: hips, names: ["waist", "chest", "neck", "nape"], role: "spine" },
  );
  const headJ = b.joint("head", { parent: spine, at: [0, 0.8, 0.035], role: "head" });

  // Body: one egg-shaped tube over the spine, narrowing into the shoulders.
  b.sweep(spine, bodyRadius, { color: coat, sides: 12 });

  // Head: a slightly squashed ball, black with a gold ear patch on each side.
  const skull = b.part(new THREE.SphereGeometry(0.1, 18, 12), headCoat, {
    bone: headJ,
    at: [0, 0.8, 0.035],
    scale: [1, 1.08, 0.96],
  });

  // Eyes: a white dome with a dark pupil and a small glint, seated on the head.
  const eyeSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eye = eyeSurface.around([0, 0.8, 0.035]).at(s * 34, 6);
    if (!eye) continue;
    b.stick(new THREE.SphereGeometry(0.027, 12, 8), EYE_WHITE, eye, { embed: 0.6 });
    b.stick(new THREE.SphereGeometry(0.014, 10, 7), PUPIL, eye.moved([0, 0.0132, 0]), { embed: 0.2 });
    b.stick(new THREE.SphereGeometry(0.0045, 6, 4), EYE_WHITE, eye.moved([0.004, 0.036, 0.004]), {
      embed: 0.5,
    });
  }

  // Bill: the upper mandible is fixed to the head; the lower one sits on its own jaw joint.
  b.sweep(
    bezier(
      headJ.local({ forward: 0.06, up: 0.01 }),
      headJ.local({ forward: 0.13, up: 0.014 }),
      headJ.local({ forward: 0.18, up: 0 }),
    ),
    (t) => [0.016 * (1 - t) + 0.003, 0.018 * (1 - t) + 0.003],
    { bone: headJ, color: billCoat, caps: { start: "round", end: "point" } },
  );
  const jawBase = headJ.local({ forward: 0.06, down: 0.012 });
  const jawTip = headJ.local({ forward: 0.165, down: 0.014 });
  const jaw = b.joint("jaw", { parent: headJ, at: jawBase, aim: jawTip, role: "jaw" });
  b.sweep(
    polyline([jawBase, jawTip]),
    (t) => [0.011 * (1 - t) + 0.002, 0.009 * (1 - t) + 0.002],
    { bone: jaw, color: billCoat, caps: { start: "round", end: "point" } },
  );

  // Wings: stiff flippers hanging just off the sides, flat fore and aft.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${L}`,
      catmull([
        [s * 0.12, 0.6, 0],
        [s * 0.165, 0.46, -0.004],
        [s * 0.185, 0.29, -0.012],
      ]),
      { parent: "neck", names: [`shoulder${L}`, `wrist${L}`, `wingTip${L}`], role: "wing" },
    );
    b.sweep(wing, (t) => [0.02 * (1 - 0.5 * t) + 0.003, 0.045 * (1 - 0.65 * t) + 0.008], {
      color: back,
      caps: { start: "round", end: "point" },
    });
  }

  // Legs and webbed feet: short, set far back, feet pointing forward on the ice.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      catmull([
        [s * 0.07, 0.22, -0.02],
        [s * 0.08, 0.12, 0],
        [s * 0.08, 0.05, 0.035],
      ]),
      {
        parent: hips,
        names: [`hip${L}`, `knee${L}`, `foot${L}`],
        role: "leg",
        contact: [s * 0.08, 0.05, 0.06],
      },
    );
    b.sweep(leg, (t) => 0.026 - 0.008 * t, { color: FOOT });
    b.extrude(FOOT_SHAPE, {
      at: [s * 0.08, 0.053, 0.035],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.016,
      bevel: 0.004,
      color: FOOT,
      bone: leg,
    });
  }

  // Stiff tail feathers reaching back to the ice.
  b.sweep(
    catmull([
      [0, 0.2, -0.07],
      [0, 0.13, -0.135],
      [0, 0.085, -0.16],
    ]),
    (t) => [0.045 * (1 - t) + 0.01, 0.022 * (1 - t) + 0.004],
    { bone: "waist", color: back, caps: { start: "round", end: "point" } },
  );

  // Ice floe: a flattened puck the penguin stands on. Its base sits on y = 0.
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.41, 0.014],
      [0.44, 0.034],
      [0.41, 0.05],
      [0.3, 0.052],
      [0, 0.052],
    ],
    { at: [0, 0, 0], bone: hips, segments: 16, smoothing: 1, color: floeCoat },
  );

  // Three broken ice shards on the floe for composition.
  const shards: [number, number, number, number][] = [
    [0.26, 0.12, 1.0, 30],
    [-0.24, -0.2, 0.8, 110],
    [0.2, -0.27, 0.6, 70],
  ];
  for (const [x, z, k, deg] of shards) {
    b.part(new THREE.DodecahedronGeometry(0.05, 0), ICE_CHUNK, {
      bone: hips,
      at: [x, 0.05, z],
      rotation: [0, deg, 0],
      scale: [1.3 * k, 0.55, k],
      flat: true,
    });
  }

  return b.root;
}
```