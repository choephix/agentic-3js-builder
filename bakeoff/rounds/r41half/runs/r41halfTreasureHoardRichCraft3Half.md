```ts
import * as THREE from "three";
import { createBuilder, rng, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { svg } from "agentic-3js-builder";

export const meta = { name: "treasure hoard", description: "Open chest spilling coins, gems, a crown and goblets, stylized hextech-fantasy look." };

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "hoard" });
  const r = rng(11);
  const GOLD = metal("gilt");
  const BRASS = metal("brass", { tarnish: 0.3 });
  const WOOD = "#5a3220";
  const WOOD2 = "#7a4a2c";
  const DARK = "#2a1a14";

  const emblem = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#f5cf5a" stroke="#7a5214" stroke-width="4"/><path d="M32 12 L40 32 L32 52 L24 32Z" fill="#c8932a" stroke="#7a5214" stroke-width="3"/><circle cx="32" cy="32" r="5" fill="#3de0ff"/></svg>`, { size: 128 });

  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // Chest body
  b.part(box(0.9, 0.42, 0.6), panelled(WOOD, { size: 0.15, rivets: 0.05 }), { at: [0, 0.21, 0] });
  b.part(box(0.94, 0.06, 0.64), BRASS, { at: [0, 0.03, 0] });
  b.part(box(0.94, 0.06, 0.64), BRASS, { at: [0, 0.4, 0] });
  for (const s of [-1, 1]) {
    b.part(box(0.07, 0.42, 0.66), BRASS, { at: [s * 0.4, 0.21, 0] });
  }
  // Interior hoard mound (gold)
  b.part(new THREE.SphereGeometry(0.4, 8, 5), GOLD, { at: [0, 0.4, 0], scale: [1.05, 0.35, 0.7] });
  // Lid, opened back
  const lidPivot = [0, 0.43, -0.3] as [number, number, number];
  const lid = b.part(cyl(0.3, 0.3, 0.9, 6), panelled(WOOD2, { size: 0.15 }), { at: [0, 0.62, -0.5], rotation: [0, 0, 90] });
  lid.mesh.scale.set(1, 1, 0.9);
  b.part(box(0.9, 0.05, 0.05), BRASS, { at: [0, 0.78, -0.58] });
  b.part(box(0.9, 0.05, 0.05), BRASS, { at: [0, 0.5, -0.78] });
  void lidPivot;
  // Lock
  b.part(box(0.14, 0.16, 0.04), GOLD, { at: [0, 0.34, 0.32] });
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", { at: [0, 0.34, 0.345], axis: "z", dir: [0, 0, 1], texture: emblem });

  // Coin piles
  const coinG = cyl(0.06, 0.06, 0.012, 10);
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2, d = 0.25 + r() * 0.75;
    const x = Math.cos(a) * d * 0.9, z = 0.4 + Math.sin(a) * d * 0.5 + 0.15;
    if (Math.abs(x) < 0.5 && z < 0.35) continue;
    const h = Math.max(0.01, 0.12 * (1 - d * 0.7));
    b.part(coinG, r() > 0.3 ? GOLD : BRASS, { at: [x, h + r() * 0.04, Math.abs(z) + 0.2], rotation: [r() * 50 - 25, r() * 360, r() * 50 - 25] });
  }
  // coin stacks
  for (const [x, z, n] of [[-0.75, 0.55, 8], [-0.62, 0.7, 5], [0.8, 0.5, 6]] as number[][])
    for (let i = 0; i < n; i++) b.part(coinG, GOLD, { at: [x + (r() - 0.5) * 0.01, 0.007 + i * 0.013, z], rotation: [0, r() * 90, 0] });

  // Gems
  const gems: [string, number, number, number, number][] = [
    ["#3de0ff", 0.25, 0.5, 0.55, 0.09], ["#ff3d6e", -0.3, 0.42, 0.6, 0.08], ["#7dff6a", 0.55, 0.1, 0.8, 0.07],
    ["#b36bff", -0.5, 0.09, 0.85, 0.08], ["#3de0ff", 0.0, 0.43, 0.15, 0.1], ["#ff3d6e", 0.15, 0.08, 1.0, 0.06],
  ];
  for (const [c, x, y, z, s] of gems) {
    glow(b.part(new THREE.OctahedronGeometry(s), c, { at: [x, y + s * 0.6, z], rotation: [r() * 30, r() * 90, r() * 30], scale: [1, 1.4, 1] }), 0.9);
  }

  // Crown
  const cx = -0.55, cz = 0.2, cy = 0.5;
  b.part(cyl(0.17, 0.15, 0.1, 10), GOLD, { at: [cx, cy + 0.05, cz], rotation: [12, 0, 12] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.035, 0.14, 4), GOLD, { at: [cx + Math.cos(a) * 0.16, cy + 0.15, cz + Math.sin(a) * 0.16] });
    glow(b.part(new THREE.OctahedronGeometry(0.03), i % 2 ? "#ff3d6e" : "#3de0ff", { at: [cx + Math.cos(a) * 0.17, cy + 0.06, cz + Math.sin(a) * 0.17] }), 1);
  }

  // Goblets
  const gob = (x: number, z: number, tilt: number, c: THREE.Object3D | any) => {
    b.lathe([[0, 0], [0.07, 0], [0.07, 0.015], [0.02, 0.04], [0.02, 0.14], [0.08, 0.2], [0.095, 0.3], [0.085, 0.3], [0.07, 0.2], [0, 0.2]] as any, { at: [x, 0, z], color: c, segments: 10, smoothing: 0 });
    void tilt;
    glow(b.part(cyl(0.08, 0.08, 0.01, 10), "#ff3d6e", { at: [x, 0.27, z] }), 0.6);
  };
  gob(0.7, 0.0, 0, GOLD);
  gob(0.75, -0.3, 0, metal("copper"));
  gob(-0.8, -0.1, 0, GOLD);

  // Hextech crystal pylon behind
  glow(b.part(new THREE.OctahedronGeometry(0.16), "#3de0ff", { at: [0.55, 0.3, -0.5], scale: [0.8, 2, 0.8] }), 1.4);
  return b.root;
}
```