import * as THREE from "three";
import {
  catmull,
  createBuilder,
  DEG,
  frame,
  grain,
  mix,
  noise,
  paint,
  rng,
  smoothstep,
  spiral,
  svg,
} from "../../../../src/index";
import type { Rgb } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-forged battle axe",
  description:
    "A great frost-forged battle axe: a slate-blue haft wrapped in violet leather and gold, a crescent bit with a glowing cutting edge, a frost gem set in a gold sigil, and crystal spikes growing off the blade.",
};

const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------------------------
// Palette. Glowing parts use flat colours (a glowing part cannot be painted); everything else is cel-shaded.

const GLOW = "#9ff6ff"; // frost that emits
const CORE = "#eafeff"; // the gem's heart
const GOLD = cel("#f6cd62", "#8a5a1a");
const GRIP = cel("#5b2d8c", "#22113a");
const RIBBON = cel("#8a2fa0", "#2a0f3e");
const HAFT = cel(grain("#2b3d6b", "#5b78a8", { size: 0.035, axis: "y" }), "#141d38");
const ICE = cel("#bff8ff", "#2a6cb3");

// The bit and the flat of the head: a steel-to-frost gradient, crackled with ice, with a white cutting edge.
const HEAD = cel(
  paint((p, n, s) => {
    const [x, y] = s;
    if (Math.abs(n.z) < 0.5) {
      // Walls: the cutting edge is bright, the rest is dark navy steel.
      if (n.x > 0.4 && x > 0.2) return "#f2feff";
      return mix("#1a2748", "#3e62a0", smoothstep(0.9, 1.25, y));
    }
    let c: Rgb = mix("#2a4a80", "#bdeeff", smoothstep(0.95, 1.28, y));
    c = mix(c, "#f5feff", smoothstep(0.6, 0.8, noise(p, 0.035, 4)) * 0.85);
    c = mix(c, "#1e3462", smoothstep(1.0, 0.92, y) * 0.6);
    if (x > 0.24) c = mix(c, "#ffffff", smoothstep(0.24, 0.3, x));
    return c;
  }),
);

// ---------------------------------------------------------------------------------------------------------------
// Drawings

type Pt = [number, number] | [number, number, "sharp"];

// The head in its own plane: x outward from the haft, y up. The bit curls out on the model's left (+X); the short
// hooked spike is on the right (-X).
const BLADE: Pt[] = [
  [0.02, 1.25],
  [0.09, 1.3],
  [0.17, 1.31],
  [0.23, 1.27, "sharp"],
  [0.29, 1.19],
  [0.33, 1.08],
  [0.31, 0.99],
  [0.25, 0.92],
  [0.18, 0.885, "sharp"],
  [0.12, 0.93],
  [0.05, 0.97],
  [0.0, 0.99],
  [-0.05, 1.0],
  [-0.08, 1.05, "sharp"],
  [-0.05, 1.17],
  [-0.02, 1.22],
  [-0.03, 1.25],
];

// The outer curve of the bit, traced for the glowing cutting edge.
const BIT_EDGE: number[][] = [
  [0.23, 1.27],
  [0.29, 1.19],
  [0.33, 1.08],
  [0.31, 0.99],
  [0.25, 0.92],
  [0.18, 0.885],
].map(([x, y]) => [x + 0.004, y, 0]);

/** A gold sigil with six frost spokes, barbed, ringed and tipped in ice. Drawn in colour, so it shows as drawn. */
function sigilTexture() {
  const spokes: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = k * 60 * DEG;
    const tip = [50 + Math.sin(a) * 36, 50 - Math.cos(a) * 36];
    const mid = [50 + Math.sin(a) * 21, 50 - Math.cos(a) * 21];
    const barbL = [50 + Math.sin(a - 0.75) * 13, 50 - Math.cos(a - 0.75) * 13];
    const barbR = [50 + Math.sin(a + 0.75) * 13, 50 - Math.cos(a + 0.75) * 13];
    const d = `M50 50 L${tip[0]} ${tip[1]}`;
    spokes.push(
      `<path d="${d}" stroke="#4a2c08" stroke-width="7" stroke-linecap="round"/>`,
      `<path d="${d}" stroke="#f4c85c" stroke-width="3.4" stroke-linecap="round"/>`,
      `<path d="M${mid[0]} ${mid[1]} L${barbL[0]} ${barbL[1]} M${mid[0]} ${mid[1]} L${barbR[0]} ${barbR[1]}" stroke="#f4c85c" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
      `<circle cx="${tip[0]}" cy="${tip[1]}" r="3.6" fill="#9ff6ff" stroke="#1d3558" stroke-width="1.4"/>`,
    );
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#4a2c08" stroke-width="7"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#f4c85c" stroke-width="3.6"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#1d3558" stroke-width="1.6"/>
      ${spokes.join("")}
      <circle cx="50" cy="50" r="6" fill="#f4c85c" stroke="#4a2c08" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );
}

/** A four-point frost sparkle. */
function sparkleTexture() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 0 Q36 28 64 32 Q36 36 32 64 Q28 36 0 32 Q28 28 32 0Z" fill="#e8fdff"/>
      <path d="M32 9 Q34 30 55 32 Q34 34 32 55 Q30 34 9 32 Q30 30 32 9Z" fill="#7fe9ff"/>
      <circle cx="32" cy="32" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
}

/** A closed ring of points round the haft at height y: for gold hoops. */
function hoop(y: number, r: number) {
  const pts: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    pts.push([Math.sin(a) * r, y, Math.cos(a) * r]);
  }
  return catmull(pts, { closed: true });
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "frost-axe" });
  const haft = b.joint("haft", { at: [0, 0, 0], dir: [0, 1, 0] });
  const rand = rng(11);

  // Butt: a gold pommel with a frost spike dropping to the floor.
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.034, 0.012],
      [0.024, 0.026],
      [0.024, 0.05],
      [0.032, 0.066],
      [0, 0.074],
    ],
    { at: [0, 0.03, 0], axis: [0, 1, 0], segments: 12, color: GOLD, bone: haft },
  );
  glow(b.spike([0, 0.036, 0], [0, 0, 0], null, 0.03, { color: GLOW }), 1.1);

  // Haft: a slate-blue shaft, a violet leather grip, gold hoops and a spiral gold wrap.
  const shaft = b.rod([0, 0.06, 0], [0, 1.24, 0], [0.022, 0.019], { color: HAFT, bone: haft });
  b.rod([0, 0.2, 0], [0, 0.56, 0], 0.027, { color: GRIP, bone: haft });
  for (const y of [0.2, 0.56]) b.sweep(hoop(y, 0.028), 0.0065, { color: GOLD });
  b.sweep(spiral([0, 0.2, 0], [0.031, 0.2, 0], [0, 1, 0], { turns: 6, pitch: 0.06 }), 0.0055, { color: GOLD });

  // A violet ribbon hangs from the grip, down the back, to a gold bead.
  const ribbon = catmull([
    [0, 0.22, -0.027],
    [0.02, 0.14, -0.031],
    [0.01, 0.07, -0.035],
    [0.028, 0.04, -0.04],
  ]);
  b.sweep(ribbon, [0.011, 0.005], { color: RIBBON, bone: haft });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), GOLD, { bone: haft, at: [0.028, 0.03, -0.04] });

  // Gold collar where the head meets the haft.
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.037, 0.01],
      [0.03, 0.022],
      [0.03, 0.06],
      [0, 0.06],
    ],
    { at: [0, 0.92, 0], axis: [0, 1, 0], segments: 12, color: GOLD, bone: haft },
  );

  // Frost clusters on the haft, grown straight out of the wood.
  const stem = b.surface(shaft);
  const clusters: [number, number][] = [
    [30, 0.74],
    [150, 0.8],
    [265, 0.7],
  ];
  for (const [deg, y] of clusters) {
    const a = deg * DEG;
    const hit = stem.nearest([Math.sin(a) * 0.05, y, Math.cos(a) * 0.05]);
    glow(b.spike(hit, hit, 0.05, 0.011, { color: GLOW }), 1.1);
  }

  // The head: one extruded crescent, with the haft running through it.
  const head = b.extrude(BLADE, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.046,
    bevel: 0.008,
    smoothing: 1,
    color: HEAD,
    bone: haft,
  });

  // The glowing cutting edge: a bead of frost running down the outer curve of the bit.
  glow(b.sweep(catmull(BIT_EDGE), 0.005, { color: GLOW }), 1.4);

  // The sigil on both faces. The front one sits under the gem.
  const SIGIL = sigilTexture();
  b.part(new THREE.PlaneGeometry(0.19, 0.19), "#ffffff", {
    bone: haft,
    at: [0.05, 1.12, 0.0275],
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGIL,
  });
  b.part(new THREE.PlaneGeometry(0.19, 0.19), "#ffffff", {
    bone: haft,
    at: [0.05, 1.12, -0.0275],
    dir: [0, 0, -1],
    axis: "z",
    texture: SIGIL,
  });

  // The frost gem: a hexagonal glowing core standing proud of the face.
  const GEM = [0.03, 1.12, 0.018];
  glow(
    b.lathe(
      [
        [0, -0.026],
        [0.02, -0.014],
        [0.032, 0],
        [0.02, 0.014],
        [0, 0.028],
      ],
      { at: GEM, axis: [0, 0, 1], segments: 6, color: CORE, bone: haft },
    ),
    1.8,
  );
  // Ice thorns leaning forward round the gem.
  b.ring(frame(GEM, [0, 0, 1]), { count: 8, radius: 0.046, tilt: 50 }, (item) => {
    b.spike(item, item, 0.028, 0.008, { color: ICE });
  });

  // Frost shards growing off the cutting edge.
  const edge = b.surface(head);
  for (const hit of edge.scatter(12, {
    rng: rand,
    minDist: 0.05,
    filter: (c) => c.n.x > 0.55 && c.at.x > 0.2,
  })) {
    const len = 0.045 + rand() * 0.04;
    glow(b.spike(hit, hit, len, 0.011 + rand() * 0.008, { color: GLOW }), 1.3);
  }

  // The crown: a tall glowing crystal over the top horn, with two smaller ones beside it.
  glow(b.spike([0.02, 1.26, 0], [0.07, 1, 0], 0.17, 0.03, { color: GLOW }), 1.2);
  b.spike([0.12, 1.27, 0], [0.42, 1, 0], 0.1, 0.02, { color: ICE });
  b.spike([-0.04, 1.25, 0], [-0.4, 1, 0], 0.12, 0.022, { color: ICE });

  // The hooked back spike.
  b.spike([-0.05, 1.1, 0], [-1, 0.12, 0], 0.11, 0.026, { color: ICE });

  // Sparkles of frost drifting off the blade.
  const SPARK = sparkleTexture();
  const SPARKS: [number, number, number, number][] = [
    [0.4, 1.24, 0.07, 0.05],
    [0.44, 1.02, -0.06, 0.035],
    [0.34, 0.86, 0.09, 0.04],
    [0.12, 1.38, 0.05, 0.03],
    [-0.2, 1.16, 0.05, 0.04],
  ];
  for (const [x, y, z, size] of SPARKS) {
    glow(
      b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
        bone: haft,
        at: [x, y, z],
        dir: [0, 0, 1],
        axis: "z",
        texture: SPARK,
      }),
      1.5,
    );
  }

  return b.root;
}
