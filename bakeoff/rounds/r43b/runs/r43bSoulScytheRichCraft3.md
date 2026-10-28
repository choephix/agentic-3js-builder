```ts
import * as THREE from "three";
import { createBuilder, frame, catmull, polyline } from "agentic-3js-builder";
import { mottle, grain, stripes } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A tall scythe whose shaft is wrapped dragon vertebrae, topped with a gilded dragon skull, with a glowing soul-fire blade on a bone spine, in a stylised League of Legends look.",
};

const BONE = mottle("#f1e8cf", "#cdbf9a", { size: 0.05, seed: 3 });
const BONE_FLAT = "#eee4c8";
const BONE_DARK = "#b5a57d";
const GILT = metal("gilt", { tarnish: 0.15 });
const LEATHER = stripes("#2a1d3a", "#14101f", { size: 0.03, axis: "y", width: 0.5, wobble: 0.2 });
const SHAFT = grain("#e4d9b8", "#b9aa84", { size: 0.01, axis: "y" });
const TEAL = "#2bc4c8";
const TEAL_HI = "#a6fff0";
const VOID = "#1b1530";

const flameTex = svg(
  `<svg viewBox="0 0 40 80"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#2bd3d0"/><stop offset="0.6" stop-color="#8ffff0"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M20 78 C2 64 4 42 18 30 C14 20 20 8 24 2 C26 16 38 30 36 50 C36 64 30 74 20 78Z" fill="url(#g)"/>
  <path d="M20 70 C12 60 14 48 21 40 C26 50 30 58 20 70Z" fill="#ffffff" opacity="0.8"/></svg>`,
  { size: 128 },
);
const clothTex = svg(
  `<svg viewBox="0 0 40 120"><defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#3b2a6e"/><stop offset="1" stop-color="#1fb5c9"/></linearGradient></defs>
  <path d="M2 0 H38 L36 60 L38 90 L30 110 L26 92 L20 120 L14 94 L8 112 L4 80 L3 50Z" fill="url(#c)" stroke="#e0c46a" stroke-width="2"/>
  <path d="M20 8 L26 24 L20 40 L14 24Z" fill="none" stroke="#e0c46a" stroke-width="2"/>
  <circle cx="20" cy="24" r="3" fill="#9ffff0"/></svg>`,
  { size: 128 },
);
const runeTex = svg(
  `<svg viewBox="0 0 200 40"><g fill="none" stroke="#e8fffb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 6 V34 M10 12 L24 20 L10 28"/><path d="M40 8 L52 34 L64 8 M46 24 H58"/>
  <path d="M82 6 V34 M82 6 L98 20 M82 20 L98 34"/><path d="M116 34 L128 6 L140 34 M122 24 H134"/>
  <path d="M158 6 H176 L158 34 H176 M160 20 H174"/><circle cx="190" cy="20" r="6"/></g></svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "soulScythe" });

  // ---------- helpers ----------
  const collar = (y: number, r: number, h: number, gem = true) => {
    b.lathe(
      [[0, -h], [r, -h], [r * 1.3, 0], [r, h], [0, h]],
      { at: [0, y, 0], segments: 8, color: GILT },
    );
    if (gem) {
      glow(b.part(new THREE.OctahedronGeometry(r * 0.38), TEAL_HI, { at: [0, y, r * 1.25] }), 1.3);
    }
  };

  // ---------- shaft ----------
  b.sweep([[0, 0.14, 0], [0, 1.86, 0]], 0.03, { color: SHAFT, caps: "flat" });
  b.sweep([[0, 0.22, 0], [0, 0.9, 0]], 0.04, { color: LEATHER, caps: "flat" });
  // butt spike
  b.lathe([[0, 0], [0.02, 0.05], [0.05, 0.12], [0.045, 0.2], [0, 0.2]], { at: [0, 0, 0], segments: 8, color: GILT });
  collar(0.2, 0.05, 0.025, false);
  collar(0.92, 0.05, 0.03);
  collar(1.4, 0.055, 0.035);
  collar(1.78, 0.06, 0.035);
  // vertebrae wrap under the skull
  for (let i = 0; i < 6; i++) {
    const y = 1.46 + i * 0.05;
    b.part(new THREE.SphereGeometry(0.045 - i * 0.002, 7, 5), BONE, { at: [0, y, 0], scale: [1, 0.55, 1] });
    for (const s of [1, -1])
      b.spike([s * 0.03, y, 0], [s, 0.4, 0], 0.07 - i * 0.004, 0.012, { color: BONE_FLAT });
  }

  // ---------- crossguard talon wings ----------
  const wing: any[] = [
    [0, 0], [0.1, 0.07], [0.22, 0.03], [0.32, -0.13, "sharp"], [0.2, -0.05], [0.13, -0.12], [0.06, -0.17], [0, -0.09],
  ];
  for (const s of [1, -1]) {
    b.extrude(wing, { at: [s * 0.04, 1.14, 0], x: [s, 0, 0], thickness: 0.03, bevel: 0.006, smoothing: 1, color: GILT });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), TEAL_HI, { at: [s * 0.13, 1.19, 0.018] }), 1.2);
  }

  // ---------- cloth ----------
  b.cards([frame([0.035, 1.38, 0.03], [0, 1, 0]), frame([-0.035, 1.38, -0.03], [0, 1, 0])], clothTex, {
    size: [0.1, 0.42], lean: 180, flow: [0, 0, 1],
  });

  // ---------- skull ----------
  const SK = [0, 1.93, 0.0] as const;
  b.part(new THREE.SphereGeometry(1, 10, 8), BONE, { at: SK, scale: [0.1, 0.09, 0.12] });
  b.frustumBox([0, 1.9, 0.07], [0, 1.87, 0.31], [0.13, 0.1], [0.07, 0.06], { color: BONE });
  b.part(new THREE.BoxGeometry(0.08, 0.025, 0.04), BONE_FLAT, { at: [0, 1.92, 0.32] });
  // nostril gems
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.01, 5, 4), VOID, { at: [s * 0.022, 1.9, 0.335] });
    // eyes + brows
    glow(b.part(new THREE.SphereGeometry(0.024, 7, 5), "#7dfff0", { at: [s * 0.075, 1.945, 0.075] }), 1.6);
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.05), BONE_DARK, {
      at: [s * 0.075, 1.98, 0.08], rotation: [0, s * 20, s * -20],
    });
    // horns
    b.sweep(catmull([[s * 0.07, 1.99, -0.04], [s * 0.14, 2.05, -0.13], [s * 0.2, 2.02, -0.3], [s * 0.22, 1.9, -0.44]]),
      [0.032, 0.004], { color: BONE, caps: { start: "flat", end: "point" } });
    b.sweep(catmull([[s * 0.09, 1.93, 0.0], [s * 0.18, 1.9, -0.06], [s * 0.26, 1.82, -0.1]]),
      [0.022, 0.004], { color: BONE_FLAT, caps: { start: "flat", end: "point" } });
    // cheek frill fins
    b.extrude([[0, 0], [0.09, 0.04], [0.13, -0.04, "sharp"], [0.07, -0.05], [0.02, -0.08]],
      { at: [s * 0.09, 1.9, -0.03], x: [s, 0, -0.4], thickness: 0.012, color: GILT });
    // upper fangs
    for (let i = 0; i < 4; i++)
      b.spike([s * (0.036 - i * 0.003), 1.84, 0.12 + i * 0.05], [0, -1, 0], i === 0 ? 0.06 : 0.035, 0.009, { color: "#ffffff" });
  }
  // gilt crown ridge
  b.sweep(catmull([[0, 2.02, 0.1], [0, 2.03, -0.02], [0, 1.99, -0.12]]), [0.012, 0.012], { color: GILT, caps: "flat" });
  // lower jaw (separate, opened)
  b.frustumBox([0, 1.83, 0.04], [0, 1.74, 0.23], [0.095, 0.035], [0.05, 0.028], { color: BONE_FLAT });
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.spike([s * 0.025, 1.78 - i * 0.015, 0.1 + i * 0.045], [0, 1, 0.2], 0.03, 0.008, { color: "#ffffff" });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), VOID, { at: [0, 1.84, 0.05] });

  // ---------- blade ----------
  const blade: any[] = [
    [0.0, 1.92, "sharp"], [0.12, 2.17], [0.4, 2.27], [0.75, 2.2], [1.05, 2.02], [1.3, 1.72, "sharp"],
    [1.02, 1.9], [0.75, 2.0], [0.45, 2.05], [0.2, 1.99], [0.05, 1.88, "sharp"],
  ].map((p: any) => [p[0], p[1], ...(p[2] ? [p[2]] : [])]);
  glow(b.extrude(blade, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, smoothing: 1, color: TEAL }), 0.9);
  const core: any[] = [[0.1, 2.12], [0.4, 2.2], [0.75, 2.14], [1.0, 1.99], [1.18, 1.82, "sharp"], [0.95, 1.97], [0.75, 2.06], [0.45, 2.11], [0.2, 2.07]];
  glow(b.extrude(core, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.028, smoothing: 1, color: TEAL_HI }), 1.3);
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.55, 0.11), "#ffffff", {
      at: [s * 0.0155, 2.14, 0.47], dir: [s, 0, 0], axis: "z", texture: runeTex,
    }), 1.5);

  // bone spine along the outer edge
  const spinePts = [[0, 1.93, 0.0], [0, 2.18, 0.13], [0, 2.28, 0.4], [0, 2.21, 0.75], [0, 2.03, 1.05], [0, 1.74, 1.29]];
  const spine = b.sweep(catmull(spinePts), [0.05, 0.008], { color: BONE, caps: { start: "round", end: "point" } });
  b.along(spine, 7, (at) => b.spike(at, at, 0.1, 0.022, { color: BONE_FLAT }));
  b.along(spine, 4, (at) => b.part(new THREE.OctahedronGeometry(0.03), GILT, { at: at.moved([0, 0.02, 0]) }));
  // cutting edge glow + teeth
  const edge = catmull([[0, 1.9, 0.1], [0, 2.0, 0.2], [0, 2.05, 0.45], [0, 2.0, 0.75], [0, 1.9, 1.02], [0, 1.74, 1.27]]);
  glow(b.sweep(edge, 0.008, { color: "#e8fffb" }), 1.6);
  b.along(edge, 6, (at) => b.spike(at, [0, -1, 0.25], 0.06, 0.013, { color: BONE_FLAT }));

  // ---------- soul fire ----------
  glow(b.part(new THREE.IcosahedronGeometry(0.065, 1), TEAL_HI, { at: [0, 1.68, 0.55] }), 1.8);
  const ringFrames = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ringFrames.push(frame([0.05 * Math.sin(a), 1.7, 0.55 + 0.05 * Math.cos(a)], [0, 1, 0]));
  }
  glow(b.cards(ringFrames, flameTex, { size: [0.07, 0.17], cross: true, vary: 0.3, rng: undefined, flow: [0, 0, 1] }), 1.5);
  const wisps = [[0, 1.78, 0.95], [0, 1.9, 1.1], [0, 1.6, 0.9], [0, 1.95, 0.3], [0, 1.55, 0.3], [0, 1.68, 1.15]]
    .map((p) => frame(p, [0, 1, 0]));
  glow(b.cards(wisps, flameTex, { size: [0.045, 0.1], cross: true, flow: [0, 0, 1] }), 1.4);

  return b.root;
}
```