```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  spiral,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  stripes,
  svg,
} from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A Shadow-Isles style reaper's scythe: a vertebra-stacked dragonbone shaft with soul-fire between the joints, a talon-and-orb butt, a snarling dragon skull holding a soul orb, and a huge cracked-bone blade with glowing runes, inlaid veins, a spiked iron-and-gilt spine and drifting spectral flames.",
};

// ------------------------------------------------------------------ palette
const TEAL = "#3df2c8";
const ABYSS = "#081013";
const TOOTH = "#f4ead0";
const SPIKE = "#ddd0ae";
const CLOTH_DARK = "#10303a";
const GOLD_DARK = "#b8862c";

// ------------------------------------------------------------------ paints
// Bone: cool violet-grey in shade, warm ivory on top, aged blotches and hairline cracks.
const BONE_P = paint((p, n) => {
  let c = mix("#7f86a8", "#e9dcbc", smoothstep(-0.9, 0.1, n.y));
  c = mix(c, "#fff4d6", 0.55 * smoothstep(0.3, 1, n.y));
  c = mix(c, "#b79f72", 0.5 * smoothstep(0.5, 0.85, noise(p, 0.07, 4)));
  const cr = cells(p, 0.14, 9);
  if (cr.d2 - cr.d1 < 0.05 && noise(p, 0.3, 2) > 0.5) c = mix(c, "#2c3946", 0.6);
  return c;
});
// Dark soul-iron with a teal sheen on upward faces.
const DARK_P = paint((p, n) => {
  const c = mix("#0c1418", "#2b4650", smoothstep(-0.6, 1, n.y));
  return mix(c, "#3a8a88", 0.35 * smoothstep(0.55, 0.8, noise(p, 0.05, 6)) * smoothstep(0, 0.8, n.y));
});
const GILT_P = metal("gilt", { tarnish: 0.14 });
const LEATHER_P = stripes("#1a1215", "#3c2a2e", { size: 0.03, axis: "y", width: 0.5, wobble: 0.15 });

// ------------------------------------------------------------------ textures
const runeSvg = (d: string) =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="#12a58c" stroke-width="11"/><path d="${d}" stroke="#bafff0" stroke-width="5"/></g></svg>`,
    { size: 128 },
  );
const RUNES = [
  runeSvg("M32 6V58M32 20L48 8M32 34L50 20M32 20L16 10"),
  runeSvg("M18 8L46 32L18 56M46 8V56"),
  runeSvg("M32 6C48 20 48 44 32 58C16 44 16 20 32 6ZM32 20V46"),
];
const FLAME = svg(
  `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#37f0c4"/><stop offset="1" stop-color="#1493a8"/></linearGradient></defs>
  <path d="M24 95C4 82 5 56 21 40C25 30 21 16 27 2C29 20 44 34 44 62C44 82 36 95 24 95Z" fill="url(#g)"/>
  <path d="M24 92C12 83 14 66 24 52C34 66 36 83 24 92Z" fill="#9dffe6"/>
  <path d="M24 88C19 82 20 74 24 68C28 74 29 82 24 88Z" fill="#f2fffb"/></svg>`,
  { size: 128 },
);
// A wisp: wide at the drawing's bottom (the root edge), curling to a tip.
const WISP = svg(
  `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 96H24C26 76 12 62 20 42C24 30 18 16 16 2C10 16 6 30 12 42C18 60 6 76 8 96Z" fill="#33e8c0"/>
  <path d="M14 96H20C21 78 14 64 18 46C20 36 17 24 16 14C13 26 12 36 14 46C17 62 11 78 14 96Z" fill="#c9fff1"/></svg>`,
  { size: 128 },
);
const BANNER = svg(
  `<svg viewBox="0 0 48 160" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 160H46V34L40 14L34 30L26 2L18 28L10 12L2 32Z" fill="#0f2c33" stroke="#d6a43c" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M7 150H41V40L36 26L30 40L24 16L18 40L12 28L7 42Z" fill="none" stroke="#2fe0b8" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M24 70L36 96L24 122L12 96Z" fill="#0a1a1e" stroke="#2fe0b8" stroke-width="1.6"/>
  <path d="M15 96Q24 86 33 96Q24 106 15 96Z" fill="#3df2c8"/>
  <ellipse cx="24" cy="96" rx="2" ry="5" fill="#06100f"/>
  <path d="M2 148H46V160H2Z" fill="#8a5f1e"/>
  <path d="M2 148H46" stroke="#e8c25a" stroke-width="1.6"/></svg>`,
  { size: 384 },
);
const SIGIL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="31" fill="#0b1a1e"/>
  <circle cx="32" cy="32" r="28" fill="none" stroke="#e4b552" stroke-width="3"/>
  <path d="M8 32Q32 8 56 32Q32 56 8 32Z" fill="#17c9a6" stroke="#9ffbe3" stroke-width="2"/>
  <ellipse cx="32" cy="32" rx="5.5" ry="12" fill="#06100f"/>
  <ellipse cx="29.5" cy="27" rx="1.8" ry="3.2" fill="#ffffff"/>
  <path d="M32 3V9M32 55V61M3 32H9M55 32H61" stroke="#e4b552" stroke-width="3"/></svg>`,
  { size: 192 },
);

// ------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "soul_scythe" });

  // Skeleton: a prop rig with a hinged jaw and a swinging charm.
  const root = b.joint("root", { at: [0, 0.95, 0], dir: [0, 1, 0] });
  const head = b.joint("head", { parent: root, at: [0, 1.9, 0], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.905, 0.06], dir: [0, 0, 1], role: "jaw" });
  const blade = b.joint("blade", { parent: root, at: [0, 2.0, 0], dir: [1, 0, 0] });
  const charm = b.joint("charm", { parent: blade, at: [-0.31, 2.0, 0], dir: [0, -1, 0] });

  // Gilt ring with a faceted profile, around the shaft.
  const band = (y: number, r: number, h: number, color: any, bone: any = root) =>
    b.lathe(
      [
        [r - 0.008, 0],
        [r + 0.006, 0],
        [r + 0.011, h / 2],
        [r + 0.006, h],
        [r - 0.008, h],
      ],
      { at: [0, y, 0], segments: 10, color, bone },
    );

  // ================================================================ claw pommel
  glow(b.part(new THREE.IcosahedronGeometry(0.042, 1), TEAL, { bone: root, at: [0, 0.105, 0], flat: true }), 1.3);
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const d = [Math.cos(a), Math.sin(a)];
    const pt = (r: number, y: number) => [d[0] * r, y, d[1] * r];
    b.sweep(bezier(pt(0.02, 0.27), pt(0.115, 0.22), pt(0.1, 0.08), pt(0.05, 0.002)), [0.021, 0], {
      color: BONE_P,
      bone: root,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
  }
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.058, 0.02],
      [0.05, 0.07],
      [0.034, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0.22, 0], segments: 10, color: GILT_P, bone: root },
  );

  // ================================================================ core and grip
  b.rod([0, 0.3, 0], [0, 1.86, 0], 0.023, DARK_P, { bone: root, sides: 8 });
  b.rod([0, 0.31, 0], [0, 0.77, 0], 0.029, LEATHER_P, { bone: root, sides: 8 });
  b.sweep(spiral([0, 0.33, 0], [0.031, 0.33, 0], [0, 1, 0], { turns: 10.5, pitch: 0.04 }), 0.0055, {
    color: GOLD_DARK,
    bone: root,
    sides: 5,
  });
  for (const y of [0.31, 0.53]) band(y, 0.03, 0.02, GILT_P);

  // ================================================================ vertebra shaft
  const NV = 11;
  const V0 = 0.84;
  const VS = 0.092;
  const vProfile = [
    [0, -0.04],
    [0.05, -0.04],
    [0.058, -0.028],
    [0.036, -0.012],
    [0.036, 0.012],
    [0.058, 0.028],
    [0.05, 0.04],
    [0, 0.04],
  ];
  for (let i = 0; i < NV; i++) {
    const y = V0 + i * VS;
    const k = 1 - i * 0.025;
    b.lathe(vProfile.map(([x, yy]) => [x * k, yy]) as [number, number][], {
      at: [0, y, 0],
      segments: 8,
      color: BONE_P,
      bone: root,
    });
    // dorsal hook spine (back), side transverse processes, small ventral spur (front)
    b.spike([0, y + 0.005, -0.03 * k], [0, 0.45, -1], (i % 2 ? 0.11 : 0.075) * k, 0.015, {
      color: SPIKE,
      bone: root,
      sides: 5,
    });
    for (const s of [1, -1])
      b.spike([s * 0.04 * k, y, 0], [s, -0.3, 0], 0.065 * k, 0.013, { color: SPIKE, bone: root, sides: 5 });
    b.spike([0, y, 0.04 * k], [0, -0.3, 1], 0.035 * k, 0.01, { color: SPIKE, bone: root, sides: 4 });
    // soul-fire between the joints
    if (i < NV - 1)
      glow(
        b.part(new THREE.CylinderGeometry(0.041 * k, 0.041 * k, 0.014, 8), TEAL, {
          bone: root,
          at: [0, y + VS / 2, 0],
        }),
        1.2,
      );
  }
  band(0.765, 0.036, 0.022, CLOTH_DARK);
  band(1.8, 0.032, 0.02, GILT_P);

  // collar cup under the skull, with a sigil medallion
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.06, 0.025],
      [0.08, 0.06],
      [0.07, 0.075],
      [0, 0.075],
    ],
    { at: [0, 1.8, 0], segments: 10, color: GILT_P, bone: root },
  );
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), GILT_P, {
    bone: root,
    at: [0, 1.84, 0.07],
    dir: [0, 0, 1],
  });
  glow(
    b.part(new THREE.CircleGeometry(0.033, 16), "#ffffff", {
      bone: root,
      at: [0, 1.84, 0.0775],
      dir: [0, 0, 1],
      axis: "z",
      texture: SIGIL,
    }),
    0.8,
  );

  // ================================================================ dragon skull
  const SK = BONE_P;
  b.part(new THREE.SphereGeometry(1, 10, 8), SK, { bone: head, at: [0, 1.955, 0], scale: [0.078, 0.066, 0.098] });
  b.part(new THREE.BoxGeometry(0.1, 0.07, 0.07), SK, { bone: head, at: [0, 1.915, -0.04] });

  // upper jaw, tapered
  const upC = (z: number) => 1.945 - ((z - 0.06) / 0.215) * 0.02;
  const upH = (z: number) => 0.088 - ((z - 0.06) / 0.215) * 0.042;
  const upW = (z: number) => 0.105 - ((z - 0.06) / 0.215) * 0.049;
  b.frustumBox([0, 1.945, 0.06], [0, 1.925, 0.275], [0.105, 0.088], [0.056, 0.046], { color: SK, bone: head });
  b.spike([0, 1.947, 0.225], [0, 1, 0.7], 0.055, 0.013, { color: SPIKE, bone: head, sides: 5 });
  for (let i = 0; i < 6; i++) {
    const z = 0.1 + i * 0.03;
    for (const s of [1, -1])
      b.spike([s * (upW(z) / 2 - 0.007), upC(z) - upH(z) / 2 + 0.004, z], [0, -1, 0], 0.022, 0.0065, {
        color: TOOTH,
        bone: head,
        sides: 4,
      });
  }
  for (const s of [1, -1]) {
    b.spike([s * 0.016, upC(0.262) - upH(0.262) / 2 + 0.004, 0.262], [0, -1, 0.1], 0.05, 0.01, {
      color: TOOTH,
      bone: head,
      sides: 5,
    });
    // nostrils, brows, sockets, eyes
    b.part(new THREE.SphereGeometry(0.007, 6, 4), ABYSS, { bone: head, at: [s * 0.017, 1.938, 0.268] });
    b.part(new THREE.BoxGeometry(0.058, 0.016, 0.085), SK, {
      bone: head,
      at: [s * 0.052, 1.99, 0.06],
      rotation: [8, 0, -s * 22],
    });
    b.spike([s * 0.07, 1.975, 0.035], [s, 0.3, -0.4], 0.06, 0.013, { color: SPIKE, bone: head, sides: 5 });
    b.part(new THREE.SphereGeometry(0.024, 8, 6), ABYSS, {
      bone: head,
      at: [s * 0.057, 1.955, 0.07],
      scale: [0.8, 1, 1.1],
    });
    glow(b.part(new THREE.SphereGeometry(0.012, 6, 5), TEAL, { bone: head, at: [s * 0.064, 1.957, 0.082] }), 1.7);
    // cheek plate
    b.part(new THREE.BoxGeometry(0.012, 0.04, 0.09), SK, {
      bone: head,
      at: [s * 0.054, 1.925, 0.09],
      rotation: [0, s * 6, 0],
    });
    // trailing eye-wisp
    glow(
      b.cards([frame([s * 0.064, 1.96, 0.075], [s * 0.15, 0.25, -1])], WISP, {
        size: [0.035, 0.15],
        lean: 10,
        flow: [0, 1, 0],
        bend: 25,
        cross: true,
        bone: head,
      }),
      1.2,
    );
    // swept-back horns with glowing tips
    b.sweep(
      bezier([s * 0.05, 1.99, -0.03], [s * 0.1, 2.03, -0.12], [s * 0.14, 1.99, -0.26], [s * 0.15, 1.89, -0.36]),
      [0.032, 0],
      {
        color: BONE_P,
        bands: [
          [0.72, BONE_P],
          [1, "#3ad9b2"],
        ],
        bone: head,
        sides: 6,
        caps: { start: "flat", end: "point" },
      },
    );
    b.sweep(bezier([s * 0.06, 1.95, -0.02], [s * 0.12, 1.93, -0.07], [s * 0.16, 1.87, -0.1]), [0.02, 0], {
      color: BONE_P,
      bone: head,
      sides: 5,
      caps: { start: "flat", end: "point" },
    });
    // glowing ear-fin
    glow(
      b.extrude(
        [
          [0, 0.03],
          [0.1, 0.07, "sharp"],
          [0.06, 0.02],
          [0.19, 0.0, "sharp"],
          [0.08, -0.02],
          [0.14, -0.07, "sharp"],
          [0, -0.035],
        ],
        { at: [s * 0.068, 1.92, -0.03], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.008, color: "#1fbfa4", bone: head },
      ),
      0.6,
    );
  }
  glow(b.part(new THREE.OctahedronGeometry(0.018, 0), TEAL, { bone: head, at: [0, 2.0, 0.062], scale: [1, 1.4, 0.8] }), 1.5);

  // lower jaw on its own joint
  const loC = (z: number) => 1.893 - ((z - 0.065) / 0.195) * 0.007;
  const loH = (z: number) => 0.03 - ((z - 0.065) / 0.195) * 0.006;
  b.frustumBox([0, 1.893, 0.065], [0, 1.886, 0.26], [0.088, 0.03], [0.05, 0.024], { color: SK, bone: jaw });
  b.spike([0, 1.875, 0.25], [0, -0.6, 1], 0.045, 0.012, { color: SPIKE, bone: jaw, sides: 5 });
  for (let i = 0; i < 5; i++) {
    const z = 0.11 + i * 0.03;
    for (const s of [1, -1])
      b.spike([s * 0.02, loC(z) + loH(z) / 2 - 0.004, z], [0, 1, 0], 0.02, 0.006, {
        color: TOOTH,
        bone: jaw,
        sides: 4,
      });
  }
  for (const s of [1, -1]) {
    b.spike([s * 0.018, loC(0.25) + loH(0.25) / 2 - 0.004, 0.25], [0, 1, 0.1], 0.036, 0.008, {
      color: TOOTH,
      bone: jaw,
      sides: 5,
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), SK, { bone: jaw, at: [s * 0.05, 1.9, 0.06] });
    b.spike([s * 0.05, 1.895, 0.06], [s, -0.2, -1], 0.08, 0.014, { color: SPIKE, bone: jaw, sides: 5 });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 22 });
  // the captured soul between the open jaws
  glow(b.part(new THREE.IcosahedronGeometry(0.027, 1), TEAL, { bone: head, at: [0, 1.88, 0.165], flat: true }), 1.8);

  // ================================================================ the blade
  const bladeC = bezier([0, 2.0, 0], [0.34, 2.32, 0], [0.92, 2.24, 0], [1.07, 1.62, 0]);
  const halfW = (t: number) =>
    (0.07 + 0.085 * Math.sin((Math.min(t / 0.42, 1) * Math.PI) / 2)) * (1 - Math.pow(t, 1.8));
  const bladeFrame = (t: number) => {
    const c = bladeC.at(t);
    const T = bladeC.tangentAt(t);
    const l = Math.hypot(T.x, T.y);
    return { cx: c.x, cy: c.y, tx: T.x / l, ty: T.y / l, nx: -T.y / l, ny: T.x / l };
  };
  const edgePt = (t: number, side: 1 | -1) => {
    const f = bladeFrame(t);
    const o = side > 0 ? 1.1 * halfW(t) : -0.9 * halfW(t);
    return [f.cx + f.nx * o, f.cy + f.ny * o];
  };
  const NB = 18;
  const ts = Array.from({ length: NB + 1 }, (_, i) => (i / NB) * 0.965);
  const tip = bladeC.at(1);
  const outline = [
    ...ts.map((t) => edgePt(t, 1)),
    [tip.x, tip.y, "sharp"],
    ...ts
      .slice()
      .reverse()
      .map((t) => edgePt(t, -1)),
  ];
  b.extrude(outline as any, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    bevel: 0.012,
    color: BONE_P,
    bone: blade,
  });

  const edge3 = (t0: number, t1: number, n: number, side: 1 | -1) =>
    Array.from({ length: n }, (_, i) => {
      const [x, y] = edgePt(t0 + ((t1 - t0) * i) / (n - 1), side);
      return [x, y, 0];
    });
  // glowing cutting edge
  glow(
    b.sweep(catmull(edge3(0.03, 0.965, 16, -1)), (t: number) => 0.016 * (1 - t) + 0.004, {
      color: TEAL,
      bone: blade,
      sides: 6,
    }),
    1.4,
  );
  // iron spine along the back with gilt rivets
  const trim = catmull(edge3(0.05, 0.965, 14, 1));
  b.sweep(trim, (t: number) => 0.027 * (1 - t) + 0.011, { color: DARK_P, bone: blade, sides: 6 });
  b.along(trim, 8, (p: any) => {
    const rr = 0.027 * (1 - p.t) + 0.011;
    b.part(new THREE.IcosahedronGeometry(1, 0), GILT_P, { at: p, bone: blade, scale: [rr * 1.15, rr * 1.15, rr * 1.15], flat: true });
  });
  // dragon-spine spikes
  [0.2, 0.33, 0.46, 0.59, 0.72].forEach((t, i) => {
    const f = bladeFrame(t);
    const w = halfW(t) * 1.1;
    b.spike(
      [f.cx + f.nx * w * 0.9, f.cy + f.ny * w * 0.9, 0],
      [f.nx * 0.8 + f.tx * 0.45, f.ny * 0.8 + f.ty * 0.45, 0],
      0.15 - 0.02 * i,
      0.026 - 0.003 * i,
      { color: BONE_P, bone: blade, sides: 5 },
    );
  });

  // inlaid veins and runes, both faces
  const lanePts = (t0: number, t1: number, n: number, off: number, z: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = t0 + ((t1 - t0) * i) / (n - 1);
      const f = bladeFrame(t);
      const o = off * halfW(t);
      return [f.cx + f.nx * o, f.cy + f.ny * o, z];
    });
  for (const z of [0.0238, -0.0238]) {
    glow(b.sweep(catmull(lanePts(0.1, 0.85, 10, 0.62, z)), [0.0055, 0.0025], { color: TEAL, bone: blade, sides: 5 }), 1.3);
    glow(b.sweep(catmull(lanePts(0.14, 0.8, 9, -0.55, z)), [0.0055, 0.0025], { color: TEAL, bone: blade, sides: 5 }), 1.3);
  }
  for (const sgn of [1, -1])
    [0.16, 0.28, 0.4, 0.52, 0.64, 0.76].forEach((t, i) => {
      const f = bladeFrame(t);
      const size = 0.078 - 0.008 * i;
      glow(
        b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
          bone: blade,
          at: [f.cx, f.cy, sgn * 0.0262],
          dir: [0, 0, sgn],
          axis: "z",
          up: [f.tx, f.ty, 0],
          texture: RUNES[(i + (sgn > 0 ? 0 : 1)) % 3],
        }),
        1.2,
      );
    });

  // gilt clamps with soul-gems where the blade enters the skull
  [0.07, 0.16].forEach((t) => {
    const f = bladeFrame(t);
    const w = halfW(t);
    const cx = f.cx + f.nx * 0.1 * w;
    const cy = f.cy + f.ny * 0.1 * w;
    b.part(new THREE.BoxGeometry(t < 0.1 ? 0.06 : 0.04, w * 2 + 0.05, 0.07), GILT_P, {
      bone: blade,
      at: [cx, cy, 0],
      dir: [f.nx, f.ny, 0],
    });
    if (t < 0.1)
      for (const sgn of [1, -1])
        glow(
          b.part(new THREE.OctahedronGeometry(0.02, 0), TEAL, {
            bone: blade,
            at: [cx, cy, sgn * 0.04],
            scale: [1, 1, 0.7],
          }),
          1.4,
        );
  });

  // counter-hook with a hanging soul-charm
  b.sweep(bezier([-0.02, 2.0, 0], [-0.13, 2.12, 0], [-0.24, 2.14, 0], [-0.31, 2.0, 0]), [0.036, 0], {
    color: BONE_P,
    bands: [
      [0.72, BONE_P],
      [1, "#3ad9b2"],
    ],
    bone: blade,
    sides: 6,
    caps: { start: "flat", end: "point" },
  });
  for (let j = 0; j < 7; j++)
    b.part(new THREE.TorusGeometry(0.014, 0.0045, 5, 8), GILT_P, {
      bone: charm,
      at: [-0.31, 1.985 - j * 0.034, 0],
      scale: [0.75, 1.25, 1],
      rotation: [0, (j % 2) * 90, 0],
    });
  glow(
    b.part(new THREE.OctahedronGeometry(0.032, 0), TEAL, { bone: charm, at: [-0.31, 1.717, 0], scale: [1, 1.5, 1] }),
    1.6,
  );
  const dirs = [[1, 0, 0], [0, 0, 1], [-1, 0, 0]];
  glow(
    b.cards(
      [-0.012, 0, 0.012].map((dx) => frame([-0.31 + dx, 1.685, 0], [0, 1, 0])),
      WISP,
      { size: [0.035, 0.14], lean: 180, flow: (_f: any, i: number) => dirs[i], vary: 0.2, rng: rng(21), bone: charm },
    ),
    1.2,
  );

  // spectral flames drifting off the back edge, souls dripping from the cutting edge
  const flameFrames = [0.1, 0.2, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9].map((t) => {
    const f = bladeFrame(t);
    const [x, y] = edgePt(t, 1);
    return frame([x, y, 0], [f.nx - f.tx * 0.2, f.ny - f.ty * 0.2, 0]);
  });
  glow(
    b.cards(flameFrames, FLAME, {
      size: [0.08, 0.17],
      lean: 10,
      flow: [0, 0, 1],
      bend: 20,
      cross: true,
      vary: 0.3,
      spin: 10,
      rng: rng(5),
      bone: blade,
    }),
    1.1,
  );
  const dripFrames = [0.3, 0.5, 0.7, 0.88].map((t) => {
    const [x, y] = edgePt(t, -1);
    return frame([x, y, 0], [0, 1, 0]);
  });
  glow(
    b.cards(dripFrames, WISP, {
      size: [0.035, 0.11],
      lean: 180,
      flow: [0, 0, 1],
      vary: 0.3,
      rng: rng(9),
      bone: blade,
      sink: 0,
    }),
    1.2,
  );

  // ================================================================ tattered sash
  const sashY = 0.775;
  [0, 72, 144, 216, 288].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const len = [0.5, 0.34, 0.42, 0.38, 0.46][i];
    b.cards([frame([dx * 0.04, sashY, dz * 0.04], [0, 1, 0])], BANNER, {
      size: [len * 0.3, len],
      lean: 180,
      flow: [dx, 0, dz],
      bone: root,
      sink: 0,
    });
  });

  return b.root;
}
```