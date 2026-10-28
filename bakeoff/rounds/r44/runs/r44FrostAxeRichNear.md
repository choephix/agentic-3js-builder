```ts
import * as THREE from "three";
import { createBuilder, catmull, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A double-bitted frost-forged battle axe: icy blue steel blades with glowing rune fuller, silver-trimmed dark haft with wrapped grip, crystal pommel, hanging tassel and frozen crystals, in a League of Legends style.",
};

const ICE = "#9fe8ff";
const ICE_D = "#2f78b8";
const STEEL = "#6f8fb8";
const NAVY = "#18284a";
const NAVY_L = "#2c4278";
const SILVER = "#dfe9f7";
const GOLD = "#e8b84a";
const WOOD = "#3a2a3e";
const CLOTH = "#7ad6ff";
const GLOW = "#7ff4ff";

const RUNE = svg(
  `<svg viewBox="0 0 40 120"><g fill="none" stroke="#7ff4ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 6 L20 114"/><path d="M20 24 L34 38 M20 24 L6 38"/><path d="M20 56 L34 70 M20 56 L6 70"/><path d="M8 96 L20 84 L32 96"/></g></svg>`,
  { size: 256 },
);

const bladePaint = paint((p, n) => {
  const edge = smoothstep(0.1, 0.34, Math.abs(p.x));
  let c = mix(STEEL, ICE, edge * 0.8);
  c = mix(c, ICE_D, smoothstep(0.5, -0.6, n.y) * 0.4);
  c = mix(c, "#ffffff", smoothstep(0.7, 0.85, noise(p, 0.05, 3)) * 0.4);
  return c;
});
const hastePaint = paint((p) => {
  const f = (p.y * 18) % 1;
  return f < 0.12 ? "#150f1a" : mix(WOOD, "#5a4260", noise(p, 0.05, 2));
});

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const HY = 1.55; // head centre height

  const put = (g: THREE.BufferGeometry, color: string | ReturnType<typeof paint>, at: number[], o: Record<string, unknown> = {}) =>
    b.part(g, color as string, { bone: root, at, ...o });

  // haft
  b.sweep(catmull([[0, 0.05, 0], [0, 0.7, 0.005], [0, 1.2, 0], [0, 1.78, 0]]), 0.026, {
    bone: root, color: hastePaint, sides: 8, caps: "flat", name: "haft",
  });
  // grip wrap
  b.rod([0, 0.3, 0], [0, 0.82, 0], 0.032, { bone: root, color: NAVY, sides: 8, caps: "flat", name: "grip" });
  for (let i = 0; i < 9; i++)
    put(new THREE.TorusGeometry(0.033, 0.004, 4, 8), i % 2 ? CLOTH : SILVER, [0, 0.32 + i * 0.058, 0], { rotation: [90, 0, 0] });
  // pommel
  put(new THREE.CylinderGeometry(0.04, 0.03, 0.06, 8), SILVER, [0, 0.07, 0]);
  glow(put(new THREE.OctahedronGeometry(0.05, 0), ICE, [0, 0.0, 0], { scale: [1, 1.6, 1] }), 1.5);
  // collars
  for (const y of [0.86, 1.3, 1.42, 1.68]) put(new THREE.CylinderGeometry(0.04, 0.04, 0.035, 8), y === 1.42 ? GOLD : SILVER, [0, y, 0]);
  // socket
  put(new THREE.BoxGeometry(0.1, 0.34, 0.1), NAVY_L, [0, HY, 0], { name: "socket" });
  put(new THREE.BoxGeometry(0.112, 0.04, 0.112), SILVER, [0, HY + 0.15, 0]);
  put(new THREE.BoxGeometry(0.112, 0.04, 0.112), SILVER, [0, HY - 0.15, 0]);
  glow(put(new THREE.OctahedronGeometry(0.035, 0), GLOW, [0, HY, 0.056], { scale: [0.8, 1.5, 0.6] }), 1.6);
  glow(put(new THREE.OctahedronGeometry(0.035, 0), GLOW, [0, HY, -0.056], { scale: [0.8, 1.5, 0.6] }), 1.6);

  // blades (profile in x/y, thin in z)
  const prof: OutlinePoint[] = [
    [0.05, 0.14], [0.14, 0.2], [0.24, 0.3], [0.34, 0.4, "sharp"], [0.4, 0.2], [0.42, 0, "sharp"],
    [0.4, -0.2], [0.34, -0.4, "sharp"], [0.24, -0.3], [0.14, -0.2], [0.05, -0.14],
  ];
  for (const s of [1, -1]) {
    b.extrude(prof, { at: [0, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.012, color: bladePaint, bone: root, name: "blade" });
    // silver rim
    b.extrude(
      [[0.05, 0.16], [0.16, 0.22], [0.2, 0.17], [0.1, 0.12], [0.05, 0.1]],
      { at: [0, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.062, bevel: 0.01, color: SILVER, bone: root, name: "bladeTrimTop" },
    );
    b.extrude(
      [[0.05, -0.16], [0.16, -0.22], [0.2, -0.17], [0.1, -0.12], [0.05, -0.1]],
      { at: [0, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.062, bevel: 0.01, color: SILVER, bone: root, name: "bladeTrimBot" },
    );
    for (const f of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.1, 0.3), "#ffffff", {
          bone: root, at: [s * 0.2, HY, f * 0.0265], dir: [0, 0, f], axis: "z", up: [0, 1, 0], texture: RUNE,
        }),
        1.3,
      );
    }
    // frost spikes on edge
    for (const y of [0.4, 0.2, 0, -0.2, -0.4]) {
      glow(put(new THREE.ConeGeometry(0.018, 0.08, 5), ICE, [s * (0.41 + (Math.abs(y) < 0.1 ? 0.04 : 0)), HY + y, 0], { dir: [s, 0, 0] }), 1.2);
    }
    // rivets
    for (const y of [0.1, -0.1]) put(new THREE.SphereGeometry(0.012, 6, 4), GOLD, [s * 0.1, HY + y, 0.03]);
  }
  // top spike
  put(new THREE.ConeGeometry(0.04, 0.2, 6), SILVER, [0, HY + 0.27, 0]);
  glow(put(new THREE.OctahedronGeometry(0.03, 0), ICE, [0, HY + 0.4, 0], { scale: [0.7, 1.8, 0.7] }), 1.4);

  // tassel
  const cord = catmull([[0, 1.3, 0.04], [0.04, 1.2, 0.07], [0.05, 1.08, 0.06]]);
  b.sweep(cord, 0.007, { bone: root, color: CLOTH, sides: 5, name: "cord" });
  put(new THREE.SphereGeometry(0.02, 6, 4), GOLD, [0.05, 1.07, 0.06]);
  for (let k = 0; k < 5; k++)
    b.spike([0.05 + (k - 2) * 0.01, 1.06, 0.06], [(k - 2) * 0.15, -1, 0], 0.12, 0.009, { bone: root, color: k % 2 ? SILVER : CLOTH, sides: 4 });

  // frozen crystals clustering at the base of the head
  for (let k = 0; k < 4; k++) {
    const a = k * 1.57 + 0.4;
    glow(put(new THREE.ConeGeometry(0.014, 0.08 + (k % 2) * 0.04, 5), ICE, [Math.sin(a) * 0.05, 1.33, Math.cos(a) * 0.05], {
      dir: [Math.sin(a) * 0.6, 1, Math.cos(a) * 0.6],
    }), 1.1);
  }

  return b.root;
}
```