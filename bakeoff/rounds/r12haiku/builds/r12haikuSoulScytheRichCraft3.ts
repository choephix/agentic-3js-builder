import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  grain,
  mix,
  noise,
  paint,
  smoothstep,
  spiral,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A reaper's scythe of ivory dragonbone with a violet soul-fire edge, a dragon skull socket on a vertebra haft, gilt wire and a soul tassel.",
};

type V3 = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];

const D = Math.PI / 180;
const SOUL = "#a567ff";
const SOUL_CORE = "#7ff6ff";

// The blade is a crescent centred on C: its heel sits at HEEL degrees, its tip at TIP degrees. The cutting edge is the
// inner arc, so the concave side faces the haft.
const C: [number, number] = [-0.1, 1.2];
const R_OUT = 0.62;
const R_IN = 0.5;
const HEEL = 62;
const TIP = -14;

const polar = (r: number, deg: number): [number, number] => [
  C[0] + r * Math.cos(deg * D),
  C[1] + r * Math.sin(deg * D),
];
const arc = (r: number, from: number, to: number, n: number) =>
  Array.from({ length: n + 1 }, (_, i) => polar(r, from + ((to - from) * i) / n));
const lift = (pts: [number, number][], z = 0): V3[] => pts.map(([x, y]): V3 => [x, y, z]);

/** An outline from an outer arc and an inner arc that share their ends; the four tips stay sharp. */
function closedOutline(outer: [number, number][], inner: [number, number][]): Pt[] {
  const pts: Pt[] = [];
  for (const list of [outer, inner])
    list.forEach(([x, y], i) => pts.push(i === 0 || i === list.length - 1 ? [x, y, "sharp"] : [x, y]));
  return pts;
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

// Dragonbone: ivory with fine cracks, shaded toon-style.
const BONE = cel(
  paint((p) => {
    const cracks = 1 - smoothstep(0, 0.035, Math.abs(noise(p, 0.05, 12) - 0.5));
    const body = mix("#f4ead3", "#d5bf96", noise(p, 0.04, 4));
    return mix(body, "#8a6a92", cracks * 0.5);
  }),
);

// The blade: bone that turns violet where the soul fire has soaked it near the edge and plum toward the spine.
const BLADE = cel(
  paint((p) => {
    const d = Math.hypot(p.x - C[0], p.y - C[1]);
    const cracks = 1 - smoothstep(0, 0.03, Math.abs(noise(p, 0.035, 12) - 0.5));
    let c = mix(mix("#f4ead2", "#cdb68c", noise(p, 0.05, 6)), "#7a5a8a", cracks * 0.5);
    c = mix(c, "#7a4bd6", smoothstep(0.545, 0.505, d) * 0.85);
    c = mix(c, "#3a2a58", smoothstep(0.6, 0.625, d) * 0.7);
    return c;
  }),
);

const FULLER = cel("#4a2c78", "#24123f");
const WOOD = cel(grain("#2a1838", "#5c3c7c", { size: 0.035, axis: "y", seed: 3 }));
const CLOTH = cel("#6a33d6", "#2d1358");
const GILT = metal("gilt");

// Drawings: the soul eye, the blade rune and the tassel strands.
const EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="32" rx="30" ry="22" fill="#120820"/>
    <ellipse cx="32" cy="32" rx="20" ry="16" fill="#8e5bff"/>
    <ellipse cx="32" cy="32" rx="12" ry="12" fill="#c9b3ff"/>
    <ellipse cx="32" cy="32" rx="4" ry="12" fill="#120820"/>
    <circle cx="26" cy="25" r="2.6" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);

const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4 L54 32 L32 60 L10 32 Z" fill="none" stroke="#2a1450" stroke-width="7" stroke-linejoin="round"/>
    <path d="M32 4 L54 32 L32 60 L10 32 Z" fill="none" stroke="#c7a2ff" stroke-width="3" stroke-linejoin="round"/>
    <path d="M32 18 L32 46 M22 32 L42 32" stroke="#7ff6ff" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 32 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0 L24 0 L22 96 L10 96 Z" fill="#6a33d6"/>
    <path d="M12 4 L14 92" stroke="#c7a2ff" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M18 4 L19 92" stroke="#3a1c78" stroke-width="2"/>
    <ellipse cx="16" cy="108" rx="9" ry="9" fill="#f2c14e"/>
    <rect x="11" y="114" width="10" height="12" rx="3" fill="#d69a2d"/>
  </svg>`,
  { size: 256 },
);

// Vertebra and collar profiles (x = radius, y = height along the haft), solid from the axis out and back.
const VERT: [number, number][] = [
  [0, -0.02],
  [0.026, -0.02],
  [0.032, -0.01],
  [0.036, 0],
  [0.03, 0.012],
  [0.024, 0.02],
  [0, 0.02],
];
const COLLAR: [number, number][] = [
  [0, -0.02],
  [0.028, -0.02],
  [0.03, 0],
  [0.026, 0.02],
  [0, 0.02],
];
const FERRULE: [number, number][] = [
  [0, 0],
  [0.026, 0],
  [0.03, 0.02],
  [0.02, 0.05],
  [0.016, 0.06],
  [0, 0.06],
];

export default function build() {
  const b = createBuilder({ name: "dragonbone-soul-scythe" });
  const root = b.joint("scythe", { at: [0, 0, 0] });
  const jaw = b.joint("jaw", { parent: root, at: [0, 1.56, 0.05], aim: [0, 1.54, 0.25] });

  // The skull's snout and jaw surfaces, so teeth seat on them.
  const snoutBottom = (z: number) => {
    const t = (z - 0.03) / 0.24;
    return 1.62 + (1.58 - 1.62) * t - (0.07 + (0.045 - 0.07) * t) / 2;
  };
  const jawTop = (z: number) => {
    const t = (z - 0.05) / 0.18;
    return 1.555 + (1.535 - 1.555) * t + (0.04 + (0.03 - 0.04) * t) / 2;
  };

  // A gilt hoop round the haft.
  const hoop = (y: number, R: number, r: number) => {
    const pts: V3[] = Array.from({ length: 14 }, (_, i): V3 => {
      const a = (i / 14) * Math.PI * 2;
      return [Math.cos(a) * R, y, Math.sin(a) * R];
    });
    b.sweep(catmull(pts, { closed: true }), r, { color: GILT, sides: 6 });
  };

  // A soul flame: a curling glowing tongue that rises off the blade's spine.
  const flame = (deg: number, len: number, color: string, curl: number) => {
    const [x0, y0] = polar(R_OUT - 0.006, deg);
    const [x1, y1] = polar(R_OUT + len * 0.5, deg + curl * 0.5);
    const [x2, y2] = polar(R_OUT + len, deg + curl);
    glow(
      b.sweep(
        catmull([
          [x0, y0, 0],
          [x1, y1, 0.004],
          [x2, y2, 0],
        ]),
        [0.013, 0.002],
        { color, caps: { start: "round", end: "point" } },
      ),
      1.5,
    );
  };

  // ---- Haft: a violet shaft, a vertebra spine, a wire-bound grip and a gilt ferrule -------------------------
  b.sweep(
    [
      [0, 0.06, 0],
      [0, 1.62, 0],
    ],
    [0.017, 0.021],
    { color: WOOD },
  );
  b.sweep(
    [
      [0, 0.7, 0],
      [0, 1.05, 0],
    ],
    0.0205,
    { color: CLOTH },
  );
  b.sweep(spiral([0, 0.72, 0], [0.024, 0.72, 0], [0, 1, 0], { turns: 8, pitch: 0.04 }), 0.0055, {
    color: GILT,
    sides: 6,
  });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), GILT, { at: [0, 0.7, 0] });

  for (const y of [0.2, 0.3, 0.4, 0.5, 1.12, 1.22, 1.32, 1.42]) {
    b.lathe(VERT, { at: [0, y, 0], segments: 10, smoothing: 1, color: BONE });
    // A dorsal spine on each vertebra, raking up and back.
    b.spike([0, y + 0.012, -0.03], [0, 0.7, -0.7], 0.045, 0.009, { color: BONE });
  }
  hoop(0.14, 0.024, 0.0065);
  hoop(1.07, 0.024, 0.0065);
  b.lathe(COLLAR, { at: [0, 1.5, 0], segments: 10, color: GILT });

  b.lathe(FERRULE, { at: [0, 0.04, 0], segments: 10, color: GILT });
  b.spike([0, 0.045, 0], [0, 0, 0], null, 0.016, { color: BONE });

  // Soul tassel: fanned strands hanging from a knot under the grip.
  const strands = 7;
  const strandAngle = (i: number) => (i / strands) * Math.PI * 2 + 0.3;
  b.cards(
    Array.from({ length: strands }, (_, i) => {
      const a = strandAngle(i);
      return frame([Math.cos(a) * 0.02, 0.69, Math.sin(a) * 0.02], [0, 1, 0]);
    }),
    TASSEL,
    {
      size: [0.03, 0.15],
      lean: 180,
      flow: (_f, i): V3 => [Math.cos(strandAngle(i)), 0, Math.sin(strandAngle(i))],
    },
  );

  // ---- Skull socket: a dragon skull that clamps the blade's heel -------------------------------------------
  const CRANIUM = b.part(new THREE.SphereGeometry(0.09, 12, 9), BONE, {
    at: [0, 1.62, 0],
    scale: [1.05, 0.95, 1.2],
  });
  b.frustumBox([0, 1.62, 0.03], [0, 1.58, 0.27], [0.1, 0.07], [0.05, 0.045], { color: BONE });
  b.frustumBox([0, 1.555, 0.05], [0, 1.535, 0.23], [0.085, 0.04], [0.05, 0.03], { bone: jaw, color: BONE });

  for (const z of [0.12, 0.2])
    for (const x of [-0.03, 0.03])
      b.spike([x, snoutBottom(z) + 0.012, z], [0, -1, 0], 0.036, 0.008, { color: BONE });
  for (const z of [0.1, 0.18])
    for (const x of [-0.028, 0.028])
      b.spike([x, jawTop(z) - 0.012, z], [0, 1, 0], 0.03, 0.007, { color: BONE, bone: jaw });

  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.07, 1.66, 0],
        [s * 0.095, 1.74, -0.05],
        [s * 0.1, 1.83, -0.12],
        [s * 0.08, 1.9, -0.2],
      ],
      [0.022, 0.004],
      { color: BONE, caps: { start: "round", end: "point" } },
    );
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GILT, { at: [s * 0.08, 1.9, -0.2] });
    // Soul eyes, drawn onto the cranium so they follow its curve.
    glow(b.decal(CRANIUM, EYE, { at: [s * 0.044, 1.66, 0.085], dir: [0, 0, 1], size: [0.042, 0.03] }), 1.6);
  }

  // The gilt tang that locks the blade into the skull's jaw.
  b.sweep(
    [
      [0.06, 1.62, 0],
      [0.135, 1.64, 0],
    ],
    0.017,
    { color: GILT },
  );

  // ---- Blade: an extruded dragonbone crescent with a fuller, gilt spine and a soul-fire edge ---------------
  b.extrude(closedOutline(arc(R_OUT, HEEL, TIP, 14), arc(R_IN, TIP, HEEL, 14)), {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.024,
    bevel: 0.007,
    color: BLADE,
  });
  // The fuller: a dark inlay on the front face.
  b.extrude(closedOutline(arc(0.578, 48, 2, 8), arc(0.542, 2, 48, 8)), {
    at: [0, 0, 0.009],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.002,
    color: FULLER,
  });
  // A gilt rim along the spine.
  b.sweep(catmull(lift(arc(R_OUT + 0.001, HEEL, TIP, 14))), 0.0047, { color: GILT });

  // A rune plate on the fuller, glowing.
  const [rx, ry] = polar(0.56, 24);
  glow(
    b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
      at: [rx, ry, 0.0135],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    }),
    1.3,
  );
  for (const deg of [44, 10]) {
    const [x, y] = polar(0.56, deg);
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), GILT, { at: [x, y, 0.0135] });
  }

  // The cutting edge: a violet bead with a cyan core, glowing.
  const edge = catmull(lift(arc(R_IN, TIP, HEEL, 16)));
  glow(b.sweep(edge, 0.0105, { color: SOUL }), 1.6);
  glow(b.sweep(edge, 0.0055, { color: SOUL_CORE }), 2.2);

  // Dragonbone spurs along the spine, between the soul flames.
  for (const deg of [58, 36, 24, 2]) {
    const [x, y] = polar(R_OUT - 0.012, deg);
    b.spike([x, y, 0], [Math.cos(deg * D), Math.sin(deg * D), 0], 0.05, 0.011, { color: BONE });
  }
  flame(50, 0.09, SOUL, 10);
  flame(16, 0.08, SOUL_CORE, 12);
  flame(-6, 0.07, SOUL, 14);

  // Loose soul motes hanging in the hollow of the blade.
  for (const [deg, r] of [
    [30, 0.34],
    [12, 0.3],
    [-4, 0.32],
  ] as const) {
    const [x, y] = polar(r, deg);
    glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), SOUL, { at: [x, y, 0.02] }), 2);
  }

  return b.root;
}
