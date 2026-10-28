```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, rng, svg, paint, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description: "A tall scythe with a dragon-spine shaft, a curved bone blade, a skull ornament and a glowing soul flame.",
};

const BONE = "#e7dcc0", BONE_D = "#a89870", GOLD = "#d9a93a", DARK = "#1c1626", SOUL = "#4dffd2", SOUL_D = "#1a9d88";

export default function build() {
  const b = createBuilder({ name: "scythe" });
  const R = rng(5);
  b.joint("shaft", { at: [0, 1.0, 0] });

  const boneP = paint((p, n) => {
    const base = mix(BONE_D, BONE, smoothstep(0.2, 0.8, noise(p, 0.06, 3)));
    return mix(base, "#6a5a3a", 0.25 * smoothstep(0.2, -0.8, n.y));
  });

  // Shaft: spine of vertebrae along a straight pole
  const H = 2.0;
  b.rod([0, 0.0, 0], [0, H, 0], 0.022, DARK, { sides: 8 });
  const N = 16;
  for (let i = 0; i < N; i++) {
    const y = 0.25 + (i * (H - 0.5)) / N;
    b.part(new THREE.CylinderGeometry(0.034, 0.03, 0.07, 6), boneP, { at: [0, y, 0] });
    b.part(new THREE.ConeGeometry(0.016, 0.07 - i * 0.002, 4), BONE, { at: [0, y + 0.01, -0.045], dir: [0, 0.3, -1] });
    for (const s of [1, -1])
      b.part(new THREE.ConeGeometry(0.01, 0.07, 4), BONE_D, { at: [s * 0.045, y, 0], dir: [s, -0.4, 0.1] });
  }
  // Butt cap and spike
  b.part(new THREE.ConeGeometry(0.03, 0.14, 6), GOLD, { at: [0, 0.0, 0], dir: [0, -1, 0] });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), GOLD, { at: [0, 0.18, 0] });
  // Grip wraps
  for (let i = 0; i < 5; i++)
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), "#5a2a3a", { at: [0, 0.8 + i * 0.05, 0], dir: [0, 1, 0], axis: "z" });

  // Head assembly at top
  const top = H;
  b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.08, 8), GOLD, { at: [0, top - 0.04, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8), GOLD, { at: [0, top - 0.12, 0] });

  // Skull ornament
  const sk = [0, top + 0.07, 0.0];
  b.part(new THREE.SphereGeometry(0.075, 8, 6), BONE, { at: sk, scale: [1, 0.9, 1.05] });
  b.part(new THREE.BoxGeometry(0.07, 0.05, 0.09), BONE_D, { at: [0, top + 0.015, 0.035] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), SOUL, { at: [s * 0.03, top + 0.085, 0.065] }), 2);
    b.spike([s * 0.05, top + 0.12, -0.02], [s * 0.8, 0.8, -0.4], 0.17, 0.018, { color: BONE });
  }

  // Blade: big arc extending forward (+Z) and curving down
  const spine = catmull([[0, top + 0.1, 0.05], [0, top + 0.28, 0.35], [0, top + 0.22, 0.75], [0, top - 0.1, 1.05], [0, top - 0.5, 1.15]]);
  const edge = catmull([[0, top + 0.05, 0.05], [0, top + 0.05, 0.4], [0, top - 0.12, 0.8], [0, top - 0.42, 1.02], [0, top - 0.5, 1.15]]);
  b.membrane(spine, edge, { color: boneP, thickness: 0.03, rows: 3, cols: 12 });
  b.sweep(spine, [0.035, 0.012], { color: BONE, caps: { start: "round", end: "point" } });
  b.sweep(edge, [0.012, 0.004], { color: "#ffffff", caps: "point" });

  // Dragon-rib spines along blade back
  b.along(spine, 6, (at) => b.spike(at, [0, 1, -0.2], 0.12, 0.02, { color: BONE_D }));

  // Soul flame inside blade
  const rune = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#4dffd2" stroke-width="4"/><path d="M32 12 L44 40 L32 34 L20 40 Z" fill="#4dffd2"/><circle cx="32" cy="46" r="4" fill="#4dffd2"/></svg>`,
    { size: 128 },
  );
  glow(b.part(new THREE.CircleGeometry(0.07, 16), "#ffffff", { at: [0.045, top + 0.12, 0.3], dir: [1, 0, 0], axis: "z", texture: rune }), 1.5);
  glow(b.part(new THREE.CircleGeometry(0.07, 16), "#ffffff", { at: [-0.045, top + 0.12, 0.3], dir: [-1, 0, 0], axis: "z", texture: rune }), 1.5);

  const flame = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 2 C26 22 30 36 22 52 C18 60 14 60 10 52 C2 36 8 24 16 2Z" fill="#4dffd2"/><path d="M16 22 C22 34 22 44 16 54 C10 44 10 34 16 22Z" fill="#d8fff4"/></svg>`,
    { size: 128 },
  );
  const fr = [0, top + 0.08, 0.05];
  const fh = [new THREE.Vector3(...fr)].map((p) => b.surface(b.root).nearest(p));
  void fh;
  for (const [x, z, sz] of [[0, 0.18, 0.2], [0, 0.55, 0.16], [0, 0.85, 0.12]] as number[][]) {
    const y = top + 0.0 - (z > 0.7 ? 0.1 : 0) + 0.0;
    for (const ang of [0, 90]) {
      const d = ang ? [1, 0, 0] : [0, 0, 1];
      glow(b.part(new THREE.PlaneGeometry(sz * 0.5, sz), "#ffffff", { at: [x, y - 0.12, z], dir: d, axis: "z", texture: flame, scale: [1, 1, 1] }), 1.8);
      void R;
    }
  }
  // Floating soul orbs
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    glow(b.part(new THREE.IcosahedronGeometry(0.02 + 0.008 * (i % 2), 0), SOUL, { at: [0.06 * Math.sin(i * 2), top - 0.3 + t * 0.2, 0.25 + t * 0.7] }), 2);
  }
  // Tip crystal at blade end
  b.spike([0, top - 0.5, 1.15], [0, -1, 0.1], 0.1, 0.02, { color: SOUL_D });
  // Gold blade trim
  b.sweep(bezier([0, top + 0.1, 0.05], [0, top + 0.3, 0.3], [0, top + 0.22, 0.75]), 0.012, { color: GOLD });

  return b.root;
}
```