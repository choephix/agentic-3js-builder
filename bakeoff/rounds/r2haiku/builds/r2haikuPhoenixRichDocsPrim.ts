import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/index";
import { createBuilder, frame, rng, bezier, catmull, gradient, svg } from "../../../../src/index";

const CRIMSON = "#7a0c1a";
const RED = "#b8231a";
const ORANGE = "#ee6a12";
const GOLD = "#ffc23a";
const AMBER = "#ffae1a";
const BEAK = "#f2b033";
const DARK = "#2a0a06";

export const meta = {
  name: "phoenix",
  description: "A phoenix rising with wings flung open, flame-coloured plumage, a flame crest, ribbon tail and embers.",
};

// A flame-shaped feather outline: base at the origin, tip at (0, len).
function flame(len: number, w: number): OutlinePoint[] {
  return [
    [0, 0],
    [w * 0.5, len * 0.2],
    [w * 0.55, len * 0.55],
    [w * 0.28, len * 0.82],
    [w * 0.1, len * 0.94],
    [0, len, "sharp"],
    [-w * 0.12, len * 0.9],
    [-w * 0.34, len * 0.7],
    [-w * 0.5, len * 0.36],
    [-w * 0.44, len * 0.12],
  ];
}

const SPARK = svg(
  `<svg viewBox="0 0 64 64">
     <defs>
       <radialGradient id="g">
         <stop offset="0" stop-color="#fff8d0"/>
         <stop offset="0.35" stop-color="#ffb030"/>
         <stop offset="1" stop-color="#ff4a00" stop-opacity="0"/>
       </radialGradient>
     </defs>
     <circle cx="32" cy="32" r="30" fill="url(#g)"/>
   </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(21);

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.62, 0], role: "spine" });

  const spine = b.chain("spine", catmull([[0, 1.62, -0.15], [0, 1.66, 0.05], [0, 1.75, 0.35]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });

  const neck = b.chain("neck", catmull([[0, 1.75, 0.35], [0, 1.92, 0.56], [0, 2.08, 0.72]]), {
    parent: spine.joints[1],
    names: ["neck1", "neck2"],
    role: "neck",
  });

  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.14, 0.8], dir: [0, 0.35, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.04 }),
    aim: head.local({ forward: 0.3, down: 0.1 }),
    role: "jaw",
  });

  const tail = b.chain("tail", catmull([[0, 1.6, -0.12], [0, 1.5, -0.55], [0, 1.3, -0.95]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });

  // ---- Body and neck -----------------------------------------------------
  b.sweep(spine, (t: number) => 0.1 + 0.15 * Math.sin(Math.PI * Math.min(1, 0.1 + 0.9 * t)), {
    color: gradient(CRIMSON, ORANGE, [0, 1.6, -0.15], [0, 1.8, 0.45]),
  });
  b.sweep(neck, [0.085, 0.07], { color: gradient(ORANGE, GOLD, [0, 1.8, 0.45], [0, 2.1, 0.75]) });

  // ---- Head, eyes, beak --------------------------------------------------
  b.part(new THREE.SphereGeometry(0.13, 10, 8), ORANGE, {
    bone: head,
    at: head.local({ forward: 0.03, up: 0.02 }),
    scale: [1, 0.95, 1.2],
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.032, 6, 4), AMBER, {
      bone: head,
      at: head.local({ left: s * 0.085, up: 0.03, forward: 0.1 }),
    });
    b.part(new THREE.SphereGeometry(0.014, 5, 3), DARK, {
      bone: head,
      at: head.local({ left: s * 0.085, up: 0.03, forward: 0.125 }),
    });
  }

  b.sweep(
    bezier(
      head.local({ forward: 0.08, up: 0.03 }),
      head.local({ forward: 0.2, up: 0.05 }),
      head.local({ forward: 0.27, up: 0.02 }),
      head.local({ forward: 0.25, up: -0.07 }),
    ),
    [0.04, 0.008],
    { bone: head, color: BEAK, caps: { start: "flat", end: "point" } },
  );

  b.sweep(
    bezier(
      jaw.local({ forward: 0.0, up: 0.0 }),
      jaw.local({ forward: 0.12, up: -0.01 }),
      jaw.local({ forward: 0.2, up: -0.03 }),
    ),
    [0.03, 0.005],
    { bone: jaw, color: BEAK, caps: { start: "flat", end: "point" } },
  );

  // ---- Flame crest -------------------------------------------------------
  for (let i = 0; i < 5; i++) {
    const d = Math.abs(i - 2);
    const k = 1 - d * 0.2;
    const len = 0.3 * k;
    const base = head.local({ left: (i - 2) * 0.04, up: 0.1 * k, forward: -0.04 - d * 0.03 });
    const tip = [base.x, base.y + 0.9 * len, base.z - 0.44 * len];
    b.extrude(flame(len, 0.07), {
      at: base,
      bone: head,
      x: [0, 0, 1],
      y: [0, 0.9, -0.44],
      thickness: 0.02,
      bevel: 0.005,
      color: gradient(RED, GOLD, [base.x, base.y, base.z], tip),
    });
  }

  // ---- Wings -------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const W = (x: number, y: number, z: number): number[] => [s * x, y, z];

    const wing = b.chain(
      `wing${side}`,
      catmull([W(0.12, 1.85, 0.25), W(0.55, 2.1, 0.18), W(1.0, 2.3, 0.0), W(1.45, 2.2, -0.25)]),
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `tip${side}`],
        role: "wing",
      },
    );

    const trail = catmull([W(0.12, 1.72, -0.2), W(0.5, 1.92, -0.42), W(1.0, 2.12, -0.46), W(1.42, 2.05, -0.36)]);

    // Wing skin: deep red at the body, golden at the tips.
    b.membrane(wing, trail, {
      thickness: 0.018,
      color: gradient(RED, GOLD, W(0.3, 1.9, -0.1), W(1.4, 2.1, -0.3)),
    });

    // Primary feathers: flame-shaped plates flaring back off the trailing edge.
    for (const t of [0.14, 0.3, 0.46, 0.62, 0.78, 0.94]) {
      const q = trail.at(t);
      const len = 0.3 + t * 0.2;
      b.extrude(flame(len, 0.11), {
        at: [q.x, q.y + 0.015, q.z],
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.012,
        bevel: 0.004,
        color: gradient(CRIMSON, GOLD, [q.x, q.y, q.z], [q.x, q.y, q.z - len]),
        bone: wing.nearestJoint(q),
      });
    }

    // Coverts: smaller flames along the leading edge.
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const c = wing.at(t).at;
      const len = 0.2;
      b.extrude(flame(len, 0.08), {
        at: [c.x, c.y - 0.02, c.z],
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.01,
        bevel: 0.003,
        color: gradient(ORANGE, GOLD, [c.x, c.y, c.z], [c.x, c.y, c.z - len]),
        bone: wing.nearestJoint(c),
      });
    }
  }

  // ---- Ribbon tail feathers ---------------------------------------------
  for (const dx of [-0.24, -0.12, 0, 0.12, 0.24]) {
    const end: [number, number, number] = [dx * 1.4, 0.98, -1.85];
    const path = catmull([
      [dx * 0.2, 1.6, -0.12],
      [dx * 0.8, 1.42, -0.6],
      [dx * 1.2, 1.2, -1.2],
      end,
    ]);
    b.sweep(path, (t: number) => [0.035 * (1 - t) + 0.004, 0.006], {
      section: "box",
      color: gradient(CRIMSON, GOLD, [dx * 0.2, 1.6, -0.12], end),
      bone: tail.joints[0],
    });
  }

  // ---- Embers and sparks drifting off the wings -------------------------
  const sparks = [];
  for (let i = 0; i < 40; i++) {
    const p: [number, number, number] = [(rand() * 2 - 1) * 1.7, 1.4 + rand() * 1.8, -0.7 + rand() * 1.1];
    sparks.push(frame(p, [0, 1, 0]));
  }
  b.cards(sparks, SPARK, { size: 0.06, vary: 0.4, rng: rand });

  return b.root;
}
