import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, paint, gradient, mix, smoothstep } from "../../../../src/index";

export const meta = {
  name: "phoenix",
  description: "A phoenix rising with wings flung open, plumage blazing from crimson to golden tips.",
};

const CRIMSON = "#8e1222";
const RED = "#c42a1a";
const ORANGE = "#f27a1e";
const GOLD = "#ffc53a";
const PALE_GOLD = "#ffe58a";
const AMBER = "#ffae1a";
const GOLD_DARK = "#d9962a";
const DARK = "#2a0c0c";
const EMBER = "#ff9a2a";

// Plumes run crimson at the root, orange through the middle, gold at the tip.
const plume = paint((_p, _n, s) =>
  s[0] < 0.5 ? mix(CRIMSON, ORANGE, s[0] * 2) : mix(ORANGE, GOLD, (s[0] - 0.5) * 2),
);

// Tail ribbons run orange at the root to pale gold at the ends.
const ribbon = paint((_p, _n, s) => mix(RED, PALE_GOLD, smoothstep(0.25, 1, s[0])));

// Crest flames: gold at the base, flaring to pale gold at the tip.
const crest = paint((_p, _n, s) => mix(ORANGE, PALE_GOLD, smoothstep(0.2, 1, s[0])));

// Body runs deep crimson at the tail to orange at the chest.
const body = gradient(CRIMSON, ORANGE, [0, 1.6, -0.4], [0, 1.95, 0.35]);

export default function build() {
  const b = createBuilder({ name: "phoenix" });

  // ---- Skeleton: body, neck, head, jaw ----
  const hips = b.joint("hips", { at: [0, 1.7, -0.2] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.7, -0.3],
      [0, 1.72, -0.05],
      [0, 1.8, 0.18],
      [0, 1.92, 0.36],
    ]),
    { parent: hips, names: ["spineA", "spineB", "spineC"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.92, 0.36],
      [0, 2.05, 0.5],
      [0, 2.14, 0.6],
    ]),
    { parent: spine, names: ["neckA", "neckB"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.16, 0.64],
    aim: [0, 2.22, 0.8],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, -0.02, -0.01]),
    aim: head.local([0, 0.3, 0]),
    role: "jaw",
  });

  // ---- Torso and neck tubes ----
  b.sweep(spine, (t: number) => 0.12 + 0.06 * Math.sin(Math.PI * t), { color: body });
  b.sweep(neck, [0.075, 0.06], { color: body });
  b.capsule(head.local([0, -0.05, 0]), head.local([0, 0.06, 0]), 0.085, { bone: head, color: body });

  // ---- Beak: hooked upper mandible and lower jaw on its own joint ----
  b.sweep(
    bezier(
      head.local([0, 0.03, 0.02]),
      head.local([0, 0.12, 0.03]),
      head.local([0, 0.2, 0.0]),
      head.local([0, 0.23, -0.05]),
    ),
    [0.035, 0.008],
    { bone: head, color: GOLD },
  );
  b.sweep(
    bezier(
      jaw.local([0, 0.0, -0.01]),
      jaw.local([0, 0.08, -0.02]),
      jaw.local([0, 0.16, -0.02]),
      jaw.local([0, 0.2, -0.04]),
    ),
    [0.025, 0.006],
    { bone: jaw, color: GOLD_DARK },
  );

  // ---- Glowing amber eyes ----
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), AMBER, {
      bone: head,
      at: head.local([s * 0.075, 0.03, 0.02]),
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), DARK, {
      bone: head,
      at: head.local([s * 0.1, 0.045, 0.02]),
    });
  }

  // ---- Crest: seven flame-shaped plumes sweeping up and back ----
  for (let i = 0; i < 7; i++) {
    const u = (i - 3) * 0.024;
    const f = -0.07 + i * 0.022;
    const base = head.local([u, f, 0.07]);
    const tip = head.local([u * 2.4, f - 0.16, 0.3 - Math.abs(u) * 0.8]);
    b.sweep(
      bezier(base, head.local([u * 1.2, f, 0.14]), head.local([u * 1.8, f - 0.07, 0.24]), tip),
      [0.024, 0.003],
      { bone: head, color: crest },
    );
  }

  // ---- Wings: flung open, with feathers fanning from each hand ----
  const rand = rng(21);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.14, 1.9, 0.2],
        [s * 0.55, 2.16, 0.14],
        [s * 1.0, 2.36, 0.0],
        [s * 1.45, 2.12, -0.32],
      ]),
      {
        parent: spine,
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
        role: "wing",
      },
    );

    b.sweep(wing, [0.06, 0.012], { color: body });

    // One quill: a tapered flame-shaped sweep from the arm outward and back.
    const quill = (t: number, L: number, drop: number) => {
      const cp = wing.at(t);
      const p = cp.at;
      const path = bezier(
        [p.x, p.y, p.z],
        [p.x + s * 0.22 * L, p.y + 0.06 * L, p.z - 0.12 * L],
        [p.x + s * 0.5 * L, p.y + drop * L, p.z - 0.32 * L],
        [p.x + s * 0.62 * L, p.y - 0.1 * L + drop * L * 0.5, p.z - 0.6 * L],
      );
      b.sweep(path, [0.03 + 0.02 * L, 0.004], { bone: cp.bone, color: plume });
    };

    // Primaries from the hand.
    for (let i = 0; i < 10; i++) {
      quill(0.66 + i * 0.034, 0.9 - i * 0.04, -0.12);
    }
    // Coverts along the arm, shorter and sweeping back.
    for (let i = 0; i < 8; i++) {
      quill(0.12 + i * 0.065, 0.55, 0.0);
    }

    // Embers drifting off this wing.
    for (let i = 0; i < 18; i++) {
      const x = s * (0.4 + rand() * 1.3);
      const y = 1.9 + rand() * 1.2;
      const z = -0.4 + rand() * 0.5;
      const pick = rand();
      const col = pick < 0.35 ? GOLD : pick < 0.7 ? EMBER : pick < 0.85 ? PALE_GOLD : RED;
      const r = 0.012 + rand() * 0.012;
      b.part(new THREE.SphereGeometry(r, 5, 4), col, { at: [x, y, z] });
    }
  }

  // ---- Tail: a long curved shaft with ribbons of fire ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.7, -0.25],
      [0, 1.5, -0.7],
      [0, 1.2, -1.0],
      [0, 0.9, -1.35],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.07 - 0.04 * t, { color: body });

  for (let k = 0; k < 7; k++) {
    const u = (k - 3) / 3;
    const cp = tail.at(0.35 + 0.05 * Math.abs(u));
    const p = cp.at;
    b.sweep(
      bezier(
        [p.x, p.y, p.z],
        [u * 0.1, 1.25, -1.2],
        [u * 0.4, 1.0, -1.5],
        [u * 0.5, 0.5 + 0.2 * Math.abs(u), -2.0],
      ),
      [0.035, 0.004],
      { bone: cp.bone, color: ribbon },
    );
  }

  // ---- Talons, tucked legs ----
  for (const s of [1, -1]) {
    const toe = [s * 0.1, 1.46, 0.22] as [number, number, number];
    b.sweep(
      catmull([
        [s * 0.12, 1.66, -0.1],
        [s * 0.15, 1.52, 0.08],
        toe,
      ]),
      [0.028, 0.016],
      { bone: hips, color: GOLD_DARK },
    );
    b.spike(toe, [0, -0.6, 0.8], 0.05, 0.012, { color: DARK });
  }

  // ---- Drifting sparks around the wings ----
  const sparkCols = [GOLD, EMBER, PALE_GOLD];
  for (let i = 0; i < 22; i++) {
    const x = (rand() < 0.5 ? 1 : -1) * (0.9 + rand() * 1.0);
    const y = 2.0 + rand() * 1.1;
    const z = -0.5 + rand() * 0.6;
    const col = sparkCols[Math.floor(rand() * sparkCols.length)];
    b.part(new THREE.SphereGeometry(0.008 + rand() * 0.006, 4, 3), col, { at: [x, y, z] });
  }

  return b.root;
}
