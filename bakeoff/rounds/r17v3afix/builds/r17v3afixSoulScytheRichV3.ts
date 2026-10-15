import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { cells, countershade, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A greatscythe on a claw-footed rune plinth: a dragon-spine shaft with glowing soul-fire between its vertebrae, a horned dragon skull holding a captured soul, and a crescent blade ribbed like a wing finger with a spectral cutting edge.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BONE_L = "#f3e9d0";
const BONE_M = "#dccb9f";
const BONE_D = "#a98f63";
const BONE_X = "#6e5638";
const TOOTH = "#fbf5e3";
const IRON = "#241c36";
const IRON_L = "#3d3158";
const IRON_HI = "#5d4d8a";
const GOLD = "#e6b44c";
const GOLD_D = "#a97a26";
const TEAL = "#37f2cf";
const TEAL_HOT = "#d2fff6";
const TEAL_D = "#0e7f84";
const INDIGO = "#1b1442";
const LEATHER = "#34213f";
const LEATHER_L = "#5b3a62";
const STONE = "#2b2545";
const STONE_L = "#46406a";
const NAIL = "#3a2b4c";
const SOCKET = "#150e1f";

// Shaft centre is shifted left so the crescent blade balances the model on x = 0.
const X0 = -0.4;
const W = (x: number, y: number, z = 0): P3 => [x + X0, y, z];

// The skull's own frame: x left, y up, z forward, pitched a little toward the viewer.
const SKO = new THREE.Vector3(X0, 1.99, 0.02);
const qSk = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 12 * DEG);
const SK = (x: number, y: number, z: number): P3 => {
  const v = new THREE.Vector3(x, y, z).applyQuaternion(qSk).add(SKO);
  return [v.x, v.y, v.z];
};
const SD = (x: number, y: number, z: number): P3 => {
  const v = new THREE.Vector3(x, y, z).applyQuaternion(qSk);
  return [v.x, v.y, v.z];
};

const strokeSvg = (inner: string, size = 128) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="none" stroke="#6bffe4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`,
    { size },
  );

const GLYPHS = [
  `<path d="M32 6V58M16 20L32 33L48 20M18 48L32 38L46 48"/>`,
  `<circle cx="32" cy="32" r="17"/><path d="M32 6V58M6 32H58"/>`,
  `<path d="M12 56L32 8L52 56M20 40H44"/>`,
  `<path d="M16 10H48L16 54H48"/><circle cx="32" cy="32" r="3"/>`,
];

const glyphPath = [
  "M0 -4V4M-3 -2L0 0L3 -2",
  "M-3 4L0 -4L3 4M-2 1H2",
  "M-3 -4H3L-3 4H3",
  "M0 -4L3 0L0 4L-3 0Z",
  "M-3 -4V4M3 -4V4M-3 0H3",
];

export default function build() {
  const b = createBuilder({ name: "soulScythe", paintSize: 2048 });
  const R = rng(11);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: root on the plinth, shaft, the skull and its jaw, and a hanging charm chain.
  const base = b.joint("base", { at: [X0, 0, 0] });
  const shaft = b.joint("shaft", { parent: base, at: W(0, 0.17), dir: [0, 1, 0] });
  const head = b.joint("head", { parent: shaft, at: SK(0, -0.035, -0.01), aim: SK(0, -0.03, 0.3), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: SK(0, -0.03, 0.04), aim: SK(0, -0.045, 0.3), role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const boneP = countershade(mottle(BONE_L, BONE_M, { size: 0.09, contrast: 1.3, seed: 3 }), BONE_D, {
    level: -0.2,
    soft: 0.55,
  });
  const boneDark = countershade(mottle(BONE_M, BONE_D, { size: 0.07, contrast: 1.2, seed: 8 }), BONE_X, {
    level: -0.15,
    soft: 0.6,
  });
  const hornP = paint((_p, _n, s) => ((s[0] * 15) % 1 < 0.13 ? BONE_X : boneDark));
  const spineP = paint((_p, _n, s) => ((s[0] * 38) % 1 < 0.07 ? "#7a6240" : boneP));
  const gripP = paint((p, _n, s) => {
    const k = (((s[1] - 8640 * s[0]) % 360) + 360) % 360;
    const grain = noise(p, 0.03, 4);
    if (k < 34) return TEAL_D;
    return mix(k < 175 ? LEATHER_L : LEATHER, "#1f1229", grain * 0.5);
  });
  const stoneBase = mottle(STONE, STONE_L, { size: 0.16, contrast: 1.3, seed: 6 });
  const stoneP = paint((p, n) => {
    const c = cells(p, 0.15, 4);
    if (c.d2 - c.d1 < 0.022) return "#0d0919";
    return n.y > 0.5 ? mix("#524a7a", "#2f2850", noise(p, 0.1, 2)) : stoneBase;
  });

  // -------------------------------------------------------------------------------------------------------------
  // Small helpers
  const ell = (
    r: P3,
    c: P3,
    color: ColorInput,
    bone: Joint,
    seg = 8,
  ) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(4, Math.round(seg * 0.7))), color, {
      bone,
      at: SK(...c),
      quat: qSk,
      scale: r,
      flat: true,
    });

  const ring = (y: number, r: number, h: number, color: ColorInput, bone: Joint = shaft, seg = 8) =>
    b.lathe(
      [
        [0, -h / 2],
        [r * 0.88, -h / 2],
        [r, -h * 0.3],
        [r, h * 0.3],
        [r * 0.88, h / 2],
        [0, h / 2],
      ],
      { at: W(0, y), segments: seg, color, bone },
    );

  // -------------------------------------------------------------------------------------------------------------
  // Plinth
  b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.56, 0.05],
      [0.52, 0.07],
      [0.5, 0.09],
      [0.4, 0.09],
      [0.4, 0.14],
      [0.3, 0.17],
      [0, 0.17],
    ],
    { at: [X0, 0, 0], segments: 8, spin: 22.5, color: stoneP, bone: base, name: "plinth" },
  );
  // rim studs
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 + 22.5) * DEG;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.spike([X0 + 0.55 * c, 0.065, 0.55 * s], [c, 0.55, s], 0.1, 0.034, { color: boneDark, bone: base });
    b.part(new THREE.SphereGeometry(0.036, 6, 4), GOLD, { bone: base, at: [X0 + 0.55 * c, 0.062, 0.55 * s], flat: true });
  }

  // rune ring set into the plinth's step
  {
    let marks = "";
    for (let i = 0; i < 24; i++) {
      const gp = glyphPath[i % glyphPath.length];
      marks += `<g transform="translate(100 100) rotate(${i * 15}) translate(0 -90) scale(1.5)"><path d="${gp}"/></g>`;
    }
    const tex = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="none" stroke="#62ffe3" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="100" r="98.5"/><circle cx="100" cy="100" r="81.5"/><circle cx="100" cy="100" r="84" stroke-width="0.7"/>${marks}</g></svg>`,
      { size: 1024 },
    );
    glow(
      b.part(new THREE.PlaneGeometry(1, 1), "#ffffff", {
        bone: base,
        at: [X0, 0.0915, 0],
        dir: [0, 1, 0],
        axis: "z",
        up: [0, 0, 1],
        texture: tex,
      }),
    );
  }

  // spell circle on the floor
  {
    let ticks = "";
    for (let i = 0; i < 36; i++)
      ticks += `<path d="M100 ${i % 3 === 0 ? 4.5 : 6.5}V9" transform="rotate(${i * 10} 100 100)"/>`;
    const tri = (r: number, rot: number) =>
      [0, 1, 2].map((k) => {
        const a = (rot + k * 120) * DEG;
        return `${(100 + r * Math.sin(a)).toFixed(2)},${(100 - r * Math.cos(a)).toFixed(2)}`;
      });
    const tex = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="none" stroke="#4ff0d2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="100" r="98"/><circle cx="100" cy="100" r="91" stroke-width="2.2" stroke-dasharray="7 4"/><circle cx="100" cy="100" r="76"/><polygon points="${tri(96, 0).join(" ")}"/><polygon points="${tri(96, 180).join(" ")}"/>${ticks}</g></svg>`,
      { size: 1024 },
    );
    glow(
      b.part(new THREE.PlaneGeometry(1.5, 1.5), "#ffffff", {
        bone: base,
        at: [X0, 0.004, 0],
        dir: [0, 1, 0],
        axis: "z",
        up: [0, 0, 1],
        texture: tex,
      }),
      0.8,
    );
  }

  // talons gripping the shaft
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 + 45) * DEG;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const P = (r: number, y: number): P3 => [X0 + r * c, y, r * s];
    b.sprout; // (documented helper, unused here)
    b.sweep(bezier(P(0.36, 0.13), P(0.4, 0.3), P(0.2, 0.42), P(0.062, 0.5)), [0.05, 0.009], {
      color: boneP,
      bone: base,
      sides: 7,
      smooth: false,
      caps: { start: "round", end: "point" },
      bands: [
        [0.8, boneP],
        [1, NAIL],
      ],
    });
    b.part(new THREE.SphereGeometry(0.062, 7, 5), boneDark, { bone: base, at: P(0.37, 0.15), flat: true });
    // outward guard claws between them
    const a2 = (i * 90) * DEG;
    const c2 = Math.cos(a2);
    const s2 = Math.sin(a2);
    b.sweep(
      bezier(
        [X0 + 0.3 * c2, 0.15, 0.3 * s2],
        [X0 + 0.42 * c2, 0.2, 0.42 * s2],
        [X0 + 0.46 * c2, 0.32, 0.46 * s2],
        [X0 + 0.44 * c2, 0.46, 0.44 * s2],
      ),
      [0.032, 0.004],
      { color: boneDark, bone: base, sides: 6, smooth: false, caps: { start: "round", end: "point" } },
    );
    b.part(new THREE.SphereGeometry(0.026, 6, 4), GOLD, { bone: base, at: [X0 + 0.31 * c2, 0.16, 0.31 * s2], flat: true });
  }

  // soul crystals around the plinth
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const rad = 0.66 + 0.04 * R();
    const h = 0.1 + 0.1 * R();
    const g = glow(
      b.part(new THREE.OctahedronGeometry(1, 0), i % 3 === 0 ? TEAL_HOT : TEAL, {
        bone: base,
        at: [X0 + rad * Math.cos(a), h * 0.7, rad * Math.sin(a)],
        rotation: [(R() - 0.5) * 34, R() * 90, (R() - 0.5) * 34],
        scale: [h * 0.28, h, h * 0.28],
        flat: true,
      }),
      1.2,
    );
    void g;
  }

  // -------------------------------------------------------------------------------------------------------------
  // Lower shaft: wrapped grip, bands and the claw guard
  b.sweep(polyline([W(0, 0.19), W(0, 0.93)]), 0.033, {
    color: gripP,
    bone: shaft,
    sides: 10,
    caps: "flat",
    name: "grip",
  });
  ring(0.2, 0.062, 0.07, IRON_L);
  ring(0.235, 0.05, 0.02, GOLD);
  for (const y of [0.3, 0.46, 0.62, 0.78]) {
    ring(y, 0.044, 0.022, GOLD);
    ring(y + 0.026, 0.039, 0.012, IRON);
    glow(ring(y - 0.02, 0.04, 0.006, TEAL), 1);
  }
  ring(0.9, 0.046, 0.05, IRON_L);
  // guard
  ring(0.955, 0.06, 0.05, IRON);
  ring(0.99, 0.066, 0.014, GOLD);
  ring(0.922, 0.058, 0.012, GOLD);
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 + 45) * DEG;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const P = (r: number, y: number): P3 => [X0 + r * c, y, r * s];
    b.sweep(bezier(P(0.05, 0.99), P(0.12, 1.0), P(0.15, 0.9), P(0.11, 0.78)), [0.028, 0.004], {
      color: boneP,
      bone: shaft,
      sides: 6,
      smooth: false,
      caps: { start: "round", end: "point" },
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), TEAL, { bone: shaft, at: P(0.072, 0.985), flat: true });
  }

  // hanging charm: swaying chain with a soul lantern and tassel
  const charmPts = [W(0, 0.945, 0.075), W(0, 0.86, 0.082), W(0, 0.78, 0.082), W(0, 0.7, 0.076)];
  const charm = b.chain("charm", polyline(charmPts), {
    parent: shaft,
    names: ["charm1", "charm2", "charm3"],
    role: "hinge",
  });
  b.sweep(charm, 0.0045, { color: GOLD });
  const charmEnd = charm.joints[2];
  b.part(new THREE.TorusGeometry(0.017, 0.005, 5, 10), GOLD, { bone: shaft, at: W(0, 0.953, 0.068), rotation: [0, 90, 0] });
  b.part(new THREE.OctahedronGeometry(1, 0), GOLD, { bone: charmEnd, at: W(0, 0.688, 0.076), scale: [0.02, 0.022, 0.02], flat: true });
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), TEAL, {
      bone: charmEnd,
      at: W(0, 0.63, 0.076),
      scale: [0.03, 0.055, 0.03],
      flat: true,
    }),
    1.2,
  );
  b.spike(W(0, 0.6, 0.076), [0, -1, 0], 0.05, 0.016, { color: GOLD, bone: charmEnd });
  for (let i = 0; i < 4; i++) {
    const a = i * 90 * DEG;
    b.rod(
      W(0.034 * Math.cos(a), 0.676, 0.076 + 0.034 * Math.sin(a)),
      W(0.034 * Math.cos(a), 0.592, 0.076 + 0.034 * Math.sin(a)),
      0.004,
      { color: GOLD_D, bone: charmEnd },
    );
  }
  const tassel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64"><rect x="8" y="52" width="8" height="10" rx="2" fill="#a97a26"/><g stroke="#e6b44c" stroke-width="3" stroke-linecap="round" fill="none"><path d="M12 52V4"/><path d="M8 52Q3 30 5 6"/><path d="M16 52Q21 30 19 6"/><path d="M10 52Q8 28 9 4"/><path d="M14 52Q16 28 15 4"/></g></svg>`,
    { size: 128 },
  );
  b.cards([frame(W(0, 0.585, 0.076), [0, 1, 0])], tassel, {
    size: [0.05, 0.15],
    lean: 180,
    flow: [0, 0, 1],
    bone: charmEnd,
    cross: true,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Upper shaft: dragon spine with soul fire between the vertebrae
  glow(
    b.sweep(polyline([W(0, 1.02), W(0, 1.86)]), 0.04, { color: TEAL, bone: shaft, sides: 8, caps: "flat", name: "soulCore" }),
    1,
  );
  for (let i = 0; i < 15; i++) {
    const y = 1.056 + i * 0.056;
    const r = 0.047 - 0.0007 * i;
    b.lathe(
      [
        [0, -0.022],
        [r * 0.8, -0.022],
        [r, -0.014],
        [r * 0.82, 0],
        [r, 0.014],
        [r * 0.8, 0.022],
        [0, 0.022],
      ],
      { at: W(0, y), segments: 8, spin: i % 2 ? 22.5 : 0, color: i % 4 === 3 ? boneDark : boneP, bone: shaft, name: "vertebra" },
    );
    b.spike(W(0, y + 0.004, -0.032), [0, 0.5, -1], 0.085 - 0.0025 * i, 0.016, { color: boneP, bone: shaft });
    for (const s of [1, -1]) {
      b.spike(W(s * 0.036, y + 0.004, 0), [s, 0.3, 0.12], 0.062 - 0.0012 * i, 0.011, { color: BONE_L, bone: shaft });
    }
    if (i % 2 === 0) b.spike(W(0, y, 0.034), [0, -0.25, 1], 0.03, 0.01, { color: BONE_M, bone: shaft });
  }
  // neck collar under the skull
  ring(1.015, 0.064, 0.03, GOLD_D);
  ring(1.865, 0.066, 0.034, GOLD);
  ring(1.895, 0.058, 0.02, IRON_L);
  glow(ring(1.842, 0.052, 0.008, TEAL), 1);
  b.capsule(W(0, 1.86, 0), SK(0, -0.04, 0.0), 0.046, { color: boneP, bone: head });

  // -------------------------------------------------------------------------------------------------------------
  // Dragon skull
  ell([0.078, 0.072, 0.105], [0, 0, 0.05], boneP, head, 10);
  ell([0.062, 0.056, 0.05], [0, -0.005, -0.04], boneP, head, 8);
  b.loft(
    [
      { at: SK(0, 0, 0.12), w: 0.1, h: 0.09 },
      { at: SK(0, -0.012, 0.2), w: 0.082, h: 0.07 },
      { at: SK(0, -0.02, 0.3), w: 0.07, h: 0.055 },
      { at: SK(0, -0.022, 0.35), w: 0.074, h: 0.05 },
    ],
    { bone: head, color: boneP, sides: 8, smooth: false, name: "snout" },
  );
  ell([0.032, 0.022, 0.034], [0, 0.026, 0.31], boneDark, head);
  for (const s of [1, -1]) {
    // nostrils, brow ridges, eyes
    ell([0.011, 0.012, 0.01], [s * 0.022, 0.008, 0.371], SOCKET, head, 6);
    b.capsule(SK(s * 0.035, 0.064, 0.1), SK(s * 0.095, 0.05, 0.172), [0.022, 0.011], { color: boneDark, bone: head });
    ell([0.035, 0.032, 0.032], [s * 0.063, 0.02, 0.125], SOCKET, head, 8);
    glow(ell([0.02, 0.02, 0.016], [s * 0.066, 0.024, 0.147], TEAL, head, 7), 1.4);
    ell([0.006, 0.014, 0.006], [s * 0.074, 0.025, 0.158], SOCKET, head, 5);
    // cheek plates, jaw hinge knobs, cheek spikes
    ell([0.014, 0.04, 0.065], [s * 0.074, -0.018, 0.075], boneDark, head, 7);
    b.spike(SK(s * 0.075, -0.026, 0.07), SK(s * 0.16, -0.06, -0.03), null, 0.02, { color: boneP, bone: head });
    b.spike(SK(s * 0.07, 0.0, 0.1), SK(s * 0.13, 0.012, 0.025), null, 0.014, { color: boneP, bone: head });
    ell([0.02, 0.02, 0.02], [s * 0.067, -0.035, 0.03], GOLD, head, 6);
    // snout ridge studs
    for (let k = 0; k < 3; k++) ell([0.009, 0.009, 0.009], [s * (0.03 - k * 0.003), 0.04, 0.17 + k * 0.05], BONE_D, head, 5);
    // temple spikes
    b.spike(SK(s * 0.05, 0.06, 0.0), SK(s * 0.09, 0.15, -0.1), null, 0.017, { color: boneP, bone: head });
    // horns
    const hp = bezier(SK(s * 0.055, 0.05, 0.02), SK(s * 0.16, 0.085, -0.03), SK(s * 0.27, 0.05, -0.14), SK(s * 0.3, 0.13, -0.28));
    b.sweep(hp, (t) => 0.036 - 0.032 * t, {
      color: hornP,
      bone: head,
      sides: 7,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "horn",
    });
    for (const t of [0.2, 0.42]) {
      const q = hp.at(t);
      b.lathe(
        [
          [0, -0.007],
          [0.036 - 0.032 * t + 0.005, -0.007],
          [0.036 - 0.032 * t + 0.007, 0],
          [0.036 - 0.032 * t + 0.005, 0.007],
          [0, 0.007],
        ],
        { at: q, axis: hp.tangentAt(t), segments: 8, color: GOLD, bone: head },
      );
    }
    // teeth
    for (let k = 0; k < 7; k++) {
      const z = 0.15 + k * 0.032;
      const x = 0.05 - (k / 6) * 0.016;
      const big = k === 2;
      b.spike(SK(s * x, -0.044, z), SD(s * 0.05, -1, 0.06), big ? 0.062 : 0.03, big ? 0.011 : 0.0075, { color: TOOTH, bone: head });
    }
    // lower jaw plates and teeth
    ell([0.012, 0.03, 0.06], [s * 0.05, -0.052, 0.12], boneDark, jaw, 6);
    for (let k = 0; k < 6; k++) {
      const z = 0.12 + k * 0.034;
      const x = 0.036 - (k / 5) * 0.01;
      const big = k === 5;
      b.spike(SK(s * x, -0.048, z), SD(-s * 0.05, 1, 0.12), big ? 0.058 : 0.027, big ? 0.011 : 0.007, { color: TOOTH, bone: jaw });
    }
    b.spike(SK(s * 0.04, -0.07, 0.2), SK(s * 0.05, -0.115, 0.15), null, 0.014, { color: boneP, bone: jaw });
  }
  for (let k = 0; k < 4; k++) {
    // crest spines running back from the brow
    b.spike(SK(0, 0.07 - k * 0.003, 0.09 - k * 0.045), SD(0, 0.5 + k * 0.1, -1), 0.06 - k * 0.006, 0.017 - k * 0.002, {
      color: boneP,
      bone: head,
    });
  }
  // lower jaw
  b.loft(
    [
      { at: SK(0, -0.035, 0.05), w: 0.095, h: 0.032 },
      { at: SK(0, -0.052, 0.16), w: 0.075, h: 0.03 },
      { at: SK(0, -0.06, 0.27), w: 0.058, h: 0.028 },
      { at: SK(0, -0.058, 0.32), w: 0.05, h: 0.026 },
    ],
    { bone: jaw, color: boneP, sides: 8, smooth: false, name: "lowerJaw" },
  );
  glow(
    b.loft(
      [
        { at: SK(0, -0.046, 0.08), w: 0.05, h: 0.012 },
        { at: SK(0, -0.052, 0.18), w: 0.044, h: 0.012 },
        { at: SK(0, -0.054, 0.27), w: 0.03, h: 0.01 },
      ],
      { bone: jaw, color: TEAL, sides: 6, name: "soulTongue" },
    ),
    1,
  );
  b.spike(SK(0, -0.062, 0.3), SD(0, -0.4, 1), 0.06, 0.015, { color: boneP, bone: jaw });
  b.pose(jaw, { axis: [1, 0, 0], deg: 24 });

  // the captured soul, hanging before the open mouth
  const orbAt = SK(0, -0.07, 0.46);
  glow(b.part(new THREE.IcosahedronGeometry(0.05, 1), TEAL_HOT, { bone: head, at: orbAt, flat: true }), 1.6);
  glow(b.part(new THREE.IcosahedronGeometry(0.066, 0), TEAL, { bone: head, at: orbAt, flat: true, scale: [1, 1, 1] }), 1);
  [
    [70, 0, 0],
    [20, 0, 50],
    [-30, 60, 0],
  ].forEach((rot) => {
    glow(b.part(new THREE.TorusGeometry(0.095, 0.0045, 4, 20), GOLD, { bone: head, at: orbAt, rotation: rot as P3 }), 1);
  });

  // -------------------------------------------------------------------------------------------------------------
  // Blade: a wing-finger spine, ribs, and a scalloped spectral edge
  const ZB = -0.07;
  const ctl: Array<[number, number]> = [
    [0.03, 1.93],
    [0.2, 2.1],
    [0.55, 2.26],
    [0.95, 2.22],
    [1.24, 2.02],
    [1.38, 1.72],
    [1.32, 1.34],
  ];
  const spinePath = catmull(ctl.map(([x, y]) => [x + X0, y, ZB]));
  const N = 56;
  type BP = { t: number; o: THREE.Vector3; n: THREE.Vector3; tg: THREE.Vector3; w: number; e: THREE.Vector3 };
  const bp: BP[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const o = spinePath.at(t).clone();
    const tg = spinePath.tangentAt(t).clone().normalize();
    const n = new THREE.Vector3(tg.y, -tg.x, 0).normalize();
    let w = 0.04 * (1 - t) ** 2 + 0.3 * Math.sin(Math.PI * Math.pow(t, 0.78));
    if (i >= 8) {
      const u = (i - 8) / 8;
      const f = u - Math.floor(u);
      w *= 1 - 0.17 * 4 * f * (1 - f);
    }
    if (i === N) w = 0;
    bp.push({ t, o, n, tg, w, e: o.clone().addScaledVector(n, w) });
  }
  const outline: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) outline.push([bp[i].o.x, bp[i].o.y]);
  for (let i = N - 1; i >= 0; i--) outline.push([bp[i].e.x, bp[i].e.y]);

  const EP = bp.map((q) => [q.e.x, q.e.y]);
  const edgeDist = (x: number, y: number) => {
    let m = 1e9;
    for (let j = 0; j < EP.length - 1; j++) {
      const [ax, ay] = EP[j];
      const [bx, by] = EP[j + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const t = Math.min(1, Math.max(0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy + 1e-12)));
      m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
    return m;
  };
  const bladeP = paint((p) => {
    const d = edgeDist(p.x, p.y);
    if (d < 0.007) return "#effffb";
    if (d < 0.019) return TEAL;
    if (Math.abs(d - 0.07) < 0.0028 || Math.abs(d - 0.112) < 0.0028) return "#2fc4b4";
    const c = cells(p, 0.14, 9);
    if (d > 0.05 && c.d2 - c.d1 < 0.011) return "#2aa89f";
    const base = mix(TEAL_D, INDIGO, smoothstep(0.02, 0.2, d));
    return mix(base, "#34236f", noise(p, 0.12, 5) * 0.45);
  });
  b.extrude(outline, {
    at: [0, 0, ZB],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.024,
    bevel: 0.006,
    color: bladeP,
    bone: shaft,
    name: "blade",
  });
  glow(
    b.sweep(
      polyline(bp.map((q) => [q.e.x, q.e.y, ZB])),
      (t) => 0.011 * (1 - 0.65 * t) + 0.002,
      { color: TEAL_HOT, bone: shaft, sides: 6, caps: { start: "flat", end: "point" }, name: "edgeGlow" },
    ),
    1.5,
  );
  b.sweep(spinePath, (t) => 0.036 * (1 - t) + 0.009, {
    color: spineP,
    bone: shaft,
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "point" },
    name: "bladeSpine",
  });
  // yoke joining shaft and blade
  b.capsule(W(0, 1.865, 0), [spinePath.at(0.02).x, spinePath.at(0.02).y, ZB], 0.044, { color: IRON, bone: shaft });
  {
    const q = spinePath.at(0.045);
    b.lathe(
      [
        [0, -0.02],
        [0.058, -0.02],
        [0.064, -0.01],
        [0.064, 0.01],
        [0.058, 0.02],
        [0, 0.02],
      ],
      { at: q, axis: spinePath.tangentAt(0.045), segments: 8, color: GOLD, bone: shaft },
    );
    const q2 = spinePath.at(0.09);
    b.lathe(
      [
        [0, -0.012],
        [0.05, -0.012],
        [0.055, 0],
        [0.05, 0.012],
        [0, 0.012],
      ],
      { at: q2, axis: spinePath.tangentAt(0.09), segments: 8, color: IRON_L, bone: shaft },
    );
  }
  // dorsal spines
  for (let i = 5; i <= 53; i += 6) {
    const q = bp[i];
    const dir = q.n.clone().multiplyScalar(-0.8).addScaledVector(q.tg, 0.55).normalize();
    const len = 0.05 + 0.075 * Math.sin(Math.PI * q.t);
    const r = 0.036 * (1 - q.t) + 0.009;
    b.spike(q.o.clone().addScaledVector(q.n, -r * 0.5), [dir.x, dir.y, 0], len, 0.022 * (1 - q.t * 0.5), {
      color: boneP,
      bone: shaft,
    });
  }
  // ribs between spine and edge, front and back
  for (let k = 0; k < 6; k++) {
    const q = bp[8 + 8 * k];
    for (const s of [1, -1]) {
      const a = q.o.clone().addScaledVector(q.n, 0.02);
      const e = q.e.clone().addScaledVector(q.n, -0.016);
      b.rod([a.x, a.y, ZB + s * 0.012], [e.x, e.y, ZB + s * 0.012], [0.012, 0.004], {
        color: boneP,
        bone: shaft,
        sides: 6,
      });
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, {
        bone: shaft,
        at: [e.x, e.y, ZB + s * 0.012],
        flat: true,
      });
    }
  }
  // soul gems along the spine
  for (const i of [12, 24, 36, 48]) {
    const q = bp[i];
    const r = 0.036 * (1 - q.t) + 0.009;
    for (const s of [1, -1])
      glow(b.part(new THREE.IcosahedronGeometry(0.012, 0), TEAL, { bone: shaft, at: [q.o.x, q.o.y, ZB + s * r * 0.95], flat: true }), 1.2);
  }
  // runes etched on both faces
  const glyphTex = GLYPHS.map((g) => strokeSvg(g));
  for (let k = 0; k < 6; k++) {
    const q = bp[12 + 8 * k];
    const c = q.o.clone().addScaledVector(q.n, q.w * 0.5);
    for (const s of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
          bone: shaft,
          at: [c.x, c.y, ZB + s * 0.0125],
          dir: [0, 0, s],
          axis: "z",
          up: [q.tg.x, q.tg.y, 0],
          texture: glyphTex[k % glyphTex.length],
        }),
      );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Spectral dressing: flames licking the edge, captured souls, flames on the plinth
  const wisp = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80"><path d="M20 79C3 62 5 40 17 26C19 38 26 38 24 20C31 30 37 48 33 62C31 72 26 77 20 79Z" fill="#37f2cf"/><path d="M20 75C12 63 14 50 20 41C24 52 28 58 24 68Z" fill="#d2fff6"/></svg>`,
    { size: 128 },
  );
  const ghost = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64"><path d="M24 3C9 3 6 20 6 32V60L14 51L22 62L30 51L38 62L42 58V32C42 20 39 3 24 3Z" fill="#9ff7e4"/><path d="M24 8C14 8 11 20 11 31V52L15 47L22 56" fill="none" stroke="#d2fff6" stroke-width="3" stroke-linecap="round"/><ellipse cx="17" cy="26" rx="4.5" ry="6.5" fill="#0c3f46"/><ellipse cx="31" cy="26" rx="4.5" ry="6.5" fill="#0c3f46"/><ellipse cx="24" cy="40" rx="4" ry="6" fill="#0c3f46"/></svg>`,
    { size: 128 },
  );
  const edgeFrames: ReturnType<typeof frame>[] = [];
  for (let i = 6; i <= 52; i += 3) {
    const q = bp[i];
    const dir = q.n.clone().multiplyScalar(0.8).addScaledVector(new THREE.Vector3(0, 1, 0), 0.2).normalize();
    edgeFrames.push(frame([q.e.x, q.e.y, ZB], [dir.x, dir.y, 0]));
  }
  glow(
    b.cards(edgeFrames, wisp, {
      size: [0.07, 0.15],
      vary: 0.4,
      spin: 18,
      rng: rng(5),
      flow: [0, 0, 1],
      bone: shaft,
      cross: true,
      sink: 0.2,
    }),
    1,
  );
  const ghostSpots: Array<[number, number, number, number]> = [
    [0.86, 1.62, 0.06, 0.16],
    [1.06, 1.78, -0.05, 0.13],
    [0.66, 1.78, 0.07, 0.11],
    [1.04, 1.5, 0.05, 0.1],
    [0.45, 1.65, -0.04, 0.09],
  ];
  glow(
    b.cards(
      ghostSpots.map(([x, y, z]) => frame(W(x, y, z), [0, 1, 0])),
      ghost,
      { size: [0.08, 0.11], flow: [0, 0, 1], bone: shaft, spin: 8, vary: 0.2, rng: rng(6) },
    ),
    1,
  );
  const plinthFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const rad = 0.2 + 0.08 * (i % 3);
    plinthFrames.push(frame([X0 + rad * Math.cos(a), 0.165, rad * Math.sin(a)], [0, 1, 0]));
  }
  glow(
    b.cards(plinthFrames, wisp, {
      size: [0.08, 0.22],
      vary: 0.4,
      spin: 20,
      rng: rng(7),
      flow: [0, 0, 1],
      bone: base,
      cross: true,
      sink: 0.12,
    }),
    1,
  );
  // wisps drifting from the open mouth into the orb
  b.cards(
    [-1, 0, 1].map((s) => frame(SK(s * 0.02, -0.05, 0.36), SD(s * 0.2, 0.2, 1))),
    wisp,
    { size: [0.05, 0.12], flow: SD(0, 1, 0), bone: head, cross: true, sink: 0.05, vary: 0.2, rng: rng(8) },
  ).forEach((m) => glow(m, 1));

  return b.root;
}
