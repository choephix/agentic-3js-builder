import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, scales, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering dragonbone scythe: vertebrae shaft, gilded collars, a dragon-skull socket holding a soul orb, and a scale-plated crescent blade with a glowing soul edge, standing on a runed plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const GOLD = "#f4b73a";
const GOLD_D = "#b9791f";
const CYAN = "#4ff3ff";
const VIOLET = "#9a5cff";
const BONE = cel(mottle("#f1e6c9", "#dccb9f", { size: 0.05, seed: 3 }));
const BONE_D = cel("#cdb98c");
const PLATE = cel(scales(["#f3e9cf", "#e6d7b0", "#efe0bd"], "#9c7e52", { size: 0.055, width: 0.1, seed: 5 }));
const SHAFT = cel(stripes("#4d3a86", "#2e2257", { size: 0.035, axis: "y", width: 0.35, wobble: 0.1 }));
const VIOLET_D = cel("#33265f");
const STONE = cel(mottle("#5d5780", "#463f66", { size: 0.08, seed: 9 }));
const STONE_TOP = cel(grain("#6c6692", "#544d78", { size: 0.03, axis: "x", seed: 2 }));

const rune = svg(
  `<svg viewBox="0 0 32 32"><g fill="none" stroke="#7ffaff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 3 L16 29"/><path d="M16 9 L26 17"/><path d="M16 15 L6 23"/><circle cx="16" cy="9" r="2" stroke-width="2.5"/></g></svg>`,
  { size: 128 },
);
const rune2 = svg(
  `<svg viewBox="0 0 32 32"><g fill="none" stroke="#c9a2ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 6 L26 6 L6 26 L26 26"/><path d="M16 4 L16 28"/></g></svg>`,
  { size: 128 },
);
const wisp = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 C2 44 8 34 16 24 C14 34 22 36 20 26 C30 40 28 52 16 62 Z" fill="#7ffaff"/>
  <path d="M16 56 C9 46 13 40 16 34 C17 42 22 44 16 56 Z" fill="#e6ffff"/></svg>`,
  { size: 128 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "soulScythe" });
  const rand = rng(11);

  // ---- plinth --------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.27, 0.035],
      [0.22, 0.062],
      [0.22, 0.085],
      [0, 0.085],
    ],
    { at: [0, 0, 0], color: STONE, segments: 8, spin: 22.5 },
  );
  b.lathe(
    [
      [0, 0.085],
      [0.2, 0.085],
      [0.19, 0.098],
      [0, 0.098],
    ],
    { at: [0, 0, 0], color: STONE_TOP, segments: 8, spin: 22.5 },
  );
  glow(b.part(new THREE.TorusGeometry(0.15, 0.006, 4, 16), CYAN, { at: [0, 0.1, 0], rotation: [90, 0, 0] }));
  glow(b.part(new THREE.TorusGeometry(0.095, 0.004, 4, 12), VIOLET, { at: [0, 0.1, 0], rotation: [90, 0, 0] }));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.sin(a) * 0.262;
    const z = Math.cos(a) * 0.262;
    glow(
      b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
        at: [x * 1.004, 0.03, z * 1.004],
        dir: [x, 0, z],
        axis: "z",
        texture: i % 2 ? rune : rune2,
      }),
    );
    b.part(new THREE.BoxGeometry(0.03, 0.012, 0.03), GOLD, {
      at: [Math.sin(a) * 0.2, 0.096, Math.cos(a) * 0.2],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }

  // ---- shaft ---------------------------------------------------------
  b.rod([0, 0.09, 0], [0, 1.86, 0], 0.022, { color: SHAFT, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.05, 8), GOLD, { at: [0, 0.12, 0] });
  b.part(new THREE.ConeGeometry(0.03, 0.06, 8), GOLD_D, { at: [0, 0.18, 0] });
  // vertebrae
  for (let i = 0; i < 15; i++) {
    const y = 0.32 + i * 0.1;
    const k = 0.9 + 0.2 * Math.sin(i * 1.3);
    b.part(new THREE.SphereGeometry(1, 6, 4), BONE, { at: [0, y, 0], scale: [0.036 * k, 0.03, 0.036 * k] });
    const side = i % 2 ? 1 : -1;
    b.spike([side * 0.03, y, 0], [side, 0.35, 0], 0.07, 0.009, BONE_D);
    b.spike([0, y, side * 0.03], [0, 0.35, side], 0.05, 0.007, BONE_D);
  }
  // gilded collars
  for (const y of [0.62, 1.08, 1.5]) {
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 10), GOLD, { at: [0, y, 0], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.03, 0.004, 4, 10), GOLD_D, { at: [0, y + 0.02, 0], rotation: [90, 0, 0] });
  }
  // soul gems on the collars
  for (const y of [0.62, 1.08, 1.5]) {
    glow(b.part(new THREE.OctahedronGeometry(0.016), CYAN, { at: [0, y + 0.002, 0.04], scale: [1, 1.5, 1] }));
    b.part(new THREE.OctahedronGeometry(0.024), GOLD, { at: [0, y + 0.002, 0.036], scale: [1, 1.5, 0.5] });
  }
  // leather-wrapped grip
  b.rod([0, 0.74, 0], [0, 0.98, 0], 0.027, { color: cel("#8a2f5a"), sides: 8 });
  for (let i = 0; i < 6; i++)
    b.part(new THREE.TorusGeometry(0.027, 0.0035, 4, 8), GOLD_D, { at: [0, 0.76 + i * 0.04, 0], rotation: [90, 0, 0] });
  // tassels hanging from the upper collar
  const tass = [0.045, -0.045].map((x) => frame([x, 1.5, 0], [0, 1, 0]));
  b.cards(tass, wisp, { size: [0.04, 0.16], lean: 180, flow: [0, 0, 1], cross: true, color: "#ffffff" });

  // ---- dragon skull socket ------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.045, 0.04],
      [0.032, 0.075],
      [0, 0.075],
    ],
    { at: [0, 1.82, 0], color: GOLD, segments: 8 },
  );
  b.part(new THREE.TorusGeometry(0.05, 0.007, 4, 10), GOLD_D, { at: [0, 1.82, 0], rotation: [90, 0, 0] });
  const skull = b.part(new THREE.SphereGeometry(1, 8, 6), BONE, { at: [0, 1.91, 0.02], scale: [0.065, 0.058, 0.095] });
  b.frustumBox([0, 1.915, 0.09], [0, 1.895, 0.27], [0.07, 0.05], [0.04, 0.03], { color: BONE });
  b.frustumBox([0, 1.86, 0.06], [0, 1.845, 0.24], [0.058, 0.014], [0.03, 0.012], { color: BONE_D });
  b.part(new THREE.BoxGeometry(0.11, 0.01, 0.04), VIOLET_D, { at: [0, 1.94, 0.15] });
  for (const s of [1, -1]) {
    // nostril, brow ridge, eye socket
    b.part(new THREE.SphereGeometry(0.008, 5, 4), VIOLET_D, { at: [s * 0.012, 1.912, 0.27] });
    b.rod([s * 0.03, 1.955, 0.06], [s * 0.052, 1.945, 0.14], 0.012, { color: BONE_D, sides: 5 });
    b.part(new THREE.SphereGeometry(0.019, 6, 4), VIOLET_D, { at: [s * 0.05, 1.925, 0.1], scale: [0.7, 1, 1.2] });
    glow(b.part(new THREE.SphereGeometry(0.012, 5, 4), CYAN, { at: [s * 0.056, 1.925, 0.105] }), 1.5);
    // horns
    b.sweep(
      catmull([
        [s * 0.045, 1.94, -0.02],
        [s * 0.08, 1.98, -0.1],
        [s * 0.075, 2.05, -0.19],
        [s * 0.04, 2.1, -0.27],
      ]),
      [0.018, 0],
      { color: PLATE, caps: "point", section: { ngon: 6 } },
    );
    // cheek frill spikes
    b.spike([s * 0.058, 1.9, -0.02], [s, -0.1, -0.7], 0.09, 0.011, BONE_D);
    b.spike([s * 0.06, 1.92, 0.02], [s, 0.2, -0.5], 0.07, 0.009, BONE);
    // teeth
    for (let i = 0; i < 5; i++) {
      const z = 0.1 + i * 0.033;
      const w = 0.032 - i * 0.003;
      b.spike([s * w, 1.89, z], [0, -1, 0], 0.024, 0.005, "#fffbe8");
      b.spike([s * (w - 0.004), 1.853, z + 0.012], [0, 1, 0], 0.018, 0.004, "#fffbe8");
    }
  }
  b.spike([0, 1.915, 0.27], [0, 0.3, 1], 0.03, 0.01, BONE);
  glow(b.part(new THREE.IcosahedronGeometry(0.032, 0), CYAN, { at: [0, 1.87, 0.18] }), 1.8);
  b.surface(skull);

  // ---- blade ---------------------------------------------------------
  const upper: Array<[number, number]> = [
    [0, 0.05],
    [0.25, 0.11],
    [0.55, 0.1],
    [0.85, -0.05],
    [1.05, -0.3],
  ];
  const BY = 1.91;
  b.extrude(
    [
      [0, 0.05],
      [0.25, 0.11],
      [0.55, 0.1],
      [0.85, -0.05],
      [1.05, -0.3, "sharp"],
      [0.85, -0.2],
      [0.55, -0.17],
      [0.25, -0.12],
      [0, -0.1],
    ],
    { at: [0, BY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.004, smoothing: 1, color: PLATE },
  );
  // glowing soul edge
  glow(
    b.extrude(
      [
        [0.02, -0.1],
        [0.25, -0.12],
        [0.55, -0.17],
        [0.85, -0.2],
        [1.05, -0.3, "sharp"],
        [0.9, -0.13],
        [0.55, -0.11],
        [0.25, -0.06],
        [0.02, -0.05],
      ],
      { at: [0, BY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.011, color: CYAN },
    ),
    1.4,
  );
  // spine with gold-trimmed ridge and spikes
  const spine = catmull(upper.map(([x, y]) => [x, BY + y + 0.004, 0]));
  b.sweep(spine, [0.016, 0.008], { color: VIOLET_D, caps: "round", section: { ngon: 6 } });
  b.sweep(spine.slice(0.04, 0.96), 0.006, { color: GOLD, section: { ngon: 4 }, shift: [0, 0.01] });
  for (let i = 0; i < 7; i++) {
    const t = 0.1 + i * 0.12;
    const p = spine.at(t);
    const tg = spine.tangentAt(t);
    b.spike(p, [-tg.y, tg.x, 0], 0.1 * (1 - t * 0.55), 0.016 * (1 - t * 0.4), BONE, { sides: 5 });
  }
  // rib struts reaching the spine from the soul edge
  for (let i = 0; i < 5; i++) {
    const x = 0.16 + i * 0.16;
    const yTop = BY + 0.1 - (i > 2 ? (i - 2) * 0.055 : 0);
    b.rod([x, yTop, 0.0], [x + 0.03, BY - 0.1 - i * 0.02, 0], 0.007, { color: BONE_D, sides: 5, caps: "none" });
  }
  // runes on both faces
  const runeAt: Array<[number, number]> = [
    [0.28, 0.0],
    [0.46, 0.0],
    [0.64, -0.03],
    [0.8, -0.1],
  ];
  runeAt.forEach(([x, y], i) => {
    for (const s of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
          at: [x, BY + y, s * 0.0105],
          dir: [0, 0, s],
          axis: "z",
          texture: (i + (s > 0 ? 0 : 1)) % 2 ? rune : rune2,
          rotation: [0, 0, -s * 8 * i],
        }),
      );
    }
  });
  // root gold clasp binding blade to the skull socket
  b.part(new THREE.BoxGeometry(0.1, 0.19, 0.045), GOLD, { at: [0.045, BY - 0.02, 0] });
  b.part(new THREE.BoxGeometry(0.02, 0.2, 0.052), GOLD_D, { at: [0.1, BY - 0.02, 0] });
  for (const s of [1, -1])
    for (const dy of [-0.06, 0.02])
      b.part(new THREE.SphereGeometry(0.008, 5, 4), "#fff0b8", { at: [0.045, BY + dy, s * 0.024] });
  // hanging soul wisps under the blade edge
  const wf = [0.35, 0.55, 0.75, 0.92].map((x, i) => {
    const y = BY - 0.15 - (i > 1 ? (i - 1) * 0.06 : 0) - (i === 3 ? 0.04 : 0);
    return frame([x, y - 0.02, 0], [0, 1, 0]);
  });
  glow(
    b.cards(wf, wisp, {
      size: [0.06, 0.17],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      vary: 0.3,
      rng: rand,
      color: "#ffffff",
    }),
  );
  // floating soul wisps rising from the plinth
  const base = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return frame([Math.sin(a) * 0.16, 0.1, Math.cos(a) * 0.16], [0, 1, 0]);
  });
  glow(b.cards(base, wisp, { size: [0.06, 0.2], flow: [0, 0, 1], cross: true, vary: 0.3, rng: rand, color: "#ffffff" }));

  return b.root;
}
