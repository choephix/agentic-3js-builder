```ts
import * as THREE from "three";
import { createBuilder, catmull, mix, noise, paint, smoothstep, mottle, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A tall scythe with a vertebrae shaft, a dragon-skull head clutching a glowing soul orb, a cracked bone blade with a cyan edge and a gilt-and-teal trim, in a League of Legends style.",
};

const BONE = mottle("#f3ead2", "#cfc2a0", { size: 0.06, seed: 3 });
const BONE_D = "#8d7d62";
const GOLD = "#f0b840";
const GOLD_D = "#a86d1c";
const TEAL = "#0f5964";
const NAVY = "#14243a";
const CYAN = "#47f2ff";
const HOT = "#d8fdff";

export default function build() {
  const b = createBuilder({ name: "soulScythe", paintSize: 1024 });
  const H = 2.0;
  const R = rng(9);

  // ---- shaft ----
  const shaftPath = catmull([
    [0, 0, 0],
    [0, 0.7, -0.03],
    [0, 1.4, 0.02],
    [0, H, 0],
  ]);
  b.sweep(shaftPath, 0.024, { color: "#2a2430", sides: 8, caps: { start: "point", end: "flat" } });
  // vertebrae
  b.along(shaftPath, 15, (at) => {
    const k = at.t;
    const s = 0.058 - 0.014 * k;
    b.stick(new THREE.CylinderGeometry(s, s * 0.8, 0.07, 6), BONE, at, { embed: 0.5 });
    // rib spurs
    for (const sx of [1, -1])
      b.spike(at.at, [sx, 0.35, 0.1], 0.07 * (1 - 0.4 * k), 0.012, { color: BONE, sides: 5 });
  });
  // grip wrap and gilt bands
  b.sweep(shaftPath, 0.036, {
    from: 0.38,
    to: 0.62,
    color: paint((_p, _n, s) => (Math.floor(s[0] * 90) % 2 ? NAVY : TEAL)),
    sides: 8,
    caps: "flat",
  });
  for (const t of [0.36, 0.64, 0.9]) {
    const p = shaftPath.at(t);
    b.lathe(
      [
        [0.03, 0],
        [0.058, 0.01],
        [0.058, 0.04],
        [0.03, 0.05],
      ],
      { at: [p.x, p.y - 0.025, p.z], color: GOLD, segments: 8 },
    );
  }
  // butt cap
  b.spike([0, 0.14, 0], [0, -1, 0], 0.14, 0.04, { color: GOLD_D, sides: 6 });

  // ---- skull head ----
  const hy = H - 0.12;
  const hz = 0.12;
  const skullPaint = BONE;
  b.part(new THREE.SphereGeometry(1, 8, 6), skullPaint, { at: [0, hy + 0.02, hz - 0.04], scale: [0.1, 0.09, 0.12] });
  b.part(new THREE.BoxGeometry(1, 1, 1), skullPaint, { at: [0, hy - 0.01, hz + 0.15], scale: [0.09, 0.07, 0.2] });
  b.part(new THREE.BoxGeometry(1, 1, 1), BONE_D, { at: [0, hy - 0.07, hz + 0.13], rotation: [8, 0, 0], scale: [0.075, 0.03, 0.2] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#1b1018", { at: [s * 0.065, hy + 0.04, hz + 0.05] });
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), CYAN, { at: [s * 0.07, hy + 0.04, hz + 0.065] }), 1.6);
    glow(b.part(new THREE.SphereGeometry(0.008, 5, 4), CYAN, { at: [s * 0.03, hy + 0.0, hz + 0.25] }), 1.2);
    // horns
    b.sweep(
      catmull([
        [s * 0.07, hy + 0.08, hz - 0.08],
        [s * 0.16, hy + 0.14, hz - 0.2],
        [s * 0.2, hy + 0.28, hz - 0.36],
      ]),
      [0.03, 0],
      { color: BONE, sides: 6, caps: { start: "flat", end: "point" } },
    );
    b.spike([s * 0.09, hy + 0.1, hz - 0.02], [s * 0.4, 1, 0.1], 0.13, 0.015, { color: GOLD, sides: 5 });
    for (let i = 0; i < 4; i++) {
      b.spike([s * 0.04, hy - 0.04, hz + 0.1 + i * 0.045], [0, -1, 0], 0.032, 0.007, { color: "#fffbe8", sides: 4 });
      b.spike([s * 0.035, hy - 0.06, hz + 0.1 + i * 0.045], [0, 1, 0], 0.025, 0.006, { color: "#fffbe8", sides: 4 });
    }
  }
  // jaw-claws holding the soul orb
  const orb: [number, number, number] = [0, hy - 0.04, hz + 0.62];
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const cx = Math.sin(a) * 0.15;
    const cy = Math.cos(a) * 0.15;
    b.sweep(
      catmull([
        [Math.sin(a) * 0.04, hy - 0.02 + Math.cos(a) * 0.03, hz + 0.3],
        [cx * 0.9, hy - 0.04 + cy * 0.9, hz + 0.45],
        [cx, orb[1] + cy, orb[2] + 0.04],
        [cx * 0.6, orb[1] + cy * 0.6, orb[2] + 0.14],
      ]),
      [0.02, 0],
      { color: BONE, sides: 5, caps: { start: "flat", end: "point" } },
    );
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.1, 1), CYAN, { at: orb }), 1.5);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), HOT, { at: orb }), 1.8);
  b.part(new THREE.TorusGeometry(0.135, 0.01, 4, 14), GOLD, { at: orb, rotation: [70, 0, 20] });
  b.part(new THREE.TorusGeometry(0.135, 0.01, 4, 14), GOLD_D, { at: orb, rotation: [20, 0, 100] });

  // ---- blade ----
  const bladeBone = paint((p, n, s) => {
    const tip = smoothstep(0.4, 1.2, s[0]);
    let c = mix("#f3ead2", "#bdeff2", tip * 0.6);
    const crack = noise(new THREE.Vector3(s[0] * 6, s[1] * 6, 0), 0.4, 5);
    if (crack > 0.62 && crack < 0.66) c = mix(c, "#5a4b3a", 0.7);
    if (Math.abs(n.x) < 0.6) c = mix(c, BONE_D, 0.5);
    return mix(c, "#9ab", smoothstep(0.1, -0.2, p.y - H) * 0.15);
  });
  const upper: [number, number][] = [
    [0, 0.0],
    [0.3, 0.16],
    [0.7, 0.2],
    [1.0, 0.05],
  ];
  b.extrude(
    [
      ...upper.map(([x, y]) => [x, y] as [number, number]),
      [1.28, -0.46, "sharp"],
      [0.85, -0.1],
      [0.6, -0.08],
      [0.3, -0.08],
      [0, -0.12],
    ],
    { at: [0, H - 0.04, 0.0], x: [0, 0, 1], y: [0, 1, 0], thickness: [0.04, 0.012], bevel: 0.008, smoothing: 1, color: bladeBone },
  );
  glow(
    b.extrude(
      [
        [0, -0.12],
        [0.3, -0.08],
        [0.6, -0.08],
        [0.85, -0.1],
        [1.28, -0.46, "sharp"],
        [0.9, -0.135],
        [0.6, -0.115],
        [0.3, -0.115],
        [0, -0.15],
      ],
      { at: [0, H - 0.04, 0.0], x: [0, 0, 1], y: [0, 1, 0], thickness: [0.05, 0.02], color: CYAN },
    ),
    1.3,
  );
  // blade root collar and gilt boss
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.16), GOLD, { at: [0, H - 0.04, 0.02] });
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.1), GOLD_D, { at: [0, H + 0.02, 0.02] });
  // spine teeth along the blade's back
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const z = 0.15 + t * 0.85;
    const y = H - 0.04 + (0.15 + 0.07 * Math.sin(t * 2.5) - t * t * 0.14);
    b.spike([0, y - 0.01, z], [0, 1, 0.5 - t * 0.2], 0.07 - 0.02 * t + R() * 0.01, 0.018, { color: BONE, sides: 5 });
  }
  // floating soul wisps
  for (let i = 0; i < 4; i++) {
    const z = 0.5 + i * 0.22;
    const y = H - 0.25 - i * 0.12;
    glow(b.part(new THREE.SphereGeometry(0.014 - i * 0.002, 5, 4), HOT, { at: [(R() - 0.5) * 0.1, y, z] }), 1.4);
  }
  return b.root;
}
```