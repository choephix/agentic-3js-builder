```ts
import * as THREE from "three";
import type { Texture } from "three";
import { catmull, createBuilder, frame, limb, paint, rng, scales, svg } from "agentic-3js-builder";
import { animeEye, cel, furEdge, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "qilin",
  description:
    "A standing qilin: jade scales with a cream belly, an ivory antler crown tipped in gold, a cloud mane, cloud tail and beard, gold anime eyes and a glowing jade gem.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette. Paints are built once, so every part that shares one continues one pattern.

const JADE = ["#2b8f6b", "#38a47d", "#237a5c"];
const JADE_EDGE = "#103d2d";
const BELLY = "#fbeec0";
const CREAM = "#fff6dc";
const GOLD = "#f5c451";
const IVORY = "#fff3da";
const HOOF = "#2b2e40";
const GEM = "#8ff5dc";

const coat = scales(JADE, JADE_EDGE, { size: 0.045, seed: 3 });
const bodyPaint = cel(furEdge(coat, BELLY, { level: -0.45, teeth: 0.22, period: 0.04, ink: INK }));
const legPaint = cel(scales(JADE, JADE_EDGE, { size: 0.032, seed: 5 }));
const creamPaint = cel(CREAM);
const goldPaint = cel(GOLD);
const ivoryPaint = cel(IVORY);
const hoofPaint = cel(HOOF);
const antlerPaint = paint((_p, _n, s) => (s[0] > 0.8 ? goldPaint : ivoryPaint));

const EYE = animeEye({ iris: "#ffb42b", irisLight: "#fff0a0", irisDark: "#8a3d12" });

// ---------------------------------------------------------------------------------------------------------------
// Drawings

type Bump = readonly [number, number, number];

/** A cloud puff drawing: dark ink outline, a body colour, a lower shade band and soft glints on each puff. */
function cloud(bumps: readonly Bump[], body: string, shade: string, edge: string): Texture {
  const lo = Math.min(...bumps.map(([x, , r]) => x - r));
  const hi = Math.max(...bumps.map(([x, , r]) => x + r));
  const shapes = (grow: number) =>
    bumps.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + grow}"/>`).join("") +
    `<rect x="${lo - grow}" y="${48 - grow}" width="${hi - lo + 2 * grow}" height="${26 + 2 * grow}" rx="${13 + grow}"/>`;
  const glints = bumps
    .map(([x, y, r]) => `<circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.4).toFixed(1)}" r="${(r * 0.28).toFixed(1)}"/>`)
    .join("");
  return svg(
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <g fill="${edge}">${shapes(3)}</g>
      <g fill="${body}">${shapes(0)}</g>
      <rect x="${lo + 8}" y="60" width="${hi - lo - 16}" height="9" rx="4.5" fill="${shade}"/>
      <g fill="#ffffff">${glints}</g>
    </svg>`,
    { size: 256 },
  );
}

const CLOUD_A = cloud(
  [
    [28, 50, 15],
    [47, 36, 20],
    [68, 40, 17],
    [82, 56, 11],
    [14, 58, 10],
  ],
  "#fbf7ff",
  "#b9c8f7",
  "#2c2150",
);
const CLOUD_B = cloud(
  [
    [30, 44, 16],
    [52, 30, 22],
    [74, 46, 16],
    [46, 56, 13],
    [64, 58, 12],
  ],
  "#f1ebff",
  "#c3a8f0",
  "#2c2150",
);
const CLOUD_C = cloud(
  [
    [32, 46, 15],
    [50, 34, 19],
    [70, 48, 15],
    [84, 56, 10],
  ],
  "#fff3c4",
  "#f2c46a",
  "#5a3d12",
);
const CLOUDS = [CLOUD_A, CLOUD_B, CLOUD_C];

/** A gold swirl seal for the flank. */
const SIGIL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#ffe08a" stroke-width="4" stroke-linecap="round">
      <path d="M32 6 C52 6 58 26 46 38 C36 48 20 44 20 30 C20 20 30 16 36 24"/>
      <path d="M32 58 C12 58 6 38 18 26 C28 16 44 20 44 34"/>
    </g>
    <circle cx="32" cy="32" r="4" fill="#ffe08a"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "qilin" });

  // Skeleton: hips, spine, neck, head with a jaw, four legs, a tail.
  const hips = b.joint("hips", { at: [0, 1.1, -0.75], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.1, -0.7],
      [0, 1.16, -0.35],
      [0, 1.21, 0.05],
      [0, 1.22, 0.42],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.26, 0.4],
      [0, 1.52, 0.62],
      [0, 1.78, 0.84],
      [0, 1.95, 0.98],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 2.0, 1.0], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.93, 1.04], dir: [0, -0.25, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.12, -0.72],
      [0, 1.06, -0.95],
      [0, 0.95, -1.14],
      [0, 0.8, -1.22],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // Body: a loft through five stations along the spine, deep in the chest and round over the rump.
  const body = b.loft(
    [
      [0.0, 0.32, 0.4],
      [0.25, 0.42, 0.46],
      [0.55, 0.46, 0.5],
      [0.85, 0.46, 0.5],
      [1.0, 0.38, 0.44],
    ].map(([t, w, h]) => ({ at: spine.at(t), w, h })),
    { bone: [hips, spine], color: bodyPaint },
  );

  // Neck: a tube up from the chest, with a gold collar.
  const neckTube = b.sweep(neck, (t) => 0.13 - 0.045 * t, { color: bodyPaint });
  const neckSurf = b.surface(neckTube);
  const collar = neckSurf.loop(neck.joints[1], { lift: 0.014 });
  b.sweep(collar, 0.013, { color: goldPaint });

  // Head: skull, upper muzzle, a separate lower jaw, ears, a forehead gem.
  const skull = b.part(new THREE.SphereGeometry(1, 18, 12), bodyPaint, {
    bone: head,
    at: [0, 2.0, 1.02],
    scale: [0.13, 0.12, 0.15],
  });
  b.sweep(
    catmull([
      [0, 2.02, 1.08],
      [0, 2.0, 1.22],
      [0, 1.97, 1.33],
      [0, 1.955, 1.4],
    ]),
    (t): [number, number] => [0.085 - 0.04 * t, 0.08 - 0.035 * t],
    { bone: head, color: bodyPaint },
  );
  b.sweep(
    catmull([
      [0, 1.93, 1.04],
      [0, 1.9, 1.2],
      [0, 1.88, 1.31],
    ]),
    (t): [number, number] => [0.05 - 0.02 * t, 0.032],
    { bone: jaw, color: creamPaint },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [-0.07, 0.09],
        [-0.13, 0.15, "sharp"],
        [-0.05, 0.1],
        [0.03, 0.03],
      ],
      { at: [s * 0.12, 2.0, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.022, bevel: 0.005, color: bodyPaint, bone: head },
    );
  }
  glow(b.part(new THREE.OctahedronGeometry(0.024), GEM, { bone: head, at: [0, 2.078, 1.155], flat: true }), 1.2);

  // Gold anime eyes, decals on the skull: the drawing is the right eye, mirrored for the left.
  for (const s of [1, -1]) {
    const hit = neckSurf && b.surface(skull).around([0, 2.0, 1.02]).at(s * 30, 12);
    if (!hit) throw new Error("qilin: no hit for the eye");
    glow(b.decal(skull, EYE, { at: hit, dir: [s * 0.3, 0, 1], size: [0.075, 0.1], mirror: s > 0 }), 0.9);
  }

  // Antlers: a swept beam per side, two branch tines, gold tips with a glowing gem at each end.
  for (const s of [1, -1]) {
    const beam = catmull([
      [s * 0.06, 2.1, 0.9],
      [s * 0.1, 2.24, 0.82],
      [s * 0.18, 2.36, 0.7],
      [s * 0.22, 2.48, 0.55],
      [s * 0.2, 2.56, 0.42],
    ]);
    b.sweep(beam, [0.036, 0.01], { bone: head, color: antlerPaint });
    const tine = (t0: number, d: [number, number, number]) => {
      const p = beam.at(t0);
      b.sweep(
        catmull([
          [p.x, p.y, p.z],
          [p.x + d[0] * 0.5, p.y + d[1] * 0.5 + 0.01, p.z + d[2] * 0.5],
          [p.x + d[0], p.y + d[1], p.z + d[2]],
        ]),
        [0.02, 0.006],
        { bone: head, color: antlerPaint },
      );
    };
    tine(0.38, [s * 0.05, 0.13, 0.05]);
    tine(0.7, [s * 0.12, 0.07, -0.06]);
    const tip = beam.at(1);
    glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), GEM, { bone: head, at: tip }), 1.1);
  }

  // Gold whiskers drifting back from the muzzle.
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.07, 1.99, 1.22],
        [s * 0.1, 1.97, 1.36],
        [s * 0.12, 1.94, 1.5],
        [s * 0.11, 1.9, 1.6],
      ]),
      [0.007, 0.002],
      { bone: head, color: goldPaint },
    );
  }

  // Legs: a front and a hind leg per side, each a three-segment limb ending on a hoof, with a gold cuff.
  const addLeg = (front: boolean, s: number) => {
    const sd = s > 0 ? "L" : "R";
    const pts = limb(
      front ? [s * 0.15, 1.12, 0.46] : [s * 0.15, 1.1, -0.6],
      front ? [s * 0.16, 0.03, 0.5] : [s * 0.16, 0.03, -0.64],
      [0.45, 0.44, 0.22],
      front
        ? [
            [0, 0, -1],
            [0, 0, 1],
          ]
        : [
            [0, 0, 1],
            [0, 0, -1],
          ],
    );
    const names = front
      ? [`shoulder${sd}`, `elbow${sd}`, `carpus${sd}`, `hoofF${sd}`]
      : [`hip${sd}`, `stifle${sd}`, `hock${sd}`, `hoofH${sd}`];
    const leg = b.chain(`leg${front ? "F" : "H"}${sd}`, pts, {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
    });
    b.sweep(leg, (t) => 0.07 - 0.03 * t, { color: legPaint });
    const foot = leg.joints[3];
    const end = pts[pts.length - 1];
    b.part(new THREE.CylinderGeometry(0.05, 0.058, 0.07, 8), hoofPaint, { bone: foot, at: [end.x, 0.035, end.z] });
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.014, 10), goldPaint, { bone: leg.joints[2], at: pts[2] });
  };
  for (const s of [1, -1]) {
    addLeg(true, s);
    addLeg(false, s);
  }

  // Tail: a jade tail with gold rings and a cloud tuft around its tip.
  b.sweep(tail, (t) => 0.058 - 0.026 * t, { color: bodyPaint });
  b.along(tail, 3, (at) => b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.014, 10), goldPaint, { frame: at }));
  const tuft = b.ring(tail.at(0.97), { count: 8, radius: 0.05, tilt: 25 }).items;
  b.cards(tuft, CLOUDS, { size: [0.22, 0.2], lean: 15, cross: true, vary: 0.2, rng: rng(14) });

  // Cloud mane: puffs down the top of the neck, flowing back.
  const neckHits = neckSurf.scatter(70, {
    rng: rng(11),
    minDist: 0.05,
    filter: (h) => h.at.y > 1.4 && h.n.y * 0.7 - h.n.z * 0.7 > 0.15,
  });
  b.cards(neckHits, CLOUDS, {
    size: [0.2, 0.16],
    lean: 40,
    flow: [0, 0.35, -1],
    bend: 20,
    cross: true,
    vary: 0.25,
    rng: rng(12),
  });

  // Cloud crest behind the antlers.
  const crest = [-0.07, -0.035, 0, 0.035, 0.07].map((x) =>
    frame([x, 2.06 - Math.abs(x) * 0.15, 0.9], [x * 1.4, 0.55, -1]),
  );
  b.cards(crest, CLOUDS, { size: [0.2, 0.17], lean: 28, flow: [0, 0.4, -1], bend: 20, cross: true, vary: 0.2, rng: rng(13) });

  // Cloud beard under the jaw.
  const beard = [
    [0, 1.86, 1.16],
    [0.035, 1.87, 1.2],
    [-0.035, 1.87, 1.2],
  ].map(([x, y, z]) => frame([x, y, z], [x * 2, -1, 0.3]));
  b.cards(beard, CLOUDS, { size: [0.11, 0.15], lean: 25, cross: true, rng: rng(16) });

  // A few cloud wisps lifting off the back.
  const back = b.surface(body).scatter(18, { rng: rng(15), minDist: 0.12, filter: (h) => h.n.y > 0.5 });
  b.cards(back, CLOUDS, { size: [0.16, 0.13], lean: 50, flow: [0, 0.4, -1], vary: 0.2, rng: rng(17) });

  // Gold sigils on both flanks.
  for (const s of [1, -1]) {
    const hit = b.surface(body).around([0, 1.25, -0.1]).at(s * 90, 8);
    if (!hit) throw new Error("qilin: no hit on the flank");
    b.decal(body, SIGIL, { at: hit, dir: [s, 0, 0], size: [0.22, 0.22] });
  }

  return b.root;
}
```