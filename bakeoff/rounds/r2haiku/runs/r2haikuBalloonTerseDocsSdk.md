```ts
import * as THREE from "three";
import { createBuilder, paint, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Hot-air balloon",
  description: "A striped hot-air balloon being inflated on the ground: wicker basket, burner and flame, rope rigging and a pennant.",
};

const RED = "#d7372b";
const CREAM = "#f3e4c3";
const GOLD = "#f2b233";
const WOOD = "#5a3b22";
const ROPE = "#d9c79a";
const IRON = "#2e2e33";
const FLAME = "#ff8a1f";
const CORE = "#ffe36b";

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // Wicker weave drawing for the basket sides.
  const weave = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#b07a45"/>
      <path d="M0 0L64 64M-16 16L48 80M16 -16L80 48M0 32L32 64M32 0L64 32" stroke="#6b4423" stroke-width="5"/>
      <path d="M0 64L64 0M-16 48L48 -16M16 80L80 16" stroke="#8a5a2e" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  // Envelope: a hollow lathe shell with eight alternating gores and a gold
  // band at the mouth and crown.
  const envelope = paint((_p, _n, s) => {
    if (s[0] < 3.3) return GOLD;
    if (s[0] > 10.4) return GOLD;
    const gore = Math.floor((((s[1] % 360) + 360) % 360) / 45);
    return gore % 2 ? CREAM : RED;
  });

  const outer: OutlinePoint[] = [
    [1.6, 2.8, "sharp"],
    [3.0, 3.6],
    [4.3, 5.0],
    [4.8, 6.6],
    [4.5, 8.2],
    [3.5, 9.6],
    [2.0, 10.6],
    [0.9, 11.2],
    [0, 11.4, "sharp"],
  ];
  const inner: OutlinePoint[] = [
    [0, 11.34, "sharp"],
    [0.85, 11.14],
    [1.9, 10.54],
    [3.4, 9.54],
    [4.4, 8.2],
    [4.7, 6.6],
    [4.2, 5.0],
    [2.9, 3.6],
    [1.54, 2.8, "sharp"],
  ];
  b.lathe([...outer, ...inner], {
    at: [0, 0, 0],
    segments: 16,
    smoothing: 2,
    color: envelope,
    name: "envelope",
  });

  // Mouth ring, a dark wooden hoop where the envelope opens.
  b.part(new THREE.TorusGeometry(1.62, 0.09, 6, 16), WOOD, {
    at: [0, 2.78, 0],
    rotation: [90, 0, 0],
    name: "mouthRing",
  });

  // Crown vent and pennant pole.
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.22, 10), IRON, {
    at: [0, 11.25, 0],
    name: "vent",
  });
  b.rod([0, 11.45, 0], [0, 12.7, 0], 0.035, { color: IRON });
  b.extrude(
    [
      [0, 0],
      [1.1, 0.22],
      [0, 0.45],
    ],
    { at: [0, 12.2, 0], x: [0, 0, 1], thickness: 0.03, color: GOLD },
  );

  // Basket: a textured wicker box standing on the floor, with a dark rim.
  b.part(new THREE.BoxGeometry(1.6, 0.9, 1.2), WOOD, {
    at: [0, 0.45, 0],
    texture: weave,
    name: "basket",
  });
  b.part(new THREE.BoxGeometry(1.64, 0.1, 1.24), WOOD, {
    at: [0, 0.95, 0],
    name: "basketRim",
  });

  // Burner: a plate on the rim, the burner body, and a two-tone flame.
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 10), IRON, {
    at: [0, 1.0, 0],
    name: "burnerPlate",
  });
  b.part(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 8), IRON, {
    at: [0, 1.25, 0],
    name: "burner",
  });
  b.part(new THREE.ConeGeometry(0.22, 0.9, 8), FLAME, {
    at: [0, 1.95, 0],
    name: "flame",
  });
  b.part(new THREE.ConeGeometry(0.11, 0.5, 6), CORE, {
    at: [0, 1.8, 0],
    name: "flameCore",
  });

  // Rigging: eight ropes from the mouth ring down to the rim.
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const top: [number, number, number] = [1.6 * c, 2.78, 1.6 * s];
    const k = 1 / Math.max(Math.abs(c), Math.abs(s));
    const bottom: [number, number, number] = [c * k * 0.8, 0.97, s * k * 0.6];
    b.rod(top, bottom, 0.012, { color: ROPE, name: `rope${i}` });
  }

  return b.root;
}
```