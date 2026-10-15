```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  createBuilder,
  frame,
  mix,
  noise,
  paint,
  polyline,
  rng,
  smoothstep,
  spiral,
  svg,
} from "agentic-3js-builder";
import type { Fill, Joint } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A stylized, oversized soul-reaping scythe: a dragon-spine shaft, a gilded reliquary caging a captive soul, a horned dragon skull holding a soul gem in its jaws, and a crescent blade of cracked indigo bone with a spectral edge, runes and trapped ghosts.",
};

type Vec3 = [number, number, number];
type OP = [number, number] | [number, number, "sharp"];
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const TEAL = "#46f0e0";
const TEAL_HOT = "#8ffff0";
const ICE = "#e4fffa";
const INDIGO = "#231d45";
const VIOLET = "#3d3278";
const RED = "#a3263a";
const RED_D = "#661426";
const GOLD_FLAT = "#e0b04a";
const DARK = "#0f0c18";
const CORE = "#2b2638";
const TOOTH = "#f7eed4";

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BONE = paint((p, n) => {
  const t = smoothstep(0.25, 0.75, noise(p, 0.08, 3));
  let c = mix("#e1d0aa", "#f7ecd0", t);
  c = mix(c, "#a9b3a0", smoothstep(0.1, -0.9, n.y) * 0.55);
  const cl = cells(p, 0.06, 9);
  const crack = (1 - smoothstep(0.0, 0.06, cl.d2 - cl.d1)) * smoothstep(0.45, 0.7, noise(p, 0.2, 2));
  return mix(c, "#7c694e", crack * 0.5);
});

const GILT = metal("gilt", { tarnish: 0.12, seed: 2 });

const WRAP = paint((p, n) => {
  const ang = Math.atan2(p.x, p.z) / TAU;
  const k = (((p.y - ang * 0.02) / 0.02) % 1 + 1) % 1;
  const base = mix(RED, RED_D, noise(p, 0.05, 6));
  if (k < 0.14) return mix(base, "#2a0b14", 0.8);
  return mix(base, "#e0707e", smoothstep(0.3, 0.6, k) * 0.22 * smoothstep(-0.3, 1, n.y));
});

const BLADE_A = paint((p, n) => {
  const c = cells(p, 0.075, 11);
  const e = c.d2 - c.d1;
  const base = mix(INDIGO, VIOLET, smoothstep(0.3, 0.7, noise(p, 0.12, 4)));
  const lit = mix(base, "#6656b8", smoothstep(0.2, 0.95, n.y) * 0.45);
  return mix("#6ef5e6", lit, smoothstep(0.03, 0.07, e));
});

// Blade geometry in the blade's own (u forward, v up) plane, in meters.
const cub = (p0: number[], p1: number[], p2: number[], p3: number[], t: number): [number, number] => {
  const k = 1 - t;
  const w0 = k * k * k;
  const w1 = 3 * k * k * t;
  const w2 = 3 * k * t * t;
  const w3 = t * t * t;
  return [
    w0 * p0[0] + w1 * p1[0] + w2 * p2[0] + w3 * p3[0],
    w0 * p0[1] + w1 * p1[1] + w2 * p2[1] + w3 * p3[1],
  ];
};
const N = 10;
const CO: [number, number][] = Array.from({ length: N + 1 }, (_, i) =>
  cub([-0.14, 0.07], [0.3, 0.46], [0.95, 0.4], [1.32, -0.4], i / N),
);
const CI: [number, number][] = Array.from({ length: N + 1 }, (_, i) =>
  cub([-0.14, -0.13], [0.45, 0.12], [1.0, -0.02], [1.32, -0.4], i / N),
);
const CM: [number, number][] = CO.map((o, i) => [(o[0] + CI[i][0]) / 2, (o[1] + CI[i][1]) / 2]);
const INNER_DENSE: [number, number][] = Array.from({ length: 36 }, (_, i) =>
  cub([-0.14, -0.13], [0.45, 0.12], [1.0, -0.02], [1.32, -0.4], i / 35),
);
const distInner = (u: number, v: number) => {
  let m = 1e9;
  for (const [a, c] of INNER_DENSE) {
    const d = (a - u) * (a - u) + (c - v) * (c - v);
    if (d < m) m = d;
  }
  return Math.sqrt(m);
};
const BLADE_B = paint((_p, _n, s) => {
  const d = distInner(s[0], s[1]);
  if (d < 0.014) return ICE;
  const streak = 0.5 + 0.5 * Math.sin(d * 120);
  const c = mix(mix(ICE, "#58e8dc", smoothstep(0.014, 0.08, d)), "#1a8f9a", smoothstep(0.07, 0.17, d));
  return mix(c, "#b8fff4", streak * 0.12 * (1 - smoothstep(0.02, 0.12, d)));
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const runeSvg = (glyph: string) =>
  svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="20" r="17.5" stroke="#46e0d4" stroke-width="2"/><g stroke="#aafff4" stroke-width="3.4">${glyph}</g></g></svg>`,
    { size: 160 },
  );
const RUNES = [
  runeSvg(`<path d="M20 8 V32 M20 14 L28 20 M20 24 L12 30"/>`),
  runeSvg(`<path d="M12 10 L28 10 L12 30 L28 30"/><path d="M20 10 V30"/>`),
  runeSvg(`<path d="M13 31 L20 8 L27 31 M15 22 H25"/>`),
  runeSvg(`<path d="M12 12 L28 28 M28 12 L12 28 M20 8 V32"/>`),
];

const GHOST = svg(
  `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4fffd"/><stop offset="0.55" stop-color="#8ff6ec"/><stop offset="1" stop-color="#2cc7c4"/></linearGradient></defs>
    <path d="M30 4 C46 4 54 22 54 40 C54 58 50 68 52 82 L44 74 L38 86 L30 76 L22 86 L16 74 L8 82 C10 68 6 58 6 40 C6 22 14 4 30 4Z" fill="url(#g)" stroke="#167f88" stroke-width="2.4" stroke-linejoin="round"/>
    <ellipse cx="21" cy="36" rx="4.6" ry="7.5" fill="#0b3b45"/><ellipse cx="39" cy="36" rx="4.6" ry="7.5" fill="#0b3b45"/>
    <circle cx="22.5" cy="33" r="1.6" fill="#ffffff"/><circle cx="40.5" cy="33" r="1.6" fill="#ffffff"/>
    <ellipse cx="30" cy="54" rx="4" ry="5.5" fill="#0b3b45"/>
  </svg>`,
  { size: 192 },
);

const FLAME = svg(
  `<svg viewBox="0 0 30 60" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e8fffb"/><stop offset="0.5" stop-color="#5deee0"/><stop offset="1" stop-color="#1fb7c0"/></linearGradient></defs>
    <path d="M15 2 C22 18 28 28 26 42 C25 52 20 58 15 58 C10 58 5 52 4 42 C2 28 10 20 15 2Z" fill="url(#f)"/>
    <path d="M15 22 C19 32 21 40 19 48 C18 53 16 55 15 55 C14 55 12 53 11 48 C9 40 11 32 15 22Z" fill="#f4fffd"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "dragonboneSoulScythe" });
  const R = rng(5);

  // Skeleton: a prop, so just a few joints for the head, the jaw, the blade and the cloth tails.
  const root = b.joint("scythe", { at: [0, 0.9, 0], dir: [0, 1, 0] });
  const skullJ = b.joint("skull", { parent: root, at: [0, 1.58, 0], dir: [0, 0, 1], role: "head" });
  const jawJ = b.joint("jaw", { parent: skullJ, at: [0, 1.56, -0.03], aim: [0, 1.55, 0.2], role: "jaw" });
  const bladeJ = b.joint("blade", { parent: root, at: [0, 1.76, 0], dir: [0, 0, 1] });

  // ---- helpers ------------------------------------------------------------------------------------------------
  const torus = (y: number, rad: number, tube: number, color: Fill, bone: Joint = root, seg = 10) =>
    b.part(new THREE.TorusGeometry(rad, tube, 5, seg), color, { at: [0, y, 0], dir: [0, 1, 0], axis: "z", bone });

  const vertebra = (y: number, r: number, spine: number) => {
    b.lathe(
      [
        [0, -0.028],
        [r * 0.9, -0.026],
        [r * 0.62, -0.004],
        [r * 0.62, 0.004],
        [r * 0.9, 0.026],
        [0, 0.028],
      ],
      { at: [0, y, 0], segments: 8, color: BONE, bone: root },
    );
    b.spike([0, y, -0.012], [0, 0.35, -1], spine, 0.013, { color: BONE, bone: root, sides: 6 });
    for (const s of [1, -1])
      b.spike([s * 0.026, y, 0], [s, 0.18, -0.12], 0.055, 0.01, { color: BONE, bone: root, sides: 5 });
  };

  // ---- shaft -------------------------------------------------------------------------------------------------
  b.sweep(polyline([[0, 0.1, 0], [0, 1.5, 0]]), 0.022, { color: CORE, caps: "flat", sides: 8, bone: root });

  // butt: gilt cap, a claw spike that touches the floor, and three small talons
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.048, 0.02],
      [0.04, 0.06],
      [0.03, 0.085],
      [0, 0.085],
    ],
    { at: [0, 0.12, 0], segments: 8, color: GILT, bone: root },
  );
  b.spike([0, 0.13, 0], [0, -1, 0], 0.14, 0.032, { color: BONE, bone: root, sides: 6 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + 0.5;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.spike([c * 0.035, 0.16, s * 0.035], [c * 0.7, -0.75, s * 0.7], 0.11, 0.015, { color: BONE, bone: root, sides: 5 });
  }
  torus(0.215, 0.034, 0.009, GILT);

  // lower dragon spine
  for (let i = 0; i < 8; i++) vertebra(0.26 + i * 0.047, 0.042, 0.08 + (i % 2) * 0.03);

  // grip
  torus(0.62, 0.035, 0.009, GILT);
  b.sweep(polyline([[0, 0.62, 0], [0, 0.98, 0]]), 0.031, { color: WRAP, caps: "flat", sides: 8, bone: root });
  b.sweep(spiral([0, 0.63, 0], [0.034, 0.63, 0], [0, 1, 0], { turns: 7, r1: 0.034, pitch: 0.05 }), 0.0045, {
    color: GILT,
    sides: 4,
    bone: root,
  });
  torus(0.8, 0.034, 0.007, GILT);
  torus(0.98, 0.035, 0.009, GILT);

  // upper spine
  for (let i = 0; i < 3; i++) vertebra(1.03 + i * 0.045, 0.038, 0.07 + (i % 2) * 0.025);

  // ---- soul reliquary ----------------------------------------------------------------------------------------
  const yc = 1.28;
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.054, 0.032],
      [0, 0.032],
    ],
    { at: [0, 1.192, 0], segments: 8, color: GILT, bone: root },
  );
  b.lathe(
    [
      [0, 0],
      [0.054, 0],
      [0.03, 0.032],
      [0, 0.032],
    ],
    { at: [0, 1.33, 0], segments: 8, color: GILT, bone: root },
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      catmull([
        [0.048 * c, 1.222, 0.048 * s],
        [0.07 * c, yc, 0.07 * s],
        [0.048 * c, 1.338, 0.048 * s],
      ]),
      0.0065,
      { color: GILT, sides: 5, bone: root },
    );
    b.spike([0.03 * c, 1.36, 0.03 * s], [c * 0.5, 1, s * 0.5], 0.05, 0.01, { color: BONE, bone: root, sides: 5 });
  }
  torus(yc, 0.071, 0.006, GILT, root, 12);
  glow(b.part(new THREE.IcosahedronGeometry(0.05, 1), "#63f4e4", { at: [0, yc, 0], bone: root, flat: true }), 1.8);
  glow(b.part(new THREE.IcosahedronGeometry(0.026, 0), "#ffffff", { at: [0, yc, 0], bone: root, flat: true }), 2);

  // ---- neck cuff and frill -----------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.052, 0.02],
      [0.05, 0.08],
      [0.066, 0.115],
      [0.03, 0.125],
      [0, 0.125],
    ],
    { at: [0, 1.38, 0], segments: 8, color: GILT, bone: root },
  );
  torus(1.4, 0.052, 0.008, GILT, root);
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) / 3) * 1.15;
    b.spike([Math.sin(a) * 0.04, 1.5, -0.03], [Math.sin(a) * 0.9, 0.35, -Math.cos(a)], 0.17 - Math.abs(i - 3) * 0.02, 0.018, {
      color: BONE,
      bone: skullJ,
      sides: 6,
    });
  }

  // ---- dragon skull -------------------------------------------------------------------------------------------
  b.part(new THREE.SphereGeometry(1, 8, 6), BONE, {
    at: [0, 1.605, -0.01],
    scale: [0.072, 0.066, 0.088],
    bone: skullJ,
    flat: true,
  });
  b.frustumBox([0, 1.6, 0.05], [0, 1.595, 0.215], [0.085, 0.06], [0.055, 0.04], { color: BONE, bone: skullJ });
  b.part(new THREE.SphereGeometry(0.022, 6, 5), BONE, { at: [0, 1.612, 0.205], bone: skullJ, flat: true });
  for (const s of [1, -1]) {
    // brow, nostril, socket, eye
    b.capsule([s * 0.02, 1.642, 0.065], [s * 0.074, 1.634, 0.012], 0.011, { color: BONE, bone: skullJ });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), DARK, { at: [s * 0.014, 1.616, 0.222], bone: skullJ });
    b.part(new THREE.SphereGeometry(0.024, 6, 5), DARK, { at: [s * 0.058, 1.62, 0.045], bone: skullJ });
    glow(b.part(new THREE.SphereGeometry(0.013, 6, 4), TEAL, { at: [s * 0.062, 1.622, 0.066], bone: skullJ }), 2.2);
    // horns
    b.sweep(bezier([s * 0.05, 1.645, -0.04], [s * 0.13, 1.655, -0.15], [s * 0.12, 1.79, -0.3]), [0.024, 0.0], {
      color: BONE,
      bone: skullJ,
      caps: "point",
      sides: 6,
    });
    b.sweep(bezier([s * 0.07, 1.6, -0.03], [s * 0.15, 1.58, -0.1], [s * 0.19, 1.66, -0.19]), [0.016, 0.0], {
      color: BONE,
      bone: skullJ,
      caps: "point",
      sides: 5,
    });
    b.spike([s * 0.065, 1.585, -0.03], [s * 0.8, -0.1, -0.6], 0.07, 0.014, { color: BONE, bone: skullJ, sides: 5 });
    torus(0, 0, 0, BONE); // placeholder removed below
  }
  for (let i = 0; i < 3; i++)
    b.spike([0, 1.665 - i * 0.004, 0.05 - i * 0.05], [0, 1, -0.5], 0.05 - i * 0.008, 0.012, {
      color: BONE,
      bone: skullJ,
      sides: 5,
    });

  // upper teeth
  for (const z of [0.07, 0.105, 0.14, 0.175])
    for (const s of [1, -1]) {
      const hw = 0.0425 - ((z - 0.05) / 0.165) * 0.015 - 0.006;
      b.spike([s * hw, 1.572, z], [0, -1, 0], 0.026, 0.007, { color: TOOTH, bone: skullJ, sides: 5 });
    }
  for (const s of [1, -1]) b.spike([s * 0.022, 1.575, 0.205], [0, -1, 0.15], 0.05, 0.009, { color: TOOTH, bone: skullJ, sides: 5 });

  // lower jaw (its own bone)
  b.frustumBox([0, 1.53, -0.02], [0, 1.523, 0.19], [0.075, 0.026], [0.045, 0.02], { color: BONE, bone: jawJ });
  for (const z of [0.07, 0.1, 0.13, 0.16])
    for (const s of [1, -1]) {
      const hw = 0.0375 - ((z + 0.02) / 0.21) * 0.015 - 0.014;
      b.spike([s * hw, 1.538, z], [0, 1, 0], 0.02, 0.006, { color: TOOTH, bone: jawJ, sides: 5 });
    }
  b.spike([0, 1.52, 0.18], [0, -0.8, 0.4], 0.05, 0.012, { color: BONE, bone: jawJ, sides: 5 });
  // the captured soul gem held in the jaws
  glow(b.part(new THREE.IcosahedronGeometry(0.021, 0), "#6ff7e8", { at: [0, 1.555, 0.12], bone: skullJ, flat: true }), 2.2);

  // ---- blade ----------------------------------------------------------------------------------------------------
  const B0y = 1.76;
  const B0z = -0.02;
  const BL = (u: number, v: number, x = 0): Vec3 => [x, B0y + v, B0z + u];

  // gilt mount where the blade leaves the skull
  b.lathe(
    [
      [0, 0],
      [0.054, 0],
      [0.05, 0.03],
      [0.034, 0.052],
      [0, 0.052],
    ],
    { at: [0, 1.655, -0.02], segments: 8, color: GILT, bone: skullJ },
  );

  const outlineA: OP[] = [...CO.slice(0, N), [CO[N][0], CO[N][1], "sharp"], ...CM.slice(0, N).reverse()];
  const outlineB: OP[] = [...CM.slice(0, N), [CM[N][0], CM[N][1], "sharp"], ...CI.slice(0, N).reverse()];
  b.extrude(outlineA, {
    at: [0, B0y, B0z],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.036,
    bevel: 0.008,
    color: BLADE_A,
    bone: bladeJ,
  });
  b.extrude(outlineB, {
    at: [0, B0y, B0z],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.004,
    color: BLADE_B,
    bone: bladeJ,
  });

  // gold inlay along the seam between the two bands, on both faces
  for (const s of [1, -1])
    b.sweep(catmull(CM.map(([u, v]) => BL(u, v, s * 0.0185))), (t) => 0.0048 * (1 - 0.7 * t), {
      color: GILT,
      sides: 4,
      bone: bladeJ,
      caps: "point",
    });

  // bone spine with spikes
  const spine = catmull(CO.map(([u, v]) => BL(u, v)));
  b.sweep(spine, (t) => 0.032 - 0.026 * t, { color: BONE, sides: 6, bone: bladeJ });
  [0.12, 0.26, 0.4, 0.54, 0.68, 0.82].forEach((t) => {
    const pos = spine.at(t);
    const T = spine.tangentAt(t);
    const out = new THREE.Vector3(0, T.z, -T.y).normalize();
    const dir = out.clone().addScaledVector(T, -0.5).normalize();
    const rad = 0.032 - 0.026 * t;
    const base = pos.clone().addScaledVector(out, rad * 0.5);
    b.spike(base, dir, 0.17 - 0.1 * t, 0.026 - 0.014 * t, { color: BONE, bone: bladeJ, sides: 6 });
    b.part(new THREE.SphereGeometry(rad * 0.9, 6, 5), BONE, { at: pos, bone: bladeJ, flat: true });
    b.part(new THREE.TorusGeometry(rad + 0.004, 0.005, 4, 8), GILT, {
      at: spine.at(Math.min(t + 0.045, 1)),
      dir: T,
      axis: "z",
      bone: bladeJ,
    });
  });

  // spectral edge
  const edge = catmull(CI.map(([u, v]) => BL(u, v)));
  glow(b.sweep(edge, (t) => 0.011 - 0.008 * t, { color: TEAL_HOT, sides: 5, bone: bladeJ }), 1.7);

  // soul-fire licking from the edge
  const flameFrames = Array.from({ length: 9 }, (_, i) => {
    const t = 0.1 + (i / 8) * 0.8;
    const T = edge.tangentAt(t);
    return frame(edge.at(t), [0, -T.z, T.y]);
  });
  glow(
    b.cards(flameFrames, FLAME, {
      size: [0.05, 0.1],
      lean: 25,
      bend: 20,
      flow: [0, 0, -1],
      vary: 0.35,
      rng: R,
      cross: true,
      sink: 0.3,
      bone: bladeJ,
    }),
    1.5,
  );

  // runes on both faces of the bone band
  [0.18, 0.32, 0.46, 0.6, 0.74].forEach((t, i) => {
    const k = Math.min(Math.round(t * N), N - 1);
    const uo = CO[k];
    const um = CM[k];
    const u = (uo[0] + um[0]) / 2;
    const v = (uo[1] + um[1]) / 2;
    const du = CO[k + 1][0] - CO[k][0];
    const dv = CO[k + 1][1] - CO[k][1];
    const len = Math.hypot(du, dv);
    const up: Vec3 = [0, dv / len, du / len];
    const size = 0.085 - i * 0.008;
    for (const s of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
          at: BL(u, v, s * 0.0215),
          dir: [s, 0, 0],
          axis: "z",
          up,
          texture: RUNES[i % RUNES.length],
          bone: bladeJ,
        }),
        1.4,
      );
  });

  // gilt clamp plates and gems at the blade root
  const clamp: OP[] = [
    [-0.15, -0.14],
    [0.08, -0.14],
    [0.11, -0.04, "sharp"],
    [0.06, 0.09],
    [-0.15, 0.09],
  ];
  for (const s of [1, -1]) {
    b.extrude(clamp, {
      at: [s * 0.022, B0y, B0z],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: GILT,
      bone: bladeJ,
    });
    glow(b.part(new THREE.OctahedronGeometry(0.024), TEAL, { at: BL(-0.03, -0.03, s * 0.031), bone: bladeJ, flat: true }), 1.8);
  }

  // ---- captive souls ---------------------------------------------------------------------------------------------
  const SOULS = [
    { z: 0.52, y: 1.44, s: 1 },
    { z: 0.9, y: 1.26, s: 0.78 },
    { z: 0.28, y: 1.36, s: 0.6 },
  ];
  for (const so of SOULS) {
    glow(
      b.cards([frame([0, so.y, so.z], [0, 1, 0])], GHOST, {
        size: [0.13 * so.s, 0.19 * so.s],
        lean: 0,
        flow: [1, 0, 0],
        cross: true,
        sink: 0,
        bone: bladeJ,
      }),
      1.4,
    );
    const top = new THREE.Vector3(0, so.y + 0.19 * so.s, so.z);
    const start = edge.at(edge.closestT(top));
    const ctl = new THREE.Vector3(0, (start.y + top.y) / 2 + 0.02, so.z + 0.05);
    glow(
      b.sweep(bezier(start, ctl, top), [0.006, 0.002], { color: "#6ef5e6", sides: 4, bone: bladeJ, caps: "point" }),
      1.2,
    );
  }
  for (let i = 0; i < 10; i++) {
    const so = SOULS[i % 3];
    glow(
      b.part(new THREE.OctahedronGeometry(0.008 + R() * 0.009), TEAL, {
        at: [0, so.y + 0.02 + R() * 0.25, so.z + (R() - 0.5) * 0.3],
        rotation: [R() * 90, R() * 90, R() * 90],
        bone: bladeJ,
        flat: true,
      }),
      1.6,
    );
  }

  // ---- cloth tails ------------------------------------------------------------------------------------------------
  const ribbon = (name: string, pts: Vec3[], w: number, col: string, bead: boolean) => {
    const ch = b.chain(name, catmull(pts), { parent: root, role: "tail", count: 4 });
    b.sweep(ch, (t) => [w * (1 - 0.2 * t), 0.004], {
      section: "box",
      caps: "flat",
      color: (t: number) => (t > 0.86 && t < 0.92 ? GOLD_FLAT : col),
    });
    const end = pts[pts.length - 1];
    const tail = ch.joints[ch.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.017, 6, 4), GILT, { at: [end[0], end[1] - 0.005, end[2]], bone: tail });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      b.spike(
        [end[0] + Math.cos(a) * 0.012, end[1] - 0.015, end[2] + Math.sin(a) * 0.012],
        [Math.cos(a) * 0.25, -1, Math.sin(a) * 0.25],
        0.09,
        0.0075,
        { color: col, bone: tail, sides: 4 },
      );
    }
    if (bead)
      glow(b.part(new THREE.IcosahedronGeometry(0.014, 0), "#6ff7e8", { at: [end[0], end[1] - 0.115, end[2]], bone: tail, flat: true }), 2);
  };
  ribbon("ribbonA", [[0, 0.97, 0.04], [0, 0.8, 0.078], [0, 0.62, 0.07], [0, 0.46, 0.1]], 0.032, RED, true);
  ribbon("ribbonB", [[0.012, 0.97, -0.04], [0.02, 0.84, -0.075], [0.01, 0.7, -0.07], [0.02, 0.58, -0.09]], 0.026, RED_D, false);
  // knot at the top of the grip
  b.part(new THREE.SphereGeometry(0.024, 6, 5), RED, { at: [0, 0.965, 0.03], bone: root, flat: true });

  return b.root;
}
```